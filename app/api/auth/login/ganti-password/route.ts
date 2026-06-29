import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  return supabase.auth.getUser()
}

export async function POST(req: Request) {
  try {
    const { password_lama, password_baru } = await req.json()

    if (!password_lama || !password_baru) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (password_baru.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const { data: { user } } = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Sesi tidak valid, silakan login ulang' }, { status: 401 })
    }

    // Verifikasi password lama
    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error: signInError } = await verifyClient.auth.signInWithPassword({
      email: user.email!,
      password: password_lama,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Password lama tidak benar' }, { status: 400 })
    }

    // Update password baru via admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: password_baru }
    )
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
