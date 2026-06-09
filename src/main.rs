mod config;
mod error;
mod domain;
mod handlers;
mod models;
mod state;
mod temporal;
mod whatsapp;

use std::sync::Arc;
use tracing::info;
use surrealdb::{engine::remote::ws::{Client, Ws}, Surreal};

use crate::config::AppConfig;
use crate::state::AppState;

const CHANNEL_BUFFER: usize = 100;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let config = AppConfig::from_env()?;

    let db: Surreal<Client> = Surreal::new::<Ws>("ws://localhost:8000").await?;
    db.use_ns("apex").use_db("apex").await?;
    info!("[main] Conexión a SurrealDB establecida (ws://localhost:8000 | ns=apex db=apex)");

    let tenant_cache = Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new()));
    // TODO: load_tenants_cache(&db, &tenant_cache).await;

    let state = Arc::new(AppState {
        wa_app_secret: Arc::new(config.wa_app_secret),
        wa_access_token: Arc::new(config.wa_access_token),
        wa_phone_id: Arc::new(config.wa_phone_id),
        wa_verify_token: Arc::new(config.wa_verify_token),
        db: Arc::new(db),
        tenant_cache,
        // temporal_client,
    });

    // TODO: Init Temporal Worker here
    info!("[main] Temporal Worker config goes here");

    let app = handlers::app_router(Arc::clone(&state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;
    info!("[main] Servidor escuchando en http://0.0.0.0:3001");

    axum::serve(listener, app).await?;

    Ok(())
}
