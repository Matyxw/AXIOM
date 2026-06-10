# PERSISTENT SHELL — NIX INMORTAL

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/persistent-shell`, debes preparar una terminal rápida y sin cold-starts.

## 1. MECANISMO DE ESTADO COMPARTIDO
1. Usa tu herramienta interna `run_command` pasando el parámetro `RunPersistent: true` con el comando `nix develop`.
2. Antigravity creará un `TerminalID`. Guardarás este ID en tu memoria para el resto de la conversación.
3. Cada vez que el usuario te pida ejecutar herramientas de Rust o Node (ej. `cargo clippy`, `cargo run`), usarás ESE mismo `TerminalID` en tu tool `run_command`. 
4. **Beneficio:** Al reusar el mismo shell, la memoria RAM retendrá las cachés del compilador, el árbol de dependencias Nix estará previamente anclado y la compilación tomará un 10% del tiempo original.
