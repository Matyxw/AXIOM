---
trigger: always_on
description: Doctrina de planificaci\u00f3n visual y veto Obsidian-First. Aplica a todo plan de implementaci\u00f3n y nueva feature.
---

# DOCTRINA DE PLANIFICACI\u00d3N

## Veto Obsidian-First
ANTES de escribir, modificar o planificar código de una nueva feature:
1. Buscar la documentación de la feature en la bóveda Obsidian: `08-features/` o `02-dominio/`.
2. Si el archivo no existe o está vacío → **PROHIBIDO PROGRAMAR**. Abortar con mensaje exigiendo que el usuario lo redacte en Obsidian primero. No inferir lógica de negocio.

## Plans con Mermaid (obligatorio)
Todo `implementation_plan.md` DEBE incluir un diagrama `mermaid` mostrando flujo de datos, contenedores, integraciones con SurrealDB/TigerBeetle y motores async (Temporal.io).
- **Prohibido**: plan de implementación que sea solo texto plano o viñetas.

## Walkthroughs Visuales
Al presentar `walkthrough.md`, usar el formato `carousel` de Antigravity (cuatro backticks con `carousel`) para mostrar antes/después o evolución del estado.

## Sincronización con `/sync-obsidian`
Al ejecutar `/sync-obsidian`:
1. Extraer `git diff` y `git log` y cruzar con Roadmaps en `04-roadmap/`.
2. Si el código cubre feature no planificada → catalogar como "Desviación del Roadmap".
3. Marcar `[x]` solo aquello con correlato técnico demostrado en el código.
