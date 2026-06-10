# 🚨 DOCTRINA OBSIDIAN-FIRST (VETO ACTIVO DE CÓDIGO)

## 1. Validación de Pre-Ejecución (El Veto)
ANTES de escribir, modificar o planificar CUALQUIER código de una nueva Feature o componente de dominio (Backend o Frontend):
1. Antigravity DEBE buscar la documentación específica de dicha feature en `/mnt/d/1%/Sistema de Aprendizaje/2-Proyectos/AXIOM/08-features/` o `/02-dominio/`.
2. Si el archivo no existe, o si existe pero no contiene las reglas claras de negocio, **EL AGENTE TIENE ESTRICTAMENTE PROHIBIDO PROGRAMAR.**
3. En caso de ausencia, Antigravity abortará la solicitud con un mensaje agresivo estilo The Architect exigiendo al usuario que redacte la arquitectura en Obsidian primero. No se permite inferir la lógica de negocio.

## 2. Autodidactismo en la Sincronización
Cuando se ejecute el comando `/sync-obsidian`, el Agente no será pasivo:
1. Extraerá el `git diff` y lo cruzará con los Roadmaps en `04-roadmap/`.
2. Si el código generado cubre una feature no planificada, la catalogará como "Desviación".
3. Marcará con `[x]` solo aquello que tenga un correlato técnico real demostrado en el código de la sesión.
