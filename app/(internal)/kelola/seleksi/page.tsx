import { createServerComponentClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Users, Calendar, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Seleksi } from '@/lib/types'

async function getSeleksi() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase.from('seleksi').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Seleksi[]
}

export default async function SeleksiInternalPage() {
  const seleksi = await getSeleksi()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Seleksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola proses seleksi Direksi & Dewas BUMD-BLUD</p>
        </div>
        <Link href="/kelola/seleksi/baru"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Buat Seleksi
        </Link>
      </div>

      {seleksi.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold text-muted-foreground">Belum Ada Seleksi</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Buat seleksi baru untuk memulai proses rekrutmen</p>
          <Link href="/kelola/seleksi/baru"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="h-4 w-4" /> Buat Seleksi Pertama
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seleksi.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-sm leading-tight flex-1">{s.judul}</h3>
                <Badge className={`text-xs shrink-0 ${getStatusColor(s.status)}`}>{s.status}</Badge>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{s.entitas} · {s.jenis} · Kuota: {s.kuota}</span>
                </div>
                {s.jadwal?.pendaftaran_selesai && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Tutup: {formatDate(s.jadwal.pendaftaran_selesai)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/kelola/seleksi/${s.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  <Eye className="h-3.5 w-3.5" /> Kelola
                </Link>
                <Link href={`/kelola/seleksi/${s.id}/edit`}
                  className="flex items-center justify-center h-8 px-3 rounded-lg border border-border hover:bg-accent text-xs transition-colors">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
