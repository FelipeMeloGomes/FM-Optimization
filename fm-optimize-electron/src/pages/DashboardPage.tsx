import {
  Activity,
  Clock,
  Cpu,
  Gauge,
  HardDrive,
  Loader2,
  MemoryStick,
  Monitor,
  Shield,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { DashboardWidget } from '../components/DashboardWidget';
import { Button, Skeleton } from '../components/ui';
import { useSystemContext } from '../contexts/SystemContext';
import { cn } from '../lib/utils';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getCpuStatus(usage: number): 'good' | 'warning' | 'danger' {
  if (usage < 50) return 'good';
  if (usage < 80) return 'warning';
  return 'danger';
}

function getMemoryStatus(usedPercent: number): 'good' | 'warning' | 'danger' {
  if (usedPercent < 60) return 'good';
  if (usedPercent < 85) return 'warning';
  return 'danger';
}

function getDriveStatus(usedPercent: number): 'good' | 'warning' | 'danger' {
  if (usedPercent < 70) return 'good';
  if (usedPercent < 90) return 'warning';
  return 'danger';
}

function parseMemoryPercent(used: string, total: string): number {
  const usedNum = parseFloat(used.replace(/[^\d.]/g, ''));
  const totalNum = parseFloat(total.replace(/[^\d.]/g, ''));
  if (totalNum === 0) return 0;
  return Math.round((usedNum / totalNum) * 100);
}

export default function DashboardPage() {
  const { state, refreshing, refresh } = useSystemContext();

  const systemHealth = useMemo(() => {
    if (state.status !== 'success') return null;
    const { cpu, memory, drives } = state.data;
    const memPercent = parseMemoryPercent(memory.used, memory.total);
    const avgDriveUsage =
      drives.length > 0
        ? Math.round(drives.reduce((a, d) => a + d.usedPercent, 0) / drives.length)
        : 0;

    const scores = [
      cpu.usage < 80 ? 1 : 0.5,
      memPercent < 85 ? 1 : 0.5,
      avgDriveUsage < 90 ? 1 : 0.5,
    ];
    const health = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);

    return { health, memPercent, avgDriveUsage };
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, fixed count
              key={`skeleton-${i}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
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
    );
  }

  const { data } = state;
  const memPercent = systemHealth?.memPercent ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Gauge className="size-28 text-primary" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="size-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Painel do Sistema
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{data.os.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Build {data.os.build} · {data.os.edition}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {systemHealth && (
                <div className="text-right">
                  <div
                    className={cn(
                      'text-3xl font-bold tabular-nums',
                      systemHealth.health >= 80
                        ? 'text-emerald-400'
                        : systemHealth.health >= 50
                          ? 'text-amber-400'
                          : 'text-red-400'
                    )}
                  >
                    {systemHealth.health}%
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Saúde
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={refreshing}
                className="gap-1.5"
              >
                {refreshing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Activity className="size-3.5" />
                )}
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold text-foreground">Componentes</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardWidget
            icon={Cpu}
            label="CPU"
            value={data.cpu.model}
            detail={`${data.cpu.cores} núcleos · ${data.cpu.logicalProcessors} threads · ${data.cpu.usage}% uso`}
            progress={data.cpu.usage}
            status={getCpuStatus(data.cpu.usage)}
          />
          <DashboardWidget
            icon={Monitor}
            label="GPU"
            value={data.gpu.name}
            detail={`${data.gpu.vram} VRAM · ${data.gpu.usage}% uso`}
            progress={data.gpu.usage}
            status={getCpuStatus(data.gpu.usage)}
          />
          <DashboardWidget
            icon={MemoryStick}
            label="RAM"
            value={data.memory.total}
            detail={`${data.memory.type} · ${data.memory.frequency} · ${data.memory.slots} slots · ${data.memory.used} em uso`}
            progress={memPercent}
            status={getMemoryStatus(memPercent)}
          />
        </div>
      </div>

      {/* Storage Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Armazenamento</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.drives.map((drive) => (
            <DashboardWidget
              key={drive.letter}
              icon={HardDrive}
              label={`Disco ${drive.letter}`}
              value={drive.size}
              detail={`${drive.free} livres · ${drive.type}`}
              progress={drive.usedPercent}
              status={getDriveStatus(drive.usedPercent)}
            />
          ))}
        </div>
      </div>

      {/* System Info Footer */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>
              Atividade:{' '}
              <span className="font-medium text-foreground">{formatUptime(data.uptime)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Sistema Otimizado</span>
        </div>
      </div>
    </div>
  );
}
