/// Configuration for the translation service
pub struct TranslationConfig {
    pub ollama_base_url: String,
    pub ollama_model: String,
}

impl TranslationConfig {
    /// Load configuration from environment variables or use defaults
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            ollama_base_url: std::env::var("OLLAMA_BASE_URL")
                .unwrap_or_else(|_| "http://localhost:11434".to_string()),
            ollama_model: std::env::var("OLLAMA_MODEL")
                .unwrap_or_else(|_| "qwen2.5:1.5b".to_string()),
        }
    }
}
