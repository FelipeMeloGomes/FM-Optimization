import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  ElectronAPI,
  IpcResult,
  ScriptOutput,
  ScriptEnded,
  UpdateStatus,
  UpdateInfo,
  DownloadProgress,
  ExecutionHistoryEntry
} from '../shared/ipc-types'

function ipc<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args).then((r: unknown) => {
    const result = r as IpcResult<T>
    if (!result.success) return Promise.reject(result.error)
    return result.data as T
  })
}

function ipcVoid(channel: string, ...args: unknown[]): Promise<void> {
  return ipcRenderer.invoke(channel, ...args).then((r: unknown) => {
    const result = r as IpcResult
    if (!result.success) return Promise.reject(new Error(result.error))
  })
}

const electronAPI: ElectronAPI = {
  getSystemInfo: () => ipc<import('../shared/ipc-types').DashboardData>('get-system-info'),
  getScripts: () => ipc<import('../shared/ipc-types').ScriptEntry[]>('get-scripts'),
  getScriptContent: (id) => ipc<string>('get-script-content', id),
  extractScript: (id) => ipc<string>('extract-script', id),
  executeScript: (id) => ipcVoid('execute-script', id),
  cancelExecution: (id) => ipcVoid('cancel-execution', id),
  getRestorePoints: () => ipc<import('../shared/ipc-types').RestorePointEntry[]>('get-restore-points'),
  createRestorePoint: (name) => ipcVoid('create-restore-point', name),
  deleteRestorePoint: (seq) => ipcVoid('delete-restore-point', seq),
  isAdmin: () => ipc<boolean>('is-admin'),
  getSettings: () => ipc<import('../shared/ipc-types').AppSettings>('get-settings'),
  saveSettings: (settings) => ipcVoid('save-settings', settings),
  getDataFilePath: () => ipc<string>('get-data-file-path'),
  onScriptOutput: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: IpcRendererEvent, raw: string) => {
      try { cb(JSON.parse(raw)) } catch { /* skip malformed output */ }
    }
    ipcRenderer.on('script-output', listener)
    return () => ipcRenderer.removeListener('script-output', listener)
  },
  onScriptError: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: IpcRendererEvent, raw: string) => {
      try { cb(JSON.parse(raw)) } catch { /* skip malformed error */ }
    }
    ipcRenderer.on('script-error', listener)
    return () => ipcRenderer.removeListener('script-error', listener)
  },
  onScriptEnded: (cb: (data: ScriptEnded) => void) => {
    const listener = (_e: IpcRendererEvent, raw: string) => {
      try { cb(JSON.parse(raw)) } catch { /* skip malformed ended */ }
    }
    ipcRenderer.on('script-ended', listener)
    return () => ipcRenderer.removeListener('script-ended', listener)
  },
  getFavorites: () => ipc<string[]>('get-favorites'),
  saveFavorites: (ids) => ipcVoid('save-favorites', ids),
  getExecutionHistory: () => ipc<ExecutionHistoryEntry[]>('get-execution-history'),
  restoreSystem: (seq) => ipcVoid('restore-system', seq),
  getAppVersion: () => ipc<string>('get-app-version'),
  isPackaged: () => ipc<boolean>('is-packaged'),
  checkForUpdate: () => ipcVoid('check-for-update'),
  downloadUpdate: () => ipcVoid('download-update'),
  installUpdate: () => ipcVoid('install-update'),
  onUpdateStatus: (cb: (data: UpdateStatus) => void) => {
    const listener = (_e: IpcRendererEvent, data: UpdateStatus) => cb(data)
    ipcRenderer.on('update-status', listener)
    return () => ipcRenderer.removeListener('update-status', listener)
  },
  onUpdateInfo: (cb: (data: UpdateInfo) => void) => {
    const listener = (_e: IpcRendererEvent, data: UpdateInfo) => cb(data)
    ipcRenderer.on('update-info', listener)
    return () => ipcRenderer.removeListener('update-info', listener)
  },
  onDownloadProgress: (cb: (data: DownloadProgress) => void) => {
    const listener = (_e: IpcRendererEvent, data: DownloadProgress) => cb(data)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
