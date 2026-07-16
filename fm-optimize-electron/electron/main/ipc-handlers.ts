import { app, ipcMain } from 'electron'
import { loadScripts, getScriptContent, extractScriptToTemp } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, getDataFilePathForRenderer, loadUserData, saveUserData } from './services/data-service'
import { isAdmin } from './services/admin-check'
import { autoUpdater } from 'electron-updater'
import type { IpcResult, NetworkInfo, BenchmarkResult } from '../shared/ipc-types'
import { execPowerShell } from './services/powershell'

function handleIpc<T>(fn: () => T): Promise<IpcResult<T>> {
  try {
    return Promise.resolve({ success: true as const, data: fn() })
  } catch (e: unknown) {
    return Promise.resolve({ success: false as const, error: e instanceof Error ? e.message : String(e) })
  }
}

function validateString(id: unknown, label: string): IpcResult<never> | null {
  if (typeof id !== 'string' || !id.trim()) {
    return { success: false as const, error: label }
  }
  return null
}

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', () => handleIpc(() => getSystemInfo()))

  ipcMain.handle('get-scripts', () => handleIpc(() => loadScripts()))

  ipcMain.handle('get-script-content', (_e, id: string) => {
    const err = validateString(id, 'ID do script inválido')
    if (err) return err
    return handleIpc(() => getScriptContent(id))
  })

  ipcMain.handle('execute-script', (_e, id: string) => {
    const err = validateString(id, 'ID do script inválido')
    if (err) return err
    return handleIpc(() => { executeScript(id) })
  })

  ipcMain.handle('cancel-execution', (_e, id: string) => {
    const err = validateString(id, 'ID do script inválido')
    if (err) return err
    return handleIpc(() => { cancelExecution(id) })
  })

  ipcMain.handle('get-restore-points', () => handleIpc(() => getRestorePoints()))

  ipcMain.handle('create-restore-point', (_e, name: string) => {
    const err = validateString(name, 'Nome do restore point inválido')
    if (err) return err
    return handleIpc(() => { createRestorePoint(name) })
  })

  ipcMain.handle('delete-restore-point', (_e, seq: number) => {
    if (typeof seq !== 'number' || !Number.isFinite(seq) || seq <= 0) {
      return { success: false as const, error: 'SequenceNumber inválido' }
    }
    return handleIpc(() => { deleteRestorePoint(seq) })
  })

  ipcMain.handle('is-admin', () => handleIpc(() => isAdmin()))

  ipcMain.handle('get-settings', () => handleIpc(() => loadSettings()))

  ipcMain.handle('save-settings', (_e, settings) => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return { success: false as const, error: 'Configurações inválidas' }
    }
    return handleIpc(() => { saveSettings(settings) })
  })

  ipcMain.handle('get-data-file-path', () => handleIpc(() => getDataFilePathForRenderer()))

  ipcMain.handle('get-app-version', () => handleIpc(() => app.getVersion()))

  ipcMain.handle('is-packaged', () => handleIpc(() => app.isPackaged))

  ipcMain.handle('extract-script', (_e, id: string) => {
    const err = validateString(id, 'ID do script inválido')
    if (err) return err
    return handleIpc(() => extractScriptToTemp(id))
  })

  ipcMain.handle('get-execution-history', () => handleIpc(() => loadUserData().executionHistory || []))

  ipcMain.handle('restore-system', (_e, seq: number) => {
    if (typeof seq !== 'number' || !Number.isFinite(seq) || seq <= 0) {
      return { success: false as const, error: 'SequenceNumber inválido' }
    }
    return handleIpc(() => { restoreSystem(seq) })
  })

  ipcMain.handle('check-for-update', () => {
    if (!app.isPackaged) {
      return { success: false as const, error: 'Updates only work in packaged app' }
    }
    return handleIpc(() => { autoUpdater.checkForUpdates() })
  })

  ipcMain.handle('download-update', () => handleIpc(() => { autoUpdater.downloadUpdate() }))

  ipcMain.handle('install-update', () => handleIpc(() => { autoUpdater.quitAndInstall() }))

  ipcMain.handle('get-network-info', async (): Promise<IpcResult<NetworkInfo>> => {
    try {
      const ps = `
        $adapter = Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object -First 1
        if (-not $adapter) { throw "Nenhuma interface de rede ativa encontrada" }
        $dns = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4
        $dnsServers = @()
        if ($dns) { $dnsServers = $dns.ServerAddresses }
        @{ interfaceName = $adapter.Name; interfaceIndex = $adapter.InterfaceIndex; currentDns = $dnsServers } | ConvertTo-Json -Compress
      `
      const output = await execPowerShell(ps)
      const parsed = JSON.parse(output.trim())
      return { success: true, data: { interfaceName: parsed.interfaceName, interfaceIndex: parsed.interfaceIndex, currentDns: parsed.currentDns || [] } }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('benchmark-dns', async (_e, addresses: unknown): Promise<IpcResult<BenchmarkResult[]>> => {
    if (!Array.isArray(addresses) || !addresses.every((a) => typeof a === 'string')) {
      return { success: false, error: 'Lista de endereços inválida' }
    }
    try {
      const results: BenchmarkResult[] = []
      for (const addr of addresses) {
        try {
          const ps = `
            $r = Test-Connection -Count 2 -ComputerName "${addr}" -ErrorAction Stop
            Write-Output (($r | Measure-Object -Property ResponseTime -Average).Average)
          `
          const output = await execPowerShell(ps)
          const ms = parseFloat(output.trim().split('\n').pop() || '')
          results.push({ address: addr, latencyMs: isNaN(ms) ? null : Math.round(ms) })
        } catch {
          results.push({ address: addr, latencyMs: null })
        }
      }
      return { success: true, data: results }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('apply-dns', async (_e, interfaceIndex: unknown, addresses: unknown): Promise<IpcResult<void>> => {
    if (typeof interfaceIndex !== 'number' || !Array.isArray(addresses)) {
      return { success: false, error: 'Parâmetros inválidos' }
    }
    if (!isAdmin()) {
      return { success: false, error: 'Execute o aplicativo como administrador para alterar o DNS.' }
    }
    try {
      if (addresses.length === 0) {
        const ps = `
          $ErrorActionPreference = 'Stop'
          Set-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ResetServerAddresses
        `
        await execPowerShell(ps)
      } else {
        const addrList = addresses.map((a) => `"${a}"`).join(',')
        const ps = `
          $ErrorActionPreference = 'Stop'
          Set-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ServerAddresses (${addrList})
          ipconfig /flushdns | Out-Null
        `
        await execPowerShell(ps)
      }
      return { success: true }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })
}