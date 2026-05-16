"use client"

import { useEffect, useRef, useState } from "react"

interface AudioPlayerProps {
  src: string
}

const VOLUME = 0.62
/** Skip perceived dead air at the head of this track once playback starts */
const SKIP_INTRO_SEC = 5

/**
 * Ambient birthday track — always audible (no mute tricks). Playback starts ASAP;
 * autoplay-safe browsers play immediately; others pick up on the first gesture
 * anywhere on the site (AgeGame clicks count).
 */
export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasError, setHasError] = useState(false)
  const introSkippedRef = useRef(false)

  useEffect(() => {
    introSkippedRef.current = false

    const el = audioRef.current
    if (!el) return
    let cleaned = false

    const detachGesture = () => {
      document.removeEventListener("pointerdown", gestureKick, true)
      document.removeEventListener("keydown", gestureKick, true)
      document.removeEventListener("touchstart", gestureKick, true)
    }

    /** Skip quiet intro roughly once — normal loop behaviour still rewinds naturally. */
    const applyIntroSkipOnce = () => {
      if (cleaned || introSkippedRef.current) return
      const dur = el.duration
      if (!Number.isFinite(dur) || dur <= SKIP_INTRO_SEC + 1) return
      try {
        el.currentTime = SKIP_INTRO_SEC
        introSkippedRef.current = true
      } catch {
        /* buffer not ready */
      }
    }

    const tryPlay = (): Promise<void> => {
      el.muted = false
      el.volume = VOLUME
      applyIntroSkipOnce()
      return el.play()
    }

    const gestureKick = () => {
      if (cleaned) return
      applyIntroSkipOnce()
      void tryPlay().catch(() => {})
    }

    document.addEventListener("pointerdown", gestureKick, { capture: true, passive: true })
    document.addEventListener("keydown", gestureKick, { capture: true })
    document.addEventListener("touchstart", gestureKick, { capture: true, passive: true })

    const onPlaying = () => detachGesture()

    const onLoadedMeta = () => {
      // Duration now known — cue intro skip before/next play().
      applyIntroSkipOnce()
    }

    const onVisibility = () => {
      if (cleaned || document.visibilityState !== "visible") return
      if (el.paused) void tryPlay().catch(() => {})
    }

    const onErr = () => setHasError(true)

    el.addEventListener("error", onErr)
    el.addEventListener("playing", onPlaying)
    el.addEventListener("loadedmetadata", onLoadedMeta)
    document.addEventListener("visibilitychange", onVisibility)

    el.loop = true
    el.preload = "auto"
    el.muted = false
    el.volume = VOLUME

    const bootstrap = async () => {
      if (cleaned) return
      applyIntroSkipOnce()
      try {
        await tryPlay()
      } catch {
        /* gestureKick resolves when the browser permits audio */
      }
    }

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void bootstrap()
    } else {
      el.addEventListener(
        "canplay",
        () => {
          void bootstrap()
        },
        { once: true },
      )
    }

    return () => {
      cleaned = true
      detachGesture()
      document.removeEventListener("visibilitychange", onVisibility)
      el.removeEventListener("error", onErr)
      el.removeEventListener("playing", onPlaying)
      el.removeEventListener("loadedmetadata", onLoadedMeta)
      el.pause()
    }
  }, [src])

  if (hasError) return null

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      preload="auto"
      playsInline
      className="sr-only"
      aria-hidden="true"
    />
  )
}
