// FIXME: Reemplazar stubs por imports de temporal_sdk cuando la dependencia esté resuelta
pub struct WorkflowContext {}
pub type WorkflowResult<T> = Result<T, crate::error::AppError>;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct InboundMessage {
    pub tenant_id: String,
    pub from: String,
    pub text: String,
}

pub async fn message_processing_workflow(
    ctx: WorkflowContext,
    msg: InboundMessage,
) -> WorkflowResult<()> {
    // 1. Log the incoming message
    // ctx.activity(...)
    Ok(())
}

pub mod ingestion_whatsapp;
