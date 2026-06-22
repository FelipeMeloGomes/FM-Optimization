import { app, BrowserWindow, shell, Menu } from 'electron'
import { spawn } from 'child_process'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'
import { isAdmin } from './services/admin-check'

if (app.isPackaged && !isAdmin()) {
  spawn('powershell.exe', [
    '-NoProfile', '-Command',
    `Start-Process -FilePath "${process.execPath}" -Verb RunAs`
  ], { detached: true, stdio: 'ignore' }).unref()
  app.exit(0)
}

let mainWindow: BrowserWindow | null = null

function iconPath(): string {
  return app.isPackaged
    ? resolve(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../resources/icon.ico')
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
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
