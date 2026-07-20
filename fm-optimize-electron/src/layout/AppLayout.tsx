import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CircuitBackground } from '../components/CircuitBackground';
import { useSmoothScroll } from '../hooks/use-smooth-scroll';
import { useUpdateToast } from '../hooks/use-update-toast';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';

export function AppLayout() {
  const mainRef = useRef<HTMLDivElement>(null);
  useSmoothScroll(mainRef);
  useUpdateToast();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Toaster
        richColors
        position="bottom-right"
        theme="system"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius)',
          },
        }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <header>
        <TitleBar />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <CircuitBackground />
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main ref={mainRef} id="main-content" className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
