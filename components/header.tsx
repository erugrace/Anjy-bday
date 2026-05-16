"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Memories", href: "#memories" },
  { label: "Wishes", href: "#wishes" },
  { label: "Surprises", href: "#surprises" },
]

const TEASE_STEPS = [
  { message: "Not just yet... 😏", section: null },
  { message: "Let me take you somewhere first 👀", section: "#memories" },
  { message: "Oh you're still clicking? Getting warmer 🔥", section: "#wishes" },
  { message: "Okay FINE! Here you go bestie 🎁", section: "#surprises" },
]

function SparkleIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
    </svg>
  )
}

interface HeaderProps {
  gameComplete: boolean
}

export function Header({ gameComplete }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [teaseTry, setTeaseTry] = useState(0)
  const [teaseMsg, setTeaseMsg] = useState("")
  const [showTeaseMsg, setShowTeaseMsg] = useState(false)
  const [giftShaking, setGiftShaking] = useState(false)
  const teaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track scroll for glass background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Track active section with IntersectionObserver
  useEffect(() => {
    if (!gameComplete) return
    const sections = ["hero", "memories", "wishes", "surprises"]
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: "-40% 0px -50% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [gameComplete])

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleGiftClick = useCallback(() => {
    if (teaseTimerRef.current) clearTimeout(teaseTimerRef.current)

    const step = TEASE_STEPS[Math.min(teaseTry, TEASE_STEPS.length - 1)]
    setTeaseMsg(step.message)
    setShowTeaseMsg(true)
    setTeaseTry((t) => Math.min(t + 1, TEASE_STEPS.length - 1))

    if (!step.section) {
      // Shake the button
      setGiftShaking(true)
      setTimeout(() => setGiftShaking(false), 600)
    } else {
      // Scroll somewhere
      setTimeout(() => scrollTo(step.section!), 200)
    }

    teaseTimerRef.current = setTimeout(() => setShowTeaseMsg(false), 2500)
  }, [teaseTry, scrollTo])

  if (!gameComplete) return null

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-[var(--border)]/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => scrollTo("#hero")}
          className="flex items-center gap-2 focus:outline-none shrink-0"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            className="text-base sm:text-lg"
          >
            ✨
          </motion.span>
          <span
            className="text-base sm:text-lg font-bold"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
          >
            Anjola
          </span>
          <span
            className="hidden xs:inline text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{
              background: "linear-gradient(135deg, var(--purple-light), var(--purple-soft))",
              color: "var(--purple-deep)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            19
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none",
                activeSection === item.href.replace("#", "")
                  ? "text-[var(--purple-rich)]"
                  : "text-[var(--charcoal-light)] hover:text-[var(--charcoal)]"
              )}
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {item.label}
              {activeSection === item.href.replace("#", "") && (
                <motion.div
                  layoutId="nav-indicator"
                  className="h-0.5 mt-0.5 rounded-full"
                  style={{ background: "var(--purple-soft)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Gift button — the showstopper */}
        <div className="relative shrink-0">
          <motion.button
            onClick={handleGiftClick}
            animate={
              giftShaking
                ? { x: [-6, 6, -8, 8, -5, 5, 0], rotate: [-8, 8, -10, 10, -5, 5, 0] }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="relative inline-flex overflow-hidden rounded-xl sm:rounded-2xl p-[2px] focus:outline-none animate-bounce-gift"
            style={{ willChange: "transform" }}
          >
            {/* Spinning conic ring */}
            <span
              className="absolute inset-[-300%] animate-[spin_2.2s_linear_infinite]"
              style={{
                background:
                  "conic-gradient(from 90deg at 50% 50%, #d4af37 0%, #ffffff 40%, #9b59b6 70%, #d4af37 100%)",
              }}
            />
            {/* Inner content */}
            <span
              className={cn(
                "relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] sm:rounded-[14px]",
                "text-white text-xs sm:text-sm font-semibold animate-glow-pulse"
              )}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                fontFamily: "var(--font-syne)",
              }}
            >
              <motion.span
                animate={{ rotate: [-8, 8, -8], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                🎁
              </motion.span>
              <span className="hidden xs:inline">Surprises</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              >
                <SparkleIcon size={10} />
              </motion.div>
            </span>
          </motion.button>

          {/* Orbiting sparkle dots */}
          {[0, 120, 240].map((deg, i) => (
            <motion.div
              key={deg}
              animate={{ rotate: [deg, deg + 360] }}
              transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: -1 }}
            >
              <div style={{ transform: "translateY(-28px)" }}>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i % 2 === 0 ? "#d4af37" : "#c084fc" }}
                />
              </div>
            </motion.div>
          ))}

          {/* Tease tooltip */}
          <AnimatePresence>
            {showTeaseMsg && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute top-full right-0 mt-3 z-50 whitespace-nowrap max-w-[200px] sm:max-w-xs"
              >
                <div
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white shadow-xl text-center"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    fontFamily: "var(--font-outfit)",
                    boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                  }}
                >
                  {teaseMsg}
                </div>
                {/* Pointer */}
                <div
                  className="absolute -top-1.5 right-8 w-3 h-3 rotate-45"
                  style={{ background: "#7c3aed" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress line */}
      <motion.div
        className="h-[1.5px] origin-left"
        style={{
          background: "linear-gradient(90deg, var(--purple-soft), var(--gold), var(--purple-rich))",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </header>
  )
}
