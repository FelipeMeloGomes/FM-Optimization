import { join, resolve } from 'node:path';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, Menu, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { registerIpcHandlers } from './ipc-handlers';
import { executeScript } from './services/script-executor';

let mainWindow: BrowserWindow | null = null;

export { mainWindow };

// Handle elevated script execution argument
function handleElevatedScript(): boolean {
  const args = process.argv.slice(1);
  const elevateIndex = args.indexOf('--elevate-script');
  if (elevateIndex !== -1 && elevateIndex + 1 < args.length) {
    const scriptId = args[elevateIndex + 1];
    // Wait a bit for window to be ready, then execute
    setTimeout(() => {
      if (mainWindow) {
        try {
          executeScript(scriptId);
        } catch (e) {
          console.error('Failed to execute elevated script:', e);
        }
      }
    }, 1000);
    return true;
  }

  // Handle elevated DNS apply argument
  const elevateDnsIndex = args.indexOf('--elevate-dns');
  if (elevateDnsIndex !== -1 && elevateDnsIndex + 2 < args.length) {
    const interfaceIndex = parseInt(args[elevateDnsIndex + 1], 10);
    const addressesJson = args[elevateDnsIndex + 2];
    if (!Number.isNaN(interfaceIndex) && addressesJson) {
      setTimeout(() => {
        if (mainWindow) {
          try {
            const addresses = JSON.parse(addressesJson);
            applyDnsElevated(interfaceIndex, addresses);
          } catch (e) {
            console.error('Failed to apply elevated DNS:', e);
          }
        }
      }, 1000);
    }
    return true;
  }

  return false;
}

async function applyDnsElevated(interfaceIndex: number, addresses: string[]): Promise<void> {
  const { execPowerShell } = await import('./services/powershell');

  if (addresses.length === 0) {
    await execPowerShell(
      `$ErrorActionPreference = 'Stop'\nSet-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ResetServerAddresses`
    );
  } else {
    const addrList = addresses.map((a) => `"${a}"`).join(',');
    await execPowerShell(
      `$ErrorActionPreference = 'Stop'\nSet-DnsClientServerAddress -InterfaceIndex ${interfaceIndex} -ServerAddresses (${addrList})\nipconfig /flushdns | Out-Null`
    );
  }

  // Notify renderer of success
  sendToRenderer('dns-applied', { success: true });
}

function iconPath(): string {
  return app.isPackaged
    ? resolve(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../resources/icon.ico');
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args);
}

function setupAutoUpdater(): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('update-status', 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('update-status', 'available');
    sendToRenderer('update-info', {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('update-status', 'not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update-status', 'downloading');
    sendToRenderer('download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update-status', 'ready');
  });

  autoUpdater.on('error', (err) => {
    sendToRenderer('update-status', 'error');
    sendToRenderer('update-info', { version: '', error: err.message });
  });

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'FelipeMeloGomes',
    repo: 'FM-Optimization',
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    frame: false,
    show: false,
    title: 'FM Optimize',
    icon: iconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      // Content Security Policy
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Content Security Policy via additionalArguments
      // CSP is enforced via the webSecurity flag and the preload script
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    try {
      const parsed = new URL(details.url);
      if (['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
        shell.openExternal(details.url);
      }
    } catch {
      /* invalid URL */
    }
    return { action: 'deny' };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  electronApp.setAppUserModelId('com.fmoptimize');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  registerIpcHandlers();
  setupAutoUpdater();
  createWindow();

  // Handle elevated script execution after window is created
  handleElevatedScript();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
