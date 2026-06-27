import Link from 'next/link'
import { Bell, ArrowRight, FileText, Calendar, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Pengumuman } from '@/lib/types'

interface Props { pengumuman: Pengumuman[] }

const KATEGORI_STYLE: Record<string, string> = {
  seleksi: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  monev:   'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  umum:    'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',
}

export default function PengumumanList({ pengumuman }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pengumuman Terbaru</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Informasi dan pemberitahuan resmi</p>
        </div>
        <Link href="/pengumuman"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
          Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {pengumuman.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada pengumuman</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Cek kembali nanti</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pengumuman.map((p, i) => (
            <div key={p.id}
              className="group relative flex gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              {/* Number badge */}
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {p.judul}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.created_at)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${KATEGORI_STYLE[p.kategori] ?? KATEGORI_STYLE.umum}`}>
                    <Tag className="h-2.5 w-2.5" />
                    {p.kategori}
                  </span>
                </div>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground/30 shrink-0 self-start mt-0.5 group-hover:text-primary/40 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
