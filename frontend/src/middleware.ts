import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge Middleware: Motor de Conversión Algorítmico (A/B Testing en tiempo real)
export function middleware(request: NextRequest) {
  // Inicializamos la respuesta base
  const response = NextResponse.next()

  // Leemos información del cliente para determinar el Persona
  const userAgent = request.headers.get('user-agent') || ''
  
  // Lógica de perfilado B2B simulada (En producción esto conectaría con Clearbit/Apollo en el Edge)
  let persona = 'developer'
  
  // Simulación: Si usa un sistema operativo de escritorio premium (Mac), asumimos C-Level/Founder
  if (userAgent.includes('Mac OS X')) {
    persona = 'cto'
  } 
  // Si usa móvil corporativo, asumimos Ejecutivo de Ventas
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    persona = 'sales_director'
  }
  // Windows = Operations / IT
  else if (userAgent.includes('Windows NT')) {
    persona = 'operations_manager'
  }

  // Inyectamos el resultado del algoritmo en los headers para que el Server Component lo lea.
  // Esto no expone la lógica al cliente y no causa Cumulative Layout Shift (CLS).
  response.headers.set('x-user-persona', persona)

  // Opcional: También podríamos inyectar la industria si tuviéramos IP Reverse Lookup
  response.headers.set('x-industry-target', 'finance')

  return response
}

// Configuración de rutas donde este Edge Middleware va a ejecutarse
export const config = {
  matcher: [
    // Aplicar a la landing page y páginas principales, excluyendo estáticos y API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
