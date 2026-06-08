# Bot IA Backend — Decisiones de Arquitectura (Sesión 2026-06-04)

tags: #rust #axum #whatsapp #meta-api #arquitectura #bot-ia #seguridad

---

## Contexto

Sesión de actualización de seguridad y refactorización del backend del bot conversacional sobre [[WhatsApp Cloud API]] de Meta. Stack: [[Rust]] + [[Axum]] + [[Tokio]].

---

## Decisiones de Diseño

### 1. Gestión Segura de Credenciales con `AppConfig`

**Decisión:** Eliminación completa de constantes hardcodeadas (`APP_SECRET`, `META_ACCESS_TOKEN`, `VERIFY_TOKEN`). Se implementó un struct `AppConfig` que carga estos valores obligatoriamente desde el entorno (`std::env::var`) en el arranque.

**Rationale:**
- Cumplimiento de la regla de **PROHIBICIÓN ABSOLUTA de hardcodear credenciales**.
- Fallo temprano y explícito (`unwrap_or_else` con `std::process::exit(1)`) si alguna variable crítica está ausente, evitando estados inválidos o arranques silenciosamente defectuosos.

**Trade-off aceptado:** En desarrollo local requiere el uso de un `.env` configurado correctamente. En producción, depende de inyección a través de [[Infisical]]/Vault.

---

### 2. Validación HMAC-SHA256 con Prevención de Timing Attacks

**Decisión:** Reemplazo de la validación estándar por una comparación en tiempo constante utilizando `subtle::ConstantTimeEq`.

**Código Clave:**
```rust
expected_bytes.as_slice().ct_eq(received_bytes.as_slice()).into()
```

**Rationale:**
- Evitar que un atacante pueda deducir la firma correcta mediante el análisis de los tiempos de respuesta del servidor frente a firmas parcialmente correctas.
- Uso del crate `subtle = "2"` para garantizar que la comparación no se cortocircuite ante el primer byte erróneo.

**Trade-off aceptado:** Ninguno, es una mejora estricta de seguridad alineada con el contrato operativo del agente.

---

### 3. Respuesta Inmediata del Webhook POST

**Decisión:** El handler `webhook_message_handler` ahora retorna HTTP 200 INMEDIATAMENTE después de validar la firma HMAC. El parseo del JSON del payload y el envío al canal del worker ocurren dentro de un bloque `tokio::spawn` 100% asíncrono.

**Rationale:**
- Cumplir estrictamente con la exigencia de Meta de responder HTTP 200 en **menos de 4 segundos**.
- Separar el ciclo de vida de la petición HTTP del procesamiento real del mensaje.

**Trade-off aceptado:** Si el parseo JSON falla o el canal `mpsc` está lleno/cerrado, Meta ya habrá recibido un 200 OK y no reintentará enviar el mensaje. Este comportamiento es el deseado por diseño en esta etapa (fire and forget hacia el webhook).

---

### 4. Eliminación de `unwrap()` y Actualización de Dependencias

**Decisión:**
- Eliminación de `.expect()` y `.unwrap()` en funciones como `HmacSha256::new_from_slice`.
- Actualización de `axum` a la versión `0.8` en el `Cargo.toml`.

**Rationale:**
- Las funciones que no pueden fallar criptográficamente ahora propagan su error de manera controlada o devuelven valores falsos tempranos.
- Alineación del framework con las reglas de dependencias base (`axum = "0.8"`).

---

## Estado de la Integración Meta API

| Componente | Estado | Notas |
|---|---|---|
| GET `/webhook` (verificación) | ✅ Implementado | Refactorizado para usar `AppConfig` |
| POST `/webhook` (recepción) | ✅ Implementado | HMAC en tiempo constante + retorno 200 asíncrono |
| Deserialización tipada | ✅ Implementado | Ocurre en background (tokio::spawn) |
| Egress HTTP a Meta | ✅ Implementado | Refactorizado para usar `AppConfig` dinámico |
| Secrets desde entorno | ✅ Implementado | Migración a `std::env::var` completada |
| Deduplicación por `wamid` | ✅ Implementado | SurrealDB (Remote Engine WS) en la capa síncrona |
| Persistencia de mensajes | ❌ Pendiente | Requiere [[SurrealDB]] |
| Orquestación durable | ❌ Pendiente | Requiere [[Temporal.io]] |

---

## Archivos Modificados

- `src/main.rs` — Configuración dinámica, validación en tiempo constante, handler POST asíncrono.
- `Cargo.toml` — Actualización de `axum = "0.8"` y adición de `subtle = "2"`.
