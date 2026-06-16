import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge Middleware: Motor de Conversión y Autenticación
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isDev = process.env.NODE_ENV === 'development';
  const requestHeaders = new Headers(request.headers);

  // 1. Dashboard Auth Logic (Antiguo proxy.ts)
  if (url.pathname.startsWith('/dashboard')) {
    let tenantId = request.headers.get('x-axiom-tenant-id') || request.headers.get('remote-email') || request.headers.get('remote-user');

    if (isDev && !tenantId) {
      // Mock the tenant ID in development for seamless DX without Authelia
      tenantId = 'dev-tenant-1';
    }

    if (!tenantId) {
      // If no identity is present, redirect to the landing page or login entrypoint
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    requestHeaders.set('x-axiom-tenant-id', tenantId);
  }

  // 2. B2B Persona Personalization (Edge CRO)
  const userAgent = request.headers.get('user-agent') || '';
  let persona = 'developer';
  
  // Simulación de Perfilado Edge (En prod, integrar con Clearbit o IP Geolocation)
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    persona = 'sales_director';
  } else if (userAgent.includes('Mac OS X')) {
    persona = 'cto';
  } else if (userAgent.includes('Windows NT')) {
    persona = 'operations_manager';
  }

  // Inyectamos el resultado en los headers para que el Server Component lo lea
  requestHeaders.set('x-user-persona', persona);
  requestHeaders.set('x-industry-target', 'finance');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuración de rutas donde este Edge Middleware va a ejecutarse
export const config = {
  matcher: [
    // Aplicar a la landing page y páginas principales, excluyendo estáticos y API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
