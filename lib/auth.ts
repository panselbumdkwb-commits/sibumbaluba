// lib/auth.ts
'use server'

import { createServerComponentClient, createServiceClient } from './supabase-server'
import bcrypt from 'bcryptjs'
import type { User, RoleName } from './types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerComponentClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const { data } = await supabase
    .from('users').select('*, role:roles(*)').eq('id', authUser.id).single()
  return data as User | null
}

export async function getCurrentRole(): Promise<RoleName | null> {
  const user = await getCurrentUser()
  return (user?.role?.name as RoleName) ?? null
}

export async function registerPeserta(params: {
  seleksi_id: string; nik: string; nama: string; ttl: string
  alamat: string; pendidikan: string; whatsapp: string
  username: string; password: string
}): Promise<{ pesertaId: string | null; error: string | null }> {
  const serviceClient = await createServiceClient()

  const { data: existing } = await serviceClient
    .from('peserta_seleksi').select('id').eq('username', params.username).maybeSingle()
  if (existing) return { pesertaId: null, error: 'Username sudah digunakan' }

  const password_hash = await bcrypt.hash(params.password, 12)
  const email = `peserta.${params.username}@simbubalada.internal`

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email, password: params.password, email_confirm: true,
  })
  if (authError) return { pesertaId: null, error: authError.message }

  const { data: peserta, error: insertError } = await serviceClient
    .from('peserta_seleksi')
    .insert({
      seleksi_id: params.seleksi_id,
      auth_user_id: authData.user?.id,
      nik: params.nik, nama: params.nama, ttl: params.ttl,
      alamat: params.alamat, pendidikan: params.pendidikan, whatsapp: params.whatsapp,
      username: params.username, password_hash, status: 'terdaftar',
    })
    .select('id').single()

  if (insertError) {
    if (authData.user) await serviceClient.auth.admin.deleteUser(authData.user.id)
    return { pesertaId: null, error: insertError.message }
  }

  return { pesertaId: peserta.id, error: null }
}
