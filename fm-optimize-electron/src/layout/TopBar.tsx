import { useLocation } from 'react-router-dom'
import { SearchInput } from '../components/SearchInput'

const routeTitles: Record<string, string> = {
  '/': 'Painel',
  '/tweaks': 'Ajustes / Desempenho',
  '/utilities': 'Utilitários',
  '/cleaner': 'Limpeza',
  '/restore-points': 'Pontos de Restauração',
  '/history': 'Histórico de Execução',
  '/rede': 'Rede',
  '/input-lag': 'Input Lag',
  '/cpu': 'Processador',
  '/apps': 'Apps e Privacidade',
  '/settings': 'Configurações'
}

export function TopBar() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'FM Optimize'
  const showSearch = !['/', '/restore-points', '/history', '/settings'].includes(location.pathname)

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {showSearch && <SearchInput />}
    </header>
  )
}