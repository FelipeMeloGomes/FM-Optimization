import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Skeleton } from './components/ui'
import { ScriptProvider } from './contexts/ScriptContext'
import { ScriptExecutionProvider } from './contexts/ScriptExecutionContext'
import { SystemProvider } from './contexts/SystemContext'
import { RestorePointProvider } from './contexts/RestorePointContext'
import { HistoryProvider } from './contexts/HistoryContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { DnsProvider } from './contexts/DnsContext'
import { composeProviders } from './lib/compose-providers'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ScriptsPage = lazy(() => import('./pages/ScriptsPage'))
const RestorePointsPage = lazy(() => import('./pages/RestorePointsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const CleanerPage = lazy(() => import('./pages/CleanerPage'))
const CpuPage = lazy(() => import('./pages/CpuPage'))
const NetworkPage = lazy(() => import('./pages/NetworkPage'))
const InputLagPage = lazy(() => import('./pages/InputLagPage'))


function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Skeleton className="size-6 rounded-full" />
    </div>
  )
}

const AllProviders = composeProviders(
  SettingsProvider,
  SystemProvider,
  ScriptExecutionProvider,
  ScriptProvider,
  RestorePointProvider,
  HistoryProvider,
  DnsProvider
)

export default function App() {
  return (
    <AllProviders>
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tweaks" element={<ScriptsPage category="Tweaks" />} />
              <Route path="/utilities" element={<ScriptsPage category="Utilities" />} />
              <Route path="/cleaner" element={<CleanerPage />} />
              <Route path="/restore-points" element={<RestorePointsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/rede" element={<NetworkPage />} />
              <Route path="/apps" element={<ScriptsPage category="Apps" />} />
              <Route path="/input-lag" element={<InputLagPage />} />
              <Route path="/cpu" element={<CpuPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </AllProviders>
  )
}
