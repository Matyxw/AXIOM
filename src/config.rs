use serde::Deserialize;
use crate::error::AppError;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub wa_app_secret: String,
    pub wa_access_token: String,
    pub wa_phone_id: String,
    pub wa_verify_token: String,
}

impl AppConfig {
    #[allow(clippy::result_large_err)]
    pub fn from_env() -> Result<Self, AppError> {
        let _ = dotenvy::dotenv();

        let settings = config::Config::builder()
            // El crate `config` lee del entorno y mapea case-insensitively
            // a los campos de la estructura. Ej: WA_APP_SECRET -> wa_app_secret.
            .add_source(config::Environment::default())
            .build()?;

        let app_config = settings.try_deserialize::<AppConfig>()?;
        Ok(app_config)
    }
}
