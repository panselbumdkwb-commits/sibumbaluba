import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Find user by username
    const { data: user, error } = await supabase
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

    // Get auth user to retrieve email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)

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
