---
trigger: always_on
description: >
  Contrato operativo APEX. Stack: Rust+Axum+Tokio+Temporal.io | SurrealDB+TigerBeetle | Next.js 16+Tailwind 4 | Cloudflare ZT+Authelia+Infisical | Oracle Cloud+Coolify+Nix.
---

# APEX RULES v2.0

Responde en español técnico. Output exclusivamente técnico. Cambios incrementales: un módulo a la vez. Ante incertidumbre, señálala explícitamente antes de mostrar código.

---

## RUST + AXUM + TOKIO

**Errores:**
- `unwrap()` / `expect()` → **PROHIBIDOS** en producción. Propagar con `?`.
- `thiserror` para errores de dominio. `anyhow` solo en `main.rs` y tests.
- `panic!` solo en `#[cfg(test)]` o con `// SAFETY:` documentado.

**Axum:**
- Handlers: `Result<impl IntoResponse, AppError>` donde `AppError: IntoResponse`.
- Estado: `State<Arc<AppState>>`. `static mut` prohibido.
- Auth: middleware `from_fn_with_state` o extractores custom `FromRequestParts`.
- Extractores ordenados: `State` primero, body-consuming al final.

**Tokio:**
- **PROHIBIDO** bloquear el runtime: `std::thread::sleep`, `std::fs` síncrono dentro de `async fn`. Usar `tokio::time::sleep`, `tokio::fs`.
- `tokio::spawn`: conservar y gestionar el `JoinHandle`.
- `Arc<RwLock<T>>` preferido sobre `Arc<Mutex<T>>` para datos read-heavy.
- Timeout obligatorio en toda I/O externa: `tokio::time::timeout(Duration::from_secs(N), future).await?`.

**Versiones mínimas:** `axum="0.8"` · `tokio={version="1",features=["full"]}` · `surrealdb="2"` · `thiserror="2"` · `anyhow="1"`

---

## SURREALDB

- **SurrealQL único.** Prohibido SQL ANSI, JOINs relacionales, ORM.
- Relaciones: `RELATE`, `->`, `<-`. No simular joins con múltiples SELECT.
- `DEFINE INDEX` obligatorio en campos de búsqueda frecuente: `wamid`, `tenant_id`, `phone_number`.
- Parametrizar **siempre** con `.bind()`. Interpolación de strings = inyección garantizada.
- Multi-tenancy: `NAMESPACE {tenant_id} DATABASE apex`. Cross-namespace prohibido sin justificación.

---

## TEMPORAL.IO

- Lógica de larga duración, reintentos críticos, procesos que sobrevivan reinicios → **Temporal Workflow. Sin excepción.**
- Prohibidos como sustitutos: cron jobs ad-hoc, `tokio::time::interval` para flujos de negocio, retry casero.
- Workflows **deterministas**: prohibido I/O externo, UUIDs aleatorios, `SystemTime` dentro del Workflow.
- Activities: toda I/O externa. `RetryPolicy` explícito en cada Activity.
- Verificar `temporal-sdk` en `Cargo.toml` antes de generar imports.

---

## WHATSAPP CLOUD API (CRÍTICO)

**PROHIBICIÓN TOTAL:** Baileys, whatsapp-web.js, Puppeteer, Playwright, cualquier emulación de sesión. Ban permanente + exposición legal.

**Solo:** `graph.facebook.com` (WhatsApp Business Cloud API oficial).

**Webhook POST:** HTTP 200 en <4 segundos.
```
1. Verificar firma HMAC-SHA256 con subtle::ConstantTimeEq (<1ms)
2. tokio::spawn para procesar async
3. Retornar StatusCode::OK INMEDIATAMENTE (antes que cualquier otra cosa)
```

**Deduplicación:** verificar `wamid` con índice UNIQUE antes de procesar. TTL 72h.

---

## SEGURIDAD

- **PROHIBICIÓN ABSOLUTA** de hardcodear credenciales, tokens, API keys en código, configs, tests o comentarios.
- Secrets en runtime: `std::env::var("KEY").map_err(|_| AppError::Config("KEY ausente"))?`
- `.env` solo dev local. En `.gitignore`. Nunca en commit.
- Infisical/Vault inyecta secrets en producción.

---

## NIX

- **Toda** herramienta CLI/binario/compilador DEBE estar en `flake.nix`.
- **PROHIBIDO:** `apt install`, `brew install`, `cargo install` global, `npm install -g`.
- Si no existe en nixpkgs: derivation custom en el flake.
- Al modificar `flake.nix`, verificar sintaxis Nix válida antes de presentar.

---

## PROTOCOLO DE RESPUESTA

1. Ambigüedad → listar supuestos antes de generar código.
2. Deuda técnica detectada → reportar archivo+línea antes de continuar.
3. Post-bloque Rust no trivial → incluir `<!-- cargo check: OK | deps: [crate=versión] -->`
4. Dependencias Cargo → verificar en `Cargo.toml` antes de usar.