import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { app } from 'electron';
import type { AppSettings, ExecutionHistoryEntry } from '../../shared/ipc-types';

interface UserData {
  customScripts: Array<{ name: string; content: string; extension: string }>;
  executionHistory: ExecutionHistoryEntry[];
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#22d3ee',
  confirmOnExecute: true,
  autoRestorePoint: true,
  security: {
    enableIpcValidation: true,
    enableDenyListBlock: false,
    enablePathValidation: true,
    enablePsSanitize: true,
  },
  soundEnabled: true,
  toastDuration: 'medium',
};

function getDataDir(): string {
  return app.isPackaged
    ? resolve(app.getPath('appData'), 'fm-optimize')
    : resolve(__dirname, '../../data');
}

function getDataFilePath(): string {
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return resolve(dir, 'scripts_data.json');
}

function getSettingsFilePath(): string {
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return resolve(dir, 'settings.json');
}

export function loadUserData(): UserData {
  const filePath = getDataFilePath();
  if (!existsSync(filePath)) return { customScripts: [], executionHistory: [] };

  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    copyFileSync(filePath, `${filePath}.bak`);
    return { customScripts: [], executionHistory: [] };
  }
}

export function addHistoryEntry(entry: ExecutionHistoryEntry): void {
  const data = loadUserData();
  data.executionHistory.unshift(entry);
  if (data.executionHistory.length > 200) {
    data.executionHistory = data.executionHistory.slice(0, 200);
  }
  saveUserData(data);
}

export function saveUserData(data: UserData): void {
  const filePath = getDataFilePath();
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);
}

export function loadSettings(): AppSettings {
  const filePath = getSettingsFilePath();
  if (!existsSync(filePath)) return DEFAULT_SETTINGS;

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS;
    return {
      theme: ['light', 'dark', 'midnight', 'amber', 'emerald', 'batman'].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_SETTINGS.theme,
      accentColor:
        typeof parsed.accentColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(parsed.accentColor)
          ? parsed.accentColor
          : DEFAULT_SETTINGS.accentColor,
      confirmOnExecute:
        typeof parsed.confirmOnExecute === 'boolean'
          ? parsed.confirmOnExecute
          : DEFAULT_SETTINGS.confirmOnExecute,
      autoRestorePoint:
        typeof parsed.autoRestorePoint === 'boolean'
          ? parsed.autoRestorePoint
          : DEFAULT_SETTINGS.autoRestorePoint,
      security:
        parsed.security && typeof parsed.security === 'object'
          ? {
              enableIpcValidation:
                typeof parsed.security.enableIpcValidation === 'boolean'
                  ? parsed.security.enableIpcValidation
                  : DEFAULT_SETTINGS.security.enableIpcValidation,
              enableDenyListBlock:
                typeof parsed.security.enableDenyListBlock === 'boolean'
                  ? parsed.security.enableDenyListBlock
                  : DEFAULT_SETTINGS.security.enableDenyListBlock,
              enablePathValidation:
                typeof parsed.security.enablePathValidation === 'boolean'
                  ? parsed.security.enablePathValidation
                  : DEFAULT_SETTINGS.security.enablePathValidation,
              enablePsSanitize:
                typeof parsed.security.enablePsSanitize === 'boolean'
                  ? parsed.security.enablePsSanitize
                  : DEFAULT_SETTINGS.security.enablePsSanitize,
            }
          : DEFAULT_SETTINGS.security,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : DEFAULT_SETTINGS.soundEnabled,
      toastDuration: ['short', 'medium', 'long'].includes(parsed.toastDuration)
        ? parsed.toastDuration
        : DEFAULT_SETTINGS.toastDuration,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  const filePath = getSettingsFilePath();
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(settings, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);
}
