name: apex-persistence
description: Se activa al interactuar con el almacenamiento del sistema (Consultas SurrealQL, mutaciones en RocksDB o transacciones contables en TigerBeetle).

# Directivas de Datos y Estado de Verdad
1. **SurrealDB (Modo Grafo):** Todo registro multi-tenant de clientes, barberías, usuarios e historial de chats de IA debe modelarse mediante relaciones de grafos nativas (`RELATE`). Usa transacciones ACID nativas cuando se alteren estados de configuración global.
2. **TigerBeetle Ledger:** Los balances de créditos de los tenants, el costo por mensaje procesado y las transacciones financieras inmutables NO se guardan en SurrealDB. Deben pasar por operaciones nativas de debito/crédito (`Account` y `Transfer`) de TigerBeetle con ids secuenciales y verificación de doble entrada a velocidad de microsegundos.