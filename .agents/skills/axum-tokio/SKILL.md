---
name: axum-tokio
description: >
  Directivas de concurrencia y construcción de APIs en el ecosistema Rust (Axum + Tokio).
  Aplica para endpoints de red, middleware y estado compartido.
alwaysOn: false
---

# 🚀 AXUM 0.8 + TOKIO 1 — DOCTRINA DE CONCURRENCIA

## 1. Estado Compartido — Un Solo Patrón

**`Arc<AppState>` es la única forma de compartir estado entre handlers.**

```rust
// CORRECTO
#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Surreal<Client>>,
    pub config: Arc<AppConfig>,
    pub http_client: reqwest::Client, // reqwest::Client es Clone internamente
}

// En el router:
let state = Arc::new(AppState { ... });
let app = Router::new()
    .route("/webhook", post(handler))
    .with_state(Arc::clone(&state));
```

**PROHIBIDO:**
- `static mut` — race condition garantizada
- `lazy_static!` con Mutex para estado mutable — usar `tokio::sync::RwLock`
- `Arc<Mutex<T>>` para datos leídos frecuentemente — usar `Arc<RwLock<T>>`

---

## 2. Manejo de Errores en Handlers — Sin Unwrap

Todo handler de Axum que pueda fallar retorna `Result<impl IntoResponse, AppError>`.
`AppError` DEBE implementar `IntoResponse` para traducir errores internos en HTTP.

```rust
// error.rs — patrón obligatorio
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("base de datos: {0}")]
    Database(#[from] surrealdb::Error),

    #[error("configuración: {0}")]
    Config(&'static str),

    #[error("no autorizado")]
    Unauthorized,
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, msg) = match self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "no autorizado"),
            AppError::Config(e) => (StatusCode::INTERNAL_SERVER_ERROR, e),
            AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "error de base de datos"),
        };
        (status, msg).into_response()
    }
}
```

---

## 3. Bloqueo del Runtime — Crimen Capital

El runtime de Tokio usa un thread pool cooperativo. Un `std::thread::sleep` o un
cálculo de CPU pesado en un `async fn` bloquea el thread entero y congela **todos**
los otros requests concurrentes en ese thread.

| Operación bloqueante | Alternativa correcta |
|---|---|
| `std::thread::sleep(d)` | `tokio::time::sleep(d).await` |
| `std::fs::read_to_string(p)` | `tokio::fs::read_to_string(p).await?` |
| CPU pesado (parsing, crypto masivo) | `tokio::task::spawn_blocking(|| { ... }).await?` |
| `std::sync::Mutex::lock()` en async | `tokio::sync::Mutex` o reestructurar sin lock |

---

## 4. Timeouts Obligatorios en I/O Externa

**Toda llamada a una API externa o base de datos debe tener timeout explícito.**
Sin timeout, un servicio externo lento puede colgar el handler indefinidamente.

```rust
// OBLIGATORIO en todo I/O externo
use tokio::time::{timeout, Duration};

let result = timeout(
    Duration::from_secs(5),
    db.query("SELECT * FROM tenant WHERE id = $id").bind(("id", &tenant_id)),
)
.await
.map_err(|_| AppError::Config("timeout en consulta SurrealDB"))??;
```

---

## 5. Extractores de Axum — Orden Importa

En Axum 0.8, el orden de los extractores en la firma del handler importa.
`State` debe ir primero, luego los extractores que consumen el body (`Json`, `Bytes`),
ya que solo uno puede leer el body.

```rust
// CORRECTO — State primero, Body-consuming al final
async fn handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,              // no consume body
    body: Bytes,                     // consume body — siempre al final
) -> StatusCode { ... }

// INCORRECTO — compilará pero el orden convencional se rompe
async fn handler(
    body: Bytes,
    State(state): State<Arc<AppState>>,
) -> StatusCode { ... }
```
