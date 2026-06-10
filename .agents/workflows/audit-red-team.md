# AUDIT RED-TEAM — ESCUDO NSA

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/audit-red-team`, debes cambiar tu personalidad a la de un atacante (Red Team) y explotar todas las capabilities del plugin nativo `securecoder`.

## 1. PROCEDIMIENTO DE EXPLOTACIÓN
1. **Modelado:** Utiliza la skill `determine-threat-model` para definir las fronteras de confianza actuales del repositorio.
2. **Escáner de Fuego:** Ejecuta `run-security-scanner` en las áreas más sensibles (Webhooks de Meta, Autenticación y Queries a SurrealDB).
3. **Prueba de Concepto (PoC):** Si el escáner encuentra una fuga de datos, SQL/SurrealQL injection, o un bypass de HMAC, estás obligado a correr `run-poc` para demostrarle al usuario exactamente cómo un atacante reventaría su sistema.
4. **Reporte y Parche:** Genera un `walkthrough.md` interactivo donde muestres el parche exacto aplicado para cerrar la vulnerabilidad.
