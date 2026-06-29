'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function GantiPasswordClient() {
  const [form, setForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' })
  const [show, setShow] = useState({ lama: false, baru: false, konfirmasi: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    if (!form.password_lama || !form.password_baru || !form.konfirmasi) {
      toast.error('Semua field wajib diisi'); return
    }
    if (form.password_baru.length < 8) {
      toast.error('Password baru minimal 8 karakter'); return
    }
    if (form.password_baru !== form.konfirmasi) {
      toast.error('Konfirmasi password tidak cocok'); return
    }
    if (form.password_lama === form.password_baru) {
      toast.error('Password baru harus berbeda dari password lama'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/ganti-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password_lama: form.password_lama,
          password_baru: form.password_baru,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal mengganti password'); return }

      setSuccess(true)
      setForm({ password_lama: '', password_baru: '', konfirmasi: '' })
      toast.success('Password berhasil diubah')
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all'

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" /> Ganti Password
      </h2>

      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Password berhasil diubah. Gunakan password baru saat login berikutnya.
        </div>
      )}

      <div className="space-y-4">
        {[
          { key: 'password_lama', label: 'Password Lama',            showKey: 'lama'       as const },
          { key: 'password_baru', label: 'Password Baru',            showKey: 'baru'       as const },
          { key: 'konfirmasi',    label: 'Konfirmasi Password Baru', showKey: 'konfirmasi' as const },
        ].map(({ key, label, showKey }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1.5">
              {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show[showKey] ? 'text' : 'password'}
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={key === 'password_baru' ? 'Min. 8 karakter' : ''}
                className={inputCls}
                autoComplete={key === 'password_lama' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              : 'Simpan Password Baru'
            }
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Password minimal 8 karakter. Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol.
      </p>
    </div>
  )
}
