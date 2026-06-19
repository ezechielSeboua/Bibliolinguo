import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('admin-token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!login|api|_next/static|_next/image|favicon\\.ico).*)'],
}
