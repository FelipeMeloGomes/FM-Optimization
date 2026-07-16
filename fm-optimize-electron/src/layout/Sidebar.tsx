import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Gauge,
  Wrench,
  Eraser,
  Shield,
  Smartphone,
  Settings,
  Clock,
  Wifi,
  MousePointerClick,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from '../components/ui/sidebar'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Painel' },
  { to: '/tweaks', icon: Gauge, label: 'Ajustes' },
  { to: '/utilities', icon: Wrench, label: 'Utilitários' },
  { to: '/cleaner', icon: Eraser, label: 'Limpeza' },
  { to: '/rede', icon: Wifi, label: 'Rede' },
  { to: '/input-lag', icon: MousePointerClick, label: 'Input Lag' },
  { to: '/cpu', icon: Cpu, label: 'Processador' },
  { to: '/apps', icon: Smartphone, label: 'Aplicativos' }
] as const

const systemItems = [
  { to: '/restore-points', icon: Shield, label: 'Pontos de Restauração' },
  { to: '/history', icon: Clock, label: 'Histórico' }
] as const

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Configurações' }
] as const

function SidebarCollapseButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <SidebarMenuButton
      onClick={toggleSidebar}
      tooltip="Recolher"
      className="mt-auto text-muted-foreground"
    >
      <PanelLeftClose className="size-5 group-data-[state=collapsed]:hidden" />
      <PanelLeftOpen className="size-5 hidden group-data-[state=collapsed]:block" />
      <span>Recolher</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/" className={cn('justify-center', !collapsed && 'justify-start')}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  {collapsed ? 'F' : 'FM'}
                </div>
                {!collapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">FM Optimize</span>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <NavLink to={item.to} end={item.to === '/'}>
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          {systemItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <NavLink to={item.to}>
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarSeparator />
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <NavLink to={item.to}>
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarCollapseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
