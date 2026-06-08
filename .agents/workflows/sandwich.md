---
description: 
---

# Workflow: /sandwich
title: Flujo Sándwich de Alto Rendimiento - APEX Stack
description: Orquestación multi-modelo automatizada en el espacio de trabajo.

## Steps
1. **Planificación (Gemini 3.1 Pro):** Analiza el requerimiento del usuario cruzándolo con el estado actual del sistema mapeado por el entorno Nix. Genera un mapa de arquitectura exhaustivo de cambios línea por línea y guárdalo en `.agents/artifacts/LAST_BLUEPRINT.md`.
2. **Ejecución Lógica (Claude Sonnet 4.6 Thinking):** Cambia automáticamente el entorno de chat a Claude con presupuesto máximo de razonamiento. Lee el archivo `.agents/artifacts/LAST_BLUEPRINT.md` y realiza las modificaciones de código requeridas de forma asíncrona y modular.
3. **Validación (Ghost Runtime):** Ejecuta un análisis estático de tipos en background mediante la terminal integrada (`cargo clippy`) para verificar que no haya regresiones de memoria.