import { useState } from "react"
import { TranslationOverlay } from "./components/TranslationOverlay"
import { OllamaStatus } from "./components/OllamaStatus"
import "./App.css"

function App() {
  const [showOllamaStatus, setShowOllamaStatus] = useState(true)

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-move"
      style={{ userSelect: "none" }}
    >
      {/* Ollama status warning (if needed) */}
      {showOllamaStatus && <OllamaStatus onDismiss={() => setShowOllamaStatus(false)} />}

      {/* Translation overlay content - entire area is draggable */}
      <div className="flex-1 flex items-center justify-center px-4 w-full">
        <TranslationOverlay />
      </div>
    </div>
  )
}

export default App
