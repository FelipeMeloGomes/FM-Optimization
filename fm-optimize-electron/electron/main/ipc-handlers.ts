import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import type { AppSettings, BenchmarkResult, IpcResult } from '../shared/ipc-types';
import { isAdmin } from './services/admin-check';
import {
  getDataFilePathForRenderer,
  loadSettings,
  loadUserData,
  saveSettings,
} from './services/data-service';
import { execPowerShell } from './services/powershell';
import {
  createRestorePoint,
  deleteRestorePoint,
  getRestorePoints,
  restoreSystem,
} from './services/restore-points';
import { cancelExecution, executeScript } from './services/script-executor';
import { extractScriptToTemp, getScriptContent, loadScripts } from './services/script-registry';
import { getSystemInfo } from './services/system-info';
import { auditIpcValidation, validateIpcInput } from './validation';

function handleIpc<T, V>(
  channel: string,
  input: unknown,
  fn: (validated: V) => T | Promise<T>
): Promise<IpcResult<T>> {
  const validation = validateIpcInput<V>(channel, input);
  auditIpcValidation(
    channel,
    validation.success,
    validation.success ? undefined : validation.error
  );
  if (!validation.success) {
    return Promise.resolve({ success: false as const, error: validation.error });
  }
  try {
    const result = fn(validation.data);
    return Promise.resolve(result).then(
      (data) => ({ success: true as const, data }),
      (e: unknown) => ({
        success: false as const,
        error: e instanceof Error ? e.message : String(e),
      })
    );
  } catch (e: unknown) {
    return Promise.resolve({
      success: false as const,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

function handleIpcNoInput<T>(fn: () => T): Promise<IpcResult<T>> {
  return handleIpc('', undefined, () => fn());
}

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', async () => {
    try {
      return { success: true as const, data: await getSystemInfo() };
    } catch (e: unknown) {
      return { success: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('get-scripts', () => handleIpcNoInput(() => loadScripts()));

  ipcMain.handle('get-script-content', (_e, id: string) => {
    return handleIpc('get-script-content', id, (validated) =>
      getScriptContent(validated as string)
    );
  });

  ipcMain.handle('execute-script', (_e, id: string) => {
    return handleIpc('execute-script', id, (validated) => {
      executeScript(validated as string);
    });
  });

  ipcMain.handle('cancel-execution', (_e, id: string) => {
    return handleIpc('cancel-execution', id, (validated) => {
      cancelExecution(validated as string);
    });
  });

  ipcMain.handle('get-restore-points', () => handleIpcNoInput(() => getRestorePoints()));

  ipcMain.handle('create-restore-point', (_e, name: string) => {
    return handleIpc('create-restore-point', name, (validated) => {
      createRestorePoint(validated as string);
    });
  });

  ipcMain.handle('delete-restore-point', (_e, seq: number) => {
    return handleIpc('delete-restore-point', seq, (validated) => {
      deleteRestorePoint(validated as number);
    });
  });

  ipcMain.handle('is-admin', () => handleIpcNoInput(() => isAdmin()));

  ipcMain.handle('get-settings', () => handleIpcNoInput(() => loadSettings()));

  ipcMain.handle('save-settings', (_e, settings) => {
    return handleIpc('save-settings', settings, (validated) => {
      saveSettings(validated as AppSettings);
    });
  });

  ipcMain.handle('get-data-file-path', () => handleIpcNoInput(() => getDataFilePathForRenderer()));

  ipcMain.handle('get-app-version', () => handleIpcNoInput(() => app.getVersion()));

  ipcMain.handle('is-packaged', () => handleIpcNoInput(() => app.isPackaged));

  ipcMain.handle('extract-script', (_e, id: string) => {
    return handleIpc('extract-script', id, (validated) => extractScriptToTemp(validated as string));
  });

  ipcMain.handle('get-execution-history', () =>
    handleIpcNoInput(() => loadUserData().executionHistory || [])
  );

  ipcMain.handle('restore-system', (_e, seq: number) => {
    return handleIpc('restore-system', seq, (validated) => {
      restoreSystem(validated as number);
    });
  });

  ipcMain.handle('check-for-update', () => {
    if (!app.isPackaged) {
      return { success: false as const, error: 'Updates only work in packaged app' };
    }
    return handleIpcNoInput(() => {
      autoUpdater.checkForUpdates();
    });
  });

  ipcMain.handle('download-update', () =>
    handleIpcNoInput(() => {
      autoUpdater.downloadUpdate();
    })
  );

  ipcMain.handle('install-update', () =>
    handleIpcNoInput(() => {
      autoUpdater.quitAndInstall();
    })
  );

  ipcMain.handle('get-network-info', async () => {
    return handleIpc('get-network-info', undefined, async () => {
      try {
        const ps = `
          $adapter = Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object -First 1
          if (-not $adapter) { throw "Nenhuma interface de rede ativa encontrada" }
          $dns = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4
          $dnsServers = @()
          if ($dns) { $dnsServers = $dns.ServerAddresses }
          @{ interfaceName = $adapter.Name; interfaceIndex = $adapter.InterfaceIndex; currentDns = $dnsServers } | ConvertTo-Json -Compress
        `;
        const output = await execPowerShell(ps);
        const parsed = JSON.parse(output.trim());
        return {
          interfaceName: parsed.interfaceName,
          interfaceIndex: parsed.interfaceIndex,
          currentDns: parsed.currentDns || [],
        };
      } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : String(e));
      }
    });
  });

  ipcMain.handle('benchmark-dns', async (event, providers: unknown) => {
    return handleIpc('benchmark-dns', providers, async (validated) => {
      const providerList = (validated as { providers: { primary: string; secondary: string }[] })
        .providers;
      const total = providerList.length;
      const results: BenchmarkResult[] = [];
      for (let i = 0; i < providerList.length; i++) {
        const { primary, secondary } = providerList[i];
        for (const addr of [primary, secondary]) {
          try {
            const ps = `
              $r = Test-Connection -Count 2 -ComputerName "${addr}" -ErrorAction Stop
              Write-Output (($r | Measure-Object -Property ResponseTime -Average).Average)
            `;
            const output = await execPowerShell(ps);
            const ms = parseFloat(output.trim().split('\n').pop() || '');
            results.push({ address: addr, latencyMs: Number.isNaN(ms) ? null : Math.round(ms) });
          } catch {
            results.push({ address: addr, latencyMs: null });
          }
        }
        event.sender.send('benchmark-progress', { current: i + 1, total });
        for (const addr of [primary, secondary]) {
          const r = results.find((x) => x.address === addr);
          if (r) event.sender.send('benchmark-result', r);
        }
      }
      return results;
    });
  });

  ipcMain.handle('apply-dns', async (_e, interfaceIndex: unknown, addresses: unknown) => {
    return handleIpc('apply-dns', { interfaceIndex, addresses }, async (validated) => {
      const { interfaceIndex: idx, addresses: addrs } = validated as {
        interfaceIndex: number;
        addresses: string[];
      };
      if (!isAdmin()) {
        throw new Error('Execute o aplicativo como administrador para alterar o DNS.');
      }
      if (addrs.length === 0) {
        const ps = `
          $ErrorActionPreference = 'Stop'
          Set-DnsClientServerAddress -InterfaceIndex ${idx} -ResetServerAddresses
        `;
        await execPowerShell(ps);
      } else {
        const addrList = addrs.map((a) => `"${a}"`).join(',');
        const ps = `
          $ErrorActionPreference = 'Stop'
          Set-DnsClientServerAddress -InterfaceIndex ${idx} -ServerAddresses (${addrList})
          ipconfig /flushdns | Out-Null
        `;
        await execPowerShell(ps);
      }
    });
  });

  ipcMain.handle('window-minimize', () =>
    handleIpcNoInput(() => {
      BrowserWindow.getFocusedWindow()?.minimize();
      return { success: true };
    })
  );

  ipcMain.handle('window-maximize', () =>
    handleIpcNoInput(() => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.isMaximized() ? win.unmaximize() : win.maximize();
      }
      return { success: true };
    })
  );

  ipcMain.handle('window-close', () =>
    handleIpcNoInput(() => {
      BrowserWindow.getFocusedWindow()?.close();
      return { success: true };
    })
  );

  ipcMain.handle(
    'elevate-app',
    (_e, scriptId?: string, interfaceIndex?: number, addresses?: string[]) =>
      handleIpc(
        'elevate-app',
        { scriptId, interfaceIndex, addresses },
        async (validated: { scriptId?: string; interfaceIndex?: number; addresses?: string[] }) => {
          const { spawn } = require('node:child_process');

          const exePath = process.execPath;
          const args = process.argv.slice(1).filter((arg) => !arg.startsWith('--elevate-script'));

          if (validated.scriptId) {
            args.push('--elevate-script', validated.scriptId);
          }

          // Pass DNS parameters if provided
          if (validated.interfaceIndex && validated.addresses) {
            args.push(
              '--elevate-dns',
              validated.interfaceIndex.toString(),
              JSON.stringify(validated.addresses)
            );
          }

          // Use spawn with detached to properly elevate
          return new Promise((resolve, _reject) => {
            const elevated = spawn(
              'powershell.exe',
              [
                '-Command',
                `Start-Process -FilePath "${exePath}" -ArgumentList "${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(' ')}" -Verb RunAs -Wait`,
              ],
              {
                detached: true,
                stdio: 'ignore',
              }
            );

            elevated.unref();

            // Exit current non-elevated process after spawning elevated one
            setTimeout(() => {
              app.quit();
              resolve({ success: true });
            }, 500);
          });
        }
      )
  );
}
