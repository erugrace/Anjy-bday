"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ParticleBackground } from "@/components/particle-background"
import { AudioPlayer } from "@/components/audio-player"
import { AgeGame } from "@/components/age-game"
import { HeroSection } from "@/components/hero-section"
import { PhotoGallery } from "@/components/photo-gallery"
import { MessageCards } from "@/components/message-cards"
import { BookGifts } from "@/components/book-gifts"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export default function BirthdayPage() {
  const [gameComplete, setGameComplete] = useState(false)

  const handleGameComplete = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" })
    setGameComplete(true)
  }

  return (
    <>
      {/* One global grain layer */}
      <div className="grain-layer" aria-hidden="true" />

      {/* Fixed particle canvas — mouse-reactive everywhere */}
      <ParticleBackground />

      {/* Sticky header — only on main experience */}
      <Header gameComplete={gameComplete} />

      {/* Audio — mounted once, plays continuously throughout the whole experience */}
      <AudioPlayer src="/Ebenezer_Obey_-_Ebenezer_Obey_-_Happy_Birthday.mp3" />

      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          {!gameComplete ? (
            <motion.div
              key="game"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AgeGame onComplete={handleGameComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="pt-14 sm:pt-16"
            >
              <HeroSection />
              <PhotoGallery />
              <MessageCards />
              <BookGifts />
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
