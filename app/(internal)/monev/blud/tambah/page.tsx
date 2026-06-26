'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'

const PERIODE_OPTIONS = [
  'TW1-2025','TW2-2025','TW3-2025','TW4-2025','TAHUNAN-2025',
  'TW1-2024','TW2-2024','TW3-2024','TW4-2024','TAHUNAN-2024',
]
const AKREDITASI_OPTIONS = ['Paripurna','Utama','Madya','Dasar','Belum Terakreditasi']
const SPM_INDIKATOR = [
  'Pelayanan Kesehatan Ibu Hamil','Pelayanan Kesehatan Ibu Bersalin',
  'Pelayanan Kesehatan Bayi Baru Lahir','Pelayanan Kesehatan Balita',
  'Pelayanan Usia Pendidikan Dasar','Pelayanan Usia Produktif',
  'Pelayanan Usia Lanjut','Pelayanan Penderita Hipertensi',
  'Pelayanan Penderita Diabetes Melitus','Pelayanan ODGJ',
  'Pelayanan TB','Pelayanan HIV',
]

interface SectionProps { title: string; children?: JSX.Element | JSX.Element[] | React.ReactNode }
function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="font-bold text-base border-b border-border pb-3">{title}</h2>
      {children}
    </div>
  )
}

interface BludOption { id: string; nama: string }

function TambahMonevBludInner() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultBludId = params.get('blud_id') ?? ''

  const [loading, setLoading] = useState(false)
  const [bludList, setBludList] = useState<BludOption[]>([])
  const [bludLoaded, setBludLoaded] = useState(false)

  const [form, setForm] = useState({
    blud_id: defaultBludId,
    periode: '',
    status: 'draft' as 'draft' | 'submitted',
    catatan: '',
    rba: { pagu: '', realisasi: '' },
    akreditasi: { status: '', tahun: '', masa_berlaku: '', catatan: '' },
    spm: SPM_INDIKATOR.map(ind => ({ indikator: ind, target: '100', capaian: '', keterangan: '' })),
  })

  async function loadBlud() {
    if (bludLoaded) return
    const supabase = createClient()
    const { data } = await supabase.from('blud').select('id, nama').eq('is_active', true).order('nama')
    setBludList(data ?? [])
    setBludLoaded(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.blud_id || !form.periode) { toast.error('BLUD dan periode wajib dipilih'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const n = (v: string) => v === '' ? null : parseFloat(v)

      const pagu = parseFloat(form.rba.pagu || '0')
      const realisasi = parseFloat(form.rba.realisasi || '0')
      const persentase = pagu > 0 ? Math.round((realisasi / pagu) * 10000) / 100 : null

      const { error } = await supabase.from('monev_blud').insert({
        blud_id: form.blud_id,
        periode: form.periode,
        status: form.status,
        catatan: form.catatan || null,
        rba: { pagu: n(form.rba.pagu), realisasi: n(form.rba.realisasi), persentase },
        laporan_keuangan: {},
        laporan_kinerja: {},
        akreditasi: {
          status: form.akreditasi.status,
          tahun: form.akreditasi.tahun,
          masa_berlaku: form.akreditasi.masa_berlaku,
          catatan: form.akreditasi.catatan,
        },
        spm: form.spm.map(s => ({
          indikator: s.indikator,
          target: n(s.target),
          capaian: n(s.capaian),
          keterangan: s.keterangan,
        })),
      })
      if (error) { toast.error(error.message); return }
      toast.success('Data monev BLUD berhasil disimpan!')
      router.push('/monev/blud')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  const pagu = parseFloat(form.rba.pagu || '0')
  const realisasi = parseFloat(form.rba.realisasi || '0')
  const persentase = pagu > 0 ? ((realisasi / pagu) * 100).toFixed(2) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push('/monev/blud')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <h1 className="text-2xl font-bold">Input Monitoring & Evaluasi BLUD</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas */}
        <Section title="Identitas Data">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">BLUD (Puskesmas) <span className="text-red-500">*</span></label>
              <select value={form.blud_id}
                onChange={e => setForm(f => ({ ...f, blud_id: e.target.value }))}
                onFocus={loadBlud}
                className={inputCls}>
                <option value="">-- Pilih BLUD --</option>
                {bludList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Periode <span className="text-red-500">*</span></label>
              <select value={form.periode}
                onChange={e => setForm(f => ({ ...f, periode: e.target.value }))}
                className={inputCls}>
                <option value="">Pilih...</option>
                {PERIODE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'submitted' }))}
              className={inputCls}>
              <option value="draft">Draft</option>
              <option value="submitted">Submit ke Verifikasi</option>
            </select>
          </div>
        </Section>

        {/* RBA */}
        <Section title="Rencana Bisnis Anggaran (RBA)">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pagu Anggaran (Rp)</label>
              <input type="number" value={form.rba.pagu}
                onChange={e => setForm(f => ({ ...f, rba: { ...f.rba, pagu: e.target.value } }))}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Realisasi Anggaran (Rp)</label>
              <input type="number" value={form.rba.realisasi}
                onChange={e => setForm(f => ({ ...f, rba: { ...f.rba, realisasi: e.target.value } }))}
                placeholder="0" className={inputCls} />
            </div>
          </div>
          {persentase && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-sm">
              <span className="text-muted-foreground">Persentase Realisasi: </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{persentase}%</span>
            </div>
          )}
        </Section>

        {/* Akreditasi */}
        <Section title="Status Akreditasi">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status Akreditasi</label>
              <select value={form.akreditasi.status}
                onChange={e => setForm(f => ({ ...f, akreditasi: { ...f.akreditasi, status: e.target.value } }))}
                className={inputCls}>
                <option value="">Pilih...</option>
                {AKREDITASI_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tahun Akreditasi</label>
              <input type="text" value={form.akreditasi.tahun}
                onChange={e => setForm(f => ({ ...f, akreditasi: { ...f.akreditasi, tahun: e.target.value } }))}
                placeholder="cth: 2023" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Masa Berlaku s/d</label>
              <input type="date" value={form.akreditasi.masa_berlaku}
                onChange={e => setForm(f => ({ ...f, akreditasi: { ...f.akreditasi, masa_berlaku: e.target.value } }))}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Catatan</label>
              <input type="text" value={form.akreditasi.catatan}
                onChange={e => setForm(f => ({ ...f, akreditasi: { ...f.akreditasi, catatan: e.target.value } }))}
                placeholder="Catatan akreditasi" className={inputCls} />
            </div>
          </div>
        </Section>

        {/* SPM */}
        <Section title="Capaian Standar Pelayanan Minimal (SPM)">
          <p className="text-xs text-muted-foreground -mt-2">Target default 100%. Isi kolom Capaian (%) untuk masing-masing indikator.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-8">No</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Indikator SPM</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Target (%)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-24">Capaian (%)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {form.spm.map((s, i) => (
                  <tr key={s.indikator} className="border-b border-border/50">
                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 text-xs">{s.indikator}</td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="100" value={s.target}
                        onChange={e => setForm(f => ({
                          ...f, spm: f.spm.map((sp, idx) => idx === i ? { ...sp, target: e.target.value } : sp)
                        }))}
                        className="w-20 h-8 px-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="100" value={s.capaian}
                        onChange={e => setForm(f => ({
                          ...f, spm: f.spm.map((sp, idx) => idx === i ? { ...sp, capaian: e.target.value } : sp)
                        }))}
                        className={`w-20 h-8 px-2 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                          s.capaian && parseFloat(s.capaian) < parseFloat(s.target)
                            ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
                            : 'border-input bg-background'
                        }`} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={s.keterangan}
                        onChange={e => setForm(f => ({
                          ...f, spm: f.spm.map((sp, idx) => idx === i ? { ...sp, keterangan: e.target.value } : sp)
                        }))}
                        placeholder="Keterangan (opsional)"
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Catatan */}
        <Section title="Catatan Umum">
          <textarea value={form.catatan}
            onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={3}
            placeholder="Catatan atau keterangan tambahan..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </Section>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/monev/blud')}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Data Monev
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TambahMonevBlud() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <TambahMonevBludInner />
    </Suspense>
  )
}
