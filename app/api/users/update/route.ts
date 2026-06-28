import { NextResponse } from 'next/server'
import { createServiceClient, createServerComponentClient } from '@/lib/supabase-server'

export async function PUT(req: Request) {
  try {
    const serverClient = await createServerComponentClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await serverClient.from('users').select('role:roles(name)').eq('id', user.id).single()
    if ((me?.role as { name?: string } | null)?.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, full_name, role_id, password } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

    const supabase = await createServiceClient()

    // Update tabel users
    const { error: updateError } = await supabase.from('users')
      .update({ full_name: full_name || null, role_id: role_id || null })
      .eq('id', id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Reset password jika diisi
    if (password) {
      if (password.length < 8) return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
      const { error: pwError } = await supabase.auth.admin.updateUserById(id, { password })
      if (pwError) return NextResponse.json({ error: pwError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
