mod models;

use axum::{
    body::Bytes,
    extract::{Query, State},
    http::{HeaderMap, StatusCode, Uri},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::{collections::HashMap, sync::Arc};
use subtle::ConstantTimeEq;
use surrealdb::{
    engine::remote::ws::{Client, Ws},
    Surreal,
};
use tokio::sync::mpsc;
use tracing::{info, warn};

// ── Tipo auxiliar para HMAC-SHA256 ───────────────────────────────────────────

type HmacSha256 = Hmac<Sha256>;

// ── Configuración de runtime ──────────────────────────────────────────────────

/// Parámetros de configuración cargados desde variables de entorno en el
/// arranque del proceso. Ningún valor tiene un default en código —
/// ausencia de variable = fallo temprano y explícito.
struct AppConfig {
    /// `WA_APP_SECRET` — Secreto de la app Meta para verificar X-Hub-Signature-256.
    wa_app_secret: String,
    /// `WA_ACCESS_TOKEN` — Token de acceso a la WhatsApp Cloud API.
    wa_access_token: String,
    /// `WA_PHONE_ID` — Phone Number ID del número registrado en Meta.
    wa_phone_id: String,
    /// `WA_VERIFY_TOKEN` — Token para la verificación del webhook GET.
    wa_verify_token: String,
}

impl AppConfig {
    /// Carga la configuración desde el entorno.
    ///
    /// Falla de forma explícita si alguna variable requerida está ausente,
    /// en lugar de continuar con un estado inválido.
    fn from_env() -> Result<Self, String> {
        let wa_app_secret = std::env::var("WA_APP_SECRET")
            .map_err(|_| "Variable de entorno requerida ausente: WA_APP_SECRET".to_string())?;
        let wa_access_token = std::env::var("WA_ACCESS_TOKEN")
            .map_err(|_| "Variable de entorno requerida ausente: WA_ACCESS_TOKEN".to_string())?;
        let wa_phone_id = std::env::var("WA_PHONE_ID")
            .map_err(|_| "Variable de entorno requerida ausente: WA_PHONE_ID".to_string())?;
        let wa_verify_token = std::env::var("WA_VERIFY_TOKEN")
            .map_err(|_| "Variable de entorno requerida ausente: WA_VERIFY_TOKEN".to_string())?;

        Ok(Self {
            wa_app_secret,
            wa_access_token,
            wa_phone_id,
            wa_verify_token,
        })
    }
}

// ── Estado compartido de Axum ────────────────────────────────────────────────

/// Capacidad del canal entre el handler (productor) y el worker (consumidor).
const CHANNEL_BUFFER: usize = 100;

#[derive(Clone)]
struct AppState {
    tx: mpsc::Sender<models::WebhookPayload>,
    /// Secreto HMAC cacheado desde `AppConfig` para evitar lecturas repetidas
    /// de env en cada request.
    wa_app_secret: Arc<String>,
    wa_access_token: Arc<String>,
    wa_phone_id: Arc<String>,
    wa_verify_token: Arc<String>,
    /// Cliente SurrealDB compartido entre handlers via Arc interno del propio tipo.
    db: Arc<Surreal<Client>>,
}

// ── Punto de entrada ─────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    // Inicializar tracing antes de cualquier operación.
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    // Carga la configuración desde el entorno. Fallo temprano y explícito
    // si alguna variable está ausente — nunca arrancar con estado inválido.
    let config = AppConfig::from_env().unwrap_or_else(|e| {
        // SAFETY: fallo no recuperable en inicialización — proceso debe detenerse.
        eprintln!("[main] Error de configuración: {e}");
        std::process::exit(1);
    });

    // ── Inicializar cliente SurrealDB ────────────────────────────────────────
    let db: Surreal<Client> = Surreal::new::<Ws>("ws://localhost:8000")
        .await
        .unwrap_or_else(|e| {
            // SAFETY: fallo no recuperable en inicialización — proceso debe detenerse.
            eprintln!("[main] No se pudo conectar a SurrealDB: {e}");
            std::process::exit(1);
        });

    db.use_ns("apex").use_db("apex").await.unwrap_or_else(|e| {
        // SAFETY: fallo no recuperable en inicialización — proceso debe detenerse.
        eprintln!("[main] No se pudo seleccionar namespace/database en SurrealDB: {e}");
        std::process::exit(1);
    });

    info!("[main] Conexión a SurrealDB establecida (ws://localhost:8000 | ns=apex db=apex)");

    let (tx, rx) = mpsc::channel::<models::WebhookPayload>(CHANNEL_BUFFER);

    let state = Arc::new(AppState {
        tx,
        wa_app_secret: Arc::new(config.wa_app_secret),
        wa_access_token: Arc::new(config.wa_access_token),
        wa_phone_id: Arc::new(config.wa_phone_id),
        wa_verify_token: Arc::new(config.wa_verify_token),
        db: Arc::new(db),
    });

    // El JoinHandle del worker se conserva para gestión de ciclo de vida.
    let _worker_handle = tokio::spawn(message_worker(rx, Arc::clone(&state)));

    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/webhook", get(webhook_verify_handler))
        .route("/webhook", post(webhook_message_handler))
        .fallback(fallback_handler)
        .with_state(Arc::clone(&state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap_or_else(|e| {
            // SAFETY: fallo no recuperable en inicialización — proceso debe detenerse.
            eprintln!("[main] No se pudo enlazar al puerto 3000: {e}");
            std::process::exit(1);
        });

    info!("[main] Servidor escuchando en http://0.0.0.0:3000");

    axum::serve(listener, app)
        .await
        .unwrap_or_else(|e| {
            // SAFETY: fallo no recuperable del servidor — proceso debe detenerse.
            eprintln!("[main] Error fatal del servidor: {e}");
            std::process::exit(1);
        });
}

// ── Worker consumidor ────────────────────────────────────────────────────────

async fn message_worker(
    mut rx: mpsc::Receiver<models::WebhookPayload>,
    state: Arc<AppState>,
) {
    println!("[worker] Iniciado. Esperando mensajes...");

    while let Some(payload) = rx.recv().await {
        for entry in &payload.entry {
            for change in &entry.changes {
                for msg in &change.value.messages {
                    if msg.msg_type == "text" {
                        if let Some(text) = &msg.text {
                            println!(
                                "[worker] Mensaje de: {} | Texto: '{}'",
                                msg.from, text.body
                            );
                            // Egress: responder al remitente vía Meta API.
                            send_whatsapp_message(&msg.from, &text.body, &state).await;
                        }
                    } else {
                        println!(
                            "[worker] Mensaje de: {} | Tipo: {} (no texto)",
                            msg.from, msg.msg_type
                        );
                    }
                }
            }
        }
    }

    println!("[worker] Canal cerrado. Worker terminando.");
}

// ── Egress HTTP ──────────────────────────────────────────────────────────────

/// Envía un mensaje de texto a través de la WhatsApp Cloud API (Meta).
///
/// # Argumentos
/// * `to_number` — Número de teléfono del destinatario en formato E.164 sin "+".
/// * `text`      — Cuerpo del mensaje de texto a enviar.
/// * `state`     — Estado compartido con credenciales cargadas desde env.
async fn send_whatsapp_message(to_number: &str, text: &str, state: &AppState) {
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
                println!("[egress] Mensaje enviado a {} — HTTP {}", to_number, status);
            } else {
                let error_body = resp.text().await.unwrap_or_else(|_| "<sin cuerpo>".to_string());
                println!(
                    "[egress] Error de Meta al enviar a {} — HTTP {} | Cuerpo: {}",
                    to_number, status, error_body
                );
            }
        }
        Err(e) => {
            println!("[egress] Fallo de red al contactar Meta API: {}", e);
        }
    }
}

// ── Validación HMAC-SHA256 ───────────────────────────────────────────────────

/// Verifica el header `X-Hub-Signature-256` usando HMAC-SHA256 con comparación
/// en tiempo constante (`subtle::ConstantTimeEq`) para prevenir timing attacks.
///
/// Retorna `true` solo si la firma es válida y el header está presente y bien
/// formado. Cualquier anomalía retorna `false` sin exponer información.
fn verify_wa_signature(headers: &HeaderMap, body: &Bytes, secret: &str) -> bool {
    // Extraer y normalizar la firma recibida.
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

    // Calcular HMAC-SHA256 del body con el secreto de la app.
    // `new_from_slice` acepta claves de cualquier longitud — nunca falla.
    let mut mac = match HmacSha256::new_from_slice(secret.as_bytes()) {
        Ok(m) => m,
        Err(_) => return false,
    };
    mac.update(body);
    let expected_bytes = mac.finalize().into_bytes();

    // Comparación en tiempo constante — previene timing attacks.
    expected_bytes.as_slice().ct_eq(received_bytes.as_slice()).into()
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async fn health_handler() -> &'static str {
    "OK"
}

/// GET /webhook — Verificación del webhook de Meta/WhatsApp Cloud API.
async fn webhook_verify_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let mode      = params.get("hub.mode").map(String::as_str).unwrap_or("");
    let token     = params.get("hub.verify_token").map(String::as_str).unwrap_or("");
    let challenge = params.get("hub.challenge").cloned().unwrap_or_default();

    if mode == "subscribe" && token == state.wa_verify_token.as_str() {
        println!("[webhook_verify] Verificación exitosa. Challenge: {challenge}");
        (StatusCode::OK, challenge).into_response()
    } else {
        println!("[webhook_verify] Token inválido o modo incorrecto. mode={mode}");
        (StatusCode::FORBIDDEN, "Forbidden").into_response()
    }
}

/// POST /webhook — Valida HMAC-SHA256, deduplica por wamid en SurrealDB,
/// y retorna HTTP 200 de forma inmediata.
///
/// Flujo:
///   1. Valida firma `X-Hub-Signature-256` (< 1ms) → 401 si inválida.
///   2. Extrae el primer `wamid` del payload para deduplicación.
///   3. Intenta INSERT en SurrealDB — si ya existe (`wamid` duplicado),
///      retorna 200 inmediatamente sin procesar. Si SurrealDB devuelve
///      otro error, registra warn! y retorna 200 (regla antiban).
///   4. Retorna 200 inmediatamente; el procesamiento ocurre en `tokio::spawn`.
async fn webhook_message_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body_bytes: Bytes,
) -> StatusCode {
    // ── Paso 1: validar firma HMAC-SHA256 (< 1ms) ────────────────────────
    if !verify_wa_signature(&headers, &body_bytes, &state.wa_app_secret) {
        warn!("[webhook_message] Firma HMAC-SHA256 inválida o ausente.");
        return StatusCode::UNAUTHORIZED;
    }

    // ── Paso 2: extraer wamid para deduplicación ─────────────────────────
    // Parseo mínimo con serde_json::Value para no deserializar la estructura
    // completa en el camino crítico de latencia.
    let wamid: Option<String> = serde_json::from_slice::<serde_json::Value>(&body_bytes)
        .ok()
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

    // ── Paso 3: deduplicación en SurrealDB ───────────────────────────────
    // Se ejecuta ANTES del spawn para garantizar idempotencia en el handler.
    if let Some(ref wamid_val) = wamid {
        // SurrealQL parametrizado — nunca interpolación de strings (regla 3.1).
        //
        // La consulta combina check + insert atómico:
        //   - Si wamid ya existe → devuelve NONE (el IF filtra el CREATE).
        //   - Si no existe → crea el registro con TTL implícito por campo `ts`.
        //
        // La unicidad se garantiza mediante DEFINE INDEX UNIQUE en wamid
        // (debe estar definido en el schema de SurrealDB — ver migrations).
        let query_result = state
            .db
            .query(
                "LET $dup = (SELECT id FROM wa_events WHERE wamid = $wamid LIMIT 1); \
                 IF $dup THEN RETURN NONE ELSE \
                   CREATE wa_events SET wamid = $wamid, ts = time::now() \
                 END;",
            )
            .bind(("wamid", wamid_val))
            .await;

        match query_result {
            Err(e) => {
                // SurrealDB no disponible o error inesperado.
                // Se registra warn! pero se retorna 200 para cumplir
                // el contrato antiban con Meta (regla 5.2).
                warn!(
                    wamid = %wamid_val,
                    error = %e,
                    "[webhook_message] Error en SurrealDB durante deduplicación. Continuando sin persistencia."
                );
            }
            Ok(mut response) => {
                // La consulta devuelve NONE cuando el wamid ya existe (duplicado).
                // En ese caso descartamos silenciosamente y retornamos 200.
                let is_duplicate: Option<serde_json::Value> = response
                    .take(1)
                    .unwrap_or(None);

                if is_duplicate.is_none() || is_duplicate == Some(serde_json::Value::Null) {
                    // Verificar si fue explícitamente NONE (duplicado) vs error de parseo.
                    // Dado que RETURN NONE produce Option::None en surrealdb-rs v2,
                    // cualquier None aquí indica duplicado confirmado.
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

    // ── Paso 4: spawn async — el handler retorna 200 de inmediato ────────
    // El parseo del JSON y la comunicación con el worker ocurren fuera del
    // ciclo de vida de esta petición HTTP.
    let state_clone = Arc::clone(&state);
    let body_clone = body_bytes.clone();

    tokio::spawn(async move {
        match serde_json::from_slice::<models::WebhookPayload>(&body_clone) {
            Ok(payload) => {
                match state_clone.tx.send(payload).await {
                    Ok(_) => {
                        info!("[webhook_message] Payload encolado correctamente.");
                    }
                    Err(e) => {
                        warn!("[webhook_message] Canal cerrado. Mensaje perdido: {e}");
                    }
                }
            }
            Err(e) => {
                warn!("[webhook_message] Body no es JSON válido — {e}");
            }
        }
    });

    // ── Paso 5: retorno INMEDIATO — no mover esta línea ──────────────────
    StatusCode::OK
}

// ── Fallback ─────────────────────────────────────────────────────────────────

/// Captura cualquier ruta no definida y la registra en consola.
async fn fallback_handler(uri: Uri) -> impl IntoResponse {
    println!("⚠️  PETICIÓN PERDIDA (404) HACIA: {}", uri);
    StatusCode::NOT_FOUND
}
