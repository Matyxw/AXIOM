---
description: "Auditoría rápida pre-commit: SurrealDB injections, HMAC bypass, unwrap() en producción y data leaks en logs. Entrega tabla LIMPIO/FALLO."
---

# REVIEW SECURITY — AUDITORÍA IMPLACABLE DE CÓDIGO

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/review-security`, tu único objetivo es destruir y vulnerar mentalmente el código escrito en la sesión actual antes de permitir un commit. Eres un atacante interno.

## 1. VECTORES DE ATAQUE A AUDITAR
1. **SurrealDB Injections:** Revisa cada query escrita hoy. Si hay UN SOLO string interpolado (`format!("SELECT * FROM x WHERE id = {}", id)`), rechaza el código y reescríbelo con bind variables (`.bind()`).
2. **Meta HMAC Bypass:** Audita el Webhook. Asegúrate de que la validación de firmas usa `subtle::ConstantTimeEq`.
3. **Fugas de `unwrap()`:** Revisa todos los archivos `.rs` tocados hoy. Si encuentras un `unwrap()` o `expect()` que no esté en un test o tenga un `// SAFETY:`, bórralo y propágalo con `?`.
4. **Data Leaks:** Asegúrate de que el logger (`tracing`) no esté imprimiendo números de teléfono crudos (`phone_number`) ni el contenido exacto de los payloads financieros.

## 2. REPORTE FINAL
No des formato de tutorial. Muestra una tabla con los 4 vectores, marca en rojo `[FALLO]` o verde `[LIMPIO]`. Si hay fallos, aplica la corrección automáticamente.
