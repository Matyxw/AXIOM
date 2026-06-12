use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Error de configuración: {0}")]
    ConfigError(#[from] config::ConfigError),

    #[error("Error de SurrealDB: {0}")]
    SurrealDbError(#[from] surrealdb::Error),

    #[error("no autorizado")]
    Unauthorized,

    #[error("recurso no encontrado")]
    NotFound,

    #[error("error de WhatsApp API: {0}")]
    WhatsApp(String),

    #[error("Internal Server Error")]
    InternalError,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::ConfigError(_) | AppError::InternalError => {
                // Nunca exponer detalles internos al cliente
                (StatusCode::INTERNAL_SERVER_ERROR, "error interno del servidor".to_string())
            }
            AppError::SurrealDbError(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "error de base de datos".to_string())
            }
            AppError::Unauthorized => {
                (StatusCode::UNAUTHORIZED, "no autorizado".to_string())
            }
            AppError::NotFound => {
                (StatusCode::NOT_FOUND, "recurso no encontrado".to_string())
            }
            AppError::WhatsApp(msg) => {
                (StatusCode::BAD_GATEWAY, msg.clone())
            }
        };

        // Solo loguear errores 5xx — los 4xx son esperados y no deben llenar los logs
        if status.is_server_error() {
            tracing::error!(error = ?self, "AppError 5xx");
        }

        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}
