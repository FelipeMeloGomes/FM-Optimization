import { Cpu, Monitor, MemoryStick, HardDrive, Clock, Activity } from 'lucide-react'
import { useSystemContext } from '../contexts/SystemContext'
import { DashboardWidget } from '../components/DashboardWidget'
import { Button, Skeleton } from '../components/ui'

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

export default function DashboardPage() {
  const { state, refresh } = useSystemContext()

  if (state.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar informações do sistema</p>
        <p className="text-xs text-destructive">{state.error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const { data } = state

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={refresh}>Atualizar</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardWidget
          icon={Cpu}
          label="CPU"
          value={data.cpu.model}
          detail={`${data.cpu.cores} núcleos · ${data.cpu.usage}% uso`}
        />
        <DashboardWidget
          icon={Monitor}
          label="GPU"
          value={data.gpu.name}
          detail={`${data.gpu.vram} VRAM`}
        />
        <DashboardWidget
          icon={MemoryStick}
          label="RAM"
          value={data.memory.total}
          detail={`${data.memory.type} · ${data.memory.slots} slots · ${data.memory.used} em uso`}
        />
        <DashboardWidget
          icon={Activity}
          label="Sistema"
          value={data.os.name}
          detail={`Build ${data.os.build} · ${data.os.edition}`}
        />
        {data.drives.map((drive) => (
          <DashboardWidget
            key={drive.letter}
            icon={HardDrive}
            label={`Disco ${drive.letter}`}
            value={drive.size}
            detail={`${drive.free} livres · ${drive.type}`}
            progress={drive.usedPercent}
          />
        ))}
        <DashboardWidget
          icon={Clock}
          label="Tempo de Atividade"
          value={formatUptime(data.uptime)}
        />
      </div>
    </div>
  )
}
