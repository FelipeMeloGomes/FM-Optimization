import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}

interface Trace {
  start: Point
  end: Point
  progress: number
  speed: number
  hue: number
}

export function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tracesRef = useRef<Trace[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate PCB-like traces
    const traces: Trace[] = []
    const spacing = 80
    for (let x = 0; x < canvas.width + spacing; x += spacing) {
      for (let y = 0; y < canvas.height + spacing; y += spacing) {
        if (Math.random() > 0.3) continue
        const dir = Math.floor(Math.random() * 4)
        const start = { x, y }
        const end = dir === 0
          ? { x: x + spacing, y }
          : dir === 1
            ? { x: x - spacing, y }
            : dir === 2
              ? { x, y: y + spacing }
              : { x, y: y - spacing }
        traces.push({
          start,
          end,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.004,
          hue: 210 + Math.random() * 30
        })
      }
    }
    tracesRef.current = traces

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Animated data pulses
      for (const trace of traces) {
        trace.progress += trace.speed
        if (trace.progress > 1) trace.progress = 0

        const t = trace.progress
        const cx = trace.start.x + (trace.end.x - trace.start.x) * t
        const cy = trace.start.y + (trace.end.y - trace.start.y) * t

        ctx.beginPath()
        ctx.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${trace.hue}, 100%, 50%, ${0.3 + t * 0.4})`
        ctx.fill()

        // Trail
        const trailLen = 0.1
        const prevT = Math.max(0, t - trailLen)
        const px = trace.start.x + (trace.end.x - trace.start.x) * prevT
        const py = trace.start.y + (trace.end.y - trace.start.y) * prevT
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(cx, cy)
        ctx.strokeStyle = `hsla(${trace.hue}, 100%, 50%, ${0.1 + t * 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
