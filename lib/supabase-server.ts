// lib/supabase-server.ts
// ⚠️  HANYA untuk Server Components, Route Handlers, Server Actions
// JANGAN import file ini dari 'use client' components!
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Server client dengan anon key — untuk Server Components.
 * RLS tetap berlaku sesuai session user.
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnon, {
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
          // Server Component — ignore cookie set errors
        }
      },
    },
  })
}

/**
 * Service role client — bypass RLS, HANYA untuk API routes & admin ops.
 * JANGAN gunakan di client side!
 */
export async function createServiceClient() {
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore  = await cookies()
  return createServerClient<Database>(supabaseUrl, serviceKey, {
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
          // ignore
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}
