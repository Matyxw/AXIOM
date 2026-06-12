---
name: apex-persistence
description: >
  Se activa al interactuar con el almacenamiento del sistema (Consultas SurrealQL,
  mutaciones en SurrealDB, o transacciones contables en TigerBeetle).
  Aplica para cualquier archivo que toque `state.db` o la API de TigerBeetle.
alwaysOn: false
---

# 🗄️ APEX PERSISTENCE — DOCTRINA DE DATOS

## 1. SurrealDB — Grafo Multi-Tenant

### Multi-Tenancy: Namespace por Tenant
Antes de CUALQUIER operación en SurrealDB, posicionar el cliente en el namespace correcto:
```rust
// OBLIGATORIO al inicio de cada Activity o handler que toque DB
state.db.use_ns(&tenant_id).use_db("apex").await?;
```
Nunca operar en el namespace por defecto `apex/apex` para datos de tenant.

### Modelado: Relaciones de Grafo Nativas
```surrealql
-- CORRECTO: relación nativa de grafo
RELATE tenant:$tenant_id->received->message:$wamid
  SET timestamp = time::now(), processed = false;

-- PROHIBIDO: simular joins con múltiples SELECT
SELECT * FROM message WHERE tenant_id = $tenant_id; -- anti-patrón relacional
```

### Consultas: Parametrización Obligatoria
```rust
// CORRECTO
state.db
    .query("SELECT * FROM message WHERE id = $wamid AND processed = false")
    .bind(("wamid", &wamid))
    .await?;

// PROHIBIDO — inyección garantizada
let q = format!("SELECT * FROM message WHERE id = '{}'", wamid);
```

### Índices Obligatorios
Todo campo usado en cláusulas WHERE frecuentes necesita índice.
Campos que DEBEN tener `DEFINE INDEX`:
- `wamid` en tabla `messages` y `processed_wamids`
- `tenant_id` en toda tabla de dominio
- `phone_number` en tabla de contactos

### Deduplicación de Eventos
```surrealql
-- Inserción atómica con índice UNIQUE como barrera de idempotencia
DEFINE INDEX idx_wamid ON TABLE processed_wamids COLUMNS wamid UNIQUE;

-- En cada evento de Meta:
INSERT INTO processed_wamids (wamid) VALUES ($wamid);
-- Si el wamid ya existe, SurrealDB lanza error de unicidad → capturar y descartar el evento
```

---

## 2. TigerBeetle — Libro Mayor Financiero

### Separación Estricta de Responsabilidades
- **SurrealDB:** mensajes, contactos, conversaciones, configuración de tenants
- **TigerBeetle:** créditos de tenants, costo por mensaje, transferencias entre cuentas

**PROHIBICIÓN ABSOLUTA:** datos financieros (balances, debits, credits) en SurrealDB.

### Tipos de Cuentas del Sistema
```
AccountType::Tenant(tenant_id)    → balance de créditos del tenant
AccountType::Platform             → cuenta de la plataforma AXIOM
AccountType::Reserve              → reserva de créditos no liquidados
```

### Reglas de Transacciones
- IDs de `Transfer` deben ser únicos, secuenciales y deterministas (no `Uuid::new_v4()`)
- Todo débito de créditos por mensaje debe ser idempotente: mismo `wamid` → mismo `Transfer.id`
- Cero aritmética de punto flotante: todo en enteros (micro-unidades de moneda)