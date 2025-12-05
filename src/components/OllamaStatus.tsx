"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OllamaStatusData {
  is_running: boolean
  model_available: boolean
  error_message: string | null
}

interface OllamaStatusProps {
  onDismiss?: () => void
}

export function OllamaStatus({ onDismiss }: OllamaStatusProps) {
  const [status, setStatus] = useState<OllamaStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  useEffect(() => {
    checkOllamaStatus()
    // Recheck every 5 seconds
    const interval = setInterval(checkOllamaStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkOllamaStatus = async () => {
    try {
      const response = await (window as any).__TAURI_INTERNALS__.invoke("check_ollama_status")
      setStatus(response)
      setLoading(false)
    } catch (error) {
      console.error("Failed to check Ollama status:", error)
      setStatus({
        is_running: false,
        model_available: false,
        error_message: "Failed to check status",
      })
      setLoading(false)
    }
  }

  if (loading || !status) {
    return null
  }

  // Everything is good - don't show anything
  if (status.is_running && status.model_available) {
    return null
  }

  const copyToClipboard = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedCommand(command)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    checkOllamaStatus()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-4 pointer-events-auto z-50">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with cute icon */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-border p-4 flex items-start gap-3 flex-shrink-0">
          <div className="text-3xl flex-shrink-0 mt-0.5">🦙</div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-foreground">Ollama Setup Needed</h2>
            <p className="text-sm text-muted-foreground mt-1">Let's get your translator ready!</p>
          </div>
          {!onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              ×
            </button>
          )}
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          <div className="p-4 space-y-4">
          {/* Status indicators */}
          <div className="space-y-2">
            <div className={cn("flex items-center gap-2 text-sm p-2 rounded-lg", status.is_running ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")}>
              <div className={cn("w-2 h-2 rounded-full", status.is_running ? "bg-green-500" : "bg-red-500")} />
              <span>{status.is_running ? "✓ Ollama is running" : "✗ Ollama is not running"}</span>
            </div>

            <div className={cn("flex items-center gap-2 text-sm p-2 rounded-lg", status.model_available ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")}>
              <div className={cn("w-2 h-2 rounded-full", status.model_available ? "bg-green-500" : "bg-red-500")} />
              <span>{status.model_available ? "✓ Model is installed" : "✗ Model not installed"}</span>
            </div>
          </div>

          {/* Download Ollama Guide */}
            <div className="space-y-3">
              {!status.is_running && (
                <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-200/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">1️⃣</div>
                    <span className="font-semibold text-sm">Install Ollama</span>
                  </div>
                  <ol className="text-xs text-muted-foreground space-y-1.5 ml-8">
                    <li>• Go to <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">ollama.ai</a></li>
                    <li>• Click "Download" button</li>
                    <li>• Click the version for your Mac (M1/M2/M3)</li>
                    <li>• Follow the installer steps (just click Next)</li>
                    <li>• Ollama will start automatically!</li>
                  </ol>
                </div>
              )}

              {!status.model_available && (
                <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-200/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">2️⃣</div>
                    <span className="font-semibold text-sm">Get the Model</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard("ollama run qwen2.5:1.5b")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                      "bg-card border border-border hover:bg-muted transition-colors",
                      "font-mono text-xs text-left text-muted-foreground",
                    )}
                  >
                    <code>ollama run qwen2.5:1.5b</code>
                    {copiedCommand === "ollama run qwen2.5:1.5b" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <ol className="text-xs text-muted-foreground space-y-1 ml-8">
                    <li>1. Press Cmd + Space</li>
                    <li>2. Type "terminal" & press Enter</li>
                    <li>3. Paste the command above</li>
                    <li>4. Wait ~2 minutes ✨</li>
                  </ol>
                </div>
              )}

              {status.error_message && !status.is_running && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Not Sure?</p>
                    <p className="text-xs text-amber-800 mt-1">
                      Visit <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:opacity-75">ollama.ai</a> for detailed installation help
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border p-3 flex gap-2 flex-shrink-0">
          <button
            onClick={handleRetry}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg font-semibold text-sm",
              "bg-gradient-to-r from-ai-iro to-ai-light text-cream",
              "hover:opacity-90 transition-opacity",
            )}
          >
            Check Again
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm border border-border hover:bg-muted transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
