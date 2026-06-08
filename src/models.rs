#![allow(dead_code)]
//! Estructuras tipadas que mapean el payload JSON enviado por
//! la WhatsApp Cloud API (Meta) al endpoint POST /webhook.
//!
//! Jerarquía del JSON:
//! ```json
//! {
//!   "object": "whatsapp_business_account",
//!   "entry": [{
//!     "id": "...",
//!     "changes": [{
//!       "value": {
//!         "messaging_product": "whatsapp",
//!         "contacts": [{ "profile": { "name": "..." }, "wa_id": "..." }],
//!         "messages": [{
//!           "from": "521234567890",
//!           "id": "wamid.xxx",
//!           "timestamp": "...",
//!           "type": "text",
//!           "text": { "body": "Hola!" }
//!         }]
//!       },
//!       "field": "messages"
//!     }]
//!   }]
//! }
//! ```

use serde::Deserialize;

// ── Raíz del payload ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct WebhookPayload {
    pub object: String,
    pub entry: Vec<Entry>,
}

// ── Entry → Changes ──────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct Entry {
    pub id: String,
    pub changes: Vec<Change>,
}

#[derive(Debug, Deserialize)]
pub struct Change {
    pub value: ChangeValue,
    pub field: String,
}

// ── ChangeValue: contiene contactos y mensajes ───────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ChangeValue {
    pub messaging_product: String,
    /// Lista de contactos asociados a los mensajes del lote.
    #[serde(default)]
    pub contacts: Vec<Contact>,
    /// Lista de mensajes entrantes. Puede estar ausente en notificaciones
    /// de estado (delivery receipts, read receipts, etc.).
    #[serde(default)]
    pub messages: Vec<Message>,
}

// ── Contacto ─────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct Contact {
    pub profile: Profile,
    /// WhatsApp ID del contacto (= número de teléfono en formato E.164 sin "+").
    pub wa_id: String,
}

#[derive(Debug, Deserialize)]
pub struct Profile {
    pub name: String,
}

// ── Mensaje ──────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct Message {
    /// Número de teléfono del remitente en formato E.164 sin "+".
    pub from: String,
    /// ID único del mensaje (wamid.xxx).
    pub id: String,
    pub timestamp: String,
    /// Tipo de mensaje: "text", "image", "audio", "video", "document", etc.
    #[serde(rename = "type")]
    pub msg_type: String,
    /// Presente solo cuando `msg_type == "text"`.
    pub text: Option<TextBody>,
}

#[derive(Debug, Deserialize)]
pub struct TextBody {
    pub body: String,
}
