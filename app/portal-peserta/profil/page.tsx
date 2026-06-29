'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Upload, X, Plus, Trash2, ArrowLeft, CheckCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

interface PendidikanRow { jenjang: string; institusi: string; jurusan: string; tahun_lulus: string; ipk?: string }
interface PekerjaanRow  { jabatan: string; perusahaan: string; tahun_mulai: string; tahun_selesai: string; deskripsi?: string }
interface KeluargaRow   { hubungan: string; nama: string; pekerjaan: string; usia: string }

const JENJANG  = ['SD','SMP','SMA/SMK','D3','D4','S1','S2','S3']
const AGAMA    = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']
const KELAMIN  = ['Laki-laki','Perempuan']
const NIKAH    = ['Belum Menikah','Menikah','Cerai Hidup','Cerai Mati']
const HUBUNGAN = ['Ayah','Ibu','Suami','Istri','Anak','Saudara']

export default function ProfilPesertaPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pesertaId, setPesertaId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'identitas'|'pendidikan'|'pekerjaan'|'keluarga'|'lainnya'>('identitas')
  const [profil_lengkap, setProfilLengkap] = useState(false)

  const [form, setForm] = useState({
    nama: '', email: '', whatsapp: '', nomor_peserta: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '',
    agama: '', status_nikah: '', alamat: '', kewarganegaraan: 'WNI',
    pendidikan: '', ttl: '',
    foto_url: '',
    hobby: '', motivasi: '',
  })
  const [pendidikan, setPendidikan] = useState<PendidikanRow[]>([])
  const [pekerjaan, setPekerjaan]   = useState<PekerjaanRow[]>([])
  const [keluarga, setKeluarga]     = useState<KeluargaRow[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/portal-peserta/login'); return }

      const { data } = await supabase
        .from('peserta_seleksi')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (!data) { router.push('/portal-peserta/login'); return }

      setPesertaId(data.id)
      setProfilLengkap(data.profil_lengkap ?? false)
      setForm({
        nama:             data.nama           ?? '',
        email:            data.email          ?? '',
        whatsapp:         data.whatsapp       ?? '',
        nomor_peserta:    data.nomor_peserta  ?? '',
        tempat_lahir:     data.tempat_lahir   ?? '',
        tanggal_lahir:    data.tanggal_lahir  ?? '',
        jenis_kelamin:    data.jenis_kelamin  ?? '',
        agama:            data.agama          ?? '',
        status_nikah:     data.status_nikah   ?? '',
        alamat:           data.alamat         ?? '',
        kewarganegaraan:  data.kewarganegaraan ?? 'WNI',
        pendidikan:       data.pendidikan     ?? '',
        ttl:              data.ttl            ?? '',
        foto_url:         data.foto_url       ?? '',
        hobby:            data.hobby          ?? '',
        motivasi:         data.motivasi       ?? '',
      })
      setPendidikan(data.riwayat_pendidikan ?? [])
      setPekerjaan(data.riwayat_pekerjaan   ?? [])
      setKeluarga(data.riwayat_keluarga     ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function uploadFoto(file: File) {
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `foto/${pesertaId}.${ext}`
      const { error } = await supabase.storage.from('peserta-foto').upload(path, file, { upsert: true })
      if (error) { toast.error('Gagal upload foto'); return }
      const { data } = supabase.storage.from('peserta-foto').getPublicUrl(path)
      setForm(f => ({ ...f, foto_url: data.publicUrl }))
      toast.success('Foto berhasil diupload')
    } finally { setUploading(false) }
  }

  async function handleSave() {
    if (!pesertaId) return
    setSaving(true)
    try {
      const res = await fetch('/api/peserta/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peserta_id:          pesertaId,
          tempat_lahir:        form.tempat_lahir,
          tanggal_lahir:       form.tanggal_lahir || null,
          jenis_kelamin:       form.jenis_kelamin,
          agama:               form.agama,
          status_nikah:        form.status_nikah,
          alamat:              form.alamat,
          pendidikan:          form.pendidikan,
          ttl:                 form.ttl,
          kewarganegaraan:     form.kewarganegaraan,
          riwayat_pendidikan:  pendidikan,
          riwayat_pekerjaan:   pekerjaan,
          riwayat_keluarga:    keluarga,
          hobby:               form.hobby,
          motivasi:            form.motivasi,
          foto_url:            form.foto_url || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal menyimpan'); return }
      setProfilLengkap(data.profil_lengkap)
      toast.success('Profil berhasil disimpan')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const TABS = [
    { id: 'identitas',  label: 'Identitas' },
    { id: 'pendidikan', label: 'Pendidikan' },
    { id: 'pekerjaan',  label: 'Pekerjaan' },
    { id: 'keluarga',   label: 'Keluarga' },
    { id: 'lainnya',    label: 'Lainnya' },
  ] as const

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal-peserta/dokumen" className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Formulir Pendaftaran</h1>
              <p className="text-xs text-muted-foreground">{form.nomor_peserta} · {form.nama}</p>
            </div>
          </div>
          {profil_lengkap && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" /> Profil Lengkap
            </div>
          )}
        </div>

        {/* Foto */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            {form.foto_url ? (
              <img src={form.foto_url} alt="Foto" className="h-24 w-24 rounded-xl object-cover border-2 border-border" />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <User className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
            {form.foto_url && (
              <button type="button" onClick={() => setForm(f => ({ ...f, foto_url: '' }))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{form.nama}</div>
            <div className="text-xs text-muted-foreground mb-3">{form.nomor_peserta}</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f) }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs transition-colors">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Mengupload...' : 'Upload Pas Foto Berwarna'}
            </button>
            <p className="text-xs text-muted-foreground mt-1">Format JPG/PNG, maks. 2MB</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {/* IDENTITAS */}
            {activeTab === 'identitas' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
                  <input value={form.nama} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input value={form.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">No. WhatsApp</label>
                  <input value={form.whatsapp} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tempat Lahir</label>
                  <input value={form.tempat_lahir} onChange={set('tempat_lahir')} placeholder="Kota tempat lahir" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tanggal Lahir</label>
                  <input type="date" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Jenis Kelamin</label>
                  <select value={form.jenis_kelamin} onChange={set('jenis_kelamin')} className={inputCls}>
                    <option value="">Pilih...</option>
                    {KELAMIN.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Agama</label>
                  <select value={form.agama} onChange={set('agama')} className={inputCls}>
                    <option value="">Pilih...</option>
                    {AGAMA.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status Pernikahan</label>
                  <select value={form.status_nikah} onChange={set('status_nikah')} className={inputCls}>
                    <option value="">Pilih...</option>
                    {NIKAH.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kewarganegaraan</label>
                  <input value={form.kewarganegaraan} onChange={set('kewarganegaraan')} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Alamat Lengkap</label>
                  <textarea value={form.alamat} onChange={set('alamat')} rows={3} placeholder="Alamat lengkap sesuai KTP"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              </div>
            )}

            {/* PENDIDIKAN */}
            {activeTab === 'pendidikan' && (
              <div className="space-y-4">
                {pendidikan.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                    <button type="button" onClick={() => setPendidikan(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Jenjang</label>
                        <select value={p.jenjang}
                          onChange={e => setPendidikan(prev => prev.map((r, j) => j === i ? { ...r, jenjang: e.target.value } : r))}
                          className={inputCls}>
                          <option value="">Pilih...</option>
                          {JENJANG.map(j => <option key={j}>{j}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tahun Lulus</label>
                        <input value={p.tahun_lulus} placeholder="2010"
                          onChange={e => setPendidikan(prev => prev.map((r, j) => j === i ? { ...r, tahun_lulus: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Nama Institusi</label>
                        <input value={p.institusi} placeholder="Universitas Brawijaya"
                          onChange={e => setPendidikan(prev => prev.map((r, j) => j === i ? { ...r, institusi: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Jurusan / Program Studi</label>
                        <input value={p.jurusan} placeholder="Manajemen"
                          onChange={e => setPendidikan(prev => prev.map((r, j) => j === i ? { ...r, jurusan: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setPendidikan(prev => [...prev, { jenjang: '', institusi: '', jurusan: '', tahun_lulus: '' }])}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Tambah Riwayat Pendidikan
                </button>
              </div>
            )}

            {/* PEKERJAAN */}
            {activeTab === 'pekerjaan' && (
              <div className="space-y-4">
                {pekerjaan.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                    <button type="button" onClick={() => setPekerjaan(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Jabatan</label>
                        <input value={p.jabatan} placeholder="Manajer Keuangan"
                          onChange={e => setPekerjaan(prev => prev.map((r, j) => j === i ? { ...r, jabatan: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Nama Perusahaan/Instansi</label>
                        <input value={p.perusahaan} placeholder="PT. Contoh Indonesia"
                          onChange={e => setPekerjaan(prev => prev.map((r, j) => j === i ? { ...r, perusahaan: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tahun Mulai</label>
                        <input value={p.tahun_mulai} placeholder="2015"
                          onChange={e => setPekerjaan(prev => prev.map((r, j) => j === i ? { ...r, tahun_mulai: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tahun Selesai</label>
                        <input value={p.tahun_selesai} placeholder="2020 / Sekarang"
                          onChange={e => setPekerjaan(prev => prev.map((r, j) => j === i ? { ...r, tahun_selesai: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1">Deskripsi Pekerjaan</label>
                        <textarea value={p.deskripsi ?? ''} placeholder="Uraian singkat tanggung jawab..."
                          onChange={e => setPekerjaan(prev => prev.map((r, j) => j === i ? { ...r, deskripsi: e.target.value } : r))}
                          rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setPekerjaan(prev => [...prev, { jabatan: '', perusahaan: '', tahun_mulai: '', tahun_selesai: '' }])}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Tambah Riwayat Pekerjaan
                </button>
              </div>
            )}

            {/* KELUARGA */}
            {activeTab === 'keluarga' && (
              <div className="space-y-4">
                {keluarga.map((k, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 relative">
                    <button type="button" onClick={() => setKeluarga(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Hubungan</label>
                        <select value={k.hubungan}
                          onChange={e => setKeluarga(prev => prev.map((r, j) => j === i ? { ...r, hubungan: e.target.value } : r))}
                          className={inputCls}>
                          <option value="">Pilih...</option>
                          {HUBUNGAN.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Nama</label>
                        <input value={k.nama} placeholder="Nama anggota keluarga"
                          onChange={e => setKeluarga(prev => prev.map((r, j) => j === i ? { ...r, nama: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Pekerjaan</label>
                        <input value={k.pekerjaan} placeholder="PNS / Wiraswasta / dll"
                          onChange={e => setKeluarga(prev => prev.map((r, j) => j === i ? { ...r, pekerjaan: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Usia</label>
                        <input value={k.usia} placeholder="45"
                          onChange={e => setKeluarga(prev => prev.map((r, j) => j === i ? { ...r, usia: e.target.value } : r))}
                          className={inputCls} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setKeluarga(prev => [...prev, { hubungan: '', nama: '', pekerjaan: '', usia: '' }])}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Tambah Anggota Keluarga
                </button>
              </div>
            )}

            {/* LAINNYA */}
            {activeTab === 'lainnya' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Hobby & Minat</label>
                  <textarea value={form.hobby} onChange={set('hobby')} rows={3}
                    placeholder="Tuliskan hobby dan minat Anda..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kata-kata Motivasi / Pernyataan Diri</label>
                  <textarea value={form.motivasi} onChange={set('motivasi')} rows={5}
                    placeholder="Tuliskan motivasi Anda melamar posisi ini, visi dan rencana Anda jika terpilih..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button type="button" disabled={saving} onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="h-4 w-4" /> Simpan Profil</>}
          </button>
        </div>
      </div>
    </div>
  )
}
