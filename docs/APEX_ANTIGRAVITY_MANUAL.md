# MANUAL TÁCTICO AXIOM — THE ARCHITECT (Claude Edition)
> Última actualización: 2026-06-14. Versión del agente: Claude Sonnet (via Cline/Roo Code).

---

## 1. EL CICLO DE TRABAJO (EN ORDEN)

1. **Diseñar en Obsidian** → Crear o actualizar el archivo de la feature en la bóveda (`08-features/` o `02-dominio/`)
2. **Activar al agente** → *"Lee la feature X en Obsidian y genera el plan"*
3. **El agente presenta** → `implementation_plan.md` con diagrama Mermaid del flujo de datos
4. **Aprobar** → El agente escribe código respetando las Skills de dominio
5. **Sincronizar** → Ejecutar `/sync-obsidian` para volcar el progreso en la bóveda

> ⛔ Si saltas el paso 1, el agente rechazará la orden (Doctrina Obsidian-First).

---

## 2. COMANDOS DISPONIBLES (WORKFLOWS)

| Comando | Cuándo usarlo | Qué hace exactamente |
| :--- | :--- | :--- |
| `/sync-obsidian` | Al terminar sesión o feature | Audita `git log`, cruza con Roadmap de Obsidian, actualiza MOCs, crea bitácora de sesión, detecta desviaciones del Roadmap |
| `/sandwich [tarea]` | Para tareas complejas multi-paso | Orquesta: Planificación → Ejecución → Validación con `cargo clippy`. Requiere aprobación del blueprint antes de codificar |
| `/temporal-scaffold [Nombre]` | Al crear un flujo durable de backend | Genera Workflow + Activities con patrones del SDK de Temporal. Pide confirmación de la lógica de negocio antes de escribir el cuerpo |
| `/cron-build` | Tras cambios estructurales en Rust | Lanza `cargo build --release` en background. El sistema revive al agente automáticamente cuando termina |
| `/audit-red-team` | Antes de merge a `main` / producción | Secuencia completa: threat model → escaneo de vulnerabilidades → PoC de ataque → reporte con parches aplicados |
| `/mockup-ui [Componente]` | Antes de codificar un componente nuevo | Genera imagen fotorrealista del diseño. Solo traduce a código si apruebas visualmente la estética |
| `/test-e2e [ruta?]` | Para probar el frontend Next.js | Lanza un Browser Subagent que navega `localhost:3000`, graba video `.webp` y entrega reporte QA con análisis de latencia visual |
| `/persistent-shell` | Al inicio de sesión con builds pesadas | Abre terminal `nix develop` persistente con caché caliente. Reutiliza el mismo TerminalID para `cargo check` y `cargo run` subsiguientes |
| `/review-security` | Antes de cualquier commit de backend | Audita: SurrealDB injections, HMAC bypass, `unwrap()` en producción, data leaks en logs. Entrega tabla `[LIMPIO] / [FALLO]` |

---

## 3. ESTADO REAL DEL PROYECTO (Mapa de Archivos)

### Backend — `/src/`

| Archivo | Qué es | Estado |
|---|---|---|
| `main.rs` | Punto de entrada. Inicializa SurrealDB, AppState, router Axum | ✅ Funcional — tiene 2 `TODO` conocidos (Temporal Worker + carga de tenants) |
| `state.rs` | `AppState`: guarda DB, http_client, tenant_cache, tokens WA | ✅ Correcto — `temporal_client` comentado a la espera del SDK |
| `config.rs` | Carga variables de entorno con `dotenvy` | ✅ Funcional |
| `error.rs` | Enum `AppError` con `thiserror` | ✅ Funcional |
| `models.rs` | Structs para parsear payloads de Meta (WebhookPayload, etc.) | ✅ Funcional |
| `whatsapp.rs` | `verify_wa_signature` (HMAC) + `send_whatsapp_message` (HTTP) | ✅ Producción-ready |
| `handlers/mod.rs` | Endpoints: `GET /webhook` (verificación) + `POST /webhook` (mensajes) | ✅ Funcional — deduplicación delegada a Temporal |
| `domain/tenant.rs` | Struct `Tenant` para modelo de datos | ✅ Existe, pendiente de poblar |
| `temporal/mod.rs` | Módulo raíz de Temporal | ✅ Registra sub-módulos |
| `temporal/workflows/ingestion_whatsapp.rs` | Orquestador del flujo: Dedup → Intent → Dispatch | ⚠️ Estructural — no compila hasta integrar SDK |
| `temporal/activities/ingestion_whatsapp.rs` | 3 Activities con lógica de SurrealDB + Groq + WhatsApp | ⚠️ Estructural — mismo estado que el Workflow |

### Frontend — `/frontend/src/`

| Archivo | Qué es | Estado |
|---|---|---|
| `app/layout.tsx` | Layout raíz de Next.js (fuentes, metadatos) | ✅ Funcional |
| `app/globals.css` | Variables CSS y estilos globales | ✅ Funcional |
| `app/(public)/page.tsx` | Landing page B2B completa con simulador táctico | ✅ Producción-ready |
| `app/(dashboard)/dashboard/layout.tsx` | Layout del dashboard privado (sidebar, nav) | ✅ Estructural — sin datos reales |
| `app/(dashboard)/dashboard/page.tsx` | Vista principal del dashboard | ⚠️ Mock — sin conexión a backend |
| `app/(dashboard)/dashboard/whatsapp/` | Módulo de conversaciones de WhatsApp | ⚠️ Existe — contenido por definir |
| `proxy.ts` | Autenticación Zero Trust (Authelia/Cloudflare) — antes `middleware.ts` | ✅ Funcional — exporta `proxy()` per Next.js 16 |
| `components/ui/border-beam.tsx` | Animación de borde luminoso para tarjetas | ✅ Usado en Landing |
| `components/ui/magnetic-button.tsx` | Botón con efecto magnético en hover | ✅ Usado en Landing |
| `components/ui/number-ticker.tsx` | Contador animado de métricas | ✅ Usado en Landing |
| `lib/utils.ts` | Helper `cn()` para classnames | ✅ Estándar |

### IA — `/.agents/`

| Archivo/Carpeta | Qué es | ¿Usarlo? |
|---|---|---|
| `.clinerules` | **System prompt inline** para Claude. Contiene TODAS las reglas sin tool calls. Es lo más importante del directorio | ✅ Crítico — Claude lo lee automáticamente |
| `CLAUDE.md` (raíz) | Fallback para extensiones genéricas de Claude (Cursor, etc.) | ✅ Útil como respaldo |
| `AGENTS.md` (raíz) | Versión completa y detallada de la persona THE ARCHITECT | ✅ Mantener — es la fuente de verdad, aunque no se lea en cada sesión |
| `rules/apex-rules.md` | Reglas técnicas detalladas (Rust, SurrealDB, Temporal, WA) | ✅ Fuente de verdad técnica |
| `rules/claude-core.md` | **Versión comprimida de apex-rules.md** optimizada para tokens | ✅ Es lo que vive dentro de `.clinerules` |
| `rules/decision-gate.md` | Protocolo de evaluación T1/T2/T3 con lentes de seguridad | ✅ Referencia — usar en cambios críticos |
| `rules/apex-planning.md` | Doctrina Obsidian-First y formato de diagramas Mermaid | ✅ Activo |
| `config/models.json` | Perfiles de modelos (Claude Sonnet, Opus, Gemini 1.5 Pro) | ✅ Mantener actualizado al cambiar de modelo |
| `skills/apex-persistence/` | Directivas para SurrealDB + TigerBeetle | ✅ Activo — se activa al tocar `state.db` |
| `skills/axum-tokio/` | Directivas para handlers Axum y concurrencia Tokio | ✅ Activo |
| `skills/conventional-commits/` | Formato de commits semánticos | ✅ Activo en cada `git commit` |
| `skills/meta-whatsapp/` | Reglas de oro para webhook, HMAC, wamid, Graph API | ✅ Crítico — activo en cualquier código de webhook |
| `skills/nextjs-strict/` | Protocolo Next.js 16: Server Components, App Router | ✅ Activo en archivos de `frontend/` |
| `skills/nix-flake-master/` | Doctrina de determinismo con Nix Flakes | ✅ Activo al agregar dependencias |
| `skills/temporal-rust/` | Directivas para Workflows y Activities de Temporal | ✅ Activo en `src/temporal/` |
| `skills/temporal-orchestration/` | **DEPRECATED** — Ya consolidado en `temporal-rust` | ❌ Eliminar en próxima limpieza |
| `workflows/sync-obsidian.md` | Protocolo de sincronización con Obsidian | ✅ Activo |
| `workflows/sandwich.md` | Orquestación de tareas complejas en 3 fases | ✅ Activo |
| `workflows/temporal-scaffold.md` | Scaffolding de Workflows de Temporal | ✅ Activo |
| `workflows/cron-build.md` | Build release en background | ✅ Activo |
| `workflows/audit-red-team.md` | Auditoría de seguridad ofensiva | ✅ Activo — usar antes de producción |
| `workflows/mockup-ui.md` | Generación de mockups con IA generativa | ✅ Activo — usar antes de programar UI nueva |
| `workflows/test-e2e.md` | Tests de navegador autónomos | ✅ Activo |
| `workflows/persistent-shell.md` | Shell Nix persistente reutilizable | ✅ Activo — recomendado para sesiones largas |
| `workflows/review-security.md` | Auditoría rápida pre-commit | ✅ Activo |

### Infra y Configuración — Raíz del Proyecto

| Archivo | Qué es | Estado |
|---|---|---|
| `flake.nix` | Entorno reproducible: Rust 1.89, Node 22, tools | ✅ Crítico — fuente de verdad de herramientas |
| `Cargo.toml` | Dependencias del backend Rust | ✅ — temporal-sdk comentado (SDK en alpha) |
| `Cargo.lock` | Lock del árbol de dependencias | ✅ Versionar siempre |
| `.env` | Secretos locales (NO en git) | ✅ Solo dev local |
| `.env.example` | Template de variables de entorno | ✅ Mantener actualizado |
| `.envrc` | Activa `nix develop` automáticamente con direnv | ✅ Útil si tienes direnv instalado |
| `.gitignore` | Archivos ignorados por git | ✅ Verificar que `.env` esté incluido |
| `.gitattributes` | Normalización de line endings | ✅ Dejar tal cual |
| `.devcontainer/` | Config de Dev Container (Docker) | ⚠️ Alternativa a Nix — no usar ambos en paralelo |
| `.vscode/` | Settings del editor | ✅ Mantener |
| `docs/` | Documentación técnica del proyecto | ✅ Activo |
| `docs_sincronizacion/` | Bitácoras antiguas de sincronización | 📦 Archivo histórico — no modificar |

---

## 4. DEUDA TÉCNICA DOCUMENTADA

| Archivo | Problema | Prioridad |
|---|---|---|
| `src/main.rs:L33` | `load_tenants_cache` comentado — todos los mensajes de WA se descartan si no hay tenant en cache | 🔴 Alta |
| `src/main.rs:L44` | Temporal Worker no inicializado — los workflows existen pero nadie los ejecuta | 🔴 Alta |
| `Cargo.toml:L20` | `temporal-sdk` comentado — SDK en alpha, no publicado en crates.io | 🟡 Media — bloqueante para producción |
| `src/temporal/workflows/ingestion_whatsapp.rs` | No compila hasta integrar SDK — código correcto estructuralmente | 🟡 Media |
| `frontend/app/(dashboard)/` | Dashboard sin datos reales — todo es UI estática | 🟡 Media — próximo sprint |
| `.agents/skills/temporal-orchestration/` | Skill marcada como DEPRECADA — nunca fue eliminada del repo | 🟢 Baja — limpieza cosmética |

---

## 5. CONTRATOS INQUEBRANTABLES DEL AGENTE

**Rust/Backend:**
- `unwrap()` / `expect()` en producción → RECHAZO. Solo en tests con `// SAFETY:`
- `std::sync::Mutex` en async → RECHAZO. Usar `tokio::sync::RwLock`
- `std::thread::sleep` en `async fn` → RECHAZO. Usar `tokio::time::sleep`
- I/O externa sin timeout → RECHAZO. Usar `tokio::time::timeout(Duration::from_secs(8), fut)`
- Query SurrealDB con string interpolado → RECHAZO. Usar `.bind(("key", &val))`
- Operación SurrealDB sin `use_ns(&tenant_id)` → RECHAZO (mezcla de datos entre tenants)

**Next.js/Frontend:**
- `useEffect` para fetch inicial → RECHAZO. Usar Server Components async
- `NEXT_PUBLIC_*` para secretos → RECHAZO
- Librerías de componentes (MUI, Bootstrap, shadcn empaquetado) → RECHAZO. Stack: Tailwind v4

**Everywhere:**
- `apt install` / `npm install -g` / `cargo install -g` → RECHAZO. Todo en `flake.nix`
- Código de feature sin diseño en Obsidian → VETO

---

## 6. DEBUGGING Y SESIONES

- **Recuperar razonamiento de sesión pasada:** Pedir al agente que escanee `transcript.jsonl` de la conversación (`/brain/<conversation-id>/.system_generated/logs/`)
- **Scripts temporales:** Guardar en `/brain/<conversation-id>/scratch/` — NUNCA en el repo
- **Sesiones largas con compilaciones:** Usar `/persistent-shell` al inicio para reutilizar cache de Nix y reducir builds de 3min a 15seg
- **Si el modelo no tiene contexto de lo que hicimos:** Ejecutar `/sync-obsidian` y luego mostrar el archivo de la bitácora de la sesión

---

## 7. PRÓXIMOS CUELLOS DE BOTELLA (Por Prioridad)

1. **`load_tenants_cache`**: Sin esto, el backend descarta TODOS los mensajes de WhatsApp en producción. Es el bloqueante #1 para un deploy real.
2. **Temporal Worker en `main.rs`**: Los Workflows existen pero el Worker no corre. El motor está muerto.
3. **Dashboard con datos reales**: El frontend está conectado visualmente pero sin API calls al backend Rust.
4. **TigerBeetle**: No ha sido integrado. El log financiero inmutable (facturación de leads) no existe aún.
