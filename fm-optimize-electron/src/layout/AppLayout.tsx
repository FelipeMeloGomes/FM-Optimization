import { Outlet } from 'react-router-dom';
import { CircuitBackground } from '../components/CircuitBackground';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';

export function AppLayout() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <CircuitBackground />
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
