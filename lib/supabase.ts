// lib/supabase.ts
// Re-export semua helper dari file yang sudah dipisah.
// Client components: hanya import createClient / getPublicUrl
// Server components: hanya import createServerComponentClient / createServiceClient

// ── Browser (client-side safe) ────────────────────────────────
export { createClient, getPublicUrl } from './supabase-client'

// ── Server only ───────────────────────────────────────────────
// Next.js tree-shaking akan memastikan cookies() hanya di-eval di server.
// Pastikan file yang mengimport ini TIDAK memakai 'use client'.
export { createServerComponentClient, createServiceClient } from './supabase-server'
