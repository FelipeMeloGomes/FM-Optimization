import {
  Clock,
  Cpu,
  Eraser,
  Gauge,
  Home,
  MousePointerClick,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Smartphone,
  Wifi,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoUrl from '../assets/logo.svg';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/tweaks', icon: Gauge, label: 'Ajustes' },
  { to: '/utilities', icon: Wrench, label: 'Utilitários' },
  { to: '/cleaner', icon: Eraser, label: 'Limpeza' },
  { to: '/rede', icon: Wifi, label: 'Rede' },
  { to: '/input-lag', icon: MousePointerClick, label: 'Input Lag' },
  { to: '/cpu', icon: Cpu, label: 'Processador' },
  { to: '/apps', icon: Smartphone, label: 'Aplicativos' },
] as const;

const systemItems = [
  { to: '/restore-points', icon: Shield, label: 'Restauração' },
  { to: '/history', icon: Clock, label: 'Histórico' },
] as const;

const bottomItems = [{ to: '/settings', icon: Settings, label: 'Configurações' }] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col gap-2 border-r border-border bg-sidebar-background px-3 py-4 transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-48'
      )}
    >
      <div className={cn('mb-4 flex items-center', collapsed ? 'justify-center' : 'justify-start')}>
        <img
          src={logoUrl}
          alt="FM Optimize"
          className={cn(
            'object-contain drop-shadow-[0_0_6px_rgba(0,68,255,0.6)] transition-all duration-300',
            collapsed ? 'size-8' : 'size-10'
          )}
        />
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'size-9 justify-center px-0 gap-0'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <item.icon
                  className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
        <div className="my-2 border-t border-border" />
        {systemItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'size-9 justify-center px-0 gap-0'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <item.icon
                  className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto" />
      <nav className="flex flex-col gap-1">
        <div className="my-2 border-t border-border" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'size-9 justify-center px-0 gap-0'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <item.icon
                  className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          'mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
          collapsed && 'size-9 justify-center px-0 gap-0'
        )}
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          Recolher
        </span>
      </button>
    </aside>
  );
}
