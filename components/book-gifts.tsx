"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback } from "react"
import { Download, BookOpen, Gift, Sparkles, Star, PartyPopper, Lock, Unlock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
interface Book {
  title: string
  author: string
  pdfUrl: string
  emoji: string
}

const books: Book[] = [
  {
    title: "A Good Name",
    author: "Yejide Kilanko",
    pdfUrl: "/_OceanofPDF.com_A_good_name_-_Yejide_Kilanko.pdf",
    emoji: "🌺",
  },
  {
    title: "The Middle Daughter",
    author: "Chika Unigwe",
    pdfUrl: "/_OceanofPDF.com_The_Middle_Daughter_-_Chika_Unigwe.pdf",
    emoji: "🌙",
  },
  {
    title: "The Mechanics of Yenagoa",
    author: "Michael Afenfia",
    pdfUrl: "/_OceanofPDF.com_The_Mechanics_of_Yenagoa_-_Michael_Afenfia.pdf",
    emoji: "⚡",
  },
  {
    title: "The Marriage Monitoring Aunties Association",
    author: "Ola Awonubi",
    pdfUrl: "/_OceanofPDF.com_The_Marriage_Monitoring_Aunties_Association_-_Ola_Awonubi.pdf",
    emoji: "💜",
  },
  {
    title: "Fine Boys",
    author: "Eghosa Imasuen",
    pdfUrl: "/_OceanofPDF.com_Fine_Boys_-_Eghosa_Imasuen.pdf",
    emoji: "👑",
  },
]

type GiftItem =
  | { type: "book"; book: Book; color: BoxColor }
  | { type: "empty"; message: string; sub: string; emoji: string; color: BoxColor }

interface BoxColor {
  from: string
  to: string
  ribbon: string
  glow: string
}

const BOX_COLORS: BoxColor[] = [
  { from: "#7c3aed", to: "#5b21b6", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(124,58,237,0.45)" },
  { from: "#d97706", to: "#92400e", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(217,119,6,0.45)" },
  { from: "#be123c", to: "#881337", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(190,18,60,0.45)" },
  { from: "#0e7490", to: "#164e63", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(14,116,144,0.45)" },
  { from: "#059669", to: "#065f46", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(5,150,105,0.45)" },
  { from: "#7e22ce", to: "#581c87", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(126,34,206,0.45)" },
  { from: "#c026d3", to: "#86198f", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(192,38,211,0.45)" },
  { from: "#b45309", to: "#78350f", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(180,83,9,0.45)" },
  { from: "#9333ea", to: "#6b21a8", ribbon: "rgba(255,255,255,0.35)", glow: "rgba(147,51,234,0.45)" },
]

const giftItems: GiftItem[] = [
  { type: "book",  book: books[0], color: BOX_COLORS[0] },
  { type: "empty", message: "Just pure love!", sub: "No book here, only blessings 🙏", emoji: "💜", color: BOX_COLORS[1] },
  { type: "book",  book: books[1], color: BOX_COLORS[2] },
  { type: "empty", message: "Glitter & vibes ✨", sub: "You're the real treasure", emoji: "✨", color: BOX_COLORS[3] },
  { type: "book",  book: books[2], color: BOX_COLORS[4] },
  { type: "empty", message: "Surprise! 🎉", sub: "The gift was friendship all along", emoji: "🎉", color: BOX_COLORS[5] },
  { type: "book",  book: books[3], color: BOX_COLORS[6] },
  { type: "empty", message: "Big birthday energy!", sub: "Go bestie, it's your birthday 🎂", emoji: "🎂", color: BOX_COLORS[7] },
  { type: "book",  book: books[4], color: BOX_COLORS[8] },
]

/* ─────────────────────────────────────────────
   Shared sparkle SVG
───────────────────────────────────────────── */
function SparkleIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Animated border button  (offsetPath beam)
───────────────────────────────────────────── */
function AnimatedBorderButton({
  children,
  onClick,
  className,
  radius = 14,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  radius?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px]",
        "border border-[var(--border)] bg-white/80 backdrop-blur-sm",
        "text-[var(--charcoal)] text-sm font-medium transition-colors hover:bg-white",
        "focus:outline-none",
        className
      )}
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      {/* Animated beam on the border */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] border-2 border-transparent",
          "[mask-clip:padding-box,border-box]",
          "[mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]",
          "[mask-composite:intersect]"
        )}
      >
        <motion.div
          className="via-[var(--purple-soft)] to-[var(--purple-soft)] absolute aspect-square bg-gradient-to-r from-transparent"
          animate={{ offsetDistance: ["0%", "100%"] }}
          style={{
            width: 22,
            offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
        />
      </div>
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────
   Rotating border button  (spinning conic-gradient)
───────────────────────────────────────────── */
function RotatingBorderButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex overflow-hidden rounded-2xl p-[2px]",
        "focus:outline-none",
        className
      )}
    >
      {/* Spinning gradient ring */}
      <span
        className={cn(
          "absolute inset-[-300%] animate-[spin_2.5s_linear_infinite]",
          "bg-[conic-gradient(from_90deg_at_50%_50%,var(--purple-soft)_0%,#fff_50%,var(--purple-soft)_100%)]"
        )}
      />
      {/* Inner content */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center gap-2.5 w-full px-7 py-3 rounded-[14px]",
          "bg-[var(--purple-rich)] text-white text-sm font-semibold backdrop-blur-sm",
          "transition-all hover:bg-[var(--purple-deep)]"
        )}
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {children}
      </span>
    </button>
  )
}

/* ─────────────────────────────────────────────
   Liquid glass button  (neumorphic inset shadows)
───────────────────────────────────────────── */
function LiquidGlassButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full",
        "bg-transparent text-[var(--charcoal-light)] text-sm font-medium",
        "transition-all hover:text-[var(--charcoal)]",
        "focus:outline-none",
        className
      )}
      style={{
        fontFamily: "var(--font-outfit)",
        boxShadow:
          "0 0 6px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 3px 3px 0.5px -3px rgba(0,0,0,0.9), inset -3px -3px 0.5px -3px rgba(0,0,0,0.85), inset 1px 1px 1px -0.5px rgba(0,0,0,0.6), inset -1px -1px 1px -0.5px rgba(0,0,0,0.6), inset 0 0 6px 6px rgba(0,0,0,0.12), inset 0 0 2px 2px rgba(0,0,0,0.06), 0 0 12px rgba(255,255,255,0.15)",
      }}
    >
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────
   Gate screen (shown before boxes are unlocked)
───────────────────────────────────────────── */
function GateScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <motion.div
      key="gate"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-8 py-8"
    >
      {/* Floating lock icon */}
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Glow ring around lock */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: "var(--purple-light)" }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
          style={{ backgroundColor: "var(--purple-rich)" }}
        >
          <Lock className="w-9 h-9 text-white" />
        </div>
        {/* Sparkles orbiting the lock */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={deg}
            animate={{ rotate: [deg, deg + 360] }}
            transition={{ duration: 8 + i * 0.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div style={{ transform: `translateY(-44px)` }}>
              <SparkleIcon size={i % 2 === 0 ? 12 : 8} className={i % 2 === 0 ? "text-yellow-400" : "text-purple-400"} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Text */}
      <div className="text-center max-w-sm">
        <h3
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
        >
          9 mystery boxes await you
        </h3>
        <p
          className="text-sm italic"
          style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}
        >
          Some hold treasures, some hold surprises — tap the button below to begin your reveal
        </p>
      </div>

      {/* Three buttons together */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {/* Main CTA — rotating border */}
        <RotatingBorderButton onClick={onUnlock} className="w-full">
          <Unlock className="w-4 h-4" />
          Open Your Gifts
        </RotatingBorderButton>

        {/* Secondary decorative row */}
        <div className="flex items-center gap-3 w-full justify-center">
          <AnimatedBorderButton className="flex-1 justify-center">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--purple-soft)" }} />
            5 books inside
          </AnimatedBorderButton>

          <LiquidGlassButton>
            <Zap className="w-3.5 h-3.5" />
            4 surprises
          </LiquidGlassButton>
        </div>
      </div>

      {/* Hint dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--purple-light)" }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Burst sparkles (on box reveal)
───────────────────────────────────────────── */
function BurstSparkles({ active }: { active: boolean }) {
  const positions = [
    { angle: 0, dist: 55 }, { angle: 45, dist: 60 }, { angle: 90, dist: 55 },
    { angle: 135, dist: 58 }, { angle: 180, dist: 55 }, { angle: 225, dist: 60 },
    { angle: 270, dist: 55 }, { angle: 315, dist: 58 },
  ]
  return (
    <AnimatePresence>
      {active &&
        positions.map((pos, i) => {
          const rad = (pos.angle * Math.PI) / 180
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: Math.cos(rad) * pos.dist,
                y: Math.sin(rad) * pos.dist,
                scale: [0, 1.2, 1, 0],
              }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 50 }}
            >
              <SparkleIcon
                size={i % 3 === 0 ? 16 : 10}
                className={i % 2 === 0 ? "text-yellow-400" : "text-purple-400"}
              />
            </motion.div>
          )
        })}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────
   Individual gift box
───────────────────────────────────────────── */
function GiftBox({ item, index, onReveal }: { item: GiftItem; index: number; onReveal: () => void }) {
  const [state, setState] = useState<"idle" | "shaking" | "opening" | "revealed">("idle")
  const [showBurst, setShowBurst] = useState(false)

  const handleClick = useCallback(() => {
    if (state !== "idle") return
    setState("shaking")
    setTimeout(() => {
      setState("opening")
      setTimeout(() => {
        setState("revealed")
        setShowBurst(true)
        onReveal()
        setTimeout(() => setShowBurst(false), 800)
      }, 500)
    }, 400)
  }, [state, onReveal])

  const { color } = item
  const isRevealed = state === "revealed"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, type: "spring", damping: 18 }}
      className="relative"
    >
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          /* ── Closed ── */
          <motion.div
            key="box"
            exit={{ scale: 0, opacity: 0, rotate: 15 }}
            transition={{ duration: 0.28 }}
            onClick={handleClick}
            className="relative cursor-pointer select-none"
            style={{ willChange: "transform" }}
          >
            {/* Hover glow */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.05 }}
              initial={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute -inset-3 rounded-3xl pointer-events-none z-0 blur-xl"
              style={{ backgroundColor: color.glow }}
            />

            {/* Shimmer sweep */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
              <motion.div
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: index * 0.28 }}
                className="absolute inset-y-0 w-1/3"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                  transform: "skewX(-12deg)",
                }}
              />
            </div>

            {/* Box body */}
            <motion.div
              animate={
                state === "shaking"
                  ? { rotate: [-4, 5, -6, 6, -3, 3, 0], scale: [1, 1.06, 0.97, 1.04, 1] }
                  : state === "opening"
                  ? { scale: [1, 1.12, 0.92] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="relative z-10 rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                aspectRatio: "1 / 1",
              }}
            >
              {/* Vertical ribbon */}
              <div
                className="absolute inset-y-0"
                style={{ left: "50%", transform: "translateX(-50%)", width: "21%", backgroundColor: color.ribbon }}
              />
              {/* Horizontal ribbon */}
              <div
                className="absolute inset-x-0"
                style={{ top: "50%", transform: "translateY(-50%)", height: "21%", backgroundColor: color.ribbon }}
              />

              {/* Lid */}
              <motion.div
                animate={
                  state === "opening"
                    ? { y: "-135%", rotate: -18, opacity: 0 }
                    : { y: "0%", rotate: 0, opacity: 1 }
                }
                transition={{ duration: 0.42, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 rounded-t-2xl z-10"
                style={{
                  height: "28%",
                  background: `linear-gradient(135deg, ${color.from}ee, ${color.to})`,
                  filter: "brightness(1.18)",
                }}
              >
                <div
                  className="absolute inset-y-0"
                  style={{ left: "50%", transform: "translateX(-50%)", width: "21%", backgroundColor: color.ribbon }}
                />
                {/* Bow */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color.ribbon, transform: "skew(-10deg)", opacity: 0.9 }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color.ribbon, transform: "skew(10deg)", opacity: 0.9 }} />
                </div>
              </motion.div>

              {/* Face */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-5">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.38 }}
                >
                  <Gift className="w-8 h-8 md:w-10 md:h-10 text-white opacity-80" />
                </motion.div>
                <span className="text-white/65 text-[10px] md:text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
                  tap to open
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ── Revealed ── */
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.45, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 17, stiffness: 200 }}
            className="relative rounded-2xl overflow-hidden shadow-xl"
            style={{ aspectRatio: "1 / 1" }}
          >
            <BurstSparkles active={showBurst} />

            {item.type === "book" ? (
              <div
                className="w-full h-full flex flex-col items-center justify-between p-3 md:p-4"
                style={{
                  background: `linear-gradient(135deg, ${color.from}20, ${color.to}45)`,
                  border: `1px solid ${color.from}50`,
                }}
              >
                <div className="text-2xl md:text-3xl pt-0.5">{item.book.emoji}</div>
                <div className="text-center flex-1 flex flex-col items-center justify-center px-1">
                  <div
                    className="text-[11px] md:text-xs font-bold leading-tight mb-1"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
                  >
                    {item.book.title}
                  </div>
                  <div
                    className="text-[9px] md:text-[10px] leading-tight"
                    style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}
                  >
                    {item.book.author}
                  </div>
                </div>
                <motion.a
                  href={item.book.pdfUrl}
                  download
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[10px] md:text-xs font-medium shadow-md"
                  style={{
                    background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  <Download className="w-3 h-3" />
                  Download
                </motion.a>
              </div>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
                style={{
                  background: `linear-gradient(135deg, ${color.from}20, ${color.to}45)`,
                  border: `1px solid ${color.from}50`,
                }}
              >
                <div className="text-3xl md:text-4xl">{item.emoji}</div>
                <div
                  className="text-xs md:text-sm font-semibold leading-tight"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
                >
                  {item.message}
                </div>
                <div
                  className="text-[9px] md:text-[10px] leading-snug"
                  style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}
                >
                  {item.sub}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main section
───────────────────────────────────────────── */
export function BookGifts() {
  const [unlocked, setUnlocked] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [allOpened, setAllOpened] = useState(false)

  const handleReveal = useCallback(() => {
    setRevealedCount((prev) => {
      const next = prev + 1
      if (next === giftItems.length) setTimeout(() => setAllOpened(true), 600)
      return next
    })
  }, [])

  return (
    <section id="surprises" className="py-20 md:py-32 px-4 relative overflow-x-clip" style={{ isolation: "isolate" }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: "var(--cream-dark)" }} />

      {/* Blobs — CSS animated */}
      <div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ backgroundColor: "color-mix(in oklch, var(--purple-light) 20%, transparent)" }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ backgroundColor: "color-mix(in oklch, var(--gold-soft) 20%, transparent)", animationDelay: "3s" }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span
            className="text-xs tracking-[0.3em] uppercase mb-4 block"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}
          >
            A special gift
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
          >
            Birthday{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--purple-deep), var(--purple-soft))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Surprises
            </span>
          </h2>
          <div
            className="w-24 h-px mx-auto my-5"
            style={{ background: "linear-gradient(to right, transparent, var(--purple-soft), transparent)" }}
          />
        </motion.div>

        {/* Gate → Grid transition */}
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <GateScreen key="gate" onUnlock={() => setUnlocked(true)} />
          ) : (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {/* Progress */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex gap-1.5">
                  {giftItems.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={
                        i < revealedCount
                          ? { scale: 1.15, backgroundColor: "var(--purple-soft)" }
                          : { scale: 1 }
                      }
                      transition={{ type: "spring", damping: 15 }}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "var(--purple-light)" }}
                    />
                  ))}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}
                >
                  {revealedCount}/{giftItems.length} opened
                </span>
              </div>

              {/* 3×3 grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {giftItems.map((item, index) => (
                  <GiftBox key={index} item={item} index={index} onReveal={handleReveal} />
                ))}
              </div>

              {/* Celebration */}
              <AnimatePresence>
                {allOpened && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="mt-10 rounded-2xl p-6 text-center relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, color-mix(in oklch, var(--purple-light) 30%, white), color-mix(in oklch, var(--gold-soft) 30%, white))",
                      border: "1px solid var(--purple-light)",
                    }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
                        transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
                        className="absolute pointer-events-none"
                        style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 20}%` }}
                      >
                        <SparkleIcon
                          size={i % 3 === 0 ? 18 : 12}
                          className={i % 2 === 0 ? "text-yellow-400" : "text-purple-500"}
                        />
                      </motion.div>
                    ))}
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <PartyPopper className="w-6 h-6" style={{ color: "var(--purple-rich)" }} />
                        <h3
                          className="text-xl md:text-2xl font-bold"
                          style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
                        >
                          All boxes opened! 🎉
                        </h3>
                        <PartyPopper className="w-6 h-6" style={{ color: "var(--gold)" }} />
                      </div>
                      <p
                        className="text-sm italic"
                        style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}
                      >
                        You found 5 books from incredible Nigerian authors — enjoy every page, Anjola! 💜
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <BookOpen className="w-4 h-4" style={{ color: "var(--purple-soft)" }} />
                        <span
                          className="text-xs tracking-wide"
                          style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}
                        >
                          Download each book from its revealed box
                        </span>
                        <Star className="w-4 h-4 fill-current" style={{ color: "var(--gold)" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint */}
              {!allOpened && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mt-6 text-xs italic"
                  style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-libre)" }}
                >
                  <Sparkles className="w-3 h-3 inline mr-1 mb-0.5" style={{ color: "var(--purple-soft)" }} />
                  5 boxes hold books · 4 hold surprises — good luck!
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
