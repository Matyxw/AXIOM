---
description: "Sincronizar cambios del repositorio local con la bóveda Zettelkasten de Obsidian (Proyecto AXIOM)."
---

# SYNC OBSIDIAN — PROTOCOLO OPERATIVO DEL AGENTE

> **INSTRUCCIÓN DE ALTA PRIORIDAD PARA EL AGENTE:** 
> Cuando el usuario ejecute `/sync-obsidian`, debes detenerte, auditar el estado del código y volcar el progreso exacto en su bóveda de Obsidian respetando estrictamente su arquitectura MOC (Map of Content). No inventes estructuras nuevas.

## 1. AUDITORÍA DEL CÓDIGO (VERDE Y AMARILLO)
1. Ejecuta `git status` y `git diff HEAD`.
2. Identifica todos los archivos modificados, untracked o refactorizados durante el sprint actual.
3. Extrae las decisiones arquitectónicas clave, librerías añadidas/quitadas y bugs resueltos.

## 2. ACCESO A LA BÓVEDA EN WSL
El entorno del IDE está en WSL. **Nunca intentes escribir en rutas tipo `D:\...`**.
Usa SIEMPRE esta ruta absoluta nativa de Linux para acceder a la bóveda:
`/mnt/d/1%/Sistema de Aprendizaje/2-Proyectos/AXIOM/`

## 3. ACTUALIZACIÓN DE MOCs (MAPS OF CONTENT)
Modifica los siguientes archivos base reemplazando su contenido de forma asíncrona:
- **`01-estado/Estado Actual.md`**: Mueve elementos de "QUÉ ESTÁ ROTO" a "QUÉ FUNCIONA". Actualiza el "OBJETIVO DE LA PRÓXIMA SESIÓN".
- **`04-roadmap/AXIOM — Roadmap General.md`**: Marca con `[✅]` la fase del proyecto correspondiente.
- **`04-roadmap/AXIOM — Roadmap Backend.md` / `Frontend.md`**: Tacha con `[x]` las casillas de la deuda técnica o los features que el `git diff` indique como resueltos.

## 4. CREACIÓN DE LA BITÁCORA DE SESIÓN
1. Crea un nuevo archivo en: `06-sesiones/YYYY-MM-DD-sincronizacion-[tema].md`.
2. Resume el `git status` clasificando en Modificados y Untracked.
3. Escribe las decisiones arquitectónicas tomadas de forma concisa y agresiva (estilo The Architect).
4. **REGLA SUPREMA:** Todos los nombres de tecnologías clave deben estar envueltos en corchetes dobles de Obsidian (ej: `[[Axum]]`, `[[SurrealDB]]`, `[[Tailwind 4]]`, `[[Temporal.io]]`, `[[Next.js 16]]`, `[[Groq API]]`, `[[WhatsApp Cloud API]]`).

## 5. CONEXIÓN DE LA RED NEURONAL (CIERRE DE CIRCUITO)
No puedes dejar la bitácora "huérfana". Debes enlazarla:
1. Abre `🤖 APEX — Contexto para IA.md` y en la sección "Entorno y Estado" agrega: `- [[YYYY-MM-DD-sincronizacion-tema]] — Breve descripción`.
2. Abre `04-roadmap/AXIOM — Roadmap General.md` y en la tabla "Sesiones" agrega la fila correspondiente.

## 6. FINALIZACIÓN
Informa al usuario que la bóveda ha sido sincronizada y lista los 4-5 archivos exactos de Obsidian que modificaste. No ofrezcas disculpas ni saludos genéricos. Exige conocer el siguiente cuello de botella para empezar a programar.
