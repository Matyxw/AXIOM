# AXIOM — Contexto Vivo del Proyecto
> Este archivo es la fuente de verdad para el agente al inicio de cada sesión.
> Actualizado automáticamente por `/sync-obsidian`. NO editar manualmente.
> Última actualización: 2026-06-15

---

## Estado Actual del Sistema

### ✅ Módulos que EXISTEN y funcionan
- **Webhook Handler** (`src/handlers/mod.rs`): Recibe eventos de Meta, verifica HMAC-SHA256 con `subtle::ConstantTimeEq`, despacha al spawn. Retorna 200 OK antes de procesar.
- **WhatsApp Egress** (`src/whatsapp.rs`): Envío de mensajes a Graph API con timeout y manejo de errores con `thiserror`.
- **AppState** (`src/state.rs`): Pool HTTP (`reqwest::Client`), SurrealDB (`Surreal<Client>`), tenant cache (`RwLock<HashMap>`), tokens WA. `temporal_client` comentado.
- **Landing Page** (`frontend/src/app/(public)/page.tsx`): B2B premium, simulador táctico, animaciones. Producción-ready.
- **Auth Proxy** (`frontend/src/proxy.ts`): Zero Trust con Authelia/Cloudflare — extrae `x-axiom-tenant-id` de headers.
- **Dashboard scaffold** (`frontend/src/app/(dashboard)/`): Layout + páginas de WhatsApp. Sin datos reales.

### ⚠️ Módulos ESTRUCTURALES (código escrito, compilación bloqueada)
- **Temporal Ingestion Workflow** (`src/temporal/workflows/ingestion_whatsapp.rs`): Orquesta Dedup → Intent → Dispatch. Correcto arquitectónicamente. Bloqueado por: `temporal-sdk` no publicado en crates.io.
- **Temporal Activities** (`src/temporal/activities/ingestion_whatsapp.rs`): 3 actividades con lógica de SurrealDB + Groq + WhatsApp API.

### 🔴 Bloqueantes para Producción
1. **Falta inyección temporal:** El Worker de Temporal en `src/main.rs:44` no está inicializado.
2. **Dependencia Alpha:** `temporal-sdk` está detrás de un feature flag de cargo (`temporal`) porque es inestable.

---

## Decisiones Arquitectónicas Activas

Ver `.agents/decisions/` para el razonamiento completo. Resumen:

| Decisión | ADR | Resumen |
|---|---|---|
| SurrealDB con namespaces por tenant | ADR-001 | Aislamiento físico de datos — no confiar en cláusulas WHERE |
| Temporal.io sobre tokio::spawn | ADR-002 | Durabilidad y reintentos automáticos — un crash no pierde un lead |
| Groq API sobre OpenAI | ADR-003 | Latencia <500ms para intent classification en contexto de WhatsApp |

---

## Variables de Entorno Necesarias (ver `.env.example`)

```
WA_APP_SECRET          # HMAC signature de Meta
WA_ACCESS_TOKEN        # Token de la Graph API
WA_PHONE_ID            # ID del número de teléfono en WhatsApp Business
WA_VERIFY_TOKEN        # Token de verificación del webhook
SURREAL_URL            # ws://localhost:8000
GROQ_API_KEY           # API Key de Groq
```

---

## Próximo Sprint Sugerido

El único movimiento que desbloquea el sistema completo es implementar `load_tenants_cache`. Sin eso, todo lo demás (Temporal, LLM, respuestas automáticas) es código que nunca corre.

```rust
// Lo que necesita existir en src/domain/tenant.rs o src/state.rs:
// async fn load_tenants_cache(db: &Surreal<Client>, cache: &RwLock<HashMap<String, String>>)
// Consulta SurrealDB y carga phone_number_id → tenant_id en memoria.
```
