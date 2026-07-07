import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, copyFileSync } from 'fs'
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
  const tmpPath = filePath + '.tmp'
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmpPath, filePath)
}

export function loadSettings(): AppSettings {
  const filePath = getSettingsFilePath()
  if (!existsSync(filePath)) return DEFAULT_SETTINGS

  try {
    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
    return {
      theme: ['dark', 'light'].includes(parsed.theme) ? parsed.theme : DEFAULT_SETTINGS.theme,
      autoOpenLog: typeof parsed.autoOpenLog === 'boolean' ? parsed.autoOpenLog : DEFAULT_SETTINGS.autoOpenLog,
      confirmOnExecute: typeof parsed.confirmOnExecute === 'boolean' ? parsed.confirmOnExecute : DEFAULT_SETTINGS.confirmOnExecute
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  const filePath = getSettingsFilePath()
  const tmpPath = filePath + '.tmp'
  writeFileSync(tmpPath, JSON.stringify(settings, null, 2), 'utf-8')
  renameSync(tmpPath, filePath)
}
