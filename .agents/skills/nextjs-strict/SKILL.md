---
name: nextjs-strict
description: >
  Protocolo arquitectónico para interfaces B2B de alto rendimiento.
  Aplica para todos los archivos dentro de la carpeta /frontend.
alwaysOn: false
---

# 🖥️ NEXT.JS 16 (APP ROUTER) — DOCTRINA FRONTEND B2B

## 1. La Regla de Oro: Server-First

**El árbol de componentes es Server Components por defecto.**
`'use client'` es el último recurso, no el punto de partida.

**Jerarquía obligatoria:**
```
app/
├── layout.tsx          → Server Component (nunca 'use client')
├── page.tsx            → Server Component (fetching directo con await)
└── (dashboard)/
    └── analytics/
        ├── page.tsx    → Server Component — fetch de datos
        └── Chart.tsx   → 'use client' — solo si usa hooks de estado/efecto
```

---

## 2. Fetching de Datos — Sin useEffect, Sin useState para Servidor

```tsx
// ✅ CORRECTO — Server Component, fetching directo
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch directo, sin hooks, sin loading states manuales
  const metrics = await fetch(`${process.env.BACKEND_URL}/api/metrics`, {
    headers: { Authorization: `Bearer ${process.env.INTERNAL_API_KEY}` },
    next: { revalidate: 60 }, // ISR: revalidar cada 60s
  }).then(r => r.json());

  return <MetricsGrid data={metrics} />;
}

// ❌ PROHIBIDO — useEffect para fetching inicial en Client Component
'use client';
export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(...).then(setData); }, []); // NUNCA
  return <div>{data}</div>;
}
```

---

## 3. Mutaciones — Server Actions Exclusivamente

```tsx
// ✅ CORRECTO — Server Action tipada
// app/actions/tenant.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function updateTenantConfig(formData: FormData) {
  const name = formData.get('name') as string;

  const res = await fetch(`${process.env.BACKEND_URL}/api/tenant`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error('Error al actualizar tenant');
  revalidatePath('/dashboard/settings');
}

// Uso en el componente (puede ser Server Component):
// <form action={updateTenantConfig}>
//   <input name="name" />
//   <button type="submit">Guardar</button>
// </form>
```

---

## 4. Cuándo Usar 'use client' — Lista Exhaustiva

Solo añadir `'use client'` cuando el componente usa **explícitamente**:
- `useState` / `useReducer` — estado local de UI
- `useEffect` / `useLayoutEffect` — efectos de ciclo de vida
- `useRef` + manipulación DOM directa
- Event handlers interactivos complejos (`onMouseMove`, drag & drop)
- Librerías de animación: `framer-motion`, `gsap` (requieren DOM)
- `useRouter` / `useSearchParams` de next/navigation

**Regla de minimización:** Si solo una parte del componente necesita ser cliente,
extraerla a un subcomponente `'use client'` hoja y mantener el padre como servidor.

---

## 5. Variables de Entorno — Seguridad Estricta

| Prefijo | Accesible desde | Uso correcto |
|---|---|---|
| `BACKEND_URL` (sin prefijo) | Solo servidor | URLs internas, API keys, secrets |
| `NEXT_PUBLIC_*` | Servidor Y cliente | Solo datos públicos (no secrets) |

**NUNCA** pasar API keys al cliente con `NEXT_PUBLIC_*`.

---

## 6. Stack Visual AXIOM — No Negociable

- **Framework:** Next.js 16 (React 19)
- **Estilos:** Tailwind CSS 4.0
- **Tipografía:** Geist Mono
- **Componentes:** Aceternity UI + Magic UI
- **Animaciones:** Framer Motion + GSAP
- **PROHIBIDO:** Material UI, Chakra UI, Ant Design, Bootstrap — rompen el control granular del diseño
