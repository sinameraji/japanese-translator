"use client"

import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
}

const COLORS = ["bg-ai-iro", "bg-ai-light", "bg-kincha", "bg-sakura-soft"]

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!trigger) return

    const newPieces: ConfettiPiece[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    }))

    setPieces(newPieces)

    const cleanup = setTimeout(() => setPieces([]), 1200)
    return () => clearTimeout(cleanup)
  }, [trigger])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute top-0 w-2 h-2 rounded-sm animate-confetti ${piece.color}`}
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
