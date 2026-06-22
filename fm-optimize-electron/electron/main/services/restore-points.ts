import { execSync } from 'child_process'
import type { RestorePointEntry } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    return execSync(`powershell.exe -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 30000
    }).trim()
  } catch (e: any) {
    throw new Error(e.stderr || e.message)
  }
}

export function getRestorePoints(): RestorePointEntry[] {
  const output = execPowerShell(
    'Get-ComputerRestorePoint | Select-Object SequenceNumber,Description,CreationTime,EventType | ConvertTo-Json'
  )
  if (!output || output === 'null') return []

  try {
    const parsed = JSON.parse(output)
    const items = Array.isArray(parsed) ? parsed : [parsed]
    const eventTypes = ['Application Install', 'Application Uninstall', 'Modify Settings', 'Scheduled', 'Manual']
    return items.map((rp: any) => ({
      sequenceNumber: rp.SequenceNumber,
      description: rp.Description,
      creationTime: rp.CreationTime,
      eventType: eventTypes[rp.EventType - 1] || 'Unknown'
    }))
  } catch {
    return []
  }
}

export function createRestorePoint(name: string): void {
  execPowerShell(`Checkpoint-Computer -Description "${name.replace(/"/g, '\\"')}" -RestorePointType MODIFY_SETTINGS`)
}

export function deleteRestorePoint(seq: number): void {
  execPowerShell(
    `$rp = Get-ComputerRestorePoint | Where-Object { $_.SequenceNumber -eq ${seq} }; ` +
    'if ($rp) { Remove-Item -Path "HKLM:\\System\\ControlSet001\\Control\\BackupRestore\\Points\\*" -Force -ErrorAction SilentlyContinue }'
  )
}

export function restoreSystem(seq: number): void {
  execPowerShell(`Restore-Computer -RestorePoint ${seq} -Confirm:$false`)
}
