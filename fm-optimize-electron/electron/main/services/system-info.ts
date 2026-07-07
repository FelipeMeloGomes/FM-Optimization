import { cpus, totalmem, freemem, uptime, version, release, arch, type } from 'os'
import { execSync } from 'child_process'
import type { DashboardData, CpuInfo, GpuInfo, MemoryInfo, OsInfo, StorageDrive } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    const buf = Buffer.from(script, 'utf16le')
    return execSync(`powershell.exe -NoProfile -EncodedCommand ${buf.toString('base64')}`, {
      encoding: 'utf-8',
      timeout: 10000
    }).trim()
  } catch (e: unknown) {
    console.error('PowerShell execution failed:', e instanceof Error ? e.message : String(e))
    return ''
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function getCpuInfo(): CpuInfo {
  const cpu = cpus()[0]
  const model = cpu?.model || 'Unknown'
  const output = execPowerShell(
    '(Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average'
  )
  const usage = output ? Math.round(parseFloat(output)) : 0

  return {
    model,
    cores: cpus().length,
    logicalProcessors: cpus().length,
    architecture: arch(),
    usage
  }
}

function getGpuInfo(): GpuInfo {
  const output = execPowerShell(
    'Get-CimInstance Win32_VideoController | Select-Object -First 1 Name,@{N="VRAM";E={$_.AdapterRAM/1GB}},DriverVersion | ConvertTo-Json -Depth 3'
  )
  if (!output) return { name: 'N/A', vram: 'N/A', driverVersion: 'N/A' }

  try {
    const parsed = JSON.parse(output)
    return {
      name: parsed.Name || 'N/A',
      vram: parsed.VRAM ? `${Math.round(parsed.VRAM)} GB` : 'N/A',
      driverVersion: parsed.DriverVersion || 'N/A'
    }
  } catch {
    return { name: 'N/A', vram: 'N/A', driverVersion: 'N/A' }
  }
}

function getMemoryInfo(): MemoryInfo {
  const total = totalmem()
  const free = freemem()
  const used = total - free

  const typeOutput = execPowerShell(
    '(Get-CimInstance Win32_PhysicalMemory | Select-Object -First 1).SMBIOSMemoryType'
  )
  const typeMap: Record<string, string> = {
    '20': 'DDR', '21': 'DDR2', '24': 'DDR3', '26': 'DDR4', '34': 'DDR5'
  }
  const memType = typeMap[typeOutput.trim()] || 'Unknown'

  const slotsOutput = execPowerShell(
    '(Get-CimInstance Win32_PhysicalMemory | Measure-Object).Count'
  )
  const slots = slotsOutput ? parseInt(slotsOutput.trim()) : 0

  return {
    total: formatBytes(total),
    used: formatBytes(used),
    free: formatBytes(free),
    type: memType,
    slots
  }
}

function getOsInfo(): OsInfo {
  const output = execPowerShell(
    'Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,InstallDate | ConvertTo-Json -Depth 3'
  )
  let name = `${type()} ${release()}`
  let build = release()
  let edition = version()
  let installDate = ''

  if (output) {
    try {
      const parsed = JSON.parse(output)
      if (parsed.Caption) name = parsed.Caption
      if (parsed.BuildNumber) build = parsed.BuildNumber
      if (parsed.Version) edition = parsed.Version
      if (parsed.InstallDate) installDate = parsed.InstallDate
    } catch { /* use defaults */ }
  }

  return { name, version: release(), build, edition, installDate }
}

interface RawDriveInfo {
  DeviceID?: string
  VolumeName?: string
  Size?: number
  Free?: number
  FileSystem?: string
}

function getStorageDrives(): StorageDrive[] {
  const output = execPowerShell(
    'Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID,VolumeName,@{N="Size";E={$_.Size/1GB}},@{N="Free";E={$_.FreeSpace/1GB}},FileSystem | ConvertTo-Json -Depth 3'
  )
  if (!output) return []

  try {
    const parsed = JSON.parse(output)
    const items: RawDriveInfo[] = Array.isArray(parsed) ? parsed : [parsed]
    return items.map((d) => {
      const size = d.Size || 0
      const free = d.Free || 0
      const usedPercent = size > 0 ? Math.round((size - free) / size * 100) : 0
      return {
        letter: d.DeviceID || '',
        label: d.VolumeName || '',
        size: d.Size ? `${Math.round(d.Size)} GB` : 'N/A',
        free: d.Free ? `${Math.round(d.Free)} GB` : 'N/A',
        usedPercent,
        type: d.FileSystem || ''
      }
    })
  } catch {
    return []
  }
}

export function getSystemInfo(): DashboardData {
  return {
    cpu: getCpuInfo(),
    gpu: getGpuInfo(),
    memory: getMemoryInfo(),
    os: getOsInfo(),
    drives: getStorageDrives(),
    uptime: Math.floor(uptime())
  }
}
