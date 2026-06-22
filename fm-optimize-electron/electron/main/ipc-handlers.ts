import { ipcMain } from 'electron'
import { loadScripts, getScriptById, getScriptContent } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, getDataFilePathForRenderer } from './services/data-service'
import { isAdmin } from './services/admin-check'
import type { IpcResult } from '../shared/ipc-types'

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getSystemInfo() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-scripts', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: loadScripts() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-script-content', async (_e, id: string): Promise<IpcResult> => {
    try {
      return { success: true, data: getScriptContent(id) }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('execute-script', async (_e, id: string): Promise<IpcResult> => {
    try {
      executeScript(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('cancel-execution', async (_e, id: string): Promise<IpcResult> => {
    try {
      cancelExecution(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-restore-points', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getRestorePoints() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('create-restore-point', async (_e, name: string): Promise<IpcResult> => {
    try {
      createRestorePoint(name)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('delete-restore-point', async (_e, seq: number): Promise<IpcResult> => {
    try {
      deleteRestorePoint(seq)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('is-admin', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: isAdmin() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-settings', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: loadSettings() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('save-settings', async (_e, settings): Promise<IpcResult> => {
    try {
      saveSettings(settings)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-data-file-path', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getDataFilePathForRenderer() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })
}
