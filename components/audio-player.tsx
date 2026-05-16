"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { motion } from "framer-motion"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
}

export function AudioPlayer({ src, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setIsLoaded(true))
    audio.addEventListener('error', () => setHasError(true))

    if (autoPlay) {
      audio.play().catch(() => setIsMuted(true))
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [src, autoPlay])

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.play().then(() => {
        setIsMuted(false)
      }).catch(console.error)
    } else {
      audioRef.current.pause()
      setIsMuted(true)
    }
  }

  // Silently hide the player if the audio file doesn't exist (404)
  if (hasError) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      onClick={toggleMute}
      disabled={!isLoaded}
      className="fixed top-4 right-4 z-50 p-3 rounded-full glass hover:bg-purple-500/30 
                 transition-all duration-300 group disabled:opacity-50"
      aria-label={isMuted ? "Unmute music" : "Mute music"}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-purple-200 group-hover:text-white transition-colors" />
      ) : (
        <Volume2 className="w-6 h-6 text-purple-200 group-hover:text-white transition-colors" />
      )}
      
      {/* Pulse animation when playing */}
      {!isMuted && (
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-purple-500/30"
        />
      )}
    </motion.button>
  )
}
