import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { app } from 'electron'
import type { ScriptEntry } from '../../shared/ipc-types'

let scriptsCache: ScriptEntry[] | null = null

function getResourcesPath(): string {
  return app.isPackaged
    ? resolve(process.resourcesPath, 'scripts.json')
    : resolve(__dirname, '../../../resources/scripts.json')
}

export function loadScripts(): ScriptEntry[] {
  if (scriptsCache) return scriptsCache

  const filePath = getResourcesPath()
  const raw = readFileSync(filePath, 'utf-8')
  const entries: ScriptEntry[] = JSON.parse(raw)

  scriptsCache = entries.map((entry, i) => ({
    ...entry,
    id: entry.id || `builtin-${i}`
  }))

  return scriptsCache
}

export function getScriptById(id: string): ScriptEntry | undefined {
  const scripts = loadScripts()
  return scripts.find((s) => s.id === id)
}

export function getScriptsByCategory(category: string): ScriptEntry[] {
  return loadScripts().filter((s) => s.category === category)
}

export function getScriptContent(id: string): string {
  const script = getScriptById(id)
  if (!script) throw new Error(`Script not found: ${id}`)
  return Buffer.from(script.content, 'base64').toString('utf-8')
}

export function extractScriptToTemp(id: string): string {
  const script = getScriptById(id)
  if (!script) throw new Error(`Script not found: ${id}`)

  const tempDir = resolve(app.getPath('temp'), 'FMOptimize', 'scripts')
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  const content = getScriptContent(id)
  const filePath = resolve(tempDir, `${script.name}.${script.extension}`)
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}
