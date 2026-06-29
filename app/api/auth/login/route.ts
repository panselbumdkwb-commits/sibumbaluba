
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: user, error } = await adminClient
      .from('users')
      .select('id, username, full_name, is_active, role:roles(name)')
      .eq('username', username)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Akun Anda tidak aktif' }, { status: 403 })
    }

    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(user.id)
    if (authError || !authUser.user?.email) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 401 })
    }

    return NextResponse.json({
      email: authUser.user.email,
      full_name: user.full_name,
      role: (user.role as { name: string } | null)?.name,
    })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
