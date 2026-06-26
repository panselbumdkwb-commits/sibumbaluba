'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

const PERIODE_OPTIONS = [
  'TW1-2025','TW2-2025','TW3-2025','TW4-2025','TAHUNAN-2025',
  'TW1-2024','TW2-2024','TW3-2024','TW4-2024','TAHUNAN-2024',
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

interface FieldProps {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string
}
function Field({ label, value, onChange, type = 'number', placeholder = '' }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

interface BumdOption { id: string; nama: string; singkatan: string | null }

export default function TambahMonevBumd() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultBumdId = params.get('bumd_id') ?? ''

  const [loading, setLoading] = useState(false)
  const [bumdList, setBumdList] = useState<BumdOption[]>([])
  const [bumdLoaded, setBumdLoaded] = useState(false)

  const [form, setForm] = useState({
    bumd_id: defaultBumdId,
    periode: '',
    status: 'draft' as 'draft' | 'submitted',
    catatan: '',
    rkap: { pendapatan_target: '', pendapatan_realisasi: '', laba_target: '', laba_realisasi: '', capex_target: '', capex_realisasi: '' },
    rasio: { roi: '', roe: '', npm: '', current_ratio: '', debt_ratio: '' },
    gcg: { nilai: '', kategori: '', catatan: '' },
    spi: { nilai: '', temuan: '', rekomendasi: '' },
  })

  async function loadBumd() {
    if (bumdLoaded) return
    const supabase = createClient()
    const { data } = await supabase.from('bumd').select('id, nama, singkatan').eq('is_active', true).order('nama')
    setBumdList(data ?? [])
    setBumdLoaded(true)
  }

  function setRkap(k: string, v: string) { setForm(f => ({ ...f, rkap: { ...f.rkap, [k]: v } })) }
  function setRasio(k: string, v: string) { setForm(f => ({ ...f, rasio: { ...f.rasio, [k]: v } })) }
  function setGcg(k: string, v: string)  { setForm(f => ({ ...f, gcg:  { ...f.gcg,  [k]: v } })) }
  function setSpi(k: string, v: string)  { setForm(f => ({ ...f, spi:  { ...f.spi,  [k]: v } })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.bumd_id || !form.periode) { toast.error('BUMD dan periode wajib dipilih'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const n = (v: string) => v === '' ? null : parseFloat(v)
      const i = (v: string) => v === '' ? null : parseInt(v)

      const { error } = await supabase.from('monev_bumd').insert({
        bumd_id: form.bumd_id,
        periode: form.periode,
        status: form.status,
        catatan: form.catatan || null,
        rkap: {
          pendapatan_target: n(form.rkap.pendapatan_target),
          pendapatan_realisasi: n(form.rkap.pendapatan_realisasi),
          laba_target: n(form.rkap.laba_target),
          laba_realisasi: n(form.rkap.laba_realisasi),
          capex_target: n(form.rkap.capex_target),
          capex_realisasi: n(form.rkap.capex_realisasi),
        },
        rasio_kinerja: {
          roi: n(form.rasio.roi), roe: n(form.rasio.roe), npm: n(form.rasio.npm),
          current_ratio: n(form.rasio.current_ratio), debt_ratio: n(form.rasio.debt_ratio),
        },
        gcg: { nilai: n(form.gcg.nilai), kategori: form.gcg.kategori, catatan: form.gcg.catatan },
        spi: { nilai: n(form.spi.nilai), temuan: i(form.spi.temuan), rekomendasi: i(form.spi.rekomendasi) },
        laporan_keuangan: {},
      })
      if (error) { toast.error(error.message); return }
      toast.success('Data monev BUMD berhasil disimpan!')
      router.push('/monev/bumd')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push('/monev/bumd')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <h1 className="text-2xl font-bold">Input Monitoring & Evaluasi BUMD</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas */}
        <Section title="Identitas Data">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">BUMD <span className="text-red-500">*</span></label>
              <select value={form.bumd_id}
                onChange={e => setForm(f => ({ ...f, bumd_id: e.target.value }))}
                onFocus={loadBumd}
                className={inputCls}>
                <option value="">-- Pilih BUMD --</option>
                {bumdList.map(b => <option key={b.id} value={b.id}>{b.singkatan ?? b.nama}</option>)}
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

        {/* RKAP */}
        <Section title="Data RKAP (dalam Rupiah)">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Pendapatan Target" value={form.rkap.pendapatan_target} onChange={v => setRkap('pendapatan_target', v)} placeholder="0" />
            <Field label="Pendapatan Realisasi" value={form.rkap.pendapatan_realisasi} onChange={v => setRkap('pendapatan_realisasi', v)} placeholder="0" />
            <Field label="Laba Target" value={form.rkap.laba_target} onChange={v => setRkap('laba_target', v)} placeholder="0" />
            <Field label="Laba Realisasi" value={form.rkap.laba_realisasi} onChange={v => setRkap('laba_realisasi', v)} placeholder="0" />
            <Field label="CapEx Target" value={form.rkap.capex_target} onChange={v => setRkap('capex_target', v)} placeholder="0" />
            <Field label="CapEx Realisasi" value={form.rkap.capex_realisasi} onChange={v => setRkap('capex_realisasi', v)} placeholder="0" />
          </div>
        </Section>

        {/* Rasio */}
        <Section title="Rasio Kinerja (%)">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="ROI (%)" value={form.rasio.roi} onChange={v => setRasio('roi', v)} placeholder="0.00" />
            <Field label="ROE (%)" value={form.rasio.roe} onChange={v => setRasio('roe', v)} placeholder="0.00" />
            <Field label="NPM (%)" value={form.rasio.npm} onChange={v => setRasio('npm', v)} placeholder="0.00" />
            <Field label="Current Ratio" value={form.rasio.current_ratio} onChange={v => setRasio('current_ratio', v)} placeholder="0.00" />
            <Field label="Debt Ratio" value={form.rasio.debt_ratio} onChange={v => setRasio('debt_ratio', v)} placeholder="0.00" />
          </div>
        </Section>

        {/* GCG */}
        <Section title="Good Corporate Governance (GCG)">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nilai GCG (0-100)" value={form.gcg.nilai} onChange={v => setGcg('nilai', v)} placeholder="0" />
            <div>
              <label className="block text-sm font-medium mb-1.5">Kategori</label>
              <select value={form.gcg.kategori} onChange={e => setGcg('kategori', e.target.value)} className={inputCls}>
                <option value="">Pilih...</option>
                {['Sangat Baik','Baik','Cukup Baik','Kurang','Tidak Baik'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <Field label="Catatan GCG" value={form.gcg.catatan} onChange={v => setGcg('catatan', v)} type="text" placeholder="Catatan singkat" />
          </div>
        </Section>

        {/* SPI */}
        <Section title="Satuan Pengawasan Internal (SPI)">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nilai SPI (0-100)" value={form.spi.nilai} onChange={v => setSpi('nilai', v)} placeholder="0" />
            <Field label="Jumlah Temuan" value={form.spi.temuan} onChange={v => setSpi('temuan', v)} placeholder="0" />
            <Field label="Jumlah Rekomendasi" value={form.spi.rekomendasi} onChange={v => setSpi('rekomendasi', v)} placeholder="0" />
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
          <button type="button" onClick={() => router.push('/monev/bumd')}
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
