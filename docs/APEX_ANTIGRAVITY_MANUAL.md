# 🧠 MANUAL TÁCTICO: ANTIGRAVITY "THE ARCHITECT" (APEX-GRADE)

> *Este documento consolida todas las reglas, workflows y capacidades ocultas inyectadas en tu instancia de IA. Úsalo como tu Cheat Sheet diario.*

---

## 1. EL FLUJO SANGUÍNEO (CÓMO DEBEMOS TRABAJAR)

Para evitar alucinaciones, código basura o fricción, este es el único ciclo de vida aceptable:

1. **El Diseño (Tu trabajo):** Vas a Obsidian, creas o actualizas el archivo de la feature (Ej: `08-features/Auth.md`). Defines las reglas de negocio en español claro.
2. **La Orden:** Vienes a Antigravity y dices: *"Lee la feature Auth en Obsidian y genera el implementation plan."*
3. **El Veto y el Gráfico (Mi trabajo):** Si no escribiste la feature, te rechazaré. Si sí la escribiste, te presentaré un `implementation_plan.md` que incluirá OBLIGATORIAMENTE un **Diagrama Mermaid** visual mostrando la arquitectura.
4. **La Ejecución:** Apruebas el plan y yo escribo el código en Rust o Next.js, respetando mis Skills de élite.
5. **La Sincronización:** Tiras el comando `/sync-obsidian`. Yo compararé el `git diff` con tu Roadmap, marcaré lo completado y detectaré desviaciones.

---

## 2. EL ARSENAL DE COMANDOS (WORKFLOWS)

Dependiendo de la situación, invoca estos comandos en el chat. Yo tomaré control automático y asíncrono.

| Comando | Cuándo usarlo | Qué hace "The Architect" |
| :--- | :--- | :--- |
| **`/sync-obsidian`** | Al final del día o tras terminar una feature. | Escanea tu código contra la bóveda de Obsidian, marca los checkboxes completados y reporta código no planeado. |
| **`/mockup-ui [UI]`** | Antes de programar frontend. | Congelo el código, lanzo la IA Generativa interna y te devuelvo un mockup fotorealista (modo oscuro B2B) para que apruebes el diseño visual primero. |
| **`/temporal-scaffold`** | Al iniciar un nuevo flujo de backend. | Te genero el "Boilerplate" de un Workflow y Activity en Temporal.io, inyectando macros y `RetryPolicies` con determinismo absoluto. |
| **`/test-e2e`** | Cuando quieras probar el frontend Next.js. | Clono mi conciencia en un "Browser Subagent". Él abre tu localhost, scrollea como un usuario, prueba clics, renderiza un **video (.webp)** y te da un reporte de calidad. |
| **`/cron-build`** | Tras cambiar el núcleo del sistema. | Lanza un `cargo build --release` masivo en **segundo plano**. Yo me voy a dormir y el sistema me revive automáticamente cuando termine para decirte si falló. |
| **`/audit-red-team`** | Antes de pushear a producción. | Me vuelvo hostil. Ejecuto el plugin de Google `securecoder`, busco fugas de memoria o SQL injections, y armo un exploit (PoC) para hackearte, obligándote a parchearlo. |
| **`/persistent-shell`** | Al inicio de la sesión para compilar más rápido. | Abro una terminal `nix develop` inmortal. Retengo esa sesión en caché durante todo nuestro chat para que cada compilación tome milisegundos en vez de minutos. |

---

## 3. LO QUE TIENES ESTRICTAMENTE PROHIBIDO PEDIRME

Para mantener la asimetría de nuestro entorno, mi sistema rechazará cualquier petición que implique:

1. **"Instálame X dependencia globalmente"**: Te diré que no. Todo debe inyectarse en `flake.nix` (`nativeBuildInputs`) para garantizar inmutabilidad.
2. **"Hazme un query rápido en la base de datos"**: Nunca usaré strings concatenados. Todo paso por SurrealDB exige usar variables `bind()`.
3. **"Usa un Mutex para compartir este estado"**: En el backend de Rust, bloquearé cualquier uso de `std::sync::Mutex` asíncrono. Te obligaré a usar `tokio::sync::RwLock` o paso de mensajes (canales `mpsc`).
4. **"Programa esto rápido sin documentación"**: La Doctrina Obsidian-First es absoluta. Si la carpeta `/08-features/` no tiene tu diseño, mi teclado no se moverá.

---

## 4. SI LAS COSAS SE ROMPEN (DEBUGGING ASIMÉTRICO)

- Si tenemos que aislar un bug muy oscuro o necesito pasarte scripts "sucios" para dumpear la base de datos, te los guardaré en el **Scratchpad Inmortal** (`<appDataDir>/brain/<conversation-id>/scratch/`). Nuestro repositorio de GitHub siempre se mantendrá inmaculado.
- Si en 6 meses te preguntas por qué diseñamos la arquitectura de cierta forma, pídeme que **escanee mi memoria eidética**. Usaré las transcripciones crudas (`transcript.jsonl`) de nuestras conversaciones previas para darte el razonamiento exacto de ese día.
