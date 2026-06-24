import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, BookOpen, Download, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function getData() {
  const supabase = await createServerComponentClient()
  const [sopRes, kategoriRes] = await Promise.all([
    supabase.from('sop').select('*, kategori:kategori_sop(nama, entitas)').order('created_at', { ascending: false }),
    supabase.from('kategori_sop').select('*').order('entitas').order('urutan'),
  ])
  return { sop: sopRes.data ?? [], kategori: kategoriRes.data ?? [] }
}

export default async function SopKelolaPage() {
  const { sop, kategori } = await getData()

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
                {['Kode', 'Judul SOP', 'Kategori', 'Entitas', 'Versi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sop.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Belum ada SOP</p>
                </td></tr>
              ) : sop.map((s: Record<string, unknown>) => (
                <tr key={s.id as string} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.kode as string ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium line-clamp-2 max-w-xs">{s.judul as string}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(s.kategori as { nama: string } | null)?.nama ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    {(s.kategori as { entitas: string } | null)?.entitas && (
                      <Badge variant="outline" className="text-xs">
                        {(s.kategori as { entitas: string }).entitas}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">v{s.versi as string}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.file_url && (
                        <a href={s.file_url as string} target="_blank" rel="noopener noreferrer"
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
