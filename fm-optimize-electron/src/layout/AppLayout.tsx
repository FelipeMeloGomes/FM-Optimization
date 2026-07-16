import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar'
import { AppSidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CircuitBackground } from '../components/CircuitBackground'

export function AppLayout() {
  return (
    <SidebarProvider>
      <CircuitBackground />
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
