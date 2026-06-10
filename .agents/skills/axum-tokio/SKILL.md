---
name: axum-tokio
description: >
  Directivas de concurrencia y construcción de APIs en el ecosistema Rust (Axum + Tokio).
  Aplica para endpoints de red, middleware y estado compartido.
alwaysOn: false
---

# 🚀 AXUM & TOKIO — DOCTRINA DE CONCURRENCIA

## 1. Estado y Memoria
- **`Arc<AppState>` es Rey:** Todo estado global, pool de conexiones, o clientes HTTP deben ser embebidos dentro de una sola estructura compartida.
- **Mutabilidad Cero o RWLock:** Queda **ESTRICTAMENTE PROHIBIDO** el uso de `std::sync::Mutex` dentro de contextos asíncronos (`async fn`). Si necesitas mutabilidad global (caché), usa `tokio::sync::RwLock` o, preferiblemente, canales `mpsc` para transferir la propiedad.

## 2. Bloqueo de Hilos (Runtime Starvation)
- **Nunca Bloquees el Executor:** Usar `std::thread::sleep`, leer archivos de disco sincrónicamente (`std::fs`), o hacer cálculos pesados de CPU directos congelará todo Axum. Usa `tokio::task::spawn_blocking` para CPU pesado, o `tokio::fs`/`tokio::time::sleep`.

## 3. Respuestas y Manejo de Errores
- Toda ruta de Axum debe devolver `Result<impl IntoResponse, AppError>`.
- `AppError` debe implementar `IntoResponse` traduciendo errores internos (ej. `surrealdb::Error`) en respuestas HTTP seguras (ej. `500 Internal Server Error` sin filtrar stacktraces al cliente web).
