// lib/auth.ts
'use server'

import { createServerComponentClient, createServiceClient } from './supabase'
import bcrypt from 'bcryptjs'
import type { User, RoleName } from './types'

// ── Internal User Login (username + password) ─────────────────
export async function loginWithUsername(
  username: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createServerComponentClient()

  // Get user by username from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (userError || !userData) {
    return { user: null, error: 'Username atau password salah' }
  }

  // Get email from auth.users via service client
  const serviceClient = createServiceClient()
  const { data: authUser, error: authError } = await serviceClient.auth.admin
    .getUserById(userData.id)

  if (authError || !authUser.user?.email) {
    return { user: null, error: 'Akun tidak ditemukan' }
  }

  // Sign in with Supabase Auth using mapped email
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password,
  })

  if (signInError) {
    return { user: null, error: 'Username atau password salah' }
  }

  return { user: userData as User, error: null }
}

// ── Create Internal User ──────────────────────────────────────
export async function createInternalUser(params: {
  username: string
  password: string
  full_name: string
  role_id: string
}): Promise<{ error: string | null }> {
  const serviceClient = createServiceClient()

  // Create auth user with email = username@simbubalada.internal
  const email = `${params.username}@simbubalada.internal`
  const { data: authData, error: authError } = await serviceClient.auth.admin
    .createUser({
      email,
      password: params.password,
      email_confirm: true,
    })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Gagal membuat akun' }
  }

  // Insert into users table
  const { error: userError } = await serviceClient.from('users').insert({
    id: authData.user.id,
    username: params.username,
    full_name: params.full_name,
    role_id: params.role_id,
    is_active: true,
  })

  if (userError) {
    // Rollback auth user
    await serviceClient.auth.admin.deleteUser(authData.user.id)
    return { error: userError.message }
  }

  return { error: null }
}

// ── Get Current User ──────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerComponentClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  return data as User | null
}

// ── Get Current User Role ─────────────────────────────────────
export async function getCurrentRole(): Promise<RoleName | null> {
  const user = await getCurrentUser()
  return (user?.role?.name as RoleName) ?? null
}

// ── Check Permission ──────────────────────────────────────────
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user?.role) return false

  const perms = user.role.permissions as Record<string, boolean>
  return perms.all === true || perms[permission] === true
}

// ── Logout ────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  const supabase = await createServerComponentClient()
  await supabase.auth.signOut()
}

// ── Peserta Login (separate from internal) ────────────────────
export async function loginPeserta(
  username: string,
  password: string
): Promise<{ pesertaId: string | null; error: string | null }> {
  const supabase = await createServerComponentClient()

  const { data: peserta, error } = await supabase
    .from('peserta_seleksi')
    .select('id, password_hash, auth_user_id')
    .eq('username', username)
    .single()

  if (error || !peserta) {
    return { pesertaId: null, error: 'Username atau password salah' }
  }

  const valid = await bcrypt.compare(password, peserta.password_hash)
  if (!valid) {
    return { pesertaId: null, error: 'Username atau password salah' }
  }

  // If auth_user_id exists, sign in via Supabase Auth
  if (peserta.auth_user_id) {
    const serviceClient = createServiceClient()
    const { data: authUser } = await serviceClient.auth.admin
      .getUserById(peserta.auth_user_id)

    if (authUser.user?.email) {
      await supabase.auth.signInWithPassword({
        email: authUser.user.email,
        password,
      })
    }
  }

  return { pesertaId: peserta.id, error: null }
}

// ── Register Peserta ──────────────────────────────────────────
export async function registerPeserta(params: {
  seleksi_id: string
  nik: string
  nama: string
  ttl: string
  alamat: string
  pendidikan: string
  whatsapp: string
  username: string
  password: string
}): Promise<{ pesertaId: string | null; error: string | null }> {
  const serviceClient = createServiceClient()

  // Check username uniqueness
  const { data: existing } = await serviceClient
    .from('peserta_seleksi')
    .select('id')
    .eq('username', params.username)
    .single()

  if (existing) {
    return { pesertaId: null, error: 'Username sudah digunakan' }
  }

  // Hash password
  const password_hash = await bcrypt.hash(params.password, 12)

  // Create auth user for peserta
  const email = `peserta.${params.username}@simbubalada.seleksi`
  const { data: authData, error: authError } = await serviceClient.auth.admin
    .createUser({
      email,
      password: params.password,
      email_confirm: true,
    })

  if (authError) {
    return { pesertaId: null, error: authError.message }
  }

  // Insert peserta
  const { data: peserta, error: insertError } = await serviceClient
    .from('peserta_seleksi')
    .insert({
      seleksi_id: params.seleksi_id,
      auth_user_id: authData.user?.id,
      nik: params.nik,
      nama: params.nama,
      ttl: params.ttl,
      alamat: params.alamat,
      pendidikan: params.pendidikan,
      whatsapp: params.whatsapp,
      username: params.username,
      password_hash,
      status: 'terdaftar',
    })
    .select('id')
    .single()

  if (insertError) {
    if (authData.user) {
      await serviceClient.auth.admin.deleteUser(authData.user.id)
    }
    return { pesertaId: null, error: insertError.message }
  }

  // Auto-notify
  await serviceClient.from('notifikasi').insert({
    peserta_id: peserta.id,
    judul: 'Registrasi Berhasil',
    isi: `Selamat ${params.nama}, pendaftaran Anda telah berhasil. Nomor peserta akan segera diberikan. Silakan upload dokumen persyaratan.`,
    kategori: 'sukses',
    action_url: '/portal-peserta/dokumen',
  })

  return { pesertaId: peserta.id, error: null }
}
