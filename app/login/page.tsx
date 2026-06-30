'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameReady, setUsernameReady] = useState(false)
  const [passwordReady, setPasswordReady] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Clear session & paksa field kosong saat halaman dibuka
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signOut()
    setUsername('')
    setPassword('')
    // Paksa browser tidak bisa autofill
    if (usernameRef.current) usernameRef.current.value = ''
    if (passwordRef.current) passwordRef.current.value = ''
  }, [])

  async function handleLogin() {
    if (!username || !password) { toast.error('Username dan password wajib diisi'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || 'Username atau password salah')
        setPassword('')
        if (passwordRef.current) passwordRef.current.value = ''
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password,
      })

      if (error) {
        toast.error('Username atau password salah')
        setPassword('')
        if (passwordRef.current) passwordRef.current.value = ''
        return
      }

      toast.success(`Selamat datang, ${data.full_name || username}!`)
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SIBUMBALUMBA</h1>
            <p className="text-sm text-muted-foreground mt-1">Login Internal – Kota Batu</p>
          </div>

          {/* Honeypot anti-autofill tersembunyi */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="username_fake" tabIndex={-1} />
            <input type="password" name="password_fake" tabIndex={-1} />
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                required
                readOnly={!usernameReady}
                onFocus={() => setUsernameReady(true)}
                autoComplete="off"
                name="username_sibumbalumba"
                placeholder="Masukkan username"
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  required
                  readOnly={!passwordReady}
                  onFocus={() => setPasswordReady(true)}
                  autoComplete="new-password"
                  name="password_sibumbalumba"
                  placeholder="Masukkan password"
                  className={`${inputBase} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleLogin}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk...</> : 'Masuk'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Peserta seleksi?{' '}
              <a href="/portal-peserta/login" className="text-primary font-medium hover:underline">
                Login Portal Peserta
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Pemerintah Kota Batu — Bagian Perekonomian dan SDA
        </p>
      </div>
    </div>
  )
}
