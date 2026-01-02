# 🦙 Japanese Slack Translator

A beautiful, lightweight desktop app that translates selected text between Japanese and English using **Cloudflare Workers AI** with Gemma 3. Works anywhere on your Mac with a global hotkey (Cmd+J).

> **Cloud-Powered**: Powered by Cloudflare Workers AI for accurate translations. Requires internet connection.

## Features

✨ **Global Hotkey Translation**
- Press `Cmd+J` anywhere on your Mac to translate selected text
- Works in any app (Slack, Gmail, browsers, etc.)

🎯 **Smart Language Detection**
- Automatically detects if text is Japanese or English
- Translates to the opposite language

☁️ **Cloud-Powered**
- Uses Cloudflare Workers AI with Gemma 3 model (140+ languages)
- Requires internet connection
- Powered by global edge network for low latency
- Your translations are processed by Cloudflare (see their privacy policy)

🎨 **Beautiful UI**
- Cute floating overlay with llama mascot 🦙
- Auto-hides after 10 seconds
- Copy translation with one click
- Smooth animations

⚡ **Zero Setup**
- Cloud-based, nothing to install except the app
- Works immediately after download
- Automatic configuration from Cloudflare Worker URL

## Installation

### Prerequisites
- macOS (M1/M2/M3 or Intel)
- Node.js 16+ (for development)
- Rust 1.70+ (for building)
- Internet connection (for translations)

### 1. Deploy Cloudflare Worker

First, set up the translation backend by deploying a Cloudflare Worker:

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **Create application** → **Create Worker**
3. Name it: `translator-proxy`
4. Copy the Worker code from the [plan documentation](/plans/wiggly-forging-fairy.md)
5. Paste into the Worker editor and deploy
6. Copy your Worker URL: `https://translator-proxy.<your-account>.workers.dev`

### 2. Setup This App

```bash
# Clone the repo
git clone https://github.com/yourusername/japanese-slack-translator.git
cd japanese-slack-translator

# Install dependencies
npm install

# Install Cargo
curl https://sh.rustup.rs -sSf | sh


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

### Configuration

Create a `.env` file in the project root with your Cloudflare Worker URL:

```bash
# Your Cloudflare Worker URL (from step 1)
WORKER_URL=https://translator-proxy.<your-account>.workers.dev
```

Replace `<your-account>` with your Cloudflare account subdomain.

## Architecture

### Frontend (React + TypeScript)
- **src/App.tsx** - Main app container
- **src/components/TranslationOverlay.tsx** - Translation result display

### Backend (Rust + Tauri)
- **src-tauri/src/lib.rs** - Application setup & hotkey registration
- **src-tauri/src/commands.rs** - Tauri commands (translation)
- **src-tauri/src/translation.rs** - Cloudflare Worker integration
- **src-tauri/src/config.rs** - Configuration management
- **src-tauri/src/clipboard_manager.rs** - Smart clipboard handling

## How It Works

1. **Hotkey Detection**: Global hotkey listener catches Cmd+J
2. **Clipboard Capture**: Simulates Cmd+C to copy selected text
3. **Language Detection**: Analyzes character ranges (Hiragana, Katakana, Kanji)
4. **Translation**: Sends text to Cloudflare Worker proxy for translation
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

**All MacBooks:**
- Translation latency: 1-2 seconds (network + cloud processing)
- Powered by Cloudflare's global edge network for low latency
- Memory: Minimal (cloud processing)
- CPU: Minimal (only clipboard + UI operations)

**Requirements:**
- Stable internet connection (required for translations)
- Cloudflare Worker endpoint must be reachable

## Troubleshooting

### "Cannot reach translation service"
- Check your internet connection
- Verify your Cloudflare Worker is deployed and running
- Check your `WORKER_URL` in `.env` is correct

### Hotkey doesn't work
Go to **System Settings** → **Privacy & Security** → **Accessibility** and add your Terminal app.

### Slow translations
- Check your internet connection speed
- Cloudflare Workers have global edge deployment, so latency is usually <1s
- If translations are slow, it may be a network issue on your end

### Translations are poor quality
- Gemma 3 is a high-quality model (12B parameters)
- If translations seem off, try rephrasing your input
- The model is multilingual and optimized for 140+ languages including Japanese

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

- [Cloudflare Workers AI](https://workers.cloudflare.com/product/workers-ai) - Cloud-based AI translation
- [Google Gemma 3](https://ai.google.dev/gemma) - Language model
- [Tauri](https://tauri.app) - Desktop app framework
- [React](https://react.dev) - UI library

## Privacy & Security

✅ **No telemetry**
✅ **Cloud-based processing** (via Cloudflare)
✅ **No credentials in desktop app** (API token stays server-side)
✅ **Rate limiting** (100 requests/hour per IP)
✅ **Open source** (inspect the code)

⚠️ **Privacy Note**: Your translations are processed by Cloudflare. See [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/) for details.

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
