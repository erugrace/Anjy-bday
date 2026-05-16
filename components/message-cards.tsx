"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useRef } from "react"
import { Heart, Sparkles } from "lucide-react"

interface MessageCard {
  id: number
  name: string
  avatar: string
  message: string
}

const messages: MessageCard[] = [
  {
    id: 1,
    name: "Mummy",
    avatar: "/Mummy.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 2,
    name: "Daddy",
    avatar: "/Daddy.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 3,
    name: "Grandma",
    avatar: "/Grandma.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 4,
    name: "Grandpa",
    avatar: "/Grandpa.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 5,
    name: "Eniola",
    avatar: "/Eniola.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 6,
    name: "Teniola",
    avatar: "/Teniola.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 7,
    name: "Eunice",
    avatar: "/Eunice.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 8,
    name: "Grace",
    avatar: "/Grace.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 9,
    name: "Justina",
    avatar: "/Justina.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 10,
    name: "Monijesu",
    avatar: "/Monijesu.jpg",
    message: "Message coming soon 💜",
  },
  {
    id: 11,
    name: "Omotola",
    avatar: "/Omotola.jpg",
    message: "Message coming soon 💜",
  },
]

// Unique palette per card
const PALETTES = [
  { front: ["#ede9fe", "#c4b5fd"], back: ["#5b21b6", "#7c3aed"], text: "#3b0764" },
  { front: ["#fef3c7", "#fde68a"], back: ["#92400e", "#b45309"], text: "#78350f" },
  { front: ["#fce7f3", "#fbcfe8"], back: ["#831843", "#be185d"], text: "#500724" },
  { front: ["#d1fae5", "#a7f3d0"], back: ["#065f46", "#047857"], text: "#022c22" },
  { front: ["#dbeafe", "#bfdbfe"], back: ["#1e3a8a", "#1d4ed8"], text: "#172554" },
  { front: ["#ffe4e6", "#fecdd3"], back: ["#9f1239", "#be123c"], text: "#4c0519" },
  { front: ["#d1fae5", "#6ee7b7"], back: ["#064e3b", "#065f46"], text: "#022c22" },
  { front: ["#e0e7ff", "#c7d2fe"], back: ["#312e81", "#3730a3"], text: "#1e1b4b" },
  { front: ["#fdf4ff", "#f5d0fe"], back: ["#701a75", "#86198f"], text: "#3b0764" },
  { front: ["#fff7ed", "#fed7aa"], back: ["#7c2d12", "#9a3412"], text: "#431407" },
]

// Fixed 14px margin so -50% translate == exactly 5 cards → perfectly seamless loop ✓
// Card width targets exactly 1/5 of viewport (5 × (cardW + 14) = 100vw when vw value is active)
const CARD_MARGIN = "14px"
const CARD_W = "clamp(150px, calc(20vw - 14px), 260px)"
const CARD_H = "clamp(210px, calc(27vw - 14px), 290px)"

function FlipCard({ card, index }: { card: MessageCard; index: number }) {
  const [locked, setLocked] = useState(false)   // click to lock flip
  const [hovered, setHovered] = useState(false)  // hover preview
  const flipped = locked || hovered
  const [imgError, setImgError] = useState(false)
  const pal = PALETTES[index % PALETTES.length]

  return (
    // margin-right (not gap) so -50% in marquee is exactly one set wide → seamless loop
    <div
      onClick={() => setLocked((l) => !l)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer shrink-0 select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        perspective: "1000px",
        marginRight: CARD_MARGIN,
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── FRONT — big photo, polaroid style ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(160deg, ${pal.front[0]}, ${pal.front[1]})`,
          }}
        >
          {/* Full-bleed photo — takes ~78% of card height */}
          <div className="relative w-full" style={{ flex: "0 0 78%" }}>
            {!imgError ? (
              <Image
                src={card.avatar}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${pal.back[0]}, ${pal.back[1]})` }}
              >
                <span
                  className="text-white font-extrabold"
                  style={{ fontSize: "clamp(36px,6vw,56px)", fontFamily: "var(--font-syne)" }}
                >
                  {card.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Bottom gradient so name pops */}
            <div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
              style={{ background: `linear-gradient(to top, ${pal.front[1]}cc, transparent)` }}
            />

            {/* Sparkle badge — top right */}
            <div
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${pal.back[0]}, ${pal.back[1]})` }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Name + hint — bottom strip */}
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-1 gap-0.5">
            <p
              className="font-bold leading-tight text-center truncate w-full text-center"
              style={{
                color: pal.text,
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(11px, 1.1vw, 14px)",
              }}
            >
              {card.name}
            </p>
            <p
              className="opacity-50 text-center"
              style={{
                color: pal.text,
                fontFamily: "var(--font-outfit)",
                fontSize: "clamp(9px, 0.7vw, 11px)",
              }}
            >
              hover or tap →
            </p>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col p-4 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(145deg, ${pal.back[0]}, ${pal.back[1]})`,
          }}
        >
          {/* Top row: small avatar + name */}
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <div
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${pal.front[0]}, ${pal.front[1]})` }}
            >
              {!imgError ? (
                <Image
                  src={card.avatar}
                  alt={card.name}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold" style={{ color: pal.text }}>
                  {card.name.charAt(0)}
                </span>
              )}
            </div>
            <p
              className="text-white/90 font-semibold text-xs truncate"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {card.name}
            </p>
          </div>

          {/* Message */}
          <div className="flex-1 overflow-hidden relative">
            <p
              className="text-white/85 text-[11px] leading-relaxed"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {card.message}
            </p>
            {/* Fade out at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${pal.back[1]})`,
              }}
            />
          </div>

          {/* Heart footer */}
          <div className="flex items-center justify-end gap-1 mt-2 shrink-0">
            <Heart className="w-3 h-3 text-white/50 fill-white/50" />
            <span className="text-white/40 text-[10px]" style={{ fontFamily: "var(--font-outfit)" }}>
              tap to lock / move away to unflip
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function MarqueeRow({
  cards,
  direction,
}: {
  cards: MessageCard[]
  direction: "left" | "right"
}) {
  const [paused, setPaused] = useState(false)
  // Duplicate for seamless loop. Cards use marginRight (not flex gap) so
  // total width = 2N × (cardW + margin) and -50% == exactly N cards → seamless ✓
  const doubled = [...cards, ...cards]

  return (
    <div
      className="overflow-hidden w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 1000)}
    >
      <div
        className={direction === "left" ? "marquee-left" : "marquee-right"}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {doubled.map((card, i) => (
          <FlipCard key={`${card.id}-${i}`} card={card} index={card.id - 1} />
        ))}
      </div>
    </div>
  )
}

export function MessageCards() {
  const row1 = messages.slice(0, 6)   // Mummy, Daddy, Grandma, Grandpa, Eniola, Teniola
  const row2 = messages.slice(6, 11)  // Eunice, Grace, Justina, Monijesu, Omotola

  return (
    <section
      id="wishes"
      className="py-16 md:py-28 relative overflow-x-clip"
      style={{ isolation: "isolate" }}
    >
      <div className="absolute inset-0 bg-[var(--cream)]" />
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--purple-light)]/20 rounded-full blur-3xl pointer-events-none animate-blob" />
      <div
        className="absolute bottom-1/4 right-0 w-80 h-80 bg-[var(--gold-soft)]/15 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14 px-4"
        >
          <span
            className="text-xs tracking-[0.3em] uppercase mb-4 block"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}
          >
            From loved ones
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
          >
            Birthday Wishes
          </h2>
          <div
            className="w-24 h-px mx-auto mb-5"
            style={{ background: "linear-gradient(to right, transparent, var(--purple-soft), transparent)" }}
          />
          <p
            className="text-base md:text-lg max-w-md mx-auto italic"
            style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}
          >
            Messages from the people who love you most
          </p>
          <p
            className="text-xs mt-3 opacity-60"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}
          >
            click any card to reveal the message ✨
          </p>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-5"
        >
          <MarqueeRow cards={row1} direction="left" />
        </motion.div>

        {/* Row 2 — scrolls right */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <MarqueeRow cards={row2} direction="right" />
        </motion.div>

        {/* End decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mt-10 md:mt-14"
        >
          <span className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--purple-soft)" }} />
          <span className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />
        </motion.div>
      </div>
    </section>
  )
}
