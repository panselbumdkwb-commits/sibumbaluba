import { createServerComponentClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, BookOpen, Download, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface KategoriSop { nama: string; entitas: string }
interface SopRow {
  id: string; judul: string; kode: string | null; versi: string
  is_active: boolean; file_url: string | null
  kategori: KategoriSop | null
}

async function getData() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('sop')
    .select('id,judul,kode,versi,is_active,file_url,kategori:kategori_sop(nama,entitas)')
    .order('created_at', { ascending: false })
  return (data ?? []) as SopRow[]
}

export default async function SopKelolaPage() {
  const sop = await getData()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola SOP</h1>
          <p className="text-sm text-muted-foreground mt-1">{sop.length} SOP terdaftar</p>
        </div>
        <Link href="/sop/kelola/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Tambah SOP
        </Link>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Kode','Judul SOP','Kategori','Entitas','Versi','Status','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sop.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>Belum ada SOP</p>
                </td></tr>
              ) : sop.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.kode ?? '-'}</td>
                  <td className="px-4 py-3"><div className="font-medium line-clamp-2 max-w-xs">{s.judul}</div></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.kategori?.nama ?? '-'}</td>
                  <td className="px-4 py-3">
                    {s.kategori?.entitas && <Badge variant="outline" className="text-xs">{s.kategori.entitas}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">v{s.versi}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.file_url && (
                        <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                          className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent transition-colors">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Link href={`/sop/kelola/edit/${s.id}`}
                        className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-accent transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
