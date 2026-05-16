"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="py-16 px-4 relative overflow-x-clip" style={{ isolation: "isolate" }}>
      {/* Cream background */}
      <div className="absolute inset-0 bg-[var(--cream)]" />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Decorative element */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--purple-light)]/30 mb-6 animate-pulse-soft">
            <Heart className="w-5 h-5 text-[var(--purple-soft)] fill-current" />
          </div>

          {/* Main text */}
          <p className="text-lg text-[var(--charcoal-light)] font-[var(--font-libre)] italic mb-2">
            Made with love for
          </p>
          <h3 className="text-3xl md:text-4xl font-[var(--font-syne)] font-bold text-[var(--charcoal)] mb-6">
            Anjolaoluwa
          </h3>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-[var(--border)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--purple-soft)]" />
            <div className="w-12 h-px bg-[var(--border)]" />
          </div>

          {/* Year */}
          <p className="text-[var(--muted-foreground)] text-sm font-[var(--font-outfit)]">
            {currentYear}
          </p>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l border-b border-[var(--border)] opacity-30" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r border-b border-[var(--border)] opacity-30" />
    </footer>
  )
}
