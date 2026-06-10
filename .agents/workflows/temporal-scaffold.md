# TEMPORAL SCAFFOLD — GENERADOR DE WORKFLOWS Y ACTIVITIES

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/temporal-scaffold [Nombre]`, debes detenerte y generar toda la estructura base de un Workflow de Temporal.io para el dominio indicado.

## 1. REGLAS DE GENERACIÓN
1. Generar un archivo en `src/temporal/workflows/[nombre_snake_case].rs`.
2. Generar un archivo en `src/temporal/activities/[nombre_snake_case].rs`.
3. Inyectar en el Workflow la macro `#[temporal_workflow]`.
4. El Workflow **NO DEBE** tener side-effects, llamadas I/O, `tokio::spawn`, ni generar `Uuid::new_v4()` (esto último rompe el determinismo). Todo eso debe ser delegado a las Activities o usar el SDK contextual de Temporal.
5. Inyectar en las Activities la macro `#[temporal_activity]`. Toda Activity debe incluir una `RetryPolicy` explícita.
6. Actualizar `src/temporal/mod.rs` exportando los nuevos módulos.

## 2. OUTPUT ESPERADO
Lista los archivos creados y pide al usuario confirmación sobre qué lógica de negocio exacta desea inyectar en las Activities vacías generadas.
