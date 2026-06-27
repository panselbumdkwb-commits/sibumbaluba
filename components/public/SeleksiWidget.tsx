'use client'

import Link from 'next/link'
import { Users, Calendar, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Seleksi } from '@/lib/types'

interface Props { seleksi: Seleksi[] }

export default function SeleksiWidget({ seleksi }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Seleksi Aktif</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pendaftaran yang sedang berjalan</p>
        </div>
        <Link href="/seleksi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
          Semua <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {seleksi.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Tidak ada seleksi aktif</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Pantau pengumuman untuk info terbaru</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seleksi.map((s) => (
            <div key={s.id}
              className="rounded-xl border border-border bg-background p-5 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1">
                  {s.judul}
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold shrink-0 ${
                  s.status === 'buka'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {s.status === 'buka' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {s.status === 'buka' ? 'Buka' : 'Tutup'}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted font-medium text-muted-foreground">{s.entitas}</span>
                <span className="text-muted-foreground/40 text-[10px]">·</span>
                <span className="text-[11px] text-muted-foreground">{s.jenis}</span>
              </div>

              {/* Deadline */}
              {s.jadwal?.pendaftaran_selesai && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-600 dark:text-orange-400 mb-3">
                  <Calendar className="h-3 w-3" />
                  Tutup: {formatDate(s.jadwal.pendaftaran_selesai)}
                </div>
              )}

              {/* CTA */}
              {s.status === 'buka' && (
                <Link href={`/seleksi?daftar=${s.id}`}
                  className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-[hsl(213,85%,35%)] text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
                  Daftar Sekarang
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
