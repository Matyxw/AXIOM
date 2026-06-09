use axum::{
    body::Bytes,
    extract::{Query, State},
    http::{HeaderMap, StatusCode, Uri},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use std::collections::HashMap;
use std::sync::Arc;
use tracing::{info, warn};

use crate::state::AppState;
use crate::whatsapp::verify_wa_signature;
use crate::models;

pub fn app_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health_handler))
        .route("/webhook", get(webhook_verify_handler))
        .route("/webhook", post(webhook_message_handler))
        .fallback(fallback_handler)
        .with_state(state)
}

async fn health_handler() -> &'static str {
    "OK"
}

async fn webhook_verify_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let mode      = params.get("hub.mode").map(String::as_str).unwrap_or("");
    let token     = params.get("hub.verify_token").map(String::as_str).unwrap_or("");
    let challenge = params.get("hub.challenge").cloned().unwrap_or_default();

    if mode == "subscribe" && token == state.wa_verify_token.as_str() {
        info!("[webhook_verify] Verificación exitosa. Challenge: {challenge}");
        (StatusCode::OK, challenge).into_response()
    } else {
        warn!("[webhook_verify] Token inválido o modo incorrecto. mode={mode}");
        (StatusCode::FORBIDDEN, "Forbidden").into_response()
    }
}

async fn webhook_message_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body_bytes: Bytes,
) -> StatusCode {
    if !verify_wa_signature(&headers, &body_bytes, &state.wa_app_secret) {
        warn!("[webhook_message] Firma HMAC-SHA256 inválida o ausente.");
        return StatusCode::UNAUTHORIZED;
    }

    let parsed_json = serde_json::from_slice::<serde_json::Value>(&body_bytes).ok();
    
    let wamid: Option<String> = parsed_json.as_ref()
        .and_then(|v| {
            v.get("entry")?
                .get(0)?
                .get("changes")?
                .get(0)?
                .get("value")?
                .get("messages")?
                .get(0)?
                .get("id")
                .and_then(|id| id.as_str())
                .map(str::to_owned)
        });

    let phone_number_id: Option<String> = parsed_json.as_ref()
        .and_then(|v| {
            v.get("entry")?
                .get(0)?
                .get("changes")?
                .get(0)?
                .get("value")?
                .get("metadata")?
                .get("phone_number_id")
                .and_then(|id| id.as_str())
                .map(str::to_owned)
        });

    let tenant_id = {
        let cache = state.tenant_cache.read().await;
        if let Some(pid) = &phone_number_id {
            cache.get(pid).cloned()
        } else {
            None
        }
    };

    let tenant_id = match tenant_id {
        Some(t) => t,
        None => {
            warn!(
                phone_id = ?phone_number_id,
                "[webhook_message] No se resolvió tenant_id en memoria. Evento descartado temporalmente."
            );
            return StatusCode::OK;
        }
    };

    if let Some(ref wamid_val) = wamid {
        let query_result = state
            .db
            .query(
                "LET $dup = (SELECT id FROM wa_events WHERE wamid = $wamid LIMIT 1); \
                 IF $dup THEN RETURN NONE ELSE \
                   CREATE wa_events SET wamid = $wamid, ts = time::now() \
                 END;",
            )
            .bind(("wamid", wamid_val.clone()))
            .await;

        match query_result {
            Err(e) => {
                warn!(
                    wamid = %wamid_val,
                    error = %e,
                    "[webhook_message] Error en SurrealDB durante deduplicación. Continuando sin persistencia."
                );
            }
            Ok(mut response) => {
                let is_duplicate: Option<serde_json::Value> = response
                    .take(1)
                    .unwrap_or(None);

                if is_duplicate.is_none() || is_duplicate == Some(serde_json::Value::Null) {
                    info!(
                        wamid = %wamid_val,
                        "[webhook_message] wamid duplicado. Evento descartado."
                    );
                    return StatusCode::OK;
                }

                info!(
                    wamid = %wamid_val,
                    "[webhook_message] wamid registrado. Procesando evento."
                );
            }
        }
    }

    info!("[webhook_message] Firma verificada. Despachando procesamiento async.");

    let _state_clone = Arc::clone(&state);
    let body_clone = body_bytes.clone();

    tokio::spawn(async move {
        match serde_json::from_slice::<models::WebhookPayload>(&body_clone) {
            Ok(payload) => {
                for entry in payload.entry {
                    for change in entry.changes {
                        for msg in change.value.messages {
                            if msg.msg_type == "text" {
                                if let Some(text) = msg.text {
                                    let inbound_msg = crate::temporal::workflows::InboundMessage {
                                        tenant_id: tenant_id.clone(),
                                        from: msg.from.clone(),
                                        text: text.body.clone(),
                                    };
                                    // TODO: state_clone.temporal_client.start_workflow(...)
                                    info!("[webhook_message] Mensaje Inbound preparado para Temporal: {:?}", inbound_msg);
                                }
                            }
                        }
                    }
                }
            }
            Err(e) => {
                warn!("[webhook_message] Body no es JSON válido — {e}");
            }
        }
    });

    StatusCode::OK
}

async fn fallback_handler(uri: Uri) -> impl IntoResponse {
    warn!("⚠️  PETICIÓN PERDIDA (404) HACIA: {}", uri);
    StatusCode::NOT_FOUND
}
