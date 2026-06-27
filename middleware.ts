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
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PENTING: selalu panggil getUser() agar session ter-refresh
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── Route yang dilindungi (internal dashboard) ────────────
  const isInternalRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/monev') ||
    pathname.startsWith('/regulasi/kelola') ||
    pathname.startsWith('/sop/kelola') ||
    pathname.startsWith('/pengumuman/kelola') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/laporan') ||
    pathname.startsWith('/kelola/seleksi/baru') ||
    /^\/kelola\/seleksi\/[^/]+$/.test(pathname) // /kelola/seleksi/[id]

  if (isInternalRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Route portal peserta ──────────────────────────────────
  const isPesertaRoute =
    pathname.startsWith('/portal-peserta/dokumen') ||
    pathname.startsWith('/portal-peserta/hasil')

  if (isPesertaRoute && !user) {
    return NextResponse.redirect(new URL('/portal-peserta/login', request.url))
  }

  // ── Redirect jika sudah login ke halaman login ────────────
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (pathname === '/portal-peserta/login' && user) {
    return NextResponse.redirect(new URL('/portal-peserta/dokumen', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
