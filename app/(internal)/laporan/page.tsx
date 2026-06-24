import { createServerComponentClient } from '@/lib/supabase'
import { FileBarChart, Download, BarChart3, TrendingUp, Users, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

async function getData() {
  const supabase = await createServerComponentClient()
  const [statRes, seleksiRes, monevBumdRes, monevBludRes] = await Promise.all([
    supabase.from('v_statistik').select('*').single(),
    supabase.from('seleksi').select('*, peserta:peserta_seleksi(count)').order('created_at', { ascending: false }).limit(10),
    supabase.from('monev_bumd').select('*, bumd(nama, singkatan)').order('created_at', { ascending: false }).limit(5),
    supabase.from('monev_blud').select('*, blud(nama)').order('created_at', { ascending: false }).limit(5),
  ])
  return {
    stat: statRes.data,
    seleksi: seleksiRes.data ?? [],
    monevBumd: monevBumdRes.data ?? [],
    monevBlud: monevBludRes.data ?? [],
  }
}

export default async function LaporanPage() {
  const { stat, seleksi, monevBumd, monevBlud } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Rekap</h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan dan ekspor data SIMBUBALADA</p>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total BUMD', val: stat?.total_bumd ?? 0, icon: BarChart3, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Total BLUD', val: stat?.total_blud ?? 0, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Total Seleksi', val: stat?.total_seleksi ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
          { label: 'Total Peserta', val: stat?.total_peserta ?? 0, icon: FileText, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
        ].map(({ label, val, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{val}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ekspor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Ekspor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Rekap Peserta Seleksi', desc: 'Semua peserta seleksi beserta status', format: 'Excel' },
              { label: 'Rekap Monev BUMD', desc: 'Data monitoring evaluasi BUMD', format: 'Excel' },
              { label: 'Rekap Monev BLUD', desc: 'Data monitoring evaluasi BLUD', format: 'Excel' },
              { label: 'Daftar Regulasi', desc: 'Seluruh regulasi yang terdaftar', format: 'PDF' },
              { label: 'Daftar SOP', desc: 'Seluruh SOP yang terdaftar', format: 'PDF' },
              { label: 'Audit Log', desc: 'Riwayat aktivitas sistem', format: 'Excel' },
            ].map(({ label, desc, format }) => (
              <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${format === 'PDF' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  <Download className="h-3 w-3" /> {format}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Seleksi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Rekap Seleksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Judul Seleksi', 'Entitas', 'Status', 'Kuota', 'Dibuat'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seleksi.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Belum ada data</td></tr>
                ) : seleksi.map((s: Record<string, unknown>) => (
                  <tr key={s.id as string} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium max-w-xs">
                      <div className="line-clamp-1">{s.judul as string}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.entitas as string}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        s.status === 'buka' ? 'bg-green-100 text-green-700' :
                        s.status === 'selesai' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{s.status as string}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{s.kuota as number}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(s.created_at as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
