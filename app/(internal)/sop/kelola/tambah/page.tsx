'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, Save, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

interface KategoriRow { id: string; nama: string; entitas: string }

export default function TambahSopPage() {
  const router = useRouter()
  const [kategoriList, setKategoriList] = useState<KategoriRow[]>([])
  const [form, setForm] = useState({ judul: '', kode: '', versi: '1.0', kategori_id: '', deskripsi: '' })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('kategori_sop').select('id,nama,entitas').order('urutan').then(({ data }) => {
      setKategoriList((data as KategoriRow[]) ?? [])
    })
  }, [])

  async function handleSave() {
    if (!form.judul.trim()) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      let file_url: string | null = null
      if (file) {
        const ext = file.name.split('.').pop()
        const path = `sop/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('sop-files').upload(path, file)
        if (uploadError) { toast.error('Gagal upload: ' + uploadError.message); return }
        const { data } = supabase.storage.from('sop-files').getPublicUrl(path)
        file_url = data.publicUrl
      }
      const { error } = await supabase.from('sop').insert({
        judul: form.judul,
        kode: form.kode || null,
        versi: form.versi || '1.0',
        kategori_id: form.kategori_id || null,
        deskripsi: form.deskripsi || null,
        file_url,
        is_active: true,
      })
      if (error) { toast.error(error.message); return }
      toast.success('SOP berhasil ditambahkan')
      router.push('/sop/kelola')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sop/kelola" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Tambah SOP</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload file PDF SOP BUMD/BLUD</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Judul SOP <span className="text-red-500">*</span></label>
          <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
            placeholder="Contoh: SOP Pengadaan Barang dan Jasa BUMD"
            className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Kode SOP</label>
            <input value={form.kode} onChange={e => setForm(f => ({ ...f, kode: e.target.value }))}
              placeholder="SOP-ADM-001" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Versi</label>
            <input value={form.versi} onChange={e => setForm(f => ({ ...f, versi: e.target.value }))}
              placeholder="1.0" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Kategori</label>
          <select value={form.kategori_id} onChange={e => setForm(f => ({ ...f, kategori_id: e.target.value }))}
            className={inputCls}>
            <option value="">Pilih Kategori...</option>
            {kategoriList.map(k => (
              <option key={k.id} value={k.id}>{k.nama} ({k.entitas})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
          <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
            rows={3} placeholder="Ringkasan isi SOP..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>

        {/* Upload PDF */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            File PDF <span className="text-xs text-muted-foreground font-normal">(maks. 10MB)</span>
          </label>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-sm font-medium">{file ? file.name : 'Klik untuk upload PDF'}</span>
            <span className="text-xs">Format: PDF</span>
          </button>
          {file && (
            <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-muted text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-red-500" />
                <span className="truncate max-w-[250px]">{file.name}</span>
                <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
              <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/sop/kelola"
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">
            Batal
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan SOP
          </button>
        </div>
      </div>
    </div>
  )
}
