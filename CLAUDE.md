# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri desktop application for translating selected text between Japanese and English. It uses a global hotkey (Cmd+J on macOS, Ctrl+J on Windows) to capture selected text, translate it via the Gemini API, and paste the translation back - all without leaving the active application.

## Commands

### Development
- `npm run dev` - Start Vite dev server (frontend only)
- `npm run tauri dev` - Run full Tauri app in dev mode (builds Rust + frontend)
- `npm run build` - Build TypeScript and frontend
- `npm run tauri build` - Create production bundle

### Rust/Backend
- `cargo check --manifest-path src-tauri/Cargo.toml` - Type check Rust code
- `cargo build --manifest-path src-tauri/Cargo.toml` - Build Rust backend
- `cargo test --manifest-path src-tauri/Cargo.toml` - Run Rust tests

## Architecture

### Frontend (React + TypeScript)
- **src/App.tsx**: Main React component that displays translation overlay
  - Listens for `show-translation` events from Rust backend
  - Shows translation in a floating overlay window
  - Auto-hides after 10 seconds
  - Provides copy button to copy translation to clipboard

### Backend (Rust + Tauri)
The Rust backend handles all system integration and translation logic:

- **src-tauri/src/lib.rs**: Application entry point
  - Initializes Tauri plugins (clipboard, global-shortcut, opener)
  - Registers global hotkey (Cmd+J / Ctrl+J)
  - Sets up `SmartClipboard` state management
  - Wires hotkey handler to `translate_selection` command

- **src-tauri/src/commands.rs**: Tauri command handlers
  - `translate_selection`: Main workflow command
    1. Saves current clipboard content
    2. Simulates Cmd+C to copy selected text
    3. Reads clipboard to get selected text
    4. Detects language (Japanese vs English)
    5. Calls translation API
    6. Writes translation to clipboard
    7. Simulates Cmd+V to paste translation
    8. Restores original clipboard content
    9. Emits `show-translation` event to frontend

- **src-tauri/src/clipboard_manager.rs**: SmartClipboard utility
  - Manages clipboard save/restore to avoid clobbering user's clipboard
  - Uses `enigo` crate for cross-platform keyboard simulation
  - **Critical**: All keyboard operations (`copy_selection`, `paste`) MUST run on main thread via `app.run_on_main_thread()` on macOS due to Accessibility API requirements

- **src-tauri/src/translation.rs**: Translation logic
  - `detect_language()`: Detects if text contains Japanese characters (Hiragana, Katakana, Kanji)
  - `get_target_language()`: Maps source language to target (JA→EN or EN→JA)
  - `translate()`: Calls Gemini 2.0 Flash API for translation
  - **Note**: API key is hardcoded - should be moved to environment variable

### Key Tauri Configuration (tauri.conf.json)
- Window is transparent, always-on-top, borderless, non-resizable (450x250)
- Uses `macOSPrivateApi: true` for advanced window features
- Capabilities defined in `capabilities/desktop.json` for permissions

### Permissions & Platform Requirements
- **macOS**: Requires Accessibility permissions for global hotkey registration and keyboard simulation
- **Global Shortcut**: Defined in `capabilities/desktop.json` with explicit allow list
- **Clipboard Manager**: Tauri plugin for clipboard access

## Important Notes

### macOS Accessibility Permissions
The app requires macOS Accessibility permissions to:
1. Register global hotkeys (Cmd+J)
2. Simulate keyboard events (Cmd+C, Cmd+V)

If hotkey registration fails, the app prints instructions to System Settings → Privacy & Security → Accessibility.

### Clipboard Management Flow
The `SmartClipboard` pattern is critical:
1. **Save** original clipboard before any operation
2. **Copy** selected text via keyboard simulation
3. **Read** clipboard to get selected text
4. **Write** translation to clipboard
5. **Paste** translation via keyboard simulation
6. **Restore** original clipboard content

This ensures user's clipboard isn't permanently modified.

### Translation API
- Uses Gemini 2.0 Flash via REST API
- Language detection is heuristic-based (checks for Japanese Unicode ranges)
- Threshold: >10% Japanese characters → considered Japanese text

### Event Communication
Rust backend → Frontend communication uses Tauri's event system:
```rust
app.emit("show-translation", TranslationResult { ... })
```
Frontend listens with:
```typescript
listen<TranslationResult>("show-translation", (event) => { ... })
```

## Common Gotchas

1. **Main Thread Requirement**: All `enigo` keyboard operations must run on main thread on macOS. Use `app.run_on_main_thread()` with channel-based result passing.

2. **Lock Lifecycle**: Release `Mutex` locks before `await` operations to prevent deadlocks. The `translate_selection` function carefully scopes lock acquisition.

3. **API Key Security**: The Gemini API key is currently hardcoded in `translation.rs:4`. Should be moved to `.env` file or config.

4. **Window Visibility**: The Tauri window starts visible but empty. Frontend shows hint text when no translation is active.
