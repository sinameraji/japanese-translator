use serde::{Deserialize, Serialize};
use std::time::Duration;
use crate::config::TranslationConfig;

/// Status of Ollama and model availability
#[derive(Serialize, Clone, Debug)]
pub struct OllamaStatus {
    pub is_running: bool,
    pub model_available: bool,
    pub error_message: Option<String>,
}

/// Request structure for Ollama API
#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: Option<OllamaOptions>,
}

/// Options for Ollama request
#[derive(Serialize)]
struct OllamaOptions {
    temperature: f32,
    num_predict: i32,
}

/// Response structure from Ollama API
#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
    #[allow(dead_code)]
    done: bool,
    #[serde(default)]
    error: Option<String>,
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

/// Translate text using Ollama API
pub async fn translate(text: &str, target_lang: &str, config: &TranslationConfig) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let prompt = format!(
        "Translate the following Slack message to {}. Only provide the translation, nothing else:\n\n{}",
        if target_lang == "ja" { "Japanese" } else { "English" },
        text
    );

    let request = OllamaRequest {
        model: config.ollama_model.clone(),
        prompt,
        stream: false,
        options: Some(OllamaOptions {
            temperature: 0.3,
            num_predict: 512,
        }),
    };

    let url = format!("{}/api/generate", config.ollama_base_url);

    let response = client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| {
            if e.is_connect() {
                "Ollama not running. Start with: ollama serve".to_string()
            } else if e.is_timeout() {
                "Ollama request timed out".to_string()
            } else {
                format!("Ollama request failed: {}", e)
            }
        })?;

    if !response.status().is_success() {
        return Err(format!("Ollama API error: {}", response.status()));
    }

    let ollama_response: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    if let Some(error) = ollama_response.error {
        return Err(format!("Ollama error: {}", error));
    }

    let translation = ollama_response.response.trim().to_string();

    if translation.is_empty() {
        return Err("Empty translation response".to_string());
    }

    Ok(translation)
}

/// Check if Ollama is running and model is available
pub async fn check_ollama_status(config: &TranslationConfig) -> OllamaStatus {
    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return OllamaStatus {
                is_running: false,
                model_available: false,
                error_message: Some(format!("HTTP client error: {}", e)),
            }
        }
    };

    // Check if Ollama is running
    let health_url = format!("{}/api/tags", config.ollama_base_url);
    let health_response = match client.get(&health_url).send().await {
        Ok(resp) => resp,
        Err(e) => {
            return OllamaStatus {
                is_running: false,
                model_available: false,
                error_message: Some(format!("Ollama not running: {}", e)),
            }
        }
    };

    if !health_response.status().is_success() {
        return OllamaStatus {
            is_running: false,
            model_available: false,
            error_message: Some(format!("Ollama API error: {}", health_response.status())),
        };
    }

    // Parse response to check for model
    #[derive(Deserialize)]
    struct TagsResponse {
        models: Option<Vec<ModelInfo>>,
    }

    #[derive(Deserialize)]
    struct ModelInfo {
        name: String,
    }

    let tags_response: TagsResponse = match health_response.json().await {
        Ok(r) => r,
        Err(e) => {
            return OllamaStatus {
                is_running: true,
                model_available: false,
                error_message: Some(format!("Failed to parse models: {}", e)),
            }
        }
    };

    let model_available = tags_response
        .models
        .as_ref()
        .map(|models| {
            models.iter().any(|m| {
                m.name.contains(&config.ollama_model) || m.name.starts_with(&config.ollama_model)
            })
        })
        .unwrap_or(false);

    OllamaStatus {
        is_running: true,
        model_available,
        error_message: if !model_available {
            Some(format!("Model '{}' not found", config.ollama_model))
        } else {
            None
        },
    }
}
