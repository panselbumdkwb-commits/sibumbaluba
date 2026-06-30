import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Calendar, Users, FileText, ArrowRight, ArrowLeft, Clock, MapPin, Building2 } from 'lucide-react'
import type { Seleksi, TahapanSeleksi } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

async function getSeleksi(id: string) {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('seleksi')
    .select('*')
    .eq('id', id)
    .in('status', ['buka', 'tutup', 'selesai'])
    .single()
  return data as Seleksi | null
}

async function getTahapan(seleksiId: string) {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('tahapan_seleksi')
    .select('*')
    .eq('seleksi_id', seleksiId)
    .order('urutan', { ascending: true })
  return (data ?? []) as TahapanSeleksi[]
}

async function getEntitasNama(entitas: string, entitasId: string | null) {
  if (!entitasId) return null
  const supabase = await createServerComponentClient()
  if (entitas === 'BUMD') {
    const { data } = await supabase.from('bumd').select('nama').eq('id', entitasId).single()
    return data?.nama ?? null
  }
  const { data } = await supabase.from('blud').select('nama').eq('id', entitasId).single()
  return data?.nama ?? null
}

const TAHAP_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  belum:    { color: 'bg-gray-100 text-gray-500',    label: 'Belum Dimulai' },
  berjalan: { color: 'bg-blue-100 text-blue-700',    label: 'Sedang Berjalan' },
  selesai:  { color: 'bg-green-100 text-green-700',  label: 'Selesai' },
}

export default async function SeleksiDetailPage({ params }: Props) {
  const { id } = await params
  const seleksi = await getSeleksi(id)

  if (!seleksi) notFound()

  const [tahapan, entitasNama] = await Promise.all([
    getTahapan(id),
    getEntitasNama(seleksi.entitas, seleksi.entitas_id),
  ])

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/seleksi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Seleksi
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                {seleksi.entitas}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-semibold">
                {seleksi.jenis}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{seleksi.judul}</h1>
            {entitasNama && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                <Building2 className="h-4 w-4" /> {entitasNama}
              </div>
            )}
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-semibold shrink-0 ${getStatusColor(seleksi.status)}`}>
            {seleksi.status === 'buka' ? '🟢 Pendaftaran Dibuka' : seleksi.status === 'tutup' ? '🟡 Pendaftaran Ditutup' : '✅ Seleksi Selesai'}
          </span>
        </div>

        {/* Quick info */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Kuota</div>
              <div className="font-semibold text-sm">{seleksi.kuota} posisi</div>
            </div>
          </div>
          {seleksi.jadwal?.pendaftaran_selesai && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Batas Pendaftaran</div>
                <div className="font-semibold text-sm">{formatDate(seleksi.jadwal.pendaftaran_selesai)}</div>
              </div>
            </div>
          )}
          {seleksi.pengumuman_url && (
            <a href={seleksi.pengumuman_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Dokumen</div>
                <div className="font-semibold text-sm text-primary group-hover:underline flex items-center gap-1">
                  Lihat Pengumuman <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Persyaratan */}
      {seleksi.persyaratan && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Persyaratan
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {seleksi.persyaratan}
          </p>
        </div>
      )}

      {/* Jadwal Lengkap */}
      {seleksi.jadwal && Object.values(seleksi.jadwal).some(v => v) && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Jadwal Tahapan
          </h2>
          <div className="space-y-3">
            {[
              { key: 'pendaftaran_mulai',   label: 'Pendaftaran Dibuka' },
              { key: 'pendaftaran_selesai', label: 'Pendaftaran Ditutup' },
              { key: 'verifikasi_mulai',    label: 'Verifikasi Dokumen Dimulai' },
              { key: 'verifikasi_selesai',  label: 'Verifikasi Dokumen Selesai' },
              { key: 'pengumuman_admin',    label: 'Pengumuman Lulus Administrasi' },
              { key: 'ukk',                 label: 'Pelaksanaan Uji Kelayakan & Kepatutan' },
              { key: 'pengumuman_akhir',    label: 'Pengumuman Hasil Akhir' },
            ].map(({ key, label }) => {
              const val = seleksi.jadwal?.[key as keyof typeof seleksi.jadwal]
              if (!val) return null
              return (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold">{formatDate(val)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tahapan Seleksi (dari tabel tahapan_seleksi) */}
      {tahapan.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Tahapan Seleksi
          </h2>
          <div className="space-y-3">
            {tahapan.map((t, i) => {
              const cfg = TAHAP_STATUS_CONFIG[t.status] ?? TAHAP_STATUS_CONFIG['belum']
              return (
                <div key={t.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${cfg.color}`}>
                      {i + 1}
                    </div>
                    {i < tahapan.length - 1 && <div className="w-px h-10 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{t.nama_tahap}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {(t.tanggal_mulai || t.tanggal_selesai) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.tanggal_mulai && formatDate(t.tanggal_mulai)}
                        {t.tanggal_selesai && t.tanggal_mulai !== t.tanggal_selesai ? ` – ${formatDate(t.tanggal_selesai)}` : ''}
                      </div>
                    )}
                    {t.lokasi && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {t.lokasi}
                      </div>
                    )}
                    {t.keterangan && (
                      <p className="text-xs text-muted-foreground mt-1">{t.keterangan}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA Daftar */}
      {seleksi.status === 'buka' && (
        <div className="bg-primary rounded-2xl p-6 sm:p-8 text-center text-primary-foreground">
          <h3 className="font-bold text-lg mb-2">Tertarik mengikuti seleksi ini?</h3>
          <p className="text-sm text-primary-foreground/80 mb-5">
            Daftarkan diri Anda sekarang melalui Portal Peserta
          </p>
          <Link href="/portal-peserta/daftar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors">
            Daftar Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
