use std::sync::Arc;
use serde::{Deserialize, Serialize};
use temporalio_sdk::activities::ActivityContext;
use temporalio_macros::activities;
use crate::state::AppState;
use crate::temporal::workflows::ingestion_whatsapp::IngestionWhatsappInput;


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

pub struct IngestionActivities {
    pub state: Arc<AppState>,
}

#[activities]
impl IngestionActivities {
    #[activity]
    pub async fn deduplicate_and_persist_activity(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: IngestionWhatsappInput,
    ) -> Result<DeduplicationOutput, temporalio_sdk::activities::ActivityError> {
        // APEX RULES: Parametrización obligatoria y namespace por tenant
        self.state.db.use_ns(&input.tenant_id).use_db("apex").await?;
        
        let existing: Option<serde_json::Value> = self.state.db
            .query("SELECT * FROM messages WHERE wamid = $wamid")
            .bind(("wamid", input.wamid.clone()))
            .await?
            .take(0)?;
            
        if existing.is_some() {
            tracing::warn!(wamid = %input.wamid, "Mensaje duplicado descartado por idempotencia");
            return Ok(DeduplicationOutput { is_new: false });
        }

        self.state.db
            .query("INSERT INTO messages (wamid, body, from_phone, received_at) VALUES ($wamid, $body, $from, time::now())")
            .bind(("wamid", input.wamid.clone()))
            .bind(("body", input.body.clone()))
            .bind(("from", input.from_phone.clone()))
            .await?;

        Ok(DeduplicationOutput { is_new: true })
    }

    #[activity]
    pub async fn analyze_intent_activity(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: IngestionWhatsappInput,
    ) -> Result<IntentOutput, temporalio_sdk::activities::ActivityError> {
        let intent = if input.body.to_lowercase().contains("comprar") || input.body.to_lowercase().contains("precio") {
            "SALES".to_string()
        } else if input.body.len() < 5 {
            "JUNK".to_string()
        } else {
            "SUPPORT".to_string()
        };
        
        tokio::time::sleep(std::time::Duration::from_millis(600)).await;

        Ok(IntentOutput { intent })
    }

    #[activity]
    pub async fn dispatch_reply_activity(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: DispatchInput,
    ) -> Result<(), temporalio_sdk::activities::ActivityError> {
        let reply_text = match input.intent.as_str() {
            "SALES" => "¡Hola! He notado que tienes interés en implementar AXIOM. Aquí tienes tu link exclusivo para agendar el Setup: https://calendly.com/axiom",
            "JUNK" => return Ok(()),
            _ => "Hemos recibido tu consulta técnica. Un ingeniero del equipo te responderá a la brevedad.",
        };
        
        crate::whatsapp::send_whatsapp_message(&self.state.http_client, &input.to_phone, reply_text, &self.state).await?;
        
        Ok(())
    }
}
