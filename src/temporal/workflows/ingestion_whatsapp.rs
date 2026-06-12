use serde::{Deserialize, Serialize};
use temporal_sdk::{WfContext, WfExitValue, WorkflowResult};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IngestionWhatsappInput {
    pub tenant_id: String,
    pub wamid: String,
    pub from_phone: String,
    pub body: String,
}

// Activity Outputs (repetidos aquí temporalmente para simplificar la firma del Workflow sin dependencias cíclicas si fuese el caso, o podrían importarse).
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DeduplicationOutput {
    pub is_new: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IntentOutput {
    pub intent: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DispatchInput {
    pub to_phone: String,
    pub intent: String,
}

pub async fn ingestion_whatsapp_workflow(
    ctx: WfContext,
    input: IngestionWhatsappInput,
) -> WorkflowResult<()> {
    // 1. Deduplicación e Idempotencia
    let dedup_payload = ctx.activity(temporal_sdk::ActivityOptions {
        activity_type: "deduplicate_and_persist_activity".to_string(),
        input: serde_json::to_vec(&input).unwrap_or_default(),
        retry_policy: Some(temporal_sdk::RetryPolicy {
            initial_interval: Some(std::time::Duration::from_secs(1)),
            backoff_coefficient: 2.0,
            maximum_attempts: 5,
            ..Default::default()
        }),
        ..Default::default()
    })
    .await?;

    // Asumiremos deserialización del payload del resultado (stubs)
    let is_new = true; // FIXME: extraer de dedup_payload en sdk real
    if !is_new {
        // Abortar silenciosamente si el mensaje ya existía en SurrealDB
        return Ok(WfExitValue::Normal(()));
    }

    // 2. Análisis de Intención (Groq LLM)
    let intent_payload = ctx.activity(temporal_sdk::ActivityOptions {
        activity_type: "analyze_intent_activity".to_string(),
        input: serde_json::to_vec(&input).unwrap_or_default(),
        retry_policy: Some(temporal_sdk::RetryPolicy {
            initial_interval: Some(std::time::Duration::from_secs(2)),
            backoff_coefficient: 2.0,
            maximum_attempts: 4, // Caídas de API LLM
            ..Default::default()
        }),
        ..Default::default()
    })
    .await?;

    let intent_str = "SALES"; // FIXME: extraer de intent_payload

    // 3. Despacho de Respuesta
    let dispatch_input = DispatchInput {
        to_phone: input.from_phone.clone(),
        intent: intent_str.to_string(),
    };
    
    ctx.activity(temporal_sdk::ActivityOptions {
        activity_type: "dispatch_reply_activity".to_string(),
        input: serde_json::to_vec(&dispatch_input).unwrap_or_default(),
        retry_policy: Some(temporal_sdk::RetryPolicy {
            initial_interval: Some(std::time::Duration::from_secs(1)),
            backoff_coefficient: 2.0,
            maximum_attempts: 10, // Meta Graph API falla frecuentemente (503s)
            ..Default::default()
        }),
        ..Default::default()
    })
    .await?;

    Ok(WfExitValue::Normal(()))
}
