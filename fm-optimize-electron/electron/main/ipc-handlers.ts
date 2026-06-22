import { ipcMain } from 'electron'
import { loadScripts, getScriptById, getScriptContent } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, getDataFilePathForRenderer } from './services/data-service'
import { isAdmin } from './services/admin-check'

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
}
