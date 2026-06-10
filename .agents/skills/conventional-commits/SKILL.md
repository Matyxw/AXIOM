---
name: conventional-commits
description: >
  Fuerza el formateo estructurado para todos los commits del proyecto.
  Aplica cada vez que el Agente deba proponer o ejecutar un `git commit`.
alwaysOn: true
---

# 📜 SEMANTIC GIT — DOCTRINA DE COMMITS

## 1. Formato Strict
Todo mensaje de commit sugerido o ejecutado por el Agente DEBE seguir el estándar Conventional Commits:
`<tipo>[scope opcional]: <descripción imperativa corta>`

**Tipos Permitidos:**
- `feat:` Una nueva característica o flujo de negocio.
- `fix:` Resolución de un bug comprobado.
- `chore:` Mantenimiento, actualizaciones de `.agents`, modificaciones a Nix o Devcontainers.
- `refactor:` Reescritura de código que ni arregla bug ni suma feature, pero mejora DDD o arquitectura.
- `perf:` Código que mejora el rendimiento de CPU/Memoria.
- `docs:` Cambios que solo tocan Obsidian, MOCs o comentarios.

## 2. Reglas de Cuerpo
- La descripción (`<descripción imperativa corta>`) debe estar en tiempo presente imperativo, en minúscula y SIN punto final.
  **CORRECTO:** `feat(webhook): integrar validación hmac-sha256`
  **INCORRECTO:** `Feat: Integrado la validación HMAC-SHA256.`
- Si el commit cambia una base de datos o arquitectura core, agregar un BREAKING CHANGE en el cuerpo del commit.
