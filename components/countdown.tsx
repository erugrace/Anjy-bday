"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const UNITS = [
  {
    key: "days" as const,
    label: "Days",
    gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
    glow: "rgba(168,85,247,0.35)",
    border: "rgba(168,85,247,0.4)",
    textColor: "#c084fc",
  },
  {
    key: "hours" as const,
    label: "Hours",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.35)",
    border: "rgba(245,158,11,0.4)",
    textColor: "#fbbf24",
  },
  {
    key: "minutes" as const,
    label: "Mins",
    gradient: "linear-gradient(135deg, #f43f5e, #e11d48)",
    glow: "rgba(244,63,94,0.35)",
    border: "rgba(244,63,94,0.4)",
    textColor: "#fb7185",
  },
  {
    key: "seconds" as const,
    label: "Secs",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.35)",
    border: "rgba(16,185,129,0.4)",
    textColor: "#34d399",
  },
] as const

function FlipDigit({ value, glow, gradient, textColor }: {
  value: number
  glow: string
  gradient: string
  textColor: string
}) {
  const str = String(value).padStart(2, "0")

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      style={{
        width: "clamp(64px, 10vw, 96px)",
        height: "clamp(72px, 11vw, 108px)",
        background: "rgba(255,255,255,0.85)",
        boxShadow: `0 0 18px 2px ${glow}, 0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`,
        border: `1.5px solid rgba(255,255,255,0.6)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top gradient accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: gradient }}
      />

      {/* Number with flip animation — no position:absolute so flex centering works */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: "clamp(40px,6vw,60px)", width: "100%" }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={str}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-extrabold tabular-nums leading-none select-none"
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontFamily: "var(--font-syne)",
              color: "#1a1a2e",
              letterSpacing: "-0.02em",
              display: "block",
            }}
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Divider line (flip-clock style) */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "50%",
          height: "1px",
          background: `linear-gradient(to right, transparent, ${textColor}55, transparent)`,
        }}
      />

      {/* Bottom gradient glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${glow.replace("0.35", "0.08")}, transparent)`,
        }}
      />
    </div>
  )
}

function Separator({ glow }: { glow: string }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col gap-[clamp(5px,1vw,8px)] pb-5 shrink-0"
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: "clamp(5px,0.8vw,7px)",
            height: "clamp(5px,0.8vw,7px)",
            background: glow.replace("0.35", "0.7"),
            boxShadow: `0 0 6px 1px ${glow}`,
          }}
        />
      ))}
    </motion.div>
  )
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isToday, setIsToday] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      // WAT = UTC+1. All birthday logic is anchored to WAT, not the viewer's local zone.
      const WAT_OFFSET_MS = 60 * 60 * 1000 // +1 hour

      const nowUTC = Date.now()

      // Derive the current date components in WAT
      const nowWAT = new Date(nowUTC + WAT_OFFSET_MS)
      const watYear  = nowWAT.getUTCFullYear()
      const watMonth = nowWAT.getUTCMonth()  // 0-indexed
      const watDay   = nowWAT.getUTCDate()

      // Is it already May 16 in WAT?
      if (watMonth === 4 && watDay === 16) { setIsToday(true); return null }

      // Target: May 16 00:00:00 WAT → in UTC that is May 15 23:00:00 UTC
      let targetYear = watYear
      // If May 16 in WAT has already passed this year, aim for next year
      if (watMonth > 4 || (watMonth === 4 && watDay > 16)) targetYear++

      const targetUTC = Date.UTC(targetYear, 4, 16) - WAT_OFFSET_MS
      // = Date.UTC(targetYear, 4, 15, 23, 0, 0)

      const difference = targetUTC - nowUTC
      if (difference <= 0) { setIsToday(true); return null }

      // Calendar days remaining in WAT (today = May 15 → 1 day; today = May 14 → 2 days)
      const todayMidnightWAT_UTC  = Date.UTC(watYear,    watMonth, watDay) - WAT_OFFSET_MS
      const targetMidnightWAT_UTC = Date.UTC(targetYear, 4,        16)     - WAT_OFFSET_MS
      const calendarDays = Math.round(
        (targetMidnightWAT_UTC - todayMidnightWAT_UTC) / (1000 * 60 * 60 * 24)
      )

      return {
        days:    calendarDays,
        hours:   Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isToday) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block"
        >
          <span className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{"It's"}</span>{" "}
            <span style={{ color: "var(--charcoal)" }}>D-Day!</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2"
        >
          <span className="w-8 h-px bg-purple-300" />
          <span className="text-sm tracking-wide" style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}>
            The celebration begins 🎉
          </span>
          <span className="w-8 h-px bg-purple-300" />
        </motion.div>
      </motion.div>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="py-6 sm:py-8">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-5 sm:mb-7"
      >
        <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-purple-300" />
        <span
          className="text-xs sm:text-sm tracking-[0.22em] uppercase font-medium"
          style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}
        >
          Counting down to May 16th 🎂
        </span>
        <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-purple-300" />
      </motion.div>

      {/* Clock blocks */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-end justify-center gap-1 sm:gap-2"
      >
        {UNITS.map((unit, i) => (
          <div key={unit.key} className="flex items-end gap-1 sm:gap-2">
            {i > 0 && (
              <Separator glow={UNITS[i - 1].glow} />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.15 }}
              className="flex flex-col items-center gap-2"
            >
              <FlipDigit
                value={timeLeft[unit.key]}
                glow={unit.glow}
                gradient={unit.gradient}
                textColor={unit.textColor}
              />
              <span
                className="text-[9px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: unit.textColor, fontFamily: "var(--font-outfit)" }}
              >
                {timeLeft[unit.key] === 1
                  ? unit.label.replace(/s$/i, "")   // "Days" → "Day", "Hours" → "Hour" etc.
                  : unit.label}
              </span>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
