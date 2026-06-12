---
description: "Sincronizar cambios del repositorio local con la bóveda Zettelkasten de Obsidian (Proyecto AXIOM)."
---

# SYNC OBSIDIAN — PROTOCOLO OPERATIVO DEL AGENTE

> **INSTRUCCIÓN DE ALTA PRIORIDAD PARA EL AGENTE:** 
> Cuando el usuario ejecute `/sync-obsidian`, debes detenerte, auditar el estado del código y volcar el progreso exacto en su bóveda de Obsidian respetando estrictamente su arquitectura MOC (Map of Content). No inventes estructuras nuevas.

## 1. AUDITORÍA DEL CÓDIGO

1. Ejecuta `git log --oneline -10` para ver los últimos commits del sprint.
2. Ejecuta `git diff HEAD~1 HEAD --stat` para ver qué archivos cambiaron.
3. Identifica: módulos nuevos, librerías añadidas/eliminadas en `Cargo.toml` o `package.json`, bugs resueltos.
4. **Cruce de Roadmap:** Compara lo encontrado con los `[ ]` checkboxes en `04-roadmap/`. Si algo del código no está en el Roadmap, clasifícalo como **"Desviación"** y documéntalo explícitamente.

## 2. ACCESO A LA BÓVEDA EN WSL

El IDE corre en WSL. La bóveda de Obsidian está en Windows.
**Ruta absoluta nativa — SIEMPRE usar esta:**
`/mnt/d/1%/Sistema de Aprendizaje/2-Proyectos/AXIOM/`

Nunca usar rutas tipo `D:\...` o `C:\...`.

## 3. ACTUALIZACIÓN DE MOCs (MAPS OF CONTENT)

Modifica estos archivos en orden:

1. **`01-estado/Estado Actual.md`**: Actualiza "QUÉ FUNCIONA" con los módulos completados. Si hay deuda técnica nueva detectada en el código, añádela a la sección correspondiente.
2. **`04-roadmap/AXIOM — Roadmap General.md`**: Marca con `[✅]` la fase correspondiente. Añade fila en la tabla de Sesiones.
3. **`04-roadmap/AXIOM — Roadmap Backend.md`** y/o **`Frontend.md`**: Marca con `[x]` los ítems resueltos. Si se detectó una Desviación, añadir como ítem nuevo marcado con `[DESVIACIÓN]`.

## 4. CREACIÓN DE LA BITÁCORA DE SESIÓN

1. Crear archivo en: `06-sesiones/YYYY-MM-DD-[tema-corto].md`
2. Estructura obligatoria:
   ```markdown
   # [Título] — YYYY-MM-DD
   
   ## Commits del Sprint
   [lista de git log]
   
   ## Módulos Modificados
   [lista de archivos con su propósito]
   
   ## Decisiones Arquitectónicas
   [razonamiento técnico, estilo The Architect — sin texto decorativo]
   
   ## Deuda Técnica Detectada
   [cualquier TODO, unwrap(), o patrón frágil encontrado]
   
   ## Próximo Cuello de Botella
   [el único elemento que bloquea el avance real]
   ```
3. Tecnologías clave en doble corchete: `[[Axum]]`, `[[SurrealDB]]`, `[[Temporal.io]]`, `[[Next.js 16]]`, `[[Groq API]]`, `[[WhatsApp Cloud API]]`, `[[TigerBeetle]]`.

## 5. CONEXIÓN DE LA RED NEURONAL

No dejar la bitácora huérfana:
1. En `🤖 APEX — Contexto para IA.md`, sección "Sesiones": añadir `- [[YYYY-MM-DD-tema]] — descripción breve`.
2. En `04-roadmap/AXIOM — Roadmap General.md`, tabla "Sesiones": añadir fila.

## 6. FINALIZACIÓN

Lista exactamente los 4-6 archivos modificados en Obsidian.
Señala cualquier **Desviación del Roadmap** detectada.
Pregunta cuál es el siguiente cuello de botella. Sin saludos ni cierre decorativo.
