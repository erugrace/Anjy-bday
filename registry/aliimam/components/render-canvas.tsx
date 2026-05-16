"use client"

import { useEffect, useRef, useCallback } from "react"

interface TrailNode {
  x: number
  y: number
  vx: number
  vy: number
}

export interface RenderCanvasProps {
  trails?: number
  size?: number
  friction?: number
  dampening?: number
  tension?: number
  lineWidth?: number
  colorHue?: number
  colorSaturation?: number
  colorLightness?: number
  opacity?: number
  enableColorCycle?: boolean
  colorCycleSpeed?: number
  colorCycleAmplitude?: number
  width?: number
  height?: number
  /** Fill the parent container (responsive). Ignores width/height when true. */
  fill?: boolean
  className?: string
}

export function RenderCanvas({
  trails = 80,
  size = 50,
  friction = 0.5,
  dampening = 0.025,
  tension = 0.99,
  lineWidth = 10,
  colorHue = 285,
  colorSaturation = 100,
  colorLightness = 50,
  opacity = 0.025,
  enableColorCycle = true,
  colorCycleSpeed = 0.0015,
  colorCycleAmplitude = 85,
  width = 700,
  height = 650,
  fill = false,
  className = "",
}: RenderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Shared mouse state — never reset between renders
  const mouseRef = useRef({ x: 0, y: 0, hasRealPos: false })
  const rafRef = useRef<number | undefined>(undefined)
  const frameRef = useRef(0)

  // Trail data lives outside React state so it's never recreated on re-render
  const nodesRef = useRef<TrailNode[][]>([])

  const buildTrails = useCallback(
    (cx: number, cy: number) => {
      nodesRef.current = Array.from({ length: trails }, () =>
        Array.from({ length: size }, () => ({ x: cx, y: cy, vx: 0, vy: 0 }))
      )
    },
    [trails, size]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // ── Dimensions ────────────────────────────────────────────────────
    const applySize = () => {
      const newW = fill ? wrapper.clientWidth || window.innerWidth : width
      const newH = fill ? wrapper.clientHeight || window.innerHeight : height
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW
        canvas.height = newH
        // Only init nodes on first mount (hasRealPos = false means cursor unknown)
        if (!mouseRef.current.hasRealPos) {
          mouseRef.current.x = newW / 2
          mouseRef.current.y = newH / 2
          buildTrails(newW / 2, newH / 2)
        }
      }
    }

    applySize()

    let resizeObs: ResizeObserver | null = null
    if (fill) {
      resizeObs = new ResizeObserver(applySize)
      resizeObs.observe(wrapper)
      window.addEventListener("resize", applySize, { passive: true })
    }

    // ── Mouse / Touch (global) ─────────────────────────────────────────
    // For fill canvases covering the viewport, clientX/Y == canvas coords.
    // For fixed-size canvases we scale by the CSS/canvas pixel ratio.
    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      if (fill) {
        return { x: clientX, y: clientY }
      }
      const sx = canvas.width / (rect.width || canvas.width)
      const sy = canvas.height / (rect.height || canvas.height)
      return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy }
    }

    const onMouseMove = (e: MouseEvent) => {
      const p = toCanvasCoords(e.clientX, e.clientY)
      mouseRef.current = { ...p, hasRealPos: true }
    }
    const onTouchMove = (e: TouchEvent) => {
      const p = toCanvasCoords(e.touches[0].clientX, e.touches[0].clientY)
      mouseRef.current = { ...p, hasRealPos: true }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })

    // ── Animation loop ─────────────────────────────────────────────────
    const draw = () => {
      frameRef.current++
      const t = frameRef.current
      const w = canvas.width
      const h = canvas.height
      const mouse = mouseRef.current

      // If no real cursor position yet, gently orbit canvas center
      const tx = mouse.hasRealPos ? mouse.x : w / 2 + Math.cos(t * 0.0035) * w * 0.1
      const ty = mouse.hasRealPos ? mouse.y : h / 2 + Math.sin(t * 0.0028) * h * 0.08

      ctx.clearRect(0, 0, w, h)

      const nodes = nodesRef.current
      if (!nodes.length) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      for (let i = 0; i < nodes.length; i++) {
        const line = nodes[i]

        // Head → cursor
        line[0].vx += (tx - line[0].x) * dampening
        line[0].vy += (ty - line[0].y) * dampening
        line[0].vx *= friction
        line[0].vy *= friction
        line[0].x += line[0].vx
        line[0].y += line[0].vy

        // Each node → previous (spring chain)
        for (let j = 1; j < line.length; j++) {
          line[j].vx += (line[j - 1].x - line[j].x) * tension
          line[j].vy += (line[j - 1].y - line[j].y) * tension
          line[j].vx *= friction
          line[j].vy *= friction
          line[j].x += line[j].vx
          line[j].y += line[j].vy
        }

        const hue = enableColorCycle
          ? colorHue + Math.sin(t * colorCycleSpeed + (i / nodes.length) * Math.PI * 2) * colorCycleAmplitude
          : colorHue

        ctx.beginPath()
        ctx.moveTo(line[0].x, line[0].y)
        for (let j = 1; j < line.length - 1; j++) {
          ctx.quadraticCurveTo(
            line[j].x, line[j].y,
            (line[j].x + line[j + 1].x) * 0.5,
            (line[j].y + line[j + 1].y) * 0.5
          )
        }
        ctx.lineTo(line[line.length - 1].x, line[line.length - 1].y)
        ctx.strokeStyle = `hsla(${hue},${colorSaturation}%,${colorLightness}%,${opacity})`
        ctx.lineWidth = lineWidth
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      resizeObs?.disconnect()
      if (fill) window.removeEventListener("resize", applySize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trails, size, friction, dampening, tension, lineWidth, colorHue,
      colorSaturation, colorLightness, opacity, enableColorCycle,
      colorCycleSpeed, colorCycleAmplitude, width, height, fill, buildTrails])

  return (
    <div ref={wrapperRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block", willChange: "transform" }}
      />
    </div>
  )
}
