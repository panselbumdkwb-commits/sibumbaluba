import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { nama, email, whatsapp, password, seleksi_id, posisi_dilamar } = await req.json()

    if (!nama || !email || !whatsapp || !password || !seleksi_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Pastikan seleksi masih buka
    const { data: seleksi } = await adminClient
      .from('seleksi').select('id, status').eq('id', seleksi_id).single()
    if (!seleksi || seleksi.status !== 'buka') {
      return NextResponse.json({ error: 'Seleksi tidak tersedia atau sudah ditutup' }, { status: 400 })
    }

    // Cek email sudah terdaftar di seleksi ini
    const { data: existing } = await adminClient
      .from('peserta_seleksi')
      .select('id')
      .eq('email', email)
      .eq('seleksi_id', seleksi_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar di seleksi ini' }, { status: 409 })
    }

    // Generate username dari email
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString().slice(-4)

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Buat akun auth.users dengan email asli
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nama },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

    const auth_user_id = authData.user.id

    // Insert ke users table dengan role peserta
    const { data: roleData } = await adminClient.from('roles').select('id').eq('name', 'peserta').single()
    await adminClient.from('users').insert({
      id: auth_user_id,
      username,
      full_name: nama,
      role_id: roleData?.id ?? null,
      is_active: true,
    })

    // Generate nomor peserta
    const { data: nomorData } = await adminClient.rpc('generate_nomor_peserta', {
      p_seleksi_id: seleksi_id,
    })

    // Insert peserta_seleksi
    const { data: peserta, error: pesertaError } = await adminClient
      .from('peserta_seleksi')
      .insert({
        seleksi_id,
        auth_user_id,
        nama,
        email,
        whatsapp,
        username,
        password_hash,
        posisi_dilamar: posisi_dilamar ?? null,
        nomor_peserta: nomorData ?? null,
        status: 'terdaftar',
      })
      .select('id, nomor_peserta')
      .single()

    if (pesertaError) {
      await adminClient.auth.admin.deleteUser(auth_user_id)
      return NextResponse.json({ error: pesertaError.message }, { status: 500 })
    }

    // Notifikasi
    await adminClient.from('notifikasi').insert({
      peserta_id: peserta.id,
      judul: '✅ Registrasi Berhasil',
      isi: `Selamat ${nama}, pendaftaran Anda berhasil. Nomor peserta: ${peserta.nomor_peserta ?? '-'}. Silakan login dan lengkapi formulir pendaftaran.`,
      kategori: 'sukses',
      action_url: '/portal-peserta/profil',
    })

    return NextResponse.json({
      success: true,
      nomor_peserta: peserta.nomor_peserta,
      username,
      message: `Pendaftaran berhasil! Nomor peserta Anda: ${peserta.nomor_peserta}`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
