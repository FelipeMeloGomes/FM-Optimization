import { execFile as execFileCb } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFileCb)

const DANGEROUS_PATTERNS = [
  /\bformat\b/i,
  /\bdiskpart\b/i,
  /\bdel\s+\/f\s+\/s\s+\/q\s+[cC]:/i,
  /\brmdir\s+\/s\s+\/q\s+[cC]:/i,
  /reg\s+delete\s+HKLM\\/i,
  /reg\s+delete\s+HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run/i,
  /Start-Process\s+-Verb\s+runas/i,
  /\brunas\s+/i,
  /\belevate\b/i,
  /Invoke-Expression\b/i,
  /\biex\b/i,
  /Invoke-WebRequest\s+-OutFile/i,
  /\bwget\s+/i,
  /curl\s+-o/i,
  /downloadstring/i,
  /Net\.WebClient/i,
  /System\.Net\.Http/i,
  /sc\s+stop\s+(wuauserv|wscsvc|windefend|mpssvc)/i,
  /Stop-Service\s+(wuauserv|wscsvc|windefend|mpssvc)/i,
  /\bbcdedit\b/i,
  /\bbootrec\b/i,
  /Remove-Item\s+-Recurse\s+-Force\s+[cC]:/i,
  /schtasks\s+\/delete\s+\/tn\s+.*\s+\/f/i,
  /Unregister-ScheduledTask\b/i,
  /wevtutil\s+cl\b/i,
  /Clear-EventLog\b/i,
  /vssadmin\s+delete\s+shadows/i,
  /wbadmin\s+delete\s+systemstatebackup/i,
  /cipher\s+\/w\s+[cC]:/i,
  /sdelete\b/i,
  /attrib\s+\+h\s+\+s\s+\+r\s+[cC]:/i,
  /takeown\s+\/f\s+[cC]:/i,
  /icacls\s+[cC]:\s+\/grant\s+.*\(F\)/i,
  /reg\s+add\s+HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run/i,
  /reg\s+add\s+HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run/i,
  /New-ItemProperty\s+-Path\s+HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run/i,
  /New-ItemProperty\s+-Path\s+HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run/i,
]

function cleanPsOutput(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => !line.startsWith('#< CLIXML') && !line.startsWith('<Objs') && !line.startsWith('</Objs>'))
    .join('\n')
    .trim()
}

function sanitizeScript(script: string): { clean: string; violations: string[] } {
  const violations: string[] = []
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(script)) {
      violations.push(`Matched pattern: ${pattern.source}`)
    }
  }
  
  return { clean: script, violations }
}

export async function execPowerShell(script: string): Promise<string> {
  const { violations } = sanitizeScript(script)
  
  if (violations.length > 0) {
    throw new Error(`Script rejected by security policy: ${violations.join(', ')}`)
  }
  
  const wrapped = `$ProgressPreference = 'SilentlyContinue'\n${script}`
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command', wrapped
  ], { timeout: 30000 })
  
  return cleanPsOutput(stdout)
}

export function validatePowerShellScript(script: string): { valid: boolean; violations: string[] } {
  const { violations } = sanitizeScript(script)
  return { valid: violations.length === 0, violations }
}