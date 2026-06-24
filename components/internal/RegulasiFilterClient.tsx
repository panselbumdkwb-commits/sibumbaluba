'use client'

import { useState } from 'react'
import { Search, FileText, Download, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Regulasi {
  id: string; judul: string; nomor: string | null; tahun: number | null
  is_active: boolean; file_url: string | null; created_at: string
  kategori: { nama: string } | null
}

interface Props {
  regulasi: Regulasi[]
  kategori: Array<{ id: string; nama: string }>
}

export default function RegulasiFilterClient({ regulasi: initial, kategori }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterKat, setFilterKat] = useState('')

  const filtered = initial.filter(r => {
    const matchSearch = r.judul.toLowerCase().includes(search.toLowerCase()) ||
      (r.nomor ?? '').toLowerCase().includes(search.toLowerCase())
    const matchKat = !filterKat || r.kategori?.nama === filterKat
    return matchSearch && matchKat
  })

  async function handleDelete(id: string) {
    if (!confirm('Hapus regulasi ini?')) return
    const supabase = createClient()
    const { error } = await supabase.from('regulasi').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); return }
    toast.success('Regulasi dihapus')
    router.refresh()
  }

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul atau nomor regulasi..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={filterKat} onChange={e => setFilterKat(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
          <option value="">Semua Kategori</option>
          {kategori.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {['Judul', 'Nomor', 'Tahun', 'Kategori', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Tidak ada data regulasi
              </td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium line-clamp-2 max-w-xs">{r.judul}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.nomor ?? '-'}</td>
                <td className="px-4 py-3 text-xs">{r.tahun ?? '-'}</td>
                <td className="px-4 py-3">
                  {r.kategori && <Badge variant="outline" className="text-xs">{r.kategori.nama}</Badge>}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Link href={`/regulasi/kelola/edit/${r.id}`}
                      className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(r.id)}
                      className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-red-100 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
        Menampilkan {filtered.length} dari {initial.length} regulasi
      </div>
    </div>
  )
}
