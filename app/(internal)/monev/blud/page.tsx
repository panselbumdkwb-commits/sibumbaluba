import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Hospital, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'

interface BludRow  { id: string; nama: string; jenis: string; profil: Record<string,unknown> }
interface MonevRow { id: string; blud_id: string; periode: string; status: string; created_at: string; blud: { nama: string } | null }

async function getData() {
  const supabase = await createServerComponentClient()
  const [bludRes, monevRes] = await Promise.all([
    supabase.from('blud').select('id,nama,jenis,profil').eq('is_active', true).order('nama'),
    supabase.from('monev_blud').select('id,blud_id,periode,status,created_at,blud:blud(nama)').order('created_at', { ascending: false }).limit(20),
  ])
  return { blud: (bludRes.data ?? []) as BludRow[], monev: (monevRes.data ?? []) as MonevRow[] }
}

const AKREDITASI_COLOR: Record<string, string> = {
  'Paripurna': 'bg-green-100 text-green-700', 'Utama': 'bg-blue-100 text-blue-700',
  'Madya': 'bg-yellow-100 text-yellow-700',   'Dasar': 'bg-orange-100 text-orange-700',
}

export default async function MonevBludPage() {
  const { blud, monev } = await getData()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring & Evaluasi BLUD</h1>
          <p className="text-sm text-muted-foreground mt-1">Pemantauan kinerja Puskesmas BLUD Kota Batu</p>
        </div>
        <Link href="/monev/blud/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Input Monev
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blud.map(b => {
          const latestMonev = monev.find(m => m.blud_id === b.id)
          const akreditasi = (b.profil?.akreditasi as string | undefined) ?? ''
          return (
            <div key={b.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Hospital className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm leading-tight truncate">{b.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{b.jenis}</span>
                    {akreditasi && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${AKREDITASI_COLOR[akreditasi] ?? 'bg-gray-100 text-gray-700'}`}>
                        {akreditasi}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {latestMonev ? (
                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periode</span>
                    <span className="font-medium">{latestMonev.periode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={`text-xs ${getStatusColor(latestMonev.status)}`}>{latestMonev.status}</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 p-2.5 rounded-lg bg-muted/50">
                  <BarChart3 className="h-4 w-4" /><span>Belum ada data monev</span>
                </div>
              )}
              <div className="flex gap-2">
                <Link href={`/monev/blud/${b.id}`}
                  className="flex-1 text-center py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors">Detail</Link>
                <Link href={`/monev/blud/tambah?blud_id=${b.id}`}
                  className="flex-1 text-center py-1.5 rounded-lg border border-border hover:bg-accent text-xs transition-colors flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" /> Input
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Riwayat */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-5 border-b border-border"><h2 className="font-bold">Riwayat Monev BLUD</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['BLUD','Periode','Status','Tanggal','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monev.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Belum ada data</td></tr>
              ) : monev.map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{m.blud?.nama ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.periode}</td>
                  <td className="px-4 py-3"><Badge className={`text-xs ${getStatusColor(m.status)}`}>{m.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/monev/blud/detail/${m.id}`} className="text-xs text-primary hover:underline">Detail</Link>
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
