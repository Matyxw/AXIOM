# AXIOM — Contexto Vivo del Proyecto
> Este archivo es la fuente de verdad para el agente al inicio de cada sesión.
> Actualizado automáticamente por `/sync-obsidian`. NO editar manualmente.
> Última actualización: 2026-06-16

---

## Estado Actual del Sistema

### ✅ Módulos que EXISTEN y funcionan
- **Webhook Handler** (`src/handlers/mod.rs`): Recibe eventos de Meta, verifica HMAC-SHA256 con `subtle::ConstantTimeEq`, despacha al spawn. Retorna 200 OK antes de procesar.
- **WhatsApp Egress** (`src/whatsapp.rs`): Envío de mensajes a Graph API con timeout y manejo de errores con `thiserror`.
- **AppState** (`src/state.rs`): Pool HTTP (`reqwest::Client`), SurrealDB (`Surreal<Client>`), tenant cache (`RwLock<HashMap>`), tokens WA y `temporal_client`.
- **Tenant Cache** (`src/state.rs`): Método `load_tenants_cache` carga en memoria las rutas.
- **Temporal Ingestion Workflow** (`src/temporal/workflows/ingestion_whatsapp.rs`): Orquesta Dedup → Intent → Dispatch. Aislado en thread `LocalSet` para prevenir error de `!Send`.
- **Temporal Activities** (`src/temporal/activities/ingestion_whatsapp.rs`): 3 actividades con lógica determinista de base de datos, simulación de IA y respuesta por HTTP a WhatsApp API.
- **Landing Page B2B** (`frontend/src/app/(public)/page.tsx` y `frontend/src/components/`): WebGL interactivo, módulos psicológicos, E2E QA con Playwright. Producción-ready.
- **Edge Middleware** (`frontend/src/proxy.ts`): Inyecta `x-user-persona` analizando el User-Agent.
- **Dashboard scaffold** (`frontend/src/app/(dashboard)/`): Layout + páginas de WhatsApp. Sin datos reales.

### ⚠️ Módulos ESTRUCTURALES (código escrito, compilación bloqueada)
- *Ninguno. Todo el código Rust actual compila perfectamente (`cargo check` OK).*

### 🔴 Bloqueantes para Producción
1. **Contenedores WSL:** Falla en la integración local de WSL2 con Docker Desktop, lo cual impide correr `docker compose up -d` y levantar Temporal y SurrealDB localmente para pruebas de QA.

---

## Decisiones Arquitectónicas Activas

Ver `.agents/decisions/` para el razonamiento completo. Resumen:

| Decisión | ADR | Resumen |
|---|---|---|
| SurrealDB con namespaces por tenant | ADR-001 | Aislamiento físico de datos — no confiar en cláusulas WHERE |
| Temporal.io sobre tokio::spawn | ADR-002 | Durabilidad y reintentos automáticos — aislando Worker en LocalSet thread |
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

El próximo paso crítico es **Configurar e integrar Groq API** en el `analyze_intent_activity` para que el intent classification no sea una mera simulación, y luego conectar los datos en tiempo real al **Dashboard B2B en Next.js** para visualizarlos. Además, el usuario debe resolver su acceso a Docker en WSL2.
