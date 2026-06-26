import { Suspense } from 'react'
import { createServerComponentClient } from '@/lib/supabase'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Calendar, Users, FileText, ArrowRight, Clock } from 'lucide-react'
import type { Seleksi } from '@/lib/types'
import FormRegistrasiSeleksi from '@/components/public/FormRegistrasiSeleksi'

async function getSeleksi() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('seleksi')
    .select('*')
    .in('status', ['buka', 'tutup', 'selesai'])
    .order('created_at', { ascending: false })
  return (data ?? []) as Seleksi[]
}

// Komponen kartu seleksi — di luar agar tidak ada masalah key prop
function SeleksiCard({ seleksi: s, showDaftar }: { seleksi: Seleksi; showDaftar?: boolean }) {
  return (
    <div id={s.id} className="border border-border bg-card rounded-xl p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-2">{s.judul}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{s.entitas}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{s.jenis}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${getStatusColor(s.status)}`}>
          {s.status === 'buka' ? '🟢 Buka' : s.status === 'tutup' ? '🟡 Ditutup' : '✅ Selesai'}
        </span>
      </div>

      {s.jadwal && (
        <div className="space-y-1.5 mb-4">
          {s.jadwal.pendaftaran_mulai && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>
                Pendaftaran: {formatDate(s.jadwal.pendaftaran_mulai)}
                {s.jadwal.pendaftaran_selesai ? ` – ${formatDate(s.jadwal.pendaftaran_selesai)}` : ''}
              </span>
            </div>
          )}
          {s.jadwal.pengumuman_akhir && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              <span>Pengumuman Akhir: {formatDate(s.jadwal.pengumuman_akhir)}</span>
            </div>
          )}
        </div>
      )}

      {s.persyaratan && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-semibold text-foreground mb-1">
            <FileText className="h-3 w-3" /> Persyaratan Umum
          </div>
          <p className="line-clamp-3">{s.persyaratan}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>Kuota: <strong className="text-foreground">{s.kuota} posisi</strong></span>
        {s.pengumuman_url && (
          <a href={s.pengumuman_url} target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1">
            Pengumuman <ArrowRight className="h-3 w-3" />
          </a>
        )}
      </div>

      {showDaftar && s.status === 'buka' && (
        <a href={`/seleksi?daftar=${s.id}`}
          className="block w-full text-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
          Daftar Sekarang →
        </a>
      )}
    </div>
  )
}

export default async function SeleksiPublikPage() {
  const seleksi = await getSeleksi()
  const aktif   = seleksi.filter(s => s.status === 'buka')
  const lainnya = seleksi.filter(s => s.status !== 'buka')

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Users className="h-3 w-3" /> Seleksi BUMD & BLUD Kota Batu
        </div>
        <h1 className="text-3xl font-bold mb-3">Informasi Seleksi</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Proses seleksi Direksi, Dewan Pengawas, dan Direktur BUMD-BLUD Kota Batu
          dilaksanakan secara transparan dan profesional.
        </p>
      </div>

      {/* Seleksi Aktif */}
      {aktif.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-xl font-bold">Seleksi Sedang Dibuka</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {aktif.map(s => (
              <div key={s.id}><SeleksiCard seleksi={s} showDaftar={true} /></div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat */}
      {lainnya.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-5">Riwayat Seleksi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lainnya.map(s => (
              <div key={s.id}><SeleksiCard seleksi={s} /></div>
            ))}
          </div>
        </div>
      )}

      {seleksi.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">Belum Ada Seleksi</h3>
          <p className="text-sm">Pantau terus halaman ini untuk informasi seleksi terbaru.</p>
        </div>
      )}

      <Suspense fallback={null}>
        <FormRegistrasiSeleksi seleksiAktif={aktif} />
      </Suspense>
    </div>
  )
}
