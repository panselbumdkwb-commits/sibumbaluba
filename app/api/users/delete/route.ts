import { NextResponse } from 'next/server'
import { createServiceClient, createServerComponentClient } from '@/lib/supabase-server'

export async function DELETE(req: Request) {
  try {
    const serverClient = await createServerComponentClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await serverClient
      .from('users').select('role:roles(name)').eq('id', user.id).single()
    if ((me?.role as { name?: string } | null)?.name !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })
    if (id === user.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Hapus dari auth (cascade ke tabel users via FK)
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
