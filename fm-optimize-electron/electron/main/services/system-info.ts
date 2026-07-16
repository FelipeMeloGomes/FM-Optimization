import { cpus, totalmem, freemem, uptime, version, release, arch, type } from 'os'
import { execSync } from 'child_process'
import type { DashboardData, CpuInfo, GpuInfo, MemoryInfo, OsInfo, StorageDrive } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    const fullScript = `$ProgressPreference = 'SilentlyContinue'\n${script}`
    const buf = Buffer.from(fullScript, 'utf16le')
    const raw = execSync(`powershell.exe -NoProfile -EncodedCommand ${buf.toString('base64')}`, {
      encoding: 'utf-8',
      timeout: 10000
    }).trim()
    return raw.replace(/#< CLIXML>.*?<\/Objs>/gs, '').trim()
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

  const cpuDetail = execPowerShell(
    'Get-CimInstance Win32_Processor | Select-Object -First 1 NumberOfCores,NumberOfLogicalProcessors | ConvertTo-Json'
  )

  let cores = cpus().length
  let logicalProcessors = cpus().length

  if (cpuDetail) {
    try {
      const parsed = JSON.parse(cpuDetail)
      if (parsed.NumberOfCores) cores = parsed.NumberOfCores
      if (parsed.NumberOfLogicalProcessors) logicalProcessors = parsed.NumberOfLogicalProcessors
    } catch { /* fallback to cpus().length */ }
  }

  const usageOutput = execPowerShell(
    '$cpu = Get-Counter "\\Processor(_Total)\\% Processor Time"; [math]::Round($cpu.CounterSamples.CookedValue)'
  )
  const usage = usageOutput ? parseInt(usageOutput.trim()) || 0 : 0

  return {
    model,
    cores,
    logicalProcessors,
    architecture: arch(),
    usage
  }
}

function getGpuInfo(): GpuInfo {
  const output = execPowerShell(
    'Get-CimInstance Win32_VideoController | Select-Object -First 1 Name,DriverVersion | ConvertTo-Json -Depth 3'
  )
  if (!output) return { name: 'N/A', vram: 'N/A', driverVersion: 'N/A', usage: 0 }

  let name = 'N/A'
  let driverVersion = 'N/A'

  try {
    const parsed = JSON.parse(output)
    name = parsed.Name || 'N/A'
    driverVersion = parsed.DriverVersion || 'N/A'
  } catch { /* use defaults */ }

  let vram = 'N/A'
  const nvidiaVram = execPowerShell(
    'nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>$null'
  )
  if (nvidiaVram) {
    const val = parseInt(nvidiaVram.trim())
    if (!isNaN(val)) vram = `${Math.round(val / 1024)} GB`
  } else {
    const adapterRam = execPowerShell(
      '(Get-CimInstance Win32_VideoController | Select-Object -First 1).AdapterRAM'
    )
    if (adapterRam) {
      const val = parseInt(adapterRam.trim())
      if (!isNaN(val) && val > 0) vram = `${Math.round(val / (1024 * 1024 * 1024))} GB`
    }
    if (vram === 'N/A') {
      const regVram = execPowerShell(
        "Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000' -Name 'HardwareInformation.MemorySize' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty 'HardwareInformation.MemorySize'"
      )
      if (regVram) {
        const val = parseInt(regVram.trim())
        if (!isNaN(val) && val > 0) vram = `${Math.round(val / (1024 * 1024 * 1024))} GB`
      }
    }
  }

  let usage = 0
  const nvidiaSmi = execPowerShell(
    'nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits 2>$null'
  )
  if (nvidiaSmi) {
    const val = parseInt(nvidiaSmi.trim())
    if (!isNaN(val)) usage = val
  } else {
    const gpuUsage = execPowerShell(
      "$counters = (Get-Counter '\\GPU Engine(*)\\Utilization Percentage').CounterSamples | Where-Object { $_.CookedValue -gt 0 }; $max = ($counters | Measure-Object -Property CookedValue -Maximum).Maximum; [math]::Round($max)"
    )
    if (gpuUsage) {
      const val = parseInt(gpuUsage.trim())
      if (!isNaN(val)) usage = val
    }
  }

  return { name, vram, driverVersion, usage }
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
