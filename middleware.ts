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
    pathname.startsWith('/kelola/seleksi') ||
    pathname.startsWith('/pengaturan-akun')

  if (isInternalRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Proteksi route berdasarkan role ──────────────────────
  if (isInternalRoute && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(name)')
      .eq('id', user.id)
      .single()

    const role = (userData?.role as { name?: string } | null)?.name ?? 'viewer'

    const roleRouteRules: Record<string, string[]> = {
      '/regulasi/kelola':   ['super_admin'],
      '/sop/kelola':        ['super_admin'],
      '/users':             ['super_admin'],
      '/monev/bumd':        ['super_admin', 'admin_bumd', 'admin_bpsda'],
      '/monev/blud':        ['super_admin', 'admin_blud', 'admin_bpsda'],
      '/kelola/seleksi':    ['super_admin', 'panitia_seleksi', 'tim_ukk', 'tim_seleksi'],
      '/pengumuman/kelola': ['super_admin', 'panitia_seleksi', 'tim_seleksi'],
      '/laporan':           ['super_admin', 'admin_bumd', 'admin_blud'],
    }

    for (const [route, allowedRoles] of Object.entries(roleRouteRules)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
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
