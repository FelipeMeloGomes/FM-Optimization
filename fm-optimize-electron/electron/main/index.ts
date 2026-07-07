import { app, BrowserWindow, shell, Menu } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { registerIpcHandlers } from './ipc-handlers'

let mainWindow: BrowserWindow | null = null

export { mainWindow }

function iconPath(): string {
  return app.isPackaged
    ? resolve(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../resources/icon.ico')
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args)
}

function setupAutoUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('update-status', 'checking')
  })

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('update-status', 'available')
    sendToRenderer('update-info', {
      version: info.version,
      releaseDate: info.releaseDate
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('update-status', 'not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update-status', 'downloading')
    sendToRenderer('download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred
    })
  })

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update-status', 'ready')
  })

  autoUpdater.on('error', (err) => {
    sendToRenderer('update-status', 'error')
    sendToRenderer('update-info', { version: '', error: err.message })
  })

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'FelipeMeloGomes',
    repo: 'FM-Optimization'
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'FM Optimize',
    icon: iconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  electronApp.setAppUserModelId('com.fmoptimize')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  setupAutoUpdater()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
