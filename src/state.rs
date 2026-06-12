use std::sync::Arc;
use surrealdb::{engine::remote::ws::Client, Surreal};

pub struct AppState {
    pub wa_app_secret: Arc<String>,
    pub wa_access_token: Arc<String>,
    pub wa_phone_id: Arc<String>,
    pub wa_verify_token: Arc<String>,
    pub db: Arc<Surreal<Client>>,
    pub tenant_cache: Arc<tokio::sync::RwLock<std::collections::HashMap<String, String>>>,
    /// Pool de conexiones HTTP reutilizable — NUNCA crear reqwest::Client::new() fuera de AppState.
    pub http_client: reqwest::Client,
    // pub temporal_client: Arc<temporal_client::Client>, // Añadir al integrar Temporal SDK
}
