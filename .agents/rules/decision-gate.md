---
trigger: always_on
---

---
trigger: always_on
description: >
  Protocolo pre-decisión de evaluación multi-lente. Se ejecuta mentalmente
  ANTES de cada acción, cambio de código, recomendación de dependencia,
  modificación de esquema, o propuesta arquitectónica — sin excepción.
  Toda decisión es tratada como la más crítica del negocio en ese momento.
---

# APEX DECISION GATE v1.0
## Protocolo de Evaluación Pre-Acción

---

## AXIOMA CENTRAL

**El sistema no falla por decisiones grandes mal tomadas. Falla por decisiones pequeñas ignoradas que se componen.**

Un campo sin índice en SurrealDB es insignificante para 10 tenants.
Es el bottleneck que revienta producción a 500 tenants.
Un `.clone()` innecesario en el hot path del webhook es invisible en dev.
Es la fuente de latencia que hace que Meta empiece a reintentar.
Una dependencia añadida sin revisar es un cambio de dos líneas en Cargo.toml.
Es la supply chain attack que compromete todos los números de WhatsApp de los clientes.

El costo de evaluar bien: milisegundos de razonamiento.
El costo de evaluar mal: semanas de debugging, datos comprometidos, o el negocio entero.

---

## PASO 0 — CLASIFICACIÓN DE IMPACTO INMEDIATO

Antes de generar cualquier respuesta técnica, clasificar la decisión:

| Tier | Criterio de activación | Profundidad |
|------|------------------------|-------------|
| **T1 · CRÍTICA** | Seguridad, credenciales, HMAC/WhatsApp, aislamiento multi-tenant, schema de BD, deployment, Temporal Workflows | Todos los lentes. Bloque GATE obligatorio en respuesta. |
| **T2 · ARQUITECTÓNICA** | Nuevas dependencias, nuevos módulos, cambios a `AppState`, patrones de concurrencia, refactors que cruzan límites de módulo | Lentes técnicos + estratégicos. Bloque GATE recomendado. |
| **T3 · TÁCTICA** | Naming local, helpers internos, tests, documentación, ajustes de formato | Checklist mental implícito. Sin bloque GATE visible. |

**Regla de escalada:** Duda → escalar al tier superior. Siempre.

---

## LOS SEIS LENTES

### LENTE 1 — SEGURIDAD Y SUPERFICIE DE ATAQUE

*¿Esta decisión crea una vulnerabilidad, filtra datos, o rompe un contrato con Meta o tenants?*

Preguntas obligatorias antes de proceder:
- ¿Hay credenciales, tokens, secrets o API keys involucrados? Si sí: ¿están en `std::env::var`?
- ¿Este path puede ser controlado por un atacante externo (payload de Meta, query params)?
- ¿Esta decisión afecta la verificación HMAC-SHA256 del webhook? ¿Sigue usando `subtle::ConstantTimeEq`?
- ¿Qué ocurre si este código se ejecuta en el contexto del tenant equivocado? ¿El aislamiento por namespace de SurrealDB sigue intacto?
- ¿Se está logueando algo que puede filtrar datos sensibles (números de teléfono, wamids, contenido de mensajes)?
- ¿Esta decisión puede permitir que un evento duplicado de Meta procese dos veces? ¿La deduplicación por `wamid` sigue siendo la barrera correcta?

**Veto automático:** Si la respuesta a cualquiera de estas preguntas es "sí" sin una mitigación concreta, el cambio no procede.

---

### LENTE 2 — CORRECTITUD RUST Y MODELO DE CONCURRENCIA

*¿Cargo check pasaría? ¿Esto es correcto bajo el modelo de ownership y el runtime de Tokio?*

Verificación mental obligatoria:
- `unwrap()` o `expect()` en código de producción → **ERROR. Reescribir con `?` o manejo explícito.**
- Operación bloqueante (`std::thread::sleep`, `std::fs` síncrono, mutex bloqueante) dentro de `async fn` → **ERROR. Usar alternativas de Tokio.**
- `Arc::clone()` vs `.clone()` sobre `Arc<T>`: ¿se está clonando el puntero o el valor interno?
- `tokio::spawn`: ¿el `JoinHandle` se conserva o se descarta? Si se descarta, ¿es intencional y documentado?
- En el handler del webhook: ¿la respuesta `StatusCode::OK` se emite ANTES del `tokio::spawn`? Si está después, Meta esperará.
- ¿Los tipos que cruzan el boundary del spawn implementan `Send + 'static`?
- ¿Hay algún `Arc<Mutex<T>>` que debería ser `Arc<RwLock<T>>`? (datos read-heavy como `tenant_cache`)

---

### LENTE 3 — DEUDA ARQUITECTÓNICA Y REVERSIBILIDAD

*¿Esta decisión es una puerta de un sentido? ¿Qué deuda estoy creando?*

Preguntas obligatorias:
- ¿Existe una solución más simple que resuelve exactamente el mismo problema?
- ¿Esta abstracción es esencial al dominio o es complejidad accidental que yo estoy introduciendo?
- ¿Cómo se ve esta decisión con 100x la carga actual? ¿Con 1000 tenants? ¿Con 500,000 mensajes/día?
- ¿Es reversible? Las decisiones de una vía (cambios de schema, contratos de API pública, estructuras de Temporal Workflow) requieren análisis completo antes de ejecutar.
- ¿Estoy creando un acoplamiento entre módulos que no debería existir? (`handlers` no debería saber nada sobre `temporal`, solo sobre `AppState`.)
- ¿Dentro de 6 meses, un nuevo ingeniero puede entender esto sin preguntar?

---

### LENTE 4 — COMPLIANCE CON APEX-RULES

*¿Esto viola alguna ley del contrato operativo?*

Checklist binario — cada ítem es OK o VIOLACIÓN:

**Rust/Axum:**
- [ ] Manejo de errores con `thiserror` en dominio, `anyhow` solo en `main.rs`
- [ ] Toda operación I/O externa tiene `tokio::time::timeout` configurado
- [ ] Handlers retornan `Result<impl IntoResponse, AppError>` o `StatusCode` directo
- [ ] Estado compartido via `State<Arc<AppState>>`, sin `static mut`

**SurrealDB:**
- [ ] Todas las consultas están parametrizadas con `.bind()` — interpolación de strings prohibida
- [ ] Relaciones modeladas con `RELATE`, no con JOINs relacionales simulados
- [ ] Campos de búsqueda frecuente tienen `DEFINE INDEX` definido
- [ ] Multi-tenancy respeta `NAMESPACE {tenant_id} DATABASE apex`

**WhatsApp/Meta:**
- [ ] Firma HMAC verificada con `subtle::ConstantTimeEq` antes de cualquier procesamiento
- [ ] HTTP 200 retornado en < 4 segundos (patrón respond-then-process con `tokio::spawn`)
- [ ] `wamid` verificado contra duplicados ANTES de procesar efectos de red
- [ ] Zero Baileys, whatsapp-web.js, o emulación de sesión

**Temporal:**
- [ ] Lógica de larga duración, reintentos críticos, y procesos que deben sobrevivir reinicios → Temporal Workflow
- [ ] Workflows son deterministas: cero llamadas a APIs externas, UUIDs o `SystemTime` dentro del Workflow
- [ ] Toda I/O externa delegada a Activities con `RetryPolicy` explícito

**Nix:**
- [ ] Toda herramienta nueva declarada en `flake.nix`, nunca `apt install` o `cargo install` global
- [ ] Dependencia nueva verificada antes de añadir a `Cargo.toml`

---

### LENTE 5 — EFECTOS DE SEGUNDO Y TERCER ORDEN

*¿Qué cascadas genera esta decisión que no son visibles ahora mismo?*

Preguntas obligatorias:
- Si esto falla en producción, ¿cómo falla? ¿Silenciosamente (peor escenario) o ruidosamente con error capturado?
- ¿Qué otros componentes del sistema tienen acoplamiento implícito con esto?
- ¿Cómo interactúa esta decisión con los reintentos de Meta? Si Meta reintenta el mismo evento 3 veces, ¿el sistema sigue siendo idempotente?
- ¿Esta decisión afecta la capacidad de Temporal de recuperar el estado después de un crash del servidor?
- ¿Qué pasa con los tenants que ya están en producción si este cambio se despliega sin migración?
- ¿Hay un race condition posible si dos workers procesan el mismo payload simultáneamente?

---

### LENTE 6 — EL PRINCIPIO DE MÍNIMA EXISTENCIA

*El mejor código es el que no existe. La mejor abstracción es la que no fue necesaria crear.*

Antes de escribir una sola línea:
- ¿Ya existe esto en el stack? (Axum extractors, SurrealDB features, Tokio primitives)
- ¿Estoy resolviendo el problema real o el problema que asumí que existe?
- ¿Podría resolver esto con menos código sin sacrificar correctitud o seguridad?
- ¿Estoy añadiendo complejidad porque la necesito o porque es la primera solución que surgió?

---

## PROTOCOLO DE OUTPUT — BLOQUE GATE

Para decisiones T1 y T2, incluir este bloque al inicio o final de la respuesta:

```
<!-- DECISION GATE
  Tier         : [T1 · Crítica / T2 · Arquitectónica / T3 · Táctica]
  Seguridad    : [OK | RIESGO → descripción concreta]
  Rust/Tokio   : [OK | ISSUE → descripción concreta]
  Deuda        : [Ninguna | Baja | Media | Alta → qué se acumula y cuándo se paga]
  Reversible   : [Sí / No → implicaciones]
  Alternativa  : [Evaluada y descartada por X razón | Adoptada en su lugar]
  APEX-Rules   : [Compliant | VIOLACIÓN → qué regla y cómo se corrige]
  2do Orden    : [descripción del efecto no obvio más crítico | Ninguno identificado]
-->
```

Para T3, el razonamiento debe estar presente implícitamente aunque el bloque no aparezca.

---

## VETO AUTOMÁTICO — CONDICIONES DE RECHAZO ABSOLUTO

Estas condiciones anulan cualquier argumento de eficiencia, urgencia, conveniencia o deadline:

| Condición | Acción |
|-----------|--------|
| Credencial hardcodeada en cualquier forma | RECHAZO TOTAL. Proponer alternativa con `std::env::var`. |
| `unwrap()` sin `// SAFETY:` justificado en producción | RECHAZO. Proponer manejo correcto. |
| HMAC bypass o comparación no en tiempo constante | RECHAZO. La seguridad del número WhatsApp no se negocia. |
| Consulta SurrealDB con interpolación de strings | RECHAZO. Inyección garantizada. |
| Blocking I/O en async hot path del webhook | RECHAZO. Rompe el SLA de 4s de Meta. |
| Estado mutable compartido sin sincronización apropiada | RECHAZO. Race condition garantizado bajo carga. |
| Nueva dependencia sin revisión de supply chain | BLOQUEO hasta verificación. |
| `tokio::spawn` con JoinHandle descartado sin justificación | FLAG para revisión. |

---

## META-PREGUNTA FINAL

Antes de confirmar cualquier decisión:

> **"Si este cambio llega a producción con 500 tenants activos y 50,000 mensajes diarios,
> y algo sale mal a las 3AM, ¿puedo explicar exactamente por qué tomé esta decisión,
> qué alternativas evalué, y por qué era la correcta con la información disponible?"**

Si la respuesta es "no sé" o requiere más de 30 segundos para articularse claramente → el cambio no procede hasta que la respuesta sea inmediata y precisa.

---

*APEX Decision Gate v1.0 — Toda desviación sin justificación documentada es un bug del agente.*