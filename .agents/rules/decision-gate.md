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

---

## LENTE 1 — SEGURIDAD

- ¿Hay credenciales? → ¿Están en `std::env::var`?
- ¿El path puede ser controlado por atacante externo?
- ¿La validación HMAC-SHA256 usa `subtle::ConstantTimeEq`?
- ¿El aislamiento por namespace de SurrealDB sigue intacto?
- ¿El logger imprime números de teléfono o contenido de mensajes?
- ¿Puede un evento de Meta procesarse dos veces sin deduplicación por `wamid`?

**Veto:** Cualquier "sí" sin mitigación → el cambio no procede.

---

## LENTE 2 — RUST / TOKIO

- `unwrap()` / `expect()` en producción → ERROR, reescribir con `?`
- Blocking I/O (`std::fs`, `std::thread::sleep`) en `async fn` → ERROR, usar `tokio::*`
- `tokio::spawn` sin conservar `JoinHandle` → FLAG si no está justificado
- Handler del webhook: ¿`StatusCode::OK` se emite ANTES del spawn?
- Tipos que cruzan spawn boundary: ¿implementan `Send + 'static`?
- ¿`Arc<Mutex<T>>` donde debería ser `Arc<RwLock<T>>`?

---

## LENTE 3 — DEUDA ARQUITECTÓNICA

- ¿Existe una solución más simple que resuelve exactamente el mismo problema?
- ¿Esta abstracción es esencial al dominio o es complejidad accidental?
- ¿Cómo se ve esto con 1000 tenants / 500k mensajes/día?
- ¿Es reversible? Las decisiones de una vía requieren análisis completo.
- ¿Un nuevo ingeniero puede entender esto en 6 meses sin preguntar?

---

## LENTE 4 — COMPLIANCE APEX-RULES (checklist binario)

**Rust/Axum:** `thiserror` en dominio · `anyhow` solo en `main.rs` · toda I/O externa con `tokio::time::timeout` · handlers retornan `Result<impl IntoResponse, AppError>` · estado via `State<Arc<AppState>>`

**SurrealDB:** Consultas parametrizadas con `.bind()` · relaciones con `RELATE` · `DEFINE INDEX` en campos de búsqueda frecuente · multi-tenancy via `NAMESPACE {tenant_id}`

**WhatsApp:** HMAC verificado primero · HTTP 200 en <4s (respond-then-spawn) · `wamid` deduplicado ANTES de efectos · cero Baileys/emulación

**Temporal:** Lógica durable → Workflow · Workflows deterministas (sin I/O, sin UUIDs random, sin SystemTime) · I/O externa → Activities con RetryPolicy

**Nix:** Toda herramienta nueva en `flake.nix` · cero `apt install` / `cargo install` global

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

## VETOS AUTOMÁTICOS (no negociables)

| Condición | Acción |
|---|---|
| Credencial hardcodeada | RECHAZO total |
| `unwrap()` sin `// SAFETY:` en producción | RECHAZO |
| HMAC bypass / comparación no en tiempo constante | RECHAZO |
| Query SurrealDB con interpolación de strings | RECHAZO |
| Blocking I/O en async hot path del webhook | RECHAZO |
| Estado mutable compartido sin sincronización | RECHAZO |
| Nueva dependencia sin verificación | BLOQUEO hasta verificar |

---

## BLOQUE GATE (T1 y T2)

```
<!-- DECISION GATE
  Tier        : [T1/T2/T3]
  Seguridad   : [OK | RIESGO → descripción]
  Rust/Tokio  : [OK | ISSUE → descripción]
  Deuda       : [Ninguna | Baja | Media | Alta → qué se paga y cuándo]
  Reversible  : [Sí / No → implicaciones]
  APEX-Rules  : [Compliant | VIOLACIÓN → qué regla]
  2do Orden   : [efecto no obvio más crítico | Ninguno]
-->
```