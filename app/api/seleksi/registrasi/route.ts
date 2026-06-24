import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seleksi_id, nik, nama, ttl, alamat, pendidikan, whatsapp, username, password } = body

    // Validasi input
    if (!seleksi_id || !nik || !nama || !username || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }
    if (nik.length !== 16) {
      return NextResponse.json({ error: 'NIK harus 16 digit' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Cek seleksi masih buka
    const { data: seleksi } = await supabase
      .from('seleksi').select('id, status').eq('id', seleksi_id).single()
    if (!seleksi || seleksi.status !== 'buka') {
      return NextResponse.json({ error: 'Seleksi tidak tersedia atau sudah ditutup' }, { status: 400 })
    }

    // Cek username sudah dipakai
    const { data: existing } = await supabase
      .from('peserta_seleksi').select('id').eq('username', username).single()
    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan, coba yang lain' }, { status: 409 })
    }

    // Cek NIK di seleksi yang sama
    const { data: existingNik } = await supabase
      .from('peserta_seleksi').select('id').eq('seleksi_id', seleksi_id).eq('nik', nik).single()
    if (existingNik) {
      return NextResponse.json({ error: 'NIK sudah terdaftar di seleksi ini' }, { status: 409 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Buat auth user untuk portal peserta
    const email = `peserta.${username}@simbubalada.internal`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) {
      return NextResponse.json({ error: 'Gagal membuat akun: ' + authError.message }, { status: 500 })
    }

    // Insert peserta
    const { data: peserta, error: insertError } = await supabase
      .from('peserta_seleksi')
      .insert({
        seleksi_id,
        auth_user_id: authData.user.id,
        nik, nama, ttl, alamat, pendidikan, whatsapp,
        username,
        password_hash,
        status: 'terdaftar',
      })
      .select('id, nomor_peserta')
      .single()

    if (insertError) {
      // rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Kirim notifikasi registrasi
    await supabase.from('notifikasi').insert({
      peserta_id: peserta.id,
      judul: '✅ Registrasi Berhasil',
      isi: `Selamat ${nama}, pendaftaran Anda berhasil. Nomor peserta: ${peserta.nomor_peserta}. Silakan upload dokumen persyaratan.`,
      kategori: 'sukses',
      action_url: '/portal-peserta/dokumen',
    })

    return NextResponse.json({
      success: true,
      peserta_id: peserta.id,
      nomor_peserta: peserta.nomor_peserta,
    })
  } catch (err) {
    console.error('Registrasi error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
