---
description: 
---

# Workflow: /sync-obsidian
title: Sincronización de Arquitectura hacia Obsidian
description: Extrae el conocimiento técnico de la sesión actual y lo persiste en la bóveda Zettelkasten externa.

## Directivas
1. Utiliza el servidor MCP `@obsidian-apex-docs`.
2. Analiza los cambios realizados en el código de Rust, los flujos de Temporal o SurrealDB durante esta sesión.
3. Escribe un archivo Markdown en la carpeta de Obsidian documentando:
   - Decisiones de diseño tomadas hoy.
   - Trade-offs aceptados.
   - Estado de la integración de la API de Meta.
4. Usa enlaces tipo Wiki `[[ ]]` para conectar conceptos clave (ej. `[[SurrealDB]]`, `[[Axum]]`).