import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const url = request.nextUrl.clone();
  
  // Forward Auth Headers from Authelia/Cloudflare ZT
  // They usually send Remote-User, Remote-Email, or a custom header
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

  // Clone headers and inject the standardized x-axiom-tenant-id
  // This ensures Server Components can read it cleanly via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-axiom-tenant-id', tenantId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/dashboard/:path*',
};
