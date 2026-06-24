// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── Protect internal routes ───────────────────────────────
  if (pathname.startsWith('/(internal)') || 
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/monev') ||
      pathname.startsWith('/regulasi/kelola') ||
      pathname.startsWith('/sop/kelola') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/laporan') ||
      (pathname.startsWith('/seleksi/') && !pathname.includes('/daftar'))) {

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user is internal (not peserta)
    const { data: internalUser } = await supabase
      .from('users')
      .select('id, is_active, role:roles(name)')
      .eq('id', user.id)
      .single()

    if (!internalUser || !internalUser.is_active) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Protect portal peserta routes ─────────────────────────
  if (pathname.startsWith('/portal-peserta/dokumen') ||
      pathname.startsWith('/portal-peserta/hasil')) {
    if (!user) {
      return NextResponse.redirect(new URL('/portal-peserta/login', request.url))
    }

    // Check if user is a peserta
    const { data: peserta } = await supabase
      .from('peserta_seleksi')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!peserta) {
      return NextResponse.redirect(new URL('/portal-peserta/login', request.url))
    }
  }

  // ── Redirect logged-in users away from login pages ────────
  if (pathname === '/login' && user) {
    const { data: internalUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (internalUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (pathname === '/portal-peserta/login' && user) {
    const { data: peserta } = await supabase
      .from('peserta_seleksi')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (peserta) {
      return NextResponse.redirect(new URL('/portal-peserta/dokumen', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
