use std::sync::Arc;
use crate::state::AppState;
// FIXME: Reemplazar stubs por imports de temporal_sdk cuando se integre el SDK real.
// Ver temporal-rust/SKILL.md para el patrón correcto de ActContext.
pub struct ActContext {}

pub async fn persist_to_surrealdb(
    _ctx: ActContext,
    state: Arc<AppState>,
    tenant_id: String,
    wamid: String,
    message: String,
) -> Result<(), crate::error::AppError> {
    // Deduplicación + persistencia en SurrealDB bajo el namespace del tenant
    state.db.use_ns(&tenant_id).use_db("apex").await?;
    state.db
        .query("INSERT INTO messages (wamid, body, received_at) VALUES ($wamid, $body, time::now())")
        .bind(("wamid", wamid.clone()))
        .bind(("body", message.clone()))
        .await?;
    Ok(())
}

pub async fn send_reply_activity(
    _ctx: ActContext,
    state: Arc<AppState>,
    to: String,
    body: String,
) -> Result<(), crate::error::AppError> {
    // Propaga el error al Workflow de Temporal para que la RetryPolicy actúe
    crate::whatsapp::send_whatsapp_message(&state.http_client, &to, &body, &state).await
}

pub mod ingestion_whatsapp;

