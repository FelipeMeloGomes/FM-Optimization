import { useEffect, useRef } from 'react';

// Batman Arkham Knight silhouette — from batman.svg (viewBox 0 0 860 417)
const BATMAN_PATH = `M237.5 42.6 C223.2 45.2 193.3 55.8 175.8 64.6 C150.5 77.3 115.4 102.3 93.6 123.1 C67.1 148.4 48.7 176.3 38.2 207.0 C34.4 218.0 30.1 236.5 31.0 237.4 C31.3 237.6 36.7 236.5 43.0 234.9 C68.3 228.6 103.0 225.4 127.4 227.1 C179.3 230.7 209.2 247.1 219.5 277.5 C220.4 280.2 221.5 287.4 221.8 293.3 L222.5 304.1 C256.2 280.5 294.6 278.8 336.1 299.0 C354.0 307.8 368.1 317.8 383.8 332.9 C400.6 349.1 411.3 364.1 419.6 383.4 L424.3 394.3 C433.4 373.1 444.8 357.3 465.4 337.2 C490.8 312.5 519.9 296.1 546.8 291.4 C560.0 289.0 566.3 288.6 575.8 289.7 C595.0 291.9 606.9 296.3 623.2 307.0 C629.0 310.7 633.8 313.6 634.1 313.4 C634.3 313.1 633.7 308.4 632.7 302.8 C631.2 294.4 631.1 291.7 632.1 287.1 C636.5 266.1 653.7 251.9 685.6 242.7 C704.5 237.3 714.0 236.3 745.3 236.4 C776.6 236.4 786.1 237.5 810.2 243.9 C816.4 245.5 821.7 246.7 821.9 246.5 C822.7 245.8 820.2 229.0 818.2 220.9 C800.5 150.1 715.7 76.2 626.3 53.8 C620.0 52.2 613.0 50.6 610.8 50.2 L606.8 49.5 C616.5 60.3 618.7 63.4 622.4 71.2 C628.3 83.3 628.7 92.8 624.0 105.3 C616.6 124.8 591.4 143.6 558.0 154.6 C536.1 161.7 516.1 165.1 488.8 166.1 C466.6 166.9 467.0 167.1 464.1 156.5 C461.2 146.1 457.3 124.4 455.8 111.1 C454.4 98.5 450.8 78.7 449.8 78.1 C449.3 77.8 448.5 79.1 447.9 80.9 C447.3 82.6 443.1 93.9 438.5 105.9 L430.3 127.6 C423.7 110.8 418.3 98.6 417.3 98.6 C416.5 98.6 413.7 116.4 412.2 130.1 C410.0 150.6 407.8 162.6 403.4 176.6 L401.1 184.1 C374.5 184.6 342.0 180.0 318.9 172.4 C283.7 160.9 262.9 142.1 256.1 115.8 C254.0 107.9 253.9 96.8 255.8 92.3 C259.1 84.8 268.5 75.2 284.3 63.4 L287.1 61.4 C285.2 61.5 280.0 62.1 275.6 62.9 Z`;

const batPath = new Path2D(BATMAN_PATH);
const VB_W = 860;
const VB_H = 417;

interface FloatingBat {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  alpha: number;
  driftX: number;
  driftY: number;
  sineAmp: number;
  sineFreq: number;
  sinePhase: number;
  flapPhase: number;
  flapSpeed: number;
  rotation: number;
  rotTarget: number;
}

export function BatmanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const killedRef = useRef(false);
  const batsRef = useRef<FloatingBat[]>([]);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    killedRef.current = false; // Fix: reset flag on every mount (StrictMode double-mount)

    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvas.parentElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create offscreen sprite canvas NOW (DOM ready)
    const SPRITE_SIZE = 128;
    const SPRITE_HEIGHT = Math.round(SPRITE_SIZE * (VB_H / VB_W));
    const offscreen = document.createElement('canvas');
    offscreen.width = SPRITE_SIZE;
    offscreen.height = SPRITE_HEIGHT;
    const offCtx = offscreen.getContext('2d')!;
    const s = SPRITE_SIZE / VB_W;
    offCtx.fillStyle = '#c9a227';
    offCtx.scale(s, s);
    offCtx.fill(batPath);
    offscreenRef.current = offscreen;

    const BAT_COUNT = 30;

    const initBats = (w: number, h: number) => {
      const bats: FloatingBat[] = [];
      for (let i = 0; i < BAT_COUNT; i++) {
        const z = Math.random();
        const depthScale = 0.4 + z * 0.6;
        const alpha = 0.35 + Math.random() * 0.35; // 0.35 - 0.7
        bats.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          baseSize: (18 + Math.random() * 22) * depthScale,
          alpha,
          driftX: (0.2 + Math.random() * 0.4) * (0.4 + z * 0.6),
          driftY: (Math.random() - 0.5) * 0.3,
          sineAmp: 15 + Math.random() * 30,
          sineFreq: 0.001 + Math.random() * 0.003,
          sinePhase: Math.random() * Math.PI * 2,
          flapPhase: Math.random() * Math.PI * 2,
          flapSpeed: 0.03 + Math.random() * 0.04,
          rotation: 0,
          rotTarget: 0,
        });
      }
      batsRef.current = bats;
    };

    const resize = () => {
      const parent = canvas.parentElement!;
      const r = parent.getBoundingClientRect();

      if (r.width === 0 || r.height === 0) {
        requestAnimationFrame(resize);
        return;
      }
      const prevW = canvas.width;
      const prevH = canvas.height;
      canvas.width = r.width;
      canvas.height = r.height;
      if (prevW !== r.width || prevH !== r.height) {
        initBats(r.width, r.height);
      }
    };

    requestAnimationFrame(resize);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };
    window.addEventListener('resize', debouncedResize);

    const animate = () => {
      if (killedRef.current) return;
      const w = canvas.width;
      const h = canvas.height;
      const offscreen = offscreenRef.current;

      if (!w || !h || !offscreen) {
        requestAnimationFrame(animate);
        return;
      }

      try {
        ctx.clearRect(0, 0, w, h);

        const bats = batsRef.current;

        // Sort by z so far bats draw first (behind)
        bats.sort((a, b) => a.z - b.z);

        for (const bat of bats) {
          // --- Sine wave drift ---
          bat.sinePhase += bat.sineFreq * 16;
          bat.y += bat.driftY + Math.sin(bat.sinePhase) * bat.sineAmp * bat.sineFreq;
          bat.x += bat.driftX;

          // --- Rotation toward drift direction ---
          bat.rotTarget = Math.atan2(
            bat.driftY + Math.cos(bat.sinePhase) * bat.sineAmp * bat.sineFreq,
            bat.driftX
          );
          bat.rotation += (bat.rotTarget - bat.rotation) * 0.03;

          // --- Flap animation ---
          bat.flapPhase += bat.flapSpeed;

          // --- Wrap around ---
          if (bat.x < -60) bat.x = w + 60;
          if (bat.x > w + 60) bat.x = -60;
          if (bat.y < -60) bat.y = h + 60;
          if (bat.y > h + 60) bat.y = -60;

          // --- Edge fade (bordas da tela) - minimum 0.15 so never fully invisible ---
          const marginFade = 100;
          const fadeLeft = Math.max(0.15, Math.min(bat.x / marginFade, 1));
          const fadeRight = Math.max(0.15, Math.min((w - bat.x) / marginFade, 1));
          const fadeTop = Math.max(0.15, Math.min(bat.y / marginFade, 1));
          const fadeBottom = Math.max(0.15, Math.min((h - bat.y) / marginFade, 1));
          const edgeAlpha = Math.min(fadeLeft, fadeRight, fadeTop, fadeBottom);

          // --- Draw sprite ---
          const flapScale = 1 + Math.sin(bat.flapPhase) * 0.15;
          const drawSize = bat.baseSize * flapScale;
          const drawHeight = drawSize * (VB_H / VB_W);

          ctx.save();
          ctx.globalAlpha = bat.alpha * edgeAlpha;
          ctx.translate(bat.x, bat.y);
          ctx.rotate(bat.rotation);
          ctx.drawImage(offscreen, -drawSize / 2, -drawHeight / 2, drawSize, drawHeight);
          ctx.restore();
        }

        // --- Flocking: mild attraction to nearest neighbor ---
        for (const bat of bats) {
          let nearestDist = Infinity;
          let nearestX = 0;
          let nearestY = 0;
          for (const other of bats) {
            if (other === bat) continue;
            const dx = other.x - bat.x;
            const dy = other.y - bat.y;
            const dist = dx * dx + dy * dy;
            if (dist < nearestDist && dist < 250 * 250) {
              nearestDist = dist;
              nearestX = dx;
              nearestY = dy;
            }
          }
          if (nearestDist < Infinity) {
            const strength = 0.0005;
            bat.driftX += nearestX * strength;
            bat.driftY += nearestY * strength;
            const maxSpeed = 0.6 + bat.z * 0.4;
            const speed = Math.sqrt(bat.driftX ** 2 + bat.driftY ** 2);
            if (speed > maxSpeed) {
              bat.driftX = (bat.driftX / speed) * maxSpeed;
              bat.driftY = (bat.driftY / speed) * maxSpeed;
            }
          }
        }
      } catch (err) {
        console.error('[BatmanBackground] Animate error:', err);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      killedRef.current = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
}
