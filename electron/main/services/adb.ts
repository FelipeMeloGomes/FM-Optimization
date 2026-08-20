import { execFile, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { app } from 'electron';
import type { AdbApp, AdbDevice, AdbInstance } from '../../shared/ipc-types';
import { formatError, logger } from '../utils/logger';

let adbPath = '';

const APP_LABELS: Record<string, string> = {
  // Facebook
  'com.facebook.katana': 'Facebook',
  'com.facebook.appmanager': 'Facebook App Manager',
  'com.facebook.services': 'Facebook Services',
  'com.facebook.system': 'Facebook System',
  'com.facebook.orca': 'Messenger',
  'com.facebook.lite': 'Facebook Lite',
  // Instagram
  'com.instagram.android': 'Instagram',
  'com.instagram.lite': 'Instagram Lite',
  // Twitter/X
  'com.twitter.android': 'Twitter',
  // TikTok
  'com.tiktok.android': 'TikTok',
  'com.zhiliaoapp.musically': 'TikTok',
  // Snapchat
  'com.snapchat.android': 'Snapchat',
  // LinkedIn
  'com.linkedin.android': 'LinkedIn',
  // Pinterest
  'com.pinterest': 'Pinterest',
  // Microsoft
  'com.microsoft.skydrive': 'OneDrive',
  'com.microsoft.office.outlook': 'Outlook',
  'com.microsoft.teams': 'Teams',
  'com.microsoft.office.word': 'Word',
  'com.microsoft.office.excel': 'Excel',
  'com.microsoft.office.powerpoint': 'PowerPoint',
  'com.microsoft.office.onenote': 'OneNote',
  'com.officemobile': 'Office Mobile',
  'com.microsoft.emmx': 'Edge',
  // Spotify
  'com.spotify.music': 'Spotify',
  // Netflix
  'com.netflix.mediaclient': 'Netflix',
  // Amazon
  'com.amazon.mShop.android.shopping': 'Amazon',
  'com.amazon.appmanager': 'Amazon App Manager',
  'com.amazon.ags.app': 'Amazon Games',
  'com.amazon.avod': 'Prime Video',
  'com.amazon.dee.app': 'Alexa',
  // eBay
  'com.ebay.mobile': 'eBay',
  // PayPal
  'com.paypal.android.p2pmobile': 'PayPal',
  // Games
  'com.king.candycrushsaga': 'Candy Crush',
  'com.king.candycrushsodasaga': 'Candy Crush Soda',
  'com.supercell.clashofclans': 'Clash of Clans',
  'com.supercell.clashroyale': 'Clash Royale',
  'com.supercell.brawlstars': 'Brawl Stars',
  'com.epicgames.fortnite': 'Fortnite',
  // Google
  'com.google.android.gms': 'Google Play Services',
  'com.google.android.gmsquick': 'Google Play Services',
  'com.google.android.gm': 'Gmail',
  'com.google.android.apps.maps': 'Google Maps',
  'com.google.android.youtube': 'YouTube',
  'com.google.android.apps.youtube.music': 'YouTube Music',
  'com.google.android.apps.docs': 'Google Drive',
  'com.google.android.apps.photos': 'Google Photos',
  'com.google.android.apps.chromecast.app': 'Google Home',
  'com.google.android.apps.nexuslauncher': 'Pixel Launcher',
  'com.google.android.inputmethod.latin': 'Gboard',
  'com.google.android.googlequicksearchbox': 'Google',
  'com.google.android.apps.walletnfcrel': 'Google Wallet',
  'com.google.android.calendar': 'Google Calendar',
  'com.google.android.contacts': 'Google Contacts',
  'com.google.android.dialer': 'Google Phone',
  'com.google.android.apps.messaging': 'Google Messages',
  'com.google.android.marvin.talkback': 'TalkBack',
  'com.google.android.accessibility.switchaccess': 'Switch Access',
  'com.google.android.projection.gearhead': 'Android Auto',
  // Samsung
  'com.sec.android.app.sbrowser': 'Samsung Internet',
  'com.samsung.android.calculator': 'Calculator',
  'com.samsung.android.calendar': 'Calendar',
  'com.samsung.android.camera': 'Camera',
  'com.samsung.android.app.tips': 'Tips',
  'com.samsung.android.visionintelligence': 'Bixby Vision',
  'com.samsung.android.bixby.agent': 'Bixby',
  'com.samsung.android.game.gamehome': 'Game Launcher',
  'com.sec.android.app.shealth': 'Samsung Health',
  // Xiaomi/MIUI
  'com.miui.home': 'MIUI Home',
  'com.miui.securitycenter': 'Security',
  'com.miui.gallery': 'Gallery',
  'com.miui.calculator': 'Calculator',
  'com.miui.cleaner': 'Cleaner',
  'com.miui.weather2': 'Weather',
  'com.miui.mishare.connectivity': 'Mi Share',
  // Communication
  'com.whatsapp': 'WhatsApp',
  'com.whatsapp.w4b': 'WhatsApp Business',
  'org.telegram.messenger': 'Telegram',
  'org.thoughtcrime.securesms': 'Signal',
  'com.viber.voip': 'Viber',
  'jp.naver.line.android': 'LINE',
  'com.discord': 'Discord',
  'com.skype.raider': 'Skype',
  'com.icq': 'ICQ',
  // Browsers
  'org.mozilla.firefox': 'Firefox',
  'com.UCMobile.intl': 'UC Browser',
  'com.opera.browser': 'Opera',
  'com.opera.mini.native': 'Opera Mini',
  'com.brave.browser': 'Brave',
  // Utilities
  'com.duolingo': 'Duolingo',
  'com.shazam.android': 'Shazam',
  'com.accuweather.android': 'AccuWeather',
  'com.borderfree': 'Borderfree',
  'com.ubercab': 'Uber',
  'com.grabtaxi.driver': 'Grab Driver',
  'com.grabtaxi.passenger': 'Grab',
  'com.kakao.taxi': 'Kakao Taxi',
  // Android System
  'com.android.vending': 'Google Play Store',
  'com.android.settings': 'Settings',
  'com.android.systemui': 'System UI',
  'com.android.phone': 'Phone',
  'com.android.contacts': 'Contacts',
  'com.android.mms': 'Messages',
  'com.android.dialer': 'Dialer',
  'com.android.launcher': 'Launcher',
  'com.android.launcher3': 'Launcher',
  'com.android.providers.storage': 'Storage',
  'com.android.server.telecom': 'Telecom',
  'com.android.bluetooth': 'Bluetooth',
  'com.android.nfc': 'NFC',
  'com.android.certinstaller': 'Certificate Installer',
  'com.android.chrome': 'Chrome',
  'com.android.camera': 'Camera',
  'com.android.gallery3d': 'Gallery',
  'com.android.calendar': 'Calendar',
  'com.android.deskclock': 'Clock',
  'com.android.calculator2': 'Calculator',
  'com.android.email': 'Email',
  'com.android.filemanager': 'File Manager',
  'com.android.inputmethod.latin': 'Keyboard',
  'com.android.music': 'Music',
  'com.android.soundrecorder': 'Sound Recorder',
  'com.android.term': 'Terminal',
  'com.android.webview': 'WebView',
  'com.android.packageinstaller': 'Package Installer',
  'com.android.stk': 'SIM Toolkit',
  'com.android.wallpaper.live': 'Live Wallpaper',
  'com.android.providers.downloads': 'Downloads',
  'com.android.providers.downloads.ui': 'Downloads UI',
  'com.android.providers.media': 'Media Storage',
  'com.android.providers.userdictionary': 'User Dictionary',
  'com.android.quicksearchbox': 'Quick Search Box',
  'com.android.se': 'Secure Element',
  'com.android.shell': 'Shell',
  'com.android.traceur': 'System Tracing',
  'com.android.wallpapercropper': 'Wallpaper Cropper',
};

const EMULATOR_ADB_PATHS: Record<string, string[]> = {
  'bluestacks-4': [
    'C:\\Program Files (x86)\\BlueStacks\\HD-Adb.exe',
    'C:\\Program Files\\BlueStacks\\HD-Adb.exe',
  ],
  'bluestacks-5': [
    'C:\\Program Files\\BlueStacks_msi5\\HD-Adb.exe',
    resolve(process.env.PROGRAMFILES || '', 'BlueStacks_nxt\\HD-Adb.exe'),
    'C:\\Program Files (x86)\\BlueStacks_msi5\\HD-Adb.exe',
  ],
};

const versionCache = new Map<string, string>();

const EMULATOR_CONF_PATHS: Record<string, string[]> = {
  'bluestacks-4': [
    'C:\\ProgramData\\BlueStacks\\bluestacks.conf',
    'C:\\Program Files (x86)\\BlueStacks\\bluestacks.conf',
  ],
  'bluestacks-5': [
    'C:\\ProgramData\\BlueStacks_msi5\\bluestacks.conf',
    resolve(process.env.PROGRAMDATA || '', 'BlueStacks_nxt\\bluestacks.conf'),
  ],
};

function detectAdbPath(): string {
  const candidates = [
    resolve(process.env.LOCALAPPDATA || '', 'Android/Sdk/platform-tools/adb.exe'),
    'C:\\Program Files\\BlueStacks_msi5\\HD-Adb.exe',
    'C:\\Program Files (x86)\\BlueStacks\\HD-Adb.exe',
    resolve(process.env.PROGRAMFILES || '', 'BlueStacks_nxt\\HD-Adb.exe'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return 'adb';
}

export function detectEmulatorAdbPath(emulatorId: string): { installed: boolean; adbPath: string } {
  const candidates = EMULATOR_ADB_PATHS[emulatorId];
  if (!candidates) return { installed: false, adbPath: '' };
  for (const p of candidates) {
    if (existsSync(p)) return { installed: true, adbPath: p };
  }
  return { installed: false, adbPath: '' };
}

export async function detectEmulatorVersion(emulatorId: string): Promise<string | null> {
  // Verificar cache primeiro
  const cached = versionCache.get(emulatorId);
  if (cached) {
    logger.debug('[detectEmulatorVersion] Cache hit', { emulatorId, version: cached });
    return cached;
  }

  // Primeiro: tentar obter a versão do executável principal do emulador (HD-Player.exe)
  const playerPaths: Record<string, string[]> = {
    'bluestacks-4': [
      'C:\\Program Files (x86)\\BlueStacks\\HD-Player.exe',
      'C:\\Program Files\\BlueStacks\\HD-Player.exe',
    ],
    'bluestacks-5': [
      'C:\\Program Files\\BlueStacks_msi5\\HD-Player.exe',
      resolve(process.env.PROGRAMFILES || '', 'BlueStacks_nxt\\HD-Player.exe'),
      'C:\\Program Files (x86)\\BlueStacks_msi5\\HD-Player.exe',
    ],
  };

  const allowedPaths = playerPaths[emulatorId] || [];
  if (allowedPaths.length > 0) {
    for (const p of allowedPaths) {
      logger.debug('[detectEmulatorVersion] Checking path', { path: p });
      if (existsSync(p)) {
        logger.debug('[detectEmulatorVersion] File exists', { path: p });
        try {
          const psCmd = `(Get-Item -LiteralPath '${p}').VersionInfo.ProductVersion`;
          logger.debug('[detectEmulatorVersion] Running PS', { command: psCmd });

          const output = await new Promise<string>((resolve, reject) => {
            execFile(
              'powershell',
              ['-NoProfile', '-Command', psCmd],
              {
                encoding: 'utf-8',
                timeout: 5000,
              },
              (err, stdout) => {
                if (err) reject(err);
                else resolve(stdout.trim());
              }
            );
          });

          const full = output.trim();
          logger.debug('[detectEmulatorVersion] PS Output', { output: full });
          if (full) {
            const parts = full.split('.');
            const result = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : full;
            logger.info('[detectEmulatorVersion] Version detected', {
              emulatorId,
              version: result,
            });
            versionCache.set(emulatorId, result);
            return result;
          }
        } catch (e: unknown) {
          logger.error('[detectEmulatorVersion] Error', {
            emulatorId,
            path: p,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      } else {
        logger.debug('[detectEmulatorVersion] File NOT found', { path: p });
      }
    }
  }

  // Fallback: bluestacks.conf (launcher_version)
  logger.debug('[detectEmulatorVersion] Falling back to conf', { emulatorId });
  const confCandidates = EMULATOR_CONF_PATHS[emulatorId];
  if (confCandidates) {
    for (const p of confCandidates) {
      if (existsSync(p)) {
        try {
          const content = readFileSync(p, 'utf-8');
          let match = content.match(/^bst\.launcher_version\s*=\s*["']?([^"'\r\n]+)["']?/m);
          if (!match) {
            match = content.match(/^bst\.version\s*=\s*["']?([^"'\r\n]+)["']?/m);
          }
          if (match?.[1]) {
            const full = match[1].trim();
            const parts = full.split('.');
            const result = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : full;
            versionCache.set(emulatorId, result);
            return result;
          }
        } catch (e: unknown) {
          logger.warn('[detectEmulatorVersion] Conf parse error', {
            emulatorId,
            path: p,
            error: formatError(e),
          });
        }
      }
    }
  }

  return null;
}

export function listEmulatorInstances(emulatorId: string): AdbInstance[] {
  logger.debug('[ADB] listEmulatorInstances called', { emulatorId });
  const confCandidates = EMULATOR_CONF_PATHS[emulatorId];
  if (!confCandidates) {
    logger.warn('[ADB] No conf paths for emulatorId', { emulatorId });
    return [];
  }

  let confPath = '';
  for (const p of confCandidates) {
    if (existsSync(p)) {
      confPath = p;
      break;
    }
  }
  if (!confPath) {
    logger.warn('[ADB] No conf file found', { candidates: confCandidates.join(', ') });
    return [];
  }
  logger.debug('[ADB] Using conf', { path: confPath });

  let content: string;
  try {
    content = readFileSync(confPath, 'utf-8');
  } catch (e: unknown) {
    logger.error('[ADB] Failed to read conf', { error: formatError(e) });
    return [];
  }

  const instanceNames = new Set<string>();
  const instanceRegex = /^bst\.instance\.([^.]+)\./gm;
  let match = instanceRegex.exec(content);
  while (match) {
    instanceNames.add(match[1]);
    match = instanceRegex.exec(content);
  }

  logger.debug('[ADB] Found instances', { instances: [...instanceNames].join(', ') });

  return Array.from(instanceNames).map((name) => {
    const is64 = name.toLowerCase().includes('64');
    const arch = is64 ? '64-bit' : '32-bit';
    const dnRe = new RegExp(`^bst\\.instance\\.${name}\\.display_name="([^"]*)"`, 'm');
    const displayMatch = content.match(dnRe);
    return {
      id: name.toLowerCase().replace(/([a-z])(\d)/, '$1-$2'),
      name,
      arch,
      displayName: displayMatch?.[1] || undefined,
    };
  });
}

export function initAdbPath(): string {
  if (!adbPath) adbPath = detectAdbPath();
  return adbPath;
}

export function setAdbPath(path: string): void {
  adbPath = path;
}

export function getAdbPath(): string {
  if (!adbPath) adbPath = detectAdbPath();
  return adbPath;
}

export function execAdb(args: string[]): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(adbPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `adb exited with code ${code}`));
        return;
      }
      resolvePromise(stdout);
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn adb: ${err.message}`));
    });
  });
}

export async function listDevices(): Promise<AdbDevice[]> {
  const output = await execAdb(['devices', '-l']);
  const lines = output
    .split('\n')
    .slice(1)
    .filter((l) => l.trim());

  const devices: AdbDevice[] = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const serial = parts[0];
    const state = parts[1] as AdbDevice['state'];
    if (!['device', 'offline', 'unauthorized'].includes(state)) continue;

    const device: AdbDevice = { serial, state };

    const modelMatch = line.match(/model:(\S+)/);
    if (modelMatch) device.model = modelMatch[1];

    const emulatorMatch = line.match(/emulator-(\d+)/);
    if (emulatorMatch) device.emulator = emulatorMatch[1];

    devices.push(device);
  }

  return devices;
}

async function batchMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

function cleanLabel(raw: string): string {
  let label = raw
    .replace(/versionCode:\S+/g, '')
    .replace(/versionName:\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (label.length > 40) label = label.substring(0, 40);
  return label;
}

function getBackupDir(): string {
  const dir = app.isPackaged
    ? resolve(app.getPath('appData'), 'fm-optimize', 'backups')
    : resolve(__dirname, '../../data/backups');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export async function listApps(serial: string): Promise<AdbApp[]> {
  const [packagesOutput, disabledOutput] = await Promise.all([
    execAdb(['-s', serial, 'shell', 'pm', 'list', 'packages', '-f']),
    execAdb(['-s', serial, 'shell', 'pm', 'list', 'packages', '-d']).catch(() => ''),
  ]);

  const disabledPackages = new Set(
    disabledOutput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('package:'))
      .map((l) => l.replace('package:', ''))
  );

  const parsed = packagesOutput
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('package:'))
    .map((line) => {
      const withoutPrefix = line.replace('package:', '');
      const eqIndex = withoutPrefix.lastIndexOf('=');
      const apkPath = eqIndex > -1 ? withoutPrefix.substring(0, eqIndex) : withoutPrefix;
      const packageName = eqIndex > -1 ? withoutPrefix.substring(eqIndex + 1) : '';
      const isSystem = apkPath.startsWith('/system/') || apkPath.startsWith('/vendor/');
      const isUpdated = apkPath.startsWith('/data/');

      return {
        packageName,
        apkPath,
        isSystem,
        isDisabled: disabledPackages.has(packageName),
        isUpdated,
      };
    })
    .filter((p) => p.packageName);

  const userPackages = parsed.filter((p) => !p.isSystem);

  const sizes = await batchMap(
    userPackages,
    async (pkg) => {
      const output = await execAdb(['-s', serial, 'shell', 'stat', '-c', '%s', pkg.apkPath]).catch(
        () => ''
      );
      return output.trim() === '' ? -1 : Number.parseInt(output.trim(), 10) || 0;
    },
    5
  );

  const sizeMap = new Map<string, number>();
  userPackages.forEach((pkg, i) => {
    sizeMap.set(pkg.packageName, sizes[i]);
  });

  function resolveLabel(packageName: string): string {
    if (APP_LABELS[packageName]) return APP_LABELS[packageName];
    const segments = packageName.split('.');
    const last = segments[segments.length - 1];
    return cleanLabel(last.charAt(0).toUpperCase() + last.slice(1));
  }

  return parsed.map((pkg) => ({
    packageName: pkg.packageName,
    label: resolveLabel(pkg.packageName),
    isSystem: pkg.isSystem,
    isDisabled: pkg.isDisabled,
    isUpdated: pkg.isUpdated,
    size: sizeMap.get(pkg.packageName) ?? (pkg.isSystem ? 0 : -1),
  }));
}

export async function removeApp(serial: string, packageName: string): Promise<void> {
  await execAdb(['-s', serial, 'shell', 'pm', 'uninstall', '-k', '--user', '0', packageName]);
}

export async function backupApp(serial: string, packageName: string): Promise<string> {
  const backupDir = getBackupDir();
  const apkPath = await execAdb(['-s', serial, 'shell', 'pm', 'path', packageName]);
  const remotePath = apkPath.trim().replace('package:', '');
  const localPath = resolve(backupDir, `${packageName}.apk`);
  await execAdb(['-s', serial, 'pull', remotePath, localPath]);
  return localPath;
}

export async function restoreApp(serial: string, apkPath: string): Promise<void> {
  await execAdb(['-s', serial, 'install', '-r', apkPath]);
}

export async function restoreAppByName(serial: string, packageName: string): Promise<void> {
  const backupDir = getBackupDir();
  const localPath = resolve(backupDir, `${packageName}.apk`);
  if (!existsSync(localPath)) {
    throw new Error(`Backup não encontrado para ${packageName}`);
  }
  await execAdb(['-s', serial, 'install', '-r', localPath]);
}
