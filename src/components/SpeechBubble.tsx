"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SpeechBubbleProps {
  children: ReactNode
  className?: string
  isVisible: boolean
}

export function SpeechBubble({ children, className, isVisible }: SpeechBubbleProps) {
  return (
    <div className={cn("relative", isVisible ? "animate-bounce-in" : "opacity-0 scale-0", className)}>
      {/* Unity ring - symbolizing Jinba Ittai */}
      <div className="absolute -inset-2 rounded-[28px] bg-ai-iro/20 animate-unity-pulse" />

      {/* Main bubble */}
      <div className={cn("relative rounded-2xl p-6", "bg-purple-900/60 backdrop-blur-md border-2 border-ai-iro/80", "animate-pulse-soft")}>
        {/* Subtle pattern overlay - like traditional Japanese textiles */}
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Corner accents - brush stroke inspired */}
        <svg className="absolute -top-1 -left-1 w-6 h-6 text-kincha/60" viewBox="0 0 24 24">
          <path d="M4 20 Q4 4 20 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg className="absolute -bottom-1 -right-1 w-6 h-6 text-kincha/60 rotate-180" viewBox="0 0 24 24">
          <path d="M4 20 Q4 4 20 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bubble pointer */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-4 h-4 bg-card border-b-2 border-r-2 border-ai-iro/60 rotate-45 -translate-y-2" />
      </div>
    </div>
  )
}
