# 🧠 MANUAL TÁCTICO: ANTIGRAVITY "THE ARCHITECT" (APEX-GRADE)
> *Cheat Sheet operativo. Última actualización: 2026-06-12.*

---

## 1. EL CICLO DE TRABAJO (EN ORDEN)

1. **Diseño en Obsidian** → Crear o actualizar el archivo de la feature en `08-features/` o `02-dominio/`
2. **Solicitar al agente** → *"Lee la feature X en Obsidian y genera el plan"*
3. **El agente presenta** → `implementation_plan.md` con diagrama Mermaid del flujo de datos
4. **Aprobar** → El agente escribe el código respetando las Skills de dominio
5. **Sincronizar** → Tirar `/sync-obsidian` para volcar el progreso en la bóveda

> ⛔ Si saltas el paso 1, el agente te rechazará la orden por la Doctrina Obsidian-First.

---

## 2. COMANDOS DISPONIBLES

| Comando | Cuándo usarlo | Qué hace |
| :--- | :--- | :--- |
| **`/sync-obsidian`** | Al terminar una sesión o feature | Audita `git log`, cruza con Roadmap, actualiza MOCs, crea bitácora de sesión, detecta desviaciones |
| **`/temporal-scaffold [Nombre]`** | Al crear un nuevo flujo de backend | Genera Workflow + Activity con patrones del SDK real de Temporal. Pide confirmación sobre la lógica de negocio antes de escribir el cuerpo |
| **`/test-e2e [ruta?]`** | Para probar el frontend Next.js | Lanza un Browser Subagent que navega `localhost:3000`, graba un video `.webp` y entrega reporte QA |
| **`/cron-build`** | Tras cambios estructurales en Rust | `cargo build --release` en background. El sistema revive al agente cuando termina |
| **`/audit-red-team`** | Antes de merge a `main` / producción | Secuencia: threat model → escaneo de vulnerabilidades → PoC de ataque → reporte con parches |
| **`/mockup-ui [Componente]`** | Antes de programar un componente nuevo | Genera imagen fotorealista del diseño. Solo traduce a código si el usuario aprueba visualmente |
| **`/persistent-shell`** | Al inicio de sesión con compilaciones pesadas | Abre terminal `nix develop` persistente con caché caliente para compilaciones más rápidas |

---

## 3. CONTRATOS INQUEBRANTABLES DEL AGENTE

**En Rust (Backend):**
- `unwrap()` / `expect()` → **PROHIBIDO en código de producción**. Solo en tests o con comentario `// SAFETY:`
- `std::sync::Mutex` en contexto async → **PROHIBIDO**. Usar `tokio::sync::RwLock`
- `std::thread::sleep` dentro de `async fn` → **PROHIBIDO**. Usar `tokio::time::sleep`
- I/O externa sin timeout → **PROHIBIDO**. Envolver con `tokio::time::timeout(Duration, future).await??`
- Query SurrealDB con strings interpolados → **PROHIBIDO**. Usar `.bind(("key", value))`

**En Next.js (Frontend):**
- `useEffect` para fetching inicial → **PROHIBIDO**. Usar Server Components con `async/await`
- `NEXT_PUBLIC_*` para API keys o secrets → **PROHIBIDO**. Solo para datos verdaderamente públicos
- Instalar librerías de componentes empaquetadas (MUI, Bootstrap) → **PROHIBIDO**. Stack es Tailwind v4 + Aceternity UI

**En cualquier lugar:**
- `apt install` / `npm install -g` globalmente → **PROHIBIDO**. Todo va en `flake.nix`
- Código de feature sin diseño previo en Obsidian → **PROHIBIDO**

---

## 4. SKILLS ACTIVAS (LO QUE EL AGENTE SABE SIN QUE LE DIGAS)

| Skill | Se activa cuando... |
|---|---|
| `meta-whatsapp` | Cualquier código de webhook, HMAC, wamid, Graph API |
| `apex-persistence` | Código de SurrealDB, TigerBeetle, grafos de datos |
| `temporal-rust` | Archivos en `src/temporal/`, creación de Workflows/Activities |
| `axum-tokio` | Handlers, middleware, estado compartido, concurrencia |
| `nextjs-strict` | Cualquier archivo en `frontend/` |
| `nix-flake-master` | Adición de dependencias al sistema o toolchain |
| `conventional-commits` | Siempre que el agente propone un `git commit` |

---

## 5. DEUDA TÉCNICA DOCUMENTADA (Estado actual)

| Archivo | Problema | Prioridad |
|---|---|---|
| `src/handlers/mod.rs` | Deduplicación wamid en hot-path (antes del spawn) — si SurrealDB tarda >4s, Meta suspende el número | 🔴 Alta — resolver al migrar a Temporal |
| `src/main.rs` | `temporal_client` comentado — el worker de Temporal no está inicializado | 🔴 Alta — próximo sprint |
| `src/main.rs` | `load_tenants_cache` comentado — si no se cargan tenants, todos los mensajes se descartan | 🟡 Media |

---

## 6. DEBUGGING ASIMÉTRICO

- Scripts de prueba temporales → guardar en `<appDataDir>/brain/<conversation-id>/scratch/` (nunca en el repo)
- Para recuperar razonamiento de sesiones pasadas → pedir al agente que escanee `transcript.jsonl` de la conversación en cuestión
