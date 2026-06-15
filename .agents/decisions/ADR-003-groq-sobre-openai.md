# ADR-003: Groq API sobre OpenAI para Intent Classification

**Estado:** Activo  
**Fecha:** 2026-06  
**Contexto:** AXIOM necesita clasificar la intención de mensajes de WhatsApp en tiempo real (`SALES`, `SUPPORT`, `JUNK`) para enrutar automáticamente la respuesta.

## Decisión

Usar **Groq API** (LLaMA 3.1 70B o 8B) como motor de clasificación de intención. No usar OpenAI GPT-4o para esta tarea.

## Por qué NO OpenAI

- **Latencia**: GPT-4o promedía 800ms-2s por request de clasificación. En el contexto de WhatsApp, el usuario espera una respuesta en segundos. Superar los 3s percibe como "bot roto".
- **Costo**: Para clasificación de intención, un modelo grande de OpenAI es overkill. Se paga por capacidad que no se usa.

## Por qué SÍ Groq

- **Latencia**: Groq procesa LLaMA 3.1 8B a >800 tokens/segundo gracias a su hardware LPU dedicado. La clasificación de un mensaje de WhatsApp típico (<100 tokens) tarda <150ms.
- **Costo**: Significativamente más barato para volúmenes altos.
- **Suficiencia**: Para clasificar entre 3 intents (`SALES`, `SUPPORT`, `JUNK`), LLaMA 3.1 8B es más que suficiente.

## Consecuencias

- La variable de entorno `GROQ_API_KEY` es requerida en producción.
- Si Groq está caído, la Activity de Temporal reintenta automáticamente — el webhook no falla.
- Para tareas que requieran razonamiento más profundo (generación de respuestas complejas), evaluar Claude Haiku o GPT-4o-mini por request.

## Alternativa futura

Para respuestas generativas (no solo clasificación), evaluar un pipeline dual: Groq para clasificación rápida + modelo más potente para generación de respuesta solo cuando el intent es `SALES`.
