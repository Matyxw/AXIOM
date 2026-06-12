---
trigger: always_on
description: Protocolo pre-decisi\u00f3n. Se ejecuta mentalmente antes de cada acci\u00f3n, cambio de c\u00f3digo, dependencia, esquema o arquitectura.
---

# APEX DECISION GATE v2.0

## CLASIFICACI\u00d3N DE IMPACTO

| Tier | Activa cuando... | Respuesta |
|---|---|---|
| **T1 CRÍTICA** | Seguridad, HMAC, multi-tenant, schema BD, Temporal Workflows, deployment | Todos los lentes + bloque GATE visible |
| **T2 ARQUITECTÓNICA** | Nuevas deps, nuevos módulos, cambios en AppState, refactors cross-módulo | Lentes técnicos + GATE recomendado |
| **T3 TÁCTICA** | Naming local, helpers, tests, docs | Checklist mental implícito |

**Regla:** Ante duda, escalar al tier superior.

**Ejemplos de clasificación:**
- Agregar `wamid` a la deduplicación → T1
- Añadir un nuevo campo a `AppState` → T2
- Renombrar una variable local → T3

---

## LENTE 1 — SEGURIDAD (Veto automático si falla)

Preguntas a responder SÍ/NO antes de proceder:

| Pregunta | Si la respuesta es SÍ sin mitigación → |
|---|---|
| ¿Hay credenciales hardcodeadas en el diff? | RECHAZO total |
| ¿El path puede ser controlado por atacante externo? | RECHAZO total |
| ¿La validación HMAC usa comparación no en tiempo constante? | RECHAZO total |
| ¿El aislamiento por namespace de SurrealDB puede romperse? | RECHAZO total |
| ¿El logger imprime `phone_number` o contenido de mensaje raw? | CORRECCIÓN obligatoria |
| ¿El mismo `wamid` puede procesarse dos veces? | CORRECCIÓN obligatoria |

---

## LENTE 2 — RUST / TOKIO

Verificar en CADA bloque de código Rust generado:

- [ ] `unwrap()` / `expect()` en producción → reescribir con `?`
- [ ] `std::thread::sleep` / `std::fs` en `async fn` → reemplazar con `tokio::*`
- [ ] `tokio::spawn` sin capturar `JoinHandle` → justificar o corregir
- [ ] Handler del webhook: `StatusCode::OK` se emite ANTES del spawn
- [ ] Tipos que cruzan spawn boundary implementan `Send + 'static`
- [ ] `Arc<Mutex<T>>` en contexto read-heavy → reemplazar con `Arc<RwLock<T>>`
- [ ] I/O externa sin `tokio::time::timeout(Duration, future)` → agregar

---

## LENTE 3 — DEUDA ARQUITECTÓNICA

- ¿Existe una solución más simple que resuelve exactamente el mismo problema?
- ¿Esta abstracción es esencial al dominio o es complejidad accidental?
- ¿Cómo se comporta esto con 1000 tenants / 500k mensajes/día?
- ¿Es reversible? Las decisiones de una vía requieren análisis completo.
- ¿Un nuevo ingeniero puede entender esto en 6 meses sin preguntar?

---

## LENTE 4 — COMPLIANCE APEX-RULES

Checklist binario — responder COMPLIANT o VIOLACIÓN para cada punto:

| Dominio | Regla crítica |
|---|---|
| Rust/Axum | Handlers retornan `Result<impl IntoResponse, AppError>` |
| Rust/Axum | Estado vía `State<Arc<AppState>>` |
| Rust/Axum | `thiserror` en dominio, `anyhow` solo en `main.rs` |
| Rust/Tokio | Toda I/O externa con `tokio::time::timeout` |
| SurrealDB | Consultas parametrizadas con `.bind()` (nunca interpolación de strings) |
| SurrealDB | Relaciones con `RELATE`, nunca simular con múltiples SELECT |
| SurrealDB | `DEFINE INDEX` en campos de búsqueda frecuente |
| SurrealDB | Multi-tenancy vía `use_ns(&tenant_id).use_db("apex")` |
| WhatsApp | HMAC verificado primero con `subtle::ConstantTimeEq` |
| WhatsApp | HTTP 200 despachado en <4s (respond-then-spawn) |
| WhatsApp | `wamid` deduplicado ANTES de efectos secundarios |
| Temporal | Lógica durable en Workflow, nunca en cron/retry casero |
| Temporal | Workflows sin I/O, sin UUIDs aleatorios, sin SystemTime |
| Nix | Toda herramienta nueva en `flake.nix`, nunca `apt install` |

---

## LENTE 5 — EFECTOS DE SEGUNDO ORDEN

- Si esto falla en producción, ¿falla silenciosamente o con error capturado?
- ¿Qué pasa si Meta reintenta el mismo evento 3 veces? ¿Sigue siendo idempotente?
- ¿Esta decisión rompe la capacidad de Temporal de recuperar estado post-crash?
- ¿Hay race condition posible con dos workers procesando el mismo payload?

---

## LENTE 6 — MÍNIMA EXISTENCIA

- ¿Ya existe esto en el stack (Axum extractors, SurrealDB features, Tokio primitives)?
- ¿Estoy resolviendo el problema real o el asumido?
- ¿Menos código, misma correctitud?

---

## VETOS AUTOMÁTICOS (no negociables — bloquean cualquier avance)

| Condición detectada | Acción inmediata |
|---|---|
| Credencial hardcodeada en cualquier archivo | RECHAZO total del diff |
| `unwrap()` sin `// SAFETY:` en código de producción | RECHAZO, reescribir antes de continuar |
| HMAC bypass o comparación no en tiempo constante | RECHAZO total |
| Query SurrealDB con interpolación de strings | RECHAZO, reescribir con `.bind()` |
| Blocking I/O en async hot path del webhook | RECHAZO, usar `tokio::*` |
| Estado mutable compartido sin sincronización | RECHAZO |
| Nueva dependencia no verificada en `Cargo.toml` | BLOQUEO hasta verificar |

---

## BLOQUE GATE — USAR EN CAMBIOS T1 Y T2

```
<!-- DECISION GATE
  Tier        : [T1 CRÍTICA / T2 ARQUITECTÓNICA / T3 TÁCTICA]
  Seguridad   : [OK | RIESGO → descripción exacta]
  Rust/Tokio  : [OK | ISSUE → descripción exacta]
  Deuda       : [Ninguna | Baja | Media | Alta → qué se paga y cuándo]
  Reversible  : [Sí / No → implicaciones si No]
  APEX-Rules  : [Compliant | VIOLACIÓN → qué regla exactamente]
  2do Orden   : [efecto no obvio más crítico | Ninguno]
-->
```