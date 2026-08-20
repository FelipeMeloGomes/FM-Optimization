import { useEffect, useRef } from 'react';

interface SmallBat {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  offsetAngle: number;
}

export function BatmanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const visibleRef = useRef(true);
  const timeRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvas.parentElement) return;

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const smallBats: SmallBat[] = [];
    for (let i = 0; i < 4; i++) {
      smallBats.push({
        angle: (Math.PI * 2 * i) / 4,
        radius: 120 + Math.random() * 80,
        speed: 0.0003 + Math.random() * 0.0002,
        size: 8 + Math.random() * 6,
        offsetAngle: Math.random() * Math.PI * 2,
      });
    }

    const drawBat = (cx: number, cy: number, size: number, opacity: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(size / 20, size / 20);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#c9a227';
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(-5, -6, -12, -4, -18, 0);
      ctx.bezierCurveTo(-14, -2, -10, -8, -6, -10);
      ctx.bezierCurveTo(-4, -6, -2, -3, 0, -2);
      ctx.bezierCurveTo(2, -3, 4, -6, 6, -10);
      ctx.bezierCurveTo(10, -8, 14, -2, 18, 0);
      ctx.bezierCurveTo(12, -4, 5, -6, 0, -2);
      ctx.lineTo(0, 4);
      ctx.bezierCurveTo(-3, 2, -5, 4, -4, 6);
      ctx.lineTo(0, 4);
      ctx.bezierCurveTo(5, 4, 3, 2, 0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      if (!visibleRef.current) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 16;
      const t = timeRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pulse = Math.sin(t / 1000 * Math.PI / 1.5) * 0.5 + 0.5;
      const mainScale = 1 + pulse * 0.05;
      const glowOpacity = 0.15 + pulse * 0.2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(mainScale, mainScale);
      ctx.shadowColor = 'rgba(201, 162, 39, 0.5)';
      ctx.shadowBlur = 30 + pulse * 20;
      drawBat(0, 0, 40, glowOpacity);
      ctx.restore();

      for (const bat of smallBats) {
        bat.angle += bat.speed;
        const x = centerX + Math.cos(bat.angle + bat.offsetAngle) * bat.radius;
        const y = centerY + Math.sin(bat.angle + bat.offsetAngle) * bat.radius * 0.6;
        const smallPulse = Math.sin(t / 800 + bat.offsetAngle) * 0.3 + 0.7;
        drawBat(x, y, bat.size, 0.08 * smallPulse);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
}
