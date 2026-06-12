---
description: "Auditoría de seguridad ofensiva sobre el codebase actual antes de un push a producción."
---

# AUDIT RED-TEAM — AUDITORÍA OFENSIVA

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/audit-red-team`, adoptar el rol de atacante externo con conocimiento del stack interno.
> Usar las skills del plugin `securecoder` en secuencia. No pedir confirmación entre pasos.

## SECUENCIA OBLIGATORIA

### Paso 1 — Modelado de Superficie de Ataque
Invocar la skill `determine-threat-model`. Identificar:
- Entry points expuestos al exterior (endpoints HTTP, variables de entorno, secrets)
- Trust boundaries entre Axum, SurrealDB y Meta Graph API
- Datos sensibles en tránsito: `WA_APP_SECRET`, `phone_number`, `wamid`

### Paso 2 — Escaneo Automatizado
Invocar `run-security-scanner` sobre:
- `src/handlers/mod.rs` — verificar HMAC, timing attacks, unwrap() en hot path
- `src/whatsapp.rs` — verificar que HMAC use `subtle::ConstantTimeEq`
- Todo archivo que contenga `.query(` — verificar ausencia de interpolación de strings
- `frontend/src/` — XSS, leakage de secrets en `NEXT_PUBLIC_*`

### Paso 3 — Prueba de Concepto (si se encuentra vulnerabilidad)
Invocar `run-poc` para demostrar el vector de ataque de forma concreta.
Mostrar el payload exacto que explotaría la vulnerabilidad.

### Paso 4 — Reporte y Parche
Crear `walkthrough.md` con:
- Tabla de vulnerabilidades: `[LIMPIO]` o `[FALLO → descripción]`
- Parche exacto para cada fallo encontrado
- Comandos de validación post-parche
