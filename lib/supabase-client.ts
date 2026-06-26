// lib/supabase-client.ts
// ⚠️  HANYA untuk 'use client' components — TIDAK boleh import cookies/headers
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser client — gunakan di 'use client' components.
 * Aman diimport di sisi client karena TIDAK mengimport next/headers.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnon)
}

/** Helper: ambil public URL dari Storage */
export function getPublicUrl(bucket: string, path: string): string {
  const sb = createBrowserClient<Database>(supabaseUrl, supabaseAnon)
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
