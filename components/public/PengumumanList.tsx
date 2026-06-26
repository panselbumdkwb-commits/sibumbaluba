import Link from 'next/link'
import { Bell, ArrowRight, FileText, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Pengumuman } from '@/lib/types'

interface Props { pengumuman: Pengumuman[] }

export default function PengumumanList({ pengumuman }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Pengumuman Terbaru</h2>
        </div>
        <Link href="/pengumuman"
          className="text-sm text-primary flex items-center gap-1 hover:underline">
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {pengumuman.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Belum ada pengumuman</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pengumuman.map((p) => (
            <div key={p.id}
              className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-primary/30 transition-all">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-foreground line-clamp-2">
                  {p.judul}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.created_at)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    p.kategori === 'seleksi' ? 'bg-purple-100 text-purple-700' :
                    p.kategori === 'monev'   ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {p.kategori}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
