/// Configuration for the translation service
pub struct TranslationConfig {
    pub worker_url: String,
}

impl TranslationConfig {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        // Try to load from .env file in project root
        if let Err(e) = dotenvy::dotenv() {
            println!("[WARN] Could not load .env file: {}", e);
            println!("[INFO] Please create .env with: WORKER_URL=https://translator-proxy.<your-account>.workers.dev");
        }

        let worker_url = match std::env::var("WORKER_URL") {
            Ok(url) => {
                println!("[INFO] Loaded WORKER_URL from environment");
                url
            }
            Err(_) => {
                eprintln!("[ERROR] WORKER_URL not found in environment variables!");
                eprintln!("[ERROR] Please set WORKER_URL in .env file or environment");
                eprintln!("[ERROR] Format: WORKER_URL=https://translator-proxy.<your-account>.workers.dev");
                panic!("WORKER_URL environment variable is required");
            }
        };

        Self { worker_url }
    }
}
