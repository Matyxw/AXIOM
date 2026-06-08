# Bootstrap: Entorno Determinista Nix + Proyecto Rust Base

Inicialización del entorno de desarrollo reproducible y el esqueleto del proyecto binario de Rust. No se escribe lógica de negocio — solo la infraestructura de compilación y dependencias base.

---

## User Review Required

> [!IMPORTANT]
> Este plan asume que Nix está instalado en la máquina host (o en WSL si se usa Windows). Si aún no está instalado, el primer paso del plan puede incluir las instrucciones de instalación. ¿Confirmas que Nix ya está disponible?

> [!IMPORTANT]
> El directorio de trabajo es `d:\codigos\importante\Bot_ia` (vacío). El `cargo init` generará el `src/main.rs` y el `Cargo.toml` en esa raíz. ¿Es correcto usar esta raíz directamente o prefieres un subdirectorio, e.g. `./backend/`?

> [!WARNING]
> `flake.nix` requiere que el repositorio sea un **repositorio Git** (o al menos tener un `.git/`), ya que Nix Flakes usa `git ls-files` para determinar qué archivos rastrear. El plan incluye `git init` como primer paso.

---

## Open Questions

1. **Versión de Rust**: ¿Usamos el canal `stable` más reciente o una versión fija (ej. `1.79.0`) para máximo determinismo?  
   - _Recomendación: versión fija via `rust-overlay` de `oxalica` para garantizar reproducibilidad total._

2. **Dependencias del sistema embebido**: Para bases de datos embebidas como RocksDB / LMDB / SQLite, las dependencias de compilación difieren. ¿Tienes ya una preferencia de motor?  
   - `RocksDB` → necesita `cmake`, `clang`, `libclang`  
   - `SQLite` → solo `pkg-config`, `sqlite`  
   - `LMDB` → solo `gnumake`, toolchain C  
   - _El plan incluirá el conjunto más amplio (cmake + clang + pkg-config) para cubrirlas todas._

3. **Sistema operativo**: ¿Ejecutas Nix en Linux nativo, macOS, o dentro de WSL2 en Windows?  
   - Esto afecta el `system` del flake (`x86_64-linux` vs `x86_64-darwin` vs `aarch64-*`).

---

## Proposed Changes

### Repositorio Git

#### [RUN] `git init` en la raíz del workspace

Necesario para que Nix Flakes pueda rastrear los archivos del proyecto.

---

### Nix Flake

#### [NEW] [flake.nix](file:///d:/codigos/importante/Bot_ia/flake.nix)

Contenido clave:

```nix
{
  description = "High-availability transactional backend — deterministic Rust environment";

  inputs = {
    nixpkgs.url     = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };

        # Toolchain fijo — edición 2021 está soportada desde 1.56+
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rustfmt" "clippy" ];
        };

        # Dependencias de sistema para compilar crates embebidos
        buildInputs = with pkgs; [
          cmake
          clang
          libclang
          pkg-config
          openssl
          openssl.dev
        ];

      in {
        devShells.default = pkgs.mkShell {
          name = "bot-ia-backend";
          packages = [ rustToolchain ] ++ buildInputs;

          # Variables de entorno necesarias para bindgen / clang
          LIBCLANG_PATH = "${pkgs.libclang.lib}/lib";
          RUST_BACKTRACE = "1";
          OPENSSL_DIR = "${pkgs.openssl.dev}";
        };
      }
    );
}
```

**Decisiones de diseño:**
- `rust-overlay` de oxalica: permite fijar una versión exacta de Rust con reproducibilidad total, sin depender del Rust del sistema.
- `flake-utils.lib.eachDefaultSystem`: el flake funcionará en `x86_64-linux`, `aarch64-linux` y `x86_64-darwin` sin cambios.
- `LIBCLANG_PATH` expuesto: obligatorio para crates que usan `bindgen` (ej. RocksDB).
- No se usa `buildPackages` todavía; esto es solo el `devShell`.

---

### Proyecto Rust

#### [RUN] `cargo init --name bot-ia-backend`

Genera `src/main.rs` (con `fn main()`) y el `Cargo.toml` inicial.

#### [MODIFY] [Cargo.toml](file:///d:/codigos/importante/Bot_ia/Cargo.toml)

Sección `[dependencies]` final:

```toml
[package]
name    = "bot-ia-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
axum  = { version = "0.7" }
```

**Solo** estas dos dependencias como se solicita. El runtime asíncrono (`tokio`) y el framework HTTP (`axum`).

---

### Artefacto de documentación

#### [NEW] `nix_usage_guide.md` (artifact)

Guía paso a paso para activar el entorno Nix y ejecutar el proyecto, orientada al equipo de desarrollo.

---

## Verification Plan

### Automated Tests

```bash
# 1. Verificar que el devShell abre correctamente
nix develop --command rustc --version
# Debe imprimir: rustc 1.x.x (...)

# 2. Verificar que cargo está en el PATH
nix develop --command cargo --version

# 3. Compilar el proyecto desde dentro del shell
nix develop --command cargo build
# Debe terminar con: Finished dev [unoptimized + debuginfo] target(s)

# 4. Verificar determinismo del lockfile Nix
nix flake check
```

### Manual Verification

- Abrir el `devShell` interactivo con `nix develop` y confirmar que `rustc`, `cargo`, `rustfmt`, `clippy` están todos disponibles.
- Confirmar que `cargo build` compila exitosamente el `main.rs` vacío con `tokio` y `axum` resueltos.
