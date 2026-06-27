import { Building2, Hospital, Users, FileText, BookOpen, ClipboardList } from 'lucide-react'
import type { Statistik } from '@/lib/types'

const STATS = [
  { key: 'total_bumd', label: 'BUMD', sublabel: 'Badan Usaha Milik Daerah', icon: Building2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
  { key: 'total_blud', label: 'BLUD', sublabel: 'Puskesmas Kota Batu', icon: Hospital, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'total_seleksi', label: 'Seleksi', sublabel: 'Proses seleksi direksi', icon: Users, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
  { key: 'total_peserta', label: 'Peserta', sublabel: 'Total pendaftar seleksi', icon: ClipboardList, gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400' },
  { key: 'total_regulasi', label: 'Regulasi', sublabel: 'Perda, Perwali & SK', icon: FileText, gradient: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
  { key: 'total_sop', label: 'SOP', sublabel: 'Prosedur operasional', icon: BookOpen, gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400' },
]

interface Props { statistik: Statistik }

export default function StatistikWidget({ statistik }: Props) {
  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Data Terkini
          </div>
          <h2 className="text-2xl font-bold text-foreground">Statistik SIBUMBALUMBA</h2>
          <p className="text-sm text-muted-foreground mt-2">Ringkasan data pengelolaan BUMD-BLUD Kota Batu</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(({ key, label, sublabel, icon: Icon, bg, text }) => {
            const val = statistik[key as keyof Statistik] ?? 0
            return (
              <div key={key}
                className="group relative rounded-2xl border border-border bg-background p-5 text-center hover:border-primary/20 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${text}`} />
                </div>
                <div className="text-3xl font-extrabold tabular-nums text-foreground mb-1">{val}</div>
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{sublabel}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
