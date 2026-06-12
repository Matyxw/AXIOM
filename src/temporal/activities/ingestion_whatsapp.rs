use std::sync::Arc;
use serde::{Deserialize, Serialize};
use temporal_sdk::ActContext;
use crate::state::AppState;
use crate::temporal::workflows::ingestion_whatsapp::IngestionWhatsappInput;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DeduplicationOutput {
    pub is_new: bool,
}

pub async fn deduplicate_and_persist_activity(
    _ctx: ActContext,
    state: Arc<AppState>,
    input: IngestionWhatsappInput,
) -> Result<DeduplicationOutput, crate::error::AppError> {
    // APEX RULES: Parametrización obligatoria y namespace por tenant
    state.db.use_ns(&input.tenant_id).use_db("apex").await?;
    
    let existing: Option<serde_json::Value> = state.db
        .query("SELECT * FROM messages WHERE wamid = $wamid")
        .bind(("wamid", &input.wamid))
        .await?
        .take(0)?;
        
    if existing.is_some() {
        tracing::warn!(wamid = %input.wamid, "Mensaje duplicado descartado por idempotencia");
        return Ok(DeduplicationOutput { is_new: false });
    }

    state.db
        .query("INSERT INTO messages (wamid, body, from_phone, received_at) VALUES ($wamid, $body, $from, time::now())")
        .bind(("wamid", &input.wamid))
        .bind(("body", &input.body))
        .bind(("from", &input.from_phone))
        .await?;

    Ok(DeduplicationOutput { is_new: true })
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IntentOutput {
    pub intent: String,
}

pub async fn analyze_intent_activity(
    _ctx: ActContext,
    _state: Arc<AppState>, // Aquí inyectaremos el cliente reqwest para Groq
    input: IngestionWhatsappInput,
) -> Result<IntentOutput, crate::error::AppError> {
    // Lógica LLM: Si dice "precio" o "comprar" -> SALES, sino SUPPORT/JUNK
    let intent = if input.body.to_lowercase().contains("comprar") || input.body.to_lowercase().contains("precio") {
        "SALES".to_string()
    } else if input.body.len() < 5 {
        "JUNK".to_string()
    } else {
        "SUPPORT".to_string()
    };
    
    // Simulate I/O latency para el LLM
    tokio::time::sleep(std::time::Duration::from_millis(600)).await;

    Ok(IntentOutput { intent })
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DispatchInput {
    pub to_phone: String,
    pub intent: String,
}

pub async fn dispatch_reply_activity(
    _ctx: ActContext,
    state: Arc<AppState>,
    input: DispatchInput,
) -> Result<(), crate::error::AppError> {
    let reply_text = match input.intent.as_str() {
        "SALES" => "¡Hola! He notado que tienes interés en implementar AXIOM. Aquí tienes tu link exclusivo para agendar el Setup: https://calendly.com/axiom",
        "JUNK" => return Ok(()), // Ignorar mensajes sin sentido (idempotente silencioso)
        _ => "Hemos recibido tu consulta técnica. Un ingeniero del equipo te responderá a la brevedad.",
    };
    
    // El timeout de 8s está incrustado dentro de send_whatsapp_message por regla apex
    crate::whatsapp::send_whatsapp_message(&state.http_client, &input.to_phone, reply_text, &state).await?;
    
    Ok(())
}
