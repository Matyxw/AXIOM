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

pub async fn load_tenants_cache(
    db: &Surreal<Client>,
    cache: &tokio::sync::RwLock<std::collections::HashMap<String, String>>,
) -> Result<(), crate::error::AppError> {
    db.use_ns("apex").use_db("apex").await?;
    let mut response = db.query("SELECT id, phone_number_id FROM tenant").await?;
    let tenants: Vec<crate::domain::tenant::Tenant> = response.take(0)?;
    
    let mut cache_writer = cache.write().await;
    for t in tenants {
        cache_writer.insert(t.phone_number_id.clone(), t.id.clone());
    }
    tracing::info!("[cache] Cargados {} tenants en memoria", cache_writer.len());
    Ok(())
}
