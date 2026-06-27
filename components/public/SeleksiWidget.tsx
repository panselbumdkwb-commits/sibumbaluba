'use client'

import Link from 'next/link'
import { Users, Calendar, ArrowRight } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Seleksi } from '@/lib/types'

interface Props { seleksi: Seleksi[] }

export default function SeleksiWidget({ seleksi }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-bold">Seleksi Aktif</h2>
        </div>
        <Link href="/kelola/seleksi"
          className="text-sm text-primary flex items-center gap-1 hover:underline">
          Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {seleksi.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Tidak ada seleksi aktif</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seleksi.map((s) => (
            <div key={s.id}
              className="p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-secondary/30 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
                  {s.judul}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${getStatusColor(s.status)}`}>
                  {s.status === 'buka' ? '🟢 Buka' : s.status === 'tutup' ? '🟡 Tutup' : s.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="px-2 py-0.5 rounded bg-muted font-medium">{s.entitas}</span>
                <span>•</span>
                <span>{s.jenis}</span>
              </div>
              {s.jadwal?.pendaftaran_selesai && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                  <Calendar className="h-3 w-3" />
                  Tutup: {formatDate(s.jadwal.pendaftaran_selesai)}
                </div>
              )}
              {s.status === 'buka' && (
                <Link href={`/seleksi?daftar=${s.id}`}
                  className="mt-3 block w-full text-center py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Daftar Sekarang →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
