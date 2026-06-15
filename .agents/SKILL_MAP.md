# AXIOM — SKILL MAP
> Tabla de señalización: qué skill cargar según el contexto de la tarea.
> El agente consulta esto al inicio de cualquier tarea de código.

| Patrón detectado en la tarea | Skill a cargar | Archivo |
|---|---|---|
| `src/handlers/`, HMAC, wamid, webhook, Graph API, Meta | `meta-whatsapp` | `.agents/skills/meta-whatsapp/SKILL.md` |
| `state.db`, SurrealDB, TigerBeetle, SurrealQL, `RELATE` | `apex-persistence` | `.agents/skills/apex-persistence/SKILL.md` |
| `src/temporal/`, Workflow, Activity, RetryPolicy | `temporal-rust` | `.agents/skills/temporal-rust/SKILL.md` |
| Axum handler, `State<Arc<AppState>>`, `tokio::`, concurrencia | `axum-tokio` | `.agents/skills/axum-tokio/SKILL.md` |
| `frontend/`, `.tsx`, `.ts`, Next.js, App Router, Server Component | `nextjs-strict` | `.agents/skills/nextjs-strict/SKILL.md` |
| `flake.nix`, `nativeBuildInputs`, dependencias de sistema | `nix-flake-master` | `.agents/skills/nix-flake-master/SKILL.md` |
| `git commit`, cualquier commit de código | `conventional-commits` | `.agents/skills/conventional-commits/SKILL.md` |

## Regla de Aplicación

Si una tarea toca múltiples dominios (ej: handler Axum que escribe en SurrealDB), cargar TODAS las skills relevantes antes de generar código.

La skill `temporal-orchestration` está **DEPRECATED** — ignorar. Usar `temporal-rust`.
