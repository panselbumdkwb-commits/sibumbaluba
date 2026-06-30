import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const ip = getClientIp(request)

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Cek brute force sebelum proses login
    const { data: isBlocked } = await adminClient.rpc('check_brute_force', {
      p_ip: ip,
      p_username: username,
    })

    if (isBlocked) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' },
        { status: 429 }
      )
    }

    // Cari user berdasarkan username
    const { data: user, error } = await adminClient
      .from('users')
      .select('id, username, full_name, is_active, role:roles(name)')
      .eq('username', username)
      .single()

    if (error || !user) {
      await adminClient.rpc('log_login_attempt', { p_ip: ip, p_username: username, p_success: false })
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    if (!user.is_active) {
      await adminClient.rpc('log_login_attempt', { p_ip: ip, p_username: username, p_success: false })
      return NextResponse.json({ error: 'Akun Anda tidak aktif' }, { status: 403 })
    }

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(user.id)
    if (authError || !authUser.user?.email) {
      await adminClient.rpc('log_login_attempt', { p_ip: ip, p_username: username, p_success: false })
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 401 })
    }

    // Verifikasi password dengan mencoba sign in
    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error: signInError } = await verifyClient.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    })

    if (signInError) {
      await adminClient.rpc('log_login_attempt', { p_ip: ip, p_username: username, p_success: false })
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    // Login berhasil
    await adminClient.rpc('log_login_attempt', { p_ip: ip, p_username: username, p_success: true })

    return NextResponse.json({
      email: authUser.user.email,
      full_name: user.full_name,
      role: (user.role as { name: string } | null)?.name,
    })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
