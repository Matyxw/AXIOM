---
description: "Orquestación secuencial de Planificación → Ejecución → Validación para tareas complejas multi-paso."
---

# WORKFLOW: /sandwich

> Orquesta una tarea compleja en tres fases secuenciales garantizando calidad de salida.

## Cuándo usar este workflow
Úsalo cuando una tarea requiera razonamiento profundo + ejecución de código + validación automática.
Ejemplo: "Implementa el MessageProcessingWorkflow de Temporal completo."

## Fase 1 — PLANIFICACIÓN (Blueprint)
1. Leer la documentación de la feature en Obsidian (`08-features/` o `02-dominio/`).
   Si no existe → aplicar Doctrina Obsidian-First (veto de código).
2. Generar `implementation_plan.md` con diagrama Mermaid del flujo de datos.
3. Guardar también en `.agents/artifacts/LAST_BLUEPRINT.md` para trazabilidad.
4. Esperar aprobación explícita del usuario antes de continuar.

## Fase 2 — EJECUCIÓN (Code)
1. Leer `LAST_BLUEPRINT.md`.
2. Implementar los cambios de forma modular (un módulo a la vez, nunca reescritura masiva).
3. Después de cada archivo modificado: validar mentalmente `cargo check` y anotar dependencias asumidas.

## Fase 3 — VALIDACIÓN (Clippy + Review)
1. Lanzar `cargo clippy --all-targets -- -D warnings` como background task.
2. Invocar internamente el workflow `/review-security` sobre los archivos modificados.
3. Reportar tabla de resultados: `[LIMPIO]` o `[FALLO → fix aplicado]`.