---
name: temporal-rust
description: >
  Directivas inquebrantables para la orquestación distribuida usando Temporal.io en Rust.
  Se activa al modificar la carpeta src/temporal/ o crear Workflows/Activities.
alwaysOn: false
---

# ⚙️ TEMPORAL.IO — DOCTRINA DETERMINISTA (SDK REAL)

## 0. Estado del SDK en Rust (Verdad Técnica)

El SDK oficial de Temporal para Rust es `temporal-sdk` (crate de `temporal-sdk-core`).
Está en desarrollo activo y **NO usa macros mágicas** como `#[temporal_workflow]`.
El patrón real es registrar Workflows y Activities como funciones asíncronas ordinarias.

**Cargo.toml — dependencias mínimas:**
```toml
temporal-sdk = "0.1"
temporal-client = "0.1"
temporal-sdk-core = { version = "0.1", features = ["tokio-runtime"] }
```

> Antes de añadir estas dependencias, ejecutar la skill `scan_dependencies`.

---

## 1. WORKFLOWS — REGLAS DE DETERMINISMO ABSOLUTO

Un Workflow en Temporal es una función que se puede suspender y reanudar. El runtime
reejecutará la función desde el inicio al recuperarla. Por esto, **cualquier
no-determinismo destruye el historial de eventos**.

**PROHIBICIÓN ABSOLUTA dentro de una función Workflow:**
- `tokio::time::Instant::now()` o `SystemTime::now()`
- `Uuid::new_v4()` o cualquier generación de aleatoriedad
- `reqwest`, `tokio::net`, o cualquier I/O de red directa
- `tokio::time::sleep()` — usar `wf_ctx.timer(Duration)` en su lugar
- Leer variables de entorno en tiempo de ejecución del Workflow

**Patrón canónico de Workflow:**
```rust
use temporal_sdk::{WfContext, WfExitValue, WorkflowResult};
use std::time::Duration;

// El input y output DEBEN derivar Serialize + Deserialize
#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct MessageWorkflowInput {
    pub wamid: String,
    pub phone_number: String,
    pub text: String,
    pub tenant_id: String,
}

pub async fn message_processing_workflow(
    ctx: WfContext,
    input: MessageWorkflowInput,
) -> WorkflowResult<()> {
    // ✅ CORRECTO: Schedule una Activity — ella hace el I/O real
    ctx.activity(ActivityOptions {
        activity_type: "process_message".to_string(),
        input: serde_json::to_vec(&input)?,
        retry_policy: Some(RetryPolicy {
            initial_interval: Some(Duration::from_secs(1)),
            backoff_coefficient: 2.0,
            maximum_interval: Some(Duration::from_secs(30)),
            maximum_attempts: 5,
            ..Default::default()
        }),
        ..Default::default()
    })
    .await?;

    Ok(WfExitValue::Normal(()))
}
```

---

## 2. ACTIVITIES — REGLAS DE IDEMPOTENCIA

Las Activities **SÍ pueden hacer I/O**. Son el único punto donde se toca
SurrealDB, la Graph API de Meta, Groq, etc.

**Regla de Idempotencia:** Temporal reintentará una Activity si falla o si el
worker se cae a mitad de ejecución. Por esto, cada Activity DEBE ser segura
de ejecutar múltiples veces sin duplicar efectos.

- Para SurrealDB: usar `CREATE ... ON DUPLICATE KEY` o verificar existencia antes de insertar.
- Para Meta API: registrar el `wamid` de respuesta antes de marcar como enviado.
- Para Groq API: guardar el resultado de la inferencia en DB antes de usarlo.

**Patrón canónico de Activity:**
```rust
use temporal_sdk::ActContext;

pub async fn process_message_activity(
    _ctx: ActContext,
    input: MessageWorkflowInput,
) -> anyhow::Result<()> {
    // ✅ AQUÍ sí se permite I/O de red, DB, etc.
    // ✅ Usar tokio::time::timeout en toda operación externa
    tokio::time::timeout(
        std::time::Duration::from_secs(10),
        save_to_surrealdb(&input),
    )
    .await??;

    Ok(())
}
```

---

## 3. REGISTRO EN EL WORKER

```rust
use temporal_sdk::{Worker, WorkerConfig, WorkerClient};
use temporal_client::WorkflowClientTrait;

pub async fn start_temporal_worker(
    client: Arc<WorkflowClient>,
) -> anyhow::Result<()> {
    let mut worker = Worker::new(
        WorkerConfig {
            task_queue: "axiom-main".to_string(),
            ..Default::default()
        },
        client,
    );

    // Registrar Workflows
    worker.register_wf("message_processing", message_processing_workflow);

    // Registrar Activities
    worker.register_activity("process_message", process_message_activity);

    worker.run().await?;
    Ok(())
}
```

---

## 4. ERRORES FATALES A DETECTAR

| Anti-patrón | Por qué mata el sistema |
|---|---|
| I/O dentro del Workflow | El historial de eventos diverge al re-ejecutar → crash del worker |
| Activity sin RetryPolicy | Un fallo de red transitorio pierde el mensaje para siempre |
| Activity no idempotente | Temporal reintenta → se envían 2 respuestas al cliente de WhatsApp |
| `tokio::spawn` como sustituto de Activity | No sobrevive a reinicios del servidor |
