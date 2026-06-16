{
  description = "AXIOM — Entorno Full-Stack reproducible con Rust 1.89.0 + Node 22";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        # ---------------------------------------------------------------
        # Toolchain fijo: Rust 1.87.0
        # Mínimo requerido: 1.85.0 (estabiliza edition2024 en Cargo,
        # necesario para compilar hashbrown 0.17+ y reqwest 0.12 moderno).
        # Extensiones de desarrollo incluidas: rust-src (para LSP/rust-analyzer),
        # rustfmt (formato) y clippy (linting).
        # ---------------------------------------------------------------
        rustToolchain = pkgs.rust-bin.stable."1.89.0".default.override {
          extensions = [
            "rust-src"      # Requerido por rust-analyzer
            "rustfmt"       # Formateo de código
            "clippy"        # Linter oficial
            "rust-analyzer" # LSP para VSCode
          ];
          # Target nativo Linux x86_64 (WSL2)
          targets = [ "x86_64-unknown-linux-gnu" ];
        };

        # ---------------------------------------------------------------
        # Dependencias de sistema para compilar crates con código nativo.
        # Cubre: RocksDB, SurrealDB, bindgen, OpenSSL, y la mayoría de
        # crates que enlazan contra bibliotecas C/C++.
        # ---------------------------------------------------------------
        nativeBuildInputs = with pkgs; [
          cmake          # Build system para RocksDB y otros crates C++
          pkg-config     # Resolución de bibliotecas del sistema
          clang          # Compilador C/C++ alternativo (preferido por bindgen)
          llvmPackages.libclang  # Headers de libclang para bindgen
          nodejs_22      # Entorno de ejecución para Frontend (Next.js)
          nil            # Nix Language Server
          direnv         # Activación automática del entorno Nix en el shell
        ];

        buildInputs = with pkgs; [
          openssl        # TLS — requerido por tokio-rustls, reqwest, etc.
          openssl.dev    # Headers de OpenSSL para compilación
          rocksdb        # Base de datos embebida clave-valor (SurrealDB la usa)
          snappy         # Compresión — dependencia de RocksDB
          zstd           # Compresión Zstandard — dependencia de RocksDB
          bzip2          # Compresión BZip2 — dependencia de RocksDB
          lz4            # Compresión LZ4 — dependencia de RocksDB
          chromium       # Navegador E2E nativo de Nix
        ];

      in
      {
        # -------------------------------------------------------------------
        # Shell de desarrollo: `nix develop` activa este entorno
        # -------------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "axiom-dev";

          inherit buildInputs;
          nativeBuildInputs = [ rustToolchain ] ++ nativeBuildInputs;

          # ── Variables de entorno ──────────────────────────────────────────
          # bindgen necesita saber dónde están los headers de libclang
          LIBCLANG_PATH = "${pkgs.llvmPackages.libclang.lib}/lib";

          # Forzar el uso del clang de Nix en lugar del del sistema
          CC  = "${pkgs.clang}/bin/clang";
          CXX = "${pkgs.clang}/bin/clang++";

          # OpenSSL: evita que el build script busque en rutas del sistema
          OPENSSL_DIR    = "${pkgs.openssl.dev}";
          OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
          OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include";

          # RocksDB: usar la versión de Nix en lugar de compilar desde fuentes
          # Esto acelera drásticamente el primer `cargo build`
          ROCKSDB_LIB_DIR = "${pkgs.rocksdb}/lib";

          # Snappy (dependencia de RocksDB)
          SNAPPY_LIB_DIR = "${pkgs.snappy}/lib";

          # Backtrace completo en desarrollo
          RUST_BACKTRACE = "1";

          # Registro de logs por defecto (útil con tracing/env-logger)
          RUST_LOG = "debug";

          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH=0
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
            echo ""
            echo "╔═══════════════════════════════════════════════════════╗"
            echo "║   AXIOM — Entorno Nix Full-Stack Activado             ║"
            echo "║   Rust $(rustc --version | cut -d' ' -f2)  •  Node $(node --version)                    ║"
            echo "╚═══════════════════════════════════════════════════════╝"
            echo ""
            echo "  [Backend]"
            echo "  cargo build   → compilar"
            echo "  cargo run     → compilar y ejecutar (Puerto 3001)"
            echo ""
            echo "  [Frontend]"
            echo "  cd frontend && npm run dev  → Levantar Next.js (Puerto 3000)"
            echo ""
          '';
        };

        # -------------------------------------------------------------------
        # Paquetes exportados (para futuros usos como nix build)
        # -------------------------------------------------------------------
        packages.default = pkgs.rustPlatform.buildRustPackage {
          pname   = "bot-ia-backend";
          version = "0.1.0";
          src     = self;

          cargoLock.lockFile = ./Cargo.lock;

          inherit nativeBuildInputs buildInputs;

          env = {
            LIBCLANG_PATH       = "${pkgs.llvmPackages.libclang.lib}/lib";
            OPENSSL_DIR         = "${pkgs.openssl.dev}";
            OPENSSL_LIB_DIR     = "${pkgs.openssl.out}/lib";
            OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include";
            ROCKSDB_LIB_DIR     = "${pkgs.rocksdb}/lib";
            SNAPPY_LIB_DIR      = "${pkgs.snappy}/lib";
          };
        };
      }
    );
}
