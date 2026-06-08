# Guía: Instalar WSL2 + Nix (prerequisito del proyecto)

> [!IMPORTANT]
> Ejecuta los pasos **en orden**. Los pasos 1–3 se corren en **PowerShell como Administrador**. Los pasos 4+ se corren **dentro de WSL2**.

---

## Paso 1 — Habilitar WSL2 e instalar Ubuntu (PowerShell como Admin)

Abre PowerShell como **Administrador** y ejecuta:

```powershell
# Habilita WSL2 y la plataforma de máquina virtual
wsl --install

# Si ya tienes WSL pero en versión 1, actualiza a v2:
wsl --set-default-version 2
```

> [!NOTE]
> Este comando instala Ubuntu por defecto. **Reinicia el equipo** si te lo solicita.
> Tras el reinicio, Ubuntu se abrirá automáticamente para que crees tu usuario.

Verifica que quedó en WSL2:

```powershell
wsl -l -v
# Debe mostrar VERSION = 2 junto a Ubuntu
```

---

## Paso 2 — (Opcional) Instalar Ubuntu manualmente si ya tienes WSL

Si WSL ya estaba instalado pero sin Ubuntu:

```powershell
wsl --install -d Ubuntu-22.04
```

---

## Paso 3 — Abrir Ubuntu en WSL2

Desde PowerShell (ya sin necesidad de Admin):

```powershell
wsl -d Ubuntu
```

O simplemente abre la app **"Ubuntu"** desde el menú Inicio.

---

## Paso 4 — Actualizar paquetes base (dentro de WSL2 / Ubuntu)

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git xz-utils
```

---

## Paso 5 — Instalar Nix con soporte para Flakes (dentro de WSL2)

Usamos el instalador oficial **Determinate Systems** — el más robusto para WSL2, habilita Flakes por defecto y gestiona el demonio de Nix automáticamente:

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://install.determinate.systems/nix | \
  sh -s -- install
```

> [!TIP]
> El instalador de Determinate Systems es preferible al oficial de NixOS en WSL2 porque:
> - Habilita `nix-command` y `flakes` automáticamente sin editar `nix.conf`.
> - Gestiona correctamente el modo sin `systemd` de WSL2.
> - Soporta desinstalación limpia con `nix-installer uninstall`.

Cuando pregunte `Do you want to proceed? [y/n]` → escribe `y` y presiona Enter.

---

## Paso 6 — Reiniciar la sesión de WSL2

```bash
# Cierra la terminal y vuelve a abrir WSL2, o recarga el shell:
exec bash
```

Si `nix` sigue sin encontrarse tras reabrir, ejecuta desde PowerShell:

```powershell
wsl --shutdown
# Luego vuelve a abrir Ubuntu
```

---

## Paso 7 — Verificar la instalación de Nix

```bash
nix --version
# Esperado: nix (Nix) 2.x.x

nix run nixpkgs#hello
# Esperado: Hello, world!
```

---

## Paso 8 — Verificar soporte de Flakes

```bash
nix flake --help
# Debe mostrar el subcomando flake disponible
```

Si por algún motivo usaste el instalador oficial de NixOS en lugar de Determinate Systems, habilita Flakes manualmente:

```bash
mkdir -p ~/.config/nix
echo 'experimental-features = nix-command flakes' >> ~/.config/nix/nix.conf
```

---

## Paso 9 — Acceder al proyecto desde WSL2

Tu proyecto está en `D:\codigos\importante\Bot_ia`. En WSL2, los discos de Windows se montan automáticamente bajo `/mnt/`:

```bash
ls /mnt/d/codigos/importante/Bot_ia
cd /mnt/d/codigos/importante/Bot_ia
```

> [!WARNING]
> El filesystem de Windows (NTFS) accedido vía `/mnt/` desde WSL2 es **significativamente más lento** para operaciones I/O intensivas como `cargo build` (compilaciones, linking).
>
> **Recomendación**: trabaja dentro del filesystem nativo de Linux y sincroniza al terminar:
> ```bash
> mkdir -p ~/projects
> cp -r /mnt/d/codigos/importante/Bot_ia ~/projects/Bot_ia
> cd ~/projects/Bot_ia
> ```

---

## ✅ Checklist — "Listo para proceder"

Cuando todos estos comandos devuelvan resultados válidos, avísame:

```bash
# 1. WSL2 corriendo
uname -r
# Debe contener "microsoft" o "WSL2"

# 2. Nix disponible
nix --version
# nix (Nix) 2.x.x

# 3. Flakes habilitados
nix flake --help

# 4. Git disponible
git --version
# git version 2.x.x

# 5. Directorio del proyecto accesible
ls /mnt/d/codigos/importante/Bot_ia
```

---

## ¿Qué sigue?

Una vez completada esta guía, avísame con **"WSL2 y Nix listos"** y procederé a generar:

1. `flake.nix` con Rust `1.79.0` via `rust-overlay` + deps de RocksDB/SurrealDB
2. `git init` + `cargo init --name bot-ia-backend`
3. `Cargo.toml` con `tokio` (full) y `axum 0.7`
4. Artifact `nix_usage_guide.md` con instrucciones de uso del entorno
