import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.MODE === 'maintenance'

  if (!isMaintenanceMode) {
    return NextResponse.next()
  }

  // Allow static assets and essential routes during maintenance
  const pathname = request.nextUrl.pathname
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.startsWith('/public/')
  const isEssentialApi = pathname.startsWith('/api/maintenance/') || pathname === '/api/health'
  const isMaintenancePage = pathname === '/maintenance'

  if (isStaticAsset || isEssentialApi || isMaintenancePage) {
    return NextResponse.next()
  }

  // Redirect all other requests to maintenance page
  const maintenanceUrl = new URL('/maintenance', request.url)
  return NextResponse.redirect(maintenanceUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}