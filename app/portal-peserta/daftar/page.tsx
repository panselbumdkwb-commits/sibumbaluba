'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Eye, EyeOff, Loader2, CheckCircle, Upload, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SeleksiRow { id: string; judul: string; jenis: string; entitas: string; jadwal: Record<string,string>; persyaratan: string | null; kuota: number }

export default function DaftarPesertaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=pilih seleksi, 2=isi form, 3=sukses
  const [seleksiList, setSeleksiList] = useState<SeleksiRow[]>([])
  const [selectedSeleksi, setSelectedSeleksi] = useState<SeleksiRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSeleksi, setLoadingSeleksi] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [showKonfirm, setShowKonfirm] = useState(false)
  const [result, setResult] = useState<{ nomor_peserta: string; username: string } | null>(null)

  const [form, setForm] = useState({
    nama: '', email: '', whatsapp: '', password: '', konfirmasi: '', posisi_dilamar: '',
  })

  useEffect(() => {
    fetch('/api/peserta/seleksi-aktif')
      .then(r => r.json())
      .then(d => { setSeleksiList(d.data ?? []); setLoadingSeleksi(false) })
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleDaftar() {
    if (!form.nama.trim() || !form.email.trim() || !form.whatsapp.trim() || !form.password) {
      toast.error('Semua field wajib diisi'); return
    }
    if (!form.email.includes('@')) { toast.error('Format email tidak valid'); return }
    if (form.password.length < 8) { toast.error('Password minimal 8 karakter'); return }
    if (form.password !== form.konfirmasi) { toast.error('Konfirmasi password tidak cocok'); return }
    if (!selectedSeleksi) { toast.error('Pilih seleksi terlebih dahulu'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/peserta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          whatsapp: form.whatsapp,
          password: form.password,
          seleksi_id: selectedSeleksi.id,
          posisi_dilamar: form.posisi_dilamar || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal mendaftar'); return }
      setResult({ nomor_peserta: data.nomor_peserta, username: data.username })
      setStep(3)
    } catch { toast.error('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/portal-peserta/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Sudah punya akun? Login
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="h-6 w-6" />
              <h1 className="text-xl font-bold">Pendaftaran Peserta Seleksi</h1>
            </div>
            <p className="text-primary-foreground/80 text-sm">SIBUMBALUMBA — Kota Batu</p>
            {/* Stepper */}
            <div className="flex items-center gap-2 mt-4">
              {['Pilih Seleksi','Data Diri','Selesai'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    step > i + 1 ? 'bg-white text-primary border-white' :
                    step === i + 1 ? 'bg-primary-foreground/20 text-white border-white' :
                    'bg-transparent text-primary-foreground/50 border-primary-foreground/30'
                  }`}>{step > i + 1 ? '✓' : i + 1}</div>
                  <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white font-semibold' : 'text-primary-foreground/60'}`}>{s}</span>
                  {i < 2 && <div className="w-8 h-px bg-primary-foreground/30" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1: Pilih Seleksi */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg">Pilih Seleksi yang Diikuti</h2>
                {loadingSeleksi ? (
                  <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
                ) : seleksiList.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="font-semibold">Tidak ada seleksi yang sedang buka</p>
                    <p className="text-sm mt-1">Pantau pengumuman untuk info seleksi berikutnya</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seleksiList.map(s => (
                      <div key={s.id}
                        onClick={() => setSelectedSeleksi(s)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSeleksi?.id === s.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-sm">{s.judul}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {s.jenis} · {s.entitas} · Kuota: {s.kuota} orang
                            </div>
                            {s.jadwal?.pendaftaran_selesai && (
                              <div className="text-xs text-orange-600 mt-1">
                                Pendaftaran hingga: {new Date(s.jadwal.pendaftaran_selesai).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                              </div>
                            )}
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                            selectedSeleksi?.id === s.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {selectedSeleksi?.id === s.id && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                        {s.persyaratan && (
                          <div className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2">
                            {s.persyaratan}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!selectedSeleksi}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    Lanjut <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Form Pendaftaran */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => setStep(1)} className="p-1.5 rounded-lg hover:bg-accent">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="font-bold text-lg">Data Diri Peserta</h2>
                    <p className="text-xs text-muted-foreground">{selectedSeleksi?.judul}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Nama Lengkap (sesuai KTP) <span className="text-red-500">*</span></label>
                    <input value={form.nama} onChange={set('nama')} placeholder="Nama lengkap Anda" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Aktif <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="email@anda.com" className={inputCls} />
                    <p className="text-xs text-muted-foreground mt-1">Email akan digunakan untuk login</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nomor WhatsApp Aktif <span className="text-red-500">*</span></label>
                    <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="08xxxxxxxxxx" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                        placeholder="Min. 8 karakter"
                        className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Konfirmasi Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showKonfirm ? 'text' : 'password'} value={form.konfirmasi} onChange={set('konfirmasi')}
                        placeholder="Ulangi password"
                        className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <button type="button" onClick={() => setShowKonfirm(!showKonfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showKonfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Posisi yang Dilamar</label>
                    <input value={form.posisi_dilamar} onChange={set('posisi_dilamar')}
                      placeholder={`Contoh: Direktur Utama ${selectedSeleksi?.entitas}`}
                      className={inputCls} />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
                  <strong>Catatan:</strong> Setelah mendaftar, Anda akan mendapatkan nomor peserta unik dan dapat melengkapi formulir pendaftaran lengkap (identitas, riwayat pendidikan, pekerjaan, keluarga, dll) setelah login ke portal peserta.
                </div>

                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                  </button>
                  <button type="button" disabled={loading} onClick={handleDaftar}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...</> : <>Daftar Sekarang <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Sukses */}
            {step === 3 && result && (
              <div className="text-center py-6 space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-500">Pendaftaran Berhasil!</h2>
                  <p className="text-sm text-muted-foreground mt-1">Simpan informasi berikut dengan baik</p>
                </div>
                <div className="bg-muted rounded-xl p-5 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nomor Peserta</span>
                    <span className="font-bold text-lg text-primary tracking-wider">{result.nomor_peserta}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Username Login</span>
                    <span className="font-mono text-sm font-semibold">{result.username}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Email Login</span>
                    <div className="font-medium text-sm mt-0.5">{form.email}</div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-xs text-yellow-700 dark:text-yellow-400 text-left">
                  <strong>⚠️ Langkah Selanjutnya:</strong> Login ke portal peserta dan lengkapi formulir pendaftaran Anda (identitas lengkap, riwayat pendidikan, pekerjaan, keluarga, foto, dan motivasi) sebelum batas waktu pendaftaran berakhir.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/portal-peserta/login"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Login ke Portal Peserta
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Pemerintah Kota Batu — SIBUMBALUMBA
        </p>
      </div>
    </div>
  )
}
