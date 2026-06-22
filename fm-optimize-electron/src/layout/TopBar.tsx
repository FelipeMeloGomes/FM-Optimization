import { useLocation } from 'react-router-dom'
import { SearchInput } from '../components/SearchInput'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tweaks': 'Tweaks / Desempenho',
  '/utilities': 'Utilities',
  '/cleaner': 'Cleaner',
  '/restore-points': 'Restore Points',
  '/dns': 'DNS Manager',
  '/apps': 'Apps & Privacy',
  '/settings': 'Settings'
}

export function TopBar() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'FM Optimize'
  const isDashboard = location.pathname === '/'

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <h1 className="text-lg font-semibold">{title}</h1>
      {!isDashboard && <SearchInput />}
    </header>
  )
}
