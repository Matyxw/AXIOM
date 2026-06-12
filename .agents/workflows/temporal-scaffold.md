---
description: "Genera la estructura base de un Workflow y Activity de Temporal.io para un dominio específico."
---

# TEMPORAL SCAFFOLD — GENERADOR DE WORKFLOWS Y ACTIVITIES

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/temporal-scaffold [Nombre]`, generar la estructura real del SDK de Temporal.io en Rust. **PROHIBIDO usar macros ficticias** (`#[temporal_workflow]` no existe en el SDK).

## 1. REGLAS DE GENERACIÓN

1. Leer primero la skill `temporal-rust` para recordar los patrones del SDK real.
2. Crear `src/temporal/workflows/[nombre_snake_case].rs` con el patrón de `WfContext`.
3. Crear `src/temporal/activities/[nombre_snake_case].rs` con `ActContext` y `RetryPolicy` explícita.
4. Actualizar `src/temporal/mod.rs` exportando los módulos nuevos.
5. El input y output del Workflow **DEBEN** derivar `serde::Serialize` y `serde::Deserialize`.

## 2. TEMPLATE DE WORKFLOW (copiar y adaptar)

```rust
use temporal_sdk::{WfContext, WfExitValue, WorkflowResult};

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct [Nombre]WorkflowInput {
    pub tenant_id: String,
    // campos específicos del dominio
}

pub async fn [nombre]_workflow(
    ctx: WfContext,
    input: [Nombre]WorkflowInput,
) -> WorkflowResult<()> {
    ctx.activity(temporal_sdk::ActivityOptions {
        activity_type: "[nombre]_activity".to_string(),
        input: serde_json::to_vec(&input).unwrap_or_default(),
        retry_policy: Some(temporal_sdk::RetryPolicy {
            initial_interval: Some(std::time::Duration::from_secs(1)),
            backoff_coefficient: 2.0,
            maximum_attempts: 5,
            ..Default::default()
        }),
        ..Default::default()
    })
    .await?;

    Ok(WfExitValue::Normal(()))
}
```

## 3. OUTPUT ESPERADO

Listar los archivos creados. Preguntar al usuario qué lógica de negocio concreta va dentro de la Activity (llamadas a Groq, SurrealDB, WhatsApp) antes de escribir su cuerpo.
