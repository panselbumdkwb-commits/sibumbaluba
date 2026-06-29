import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { FileText, User, Trophy, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { STATUS_PESERTA_LABELS } from '@/lib/types'

const STATUS_CONFIG: Record<string, { color: string; icon: string; desc: string }> = {
  terdaftar:          { color: 'bg-blue-100 text-blue-700',   icon: '📋', desc: 'Lengkapi formulir dan upload dokumen' },
  verifikasi_dokumen: { color: 'bg-yellow-100 text-yellow-700', icon: '🔍', desc: 'Dokumen sedang diverifikasi panitia' },
  lulus_admin:        { color: 'bg-green-100 text-green-700',  icon: '✅', desc: 'Lulus seleksi administrasi. Pantau pengumuman!' },
  tms_admin:          { color: 'bg-red-100 text-red-700',      icon: '❌', desc: 'Tidak memenuhi syarat administrasi' },
  undangan_ukk:       { color: 'bg-purple-100 text-purple-700',icon: '📬', desc: 'Anda diundang mengikuti tahapan UKK' },
  lulus_ukk:          { color: 'bg-green-100 text-green-700',  icon: '🎯', desc: 'Lulus UKK. Pantau pengumuman akhir!' },
  tms_ukk:            { color: 'bg-red-100 text-red-700',      icon: '❌', desc: 'Tidak lulus tahapan UKK' },
  lulus_akhir:        { color: 'bg-emerald-100 text-emerald-700', icon: '🏆', desc: 'Selamat! Anda dinyatakan lulus!' },
  tidak_lulus:        { color: 'bg-gray-100 text-gray-600',    icon: '📄', desc: 'Proses seleksi telah selesai' },
}

export default async function DashboardPesertaPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-peserta/login')

  const { data: peserta } = await supabase
    .from('peserta_seleksi')
    .select('*, seleksi(*)')
    .eq('auth_user_id', user.id)
    .single()

  if (!peserta) redirect('/portal-peserta/login')

  const { data: dokumen } = await supabase
    .from('dokumen_peserta')
    .select('id, jenis_dokumen, status_verifikasi')
    .eq('peserta_id', peserta.id)

  const statusCfg = STATUS_CONFIG[peserta.status] ?? STATUS_CONFIG['terdaftar']
  const dokVerified = dokumen?.filter(d => d.status_verifikasi === 'diverifikasi').length ?? 0
  const dokTotal    = dokumen?.length ?? 0

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-foreground/70 text-sm">Portal Peserta Seleksi</p>
              <h1 className="text-xl font-bold mt-0.5">{peserta.nama}</h1>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit"
                className="flex items-center gap-1.5 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </form>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-xl px-4 py-3">
            <div>
              <div className="text-xs text-primary-foreground/70">Nomor Peserta</div>
              <div className="font-bold tracking-wider text-lg">{peserta.nomor_peserta ?? '—'}</div>
            </div>
            <div className="h-8 w-px bg-primary-foreground/20 mx-2" />
            <div>
              <div className="text-xs text-primary-foreground/70">Seleksi</div>
              <div className="font-semibold text-sm">{(peserta as Record<string,unknown> & {seleksi?: {judul?: string}}).seleksi?.judul ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-xl p-4 border flex items-start gap-3 ${statusCfg.color}`}>
          <span className="text-2xl">{statusCfg.icon}</span>
          <div>
            <div className="font-bold text-sm">
              {STATUS_PESERTA_LABELS[peserta.status as keyof typeof STATUS_PESERTA_LABELS] ?? peserta.status}
            </div>
            <div className="text-xs mt-0.5 opacity-80">{statusCfg.desc}</div>
          </div>
        </div>

        {/* Progress Formulir */}
        {!peserta.profil_lengkap && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold">Formulir Belum Lengkap</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Lengkapi identitas, riwayat pendidikan, pekerjaan, keluarga, dan motivasi Anda.
            </p>
            <Link href="/portal-peserta/profil"
              className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
              <User className="h-4 w-4" /> Lengkapi Formulir Sekarang
            </Link>
          </div>
        )}

        {/* Menu Navigasi */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/portal-peserta/profil"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all group">
            <User className="h-6 w-6 text-primary mb-2" />
            <div className="font-semibold text-sm">Formulir Pendaftaran</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {peserta.profil_lengkap
                ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Lengkap</span>
                : 'Belum lengkap'}
            </div>
          </Link>
          <Link href="/portal-peserta/dokumen"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all group">
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <div className="font-semibold text-sm">Upload Dokumen</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {dokVerified}/{dokTotal} dokumen terverifikasi
            </div>
          </Link>
          <Link href="/portal-peserta/hasil"
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all col-span-2 group">
            <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
            <div className="font-semibold text-sm">Hasil Seleksi</div>
            <div className="text-xs text-muted-foreground mt-0.5">Pantau perkembangan hasil seleksi per tahapan</div>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Pemerintah Kota Batu — SIBUMBALUMBA
        </p>
      </div>
    </div>
  )
}
