import { contextBridge, ipcRenderer } from 'electron'
import type {
  ElectronAPI,
  ScriptOutput,
  ScriptEnded,
  UpdateStatus,
  UpdateInfo,
  DownloadProgress
} from '../shared/ipc-types'

const electronAPI: ElectronAPI = {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getScripts: () => ipcRenderer.invoke('get-scripts').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getScriptContent: (id) => ipcRenderer.invoke('get-script-content', id).then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  extractScript: (id) => ipcRenderer.invoke('extract-script', id).then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  executeScript: (id) => ipcRenderer.invoke('execute-script', id).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  cancelExecution: (id) => ipcRenderer.invoke('cancel-execution', id).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  getRestorePoints: () => ipcRenderer.invoke('get-restore-points').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  createRestorePoint: (name) => ipcRenderer.invoke('create-restore-point', name).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  deleteRestorePoint: (seq) => ipcRenderer.invoke('delete-restore-point', seq).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  isAdmin: () => ipcRenderer.invoke('is-admin').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getSettings: () => ipcRenderer.invoke('get-settings').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  getDataFilePath: () => ipcRenderer.invoke('get-data-file-path').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  onScriptOutput: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-output', listener)
    return () => ipcRenderer.removeListener('script-output', listener)
  },
  onScriptError: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-error', listener)
    return () => ipcRenderer.removeListener('script-error', listener)
  },
  onScriptEnded: (cb: (data: ScriptEnded) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-ended', listener)
    return () => ipcRenderer.removeListener('script-ended', listener)
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  isPackaged: () => ipcRenderer.invoke('is-packaged').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update').then((r: any) => { if (!r.success) throw new Error(r.error) }),
  downloadUpdate: () => ipcRenderer.invoke('download-update').then((r: any) => { if (!r.success) throw new Error(r.error) }),
  installUpdate: () => ipcRenderer.invoke('install-update').then((r: any) => { if (!r.success) throw new Error(r.error) }),
  onUpdateStatus: (cb: (data: UpdateStatus) => void) => {
    const listener = (_e: any, data: UpdateStatus) => cb(data)
    ipcRenderer.on('update-status', listener)
    return () => ipcRenderer.removeListener('update-status', listener)
  },
  onUpdateInfo: (cb: (data: UpdateInfo) => void) => {
    const listener = (_e: any, data: UpdateInfo) => cb(data)
    ipcRenderer.on('update-info', listener)
    return () => ipcRenderer.removeListener('update-info', listener)
  },
  onDownloadProgress: (cb: (data: DownloadProgress) => void) => {
    const listener = (_e: any, data: DownloadProgress) => cb(data)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
