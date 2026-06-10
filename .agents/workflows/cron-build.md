# CRON BUILD — COMPILACIÓN PROFUNDA ASÍNCRONA

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/cron-build`, tu tarea es aislar la compilación destructiva del hilo principal de conversación para que el usuario no pierda el tiempo mirando logs compilar.

## 1. MECANISMO DE EJECUCIÓN
1. Debes lanzar un comando de terminal masivo en background: `cargo clean && cargo build --release && cargo clippy --all-targets --all-features -- -D warnings`.
2. Debes setear `WaitMsBeforeAsync` a un tiempo corto (ej. 2000ms) para que pase inmediatamente al background.
3. Inmediatamente después de lanzar el comando, **detén tus operaciones (stop calling tools)**. El sistema Antigravity te revivirá (Reactive Wakeup) cuando el background task termine o falle. No hagas un loop infinito de status.
4. Cuando el sistema te reviva, haz un reporte ejecutivo de los warnings de memoria o deuda técnica encontrados.
