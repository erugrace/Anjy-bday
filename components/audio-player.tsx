"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AudioPlayerProps {
  src: string
}

/**
 * Autoplay browsers: prefer unmuted play() first (often works after prior visits / MEI),
 * fall back to muted play + deferred unmute, then unlock on first pointerdown/keydown anywhere.
 *
 * IMPORTANT: Immediately setting muted=false in the same tick as muted play()
 * Chrome/Safari often PAUSE the audio — deferred rAF chain helps; gesture always wins.
 */
export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)

  const tryUnmuted = useCallback(async (el: HTMLAudioElement) => {
    el.volume = 0.55
    el.muted = false
    await el.play()
  }, [])

  const unlockFromGesture = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (!el.paused && !el.muted) return

    el.muted = false
    el.volume = 0.55
    void el.play().then(() => {
      setPlaying(true)
      setNeedsGesture(false)
    })
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const media = el

    const onErr = () => setHasError(true)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    media.addEventListener("error", onErr)
    media.addEventListener("play", onPlay)
    media.addEventListener("pause", onPause)

    let gestureHandler: (() => void) | null = null

    const detachGesture = () => {
      if (!gestureHandler) return
      document.removeEventListener("pointerdown", gestureHandler, true)
      document.removeEventListener("keydown", gestureHandler, true)
      document.removeEventListener("touchstart", gestureHandler, true)
      gestureHandler = null
    }

    const attachGestureFallback = () => {
      if (gestureHandler) return
      gestureHandler = () => {
        unlockFromGesture()
        detachGesture()
      }
      document.addEventListener("pointerdown", gestureHandler, { capture: true, passive: true })
      document.addEventListener("keydown", gestureHandler, { capture: true })
      document.addEventListener("touchstart", gestureHandler, { capture: true, passive: true })
    }

    /** Try muted → play → unmute next frame ×2 (avoids immediate mute flip pause) */
    const tryMutedThenDeferUnmute = async () => {
      media.volume = 0.55
      media.muted = true
      try {
        await media.play()
      } catch {
        setNeedsGesture(true)
        attachGestureFallback()
        return
      }

      const bumpUnmute = () => {
        try {
          media.muted = false
          void media.play()
          if (!media.paused) setPlaying(true)
        } catch {
          /* noop */
        }
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bumpUnmute()
          if (media.paused) {
            void media.play()
          }
          if (media.paused || media.muted) {
            setTimeout(() => {
              bumpUnmute()
              if (media.paused) void media.play()
              if (media.paused || media.muted) {
                attachGestureFallback()
                setNeedsGesture(true)
              } else setNeedsGesture(false)
            }, 120)
          } else setNeedsGesture(false)
        })
      })
    }

    async function bootstrap() {
      media.preload = "auto"
      media.loop = true
      media.volume = 0.55

      try {
        await tryUnmuted(media)
        setPlaying(true)
        setNeedsGesture(false)
        return
      } catch {
        /* fall through — try muted path */
      }

      await tryMutedThenDeferUnmute()
    }

    // Wait until we have enough buffered data (instant play() on empty Audio often rejects)
    if (media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void bootstrap()
    } else {
      const onReady = () => {
        media.removeEventListener("canplay", onReady)
        void bootstrap()
      }
      media.addEventListener("canplay", onReady)
    }

    return () => {
      media.removeEventListener("error", onErr)
      media.removeEventListener("play", onPlay)
      media.removeEventListener("pause", onPause)
      detachGesture()
      media.pause()
    }
  }, [src, tryUnmuted, unlockFromGesture])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (!el.paused) {
      el.pause()
      setPlaying(false)
    } else {
      el.muted = false
      el.volume = 0.55
      void el.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  if (hasError) return null

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" playsInline className="sr-only" />

      {/* Mute/unmute pill */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 px-3 py-2 rounded-full shadow-xl focus:outline-none"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        aria-label={playing ? "Pause music" : "Play music"}
        type="button"
      >
        {playing ? (
          <Volume2 className="w-4 h-4 text-white" />
        ) : (
          <VolumeX className="w-4 h-4 text-white/70" />
        )}
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
            🎵 Tap anywhere (or tap 19 ✨) to start the music
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
