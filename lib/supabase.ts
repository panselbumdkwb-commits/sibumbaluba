// lib/supabase.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser Client — hanya untuk 'use client' components ──────
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ── Server Client — untuk Server Components & Route Handlers ──
export async function createServerComponentClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — set cookie diabaikan
        }
      },
    },
  })
}

// ── Service Role Client — HANYA di server, bukan edge ─────────
// Wajib dipanggil dari Server Component / Route Handler saja
export async function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore = await cookies()
  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Abaikan di Server Component
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ── Storage: ambil public URL ─────────────────────────────────
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
