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
    const { data: existingPeserta } = await adminClient
      .from('peserta_seleksi')
      .select('id, nomor_peserta')
      .eq('email', email)
      .eq('seleksi_id', seleksi_id)
      .maybeSingle()

    if (existingPeserta) {
      return NextResponse.json({
        error: `Email ini sudah terdaftar di seleksi ini. Nomor peserta Anda: ${existingPeserta.nomor_peserta ?? '-'}. Silakan login dengan email dan password yang sudah dibuat.`
      }, { status: 409 })
    }

    // Cek apakah email sudah ada di auth.users (dari pendaftaran gagal sebelumnya)
    const { data: existingAuth } = await adminClient.auth.admin.listUsers()
    const existingUser = existingAuth?.users?.find(u => u.email === email)

    let auth_user_id: string

    if (existingUser) {
      // Email sudah ada di auth tapi belum di peserta_seleksi
      // Cek apakah ini akun internal (ada di public.users)
      const { data: internalUser } = await adminClient
        .from('users')
        .select('id, role:roles(name)')
        .eq('id', existingUser.id)
        .maybeSingle()

      if (internalUser) {
        return NextResponse.json({
          error: 'Email ini sudah digunakan oleh akun internal sistem. Gunakan email lain.'
        }, { status: 409 })
      }

      // Akun ada di auth tapi bukan internal (pendaftaran lama yang gagal)
      // Update password dan gunakan id yang ada
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: nama },
      })
      auth_user_id = existingUser.id
    } else {
      // Buat akun auth baru
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: nama },
      })
      if (authError) {
        return NextResponse.json({
          error: authError.message.includes('already been registered')
            ? 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.'
            : authError.message
        }, { status: 500 })
      }
      auth_user_id = authData.user.id
    }

    // Generate username dari email
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString().slice(-4)

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Pastikan ada di public.users dengan role peserta
    const { data: roleData } = await adminClient.from('roles').select('id').eq('name', 'peserta').single()
    await adminClient.from('users').upsert({
      id: auth_user_id,
      username,
      full_name: nama,
      role_id: roleData?.id ?? null,
      is_active: true,
    }, { onConflict: 'id' })

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
      return NextResponse.json({ error: 'Gagal menyimpan data peserta: ' + pesertaError.message }, { status: 500 })
    }

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
