import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase'
import { Trophy, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getStatusColor } from '@/lib/utils'
import { STATUS_PESERTA_LABELS } from '@/lib/types'

interface TahapanRef   { nama_tahap: string; urutan: number }
interface HasilRow     { id: string; nilai: number | null; status: string; catatan: string | null; tahapan: TahapanRef | null }
interface SeleksiRef   { judul: string }
interface PesertaRow   { id: string; nama: string; nomor_peserta: string | null; status: string; seleksi: SeleksiRef | null }

async function getData() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-peserta/login')

  const { data: peserta } = await supabase
    .from('peserta_seleksi')
    .select('id,nama,nomor_peserta,status,seleksi:seleksi(judul)')
    .eq('auth_user_id', user.id)
    .single()
  if (!peserta) redirect('/portal-peserta/login')

  const { data: hasil } = await supabase
    .from('hasil_seleksi')
    .select('id,nilai,status,catatan,tahapan:tahapan_seleksi(nama_tahap,urutan)')
    .eq('peserta_id', peserta.id)
    .order('created_at')

  return {
    peserta: peserta as PesertaRow,
    hasil: (hasil ?? []) as HasilRow[],
  }
}

export default async function HasilPage() {
  const { peserta, hasil } = await getData()
  const isLulus      = peserta.status === 'lulus_akhir'
  const isTidakLulus = ['tms_admin','tms_ukk','tidak_lulus'].includes(peserta.status)

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/portal-peserta/dokumen"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>

        {/* Status Card */}
        <div className={`rounded-2xl p-8 mb-6 text-center ${
          isLulus       ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white' :
          isTidakLulus  ? 'bg-gradient-to-br from-red-500 to-red-700 text-white' :
                          'bg-gradient-to-br from-primary to-primary/80 text-white'
        }`}>
          <div className="flex justify-center mb-4">
            {isLulus
              ? <Trophy className="h-16 w-16 text-yellow-300" />
              : isTidakLulus
                ? <XCircle className="h-16 w-16 text-white/80" />
                : <Clock className="h-16 w-16 text-white/80" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">{peserta.nama}</h1>
          <p className="text-white/80 mb-4">
            {peserta.nomor_peserta} · {peserta.seleksi?.judul ?? ''}
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-white/20 font-bold text-lg">
            {STATUS_PESERTA_LABELS[peserta.status as keyof typeof STATUS_PESERTA_LABELS] ?? peserta.status}
          </div>
          {isLulus && (
            <p className="mt-4 text-white/90 text-sm">
              🎉 Selamat! Anda dinyatakan lulus dalam seleksi ini.
            </p>
          )}
        </div>

        {/* Hasil Per Tahapan */}
        {hasil.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Hasil Per Tahapan
            </h2>
            <div className="space-y-4">
              {hasil.map((h: HasilRow) => (
                <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {h.tahapan?.urutan ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{h.tahapan?.nama_tahap ?? 'Tahapan'}</div>
                    {h.catatan && <div className="text-xs text-muted-foreground mt-0.5">{h.catatan}</div>}
                  </div>
                  <div className="text-right">
                    {h.nilai !== null && (
                      <div className="text-xl font-bold text-primary">{h.nilai}</div>
                    )}
                    <div className={`text-xs mt-0.5 font-semibold ${
                      h.status === 'lulus'      ? 'text-green-600' :
                      h.status === 'tidak_lulus'? 'text-red-600'   : 'text-gray-500'
                    }`}>
                      {h.status === 'lulus' ? '✓ Lulus' : h.status === 'tidak_lulus' ? '✗ Tidak Lulus' : '— Absen'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Belum Ada Hasil Penilaian</p>
            <p className="text-sm mt-1">Hasil seleksi akan tampil setelah tim seleksi menginput nilai.</p>
          </div>
        )}
      </div>
    </div>
  )
}
