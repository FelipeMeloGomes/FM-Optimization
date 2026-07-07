import { execSync } from 'child_process'
import type { RestorePointEntry } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    const buf = Buffer.from(script, 'utf16le')
    return execSync(`powershell.exe -NoProfile -EncodedCommand ${buf.toString('base64')}`, {
      encoding: 'utf-8',
      timeout: 30000
    }).trim()
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string }
    throw new Error(err.stderr || err.message || String(e))
  }
}

const RESTORE_TYPES: Record<number, string> = {
  0: 'Application Install',
  1: 'Application Uninstall',
  10: 'Device Driver Install',
  12: 'Modify Settings',
  13: 'Cancelled Operation'
}

export function getRestorePoints(): RestorePointEntry[] {
  const script = `
$points = Get-ComputerRestorePoint
foreach ($rp in $points) {
  $s = $rp.SequenceNumber.ToString()
  $d = $rp.Description
  $t = [System.Management.ManagementDateTimeConverter]::ToDateTime($rp.CreationTime).ToString("yyyy-MM-dd HH:mm:ss")
  $r = [int]$rp.RestorePointType
  Write-Output ("$s|||$d|||$r|||$t")
}
`
  const output = execPowerShell(script)
  if (!output) return []

  const items: RestorePointEntry[] = []
  for (const line of output.split('\n')) {
    const cols = line.split('|||')
    if (cols.length < 4) continue
    const rpt = parseInt(cols[2], 10)
    items.push({
      sequenceNumber: parseInt(cols[0], 10),
      description: cols[1] || '',
      creationTime: cols[3] || '',
      eventType: RESTORE_TYPES[rpt] || 'Unknown'
    })
  }
  return items
}

export function createRestorePoint(name: string): void {
  const safeName = name.replace(/[^a-zA-Z0-9 áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.:_-]/g, '').trim()
  if (!safeName) throw new Error('Nome do ponto de restauração inválido')
  execPowerShell(`Checkpoint-Computer -Description "${safeName.replace(/"/g, '\\"')}" -RestorePointType MODIFY_SETTINGS`)
}

export function deleteRestorePoint(seq: number): void {
  const script = `
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class SR {
  [DllImport("SrClient.dll", CharSet = CharSet.Unicode)]
  public static extern int SRRemoveRestorePoint(int dwRPNum);
}
'@
[SR]::SRRemoveRestorePoint(${seq})
`
  execPowerShell(script)
}

export function restoreSystem(seq: number): void {
  if (typeof seq !== 'number' || !Number.isFinite(seq) || seq <= 0) {
    throw new Error('SequenceNumber inválido')
  }
  execPowerShell(
    `Get-ComputerRestorePoint | Where-Object { $_.SequenceNumber -eq ${Math.floor(seq)} } | Restore-Computer -Confirm:$false -Force`
  )
}
