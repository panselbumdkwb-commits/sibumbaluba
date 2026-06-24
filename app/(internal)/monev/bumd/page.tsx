import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Building2, BarChart3, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor, formatRupiah } from '@/lib/utils'

async function getData() {
  const supabase = await createServerComponentClient()
  const [bumdRes, monevRes] = await Promise.all([
    supabase.from('bumd').select('*').eq('is_active', true).order('nama'),
    supabase.from('monev_bumd').select('*, bumd(nama, singkatan)').order('created_at', { ascending: false }).limit(20),
  ])
  return { bumd: bumdRes.data ?? [], monev: monevRes.data ?? [] }
}

export default async function MonevBumdPage() {
  const { bumd, monev } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring & Evaluasi BUMD</h1>
          <p className="text-sm text-muted-foreground mt-1">Pemantauan kinerja BUMD Kota Batu</p>
        </div>
        <Link href="/monev/bumd/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Input Monev
        </Link>
      </div>

      {/* BUMD Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {bumd.map(b => {
          const latestMonev = monev.find(m => (m.bumd as { id: string } | null)?.id === b.id || m.bumd_id === b.id)
          return (
            <div key={b.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{b.nama}</h3>
                  <p className="text-xs text-muted-foreground">{b.singkatan} · {b.jenis}</p>
                </div>
              </div>

              {latestMonev ? (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Periode terakhir</span>
                    <span className="font-semibold">{latestMonev.periode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={`text-xs ${getStatusColor(latestMonev.status)}`}>{latestMonev.status}</Badge>
                  </div>
                  {latestMonev.rkap?.laba_realisasi && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Laba Realisasi</span>
                      <span className="font-semibold text-green-600">{formatRupiah(latestMonev.rkap.laba_realisasi)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50">
                  <BarChart3 className="h-4 w-4" />
                  <span>Belum ada data monev</span>
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/monev/bumd/${b.id}`}
                  className="flex-1 text-center py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                  Lihat Detail
                </Link>
                <Link href={`/monev/bumd/tambah?bumd_id=${b.id}`}
                  className="flex-1 text-center py-1.5 rounded-lg border border-border hover:bg-accent text-xs transition-colors flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" /> Input
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Riwayat Monev
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['BUMD', 'Periode', 'Laba Target', 'Laba Realisasi', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monev.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">Belum ada data monev</td></tr>
              ) : monev.map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {(m.bumd as { nama?: string; singkatan?: string } | null)?.singkatan ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.periode}</td>
                  <td className="px-4 py-3 text-xs">{m.rkap?.laba_target ? formatRupiah(m.rkap.laba_target) : '-'}</td>
                  <td className="px-4 py-3 text-xs text-green-600 font-medium">
                    {m.rkap?.laba_realisasi ? formatRupiah(m.rkap.laba_realisasi) : '-'}
                  </td>
                  <td className="px-4 py-3"><Badge className={`text-xs ${getStatusColor(m.status)}`}>{m.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/monev/bumd/detail/${m.id}`}
                      className="text-xs text-primary hover:underline">Detail</Link>
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
