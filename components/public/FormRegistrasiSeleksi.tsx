'use client'

import React from 'react'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus, CheckCircle2, X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Seleksi } from '@/lib/types'

interface Props {
  seleksiAktif: Seleksi[]
}

interface FormData {
  seleksi_id: string
  nik: string
  nama: string
  ttl: string
  alamat: string
  pendidikan: string
  whatsapp: string
  username: string
  password: string
  confirmPassword: string
}

const PENDIDIKAN_OPTIONS = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3', 'Profesi']

export default function FormRegistrasiSeleksi({ seleksiAktif }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultSeleksiId = searchParams.get('seleksi_id') ?? ''

  const [open, setOpen] = useState(!!defaultSeleksiId)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [nomorPeserta, setNomorPeserta] = useState('')

  const [form, setForm] = useState<FormData>({
    seleksi_id: defaultSeleksiId,
    nik: '', nama: '', ttl: '', alamat: '',
    pendidikan: '', whatsapp: '', username: '', password: '', confirmPassword: '',
  })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function validateStep1() {
    if (!form.seleksi_id) { toast.error('Pilih seleksi terlebih dahulu'); return false }
    if (!form.nik || form.nik.length !== 16) { toast.error('NIK harus 16 digit'); return false }
    if (!form.nama.trim()) { toast.error('Nama lengkap wajib diisi'); return false }
    if (!form.ttl.trim()) { toast.error('Tempat, tanggal lahir wajib diisi'); return false }
    if (!form.alamat.trim()) { toast.error('Alamat wajib diisi'); return false }
    if (!form.pendidikan) { toast.error('Pilih pendidikan terakhir'); return false }
    if (!form.whatsapp.trim()) { toast.error('Nomor WhatsApp wajib diisi'); return false }
    return true
  }

  function validateStep2() {
    if (!form.username.trim() || form.username.length < 5) {
      toast.error('Username minimal 5 karakter'); return false
    }
    if (!/^[a-z0-9_]+$/.test(form.username)) {
      toast.error('Username hanya boleh huruf kecil, angka, dan underscore'); return false
    }
    if (form.password.length < 8) { toast.error('Password minimal 8 karakter'); return false }
    if (form.password !== form.confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return false }
    return true
  }

  async function handleSubmit() {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/seleksi/registrasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seleksi_id: form.seleksi_id,
          nik: form.nik,
          nama: form.nama,
          ttl: form.ttl,
          alamat: form.alamat,
          pendidikan: form.pendidikan,
          whatsapp: form.whatsapp,
          username: form.username,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Registrasi gagal'); return }
      setNomorPeserta(data.nomor_peserta ?? '')
      setSuccess(true)
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    if (seleksiAktif.length === 0) return null
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-xl hover:bg-primary/90 transition-all hover:scale-105"
        >
          <UserPlus className="h-4 w-4" />
          Daftar Seleksi
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">
              {success ? 'Registrasi Berhasil!' : 'Form Registrasi Seleksi'}
            </h2>
            {!success && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Langkah {step} dari 2
              </p>
            )}
          </div>
          <button onClick={() => { setOpen(false); setStep(1); setSuccess(false) }}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress bar */}
          {!success && (
            <div className="flex gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          )}

          {/* SUCCESS STATE */}
          {success && (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Pendaftaran Berhasil!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selamat <strong>{form.nama}</strong>, Anda telah terdaftar sebagai peserta seleksi.
              </p>
              {nomorPeserta && (
                <div className="inline-block px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Nomor Peserta Anda</p>
                  <p className="text-2xl font-bold text-primary tracking-widest">{nomorPeserta}</p>
                </div>
              )}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">⚠️ Langkah Selanjutnya</p>
                <ol className="text-xs text-amber-700 dark:text-amber-500 space-y-1 list-decimal list-inside">
                  <li>Catat username dan password Anda</li>
                  <li>Login ke Portal Peserta</li>
                  <li>Upload semua dokumen persyaratan</li>
                  <li>Pantau status verifikasi dokumen</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors">
                  Tutup
                </button>
                <a href="/portal-peserta/login"
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center">
                  Login Portal Peserta
                </a>
              </div>
            </div>
          )}

          {/* STEP 1 - Data Diri */}
          {!success && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pilih Seleksi <span className="text-red-500">*</span></label>
                <select value={form.seleksi_id} onChange={set('seleksi_id')}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">-- Pilih Seleksi --</option>
                  {seleksiAktif.map(s => (
                    <option key={s.id} value={s.id}>{s.judul}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">NIK <span className="text-red-500">*</span></label>
                <input type="text" value={form.nik} onChange={set('nik')} maxLength={16}
                  placeholder="16 digit NIK sesuai KTP"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" value={form.nama} onChange={set('nama')}
                  placeholder="Nama sesuai KTP"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tempat, Tanggal Lahir <span className="text-red-500">*</span></label>
                <input type="text" value={form.ttl} onChange={set('ttl')}
                  placeholder="cth: Malang, 01 Januari 1980"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Alamat Lengkap <span className="text-red-500">*</span></label>
                <textarea value={form.alamat} onChange={set('alamat')} rows={2}
                  placeholder="Alamat sesuai KTP"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                  <select value={form.pendidikan} onChange={set('pendidikan')}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Pilih...</option>
                    {PENDIDIKAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">No. WhatsApp <span className="text-red-500">*</span></label>
                  <input type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <button onClick={() => { if (validateStep1()) setStep(2) }}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Lanjut →
              </button>
            </div>
          )}

          {/* STEP 2 - Akun Portal */}
          {!success && step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  📋 Buat akun Portal Peserta untuk upload dokumen dan memantau status seleksi Anda.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Username <span className="text-red-500">*</span></label>
                <input type="text" value={form.username} onChange={set('username')}
                  placeholder="Minimal 5 karakter (huruf kecil, angka, _)"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-1">Gunakan untuk login Portal Peserta</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Minimal 8 karakter"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Konfirmasi Password <span className="text-red-500">*</span></label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Ulangi password"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 h-10 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors">
                  ← Kembali
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...</> : 'Daftar Sekarang'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
