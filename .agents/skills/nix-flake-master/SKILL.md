---
name: nix-flake-master
description: >
  Doctrina de determinismo y reproducibilidad de infraestructura mediante Nix Flakes.
  Aplica cuando se agreguen dependencias al sistema operativo, lenguajes o utilidades CLI.
alwaysOn: false
---

# ❄️ NIX FLAKE — DOCTRINA DE INFRAESTRUCTURA INMUTABLE

## 1. El Flake es el Sistema Operativo
- **PROHIBICIÓN ABSOLUTA:** El Agente tiene terminalmente prohibido sugerir, usar o pedirle al usuario que ejecute `apt install`, `brew install`, `npm install -g`, o `cargo install` globalmente en su máquina.
- Toda nueva utilidad o runtime DEBE inyectarse en el array `nativeBuildInputs` o `buildInputs` del archivo `flake.nix`.

## 2. Pureza
- Los entornos de desarrollo creados mediante Nix deben ser herméticos. Si el build requiere variables de entorno en tiempo de compilación, deben inyectarse a través del Flake.
- Cuando se añadan extensiones de VS Code para el Devcontainer, deben validarse primero que existan herramientas compatibles provistas por Nix (ej. `rust-analyzer` en Nix en lugar de que la extensión lo descargue por sí misma, previniendo errores de arquitectura).
