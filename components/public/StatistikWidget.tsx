import { Building2, Hospital, Users, FileText, BookOpen, ClipboardList } from 'lucide-react'
import type { Statistik } from '@/lib/types'

const STATS = [
  { key: 'total_bumd', label: 'BUMD', icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { key: 'total_blud', label: 'BLUD (PKM)', icon: Hospital, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'total_seleksi', label: 'Seleksi', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  { key: 'total_peserta', label: 'Total Peserta', icon: ClipboardList, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  { key: 'total_regulasi', label: 'Regulasi', icon: FileText, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  { key: 'total_sop', label: 'SOP', icon: BookOpen, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
]

interface Props {
  statistik: Statistik
}

export default function StatistikWidget({ statistik }: Props) {
  return (
    <section className="border-b border-border/40 bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Ringkasan Data
          </p>
          <h2 className="text-xl font-bold mt-1">Statistik SIMBUBALADA</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-5 rounded-xl border border-border bg-background hover:shadow-sm transition-all text-center"
            >
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold tabular-nums text-foreground">
                {statistik[key as keyof Statistik] ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
