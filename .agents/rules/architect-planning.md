# 🚨 OJO ARQUITECTÓNICO — RENDERIZADO VISUAL OBLIGATORIO

## 1. Planning Mode y Artifacts (Mermaid)
Si el usuario hace una solicitud que requiere entrar en **Planning Mode** (es decir, que requiere generar un `implementation_plan.md` antes de codificar), Antigravity tiene una regla terminal:

- **PROHIBICIÓN ABSOLUTA:** Queda estrictamente prohibido someter a aprobación un plan de implementación técnico que sea únicamente texto plano o viñetas.
- **EL GRAFO DE VERDAD:** Todo `implementation_plan.md` DEBE incluir un bloque de código en lenguaje `mermaid`.
- El diagrama debe mostrar claramente el flujo de datos (Data Flow), los contenedores, las integraciones con la Base de Datos (SurrealDB, TigerBeetle) y, si aplica, los motores asíncronos (Temporal.io).

## 2. Walkthroughs Visuales
Al presentar el reporte final (`walkthrough.md`), en caso de ser necesario, debes utilizar el formato de **Carousel** de Antigravity (cuatro backticks con `carousel`) para mostrar el antes y el después, o la evolución del estado de la aplicación.
