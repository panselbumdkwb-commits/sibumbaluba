import { NextResponse } from 'next/server'
import { createServiceClient, createServerComponentClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    // Pastikan hanya super_admin
    const serverClient = await createServerComponentClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await serverClient
      .from('users').select('role:roles(name)').eq('id', user.id).single()
    if ((me?.role as { name?: string } | null)?.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { username, full_name, password, role_id } = await req.json()
    if (!username || !password || !role_id) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Cek username
    const { data: existing } = await supabase
      .from('users').select('id').eq('username', username).single()
    if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 })

    // Buat auth user
    const email = `${username}@simbubalada.internal`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

    // Insert users table
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id, username, full_name: full_name || null, role_id, is_active: true,
    })
    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
