"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useCallback } from "react"
import { Heart, Star, Sparkles, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface Photo {
  id: number
  src: string
  alt: string
  rotation: number
  tag?: string
  isOld?: boolean
}

const oldPhotos: Photo[] = [
  { id: 1, src: "/old-1.jpg", alt: "Baby Anjola", rotation: -3, tag: "Baby Anjola 🍼", isOld: true },
  { id: 2, src: "/old-2.jpg", alt: "Growing up", rotation: 4, tag: "Growing up ✨", isOld: true },
  { id: 3, src: "/old-3.jpg", alt: "The early days", rotation: -2, tag: "The early days", isOld: true },
  { id: 4, src: "/old-4.jpg", alt: "Little Anjola", rotation: 3, tag: "Little superstar", isOld: true },
]

const recentPhotos: Photo[] = [
  { id: 5,  src: "/recent-1.jpg",  alt: "Anjola",             rotation: 2,  tag: "Queen things 👑" },
  { id: 6,  src: "/recent-2.jpg",  alt: "Anjola & friends",   rotation: -4, tag: "The girls 🫂" },
  { id: 7,  src: "/recent-3.jpg",  alt: "Anjola",             rotation: 3,  tag: "Slaying always 💅" },
  { id: 8,  src: "/recent-4.jpg",  alt: "Anjola & friends",   rotation: -2, tag: "Squad goals 👯‍♀️" },
  { id: 9,  src: "/recent-5.jpg",  alt: "Anjola",             rotation: 5,  tag: "Beautiful soul 🌸" },
  { id: 10, src: "/recent-6.jpg",  alt: "Anjola",             rotation: -3, tag: "That smile ☀️" },
  { id: 11, src: "/recent-7.jpg",  alt: "Anjola & friends",   rotation: 2,  tag: "Good times 💜" },
  { id: 12, src: "/recent-8.jpg",  alt: "Anjola",             rotation: -1, tag: "Pure joy" },
  { id: 13, src: "/recent-9.jpg",  alt: "Anjola & friends",   rotation: 4,  tag: "Memories made 🤍" },
  { id: 14, src: "/recent-10.jpg", alt: "Anjola",             rotation: -3, tag: "Iconic" },
  { id: 15, src: "/recent-11.jpg", alt: "Anjola",             rotation: 2,  tag: "Soft life era 🌷" },
  { id: 16, src: "/recent-12.jpg", alt: "Anjola & friends",   rotation: -2, tag: "Main characters 🎬" },
  { id: 17, src: "/recent-13.jpg", alt: "Anjola",             rotation: 3,  tag: "Birthday glow 🎂" },
  { id: 18, src: "/recent-14.jpg", alt: "Anjola",             rotation: -4, tag: "Forever her 💫" },
  { id: 19, src: "/recent-15.jpg", alt: "Anjola & the squad", rotation: 1,  tag: "The whole gang 🫶" },
]

const allPhotos = [...oldPhotos, ...recentPhotos]

const SPARKLE_POSITIONS = [
  { x: -12, y: -12 },
  { x: 50, y: -16 },
  { x: 110, y: -10 },
  { x: 115, y: 50 },
  { x: 108, y: 105 },
  { x: 50, y: 112 },
  { x: -14, y: 108 },
  { x: -16, y: 50 },
]

function SparkleIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
    </svg>
  )
}

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: Photo
  index: number
  onOpen: (photo: Photo) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked((p) => !p)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 600)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: photo.rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: photo.rotation }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{
        scale: 1.08,
        rotate: 0,
        y: -10,
        zIndex: 30,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onOpen(photo)}
      className="relative group cursor-pointer"
      style={{ willChange: "transform" }}
    >
      {/* Sparkles burst on hover */}
      <AnimatePresence>
        {isHovered &&
          SPARKLE_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.8],
                x: `${pos.x}%`,
                y: `${pos.y}%`,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              className="absolute z-40 pointer-events-none"
              style={{ color: i % 2 === 0 ? "#f5c842" : "#c084fc" }}
            >
              <SparkleIcon size={i % 3 === 0 ? 14 : 10} />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Glowing shimmer border on hover */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          backgroundPosition: isHovered ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%",
        }}
        transition={{ opacity: { duration: 0.2 }, backgroundPosition: { duration: 2, repeat: Infinity } }}
        className="absolute -inset-[2px] rounded-sm z-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #c084fc, #f5c842, #a855f7, #fbbf24, #c084fc)",
          backgroundSize: "200% 200%",
          filter: "blur(3px)",
        }}
      />

      {/* Decorative tape */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 rounded-sm z-10 shadow-sm rotate-1"
        style={{ backgroundColor: "var(--gold-soft)", opacity: 0.8 }}
      />

      {/* Tag label */}
      {photo.tag && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3 }}
          animate={isHovered ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
          className="absolute z-30 left-1/2 top-11 w-[min(92%,220px)] -translate-x-1/2 flex justify-center px-1 md:left-auto md:right-1 md:top-0 md:w-auto md:max-w-[11rem] md:translate-x-0"
        >
          <div
            className="text-white text-[10px] leading-snug px-2.5 py-1 rounded-full font-medium shadow-md md:-rotate-6 text-center [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
            style={{ backgroundColor: "var(--purple-rich)", fontFamily: "var(--font-outfit)" }}
          >
            {photo.tag}
          </div>
        </motion.div>
      )}

      {/* Photo frame */}
      <div
        className="relative z-10 p-2 md:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-sm overflow-hidden"
        style={{ backgroundColor: "white" }}
      >
        <div
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{ backgroundColor: "var(--cream-dark)" }}
        >
          {!imgError ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--cream), color-mix(in oklch, var(--purple-light) 30%, transparent))",
              }}
            >
              <div className="text-center p-4" style={{ color: "var(--charcoal-light)" }}>
                <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--purple-soft)" }} />
                <p className="text-xs tracking-wide" style={{ fontFamily: "var(--font-outfit)" }}>
                  {photo.tag || "Photo"}
                </p>
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-between pb-3 pt-3"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
          >
            {/* Zoom hint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-1.5"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </motion.div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 focus:outline-none"
            >
              <motion.div
                animate={likeAnim ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className="w-5 h-5 transition-colors"
                  style={{ color: liked ? "#f43f5e" : "white" }}
                  fill={liked ? "#f43f5e" : "rgba(255,255,255,0.6)"}
                />
              </motion.div>
            </button>
          </motion.div>
        </div>

        {/* Caption */}
        <div className="mt-2 h-5 flex items-center justify-center">
          <p className="text-[10px] italic" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-libre)" }}>
            {photo.isOld ? "Memories" : "Recent"}
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 z-20"
        style={{ borderColor: "var(--purple-light)" }}
      />
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 z-20"
        style={{ borderColor: "var(--purple-light)" }}
      />
    </motion.div>
  )
}

function Lightbox({
  photo,
  allPhotos,
  onClose,
}: {
  photo: Photo
  allPhotos: Photo[]
  onClose: () => void
}) {
  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id)
  const [activePhoto, setActivePhoto] = useState(photo)
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [imgError, setImgError] = useState(false)
  const [liked, setLiked] = useState(false)

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % allPhotos.length
    setActiveIndex(next)
    setActivePhoto(allPhotos[next])
    setImgError(false)
  }, [activeIndex, allPhotos])

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + allPhotos.length) % allPhotos.length
    setActiveIndex(prev)
    setActivePhoto(allPhotos[prev])
    setImgError(false)
  }, [activeIndex, allPhotos])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
    >
      {/* Floating sparkles in lightbox */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.9, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          className="absolute pointer-events-none"
          style={{
            left: `${15 + i * 14}%`,
            top: `${10 + (i % 3) * 25}%`,
            color: i % 2 === 0 ? "#f5c842" : "#c084fc",
          }}
        >
          <SparkleIcon size={i % 2 === 0 ? 16 : 12} />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "white" }}
      >
        {/* Shimmer top bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--purple-soft), var(--gold), var(--purple-rich))" }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full p-1.5 transition-colors"
          style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
        >
          <X className="w-4 h-4" style={{ color: "var(--charcoal)" }} />
        </button>

        {/* Photo */}
        <div className="relative aspect-[4/5] w-full" style={{ backgroundColor: "var(--cream-dark)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhoto.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {!imgError ? (
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--cream), color-mix(in oklch, var(--purple-light) 40%, transparent))",
                  }}
                >
                  <Sparkles className="w-12 h-12 mb-3" style={{ color: "var(--purple-soft)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}>
                    {activePhoto.tag}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tag badge */}
          {activePhoto.tag && (
            <div
              className="absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md"
              style={{ backgroundColor: "var(--purple-rich)", fontFamily: "var(--font-outfit)" }}
            >
              {activePhoto.tag}
            </div>
          )}

          {/* Nav arrows */}
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-opacity hover:opacity-100 opacity-70"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-opacity hover:opacity-100 opacity-70"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}>
              {activeIndex + 1} of {allPhotos.length}
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--charcoal)", fontFamily: "var(--font-libre)" }}>
              {activePhoto.isOld ? "✨ Childhood memory" : "💜 Recent glow up"}
            </p>
          </div>
          <button
            onClick={() => setLiked((p) => !p)}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <motion.div whileTap={{ scale: 1.5 }} transition={{ duration: 0.2 }}>
              <Heart
                className="w-5 h-5 transition-colors duration-200"
                style={{ color: liked ? "#f43f5e" : "var(--muted-foreground)" }}
                fill={liked ? "#f43f5e" : "none"}
              />
            </motion.div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}>
              {liked ? "Loved" : "Love"}
            </span>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {allPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setActivePhoto(allPhotos[i]); setImgError(false) }}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? "var(--purple-soft)" : "var(--purple-light)",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ArrowDecoration({ direction, className }: { direction: "left" | "right"; className?: string }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`hidden md:flex items-center gap-2 ${className}`}
      style={{ color: "var(--charcoal-light)" }}
    >
      {direction === "right" && <span className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />}
      <motion.div animate={{ x: direction === "left" ? [-3, 3, -3] : [3, -3, 3] }} transition={{ duration: 2, repeat: Infinity }}>
        <Icon className="w-5 h-5" />
      </motion.div>
      {direction === "left" && <span className="w-12 h-px" style={{ backgroundColor: "var(--border)" }} />}
    </motion.div>
  )
}

export function PhotoGallery() {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)

  return (
    <section
      id="memories"
      className="py-20 md:py-32 px-4 relative overflow-x-clip"
      style={{ isolation: "isolate" }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: "var(--cream-dark)" }} />

      {/* Ambient blob — CSS animated */}
      <div
        className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-blob"
        style={{ backgroundColor: "color-mix(in oklch, var(--purple-light) 20%, transparent)" }}
      />

      {/* Floating stars */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-10"
        style={{ color: "var(--purple-soft)", willChange: "transform" }}
      >
        <Star className="w-6 h-6 fill-current opacity-40" />
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-32 right-16"
        style={{ color: "var(--gold)", willChange: "transform" }}
      >
        <Sparkles className="w-8 h-8 opacity-50" />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase mb-4 block" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-outfit)" }}>
            Through the years
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}>
            Memory Lane
          </h2>
          <div
            className="w-24 h-px mx-auto mb-6"
            style={{ background: "linear-gradient(to right, transparent, var(--purple-soft), transparent)" }}
          />
          <p className="text-lg max-w-md mx-auto italic" style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}>
            A scrapbook of beautiful moments · click any photo to explore
          </p>
        </motion.div>

        {/* Old photos */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 mb-8 w-full px-1">
            <div className="shrink-0 scale-75 sm:scale-100 origin-left">
              <ArrowDecoration direction="left" />
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-0 flex-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base sm:text-lg font-semibold text-center leading-tight px-2"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
            >
              <span className="hidden sm:inline-block w-6 sm:w-8 h-px shrink-0" style={{ backgroundColor: "var(--purple-soft)" }} />
              <span>The Early Years</span>
              <span className="text-xs sm:text-sm font-normal whitespace-nowrap" style={{ color: "var(--purple-rich)", fontFamily: "var(--font-outfit)" }}>
                (Throwbacks)
              </span>
              <span className="hidden sm:inline-block w-6 sm:w-8 h-px shrink-0" style={{ backgroundColor: "var(--purple-soft)" }} />
            </motion.h3>
            <div className="shrink-0 scale-75 sm:scale-100 origin-right">
              <ArrowDecoration direction="right" />
            </div>
          </div>
          {/* 2 cols on mobile, 4 cols on desktop — all 4 throwbacks in one clean row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {oldPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} onOpen={setLightboxPhoto} />
            ))}
          </div>
        </motion.div>

        {/* Connector */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 my-12"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-20 h-px origin-left"
            style={{ background: "linear-gradient(to right, transparent, var(--purple-soft))" }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ borderColor: "var(--purple-soft)", willChange: "transform" }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "var(--purple-soft)" }} />
          </motion.div>
          <span className="text-sm tracking-wide" style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-outfit)" }}>
            Then &amp; Now
          </span>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ borderColor: "var(--gold)", willChange: "transform" }}
          >
            <Heart className="w-4 h-4" style={{ color: "var(--gold)" }} />
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-20 h-px origin-right"
            style={{ background: "linear-gradient(to left, transparent, var(--gold))" }}
          />
        </motion.div>

        {/* Recent photos */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 mb-8 w-full px-1">
            <div className="shrink-0 scale-75 sm:scale-100 origin-left">
              <ArrowDecoration direction="left" />
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="min-w-0 flex-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base sm:text-lg font-semibold text-center leading-tight px-2"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-syne)" }}
            >
              <span className="hidden sm:inline-block w-6 sm:w-8 h-px shrink-0" style={{ backgroundColor: "var(--gold)" }} />
              <span>Recent Memories</span>
              <span className="text-xs sm:text-sm font-normal whitespace-nowrap" style={{ color: "var(--purple-rich)", fontFamily: "var(--font-outfit)" }}>
                (Slay era)
              </span>
              <span className="hidden sm:inline-block w-6 sm:w-8 h-px shrink-0" style={{ backgroundColor: "var(--gold)" }} />
            </motion.h3>
            <div className="shrink-0 scale-75 sm:scale-100 origin-right">
              <ArrowDecoration direction="right" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {recentPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={index % 3 === 1 ? "md:mt-8" : index % 3 === 2 ? "md:mt-16" : ""}
              >
                <PhotoCard photo={photo} index={index + 4} onOpen={setLightboxPhoto} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, rotate: -8 }}
          whileInView={{ opacity: 1, rotate: -4 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-4 right-4 md:right-20 w-36 md:w-44 p-4 shadow-lg rounded-sm hidden md:block"
          style={{ backgroundColor: "white" }}
        >
          <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: "color-mix(in oklch, var(--purple-soft) 30%, transparent)" }} />
          <p className="text-sm text-center italic" style={{ color: "var(--charcoal-light)", fontFamily: "var(--font-libre)" }}>
            Every moment is a treasure
          </p>
          <Heart className="w-3 h-3 mx-auto mt-2" style={{ color: "var(--purple-soft)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: 6 }}
          whileInView={{ opacity: 1, rotate: 3 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="absolute top-40 left-4 md:left-10 hidden lg:block w-32 p-3 shadow-md rounded-sm"
          style={{ backgroundColor: "color-mix(in oklch, var(--gold-soft) 50%, transparent)" }}
        >
          <p className="text-xs text-center" style={{ color: "var(--charcoal)", fontFamily: "var(--font-outfit)" }}>
            19 years of magic
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <Lightbox photo={lightboxPhoto} allPhotos={allPhotos} onClose={() => setLightboxPhoto(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
