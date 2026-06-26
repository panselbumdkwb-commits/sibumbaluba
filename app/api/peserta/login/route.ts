import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: peserta } = await supabase
      .from('peserta_seleksi')
      .select('id, nama, password_hash, auth_user_id, status')
      .eq('username', username)
      .single()

    if (!peserta) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, peserta.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    if (!peserta.auth_user_id) {
      return NextResponse.json({ error: 'Akun tidak lengkap, hubungi panitia' }, { status: 401 })
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(peserta.auth_user_id)
    if (!authUser.user?.email) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 401 })
    }

    return NextResponse.json({
      email: authUser.user.email,
      nama: peserta.nama,
      peserta_id: peserta.id,
    })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
