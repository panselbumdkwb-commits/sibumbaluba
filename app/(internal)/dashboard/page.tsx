import { createServerComponentClient } from '@/lib/supabase-server'
import { Building2, Hospital, Users, FileText, BookOpen, TrendingUp, ClipboardCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'

interface StatRow { [key: string]: number }
interface SeleksiRow { id: string; judul: string; entitas: string; jenis: string; status: string; created_at: string }
interface PengumumanRow { id: string; judul: string; isi: string | null; kategori: string; is_publik: boolean; created_at: string }

async function getDashboardData() {
  const supabase = await createServerComponentClient()
  const [statRes, seleksiRes, pengumumanRes] = await Promise.all([
    supabase.from('v_statistik').select('*').single(),
    supabase.from('seleksi').select('id,judul,entitas,jenis,status,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('pengumuman').select('id,judul,isi,kategori,is_publik,created_at').order('created_at', { ascending: false }).limit(5),
  ])
  return {
    stat: statRes.data as StatRow | null,
    seleksi: (seleksiRes.data ?? []) as SeleksiRow[],
    pengumuman: (pengumumanRes.data ?? []) as PengumumanRow[],
  }
}

const STAT_CARDS = [
  { key: 'total_bumd',     label: 'BUMD',          icon: Building2,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { key: 'total_blud',     label: 'BLUD',           icon: Hospital,     color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { key: 'total_seleksi',  label: 'Seleksi',        icon: Users,        color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  { key: 'total_peserta',  label: 'Total Peserta',  icon: ClipboardCheck,color:'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  { key: 'total_regulasi', label: 'Regulasi',       icon: FileText,     color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950/40' },
  { key: 'total_sop',      label: 'SOP',            icon: BookOpen,     color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950/40' },
]

export default async function DashboardPage() {
  const { stat, seleksi, pengumuman } = await getDashboardData()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan data terkini SIMBUBALADA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums">
                {(stat?.[key] ?? 0) as number}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Seleksi */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Seleksi Terbaru
              </CardTitle>
              <a href="/seleksi" className="text-xs text-primary hover:underline">Lihat Semua →</a>
            </div>
          </CardHeader>
          <CardContent>
            {seleksi.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data seleksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {seleksi.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.judul}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.entitas} · {s.jenis}</div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${getStatusColor(s.status)}`}>{s.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pengumuman */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Pengumuman Terbaru
              </CardTitle>
              <a href="/pengumuman/kelola" className="text-xs text-primary hover:underline">Kelola →</a>
            </div>
          </CardHeader>
          <CardContent>
            {pengumuman.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada pengumuman</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pengumuman.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{p.judul}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(p.created_at)} · {p.is_publik ? '🌐 Publik' : '🔒 Internal'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">{p.kategori}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tambah Seleksi',    href: '/seleksi/baru',       icon: Users,     color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600' },
              { label: 'Input Monev BUMD',  href: '/monev/bumd/tambah',  icon: Building2, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' },
              { label: 'Input Monev BLUD',  href: '/monev/blud/tambah',  icon: Hospital,  color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
              { label: 'Buat Pengumuman',   href: '/pengumuman/kelola',  icon: FileText,  color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' },
            ].map(({ label, href, icon: Icon, color }) => (
              <a key={label} href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:shadow-sm hover:border-primary/30 transition-all text-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
