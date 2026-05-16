"use client"

import { useEffect, useRef, useState } from "react"

interface AudioPlayerProps {
  src: string
}

const VOLUME = 0.62

/**
 * Always-unmuted ambient track. Calls play() ASAP; browsers may block until the first tap
 * anywhere (AgeGame clicks count). No muted autoplay, no “tap for music” UI.
 */
export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    let cleaned = false

    const detachGesture = () => {
      document.removeEventListener("pointerdown", gestureKick, true)
      document.removeEventListener("keydown", gestureKick, true)
      document.removeEventListener("touchstart", gestureKick, true)
    }

    const tryPlay = (): Promise<void> => {
      el.muted = false
      el.volume = VOLUME
      return el.play()
    }

    const gestureKick = () => {
      if (cleaned) return
      void tryPlay().catch(() => {})
    }

    document.addEventListener("pointerdown", gestureKick, { capture: true, passive: true })
    document.addEventListener("keydown", gestureKick, { capture: true })
    document.addEventListener("touchstart", gestureKick, { capture: true, passive: true })

    const onPlaying = () => detachGesture()

    const onVisibility = () => {
      if (cleaned || document.visibilityState !== "visible") return
      if (el.paused) void tryPlay().catch(() => {})
    }

    const onErr = () => setHasError(true)

    el.addEventListener("error", onErr)
    el.addEventListener("playing", onPlaying)
    document.addEventListener("visibilitychange", onVisibility)

    el.loop = true
    el.preload = "auto"
    el.muted = false
    el.volume = VOLUME

    const bootstrap = async () => {
      if (cleaned) return
      try {
        await tryPlay()
      } catch {
        /* gestureKick starts audio on next interaction */
      }
    }

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void bootstrap()
    } else {
      el.addEventListener("canplay", () => void bootstrap(), { once: true })
    }

    return () => {
      cleaned = true
      detachGesture()
      document.removeEventListener("visibilitychange", onVisibility)
      el.removeEventListener("error", onErr)
      el.removeEventListener("playing", onPlaying)
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
