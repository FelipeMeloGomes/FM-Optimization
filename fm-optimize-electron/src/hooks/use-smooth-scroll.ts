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
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 1,
      autoRaf: true,
      anchors: true,
    });

    const observer = new MutationObserver(() => lenis.resize());
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, [containerRef]);
}
