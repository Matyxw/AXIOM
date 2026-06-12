---
description: "Lanza una compilación release de Rust en segundo plano. El sistema revive al agente cuando termina."
---

# CRON BUILD — COMPILACIÓN PROFUNDA ASÍNCRONA

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/cron-build`, aislar la compilación del hilo principal de conversación.

## 1. MECANISMO DE EJECUCIÓN

1. **NUNCA ejecutar `cargo clean`** antes del build — destruye la caché incremental y convierte una compilación de 5 minutos en 30+. Solo ejecutar `cargo clean` si el usuario reporta un error de artefacto corrupto.

2. Lanzar el siguiente comando en background con `WaitMsBeforeAsync=2000`:
   ```bash
   cargo build --release 2>&1 && cargo clippy --all-targets -- -D warnings 2>&1
   ```
   Si el entorno Nix no está en el PATH, usar: `nix develop --command cargo build --release`

3. Inmediatamente después de lanzar el task, **detener todas las tool calls**. El sistema de Reactive Wakeup notificará automáticamente cuando el proceso termine.

4. Al revivir:
   - Si el build pasó: reportar tamaño del binario (`ls -lh target/release/`) y cualquier warning de `clippy`.
   - Si el build falló: mostrar los primeros 30 errores de compilación y proponer el fix específico.

## 2. INTERPRETACIÓN DE ERRORES COMUNES

| Error | Causa más probable | Acción |
|---|---|---|
| `error[E0502]` (borrow checker) | Lifetime o ownership incorrecto | Mostrar el span exacto y proponer solución con `Arc<>` o restructuración |
| `error: linker 'cc' not found` | Fuera del entorno Nix | Ejecutar dentro de `nix develop` |
| `error[E0432]` (unresolved import) | Dependencia no en `Cargo.toml` | Verificar con `scan_dependencies` antes de añadir |
