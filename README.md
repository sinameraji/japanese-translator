# 🦙 Japanese Slack Translator

A beautiful, lightweight desktop app that translates selected text between Japanese and English using **Ollama** with qwen2.5:1.5b model. Works anywhere on your Mac with a global hotkey (Cmd+J).

> **Privacy-first**: Everything runs locally on your machine. No API calls to external services. No data sent anywhere.

## Features

✨ **Global Hotkey Translation**
- Press `Cmd+J` anywhere on your Mac to translate selected text
- Works in any app (Slack, Gmail, browsers, etc.)

🎯 **Smart Language Detection**
- Automatically detects if text is Japanese or English
- Translates to the opposite language

🔒 **100% Local**
- Uses Ollama + qwen2.5:1.5b model
- No internet required after initial setup
- No API keys needed
- Complete privacy

🎨 **Beautiful UI**
- Cute floating overlay with llama mascot 🦙
- Auto-hides after 10 seconds
- Copy translation with one click
- Smooth animations

⚡ **Fast Setup**
- Automatic Ollama detection
- Visual setup guide for non-technical users
- One-time installation, runs in background

## Installation

### Prerequisites
- macOS (M1/M2/M3 or Intel)
- Node.js 16+
- Rust 1.70+ (for building)

### 1. Install Ollama

Visit [ollama.ai](https://ollama.ai) and download the macOS version:
- Click "Download"
- Select your Mac type (M1/M2/M3 or Intel)
- Run the installer
- Ollama will start automatically

### 2. Download the Model

Open the Ollama app and download qwen2.5:1.5b:
```bash
# Or paste this in Terminal (Cmd+Space → type "terminal" → Enter):
ollama run qwen2.5:1.5b
```

The model is ~1GB. First run may take 1-2 minutes to download.

### 3. Setup This App

```bash
# Clone the repo
git clone https://github.com/yourusername/japanese-slack-translator.git
cd japanese-slack-translator

# Install dependencies
npm install

# Start development (hot reload)
npm run tauri dev

# Or build for production
npm run tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.

## Usage

### Basic Translation
1. Select any text (Japanese or English)
2. Press **Cmd+J** (Ctrl+J on Windows)
3. Translation appears in the overlay
4. Click "Copy" or wait 10 seconds to auto-hide

### Grant Permissions
On first run, macOS may ask for Accessibility permissions:
- Go to **System Settings** → **Privacy & Security** → **Accessibility**
- Add your Terminal app to the list
- Restart the app

### Configuration (Optional)

Create a `.env` file in the project root to customize:

```bash
# Custom Ollama server (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Different model (default: qwen2.5:1.5b)
OLLAMA_MODEL=qwen2.5:1.5b
```

Available Qwen models:
- `qwen2.5:0.5b` - Fastest (~500MB)
- `qwen2.5:1.5b` - Balanced (default, ~1GB)
- `qwen2.5:3b` - Better quality (~2GB)

## Architecture

### Frontend (React + TypeScript)
- **src/App.tsx** - Main app container
- **src/components/TranslationOverlay.tsx** - Translation result display
- **src/components/OllamaStatus.tsx** - Setup wizard & health check

### Backend (Rust + Tauri)
- **src-tauri/src/lib.rs** - Application setup & hotkey registration
- **src-tauri/src/commands.rs** - Tauri commands (translation, status check)
- **src-tauri/src/translation.rs** - Ollama API integration
- **src-tauri/src/config.rs** - Configuration management
- **src-tauri/src/clipboard_manager.rs** - Smart clipboard handling

## How It Works

1. **Hotkey Detection**: Global hotkey listener catches Cmd+J
2. **Clipboard Capture**: Simulates Cmd+C to copy selected text
3. **Language Detection**: Analyzes character ranges (Hiragana, Katakana, Kanji)
4. **Translation**: Sends prompt to local Ollama instance
5. **Display**: Shows result in overlay, user can copy
6. **Cleanup**: Restores original clipboard content

## Development

### Prerequisites
```bash
npm install      # Install Node dependencies
cargo check      # Verify Rust setup
```

### Run in Development Mode
```bash
npm run tauri dev
```

This opens the app with hot reload for frontend changes.

### Type Checking
```bash
npm run build    # TypeScript check
cargo check      # Rust check
```

### Build for Production
```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/`

## Performance

**M1/M2/M3 MacBook:**
- First translation: 2-3 seconds (model loads)
- Subsequent translations: 1-2 seconds
- Memory: ~2GB when active
- CPU: Minimal (runs in background)

**Intel Mac:**
- Similar performance, may vary based on CPU

## Troubleshooting

### "Ollama not running"
```bash
ollama serve
```

### "Model not found"
```bash
ollama pull qwen2.5:1.5b
```

### Hotkey doesn't work
Go to **System Settings** → **Privacy & Security** → **Accessibility** and add your Terminal app.

### Slow translations
- First run: Model is loading from disk (normal, ~2-3 min total)
- Check Activity Monitor for CPU/memory usage
- Consider using smaller model: `qwen2.5:0.5b`

### Translations are poor quality
- Qwen 2.5 1.5B is optimized for balance. If you need better quality:
  ```bash
  ollama pull qwen2.5:3b
  ```
  Then set `OLLAMA_MODEL=qwen2.5:3b` in `.env`

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Commit your changes (`git commit -m 'Add amazing thing'`)
4. Push to the branch (`git push origin feature/amazing-thing`)
5. Open a Pull Request

### Areas for Contribution
- Additional language support
- Performance optimizations
- Better error messages
- UI improvements
- Translation quality tweaks
- Windows/Linux support

## License

MIT License - see LICENSE file for details

**TL;DR**: Use it however you want, commercially or personally, just include the license notice.

## Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM runner
- [Qwen 2.5](https://huggingface.co/Qwen) - Language model
- [Tauri](https://tauri.app) - Desktop app framework
- [React](https://react.dev) - UI library

## Privacy & Security

✅ **No data collection**
✅ **No telemetry**
✅ **No remote API calls** (after Ollama setup)
✅ **All processing local**
✅ **Open source** (inspect the code)

## Roadmap

- [ ] Windows support
- [ ] Linux support
- [ ] Additional language pairs (Spanish, French, etc.)
- [ ] Translation history
- [ ] Custom translation styles (formal, casual, etc.)
- [ ] Voice input/output
- [ ] Batch file translation

---

Made with ❤️ for translating between Japanese and English.
