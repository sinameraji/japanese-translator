"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const KANJI_CHARACTERS = ["人", "馬", "一", "体", "翻", "訳", "調", "和", "流", "言", "葉"]

interface FloatingKanji {
  id: number
  char: string
  x: number
  delay: number
}

export function FloatingKanji({ isActive }: { isActive: boolean }) {
  const [kanjis, setKanjis] = useState<FloatingKanji[]>([])

  useEffect(() => {
    if (!isActive) {
      setKanjis([])
      return
    }

    const interval = setInterval(() => {
      const newKanji: FloatingKanji = {
        id: Date.now(),
        char: KANJI_CHARACTERS[Math.floor(Math.random() * KANJI_CHARACTERS.length)],
        x: Math.random() * 80 + 10,
        delay: Math.random() * 0.5,
      }

      setKanjis((prev) => [...prev.slice(-6), newKanji])
    }, 400)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (kanjis.length === 0) return

    const cleanup = setTimeout(() => {
      setKanjis((prev) => prev.slice(1))
    }, 2000)

    return () => clearTimeout(cleanup)
  }, [kanjis.length])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {kanjis.map((kanji) => (
        <span
          key={kanji.id}
          className={cn("absolute bottom-0 text-2xl font-bold animate-kanji-rise", "text-ai-light/50")}
          style={{
            left: `${kanji.x}%`,
            animationDelay: `${kanji.delay}s`,
          }}
        >
          {kanji.char}
        </span>
      ))}
    </div>
  )
}
