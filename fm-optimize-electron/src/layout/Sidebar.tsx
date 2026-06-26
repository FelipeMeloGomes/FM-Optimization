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
  Settings
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tweaks', icon: Gauge, label: 'Tweaks' },
  { to: '/utilities', icon: Wrench, label: 'Utilities' },
  { to: '/cleaner', icon: Eraser, label: 'Cleaner' },
  { to: '/restore-points', icon: Shield, label: 'Restore Points' },
  { to: '/dns', icon: Globe, label: 'DNS' },
  { to: '/apps', icon: Smartphone, label: 'Apps' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

export function Sidebar() {
  return (
    <aside className="flex w-48 flex-col gap-2 border-r border-border bg-sidebar-background px-3 py-4">
      <div className="mb-4 text-primary text-xl font-bold">FM</div>
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
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
