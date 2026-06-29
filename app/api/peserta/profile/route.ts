import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function PUT(req: Request) {
  try {
    const serverClient = await createServerComponentClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      peserta_id, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
      status_nikah, alamat, pendidikan, ttl,
      riwayat_pendidikan, riwayat_pekerjaan, riwayat_keluarga,
      hobby, motivasi, foto_url,
    } = body

    if (!peserta_id) return NextResponse.json({ error: 'ID peserta wajib diisi' }, { status: 400 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Pastikan peserta milik user yang login
    const { data: peserta } = await adminClient
      .from('peserta_seleksi')
      .select('id, auth_user_id')
      .eq('id', peserta_id)
      .single()

    if (!peserta || peserta.auth_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {
      tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
      status_nikah, alamat, pendidikan, ttl,
      riwayat_pendidikan: riwayat_pendidikan ?? [],
      riwayat_pekerjaan:  riwayat_pekerjaan  ?? [],
      riwayat_keluarga:   riwayat_keluarga   ?? [],
      hobby, motivasi,
    }
    if (foto_url) updateData.foto_url = foto_url

    // Cek apakah profil sudah lengkap
    const isLengkap = !!(tempat_lahir && tanggal_lahir && jenis_kelamin && alamat && hobby && motivasi)
    updateData.profil_lengkap = isLengkap

    const { error } = await adminClient
      .from('peserta_seleksi')
      .update(updateData)
      .eq('id', peserta_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, profil_lengkap: isLengkap })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
