#![allow(dead_code)]
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
    if let Err(e) = crate::state::load_tenants_cache(&db, &tenant_cache).await {
        tracing::error!("[main] Error al cargar caché de tenants (el webhook descartará mensajes): {}", e);
    }

    let temporal_target = std::env::var("TEMPORAL_ADDRESS").unwrap_or_else(|_| "http://localhost:7233".to_string());
    let url: reqwest::Url = temporal_target.parse().expect("URL de Temporal inválida");
    let conn_opts = temporalio_client::ConnectionOptions::new(url).build();
    let temporal_connection = temporalio_client::Connection::connect(conn_opts).await.expect("Error al conectar a Temporal");
    
    let client_opts = temporalio_client::ClientOptions::new("default".to_string()).build();
    let temporal_client = Arc::new(temporalio_client::Client::new(temporal_connection, client_opts).expect("Fallo al construir el cliente"));
    info!("[main] Conexión a Temporal Server establecida exitosamente.");

    let state = Arc::new(AppState {
        wa_app_secret: Arc::new(config.wa_app_secret),
        wa_access_token: Arc::new(config.wa_access_token),
        wa_phone_id: Arc::new(config.wa_phone_id),
        wa_verify_token: Arc::new(config.wa_verify_token),
        db: Arc::new(db),
        tenant_cache,
        http_client: reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .build()
            .expect("fallo al construir reqwest::Client"),
        temporal_client: temporal_client.clone(),
    });

    let activities = crate::temporal::activities::ingestion_whatsapp::IngestionActivities {
        state: state.clone(),
    };

    let worker_opts = temporalio_sdk::WorkerOptions::new("axiom-main".to_string()).build();
    let runtime_opts = temporalio_sdk_core::RuntimeOptions::default();
    
    let tc_clone = temporal_client.clone();
    
    std::thread::spawn(move || {
        // SAFETY: Fallar aquí significa que el OS no puede crear threads para el worker
        let rt = tokio::runtime::Builder::new_current_thread().enable_all().build().expect("Fallo al crear tokio runtime");
        rt.block_on(async {
            tokio::task::LocalSet::new().run_until(async {
                let runtime = temporalio_sdk_core::CoreRuntime::new_assume_tokio(runtime_opts)
                    .expect("Fallo al crear CoreRuntime");
                
                let mut worker = temporalio_sdk::Worker::new(
                    &runtime,
                    (*tc_clone).clone(),
                    worker_opts,
                )
                .expect("Fallo al crear Temporal Worker");
                
                worker.register_workflow::<crate::temporal::workflows::ingestion_whatsapp::IngestionWhatsappWorkflow>()
                .expect("Fallo al registrar IngestionWhatsappWorkflow")
                .register_activities(activities);

                info!("[main] Iniciando Temporal Worker para task_queue: axiom-main");
                if let Err(e) = worker.run().await {
                    tracing::error!("Error en Temporal Worker: {:?}", e);
                }
            }).await;
        });
    });

    let app = handlers::app_router(Arc::clone(&state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;
    info!("[main] Servidor escuchando en http://0.0.0.0:3001");

    axum::serve(listener, app).await?;

    Ok(())
}
