use enigo::{Direction::{Press, Release}, Enigo, Key, Keyboard, Settings};
use std::{sync::mpsc, thread, time::Duration};
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

pub struct CopyResult {
    pub text: String,
}

pub struct SmartClipboard {
    saved_clipboard: Option<String>,
}

impl SmartClipboard {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            saved_clipboard: None,
        })
    }

    /// Save current clipboard contents
    pub fn save_clipboard(&mut self, app: &AppHandle) -> Result<(), String> {
        self.saved_clipboard = app
            .clipboard()
            .read_text()
            .ok()
            .and_then(|t| if t.is_empty() { None } else { Some(t) });
        Ok(())
    }

    /// Simulate Cmd+C or Ctrl+C to copy selected text
    /// MUST be called with an AppHandle to dispatch to main thread on macOS
    pub fn copy_selection(&mut self, app: &AppHandle) -> Result<(), String> {
        thread::sleep(Duration::from_millis(50));

        // Create channel to wait for main thread operation
        let (tx, rx) = mpsc::channel();

        // Dispatch keyboard operation to main thread (required on macOS)
        app.run_on_main_thread(move || {
            let result: Result<(), String> = (|| {
                let mut enigo = Enigo::new(&Settings::default())
                    .map_err(|e| format!("Failed to create Enigo: {}", e))?;

                #[cfg(target_os = "macos")]
                {
                    println!("[DEBUG] Starting Cmd+C keyboard simulation");
                    enigo
                        .key(Key::Meta, Press)
                        .map_err(|e| format!("Failed to press Cmd: {}", e))?;
                    enigo
                        .key(Key::Unicode('c'), Press)
                        .map_err(|e| format!("Failed to press C: {}", e))?;
                    thread::sleep(Duration::from_millis(10));
                    enigo
                        .key(Key::Unicode('c'), Release)
                        .map_err(|e| format!("Failed to release C: {}", e))?;
                    enigo
                        .key(Key::Meta, Release)
                        .map_err(|e| format!("Failed to release Cmd: {}", e))?;
                    println!("[DEBUG] Completed Cmd+C keyboard simulation");
                }

                #[cfg(not(target_os = "macos"))]
                {
                    println!("[DEBUG] Starting Ctrl+C keyboard simulation");
                    enigo
                        .key(Key::Control, Press)
                        .map_err(|e| format!("Failed to press Ctrl: {}", e))?;
                    enigo
                        .key(Key::Unicode('c'), Press)
                        .map_err(|e| format!("Failed to press C: {}", e))?;
                    thread::sleep(Duration::from_millis(10));
                    enigo
                        .key(Key::Unicode('c'), Release)
                        .map_err(|e| format!("Failed to release C: {}", e))?;
                    enigo
                        .key(Key::Control, Release)
                        .map_err(|e| format!("Failed to release Ctrl: {}", e))?;
                    println!("[DEBUG] Completed Ctrl+C keyboard simulation");
                }

                thread::sleep(Duration::from_millis(100));
                Ok(())
            })();

            let _ = tx.send(result);
        })
        .map_err(|e| format!("Failed to dispatch to main thread: {}", e))?;

        // Wait for main thread operation to complete
        rx.recv()
            .map_err(|e| format!("Main thread operation failed: {}", e))??;

        Ok(())
    }

    /// Try to copy text from user selection
    /// Returns the text and always marks needed_select_all as false (no paste, overlay only)
    pub fn copy_with_fallback(&mut self, app: &AppHandle) -> Result<CopyResult, String> {
        // Save clipboard state before any operations
        let clipboard_before = self.read_clipboard(app).ok();
        println!("[DEBUG] Clipboard before operations: {:?}", clipboard_before);

        // Attempt 1: Try to copy selected text
        println!("[DEBUG] Attempt 1: Checking for user selection");
        self.copy_selection(app)?;
        thread::sleep(Duration::from_millis(100));
        let text = self.read_clipboard(app)?;

        // Check if we got NEW text (different from before)
        let got_new_text = !text.trim().is_empty() &&
                           clipboard_before.as_deref() != Some(text.as_str());

        if got_new_text {
            println!("[DEBUG] Attempt 1 succeeded: user has selection '{}'", text);
            return Ok(CopyResult { text });
        }

        // Attempt 2: Try again with longer delay (for slow apps)
        println!("[DEBUG] Attempt 2: Retrying with longer delay");
        self.copy_selection(app)?;
        thread::sleep(Duration::from_millis(150));
        let text_retry = self.read_clipboard(app)?;

        let got_new_text_retry = !text_retry.trim().is_empty() &&
                                  clipboard_before.as_deref() != Some(text_retry.as_str());

        if got_new_text_retry {
            println!("[DEBUG] Attempt 2 succeeded: user has selection '{}'", text_retry);
            return Ok(CopyResult { text: text_retry });
        }

        // Safeguard: If clipboard has substantial content, use it (overlay-only)
        // This handles apps like Slack where message selection doesn't respond to Cmd+C
        if let Some(existing) = clipboard_before {
            if existing.trim().len() > 5 {
                println!("[DEBUG] No new text copied but clipboard has content ('{}'), using it", existing);
                return Ok(CopyResult { text: existing });
            }
        }

        // No text found - return error
        Err("No text selected. Please select text before pressing Cmd+J.".to_string())
    }

    /// Read clipboard contents
    pub fn read_clipboard(&self, app: &AppHandle) -> Result<String, String> {
        app.clipboard()
            .read_text()
            .map_err(|e| format!("Failed to read clipboard: {}", e))
    }

    /// Write text to clipboard
    pub fn write_clipboard(&self, app: &AppHandle, text: &str) -> Result<(), String> {
        app.clipboard()
            .write_text(text.to_string())
            .map_err(|e| format!("Failed to write clipboard: {}", e))
    }

    /// Restore saved clipboard contents
    pub fn restore_clipboard(&self, app: &AppHandle) -> Result<(), String> {
        if let Some(original) = &self.saved_clipboard {
            self.write_clipboard(app, original)?;
        }
        Ok(())
    }
}
