---
trigger: always_on
description: >
  Contrato operativo APEX. Stack: Rust+Axum+Tokio+Temporal.io | SurrealDB+TigerBeetle | Next.js 16+Tailwind 4 | Cloudflare ZT+Authelia+Infisical | Oracle Cloud+Coolify+Nix.
---

# APEX RULES v2.0

Responde en español técnico. Output exclusivamente técnico. Cambios incrementales: un módulo a la vez. Ante incertidumbre, señálala explícitamente antes de mostrar código.

---

## RUST + AXUM + TOKIO

### Manejo de Errores — PATRÓN OBLIGATORIO

```rust
// ✅ CORRECTO
pub async fn handler(State(state): State<Arc<AppState>>) -> Result<impl IntoResponse, AppError> {
    let data = state.db.query("...").await?; // propaga con ?
    Ok(Json(data))
}

// ❌ PROHIBIDO — unwrap() en producción
let data = state.db.query("...").await.unwrap(); // causa panic en producción
```

- `thiserror` para errores de dominio. `anyhow` solo en `main.rs` y tests.
- `panic!` solo en `#[cfg(test)]` o con `// SAFETY:` documentado.

### Estado y Extractores Axum — ORDEN OBLIGATORIO

```rust
// ✅ CORRECTO — State primero, body-consuming al final
async fn webhook(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,          // body-consuming SIEMPRE AL FINAL
) -> Result<impl IntoResponse, AppError>

// ❌ PROHIBIDO — body antes de State
async fn webhook(body: Bytes, State(state): State<Arc<AppState>>)
```

### Concurrencia Tokio — REGLAS CRÍTICAS

```rust
// ✅ CORRECTO
tokio::time::sleep(Duration::from_secs(1)).await;
tokio::fs::read_to_string("archivo").await?;

// ❌ PROHIBIDO — bloquea el runtime Tokio
std::thread::sleep(Duration::from_secs(1));
std::fs::read_to_string("archivo")?;

// ✅ CORRECTO — RwLock para datos read-heavy
Arc<tokio::sync::RwLock<HashMap<String, String>>>

// ❌ PROHIBIDO — Mutex en contexto async read-heavy
Arc<std::sync::Mutex<HashMap<String, String>>>
```

**Timeout obligatorio en toda I/O externa:**
```rust
// ✅ CORRECTO
tokio::time::timeout(Duration::from_secs(8), future).await
    .map_err(|_| AppError::Timeout)?;

// ❌ PROHIBIDO — sin timeout
client.post(url).send().await?;
```

**Versiones mínimas:** `axum="0.8"` · `tokio={version="1",features=["full"]}` · `surrealdb="2"` · `thiserror="2"` · `anyhow="1"`

---

## SURREALDB

### Queries — PARAMETRIZACIÓN OBLIGATORIA

```rust
// ✅ CORRECTO
state.db
    .query("SELECT * FROM message WHERE id = $wamid")
    .bind(("wamid", &wamid))
    .await?;

// ❌ PROHIBIDO — inyección SQL garantizada
let q = format!("SELECT * FROM message WHERE id = '{}'", wamid);
state.db.query(q).await?;
```

### Multi-Tenancy — NAMESPACE POR TENANT

```rust
// ✅ CORRECTO — posicionar en namespace del tenant ANTES de operar
state.db.use_ns(&tenant_id).use_db("apex").await?;

// ❌ PROHIBIDO — operar en el namespace por defecto
state.db.query("SELECT * FROM messages").await?; // mezcla datos de todos los tenants
```

### Relaciones — GRAFO NATIVO

```surrealql
-- ✅ CORRECTO
RELATE tenant:$tenant_id->received->message:$wamid SET timestamp = time::now();

-- ❌ PROHIBIDO — simular relaciones con campos FK
UPDATE message SET tenant_id = $tenant_id WHERE id = $wamid;
```

- `DEFINE INDEX` obligatorio en: `wamid`, `tenant_id`, `phone_number`.

---

## TEMPORAL.IO

- Lógica de larga duración, reintentos críticos, procesos que sobrevivan reinicios → **Temporal Workflow. Sin excepción.**
- **Workflows DEBEN ser deterministas:** sin I/O externo, sin `Uuid::new_v4()`, sin `SystemTime::now()` dentro del Workflow.
- Toda I/O externa va en **Activities** con `RetryPolicy` explícito.
- **Prohibidos como sustitutos de Temporal:** cron jobs ad-hoc, `tokio::time::interval` para flujos de negocio, retry casero con loops.

---

## WHATSAPP CLOUD API (CRÍTICO)

**PROHIBICIÓN TOTAL + BAN PERMANENTE:** Baileys, whatsapp-web.js, Puppeteer, Playwright, cualquier emulación de sesión.
**Solo:** `graph.facebook.com` (WhatsApp Business Cloud API oficial).

### Patrón de Webhook POST — ORDEN ESTRICTO

```rust
// ✅ CORRECTO — 200 ANTES del spawn
pub async fn webhook_handler(...) -> impl IntoResponse {
    if !verify_wa_signature(&headers, &body, &state.wa_app_secret) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    // SPAWN PRIMERO, RESPONDER INMEDIATAMENTE
    tokio::spawn(async move { process_message(body, state).await; });
    StatusCode::OK.into_response() // Meta recibe 200 en <4s
}

// ❌ PROHIBIDO — procesar ANTES de responder
pub async fn webhook_handler(...) -> impl IntoResponse {
    process_message(&body, &state).await?; // Meta timeout → suspensión del número
    StatusCode::OK.into_response()
}
```

**Deduplicación:** verificar `wamid` con índice UNIQUE antes de procesar. TTL 72h.

---

## SEGURIDAD

```rust
// ✅ CORRECTO
let token = std::env::var("WA_ACCESS_TOKEN")
    .map_err(|_| AppError::Config("WA_ACCESS_TOKEN ausente".into()))?;

// ❌ PROHIBIDO — hardcoded en cualquier archivo, incluidos tests y comments
const TOKEN: &str = "EAAI_abc123...";
```

- `.env` solo dev local. En `.gitignore`. Infisical/Vault inyecta en producción.

---

## NIX

- **Toda** herramienta CLI/binario/compilador DEBE estar en `flake.nix → nativeBuildInputs`.
- **PROHIBIDO:** `apt install`, `brew install`, `cargo install` global, `npm install -g`.

---

## PROTOCOLO DE RESPUESTA

1. Ambigüedad → listar supuestos antes de generar código.
2. Deuda técnica detectada → reportar `archivo:línea` antes de continuar.
3. Post-bloque Rust no trivial → incluir `<!-- cargo check: OK | deps: [crate=versión] -->`
4. Dependencias Cargo → verificar en `Cargo.toml` antes de usar.
5. Nueva feature sin diseño en Obsidian → VETO. No codificar.