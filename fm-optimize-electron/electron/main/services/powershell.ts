import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

function cleanPsOutput(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => !line.startsWith('#< CLIXML') && !line.startsWith('<Objs') && !line.startsWith('</Objs>'))
    .join('\n')
    .trim()
}

export async function execPowerShell(script: string): Promise<string> {
  const wrapped = `$ProgressPreference = 'SilentlyContinue'\n${script}`
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command', wrapped
  ], { timeout: 30000 })
  return cleanPsOutput(stdout)
}
