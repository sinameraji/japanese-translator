use crate::clipboard_manager::SmartClipboard;
use crate::translation;
use crate::config::TranslationConfig;
use serde::Serialize;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};

pub struct AppState {
    pub clipboard: Arc<Mutex<SmartClipboard>>,
    pub translation_config: TranslationConfig,
}

#[derive(Serialize, Clone)]
pub struct TranslationResult {
    pub original: String,
    pub translated: String,
    pub source_lang: String,
    pub target_lang: String,
}

/// Check Ollama and model availability
#[tauri::command]
pub async fn check_ollama_status(
    state: State<'_, AppState>,
) -> Result<translation::OllamaStatus, String> {
    let status = translation::check_ollama_status(&state.translation_config).await;
    Ok(status)
}

#[tauri::command]
pub async fn translate_selection(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<TranslationResult, String> {
    println!("[DEBUG] ===== Translation workflow started =====");

    // Emit loading event immediately to show optimistic UI
    app.emit("translation-loading", true)
        .map_err(|e| format!("Failed to emit loading event: {}", e))?;

    // Step 1-4: Copy text from user selection
    let selected_text = {
        let mut clipboard = state
            .clipboard
            .lock()
            .map_err(|e| format!("Failed to lock clipboard: {}", e))?;

        // Save current clipboard
        println!("[DEBUG] Saving current clipboard");
        clipboard
            .save_clipboard(&app)
            .map_err(|e| format!("Failed to save clipboard: {}", e))?;

        // Try to copy selected text
        let copy_result = clipboard
            .copy_with_fallback(&app)
            .map_err(|e| format!("Failed to copy text: {}", e))?;

        println!("[DEBUG] Copy result: text='{}'", copy_result.text);

        copy_result.text
    }; // Lock is released here

    println!("[DEBUG] Selected text: '{}'", selected_text);

    if selected_text.trim().is_empty() {
        let clipboard = state.clipboard.lock().map_err(|e| format!("Failed to lock clipboard: {}", e))?;
        clipboard.restore_clipboard(&app).ok();
        return Err("No text selected".to_string());
    }

    // Step 5: Detect language and get target
    let source_lang = translation::detect_language(&selected_text);
    let target_lang = translation::get_target_language(source_lang);
    println!("[DEBUG] Detected language: {} -> {}", source_lang, target_lang);

    // Step 6: Translate (async operation - no lock held)
    println!("[DEBUG] Calling translation API");
    let translation_text = translation::translate(&selected_text, target_lang, &state.translation_config)
        .await
        .map_err(|e| {
            let clipboard = state.clipboard.lock().ok();
            if let Some(cb) = clipboard {
                cb.restore_clipboard(&app).ok();
            }
            format!("Translation failed: {}", e)
        })?;

    println!("[DEBUG] Translation result: '{}'", translation_text);

    // Step 7-8: Restore clipboard (overlay-only mode, no paste)
    {
        let clipboard = state
            .clipboard
            .lock()
            .map_err(|e| format!("Failed to lock clipboard: {}", e))?;

        println!("[DEBUG] Overlay-only mode - restoring original clipboard");

        // Restore original clipboard
        clipboard
            .restore_clipboard(&app)
            .map_err(|e| format!("Failed to restore clipboard: {}", e))?;
    } // Lock is released here

    // Step 10: Create result
    let result = TranslationResult {
        original: selected_text,
        translated: translation_text.clone(),
        source_lang: source_lang.to_string(),
        target_lang: target_lang.to_string(),
    };

    // Step 11: Emit event to show overlay
    println!("[DEBUG] Emitting show-translation event to frontend");
    app.emit("show-translation", result.clone())
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    println!("[DEBUG] ===== Translation workflow completed successfully =====");
    Ok(result)
}
