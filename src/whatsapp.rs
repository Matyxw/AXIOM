use axum::body::Bytes;
use axum::http::HeaderMap;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use subtle::ConstantTimeEq;
use crate::state::AppState;

type HmacSha256 = Hmac<Sha256>;

pub async fn send_whatsapp_message(to_number: &str, text: &str, state: &AppState) {
    let url = format!(
        "https://graph.facebook.com/v25.0/{}/messages",
        state.wa_phone_id
    );

    let body = serde_json::json!({
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {
            "body": text
        }
    });

    let client = reqwest::Client::new();

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", state.wa_access_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            if status.is_success() {
                tracing::info!("[egress] Mensaje enviado a {} — HTTP {}", to_number, status);
            } else {
                let error_body = resp.text().await.unwrap_or_else(|_| "<sin cuerpo>".to_string());
                tracing::error!(
                    "[egress] Error de Meta al enviar a {} — HTTP {} | Cuerpo: {}",
                    to_number, status, error_body
                );
            }
        }
        Err(e) => {
            tracing::error!("[egress] Fallo de red al contactar Meta API: {}", e);
        }
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
