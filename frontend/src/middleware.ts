import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const gateUser = process.env.GATE_USER
  const gatePassword = process.env.GATE_PASSWORD

  if (!gateUser || !gatePassword) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6))
    const separatorIndex = decoded.indexOf(':')
    const user = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)
    if (user === gateUser && password === gatePassword) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Acceso restringido', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Alonso49"' },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
