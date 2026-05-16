"use client"

import { motion } from "framer-motion"
import { ChevronDown, Sparkles } from "lucide-react"
import { Countdown } from "./countdown"
import { Typewriter } from "@/registry/aliimam/components/typewriter"

const NAME_WORDS = [
  "Anjolaoluwa",
  "The Birthday Queen",
  "19 & Glowing",
  "Simply Beautiful",
  "Our Anjy",
]

export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative" style={{ contain: "layout style" }}>
      {/* Warm cream base */}
      <div className="absolute inset-0" style={{ backgroundColor: "var(--cream)" }} />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 50%, color-mix(in oklch, var(--purple-light) 5%, transparent) 100%)",
        }}
      />

      {/* Ambient blobs — CSS animated for compositor performance */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ backgroundColor: "color-mix(in oklch, var(--purple-light) 15%, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ backgroundColor: "color-mix(in oklch, var(--gold-soft) 12%, transparent)", animationDelay: "3s" }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Top decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />
            <Sparkles className="w-4 h-4" style={{ color: "var(--purple-soft)" }} />
            <span
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}
            >
              Celebrating
            </span>
            <Sparkles className="w-4 h-4" style={{ color: "var(--purple-soft)" }} />
            <div className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />
          </motion.div>

          {/* Name — Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-2 leading-[1.1] min-h-[1.2em]"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
          >
            <Typewriter
              words={NAME_WORDS}
              typingSpeed={70}
              deletingSpeed={35}
              pauseTime={2400}
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold"
              cursorClassName="bg-[var(--purple-soft)]"
            />
          </motion.div>

          {/* 19 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div
              className="w-16 h-px"
              style={{ background: "linear-gradient(to right, transparent, var(--purple-soft))" }}
            />
            <span
              className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold"
              style={{
                background: "linear-gradient(135deg, var(--purple-deep), var(--purple-soft))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "var(--font-syne)",
              }}
            >
              19
            </span>
            <div
              className="w-16 h-px"
              style={{ background: "linear-gradient(to right, transparent, var(--purple-soft))" }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-lg md:text-xl italic max-w-md mx-auto mb-8"
            style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}
          >
            A little corner of the internet, made with love
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Countdown />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span
            className="text-xs mb-3 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Explore
          </span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div
        className="hidden sm:block absolute top-8 left-8 w-16 h-16 border-l border-t opacity-30"
        style={{ borderColor: "var(--border)" }}
      />
      <div
        className="hidden sm:block absolute top-8 right-8 w-16 h-16 border-r border-t opacity-30"
        style={{ borderColor: "var(--border)" }}
      />
      <div
        className="hidden sm:block absolute bottom-8 left-8 w-16 h-16 border-l border-b opacity-30"
        style={{ borderColor: "var(--border)" }}
      />
      <div
        className="hidden sm:block absolute bottom-8 right-8 w-16 h-16 border-r border-b opacity-30"
        style={{ borderColor: "var(--border)" }}
      />
    </section>
  )
}
