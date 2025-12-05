"use client"

import { useState, useEffect, useRef } from "react"
import { listen } from "@tauri-apps/api/event"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { cn } from "@/lib/utils"
import { UmaMascot } from "./UmaMascot"
import { SpeechBubble } from "./SpeechBubble"
import { FloatingKanji } from "./FloatingKanji"
import { Confetti } from "./Confetti"
import { Copy, Check, Sparkles } from "lucide-react"

type OverlayState = "idle" | "loading" | "result"

interface TranslationResult {
  original: string
  translated: string
  source_lang: string
  target_lang: string
}

export function TranslationOverlay() {
  const [state, setState] = useState<OverlayState>("idle")
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [confettiTrigger, setConfettiTrigger] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Listen for loading state
    const unlistenLoading = listen<boolean>("translation-loading", () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }

      setState("loading")
      setResult(null)
      getCurrentWindow().show()
    })

    // Listen for translation results
    const unlisten = listen<TranslationResult>("show-translation", (event) => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }

      setResult(event.payload)
      setState("result")
      setCopied(false)
      getCurrentWindow().show()

      // Auto-hide after 10 seconds
      hideTimeoutRef.current = setTimeout(() => {
        handleClose()
        hideTimeoutRef.current = null
      }, 10000)
    })

    // Cleanup on unmount
    return () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current)
      }
      unlistenLoading.then((fn) => fn())
      unlisten.then((fn) => fn())
    }
  }, [])

  const handleCopy = async () => {
    if (result) {
      await writeText(result.translated)
      setCopied(true)
      setConfettiTrigger(true)
      setTimeout(() => {
        setCopied(false)
        setConfettiTrigger(false)
      }, 2000)
    }
  }

  const handleClose = async () => {
    setState("idle")
    setResult(null)
    await getCurrentWindow().hide()
  }

  const getMascotState = () => {
    if (state === "loading") return "loading"
    if (state === "result") return "success"
    return "idle"
  }

  return (
    <div className="relative flex flex-col items-center gap-4 w-full px-2">
      {/* Floating kanji during loading */}
      <FloatingKanji isActive={state === "loading"} />

      {/* Confetti on copy */}
      <Confetti trigger={confettiTrigger} />

      {/* Main content */}
      <SpeechBubble isVisible={true} className="w-full max-w-lg">
        {state === "idle" && <IdleContent />}
        {state === "loading" && <LoadingContent />}
        {state === "result" && result && <ResultContent result={result} onCopy={handleCopy} copied={copied} />}
      </SpeechBubble>

      {/* Mascot */}
      <UmaMascot state={getMascotState()} />
    </div>
  )
}

function IdleContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Unity symbol - Jinba Ittai */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-ai-iro/20 animate-unity-pulse" />
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ai-light to-kincha flex items-center justify-center animate-spin-slow relative z-10">
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
            <span className="text-2xl">🐴</span>
          </div>
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-kincha animate-float" />
      </div>

      {/* Keyboard shortcut display */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Press</span>
        <kbd className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm font-mono font-semibold shadow-sm">
          Cmd+J
        </kbd>
        <span className="text-muted-foreground text-sm">to translate</span>
      </div>

      <p className="text-xs text-muted-foreground">One with your words</p>
    </div>
  )
}

function LoadingContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Custom loading spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-ai-iro border-r-ai-light animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-kincha border-l-ai-light animate-spin-slow"
          style={{ animationDirection: "reverse" }}
        />
      </div>

      {/* Loading text with animated dots */}
      <div className="flex items-center gap-1">
        <span className="text-lg font-semibold bg-gradient-to-r from-ai-light to-kincha bg-clip-text text-transparent">
          翻訳中
        </span>
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ai-iro typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-ai-light typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-kincha typing-dot" />
        </span>
      </div>

      <span className="text-sm text-muted-foreground">Becoming one with your message...</span>
    </div>
  )
}

interface ResultContentProps {
  result: TranslationResult
  onCopy: () => void
  copied: boolean
}

function ResultContent({ result, onCopy, copied }: ResultContentProps) {
  const [fromLang, toLang] = result.source_lang === "ja" ? ["JA", "EN"] : ["EN", "JA"]

  return (
    <div className="flex flex-col gap-4">
      {/* Language direction header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full bg-ai-iro/20 text-ai-light text-xs font-bold">{fromLang}</span>
          {/* Animated arrow with brush stroke effect */}
          <svg className="w-6 h-6 text-kincha" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12 L19 12 M19 12 L12 5 M19 12 L12 19"
              className="stroke-current animate-brush-stroke"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="px-2 py-1 rounded-full bg-ai-light/20 text-ai-light text-xs font-bold">{toLang}</span>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "Escape" })
            window.dispatchEvent(event)
          }}
          className="w-6 h-6 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          ×
        </button>
      </div>

      {/* Translated text */}
      <p className="text-foreground leading-relaxed text-sm">{result.translated}</p>

      {/* Copy button */}
      <button
        onClick={onCopy}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
          "font-semibold text-sm transition-all duration-200",
          copied
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            : "bg-gradient-to-r from-ai-iro to-ai-light text-cream hover:opacity-90",
          copied && "animate-success-bounce",
        )}
        style={{ userSelect: "none" }}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  )
}
