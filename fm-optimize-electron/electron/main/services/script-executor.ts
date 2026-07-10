import { spawn, execSync, ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'
import { extractScriptToTemp, getScriptById } from './script-registry'
import { isAdmin } from './admin-check'
import { loadSettings, addHistoryEntry } from './data-service'
import type { ScriptOutput, ScriptEnded, ScriptEntry } from '../../shared/ipc-types'

const activeProcesses = new Map<string, ChildProcess>()

function sendOutput(win: BrowserWindow, data: ScriptOutput): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-output', JSON.stringify(data))
  }
}

function sendEnded(win: BrowserWindow, data: ScriptEnded): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-ended', JSON.stringify(data))
  }
}

export function executeScript(id: string): string {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) throw new Error('Nenhuma janela ativa')

  if (activeProcesses.has(id)) {
    throw new Error(`Script "${id}" já está em execução`)
  }

  const script = getScriptById(id)
  if (script?.requiresAdmin && !isAdmin()) {
    throw new Error(
      'Este script requer privilégios de administrador. Execute o programa como administrador.'
    )
  }

  const filePath = extractScriptToTemp(id)
  const ext = filePath.split('.').pop()?.toLowerCase() as ScriptExtension | undefined

  if (ext === 'txt') {
    const proc = spawn('cmd.exe', ['/c', 'start', '', filePath], {
      detached: true,
      stdio: 'ignore'
    })
    proc.unref()
    sendEnded(win, { id, code: 0 })
    addHistoryEntry({
      id: `${id}_${Date.now()}`,
      scriptId: id,
      scriptName: script?.name || id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 0,
      exitCode: 0,
      wasCancelled: false
    })
    return 'opened'
  }

  if (loadSettings().autoRestorePoint && script) {
    const safeName = script.name.replace(/[^a-zA-Z0-9 áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.:_-]/g, '').trim()
    if (safeName) {
      spawn('powershell.exe', [
        '-NoProfile',
        '-Command',
        `Checkpoint-Computer -Description "Antes de executar: ${safeName}" -RestorePointType MODIFY_SETTINGS`
      ], { stdio: 'ignore', detached: true }).unref()
    }
  }

  const { command, args } = getCommand(ext, filePath)
  const proc = spawn(command, args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  activeProcesses.set(id, proc)

  proc.stdout?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stdout', text: data.toString() })
  })

  proc.stderr?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stderr', text: data.toString() })
    if (!win.isDestroyed()) {
      win.webContents.send('script-error', JSON.stringify({ scriptId: id, type: 'stderr', text: data.toString() }))
    }
  })

  const startTime = Date.now()
  const historyEntryId = `${id}_${startTime}`

  proc.on('close', (code) => {
    activeProcesses.delete(id)
    sendEnded(win, { id, code })
    const endTime = Date.now()
    addHistoryEntry({
      id: historyEntryId,
      scriptId: id,
      scriptName: script?.name || id,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: endTime - startTime,
      exitCode: code,
      wasCancelled: false
    })
  })

  proc.on('error', (err) => {
    activeProcesses.delete(id)
    sendOutput(win, { scriptId: id, type: 'stderr', text: `Error: ${err.message}\n` })
    if (!win.isDestroyed()) {
      win.webContents.send('script-error', JSON.stringify({ scriptId: id, type: 'stderr', text: `Error: ${err.message}\n` }))
    }
    sendEnded(win, { id, code: -1 })
    addHistoryEntry({
      id: historyEntryId,
      scriptId: id,
      scriptName: script?.name || id,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      exitCode: -1,
      wasCancelled: false
    })
  })

  return 'started'
}

export function cancelExecution(id: string): void {
  const proc = activeProcesses.get(id)
  if (proc && proc.pid) {
    try {
      proc.kill('SIGTERM')
    } catch {
      try {
        execSync(`taskkill /F /T /PID ${proc.pid}`, { timeout: 5000 })
      } catch { /* already dead */ }
    }
    const script = getScriptById(id)
    addHistoryEntry({
      id: `${id}_${Date.now()}`,
      scriptId: id,
      scriptName: script?.name || id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 0,
      exitCode: null,
      wasCancelled: true
    })
    activeProcesses.delete(id)
  }
}

type ScriptExtension = ScriptEntry['extension']

function getCommand(ext: ScriptExtension | undefined, filePath: string): { command: string; args: string[] } {
  if (ext === undefined) {
    return { command: 'cmd.exe', args: ['/c', filePath] }
  }
  switch (ext) {
    case 'bat':
    case 'cmd':
      return { command: 'cmd.exe', args: ['/c', filePath] }
    case 'ps1':
      return {
        command: 'powershell.exe',
        args: ['-ExecutionPolicy', 'Bypass', '-File', filePath]
      }
    case 'reg':
      return { command: 'regedit.exe', args: ['/s', filePath] }
    case 'exe':
      return { command: filePath, args: [] }
    case 'txt':
      return { command: 'notepad.exe', args: [filePath] }
    default: {
      const _exhaustive: never = ext
      return _exhaustive
    }
  }
}
