import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { ScriptProvider } from './contexts/ScriptContext'
import { ScriptExecutionProvider } from './contexts/ScriptExecutionContext'
import { SystemProvider } from './contexts/SystemContext'
import { RestorePointProvider } from './contexts/RestorePointContext'
import { HistoryProvider } from './contexts/HistoryContext'
import { LogProvider } from './contexts/LogContext'
import { SettingsProvider } from './contexts/SettingsContext'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ScriptsPage = lazy(() => import('./pages/ScriptsPage'))
const RestorePointsPage = lazy(() => import('./pages/RestorePointsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <SystemProvider>
        <ScriptExecutionProvider>
          <ScriptProvider>
          <LogProvider>
            <RestorePointProvider>
              <HistoryProvider>
                <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/tweaks" element={<ScriptsPage category="Tweaks" />} />
                    <Route path="/utilities" element={<ScriptsPage category="Utilities" />} />
                    <Route path="/cleaner" element={<ScriptsPage category="Cleaner" />} />
                    <Route path="/restore-points" element={<RestorePointsPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/dns" element={<ScriptsPage category="DNS Manager" />} />
                    <Route path="/apps" element={<ScriptsPage category="Apps" />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
                </Suspense>
              </HistoryProvider>
            </RestorePointProvider>
          </LogProvider>
          </ScriptProvider>
        </ScriptExecutionProvider>
      </SystemProvider>
    </SettingsProvider>
  )
}


