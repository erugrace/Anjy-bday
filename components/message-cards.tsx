"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Heart, Sparkles, X } from "lucide-react"

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
    message:
      "Happy Birthday to my sweet daughter. You are one of the greatest blessings God has given to me, and my heart is filled with gratitude for your life. As you celebrate today, I pray that God will guide your steps, protect your heart, and make all your dreams come true. May you grow in wisdom, grace, favor, and strength. May your life always reflect happiness, peace, and purpose. Always remember that no matter how old you grow, you will forever be my little girl and a special part of my heart. Enjoy your day, my love. Shine brightly and never stop believing in yourself. Happy Birthday, darling. 💜",
  },
  {
    id: 2,
    name: "Dad",
    avatar: "/Daddy.jpg",
    message:
      "Anjie! Anjus baby. You're such a wonderful daughter. I wish you joy, health and peace as you celebrate your last year as a teenager going into twenty. Be excellent at what is good, be innocent of evil, and the God of peace will soon crush Satan underneath your feet. 🎉",
  },
  {
    id: 3,
    name: "Grandma",
    avatar: "/Grandma.jpg",
    message:
      "Happy birthday to you my granddaughter, your days are blessed with heavenly blessings. God will crown you with divine wisdom, knowledge and understanding. You will fulfil destiny in life in Jesus mighty Name Amen. CHEERS TO YOUR NEW AGE. 🙏✨",
  },
  {
    id: 4,
    name: "Grandpa",
    avatar: "/Grandpa.jpg",
    message:
      "AnjolaOluwa, I share the joy of your birthday celebrations with you. The Lord will bless your new age with the desires of your heart. He will bless you with the ability to make exploits and the power to excel in Jesus' mighty name. Happy birthday! 🎂",
  },
  {
    id: 5,
    name: "Eniola",
    avatar: "/Eniola.jpg",
    message:
      "Happy Birthday, Anjolaoluwa Faith Bimbo-Ajiboye. 🎉 I'm truly grateful to have someone like you in my life. Thank you for the laughter, support, memories, and all the little moments that make our friendship special. As you start another year, I pray you experience happiness, good health, success, peace of mind, and endless blessings. May everything you've been hoping and working for begin to fall into place for you. Keep being the amazing person you are. Enjoy your day to the fullest because you deserve all the love and celebration today. Happy Birthday once again! ❤️",
  },
  {
    id: 6,
    name: "Teniola",
    avatar: "/Teniola.jpg",
    message:
      "Anjieeee 🩵 I can't thank God enough for bringing you into my life. 🥹 My prayoo! Thank you for being the woman that you are. Thank you for always being intentional about your friends. 🥹🫶 As you step into a new year, I pray it is one of exponential growth and clarity. ✨ I love you Anjolaoluwa. 🩵 Keep being you. 🥹🫶",
  },
  {
    id: 7,
    name: "Eunice",
    avatar: "/Eunice.jpg",
    message:
      "Anjolaaaa, happy happy birthday 🥳🥳. Looking back now, I still find it heartwarming — God's intentionality knowing I need an Anjola in my life at this moment. You encourage me, challenge me and definitely validate all my crash out moments. I pray the Almighty God continues to keep you in the perfection of His will. Thank you for being such a good friend 🫂.",
  },
  {
    id: 8,
    name: "Derin",
    avatar: "/derin.jpg",
    message:
      "Anjolaoluwa, ml. I'm so happy to have you in my life. You've been a sister, a mother, a friend and the best girls' girl I've ever had! I love your heart, your generosity and your intentionality towards your friends 🥹. Thank you for rooting for me, for praying for me, for loving me and always being there for me. Thank you for teaching me small Yoruba 😂. Thank you for your beautiful letters, they always do something special in my heart. I love you so much and I want you to know that I'm rooting for you so so much 🥹. God bless you, my queen ❤️",
  },
  {
    id: 9,
    name: "Justina",
    avatar: "/Justina.jpg",
    message:
      "Happy Birthday to my lovely sister. ❤️🎂 Thank you for always being supportive, caring, loving, and prayerful. I truly appreciate all your help and encouragement. May the Lord bless your new age with success in your academics, favor, happiness, peace, good health, and long life and prosperity in Jesus' name. Amen. Happy Birthday once again, dear sister. I love you so much. 💕",
  },
  {
    id: 10,
    name: "Monijesu",
    avatar: "/Monijesu.jpg",
    message:
      "Happy birthdayyyy, Anjola ❤️ I'm really grateful for the gift of being your friend and having you in my corner. You're such a thoughtful and intentional person, and I truly appreciate how involved and concerned you always are about my wellbeing. Thank you for loving me loudly and unapologetically, and for never hesitating to show it. You deserve all the beautiful things this year has to offer. This is that year for you, Anjola ✨",
  },
  {
    id: 11,
    name: "Omotola",
    avatar: "/Omotola.jpg",
    message:
      "Happy birthdayyyyy, Anjola. I love you so much and words can't even quantify it. I hope to write a book someday on our friendship and how God guided our steps to know each other. You get me so much and I can't be more grateful for a soul sister! Till the wheels fall off, till our hairs turn grey and till our sugar babies grow old tooooo ❤️",
  },
]

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

const CARD_MARGIN = "14px"
const CARD_W = "clamp(150px, calc(20vw - 14px), 260px)"
const CARD_H = "clamp(220px, calc(28vw - 14px), 310px)"

const WISH_OVERLAY_Z = 200_000

// ── Full-screen sheet (motion root for AnimatePresence) — ported to document.body ──
function WishReadingOverlay({
  card,
  pal,
  onClose,
}: {
  card: MessageCard
  pal: typeof PALETTES[0]
  onClose: () => void
}) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [])

  return (
    <motion.div
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 flex justify-center overflow-y-auto overflow-x-hidden"
      style={{
        zIndex: WISH_OVERLAY_Z,
        backgroundColor: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Wrapper: grows with content; page scroll lives on backdrop (single scrollbar, full message readable) */}
      <div className="flex min-h-full w-full items-end justify-center p-0 sm:items-center sm:p-8 sm:py-10">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-modal-name"
        initial={{ y: "104%", opacity: 0.98 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "104%", opacity: 0.98 }}
        transition={{ type: "spring", damping: 31, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg rounded-t-[1.75rem] sm:rounded-3xl shadow-2xl flex flex-col shrink-0 sm:shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.35)]"
        style={{
          background: `linear-gradient(165deg, ${pal.back[0]}, ${pal.back[1]})`,
          marginTop: "auto",
          marginBottom: "auto",
          maxWidth: "min(32rem, 100%)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/30" aria-hidden />
        </div>

        <div className="flex items-center gap-4 px-6 pt-4 pb-5 shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0 shadow-lg">
            {!imgError ? (
              <Image
                src={card.avatar}
                alt={card.name}
                fill
                className="object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${pal.front[0]}, ${pal.front[1]})` }}
              >
                <span className="text-2xl font-bold" style={{ color: pal.text }}>
                  {card.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              id="wish-modal-name"
              className="text-white font-bold text-lg leading-tight"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {card.name}
            </p>
            <p className="text-white/60 text-xs mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
              Birthday message 💜
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/15 active:bg-white/30 hover:bg-white/25 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mx-6 h-px bg-white/20 mb-4 shrink-0" />

        <div className="px-6 pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+20px))]">
          <p
            className="text-white/90 leading-relaxed text-[15px] sm:text-base whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {card.message}
          </p>
          <div className="flex items-center gap-2 mt-8 opacity-60">
            <Heart className="w-4 h-4 text-white fill-white shrink-0" />
            <span className="text-white text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
              With love
            </span>
          </div>
        </div>
      </motion.div>
      </div>
    </motion.div>
  )
}

// ── Marquee card: grows on hover/tap, opens full message overlay (all breakpoints) ──
function FlipCard({
  card,
  index,
  onOpenModal,
}: {
  card: MessageCard
  index: number
  onOpenModal: (card: MessageCard, pal: typeof PALETTES[0]) => void
}) {
  const [imgError, setImgError] = useState(false)
  const pal = PALETTES[index % PALETTES.length]

  const open = useCallback(() => {
    onOpenModal(card, pal)
  }, [card, pal, onOpenModal])

  return (
    <motion.div
      onClick={open}
      className="relative shrink-0 cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        marginRight: CARD_MARGIN,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      whileHover={{
        scale: 1.072,
        y: -10,
        zIndex: 50,
        transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
      }}
      whileTap={{ scale: 0.96, zIndex: 50, transition: { duration: 0.12 } }}
      initial={false}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl"
        style={{
          background: `linear-gradient(160deg, ${pal.front[0]}, ${pal.front[1]})`,
        }}
      >
        <div className="relative h-[78%] w-full">
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
              className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${pal.back[0]}, ${pal.back[1]})` }}
            >
              <span
                className="font-extrabold text-white"
                style={{ fontSize: "clamp(36px,6vw,56px)", fontFamily: "var(--font-syne)" }}
              >
                {card.name.charAt(0)}
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
            style={{ background: `linear-gradient(to top, ${pal.front[1]}cc, transparent)` }}
          />
          <div
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full shadow-lg"
            style={{ background: `linear-gradient(135deg, ${pal.back[0]}, ${pal.back[1]})` }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="flex h-[22%] flex-col items-center justify-center gap-0.5 px-2 py-1">
          <p
            className="w-full truncate text-center font-bold leading-tight"
            style={{
              color: pal.text,
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(12px, 1.2vw, 15px)",
            }}
          >
            {card.name}
          </p>
          <p
            className="text-center opacity-55"
            style={{
              color: pal.text,
              fontFamily: "var(--font-outfit)",
              fontSize: "clamp(9px, 0.75vw, 11px)",
            }}
          >
            tap / click → full letter 💜
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Marquee row ───────────────────────────────────────────────────────────────
function MarqueeRow({
  cards,
  direction,
  onOpenModal,
}: {
  cards: MessageCard[]
  direction: "left" | "right"
  onOpenModal: (card: MessageCard, pal: typeof PALETTES[0]) => void
}) {
  const [paused, setPaused] = useState(false)
  const doubled = [...cards, ...cards]

  return (
    <div
      className="overflow-hidden w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 1200)}
    >
      <div
        className={direction === "left" ? "marquee-left" : "marquee-right"}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {doubled.map((card, i) => (
          <FlipCard
            key={`${card.id}-${i}`}
            card={card}
            index={card.id - 1}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export function MessageCards() {
  const row1 = messages.slice(0, 6)
  const row2 = messages.slice(6, 11)

  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  const [modal, setModal] = useState<{
    card: MessageCard
    pal: typeof PALETTES[0]
  } | null>(null)

  const openModal = useCallback((card: MessageCard, pal: typeof PALETTES[0]) => {
    setModal({ card, pal })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  return (
    <>
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
            tap any card to read the full message ✨
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-5"
        >
          <MarqueeRow cards={row1} direction="left" onOpenModal={openModal} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <MarqueeRow cards={row2} direction="right" onOpenModal={openModal} />
        </motion.div>

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

    {portalReady &&
      createPortal(
        <AnimatePresence mode="wait">
          {modal ? (
            <WishReadingOverlay
              key={`wish-${modal.card.id}`}
              card={modal.card}
              pal={modal.pal}
              onClose={closeModal}
            />
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
