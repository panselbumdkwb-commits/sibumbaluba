'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'

const JENIS_SELEKSI = ['Direksi','Dewan Pengawas','Dewas','Direktur','Komisaris','lainnya'] as const

interface Tahapan {
  nama_tahap: string; urutan: number; tanggal_mulai: string; tanggal_selesai: string
}

interface JadwalForm {
  pendaftaran_mulai: string; pendaftaran_selesai: string
  pengumuman_admin: string; ukk: string; pengumuman_akhir: string
}

interface FormState {
  judul: string; jenis: string; entitas: string; status: string
  persyaratan: string; kuota: number; jadwal: JadwalForm
}

const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export default function SeleksiBaru() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({
    judul: '', jenis: '', entitas: '', status: 'draft', persyaratan: '', kuota: 1,
    jadwal: { pendaftaran_mulai: '', pendaftaran_selesai: '', pengumuman_admin: '', ukk: '', pengumuman_akhir: '' },
  })
  const [tahapan, setTahapan] = useState<Tahapan[]>([
    { nama_tahap: 'Seleksi Administrasi', urutan: 1, tanggal_mulai: '', tanggal_selesai: '' },
    { nama_tahap: 'Psikotes',             urutan: 2, tanggal_mulai: '', tanggal_selesai: '' },
    { nama_tahap: 'Makalah',             urutan: 3, tanggal_mulai: '', tanggal_selesai: '' },
    { nama_tahap: 'Presentasi',          urutan: 4, tanggal_mulai: '', tanggal_selesai: '' },
    { nama_tahap: 'Wawancara',           urutan: 5, tanggal_mulai: '', tanggal_selesai: '' },
  ])

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f: FormState) => ({ ...f, [k]: v }))
  }
  function setJadwal(k: keyof JadwalForm, v: string) {
    setForm((f: FormState) => ({ ...f, jadwal: { ...f.jadwal, [k]: v } }))
  }
  function setTahapanField(i: number, k: keyof Tahapan, v: string | number) {
    setTahapan((prev: Tahapan[]) => prev.map((t: Tahapan, idx: number) => idx === i ? { ...t, [k]: v } : t))
  }
  function addTahapan() {
    setTahapan((prev: Tahapan[]) => [...prev, { nama_tahap: '', urutan: prev.length + 1, tanggal_mulai: '', tanggal_selesai: '' }])
  }
  function removeTahapan(i: number) {
    setTahapan((prev: Tahapan[]) => prev.filter((_: Tahapan, idx: number) => idx !== i).map((t: Tahapan, idx: number) => ({ ...t, urutan: idx + 1 })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.judul || !form.jenis || !form.entitas) { toast.error('Judul, jenis, dan entitas wajib diisi'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: seleksi, error } = await supabase
        .from('seleksi')
        .insert({ judul: form.judul, jenis: form.jenis, entitas: form.entitas, status: form.status, persyaratan: form.persyaratan, kuota: form.kuota, jadwal: form.jadwal })
        .select('id').single()
      if (error || !seleksi) { toast.error(error?.message ?? 'Gagal membuat seleksi'); return }

      const tahapanData = tahapan
        .filter((t: Tahapan) => t.nama_tahap.trim())
        .map((t: Tahapan) => ({ ...t, seleksi_id: seleksi.id }))
      if (tahapanData.length > 0) await supabase.from('tahapan_seleksi').insert(tahapanData)

      toast.success('Seleksi berhasil dibuat!')
      router.push(`/seleksi/${seleksi.id}`)
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const JADWAL_FIELDS: Array<[keyof JadwalForm, string]> = [
    ['pendaftaran_mulai',  'Pendaftaran Dibuka'],
    ['pendaftaran_selesai','Pendaftaran Ditutup'],
    ['pengumuman_admin',   'Pengumuman Administrasi'],
    ['ukk',               'Tanggal UKK'],
    ['pengumuman_akhir',   'Pengumuman Akhir'],
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push('/kelola/seleksi')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <h1 className="text-2xl font-bold">Buat Seleksi Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold border-b border-border pb-3">Informasi Dasar</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Judul Seleksi <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('judul', e.target.value)}
              placeholder="cth: Seleksi Direksi Perumdam Among Tani 2025" className={inputCls} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Entitas <span className="text-red-500">*</span></label>
              <select value={form.entitas} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('entitas', e.target.value)} className={inputCls}>
                <option value="">Pilih...</option>
                <option value="BUMD">BUMD</option>
                <option value="BLUD">BLUD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Jenis <span className="text-red-500">*</span></label>
              <select value={form.jenis} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('jenis', e.target.value)} className={inputCls}>
                <option value="">Pilih...</option>
                {JENIS_SELEKSI.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('status', e.target.value)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="buka">Buka</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Kuota Posisi</label>
            <input type="number" min={1} value={form.kuota}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('kuota', parseInt(e.target.value) || 1)}
              className={`${inputCls} w-32`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Persyaratan Umum</label>
            <textarea value={form.persyaratan}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('persyaratan', e.target.value)}
              rows={4} placeholder="Tuliskan persyaratan umum seleksi..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>

        {/* Jadwal */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold border-b border-border pb-3">Jadwal Seleksi</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {JADWAL_FIELDS.map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input type="date" value={form.jadwal[k]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJadwal(k, e.target.value)}
                  className={inputCls} />
              </div>
            ))}
          </div>
        </div>

        {/* Tahapan */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold">Tahapan Seleksi</h2>
            <button type="button" onClick={addTahapan}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Tambah Tahap
            </button>
          </div>
          <div className="space-y-3">
            {tahapan.map((t: Tahapan, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{t.urutan}</span>
                <input value={t.nama_tahap}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTahapanField(i, 'nama_tahap', e.target.value)}
                  placeholder="Nama tahapan"
                  className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="date" value={t.tanggal_mulai}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTahapanField(i, 'tanggal_mulai', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none w-36" />
                <input type="date" value={t.tanggal_selesai}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTahapanField(i, 'tanggal_selesai', e.target.value)}
                  className="h-9 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none w-36" />
                <button type="button" onClick={() => removeTahapan(i)}
                  className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/kelola/seleksi')}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors">Batal</button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Buat Seleksi
          </button>
        </div>
      </form>
    </div>
  )
}
