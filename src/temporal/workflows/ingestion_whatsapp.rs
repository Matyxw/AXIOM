use serde::{Deserialize, Serialize};
use temporalio_sdk::{WorkflowContext, WorkflowResult, ActivityOptions};
use temporalio_macros::{workflow, workflow_methods};
use std::time::Duration;
use crate::temporal::activities::ingestion_whatsapp::{IngestionActivities, DispatchInput};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IngestionWhatsappInput {
    pub tenant_id: String,
    pub wamid: String,
    pub from_phone: String,
    pub body: String,
}

#[workflow]
#[derive(Default)]
pub struct IngestionWhatsappWorkflow;

#[workflow_methods]
impl IngestionWhatsappWorkflow {
    #[run]
    pub async fn run(
        ctx: &mut WorkflowContext<Self>,
        input: IngestionWhatsappInput,
    ) -> WorkflowResult<()> {
        // 1. Deduplicación e Idempotencia
        let dedup_output = ctx.start_activity(
            IngestionActivities::deduplicate_and_persist_activity,
            input.clone(),
            ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
        ).await?;

        if !dedup_output.is_new {
            return Ok(());
        }

        // 2. Análisis de Intención (LLM)
        let intent_output = ctx.start_activity(
            IngestionActivities::analyze_intent_activity,
            input.clone(),
            ActivityOptions::start_to_close_timeout(Duration::from_secs(20)),
        ).await?;

        // 3. Despacho de Respuesta
        let dispatch_input = DispatchInput {
            to_phone: input.from_phone.clone(),
            intent: intent_output.intent,
        };
        
        ctx.start_activity(
            IngestionActivities::dispatch_reply_activity,
            dispatch_input,
            ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
        ).await?;

        Ok(())
    }
}
