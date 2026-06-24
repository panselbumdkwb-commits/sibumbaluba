'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, Bell, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Pengumuman {
  id: string; judul: string; isi: string | null; kategori: string
  is_publik: boolean; file_url: string | null; created_at: string
}

const KATEGORI_OPTIONS = ['umum','seleksi','monev','regulasi','sop']

export default function PengumumanKelolaPage() {
  const router = useRouter()
  const [list, setList] = useState<Pengumuman[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ judul: '', isi: '', kategori: 'umum', is_publik: false })

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('pengumuman').select('*').order('created_at', { ascending: false })
    setList(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm({ judul: '', isi: '', kategori: 'umum', is_publik: false })
    setShowForm(true)
  }

  function openEdit(p: Pengumuman) {
    setEditId(p.id)
    setForm({ judul: p.judul, isi: p.isi ?? '', kategori: p.kategori, is_publik: p.is_publik })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.judul.trim()) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      if (editId) {
        const { error } = await supabase.from('pengumuman').update({
          judul: form.judul, isi: form.isi || null, kategori: form.kategori, is_publik: form.is_publik,
        }).eq('id', editId)
        if (error) { toast.error(error.message); return }
        toast.success('Pengumuman diperbarui')
      } else {
        const { error } = await supabase.from('pengumuman').insert({
          judul: form.judul, isi: form.isi || null, kategori: form.kategori, is_publik: form.is_publik,
        })
        if (error) { toast.error(error.message); return }
        toast.success('Pengumuman dibuat')
      }
      setShowForm(false)
      loadData()
    } finally { setSaving(false) }
  }

  async function togglePublik(id: string, current: boolean) {
    await supabase.from('pengumuman').update({ is_publik: !current }).eq('id', id)
    setList(prev => prev.map(p => p.id === id ? { ...p, is_publik: !current } : p))
    toast.success(!current ? 'Pengumuman dipublikasikan' : 'Pengumuman disembunyikan')
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    const { error } = await supabase.from('pengumuman').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); return }
    setList(prev => prev.filter(p => p.id !== id))
    toast.success('Pengumuman dihapus')
  }

  const KATEGORI_COLOR: Record<string, string> = {
    umum: 'bg-gray-100 text-gray-700',
    seleksi: 'bg-purple-100 text-purple-700',
    monev: 'bg-blue-100 text-blue-700',
    regulasi: 'bg-red-100 text-red-700',
    sop: 'bg-teal-100 text-teal-700',
  }

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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold text-lg">{editId ? 'Edit' : 'Buat'} Pengumuman</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Judul <span className="text-red-500">*</span></label>
                <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                  placeholder="Judul pengumuman"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Isi Pengumuman</label>
                <textarea value={form.isi} onChange={e => setForm(f => ({ ...f, isi: e.target.value }))} rows={5}
                  placeholder="Isi pengumuman..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kategori</label>
                  <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k} className="capitalize">{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Visibilitas</label>
                  <label className="flex items-center gap-3 h-10 cursor-pointer">
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${form.is_publik ? 'bg-primary' : 'bg-muted'}`}
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
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
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
                {['Judul', 'Kategori', 'Visibilitas', 'Tanggal', 'Aksi'].map(h => (
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
                      <button onClick={() => handleDelete(p.id)}
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
