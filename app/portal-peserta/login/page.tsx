'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Eye, EyeOff, Loader2, ArrowLeft, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function PortalPesertaLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !password) { toast.error('Email dan password wajib diisi'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error('Email atau password salah'); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Login gagal'); return }

      const { data: peserta } = await supabase
        .from('peserta_seleksi')
        .select('id, nama, status')
        .eq('auth_user_id', user.id)
        .single()

      if (!peserta) {
        await supabase.auth.signOut()
        toast.error('Akun peserta tidak ditemukan. Silakan daftar terlebih dahulu.')
        return
      }
      if (['tidak_aktif','tidak_lulus'].includes(peserta.status)) {
        await supabase.auth.signOut()
        toast.error('Akun Anda tidak aktif. Hubungi panitia untuk informasi lebih lanjut.')
        return
      }

      toast.success(`Selamat datang, ${peserta.nama}!`)
      router.push('/portal-peserta/dashboard')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Portal Peserta</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Login untuk melengkapi data dan pantau status seleksi
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Pendaftaran</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="email" placeholder="email@anda.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password" placeholder="Password Anda"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="button" disabled={loading} onClick={handleLogin}
              className="w-full h-10 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk...</> : 'Masuk ke Portal'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs text-center text-muted-foreground">Belum punya akun peserta?</p>
            <Link href="/portal-peserta/daftar"
              className="w-full h-10 rounded-lg border border-border hover:bg-accent text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" /> Daftar Sebagai Peserta
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Pemerintah Kota Batu — SIBUMBALUMBA
        </p>
      </div>
    </div>
  )
}
