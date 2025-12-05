"use client"

import { cn } from "@/lib/utils"

type MascotState = "idle" | "loading" | "success"

interface UmaMascotProps {
  state: MascotState
  className?: string
}

// Uma-chan - a cute horse mascot representing the "horse" in Jinba Ittai
export function UmaMascot({ state, className }: UmaMascotProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 140 120"
        className={cn(
          "w-24 h-20 transition-transform duration-300",
          state === "idle" && "animate-float",
          state === "loading" && "animate-gallop",
          state === "success" && "animate-success-bounce",
        )}
      >
        {/* Body */}
        <ellipse cx="70" cy="75" rx="40" ry="28" className="fill-cream stroke-ai-iro" strokeWidth="2" />

        {/* Head */}
        <ellipse cx="70" cy="40" rx="24" ry="22" className="fill-cream stroke-ai-iro" strokeWidth="2" />

        {/* Snout */}
        <ellipse cx="70" cy="52" rx="14" ry="10" className="fill-sakura-soft stroke-ai-iro" strokeWidth="1.5" />

        {/* Left ear */}
        <path
          d="M 50 22 L 42 4 L 54 16 Z"
          className={cn("fill-cream stroke-ai-iro", state === "idle" && "animate-ear-twitch")}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transformOrigin: "50px 22px" }}
        />
        <path d="M 50 20 L 46 10 L 52 16 Z" className="fill-sakura-soft/60" />

        {/* Right ear */}
        <path
          d="M 90 22 L 98 4 L 86 16 Z"
          className={cn("fill-cream stroke-ai-iro", state === "idle" && "animate-ear-twitch")}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transformOrigin: "90px 22px", animationDelay: "0.5s" }}
        />
        <path d="M 90 20 L 94 10 L 88 16 Z" className="fill-sakura-soft/60" />

        {/* Mane */}
        <path
          d="M 55 18 Q 60 8 70 12 Q 80 8 85 18"
          className={cn("fill-ai-iro stroke-ai-iro", state === "loading" && "animate-mane-flow")}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 58 22 Q 65 14 72 18 Q 79 14 82 22"
          className={cn("fill-ai-light stroke-ai-light", state === "loading" && "animate-mane-flow")}
          strokeWidth="1.5"
          style={{ animationDelay: "0.1s" }}
        />

        {/* Eyes - different states */}
        {state === "idle" ? (
          // Peaceful/content eyes
          <>
            <path d="M 58 36 Q 62 40 66 36" className="stroke-sumi fill-none" strokeWidth="2" strokeLinecap="round" />
            <path d="M 74 36 Q 78 40 82 36" className="stroke-sumi fill-none" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : state === "loading" ? (
          // Focused/determined eyes
          <>
            <g className="animate-blink" style={{ transformOrigin: "62px 36px" }}>
              <ellipse cx="62" cy="36" rx="5" ry="6" className="fill-sumi" />
              <circle cx="64" cy="34" r="2" className="fill-white" />
            </g>
            <g className="animate-blink" style={{ transformOrigin: "78px 36px", animationDelay: "0.1s" }}>
              <ellipse cx="78" cy="36" rx="5" ry="6" className="fill-sumi" />
              <circle cx="80" cy="34" r="2" className="fill-white" />
            </g>
          </>
        ) : (
          // Happy sparkle eyes
          <>
            <path d="M 58 34 L 62 38 L 66 34 L 62 30 Z" className="fill-kincha" />
            <path d="M 74 34 L 78 38 L 82 34 L 78 30 Z" className="fill-kincha" />
          </>
        )}

        {/* Nostrils */}
        <circle cx="65" cy="54" r="2" className="fill-ai-iro/40" />
        <circle cx="75" cy="54" r="2" className="fill-ai-iro/40" />

        {/* Mouth */}
        {state === "success" ? (
          <path d="M 62 58 Q 70 65 78 58" className="stroke-sumi fill-none" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M 65 58 Q 70 60 75 58" className="stroke-sumi fill-none" strokeWidth="1.5" strokeLinecap="round" />
        )}

        {/* Blush marks */}
        <ellipse cx="52" cy="42" rx="4" ry="2.5" className="fill-sakura-soft/70" />
        <ellipse cx="88" cy="42" rx="4" ry="2.5" className="fill-sakura-soft/70" />

        {/* Legs */}
        <rect x="45" y="95" width="8" height="16" rx="4" className="fill-cream stroke-ai-iro" strokeWidth="1.5" />
        <rect x="60" y="95" width="8" height="16" rx="4" className="fill-cream stroke-ai-iro" strokeWidth="1.5" />
        <rect x="72" y="95" width="8" height="16" rx="4" className="fill-cream stroke-ai-iro" strokeWidth="1.5" />
        <rect x="87" y="95" width="8" height="16" rx="4" className="fill-cream stroke-ai-iro" strokeWidth="1.5" />

        {/* Hooves */}
        <rect x="45" y="108" width="8" height="4" rx="2" className="fill-ai-iro" />
        <rect x="60" y="108" width="8" height="4" rx="2" className="fill-ai-iro" />
        <rect x="72" y="108" width="8" height="4" rx="2" className="fill-ai-iro" />
        <rect x="87" y="108" width="8" height="4" rx="2" className="fill-ai-iro" />

        {/* Tail */}
        <path
          d="M 110 70 Q 125 65 120 55 Q 130 60 125 50"
          className={cn("stroke-ai-iro fill-none", state === "success" && "animate-tail-swish")}
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin: "110px 70px" }}
        />
        <path
          d="M 112 72 Q 122 68 118 60"
          className="stroke-ai-light fill-none"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* State decorations */}
      {state === "idle" && (
        <div className="absolute -top-1 right-0 flex gap-0.5">
          <span className="text-xs text-ai-light animate-float" style={{ animationDelay: "0s" }}>
            ~
          </span>
          <span className="text-xs text-ai-light animate-float" style={{ animationDelay: "0.3s" }}>
            ~
          </span>
        </div>
      )}

      {state === "success" && (
        <>
          <Sparkle className="absolute -top-2 left-2 w-4 h-4 text-kincha" delay={0} />
          <Sparkle className="absolute top-0 -right-1 w-3 h-3 text-ai-light" delay={0.2} />
          <Sparkle className="absolute bottom-4 -left-2 w-3 h-3 text-sakura-soft" delay={0.4} />
        </>
      )}
    </div>
  )
}

function Sparkle({ className, delay }: { className?: string; delay: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
      fill="currentColor"
    >
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  )
}
