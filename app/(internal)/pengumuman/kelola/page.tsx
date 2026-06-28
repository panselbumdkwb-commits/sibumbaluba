'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Bell, Loader2, Save, X, Upload, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface PengumumanRow {
  id: string; judul: string; isi: string | null
  kategori: string; is_publik: boolean; file_url: string | null; created_at: string
}
interface FormState {
  judul: string; isi: string; kategori: string; is_publik: boolean
}

const KATEGORI_OPTIONS = ['umum','seleksi','monev','regulasi','sop'] as const
const KATEGORI_COLOR: Record<string, string> = {
  umum: 'bg-gray-100 text-gray-700', seleksi: 'bg-purple-100 text-purple-700',
  monev: 'bg-blue-100 text-blue-700', regulasi: 'bg-red-100 text-red-700', sop: 'bg-teal-100 text-teal-700',
}
const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png'

export default function PengumumanKelolaPage() {
  const [list, setList] = useState<PengumumanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ judul: '', isi: '', kategori: 'umum', is_publik: false })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('pengumuman').select('*').order('created_at', { ascending: false })
    setList((data as PengumumanRow[]) ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm({ judul: '', isi: '', kategori: 'umum', is_publik: false })
    setFile(null)
    setShowForm(true)
  }

  function openEdit(p: PengumumanRow) {
    setEditId(p.id)
    setForm({ judul: p.judul, isi: p.isi ?? '', kategori: p.kategori, is_publik: p.is_publik })
    setFile(null)
    setShowForm(true)
  }

  async function uploadFile(): Promise<string | null> {
    if (!file) return null
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `pengumuman/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('pengumuman-files').upload(path, file, { upsert: true })
      if (error) { toast.error('Gagal upload file: ' + error.message); return null }
      const { data } = supabase.storage.from('pengumuman-files').getPublicUrl(path)
      return data.publicUrl
    } finally { setUploading(false) }
  }

  async function handleSave() {
    if (!form.judul.trim()) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      let file_url: string | null | undefined = undefined
      if (file) {
        const url = await uploadFile()
        if (!url) return
        file_url = url
      }
      const payload: Record<string, unknown> = {
        judul: form.judul, isi: form.isi || null,
        kategori: form.kategori, is_publik: form.is_publik,
      }
      if (file_url !== undefined) payload.file_url = file_url

      if (editId) {
        const { error } = await supabase.from('pengumuman').update(payload).eq('id', editId)
        if (error) { toast.error(error.message); return }
        toast.success('Pengumuman diperbarui')
      } else {
        const { error } = await supabase.from('pengumuman').insert(payload)
        if (error) { toast.error(error.message); return }
        toast.success('Pengumuman dibuat')
      }
      setShowForm(false)
      setFile(null)
      loadData()
    } finally { setSaving(false) }
  }

  async function togglePublik(id: string, current: boolean) {
    await supabase.from('pengumuman').update({ is_publik: !current }).eq('id', id)
    setList(prev => prev.map(p => p.id === id ? { ...p, is_publik: !current } : p))
    toast.success(!current ? 'Dipublikasikan' : 'Disembunyikan')
  }

  async function handleDelete(id: string, file_url: string | null) {
    if (!confirm('Hapus pengumuman ini?')) return
    if (file_url) {
      const path = file_url.split('/pengumuman-files/')[1]
      if (path) await supabase.storage.from('pengumuman-files').remove([path])
    }
    const { error } = await supabase.from('pengumuman').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); return }
    setList(prev => prev.filter(p => p.id !== id))
    toast.success('Pengumuman dihapus')
  }

  const inputCls = 'w-full px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Pengumuman</h1>
          <p className="text-sm text-muted-foreground mt-1">{list.length} pengumuman</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
              <h2 className="font-bold text-lg">{editId ? 'Edit' : 'Buat'} Pengumuman</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Judul <span className="text-red-500">*</span></label>
                <input value={form.judul}
                  onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                  placeholder="Judul pengumuman" className={`${inputCls} h-10`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Isi Pengumuman</label>
                <textarea value={form.isi}
                  onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
                  rows={4} placeholder="Isi pengumuman..."
                  className={`${inputCls} py-2 resize-none`} />
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Lampiran File <span className="text-xs text-muted-foreground font-normal">(PDF, Word, JPG, PNG — maks. 10MB)</span>
                </label>
                <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">{file ? file.name : 'Klik untuk pilih file'}</span>
                </button>
                {file && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-muted text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kategori</label>
                  <select value={form.kategori}
                    onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                    className={`${inputCls} h-10`}>
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k} className="capitalize">{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Visibilitas</label>
                  <label className="flex items-center gap-3 h-10 cursor-pointer">
                    <div className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.is_publik ? 'bg-primary' : 'bg-muted'}`}
                      onClick={() => setForm(f => ({ ...f, is_publik: !f.is_publik }))}>
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_publik ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm">{form.is_publik ? '🌐 Publik' : '🔒 Internal'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0 justify-end">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {(saving || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {uploading ? 'Mengupload...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p className="font-semibold">Belum ada pengumuman</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Judul','Kategori','File','Visibilitas','Tanggal','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium line-clamp-1 max-w-xs">{p.judul}</div>
                    {p.isi && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.isi}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${KATEGORI_COLOR[p.kategori] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.file_url ? (
                      <a href={p.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Download className="h-3 w-3" /> Unduh
                      </a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${p.is_publik ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {p.is_publik ? '🌐 Publik' : '🔒 Internal'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => togglePublik(p.id, p.is_publik)}
                        title={p.is_publik ? 'Sembunyikan' : 'Publikasikan'}
                        className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${p.is_publik ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-600' : 'border-border hover:bg-accent text-muted-foreground'}`}>
                        {p.is_publik ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent text-muted-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.file_url)}
                        className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
