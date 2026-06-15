# APEX_ANTIGRAVITY_MANUAL
> Manual de documentación del sistema de agente THE ARCHITECT sobre el proyecto AXIOM.
> El estado del proyecto, deuda técnica y roadmap viven en Obsidian, no aquí.

---

## 1. QUÉ ES ESTE SISTEMA

AXIOM usa un agente de IA con identidad y reglas propias llamado **THE ARCHITECT**. El agente opera dentro de Antigravity IDE (este editor) o de Cline/Roo Code en VS Code. Ambos leen los mismos archivos de configuración del repositorio.

El objetivo del sistema de reglas no es limitarte sino garantizar que el agente genere código que cumpla los contratos de seguridad, arquitectura y determinismo del stack elegido — sin que tengas que repetirlo en cada sesión.

---

## 2. CÓMO FUNCIONA EL CICLO DE TRABAJO

```
1. Diseñar feature en Obsidian  →  08-features/ o 02-dominio/
2. Solicitar al agente           →  "Lee la feature X y genera el plan"
3. El agente presenta            →  implementation_plan.md con Mermaid
4. Aprobar                       →  El agente implementa un módulo a la vez
5. Sincronizar                   →  /sync-obsidian
```

> Si saltás el paso 1, el agente rechaza la orden por la **Doctrina Obsidian-First**.

---

## 3. ARCHIVOS DE CONFIGURACIÓN DEL AGENTE

### `.clinerules` (raíz del proyecto)
El archivo más importante. Cline y Roo Code lo inyectan directamente en el System Prompt de cada conversación. Contiene las reglas técnicas condensadas (vetos automáticos, patrones obligatorios, formato de respuesta). Cuanto más pequeño sea este archivo, menos tokens se consumen en cada request.

**Qué contiene:** Identidad de THE ARCHITECT, stack técnico, vetos automáticos de Rust/SurrealDB/Temporal/WhatsApp, reglas de Nix, y el formato de respuesta esperado.

**Regla de modificación:** Si querés agregar una regla nueva, debe ser en formato bullet point denso. Nunca bloques de código de ejemplo — esos van en `claude-core.md` o en las Skills.

### `CLAUDE.md` (raíz del proyecto)
Fallback para extensiones genéricas de Claude (Cursor, otros editores). Le indica al agente que lea `.clinerules` y `AGENTS.md`. No contiene reglas en sí.

### `AGENTS.md` (raíz del proyecto)
La versión completa y detallada de la persona THE ARCHITECT. Incluye los principios epistemológicos, dominios de conocimiento, protocolo de interacción y comportamientos prohibidos. Es la fuente de verdad de la identidad. No se lee en cada sesión (eso gastaría tokens), pero está disponible si el agente necesita profundidad.

### `.agents/rules/apex-rules.md`
Reglas técnicas detalladas con ejemplos de código. Referencia larga — se consulta puntualmente, no se carga en cada sesión.

### `.agents/rules/claude-core.md`
Versión comprimida de `apex-rules.md`. Es exactamente lo que vive dentro de `.clinerules`. Si actualizás `.clinerules`, actualizá también este archivo para mantener paridad.

### `.agents/rules/decision-gate.md`
Protocolo de evaluación de cambios. Define tres tiers:
- **T1 CRÍTICA**: Seguridad, HMAC, multi-tenant, schema de BD, deploy → requiere bloque `DECISION GATE` visible
- **T2 ARQUITECTÓNICA**: Nuevas dependencias, nuevos módulos, cambios en AppState
- **T3 TÁCTICA**: Naming, helpers, docs → solo checklist mental

### `.agents/rules/apex-planning.md`
Doctrina Obsidian-First y reglas de planificación. Obliga a que todo `implementation_plan.md` incluya diagrama Mermaid.

### `.agents/config/models.json`
Perfiles de modelos disponibles. Guía de cuándo usar cada uno:
- **Claude Haiku**: edición de archivos, refactors simples, commits, Q&A rutinario
- **Claude Sonnet**: arquitectura nueva, debugging complejo, auditorías de seguridad
- **Gemini 1.5 Pro**: sesiones con Extended Thinking habilitado (tasks muy complejas)

---

## 4. SKILLS — LO QUE EL AGENTE SABE SIN QUE LE DIGAS

Las Skills son archivos de instrucciones especializadas en `.agents/skills/`. El agente las lee automáticamente cuando detecta el contexto correcto.

| Skill | Se activa cuando... | Qué aporta |
|---|---|---|
| `meta-whatsapp` | Código de webhook, HMAC, wamid, Graph API | Orden estricto del handler, deduplicación de wamid, prohibición de Baileys |
| `apex-persistence` | Código con `state.db`, SurrealDB, TigerBeetle | Multi-tenancy con `use_ns`, relaciones con `RELATE`, índices obligatorios |
| `temporal-rust` | Archivos en `src/temporal/`, creación de Workflows/Activities | Determinismo de Workflows, Activities con RetryPolicy, prohibición de cron casero |
| `axum-tokio` | Handlers Axum, middleware, estado compartido | Orden de extractores, RwLock en async, timeout en I/O externa |
| `nextjs-strict` | Cualquier archivo en `frontend/` | Server Components, App Router, prohibición de useEffect para fetch |
| `nix-flake-master` | Adición de dependencias al sistema o toolchain | Todo en `flake.nix`, nunca `apt install` |
| `conventional-commits` | Siempre que el agente propone un `git commit` | Formato semántico: `feat/fix/chore/perf/docs(scope): mensaje` |

> `temporal-orchestration` está marcada como **DEPRECATED** — nunca fue eliminada pero no debe usarse. La reemplaza `temporal-rust`.

---

## 5. WORKFLOWS — COMANDOS DISPONIBLES

### 5a. Con botón en Antigravity IDE (slash commands registrados)

Estos aparecen como botones en el panel de comandos de Antigravity. También funcionan en Cline escribiendo el comando.

| Comando | Propósito | Cuándo usarlo |
|---|---|---|
| `/sync-obsidian` | Auditar git log, cruzar con Roadmap, actualizar MOCs en Obsidian, crear bitácora de sesión, detectar desviaciones | Al terminar sesión o feature completa |
| `/sandwich [tarea]` | Orquestar tarea compleja: Blueprint → Ejecución → Validación con `cargo clippy`. Requiere aprobación del blueprint antes de codificar | Para tareas multi-paso que requieren planificación explícita |
| `/temporal-scaffold [Nombre]` | Generar Workflow + Activities del SDK de Temporal con patrones correctos | Al crear un nuevo flujo de backend durable |
| `/cron-build` | Lanzar `cargo build --release` en background — el sistema revive al agente cuando termina | Tras cambios estructurales en Rust |
| `/audit-red-team` | Secuencia completa: threat model → escaneo → PoC de ataque → reporte con parches | Antes de merge a `main` o deploy a producción |

### 5b. Workflows manuales (sin botón — archivo existe pero no está registrado en Antigravity)

Estos archivos están en `.agents/workflows/` y el agente puede seguirlos si se los describís verbalmente o los mencionás. Para invocarlos, decile al agente exactamente qué querés hacer y él leerá el workflow correspondiente.

| Workflow | Archivo | Propósito | Cómo invocarlo |
|---|---|---|---|
| Mockup UI | `mockup-ui.md` | Generar imagen fotorrealista del diseño antes de codificar | "Generá un mockup del componente X antes de escribir código" |
| Test E2E | `test-e2e.md` | Browser Subagent que navega `localhost:3000`, graba video `.webp` y entrega reporte QA | "Ejecutá un test E2E del frontend" |
| Persistent Shell | `persistent-shell.md` | Abrir terminal `nix develop` persistente con caché caliente | "Abrí un shell persistente con nix develop" |
| Review Security | `review-security.md` | Auditar: SurrealDB injections, HMAC bypass, `unwrap()` en prod, data leaks. Tabla `[LIMPIO/FALLO]` | "Hacé una review de seguridad del código de esta sesión" |

---

## 6. CONTRATOS TÉCNICOS DEL AGENTE

Estas reglas no son sugerencias. El agente veta automáticamente código que las viole.

### Rust / Axum / Tokio
- `unwrap()` / `expect()` en producción → veto. Solo en tests con `// SAFETY:`
- `std::sync::Mutex` en async → veto. Usar `tokio::sync::RwLock`
- `std::thread::sleep` en `async fn` → veto. Usar `tokio::time::sleep`
- I/O externa sin timeout → veto. Usar `tokio::time::timeout(Duration::from_secs(8), fut)`
- Extractores Axum: `State<Arc<AppState>>` primero, `Bytes` siempre al final
- Errores: propagar con `?`, `thiserror` en dominio, `anyhow` solo en `main.rs`

### SurrealDB
- Queries con string interpolado → veto. Usar `.bind(("key", &val))`
- Operar sin `use_ns(&tenant_id).use_db("apex")` → veto (mezcla datos entre tenants)
- Relaciones: `RELATE tenant->edge->message` — nunca simular con campos FK
- `DEFINE INDEX` obligatorio en: `wamid`, `tenant_id`, `phone_number`

### WhatsApp Cloud API
- Único endpoint: `graph.facebook.com` — solo API oficial
- Webhook: verificar HMAC-SHA256 con `subtle::ConstantTimeEq` primero
- Responder `200 OK` a Meta antes del `tokio::spawn` — si Meta espera más de 4s, suspende el número
- Deduplicar `wamid` con índice UNIQUE antes de efectos secundarios
- Baileys / whatsapp-web.js / Puppeteer → ban permanente

### Next.js / Frontend
- `useEffect` para fetch inicial → veto. Usar Server Components con `async/await`
- `NEXT_PUBLIC_*` para secretos → veto
- Librerías de componentes empaquetadas (MUI, Bootstrap) → veto. Stack: Tailwind v4

### Infraestructura
- `apt install` / `npm install -g` / `cargo install -g` → veto. Todo en `flake.nix`
- Código de feature sin diseño en Obsidian → veto

---

## 7. DÓNDE VIVE CADA TIPO DE INFORMACIÓN

| Tipo de información | Dónde va | NO va en |
|---|---|---|
| Estado actual del proyecto | Obsidian (`01-estado/`) | Este manual |
| Deuda técnica | Obsidian (`01-estado/`) | Este manual |
| Roadmap y próximos pasos | Obsidian (`04-roadmap/`) | Este manual |
| Bitácoras de sesión | Obsidian (`06-sesiones/`) | Este manual |
| Cómo funciona el sistema de agente | Este manual | Obsidian |
| Reglas técnicas del agente | `.clinerules` + `.agents/rules/` | Obsidian |
| Scripts temporales de debug | `/brain/<conversation-id>/scratch/` | El repo |

---

## 8. DEBUGGING Y RECUPERACIÓN DE SESIÓN

- **Recuperar razonamiento de sesión pasada:** Pedirle al agente que escanee `transcript.jsonl` en `/brain/<conversation-id>/.system_generated/logs/`
- **Sesión sin contexto del sprint anterior:** Ejecutar `/sync-obsidian` y luego mostrar la bitácora de la sesión correspondiente
- **Compilaciones lentas:** Usar `/persistent-shell` al inicio de la sesión para reutilizar el caché de Nix — reduce builds de ~3min a ~15seg
- **Agente gasta muchos tokens:** Cerrar archivos irrelevantes del editor, iniciar nueva conversación, usar Haiku para tareas rutinarias
