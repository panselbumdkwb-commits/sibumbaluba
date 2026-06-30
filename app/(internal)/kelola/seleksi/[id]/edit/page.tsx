'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'

const JENIS_SELEKSI = ['Direksi','Dewan Pengawas','Dewas','Direktur','Komisaris','lainnya'] as const

interface Tahapan {
  id?: string
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

const EMPTY_FORM: FormState = {
  judul: '', jenis: '', entitas: '', status: 'draft', persyaratan: '', kuota: 1,
  jadwal: { pendaftaran_mulai: '', pendaftaran_selesai: '', pengumuman_admin: '', ukk: '', pengumuman_akhir: '' },
}

export default function SeleksiEdit() {
  const router = useRouter()
  const params = useParams()
  const seleksiId = params.id as string

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [tahapan, setTahapan] = useState<Tahapan[]>([])
  const [deletedTahapanIds, setDeletedTahapanIds] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const [seleksiRes, tahapanRes] = await Promise.all([
        supabase.from('seleksi').select('*').eq('id', seleksiId).single(),
        supabase.from('tahapan_seleksi').select('*').eq('seleksi_id', seleksiId).order('urutan'),
      ])

      if (seleksiRes.error || !seleksiRes.data) {
        toast.error('Seleksi tidak ditemukan')
        router.push('/kelola/seleksi')
        return
      }

      const s = seleksiRes.data
      setForm({
        judul: s.judul ?? '',
        jenis: s.jenis ?? '',
        entitas: s.entitas ?? '',
        status: s.status ?? 'draft',
        persyaratan: s.persyaratan ?? '',
        kuota: s.kuota ?? 1,
        jadwal: {
          pendaftaran_mulai:   s.jadwal?.pendaftaran_mulai ?? '',
          pendaftaran_selesai: s.jadwal?.pendaftaran_selesai ?? '',
          pengumuman_admin:    s.jadwal?.pengumuman_admin ?? '',
          ukk:                 s.jadwal?.ukk ?? '',
          pengumuman_akhir:    s.jadwal?.pengumuman_akhir ?? '',
        },
      })

      const tahapanData = (tahapanRes.data ?? []).map(t => ({
        id: t.id,
        nama_tahap: t.nama_tahap ?? '',
        urutan: t.urutan ?? 1,
        tanggal_mulai: t.tanggal_mulai ?? '',
        tanggal_selesai: t.tanggal_selesai ?? '',
      }))
      setTahapan(tahapanData.length > 0 ? tahapanData : [
        { nama_tahap: 'Seleksi Administrasi', urutan: 1, tanggal_mulai: '', tanggal_selesai: '' },
      ])

      setLoadingData(false)
    }
    loadData()
  }, [seleksiId, router])

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
    const target = tahapan[i]
    if (target.id) setDeletedTahapanIds(prev => [...prev, target.id!])
    setTahapan((prev: Tahapan[]) => prev.filter((_: Tahapan, idx: number) => idx !== i).map((t: Tahapan, idx: number) => ({ ...t, urutan: idx + 1 })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.judul || !form.jenis || !form.entitas) { toast.error('Judul, jenis, dan entitas wajib diisi'); return }
    setLoading(true)
    try {
      const supabase = createClient()

      // Update seleksi
      const { error: updateError } = await supabase
        .from('seleksi')
        .update({
          judul: form.judul, jenis: form.jenis, entitas: form.entitas,
          status: form.status, persyaratan: form.persyaratan,
          kuota: form.kuota, jadwal: form.jadwal,
        })
        .eq('id', seleksiId)

      if (updateError) { toast.error(updateError.message); return }

      // Hapus tahapan yang dihapus user
      if (deletedTahapanIds.length > 0) {
        await supabase.from('tahapan_seleksi').delete().in('id', deletedTahapanIds)
      }

      // Upsert tahapan (update yang ada id, insert yang baru)
      const tahapanToUpdate = tahapan.filter(t => t.id && t.nama_tahap.trim())
      const tahapanToInsert = tahapan.filter(t => !t.id && t.nama_tahap.trim())

      for (const t of tahapanToUpdate) {
        await supabase.from('tahapan_seleksi')
          .update({
            nama_tahap: t.nama_tahap, urutan: t.urutan,
            tanggal_mulai: t.tanggal_mulai || null,
            tanggal_selesai: t.tanggal_selesai || null,
          })
          .eq('id', t.id)
      }

      if (tahapanToInsert.length > 0) {
        await supabase.from('tahapan_seleksi').insert(
          tahapanToInsert.map(t => ({
            nama_tahap: t.nama_tahap, urutan: t.urutan,
            tanggal_mulai: t.tanggal_mulai || null,
            tanggal_selesai: t.tanggal_selesai || null,
            seleksi_id: seleksiId,
          }))
        )
      }

      toast.success('Seleksi berhasil diperbarui!')
      router.push(`/kelola/seleksi/${seleksiId}`)
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button type="button" onClick={() => router.push(`/kelola/seleksi/${seleksiId}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <h1 className="text-2xl font-bold">Edit Seleksi</h1>
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
                <option value="tutup">Tutup</option>
                <option value="selesai">Selesai</option>
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
              <div key={t.id ?? `new-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
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
          <button type="button" onClick={() => router.push(`/kelola/seleksi/${seleksiId}`)}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors">Batal</button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
