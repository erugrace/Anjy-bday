"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TypewriterProps {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
  cursorClassName?: string
}

export function Typewriter({
  words,
  className,
  typingSpeed = 75,
  deletingSpeed = 38,
  pauseTime = 2200,
  cursorClassName,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Typing logic
  useEffect(() => {
    if (isPaused) return

    const currentWord = words[wordIndex] ?? ""

    const tick = () => {
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setDisplayed(currentWord.slice(0, charIndex + 1))
          setCharIndex((c) => c + 1)
        } else {
          // Full word typed — pause before deleting
          setIsPaused(true)
          setTimeout(() => {
            setIsPaused(false)
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        if (charIndex > 0) {
          setDisplayed(currentWord.slice(0, charIndex - 1))
          setCharIndex((c) => c - 1)
        } else {
          // Fully deleted — move to next word
          setIsDeleting(false)
          setWordIndex((w) => (w + 1) % words.length)
        }
      }
    }

    const delay = isDeleting ? deletingSpeed : typingSpeed
    const id = setTimeout(tick, delay)
    return () => clearTimeout(id)
  }, [charIndex, isDeleting, isPaused, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span>{displayed}</span>
      <span
        className={cn(
          "ml-[2px] inline-block w-[3px] rounded-full bg-current transition-opacity duration-100",
          cursorVisible ? "opacity-100" : "opacity-0",
          cursorClassName
        )}
        style={{ height: "0.85em", verticalAlign: "baseline", transform: "translateY(0.05em)" }}
      />
    </span>
  )
}
