import { useLocation } from 'react-router-dom'
import { SearchInput } from '../components/SearchInput'

const routeTitles: Record<string, string> = {
  '/': 'Painel',
  '/tweaks': 'Ajustes / Desempenho',
  '/utilities': 'Utilitários',
  '/cleaner': 'Limpeza',
  '/restore-points': 'Pontos de Restauração',
  '/dns': 'Gerenciador de DNS',
  '/apps': 'Apps e Privacidade',
  '/settings': 'Configurações'
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
