---
name: temporal-rust
description: >
  Directivas inquebrantables para la orquestación distribuida usando Temporal.io en Rust.
  Se activa al modificar la carpeta src/temporal/ o crear Workflows/Activities.
alwaysOn: false
---

# ⚙️ TEMPORAL.IO — DOCTRINA DETERMINISTA

## 1. Workflows (El Cerebro)
- **DETERMINISMO ABSOLUTO:** Los Workflows tienen estrictamente prohibido realizar operaciones de I/O de red, acceder a disco, leer el reloj del sistema (ej. `SystemTime::now()`), o generar números aleatorios (ej. `Uuid::new_v4()`).
- **Pánico vs Fallo:** Si hay un error no recuperable en un Workflow (rompimiento de invariante), se debe lanzar un Pánico explícito para que el worker muera y se reinicie. Si es un error de negocio, se retorna un `WfError`.
- **Efectos Secundarios:** Toda mutación de base de datos (SurrealDB, TigerBeetle) o llamadas a APIs (Groq, Meta) **DEBEN** ser enviadas a una Activity.

## 2. Activities (Los Brazos)
- **Retry Policy Obligatoria:** Ninguna Activity puede ser declarada sin una política de reintentos explícita.
- **Idempotencia:** Dado que Temporal reintentará las Activities ante caídas de red, toda Activity DEBE ser diseñada para ser idempotente (ej. usar `wamid` como clave primaria o Upsert).

## 3. Macros y Tipado
- Usar `#[temporal_workflow]` y `#[temporal_activity]` en lugar de intentar implementar los traits a mano.
- Los inputs y outputs deben derivar `Serialize, Deserialize` y ser preferiblemente estructuras planas para no saturar el historial de eventos de Temporal.
