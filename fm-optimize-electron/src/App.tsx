import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { ScriptProvider } from './contexts/ScriptContext'
import { SystemProvider } from './contexts/SystemContext'
import { RestorePointProvider } from './contexts/RestorePointContext'
import { HistoryProvider } from './contexts/HistoryContext'
import { LogProvider } from './contexts/LogContext'
import { SettingsProvider } from './contexts/SettingsContext'
import DashboardPage from './pages/DashboardPage'
import ScriptsPage from './pages/ScriptsPage'
import RestorePointsPage from './pages/RestorePointsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <SystemProvider>
        <ScriptProvider>
          <LogProvider>
            <RestorePointProvider>
              <HistoryProvider>
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
              </HistoryProvider>
            </RestorePointProvider>
          </LogProvider>
        </ScriptProvider>
      </SystemProvider>
    </SettingsProvider>
  )
}
