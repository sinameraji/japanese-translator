use serde::{Deserialize, Serialize};
use std::time::Duration;
use crate::config::TranslationConfig;

/// Request structure for Worker API
#[derive(Serialize)]
struct WorkerRequest {
    text: String,
    target_lang: String,
}

/// Response structure from Worker API
#[derive(Deserialize)]
struct WorkerResponse {
    translation: String,
    #[allow(dead_code)]
    model: String,
    #[allow(dead_code)]
    detected_lang: Option<String>,
}

/// Error response from Worker API
#[derive(Deserialize)]
struct WorkerError {
    error: String,
    #[serde(default)]
    code: Option<String>,
}

/// Detect if text is Japanese or English
pub fn detect_language(text: &str) -> &'static str {
    let japanese_chars = text.chars().filter(|c| {
        matches!(
            *c as u32,
            0x3040..=0x309F | // Hiragana
            0x30A0..=0x30FF | // Katakana
            0x4E00..=0x9FAF | // CJK Unified Ideographs
            0x3400..=0x4DBF   // CJK Extension A
        )
    }).count();

    let total_chars = text.chars().filter(|c| !c.is_whitespace()).count();

    // If more than 10% are Japanese characters, consider it Japanese
    if total_chars > 0 && (japanese_chars as f32 / total_chars as f32) > 0.1 {
        "ja"
    } else {
        "en"
    }
}

/// Get target language based on detected source
pub fn get_target_language(detected: &str) -> &'static str {
    match detected {
        "ja" => "en",
        _ => "ja",
    }
}

/// Translate text using Cloudflare Worker proxy
pub async fn translate(text: &str, target_lang: &str, config: &TranslationConfig) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let request = WorkerRequest {
        text: text.to_string(),
        target_lang: target_lang.to_string(),
    };

    let response = client
        .post(&config.worker_url)
        .json(&request)
        .send()
        .await
        .map_err(|e| {
            if e.is_connect() {
                "Cannot reach translation service. Check your internet connection.".to_string()
            } else if e.is_timeout() {
                "Translation request timed out. Try again.".to_string()
            } else {
                format!("Translation request failed: {}", e)
            }
        })?;

    let status = response.status();

    // Handle rate limiting
    if status == reqwest::StatusCode::TOO_MANY_REQUESTS {
        return Err("Rate limit exceeded. Please wait a moment and try again.".to_string());
    }

    // Handle other errors
    if !status.is_success() {
        let error_body: WorkerError = response
            .json()
            .await
            .unwrap_or(WorkerError {
                error: format!("HTTP error: {}", status),
                code: None,
            });
        return Err(format!("Translation error: {}", error_body.error));
    }

    let worker_response: WorkerResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let translation = worker_response.translation.trim().to_string();

    if translation.is_empty() {
        return Err("Empty translation response".to_string());
    }

    Ok(translation)
}
