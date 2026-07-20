import type { RefObject } from 'react';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function useSmoothScroll(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lenis = new Lenis({
      wrapper: el,
      content: el.firstElementChild ?? undefined,
      lerp: 0.1,
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [containerRef]);
}
