import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth/jwt'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/api/users', '/api/uploads', '/api/expenses']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/register'],
}
