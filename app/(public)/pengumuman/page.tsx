import { createServerComponentClient } from '@/lib/supabase'
import { Bell, FileDown, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Pengumuman } from '@/lib/types'

async function getData() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('pengumuman')
    .select('*')
    .eq('is_publik', true)
    .order('created_at', { ascending: false })
  return (data ?? []) as Pengumuman[]
}

const KATEGORI_COLOR: Record<string, string> = {
  umum:     'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  seleksi:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  monev:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  regulasi: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  sop:      'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export default async function PengumumanPage() {
  const list = await getData()

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Bell className="h-3 w-3" /> Informasi & Pengumuman
        </div>
        <h1 className="text-3xl font-bold mb-2">Pengumuman</h1>
        <p className="text-muted-foreground max-w-xl">
          Informasi terkini seputar kegiatan BUMD, BLUD, seleksi, dan regulasi Kota Batu.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">Belum Ada Pengumuman</p>
          <p className="text-sm mt-1">Pantau terus halaman ini untuk informasi terbaru.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {list.map((p) => (
            <article
              key={p.id}
              className="border border-border bg-card rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${KATEGORI_COLOR[p.kategori] ?? KATEGORI_COLOR.umum}`}>
                      {p.kategori}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(p.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">
                    {p.judul}
                  </h2>

                  {/* Body */}
                  {p.isi && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {p.isi}
                    </p>
                  )}

                  {/* Lampiran */}
                  {p.file_url && (
                    <a
                      href={p.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      <FileDown className="h-4 w-4" />
                      Unduh Lampiran
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
