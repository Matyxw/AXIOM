import React from 'react';
import { headers } from 'next/headers';
import NeuroLandingClient from '@/components/NeuroLandingClient';

// Este es un React Server Component puro.
// Se ejecuta antes de enviar el HTML al cliente, permitiendo leer decisiones del Edge (Middleware)
export default async function Page() {
  const headersList = await headers();
  
  // Leemos el persona inyectado por el middleware. Si no existe (e.g., render estático bypass), asumimos developer.
  const persona = headersList.get('x-user-persona') || 'developer';
  
  // Renderizamos el cliente espacial pasándole la información hiper-personalizada
  return <NeuroLandingClient persona={persona} />;
}
