# ADR-001: SurrealDB con Namespaces por Tenant (Multi-Tenancy Físico)

**Estado:** Activo  
**Fecha:** 2026-06  
**Contexto:** AXIOM es un SaaS B2B donde múltiples empresas (tenants) comparten la misma infraestructura.

## Decisión

Usar `use_ns(&tenant_id).use_db("apex")` antes de CUALQUIER operación en SurrealDB. Cada tenant opera en un Namespace propio, aislado físicamente por el motor de la base de datos.

## Por qué NO la alternativa obvia

La alternativa es filtrar por `tenant_id` en cada query con `WHERE tenant_id = $tid`. Este patrón tiene un defecto fatal: **requiere que nunca se olvide el filtro**. Un solo query sin el `WHERE` expone los datos de todos los tenants. En una base de código que crece con múltiples desarrolladores, es una bomba de tiempo.

## Por qué SÍ Namespaces

- El motor de base de datos impone el aislamiento. No es posible leer datos de otro tenant sin cambiar explícitamente el namespace.
- Una query mal escrita sin filtro retorna cero resultados en lugar de datos de otros tenants.
- El aislamiento funciona incluso si el código tiene un bug.

## Consecuencias

- Todo código de acceso a DB DEBE llamar `use_ns(&tenant_id).use_db("apex")` primero.
- El `tenant_id` debe estar disponible en el contexto de cada request (viene del header `x-axiom-tenant-id` inyectado por el proxy Zero Trust).
- **Penalización:** Una llamada extra de red por request. Aceptable dado que el cliente SurrealDB está en el mismo datacenter.

## Veto asociado en `.clinerules`

> SurrealDB sin `use_ns(&tenant_id).use_db("apex")` antes de operar → RECHAZO
