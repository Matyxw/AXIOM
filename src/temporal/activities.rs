use std::sync::Arc;
use crate::state::AppState;
// FIXME: Reemplazar stubs por imports de temporal_sdk
pub struct ActContext {}

pub async fn persist_to_surrealdb(
    ctx: ActContext,
    state: Arc<AppState>,
    tenant_id: String,
    message: String,
) -> Result<(), crate::error::AppError> {
    // Aquí implementaremos la inserción usando el state.db
    Ok(())
}

pub async fn send_reply_activity(
    ctx: ActContext,
    state: Arc<AppState>,
    to: String,
    body: String,
) -> Result<(), crate::error::AppError> {
    crate::whatsapp::send_whatsapp_message(&to, &body, &state).await;
    Ok(())
}
