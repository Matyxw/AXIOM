name: temporal-orchestration
description: Se activa cuando el usuario solicita estructurar, modificar o depurar workflows asíncronos, actividades o sagas de compensación utilizando el SDK de Temporal.io en Rust.

# Directivas de Arquitectura Temporal.io
1. **Event Sourcing Estricto:** Los flujos de trabajo (Workflows) deben ser completamente deterministas. Queda estrictamente prohibido usar funciones que generen efectos secundarios directos (como `SystemTime::now()`, números aleatorios o llamadas directas de red de Tokio) dentro de la función del Workflow. Todo efecto secundario debe aislarse en una `Activity`.
2. **State Recovery:** Cada interacción crítica con la API de WhatsApp o peticiones de cobro debe registrarse como un paso persistente en el historial de eventos de Temporal para asegurar la recuperación automática ante caídas del servidor.