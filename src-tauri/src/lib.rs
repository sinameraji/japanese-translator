mod clipboard_manager;
mod commands;
mod config;
mod translation;
mod tray;

use clipboard_manager::SmartClipboard;
use commands::AppState;
use config::TranslationConfig;
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize SmartClipboard
            let clipboard = SmartClipboard::new()
                .map_err(|e| format!("Failed to initialize clipboard: {}", e))?;

            // Load translation config
            let translation_config = TranslationConfig::from_env();

            // Log configuration
            println!("[INFO] Translation Config:");
            println!("  Ollama URL: {}", translation_config.ollama_base_url);
            println!("  Ollama model: {}", translation_config.ollama_model);

            // Set up app state
            app.manage(AppState {
                clipboard: Arc::new(Mutex::new(clipboard)),
                translation_config,
            });

            // Register global hotkey (Cmd+J on Mac, Ctrl+J on Windows)
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                let shortcut = if cfg!(target_os = "macos") {
                    Shortcut::new(Some(Modifiers::META), Code::KeyJ)
                } else {
                    Shortcut::new(Some(Modifiers::CONTROL), Code::KeyJ)
                };

                // Try to register hotkey, but don't fail if it doesn't work
                // First set up the handler, then register the shortcut
                let handler_result = app.handle().global_shortcut().on_shortcut(shortcut, move |app_handle, _shortcut, _event| {
                    let app_clone = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        // Access state through app handle directly
                        let state_guard = app_clone.state::<AppState>();
                        let result = commands::translate_selection(app_clone.clone(), state_guard).await;
                        if let Err(e) = result {
                            eprintln!("Translation error: {}", e);
                        }
                    });
                });

                if let Err(e) = handler_result {
                    eprintln!("⚠ Failed to set up hotkey handler: {}", e);
                } else {
                    // Now try to register the shortcut
                    match app.handle().global_shortcut().register(shortcut) {
                        Ok(_) => println!("✓ Global hotkey Cmd+J registered successfully"),
                        Err(e) => {
                            eprintln!("⚠ Failed to register hotkey: {}.", e);
                            eprintln!("  You'll need to grant Accessibility permissions in System Settings:");
                            eprintln!("  System Settings → Privacy & Security → Accessibility");
                            eprintln!("  Then add your terminal app to the list and restart.");
                        }
                    }
                }
            }

            // Initialize system tray icon
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                if let Err(e) = tray::create_tray(app.handle()) {
                    eprintln!("⚠ Failed to create system tray: {}", e);
                    eprintln!("  The app will continue without a tray icon.");
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_ollama_status,
            commands::translate_selection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
