"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AudioPlayerProps {
  src: string
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio

    audio.addEventListener("error", () => setHasError(true))

    // Attempt autoplay with sound — browsers may block it
    audio
      .play()
      .then(() => {
        setPlaying(true)
        setNeedsGesture(false)
      })
      .catch(() => {
        // Autoplay blocked — wait for any user gesture on the document
        setNeedsGesture(true)

        const unlock = () => {
          audio
            .play()
            .then(() => {
              setPlaying(true)
              setNeedsGesture(false)
              document.removeEventListener("click", unlock)
              document.removeEventListener("keydown", unlock)
              document.removeEventListener("touchstart", unlock)
            })
            .catch(() => {})
        }

        document.addEventListener("click", unlock, { once: true })
        document.addEventListener("keydown", unlock, { once: true })
        document.addEventListener("touchstart", unlock, { once: true })
      })

    return () => {
      audio.pause()
      audio.src = ""
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  if (hasError) return null

  return (
    <>
      {/* Mute/unmute pill — fixed bottom-right, above everything */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={toggle}
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 px-3 py-2 rounded-full shadow-xl focus:outline-none"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        aria-label={playing ? "Pause music" : "Play music"}
      >
        {playing ? (
          <Volume2 className="w-4 h-4 text-white" />
        ) : (
          <VolumeX className="w-4 h-4 text-white/70" />
        )}

        {/* Equaliser bars when playing */}
        <AnimatePresence>
          {playing && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden flex items-end gap-[3px]"
              style={{ height: 14 }}
            >
              {[0.6, 1, 0.75, 0.9, 0.5].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [h, 1, h * 0.5, 1, h] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                  className="block w-[3px] rounded-full bg-white origin-bottom"
                  style={{ height: "100%" }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* One-time "tap to play" prompt when autoplay is blocked */}
      <AnimatePresence>
        {needsGesture && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-16 right-5 z-[9997] px-4 py-2.5 rounded-2xl shadow-xl text-white text-xs font-medium pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(91,33,182,0.9))",
              backdropFilter: "blur(10px)",
              fontFamily: "var(--font-outfit)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            🎵 Tap anywhere to start the music
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
