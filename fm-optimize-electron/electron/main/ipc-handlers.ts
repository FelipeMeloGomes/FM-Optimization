import { app, BrowserWindow, ipcMain } from 'electron'
import { loadScripts, getScriptById, getScriptContent } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, getDataFilePathForRenderer, loadUserData, saveUserData } from './services/data-service'
import { isAdmin } from './services/admin-check'
import { autoUpdater } from 'electron-updater'
import { extractScriptToTemp } from './services/script-registry'
import type { IpcResult, DashboardData, ScriptEntry, RestorePointEntry, AppSettings } from '../shared/ipc-types'

function getMainWindow(): BrowserWindow | null {
  const wins = BrowserWindow.getAllWindows()
  return wins.length > 0 ? wins[0] : null
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  getMainWindow()?.webContents.send(channel, ...args)
}

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', async (): Promise<IpcResult<DashboardData>> => {
    try {
      return { success: true as const, data: getSystemInfo() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-scripts', async (): Promise<IpcResult<ScriptEntry[]>> => {
    try {
      return { success: true as const, data: loadScripts() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-script-content', async (_e, id: string): Promise<IpcResult<string>> => {
    try {
      return { success: true as const, data: getScriptContent(id) }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('execute-script', async (_e, id: string): Promise<IpcResult<void>> => {
    try {
      executeScript(id)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('cancel-execution', async (_e, id: string): Promise<IpcResult<void>> => {
    try {
      cancelExecution(id)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-restore-points', async (): Promise<IpcResult<RestorePointEntry[]>> => {
    try {
      return { success: true as const, data: getRestorePoints() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('create-restore-point', async (_e, name: string): Promise<IpcResult<void>> => {
    try {
      createRestorePoint(name)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('delete-restore-point', async (_e, seq: number): Promise<IpcResult<void>> => {
    try {
      deleteRestorePoint(seq)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('is-admin', async (): Promise<IpcResult<boolean>> => {
    try {
      return { success: true as const, data: isAdmin() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-settings', async (): Promise<IpcResult<AppSettings>> => {
    try {
      return { success: true as const, data: loadSettings() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('save-settings', async (_e, settings): Promise<IpcResult<void>> => {
    try {
      saveSettings(settings)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-data-file-path', async (): Promise<IpcResult<string>> => {
    try {
      return { success: true as const, data: getDataFilePathForRenderer() }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-app-version', async (): Promise<IpcResult<string>> => {
    return { success: true as const, data: app.getVersion() }
  })

  ipcMain.handle('is-packaged', async (): Promise<IpcResult<boolean>> => {
    return { success: true as const, data: app.isPackaged }
  })

  ipcMain.handle('extract-script', async (_e, id: string): Promise<IpcResult<string>> => {
    try {
      const filePath = extractScriptToTemp(id)
      return { success: true as const, data: filePath }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('get-favorites', async (): Promise<IpcResult<string[]>> => {
    try {
      const data = loadUserData()
      return { success: true as const, data: data.favorites }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('save-favorites', async (_e, favorites: string[]): Promise<IpcResult<void>> => {
    try {
      const data = loadUserData()
      data.favorites = favorites
      saveUserData(data)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('restore-system', async (_e, seq: number): Promise<IpcResult<void>> => {
    try {
      restoreSystem(seq)
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('check-for-update', async (): Promise<IpcResult<void>> => {
    try {
      if (!app.isPackaged) {
        return { success: false as const, error: 'Updates only work in packaged app' }
      }
      autoUpdater.checkForUpdates()
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('download-update', async (): Promise<IpcResult<void>> => {
    try {
      autoUpdater.downloadUpdate()
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle('install-update', async (): Promise<IpcResult<void>> => {
    try {
      autoUpdater.quitAndInstall()
      return { success: true as const }
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  })
}
