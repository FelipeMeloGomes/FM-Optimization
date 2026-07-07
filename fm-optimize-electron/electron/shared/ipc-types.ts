export interface CpuInfo {
  model: string
  cores: number
  logicalProcessors: number
  architecture: string
  usage: number
}

export interface GpuInfo {
  name: string
  vram: string
  driverVersion: string
}

export interface MemoryInfo {
  total: string
  used: string
  free: string
  type: string
  slots: number
}

export interface OsInfo {
  name: string
  version: string
  build: string
  edition: string
  installDate: string
}

export interface StorageDrive {
  letter: string
  label: string
  size: string
  free: string
  type: string
}

export interface DashboardData {
  cpu: CpuInfo
  gpu: GpuInfo
  memory: MemoryInfo
  os: OsInfo
  drives: StorageDrive[]
  uptime: number
}

export interface ScriptEntry {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  content: string
  extension: 'bat' | 'ps1' | 'reg' | 'exe' | 'cmd'
  requiresAdmin: boolean
  isBuiltIn: boolean
  tags: string[]
  guide?: string
}

export interface RestorePointEntry {
  sequenceNumber: number
  description: string
  creationTime: string
  eventType: string
}

export interface AppSettings {
  theme: 'dark' | 'light'
  autoOpenLog: boolean
  confirmOnExecute: boolean
}

export interface ScriptOutput {
  scriptId: string
  type: 'stdout' | 'stderr'
  text: string
}

export interface ScriptEnded {
  id: string
  code: number | null
}

export type UpdateStatus = 'checking' | 'available' | 'not-available' | 'downloading' | 'ready' | 'error'

export interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseDate?: string
  error?: string
}

export interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}

export interface IpcResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

export interface ElectronAPI {
  getSystemInfo(): Promise<DashboardData>
  getScripts(): Promise<ScriptEntry[]>
  getScriptContent(id: string): Promise<string>
  extractScript(id: string): Promise<string>
  executeScript(id: string): Promise<void>
  cancelExecution(id: string): Promise<void>
  getRestorePoints(): Promise<RestorePointEntry[]>
  createRestorePoint(name: string): Promise<void>
  deleteRestorePoint(seq: number): Promise<void>
  isAdmin(): Promise<boolean>
  getSettings(): Promise<AppSettings>
  saveSettings(settings: AppSettings): Promise<void>
  getDataFilePath(): Promise<string>
  onScriptOutput(cb: (data: ScriptOutput) => void): () => void
  onScriptError(cb: (data: ScriptOutput) => void): () => void
  onScriptEnded(cb: (data: ScriptEnded) => void): () => void
  getFavorites(): Promise<string[]>
  saveFavorites(ids: string[]): Promise<void>
  restoreSystem(seq: number): Promise<void>
  getAppVersion(): Promise<string>
  isPackaged(): Promise<boolean>
  checkForUpdate(): Promise<void>
  downloadUpdate(): Promise<void>
  installUpdate(): Promise<void>
  onUpdateStatus(cb: (data: UpdateStatus) => void): () => void
  onUpdateInfo(cb: (data: UpdateInfo) => void): () => void
  onDownloadProgress(cb: (data: DownloadProgress) => void): () => void
}
