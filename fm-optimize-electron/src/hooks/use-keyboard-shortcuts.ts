import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_ROUTES = ['/', '/tweaks', '/cpu', '/cleaner', '/rede', '/input-lag', '/utilities', '/apps', '/restore-points'];

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (PAGE_ROUTES[index]) navigate(PAGE_ROUTES[index]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
