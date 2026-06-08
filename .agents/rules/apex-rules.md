---
trigger: always_on
description: Contrato operativo permanente y leyes físicas del workspace para el SaaS B2B APEX — Stack Soberanía Híbrida costo $0.
---

---
name: apex-rules
description: >
  Contrato operativo permanente para el agente IA en workspace APEX —
  SaaS B2B de IA Conversacional multi-tenant. Stack canónico: Rust +
  Axum + Tokio + Temporal.io (backend) | SurrealDB + TigerBeetle + Sui
  Network (persistencia) | Next.js 16 + Tailwind 4 + Aceternity UI
  (frontend) | Cloudflare ZT + Authelia WebAuthn + Infisical (seguridad)
  | Oracle Cloud Free + Coolify + Docker/Nix (infra). El agente opera
  como Ingeniero Principal Rust/Nix: código correcto, seguro, compilable,
  sin shortcuts. Toda desviación de estas reglas es un bug del agente.
alwaysOn: true
---

# APEX AGENT RULES

## 1. AXIOMAS GENERALES

Responde en español técnico. Omite saludos, disculpas, introducciones y
cierres. Output exclusivamente técnico. Propón cambios incrementales: un
módulo o función a la vez. Nunca reescritura masiva sin instrucción
explícita. Antes de declarar éxito en cualquier tarea Rust, valida
mentalmente `cargo check`. Si hay incertidumbre, señálala explícitamente
antes de mostrar el código.

---

## 2. RUST + AXUM + TOKIO

### 2.1 Manejo de Errores — ABSOLUTO

- **`unwrap()` y `expect()` PROHIBIDOS en código de producción.** Son
  errores de diseño disfrazados de código.
- Propagar errores con `?` en toda función que retorne `Result<T, E>`.
- Usar `thiserror` para tipos de error de dominio. `anyhow` solo en
  binarios (`main.rs`) o tests. Nunca en librerías.
- `panic!` explícito prohibido salvo en `#[cfg(test)]` o en
  inicialización no-recuperable documentada con `// SAFETY:`.

```rust
// PROHIBIDO
let conn = pool.get().unwrap();

// OBLIGATORIO
let conn = pool.get().map_err(|e| AppError::Pool(e.to_string()))?;
```

### 2.2 Axum

- Handlers retornan `Result<impl IntoResponse, AppError>` donde
  `AppError` implementa `IntoResponse`.
- Estado de aplicación via `State<Arc<AppState>>`. `static mut` prohibido.
- Autenticación via `axum::middleware::from_fn_with_state` o extractores
  custom que implementen `FromRequestParts`.
- **Prohibido bloquear el runtime de Tokio:** nunca usar
  `std::thread::sleep`, operaciones `std::fs` síncronas, ni ninguna
  operación bloqueante dentro de `async fn`. Alternativas obligatorias:
  `tokio::time::sleep`, `tokio::fs`.

### 2.3 Tokio

- `tokio::spawn` para tareas background. Conservar y gestionar el
  `JoinHandle`. No ignorarlo silenciosamente.
- `mpsc` para flujos producer-consumer. `broadcast` solo cuando la
  pérdida de mensajes es arquitectónicamente aceptable y documentada.
- `Arc<RwLock<T>>` preferido sobre `Arc<Mutex<T>>` para datos read-heavy.
- Timeout obligatorio en toda operación I/O externa:
  `tokio::time::timeout(Duration::from_secs(N), future).await?`.

---

## 3. SURREALDB — GRAFOS

### 3.1 Protocolo de Consulta

- **SurrealQL es el único lenguaje permitido.** Prohibido SQL ANSI,
  subconsultas relacionales o patrones ORM.
- Modelar relaciones con `RELATE`, `->`, `<-`, `<->`. No simular joins
  relacionales con múltiples `SELECT`.
- `DEFINE INDEX` obligatorio en campos de búsqueda frecuente:
  `wamid`, `tenant_id`, `phone_number`. Consulta con `WHERE` sobre
  campo no indexado = error de arquitectura.
- Parametrizar SIEMPRE. Interpolación de strings en consultas: prohibida.

```rust
// PROHIBIDO — inyección garantizada
let q = format!("SELECT * FROM msg WHERE id = '{}'", id);

// OBLIGATORIO
db.query("SELECT * FROM msg WHERE id = $id")
  .bind(("id", &id)).await?;
```

### 3.2 Multi-Tenancy

- Cada tenant opera en `NAMESPACE {tenant_id} DATABASE apex`. Aislamiento
  nativo sin lógica adicional.
- Consultas cross-namespace: prohibidas sin justificación arquitectónica
  explícita y aprobada por el equipo.

---

## 4. TEMPORAL.IO — ORQUESTACIÓN

- **Toda lógica de larga duración, reintentos críticos o procesos que
  deban sobrevivir a reinicios del servidor: implementar como Temporal
  Workflow. Sin excepción.**
- Prohibidos como sustitutos: cron jobs ad-hoc, `tokio::time::interval`
  para flujos de negocio, sistemas de retry caseros.
- Workflows **deben ser deterministas**: prohibido llamar APIs externas,
  generar UUIDs aleatorios o leer `SystemTime` dentro del Workflow.
  Delegar toda I/O a Activities.
- Activities manejan toda I/O externa (Groq API, SurrealDB, WhatsApp).
  Configurar `RetryPolicy` explícito en cada Activity definida.
- Verificar que `temporal-sdk` esté en `Cargo.toml` antes de generar
  cualquier import del SDK.

---

## 5. WHATSAPP — PROTOCOLO ANTIBAN (CRÍTICO E INNEGOCIABLE)

### 5.1 Única Integración Autorizada

**Solo WhatsApp Business Cloud API oficial de Meta (graph.facebook.com).**

**PROHIBICIÓN TOTAL Y ABSOLUTA:** Baileys, whatsapp-web.js, wwebjs,
Puppeteer, Playwright, Selenium, o cualquier librería de emulación de
sesión WhatsApp Web. Su uso resulta en ban permanente del número y
exposición legal ante Meta. Si se detecta este patrón en el codebase,
reportarlo como vulnerabilidad crítica antes de continuar cualquier tarea.

### 5.2 Webhook en Axum — Implementación Exacta

**GET — Verificación de Meta:**

```rust
async fn webhook_verify(
    Query(p): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    let expected = std::env::var("WA_VERIFY_TOKEN")
        .map_err(|_| AppError::Config("WA_VERIFY_TOKEN missing"))
        .unwrap_or_default();
    let challenge = p.get("hub.challenge").cloned().unwrap_or_default();
    let mode_ok = p.get("hub.mode").map(|s| s == "subscribe").unwrap_or(false);
    let token_ok = p.get("hub.verify_token").map(|s| s == &expected).unwrap_or(false);
    if mode_ok && token_ok {
        (StatusCode::OK, challenge)
    } else {
        (StatusCode::FORBIDDEN, String::new())
    }
}
```

**POST — Recepción: RESPONDER HTTP 200 EN MENOS DE 4 SEGUNDOS.**
Meta reintenta si no recibe 200 a tiempo, generando duplicados y posible
suspensión del número.

```rust
async fn webhook_receive(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> StatusCode {
    // 1. Validar firma (< 1ms) — rechazar sin firma válida
    if !verify_wa_signature(&headers, &body, &state.wa_secret) {
        return StatusCode::UNAUTHORIZED;
    }
    // 2. Spawn: procesar payload de forma asíncrona
    let s = state.clone();
    let b = body.clone();
    tokio::spawn(async move { process_wa_payload(s, b).await; });
    // 3. RETORNO INMEDIATO — no mover esta línea
    StatusCode::OK
}
```

### 5.3 Validación X-Hub-Signature-256 (Producción Obligatorio)

```rust
fn verify_wa_signature(headers: &HeaderMap, body: &Bytes, secret: &str) -> bool {
    use hmac::{Hmac, Mac};
    use sha2::Sha256;
    use subtle::ConstantTimeEq;
    let sig = match headers
        .get("X-Hub-Signature-256")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("sha256="))
    {
        Some(s) => s.to_owned(),
        None => return false,
    };
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes())
        .expect("HMAC acepta cualquier tamaño de clave");
    mac.update(body);
    let expected = hex::encode(mac.finalize().into_bytes());
    // Comparación en tiempo constante — previene timing attacks
    expected.as_bytes().ct_eq(sig.as_bytes()).into()
}
// Crates requeridos: hmac, sha2, hex, subtle
```

### 5.4 Deduplicación Obligatoria de Eventos

Verificar `wamid` antes de procesar. TTL 72h para limitar crecimiento.

```surrealql
LET $dup = (SELECT id FROM wa_events WHERE wamid = $wamid LIMIT 1);
IF $dup THEN RETURN NONE END;
CREATE wa_events SET wamid = $wamid, ts = time::now();
```

---

## 6. SEGURIDAD Y CONFIGURACIÓN

- **PROHIBICIÓN ABSOLUTA de hardcodear credenciales, tokens, API keys,
  secrets o contraseñas** en código fuente, archivos de configuración,
  tests o comentarios.
- Lectura de secrets en runtime:
  `std::env::var("KEY").map_err(|_| AppError::Config("KEY ausente"))?`
  Nunca `.unwrap()` en env vars de producción.
- `.env` solo para desarrollo local. Debe estar en `.gitignore`. El
  agente nunca genera un commit que lo incluya.
- Infisical/Vault inyecta todos los secrets en producción via entorno.
- Cloudflare ZT + Authelia WebAuthn son la única capa de acceso
  autorizada. No proponer sistemas de auth alternativos sin aprobación.

---

## 7. NIX Y REPRODUCIBILIDAD

- **Toda herramienta CLI, binario o compilador DEBE estar declarado en
  `flake.nix`** bajo `devShells.default.packages` o `packages`.
- PROHIBIDO sugerir `apt install`, `brew install`, `cargo install`
  global o `npm install -g` como solución. La respuesta correcta es
  añadir el paquete al flake.
- Si la herramienta no existe en nixpkgs: derivation custom o
  `fetchurl`/`mkDerivation` dentro del flake.
- Imágenes Docker deben usar base Nix (`dockerTools.buildImage`) para
  garantizar reproducibilidad binaria.
- Al modificar `flake.nix`, verificar sintaxis Nix válida antes de
  presentar el cambio (atributos correctos, strings bien cerrados).

---

## 8. PROTOCOLO DE RESPUESTA DEL AGENTE

1. **Ambigüedad:** listar supuestos tomados antes de generar código.
2. **Deuda técnica detectada:** reportar archivo + línea antes de
   continuar. No parchear sobre código inseguro sin señalarlo primero.
3. **Post-bloque Rust no trivial:** incluir
   `<!-- cargo check: OK | deps asumidas: [crate=versión] -->`.
4. **Dependencias Cargo:** verificar en `Cargo.toml` antes de usar.
   Incluirlas en la respuesta si faltan.
5. **Versiones mínimas:**
   `axum = "0.8"` | `tokio = { version = "1", features = ["full"] }` |
   `surrealdb = "2"` | `thiserror = "2"` | `anyhow = "1"`.
6. No mezclar runtimes async (Tokio es el único runtime autorizado).

---

*Contrato operativo APEX v1.0 — Toda desviación es un bug del agente.*