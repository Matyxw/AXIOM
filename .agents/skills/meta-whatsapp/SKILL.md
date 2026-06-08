---
name: meta-whatsapp-integration
description: >
  Actívate automáticamente cuando el agente trabaje con cualquiera de los
  siguientes contextos: webhook de WhatsApp, WhatsApp Cloud API, Meta Graph API,
  validación HMAC-SHA256 de payloads Meta, verificación GET de webhook,
  deduplicación de mensajes por wamid, envío de mensajes vía reqwest,
  handlers Axum para /webhook, o integración con SurrealDB para idempotencia.
  Esta skill define las reglas de oro de la implementación y debe consultarse
  antes de generar o modificar cualquier código relacionado con el flujo
  de mensajería de Meta.
---

# Skill: Meta WhatsApp Business Cloud API — Integración Experta (Rust/Axum)

## Stack de referencia

| Capa          | Tecnología                         | Versión pin   |
|---------------|------------------------------------|---------------|
| Runtime       | `tokio` (full features)            | `1`           |
| HTTP Server   | `axum`                             | `0.8`         |
| Serialización | `serde` + `serde_json`             | `1`           |
| HMAC          | `hmac` + `sha2`                    | `0.12` / `0.10` |
| Tiempo const. | `subtle`                           | `2`           |
| Hex decode    | `hex`                              | `0.4`         |
| Egress HTTP   | `reqwest` (feature `json`)         | `0.12`        |
| Base de datos | `SurrealDB` (deduplicación wamid)  | según proyecto |

> **Regla #0 — Dependency Gate.**
> Antes de agregar cualquier dependencia nueva al `Cargo.toml`, invocar la skill
> `scan_dependencies` del plugin SecureCoder. No existe excepción.

---

## 1. Variables de entorno requeridas

Toda la configuración sensible vive en variables de entorno. **Nunca** hardcodear
tokens, secretos ni IDs en el código fuente. El proceso debe fallar de forma
temprana y explícita (`process::exit(1)`) si alguna variable está ausente.

| Variable           | Uso                                                          |
|--------------------|--------------------------------------------------------------|
| `WA_APP_SECRET`    | Secreto de la app Meta → clave HMAC para `X-Hub-Signature-256` |
| `WA_ACCESS_TOKEN`  | Bearer token para la Graph API (envío de mensajes)           |
| `WA_PHONE_ID`      | Phone Number ID del número de negocio registrado en Meta     |
| `WA_VERIFY_TOKEN`  | Token de verificación del webhook GET                        |

**Patrón de carga obligatorio** (fail-fast, sin defaults en código):

```rust
fn from_env() -> Result<Self, String> {
    let wa_app_secret = std::env::var("WA_APP_SECRET")
        .map_err(|_| "Variable de entorno requerida ausente: WA_APP_SECRET".to_string())?;
    // ... resto de variables
}
```

---

## 2. Verificación GET del Webhook de Meta

Meta realiza una petición `GET /webhook` para verificar la propiedad del endpoint
antes de comenzar a enviar eventos.

### Parámetros de query esperados

| Parámetro          | Descripción                                           |
|--------------------|-------------------------------------------------------|
| `hub.mode`         | Siempre `"subscribe"` en la verificación legítima     |
| `hub.verify_token` | Token que Meta envía para comparar con `WA_VERIFY_TOKEN` |
| `hub.challenge`    | String aleatorio que debe devolverse en el body con HTTP 200 |

### Handler de referencia (Axum)

```rust
/// GET /webhook — Verificación del webhook de Meta/WhatsApp Cloud API.
async fn webhook_verify_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let mode      = params.get("hub.mode").map(String::as_str).unwrap_or("");
    let token     = params.get("hub.verify_token").map(String::as_str).unwrap_or("");
    let challenge = params.get("hub.challenge").cloned().unwrap_or_default();

    if mode == "subscribe" && token == state.wa_verify_token.as_str() {
        (StatusCode::OK, challenge).into_response()
    } else {
        (StatusCode::FORBIDDEN, "Forbidden").into_response()
    }
}
```

### Reglas críticas

- **Nunca** comparar `token` usando `==` sobre tipos no en tiempo constante cuando
  el secreto sea criptográficamente relevante. Para el verify token esto es
  aceptable (es un string de configuración, no material criptográfico de sesión),
  pero documenta la decisión.
- Retornar exactamente el valor de `hub.challenge` sin modificaciones.
- Retornar `403 Forbidden` en cualquier caso de fallo — nunca revelar cuál
  campo falló.

---

## 3. Recepción POST de Mensajes — El Contrato de los 4 Segundos

> **⚠️ REGLA DE ORO — NUNCA VIOLAR.**
> Meta espera un `HTTP 200` en **menos de 4 segundos** o marca el delivery como
> fallido y **reintenta hasta 20 veces**. Múltiples fallos sostenidos pueden
> derivar en **suspensión del número** o **ban de la app**.

### Arquitectura obligatoria: Respond-Then-Process

El handler POST **no debe realizar ninguna operación de I/O** (red, DB, disco)
antes de retornar el `200`. El único trabajo permitido en el hot path es:

1. Validar la firma HMAC-SHA256 (operación puramente en memoria, < 1 ms).
2. Clonar `Arc<AppState>` y los bytes del body.
3. Hacer `tokio::spawn` del procesamiento real.
4. Retornar `StatusCode::OK` de forma **inmediata**.

```
POST /webhook
     │
     ▼
[1] verify_wa_signature()  ←── < 1 ms (HMAC en RAM)
     │ FAIL → 401
     │ OK
     ▼
[2] tokio::spawn(async move { parse + enqueue })
     │                              ▲
     │                      ┌──────┘
     ▼                      │
[3] StatusCode::OK  ←── INMEDIATO
                        (Meta recibe 200 aquí)
                            │
                     Worker Task (background):
                     ├─ serde_json::from_slice
                     ├─ deduplicar por wamid en SurrealDB
                     ├─ enviar a mpsc::Sender
                     └─ send_whatsapp_message()
```

### Handler de referencia (Axum)

```rust
/// POST /webhook — Valida HMAC-SHA256 y retorna HTTP 200 de forma inmediata.
async fn webhook_message_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body_bytes: Bytes,
) -> StatusCode {
    // Paso 1: validar firma HMAC-SHA256 (< 1ms, solo RAM)
    if !verify_wa_signature(&headers, &body_bytes, &state.wa_app_secret) {
        return StatusCode::UNAUTHORIZED;
    }

    // Paso 2: spawn async — procesamiento 100% fuera del ciclo de vida HTTP
    let state_clone = Arc::clone(&state);
    let body_clone = body_bytes.clone();

    tokio::spawn(async move {
        match serde_json::from_slice::<models::WebhookPayload>(&body_clone) {
            Ok(payload) => {
                if let Err(e) = state_clone.tx.send(payload).await {
                    eprintln!("[webhook] Canal cerrado. Mensaje perdido: {e}");
                }
            }
            Err(e) => {
                eprintln!("[webhook] Body no es JSON válido — {e}");
            }
        }
    });

    // Paso 3: retorno INMEDIATO — no mover esta línea
    StatusCode::OK
}
```

> **Antipatrón prohibido:** Hacer `await` de cualquier operación I/O (base de
> datos, API externa, filesystem) dentro del handler antes del `return`.

---

## 4. Validación Criptográfica HMAC-SHA256 con Tiempo Constante

Meta firma cada payload `POST` con el secreto de la app (`WA_APP_SECRET`) usando
HMAC-SHA256 y lo adjunta en el header `X-Hub-Signature-256: sha256=<hex>`.

### Por qué comparación en tiempo constante es no-negociable

Una comparación byte a byte convencional (`==`) retorna en cuanto encuentra el
primer byte diferente. Un atacante puede medir micro-variaciones en el tiempo de
respuesta y reconstruir el HMAC válido byte a byte (**timing attack**). La librería
`subtle` garantiza que la comparación tome exactamente el mismo tiempo
independientemente del contenido — eliminando el canal lateral de tiempo.

### Implementación de referencia

```rust
use hmac::{Hmac, Mac};
use sha2::Sha256;
use subtle::ConstantTimeEq;
use hex;

type HmacSha256 = Hmac<Sha256>;

/// Verifica el header `X-Hub-Signature-256` usando HMAC-SHA256 con comparación
/// en tiempo constante (`subtle::ConstantTimeEq`) para prevenir timing attacks.
///
/// Retorna `true` solo si la firma es válida y el header está presente y bien
/// formado. Cualquier anomalía retorna `false` sin exponer información diagnóstica.
fn verify_wa_signature(headers: &HeaderMap, body: &Bytes, secret: &str) -> bool {
    // 1. Extraer y normalizar la firma recibida
    let sig_hex = match headers
        .get("X-Hub-Signature-256")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("sha256="))
    {
        Some(s) => s.to_owned(),
        None => return false, // header ausente o malformado → rechazo silencioso
    };

    // 2. Decodificar hex → bytes
    let received_bytes = match hex::decode(&sig_hex) {
        Ok(b) => b,
        Err(_) => return false, // hex inválido → rechazo silencioso
    };

    // 3. Calcular HMAC-SHA256(secret, body)
    let mut mac = match HmacSha256::new_from_slice(secret.as_bytes()) {
        Ok(m) => m,
        Err(_) => return false,
    };
    mac.update(body);
    let expected_bytes = mac.finalize().into_bytes();

    // 4. Comparación en tiempo constante — NUNCA usar `==` directamente
    expected_bytes.as_slice().ct_eq(received_bytes.as_slice()).into()
}
```

### Checklist de seguridad para HMAC

- [ ] El body leído por Axum son los bytes **crudos** antes de cualquier parsing.
      Si el framework parsea primero y luego serializa de nuevo, la firma fallará.
      Usar `Bytes` directamente en el extractor de Axum.
- [ ] Nunca loguear la firma recibida ni el secreto — solo "firma válida/inválida".
- [ ] Retornar `401 Unauthorized` (no `403`) en firmas inválidas para diferenciar
      semánticamente de errores de autorización.
- [ ] La longitud de `received_bytes` no necesita verificarse antes de `ct_eq`;
      si difiere de 32 bytes, `ct_eq` retornará `false` de forma segura.

---

## 5. Deduplicación de Eventos por `wamid` en SurrealDB

Meta puede reenviar el mismo evento múltiples veces (reintentos por fallo de red,
timeouts transitorios, etc.). El `wamid` (`message.id`) es el identificador único
**globalmente** asignado por los servidores de Meta a cada mensaje y **garantiza
idempotencia** si se indexa antes de procesar.

### Estructura del mensaje de referencia

```json
{
  "from": "521234567890",
  "id": "wamid.HBgNNTIxMjM0NTY3ODkwFQIAERgSNDVCMzY5QUY4QUU3QTZDMDA3AA==",
  "timestamp": "1717600000",
  "type": "text",
  "text": { "body": "Hola!" }
}
```

El campo `message.id` es el `wamid` — un string opaco Base64 que identifica
inequívocamente el mensaje en la red de Meta.

### Esquema SurrealDB para deduplicación

```sql
-- Tabla de wamids procesados (índice único garantiza idempotencia)
DEFINE TABLE processed_wamids SCHEMAFULL;
DEFINE FIELD wamid        ON TABLE processed_wamids TYPE string;
DEFINE FIELD processed_at ON TABLE processed_wamids TYPE datetime DEFAULT time::now();
DEFINE INDEX idx_wamid    ON TABLE processed_wamids COLUMNS wamid UNIQUE;
```

### Patrón de deduplicación en el worker (pseudo-código Rust)

```rust
async fn process_message(msg: &Message, db: &Surreal<Client>) -> Result<(), Error> {
    // Intento de inserción atómica — falla si el wamid ya existe (UNIQUE index)
    let result: Option<Record> = db
        .query("INSERT INTO processed_wamids (wamid) VALUES ($wamid)")
        .bind(("wamid", &msg.id))
        .await?
        .take(0)?;

    match result {
        Some(_) => {
            // Primera vez que vemos este wamid → procesar el mensaje
            handle_new_message(msg, db).await?;
        }
        None => {
            // wamid ya existía → duplicado detectado, ignorar silenciosamente
            eprintln!("[dedup] wamid duplicado ignorado: {}", msg.id);
        }
    }

    Ok(())
}
```

### Alternativa: CREATE con RETURN NONE y manejo de error de duplicado

```rust
// SurrealDB lanza un error al violar el UNIQUE index.
// Capturar ese error específico y tratarlo como "ya procesado".
match db.create::<Option<Record>>("processed_wamids")
    .content(json!({ "wamid": &msg.id }))
    .await
{
    Ok(_) => handle_new_message(msg).await,
    Err(e) if e.is_unique_violation() => {
        // Duplicado — safe to ignore
        Ok(())
    }
    Err(e) => Err(e.into()),
}
```

### Reglas de deduplicación

- La inserción del `wamid` debe ocurrir **antes** de cualquier procesamiento
  con efectos de red (envío de respuesta al usuario).
- El índice `UNIQUE` en SurrealDB es la barrera de idempotencia atómica.
  No replicar esta lógica en memoria (el estado en memoria se pierde al reiniciar).
- Dar TTL a los registros de `processed_wamids` para evitar crecimiento
  indefinido. Los wamids de Meta tienen una ventana de reintento de 24-72 horas;
  un TTL de 7 días es conservador y suficiente.

```sql
-- Limpieza periódica de wamids con más de 7 días
DELETE FROM processed_wamids WHERE processed_at < time::now() - 7d;
```

---

## 6. Modelo de Datos de Referencia (Rust/Serde)

El payload JSON de Meta sigue esta jerarquía. Los tipos `#[serde(default)]`
en colecciones opcionales previenen errores de deserialización cuando Meta envía
notificaciones de estado sin mensajes (delivery receipts, read receipts).

```
WebhookPayload
└── entry: Vec<Entry>
    └── changes: Vec<Change>
        ├── field: String          ("messages")
        └── value: ChangeValue
            ├── messaging_product: String   ("whatsapp")
            ├── contacts: Vec<Contact>      (#[serde(default)])
            │   └── profile: Profile
            │       └── name: String
            └── messages: Vec<Message>      (#[serde(default)])
                ├── from: String            (E.164 sin "+")
                ├── id: String              (wamid — clave de deduplicación)
                ├── timestamp: String
                ├── type: String            (renombrado a msg_type)
                └── text: Option<TextBody>
                    └── body: String
```

---

## 7. Egress: Envío de Mensajes a través de la Graph API

### Endpoint

```
POST https://graph.facebook.com/v25.0/{WA_PHONE_ID}/messages
Authorization: Bearer {WA_ACCESS_TOKEN}
Content-Type: application/json
```

### Payload mínimo para mensaje de texto

```json
{
  "messaging_product": "whatsapp",
  "to": "521234567890",
  "type": "text",
  "text": { "body": "Hola desde el bot!" }
}
```

### Implementación de referencia (reqwest)

```rust
async fn send_whatsapp_message(to_number: &str, text: &str, state: &AppState) {
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

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", state.wa_access_token))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            println!("[egress] Mensaje enviado a {to_number}");
        }
        Ok(resp) => {
            let status = resp.status();
            let err = resp.text().await.unwrap_or_default();
            eprintln!("[egress] Error Meta API — HTTP {status} | {err}");
        }
        Err(e) => {
            eprintln!("[egress] Fallo de red: {e}");
        }
    }
}
```

> **Recomendación:** instanciar `reqwest::Client` una sola vez en `AppState`
> (no en cada llamada) para reutilizar el pool de conexiones HTTP/2 y reducir
> latencia en alta concurrencia.

---

## 8. Routing Axum — Configuración Mínima de Referencia

```rust
let app = Router::new()
    .route("/health",  get(health_handler))
    .route("/webhook", get(webhook_verify_handler))   // GET: verificación Meta
    .route("/webhook", post(webhook_message_handler)) // POST: mensajes entrantes
    .fallback(fallback_handler)
    .with_state(Arc::clone(&state));

// Listener en 0.0.0.0:3000 — expuesto vía túnel (ngrok, cloudflared, etc.)
// o infraestructura de producción con TLS terminado upstream.
let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
axum::serve(listener, app).await?;
```

---

## 9. Checklist de Seguridad General

- [ ] `WA_APP_SECRET` y `WA_ACCESS_TOKEN` **nunca** en código fuente ni logs.
- [ ] `.env` y `.envrc` en `.gitignore` — verificar antes de cada commit.
- [ ] HMAC verificado con `subtle::ConstantTimeEq` — no con `==`.
- [ ] HTTP 200 retornado en < 4s (patrón spawn-then-return).
- [ ] Deduplicación por `wamid` en SurrealDB antes de procesar efectos de red.
- [ ] `reqwest::Client` reutilizado (instancia única en `AppState`).
- [ ] Ninguna operación de I/O en el hot path del handler POST.
- [ ] Fallo temprano (`process::exit(1)`) si variables de entorno están ausentes.
- [ ] Nuevas dependencias validadas con `scan_dependencies` antes de agregar.

---

## 10. Errores Comunes y Cómo Evitarlos

| Error                                          | Causa                                      | Solución                                              |
|------------------------------------------------|--------------------------------------------|-------------------------------------------------------|
| Meta reintenta infinitamente                   | Handler tarda > 4s o retorna != 200        | Patrón respond-then-process con `tokio::spawn`        |
| Firma HMAC falla en staging pero no en local   | Body reparsado antes de verificar          | Leer `Bytes` crudos como extractor Axum directo       |
| Mensajes procesados múltiples veces            | Sin deduplicación por wamid                | Índice `UNIQUE` en `processed_wamids` de SurrealDB    |
| Token filtrado en logs                         | `println!` con variable de credencial      | Loguear solo IDs y estados, nunca valores de tokens   |
| `reqwest::Client` creado por request           | Instanciación dentro del handler/función   | Un único `Client` en `AppState` compartido por `Arc`  |
| Número suspendido por Meta                     | Múltiples timeouts consecutivos            | Monitoreo de latencia P99 del handler POST            |
