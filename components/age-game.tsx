"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import confetti from "canvas-confetti"
import { Sparkles, Star, Heart } from "lucide-react"

interface AgeGameProps {
  onComplete: () => void
}

interface AgeCardProps {
  age: number
  isCorrect: boolean
  onClick: () => void
  cursorPosition: { x: number; y: number }
  index: number
}

const cardThemes = [
  {
    gradient: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 60%, #a78bfa 100%)",
    glow: "0 0 40px rgba(167,139,250,0.55), 0 12px 40px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "rgba(167,139,250,0.5)",
    text: "#3b0764",
    shine: "rgba(255,255,255,0.45)",
  },
  {
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 60%, #fbbf24 100%)",
    glow: "0 0 40px rgba(251,191,36,0.55), 0 12px 40px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "rgba(251,191,36,0.5)",
    text: "#78350f",
    shine: "rgba(255,255,255,0.5)",
  },
  {
    gradient: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 60%, #f9a8d4 100%)",
    glow: "0 0 40px rgba(249,168,212,0.55), 0 12px 40px rgba(236,72,153,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "rgba(249,168,212,0.5)",
    text: "#831843",
    shine: "rgba(255,255,255,0.45)",
  },
  {
    gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)",
    glow: "0 0 40px rgba(147,197,253,0.55), 0 12px 40px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "rgba(147,197,253,0.5)",
    text: "#1e3a5f",
    shine: "rgba(255,255,255,0.45)",
  },
  {
    gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 60%, #6ee7b7 100%)",
    glow: "0 0 40px rgba(110,231,183,0.55), 0 12px 40px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "rgba(110,231,183,0.5)",
    text: "#064e3b",
    shine: "rgba(255,255,255,0.45)",
  },
]

function AgeCard({ age, isCorrect, onClick, cursorPosition, index }: AgeCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const physicsRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const cursorRef = useRef(cursorPosition)
  const isNearbyRef = useRef(false)
  const xMotion = useMotionValue(0)
  const yMotion = useMotionValue(0)
  const [isNearby, setIsNearby] = useState(false)

  const theme = cardThemes[index % cardThemes.length]

  // Keep cursor ref current without re-triggering the physics loop
  useEffect(() => {
    cursorRef.current = cursorPosition
  }, [cursorPosition])

  // Physics-based floating + cursor escape — runs at RAF speed
  useEffect(() => {
    let raf: number

    // Each card gets unique float parameters so they don't move in sync
    const PHASE_X = index * 1.45
    const PHASE_Y = index * 1.1
    const AMP_X = 9 + index * 3
    const AMP_Y = 11 + index * 2.5
    const SPEED_X = 0.27 + index * 0.038
    const SPEED_Y = 0.21 + index * 0.03

    const tick = () => {
      const t = Date.now() / 1000
      const p = physicsRef.current
      const cursor = cursorRef.current

      // Idle target: smooth sinusoidal drift
      const targetX = Math.sin(t * SPEED_X + PHASE_X) * AMP_X
      const targetY = Math.cos(t * SPEED_Y + PHASE_Y) * AMP_Y

      // Cursor repulsion force
      let fx = 0
      let fy = 0
      let nearby = false

      if (cardRef.current && !isCorrect && (cursor.x > 0 || cursor.y > 0)) {
        const rect = cardRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = cx - cursor.x
        const dy = cy - cursor.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ESCAPE_RADIUS = 160

        if (dist < ESCAPE_RADIUS && dist > 1) {
          nearby = true
          // Quadratic falloff: strong push when close, gentle when far
          const t2 = 1 - dist / ESCAPE_RADIUS
          const strength = t2 * t2 * 32
          fx = (dx / dist) * strength
          fy = (dy / dist) * strength
        }
      }

      // Spring force back toward idle target
      const spring = 0.033
      const sfx = (targetX - p.x) * spring
      const sfy = (targetY - p.y) * spring

      // Integrate with damping
      const damp = 0.875
      const newVx = (p.vx + sfx + fx) * damp
      const newVy = (p.vy + sfy + fy) * damp
      const newX = p.x + newVx
      const newY = p.y + newVy

      physicsRef.current = { x: newX, y: newY, vx: newVx, vy: newVy }

      // Update motion values directly — no React state re-render
      xMotion.set(newX)
      yMotion.set(newY)

      // Only re-render when nearby state actually flips
      if (nearby !== isNearbyRef.current) {
        isNearbyRef.current = nearby
        setIsNearby(nearby)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [index, isCorrect, xMotion, yMotion])

  const SIZE = "clamp(88px, 11vw, 124px)"

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      style={{
        x: xMotion,
        y: yMotion,
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        background: theme.gradient,
        boxShadow: theme.glow,
        border: `2px solid ${theme.border}`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "pointer",
        outline: "none",
      }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: 1,
        scale: isNearby && !isCorrect ? 0.88 : 1,
        rotate: isNearby && !isCorrect ? (index % 2 === 0 ? -10 : 10) : 0,
      }}
      transition={{
        opacity: { duration: 0.6, delay: index * 0.12 },
        scale: { type: "spring", stiffness: 320, damping: 22 },
        rotate: { type: "spring", stiffness: 320, damping: 22 },
      }}
      whileHover={isCorrect ? { scale: 1.12, transition: { type: "spring", stiffness: 300 } } : undefined}
      whileTap={isCorrect ? { scale: 0.96 } : undefined}
    >
      {/* Glossy inner shine — top quarter highlight */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "15%",
          right: "15%",
          height: "38%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 20%, ${theme.shine} 0%, transparent 80%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle inner ring */}
      <div
        style={{
          position: "absolute",
          inset: "5px",
          borderRadius: "50%",
          border: `1px solid rgba(255,255,255,0.35)`,
          pointerEvents: "none",
        }}
      />

      {/* Age number */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
          fontWeight: 900,
          color: theme.text,
          fontFamily: "var(--font-display, 'Syne', sans-serif)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textShadow: "0 2px 6px rgba(0,0,0,0.08)",
          userSelect: "none",
        }}
      >
        {age}
      </span>
    </motion.button>
  )
}

export function AgeGame({ onComplete }: AgeGameProps) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!hasInteracted) setHasInteracted(true)
    const pos =
      "touches" in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }
    setCursorPosition(pos)
  }, [hasInteracted])

  const handleCorrectAnswer = useCallback(() => {
    setShowSuccess(true)

    const duration = 2500
    const end = Date.now() + duration
    const colors = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#fbbf24", "#fef3c7"]

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors, gravity: 0.8 })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, gravity: 0.8 })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors })
    frame()

    setTimeout(() => onComplete(), 2200)
  }, [onComplete])

  const ages = [16, 17, 18, 19, 20]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      {/* Cream background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--cream)] via-white to-[var(--cream)]" />

      {/* Ambient blobs — CSS animated, above canvas */}
      <div className="absolute top-16 right-16 w-72 h-72 rounded-full bg-[var(--purple-light)]/20 blur-3xl pointer-events-none animate-blob z-[2]" />
      <div className="absolute bottom-24 left-16 w-80 h-80 rounded-full bg-[var(--gold-soft)]/20 blur-3xl pointer-events-none animate-blob z-[2]" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-[var(--purple-soft)]/10 blur-3xl pointer-events-none animate-blob z-[2]" style={{ animationDelay: "1.5s" }} />

      {/* Floating icons */}
      <motion.div
        animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-24 left-24 text-[var(--purple-light)] z-[3]"
      >
        <Star className="w-5 h-5 fill-current opacity-40" />
      </motion.div>
      <motion.div
        animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-32 right-32 text-[var(--gold)] z-[3]"
      >
        <Sparkles className="w-6 h-6 opacity-50" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        className="absolute top-1/3 right-24 text-[var(--purple-soft)] z-[3]"
      >
        <Heart className="w-4 h-4 fill-current opacity-30" />
      </motion.div>

      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="relative z-[10] flex flex-col items-center px-6"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <div className="w-10 h-px bg-[var(--border)]" />
                <span className="text-xs tracking-[0.25em] uppercase text-[var(--muted-foreground)] font-[var(--font-outfit)]">
                  A birthday question
                </span>
                <div className="w-10 h-px bg-[var(--border)]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[var(--charcoal)] font-[var(--font-syne)] font-bold leading-tight"
              >
                How old is
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-2"
              >
                <span className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-[var(--font-libre)] italic text-[var(--purple-rich)]">
                  Anjola
                </span>
                <span className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[var(--charcoal)] font-[var(--font-syne)] font-bold">
                  ?
                </span>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mt-8 h-px w-40 mx-auto bg-gradient-to-r from-transparent via-[var(--purple-soft)] to-transparent"
              />
            </motion.div>

            {/* Age orbs — wide gap so the floating looks natural */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-10 max-w-2xl">
              {ages.map((age, index) => (
                <AgeCard
                  key={age}
                  age={age}
                  isCorrect={age === 19}
                  onClick={age === 19 ? handleCorrectAnswer : () => {}}
                  cursorPosition={cursorPosition}
                  index={index}
                />
              ))}
            </div>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: hasInteracted ? 0.6 : 0 }}
              transition={{ delay: 0.5 }}
              className="mt-14 text-sm text-[var(--muted-foreground)] italic font-[var(--font-libre)]"
            >
              psst… some answers are shy
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-[10] text-center px-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="mb-6"
            >
              <span className="text-9xl md:text-[10rem] font-[var(--font-syne)] font-extrabold text-[var(--purple-rich)]">
                19
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="w-8 h-px bg-[var(--gold)]" />
              <p className="text-xl md:text-2xl text-[var(--charcoal-light)] font-[var(--font-libre)] italic">
                You got it
              </p>
              <div className="w-8 h-px bg-[var(--gold)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner decorations */}
      <div className="hidden sm:block absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-[var(--border)] opacity-20" />
      <div className="hidden sm:block absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-[var(--border)] opacity-20" />
      <div className="hidden sm:block absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-[var(--border)] opacity-20" />
      <div className="hidden sm:block absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-[var(--border)] opacity-20" />

      {/* Footer accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
      >
        <div className="w-6 h-px bg-[var(--border)]" />
        <div className="w-2 h-2 rounded-full bg-[var(--purple-soft)]" />
        <div className="w-6 h-px bg-[var(--border)]" />
      </motion.div>
    </div>
  )
}
