# ADR-002: Temporal.io sobre tokio::spawn para Flujos de Negocio

**Estado:** Activo (SDK pendiente de integración completa)  
**Fecha:** 2026-06  
**Contexto:** El backend recibe mensajes de WhatsApp y necesita procesarlos de forma asíncrona (clasificación LLM + respuesta + logging).

## Decisión

Toda lógica de procesamiento durable va en un **Temporal Workflow** con Activities. Prohibido usar `tokio::spawn` como mecanismo de durabilidad para flujos de negocio.

## Por qué NO tokio::spawn

`tokio::spawn` tiene un defecto arquitectónico crítico en contexto B2B: **si el proceso muere mientras procesa, el evento se pierde**. Para un bot de ventas, perder un mensaje de un lead calificado es pérdida directa de dinero. El problema se agrava porque:

1. Meta reintenta el webhook si no recibe 200 OK en 4s — pero si el servidor cayó después de confirmar el 200 y antes de procesar, el evento no vuelve.
2. No hay retries automáticos ante fallos de la API de Groq o de Meta Graph API.
3. No hay visibilidad del estado del procesamiento.

## Por qué SÍ Temporal

- **Durabilidad**: El estado del workflow sobrevive reinicios del servidor.
- **Retries automáticos**: Cada Activity tiene `RetryPolicy` configurable. Un timeout de Groq API no pierde el lead.
- **Idempotencia**: La deduplicación por `wamid` en la primera Activity garantiza que Meta pueda reintentar el webhook sin procesar dos veces.
- **Visibilidad**: El Temporal UI muestra el estado de cada workflow en tiempo real.

## Consecuencias

- Los Workflows DEBEN ser deterministas: sin `SystemTime::now()`, sin `Uuid::new_v4()`, sin I/O directa.
- Toda I/O externa (SurrealDB, Groq, Meta API) va en Activities con `RetryPolicy`.
- El SDK de Rust de Temporal está en alpha — integración completa pendiente cuando haya release estable.

## Veto asociado en `.clinerules`

> `tokio::interval` / cron ad-hoc como sustitutos de Temporal → PROHIBIDO
