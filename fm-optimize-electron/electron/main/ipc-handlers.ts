import { app, BrowserWindow, ipcMain } from 'electron'
import { loadScripts, getScriptById, getScriptContent } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, getDataFilePathForRenderer } from './services/data-service'
import { isAdmin } from './services/admin-check'
import { autoUpdater } from 'electron-updater'

function getMainWindow(): BrowserWindow | null {
  const wins = BrowserWindow.getAllWindows()
  return wins.length > 0 ? wins[0] : null
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  getMainWindow()?.webContents.send(channel, ...args)
}

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', async () => {
    try {
      return { success: true as const, data: getSystemInfo() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-scripts', async () => {
    try {
      return { success: true as const, data: loadScripts() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-script-content', async (_e, id: string) => {
    try {
      return { success: true as const, data: getScriptContent(id) }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('execute-script', async (_e, id: string) => {
    try {
      executeScript(id)
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('cancel-execution', async (_e, id: string) => {
    try {
      cancelExecution(id)
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-restore-points', async () => {
    try {
      return { success: true as const, data: getRestorePoints() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('create-restore-point', async (_e, name: string) => {
    try {
      createRestorePoint(name)
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('delete-restore-point', async (_e, seq: number) => {
    try {
      deleteRestorePoint(seq)
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('is-admin', async () => {
    try {
      return { success: true as const, data: isAdmin() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-settings', async () => {
    try {
      return { success: true as const, data: loadSettings() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('save-settings', async (_e, settings) => {
    try {
      saveSettings(settings)
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-data-file-path', async () => {
    try {
      return { success: true as const, data: getDataFilePathForRenderer() }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('get-app-version', async () => {
    return { success: true as const, data: app.getVersion() }
  })

  ipcMain.handle('is-packaged', async () => {
    return { success: true as const, data: app.isPackaged }
  })

  ipcMain.handle('check-for-update', async () => {
    try {
      if (!app.isPackaged) {
        return { success: false as const, error: 'Updates only work in packaged app' }
      }
      autoUpdater.checkForUpdates()
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      autoUpdater.downloadUpdate()
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })

  ipcMain.handle('install-update', async () => {
    try {
      autoUpdater.quitAndInstall()
      return { success: true as const }
    } catch (e: any) {
      return { success: false as const, error: e.message }
    }
  })
}
