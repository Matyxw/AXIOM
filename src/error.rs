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

    #[error("Internal Server Error")]
    InternalError,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::ConfigError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.to_string()),
            AppError::SurrealDbError(_) | AppError::InternalError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string())
            }
        };

        if status.is_server_error() {
            tracing::error!("AppError: {:?}", self);
        }

        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}
