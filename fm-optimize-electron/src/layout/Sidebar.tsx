import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  Gauge,
  Wrench,
  Eraser,
  Shield,
  Globe,
  Smartphone,
  Settings,
  Clock,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Painel' },
  { to: '/tweaks', icon: Gauge, label: 'Ajustes' },
  { to: '/utilities', icon: Wrench, label: 'Utilitários' },
  { to: '/cleaner', icon: Eraser, label: 'Limpeza' },
  { to: '/restore-points', icon: Shield, label: 'Pontos de Restauração' },
  { to: '/history', icon: Clock, label: 'Histórico' },
  { to: '/dns', icon: Globe, label: 'DNS' },
  { to: '/apps', icon: Smartphone, label: 'Aplicativos' },
  { to: '/settings', icon: Settings, label: 'Configurações' }
] as const

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col gap-2 border-r border-border bg-sidebar-background px-3 py-4 transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-48'
      )}
    >
      <div className={cn('mb-4 text-primary text-xl font-bold', collapsed && 'text-center')}>
        {collapsed ? 'F' : 'FM'}
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-0'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          'mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-0'
        )}
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        {!collapsed && <span>Recolher</span>}
      </button>
    </aside>
  )
}
