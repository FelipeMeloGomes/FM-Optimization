import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { resolve } from 'path'
import { app } from 'electron'
import type { AppSettings } from '../../shared/ipc-types'

interface UserData {
  favorites: string[]
  customScripts: Array<{ name: string; content: string; extension: string }>
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoOpenLog: true,
  confirmOnExecute: true
}

function getDataDir(): string {
  return app.isPackaged
    ? resolve(app.getPath('appData'), 'fm-optimize')
    : resolve(__dirname, '../../data')
}

function getDataFilePath(): string {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return resolve(dir, 'scripts_data.json')
}

function getSettingsFilePath(): string {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return resolve(dir, 'settings.json')
}

export function getDataFilePathForRenderer(): string {
  return getDataFilePath()
}

export function loadUserData(): UserData {
  const filePath = getDataFilePath()
  if (!existsSync(filePath)) return { favorites: [], customScripts: [] }

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    copyFileSync(filePath, `${filePath}.bak`)
    return { favorites: [], customScripts: [] }
  }
}

export function saveUserData(data: UserData): void {
  const filePath = getDataFilePath()
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function loadSettings(): AppSettings {
  const filePath = getSettingsFilePath()
  if (!existsSync(filePath)) return DEFAULT_SETTINGS

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  const filePath = getSettingsFilePath()
  writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8')
}
