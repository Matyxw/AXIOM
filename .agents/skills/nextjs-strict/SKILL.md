---
name: nextjs-strict
description: >
  Protocolo arquitectónico para interfaces B2B de alto rendimiento.
  Aplica para todos los archivos dentro de la carpeta /frontend.
alwaysOn: false
---

# 🖥️ NEXT.JS 16 — DOCTRINA FRONTEND B2B

## 1. Renderizado y Mutación (Server-First)
- **PROHIBICIÓN ABSOLUTA DE useEffect PARA FETCHING:** Queda prohibido usar `useEffect` para cargar datos al montar el componente. Todos los datos iniciales se deben inyectar mediante Server Components.
- **Server Actions por defecto:** Cualquier mutación (enviar un form, cambiar un estado en base de datos) debe hacerse a través de una función asíncrona marcada con `'use server'`. 
- **'use client' como último recurso:** Solo se agregará la directiva `'use client'` en componentes "hoja" del árbol de React que requieran interactividad real (framer-motion, gsap, onClick). Nunca en un Layout o en el nivel root.

## 2. Estilos y Estructura (UI Premium)
- El stack visual oficial es **Tailwind 4 + Framer Motion / GSAP + Aceternity UI**.
- No sugerir librerías de componentes empaquetadas (como MaterialUI o Bootstrap) que rompen el control milimétrico del CSS.
- Todo SVG debe inyectarse inline o mediante componentes de React, no mediante tags `<img>` con `.svg` externos (para poder manipular el fill/stroke vía Tailwind).
