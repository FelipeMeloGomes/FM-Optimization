import { contextBridge, type IpcRendererEvent, ipcRenderer } from 'electron';
import type {
  AppSettings,
  BenchmarkResult,
  DashboardData,
  DownloadProgress,
  ElectronAPI,
  ExecutionHistoryEntry,
  IpcResult,
  NetworkInfo,
  RestorePointEntry,
  ScriptEnded,
  ScriptEntry,
  ScriptOutput,
  UpdateInfo,
  UpdateStatus,
} from '../shared/ipc-types';

function ipc<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args).then((r: unknown) => {
    const result = r as IpcResult<T>;
    if (!result.success) return Promise.reject(result.error);
    return result.data as T;
  });
}

function ipcVoid(channel: string, ...args: unknown[]): Promise<void> {
  return ipcRenderer.invoke(channel, ...args).then((r: unknown) => {
    const result = r as IpcResult;
    if (!result.success) return Promise.reject(new Error(result.error));
  });
}

const scriptOutputCallbacks = new Set<(data: ScriptOutput) => void>();
const scriptErrorCallbacks = new Set<(data: ScriptOutput) => void>();
const scriptEndedCallbacks = new Set<(data: ScriptEnded) => void>();
const updateStatusCallbacks = new Set<(data: UpdateStatus) => void>();
const updateInfoCallbacks = new Set<(data: UpdateInfo) => void>();
const downloadProgressCallbacks = new Set<(data: DownloadProgress) => void>();
const benchmarkProgressCallbacks = new Set<(data: { current: number; total: number }) => void>();
const benchmarkResultCallbacks = new Set<(data: BenchmarkResult) => void>();

function setupListeners(): void {
  ipcRenderer.on('script-output', (_e: IpcRendererEvent, raw: string) => {
    try {
      const data = JSON.parse(raw) as ScriptOutput;
      scriptOutputCallbacks.forEach((cb) => cb(data));
    } catch {
      /* skip malformed output */
    }
  });

  ipcRenderer.on('script-error', (_e: IpcRendererEvent, raw: string) => {
    try {
      const data = JSON.parse(raw) as ScriptOutput;
      scriptErrorCallbacks.forEach((cb) => cb(data));
    } catch {
      /* skip malformed error */
    }
  });

  ipcRenderer.on('script-ended', (_e: IpcRendererEvent, raw: string) => {
    try {
      const data = JSON.parse(raw) as ScriptEnded;
      scriptEndedCallbacks.forEach((cb) => cb(data));
    } catch {
      /* skip malformed ended */
    }
  });

  ipcRenderer.on('update-status', (_e: IpcRendererEvent, data: UpdateStatus) => {
    updateStatusCallbacks.forEach((cb) => cb(data));
  });

  ipcRenderer.on('update-info', (_e: IpcRendererEvent, data: UpdateInfo) => {
    updateInfoCallbacks.forEach((cb) => cb(data));
  });

  ipcRenderer.on('download-progress', (_e: IpcRendererEvent, data: DownloadProgress) => {
    downloadProgressCallbacks.forEach((cb) => cb(data));
  });

  ipcRenderer.on(
    'benchmark-progress',
    (_e: IpcRendererEvent, data: { current: number; total: number }) => {
      benchmarkProgressCallbacks.forEach((cb) => cb(data));
    }
  );

  ipcRenderer.on('benchmark-result', (_e: IpcRendererEvent, data: BenchmarkResult) => {
    benchmarkResultCallbacks.forEach((cb) => cb(data));
  });
}

setupListeners();

const electronAPI: ElectronAPI = {
  getSystemInfo: () => ipc<DashboardData>('get-system-info'),
  getScripts: () => ipc<ScriptEntry[]>('get-scripts'),
  getScriptContent: (id) => ipc<string>('get-script-content', id),
  extractScript: (id) => ipc<string>('extract-script', id),
  executeScript: (id) => ipcVoid('execute-script', { id }),
  cancelExecution: (id) => ipcVoid('cancel-execution', { id }),
  getRestorePoints: () => ipc<RestorePointEntry[]>('get-restore-points'),
  createRestorePoint: (name) => ipcVoid('create-restore-point', name),
  deleteRestorePoint: (seq) => ipcVoid('delete-restore-point', seq),
  isAdmin: () => ipc<boolean>('is-admin'),
  getSettings: () => ipc<AppSettings>('get-settings'),
  saveSettings: (settings) => ipcVoid('save-settings', settings),
  getDataFilePath: () => ipc<string>('get-data-file-path'),
  onScriptOutput: (cb: (data: ScriptOutput) => void) => {
    scriptOutputCallbacks.add(cb);
    return () => scriptOutputCallbacks.delete(cb);
  },
  onScriptError: (cb: (data: ScriptOutput) => void) => {
    scriptErrorCallbacks.add(cb);
    return () => scriptErrorCallbacks.delete(cb);
  },
  onScriptEnded: (cb: (data: ScriptEnded) => void) => {
    scriptEndedCallbacks.add(cb);
    return () => scriptEndedCallbacks.delete(cb);
  },
  getExecutionHistory: () => ipc<ExecutionHistoryEntry[]>('get-execution-history'),
  restoreSystem: (seq) => ipcVoid('restore-system', seq),
  getAppVersion: () => ipc<string>('get-app-version'),
  isPackaged: () => ipc<boolean>('is-packaged'),
  checkForUpdate: () => ipcVoid('check-for-update'),
  downloadUpdate: () => ipcVoid('download-update'),
  installUpdate: () => ipcVoid('install-update'),
  onUpdateStatus: (cb: (data: UpdateStatus) => void) => {
    updateStatusCallbacks.add(cb);
    return () => updateStatusCallbacks.delete(cb);
  },
  onUpdateInfo: (cb: (data: UpdateInfo) => void) => {
    updateInfoCallbacks.add(cb);
    return () => updateInfoCallbacks.delete(cb);
  },
  onDownloadProgress: (cb: (data: DownloadProgress) => void) => {
    downloadProgressCallbacks.add(cb);
    return () => downloadProgressCallbacks.delete(cb);
  },
  getNetworkInfo: () => ipc<NetworkInfo>('get-network-info'),
  onBenchmarkProgress: (cb: (data: { current: number; total: number }) => void) => {
    benchmarkProgressCallbacks.add(cb);
    return () => benchmarkProgressCallbacks.delete(cb);
  },
  onBenchmarkResult: (cb: (data: BenchmarkResult) => void) => {
    benchmarkResultCallbacks.add(cb);
    return () => benchmarkResultCallbacks.delete(cb);
  },
  benchmarkDns: (providers: { primary: string; secondary: string }[]) =>
    ipc<BenchmarkResult[]>('benchmark-dns', { providers }),
  applyDns: (interfaceIndex: number, addresses: string[]) =>
    ipcVoid('apply-dns', { interfaceIndex, addresses }),
  minimizeWindow: () => ipcVoid('window-minimize'),
  maximizeWindow: () => ipcVoid('window-maximize'),
  closeWindow: () => ipcVoid('window-close'),
  elevateApp: (scriptId?: string, dnsInterfaceIndex?: number, dnsAddresses?: string[]) =>
    ipcVoid('elevate-app', { scriptId, dnsInterfaceIndex, dnsAddresses }),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
