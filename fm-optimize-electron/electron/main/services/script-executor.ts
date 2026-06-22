import { spawn, ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'
import { extractScriptToTemp } from './script-registry'
import type { ScriptOutput, ScriptEnded } from '../../shared/ipc-types'

const activeProcesses = new Map<string, ChildProcess>()

function sendOutput(win: BrowserWindow, data: ScriptOutput): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-output', JSON.stringify(data))
  }
}

function sendEnded(win: BrowserWindow, data: ScriptEnded): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-ended', JSON.stringify(data))
  }
}

export function executeScript(id: string): void {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return

  const filePath = extractScriptToTemp(id)
  const ext = filePath.split('.').pop()?.toLowerCase()

  const { command, args } = getCommand(ext, filePath)
  const proc = spawn(command, args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  activeProcesses.set(id, proc)

  proc.stdout?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stdout', text: data.toString() })
  })

  proc.stderr?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stderr', text: data.toString() })
  })

  proc.on('close', (code) => {
    activeProcesses.delete(id)
    sendEnded(win, { id, code })
  })

  proc.on('error', (err) => {
    activeProcesses.delete(id)
    sendOutput(win, { scriptId: id, type: 'stderr', text: `Error: ${err.message}\n` })
    sendEnded(win, { id, code: -1 })
  })
}

export function cancelExecution(id: string): void {
  const proc = activeProcesses.get(id)
  if (proc && proc.pid) {
    try {
      process.kill(-proc.pid, 'SIGTERM')
    } catch {
      try { proc.kill('SIGTERM') } catch { /* already dead */ }
    }
    activeProcesses.delete(id)
  }
}

function getCommand(ext: string | undefined, filePath: string): { command: string; args: string[] } {
  switch (ext) {
    case 'bat':
    case 'cmd':
      return { command: 'cmd.exe', args: ['/c', filePath] }
    case 'ps1':
      return {
        command: 'powershell.exe',
        args: ['-ExecutionPolicy', 'Bypass', '-File', filePath]
      }
    case 'reg':
      return { command: 'regedit.exe', args: ['/s', filePath] }
    case 'exe':
      return { command: filePath, args: [] }
    default:
      return { command: 'cmd.exe', args: ['/c', filePath] }
  }
}
