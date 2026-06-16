use axum::body::Bytes;
use axum::http::HeaderMap;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use subtle::ConstantTimeEq;
use crate::state::AppState;

type HmacSha256 = Hmac<Sha256>;

/// Envía un mensaje de texto vía WhatsApp Cloud API.
///
/// # Errores
/// Retorna `Err` si la red falla o si Meta devuelve un status no-2xx.
/// El caller debe decidir si reintentar (usar Temporal Activity con RetryPolicy).
///
/// # Rendimiento
/// Recibe `http_client` como parámetro para reutilizar el connection pool.
/// NUNCA crear `reqwest::Client::new()` dentro de esta función.
pub async fn send_whatsapp_message(
    http_client: &reqwest::Client,
    to_number: &str,
    text: &str,
    state: &AppState,
) -> Result<(), crate::error::AppError> {
    let url = format!(
        "https://graph.facebook.com/v25.0/{}/messages",
        state.wa_phone_id
    );

    let body = serde_json::json!({
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": { "body": text }
    });

    // Timeout obligatorio en toda I/O externa (regla apex-rules §2.3)
    let response = tokio::time::timeout(
        std::time::Duration::from_secs(8),
        http_client
            .post(&url)
            .header("Authorization", format!("Bearer {}", state.wa_access_token))
            .json(&body)
            .send(),
    )
    .await
    .map_err(|_| crate::error::AppError::WhatsApp("timeout enviando mensaje a Meta".into()))?
    .map_err(|e| crate::error::AppError::WhatsApp(e.to_string()))?;

    let status = response.status();
    let masked_number = if to_number.len() >= 4 {
        format!("{}****", &to_number[..to_number.len() - 4])
    } else {
        "****".to_string()
    };

    if status.is_success() {
        tracing::info!(to = %masked_number, http = %status, "[egress] mensaje enviado");
        Ok(())
    } else {
        let error_body = response.text().await.unwrap_or_else(|_| "<sin cuerpo>".to_string());
        tracing::error!(to = %masked_number, http = %status, body = %error_body, "[egress] error Meta API");
        Err(crate::error::AppError::WhatsApp(format!("Meta HTTP {status}: {error_body}")))
    }
}

pub fn verify_wa_signature(headers: &HeaderMap, body: &Bytes, secret: &str) -> bool {
    let sig_hex = match headers
        .get("X-Hub-Signature-256")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("sha256="))
    {
        Some(s) => s.to_owned(),
        None => return false,
    };

    let received_bytes = match hex::decode(&sig_hex) {
        Ok(b) => b,
        Err(_) => return false,
    };

    let mut mac = match HmacSha256::new_from_slice(secret.as_bytes()) {
        Ok(m) => m,
        Err(_) => return false,
    };
    mac.update(body);
    let expected_bytes = mac.finalize().into_bytes();

    expected_bytes.as_slice().ct_eq(received_bytes.as_slice()).into()
}
