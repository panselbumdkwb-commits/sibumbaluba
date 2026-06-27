'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'
import {
  Users, CheckCircle2, XCircle, Eye, FileText,
  Award, ArrowLeft, Loader2, Search, Filter, Download
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import { formatDate, getStatusColor } from '@/lib/utils'
import { DOKUMEN_LABELS, STATUS_PESERTA_LABELS, STATUS_VERIFIKASI_LABELS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Seleksi, TahapanSeleksi } from '@/lib/types'

interface PesertaLengkap {
  id: string; nama: string; nik: string; nomor_peserta: string
  status: string; seleksi_judul: string; total_dokumen: number
  dokumen_verified: number; dokumen_pending: number; dokumen_ditolak: number
  whatsapp: string; pendidikan: string; created_at: string
}

interface Props {
  seleksi: Seleksi
  peserta: PesertaLengkap[]
  tahapan: TahapanSeleksi[]
}

export default function SeleksiDashboardClient({ seleksi, peserta: initialPeserta, tahapan }: Props) {
  const router = useRouter()
  const [peserta, setPeserta] = useState(initialPeserta)
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaLengkap | null>(null)
  const [dokumenPeserta, setDokumenPeserta] = useState<Record<string, unknown>[]>([])
  const [loadingDok, setLoadingDok] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [nilaiForm, setNilaiForm] = useState<Record<string, { nilai: string; status: string; catatan: string }>>({})
  const [savingNilai, setSavingNilai] = useState(false)

  // Filter peserta
  const filtered = peserta.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nik.includes(search) || (p.nomor_peserta ?? '').includes(search)
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  async function loadDokumen(pesertaId: string) {
    setLoadingDok(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('dokumen_peserta').select('*').eq('peserta_id', pesertaId)
    setDokumenPeserta(data ?? [])
    setLoadingDok(false)
  }

  async function verifikasiDokumen(dokId: string, status: 'diverifikasi' | 'ditolak', catatan: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('dokumen_peserta')
      .update({ status_verifikasi: status, catatan, verified_at: new Date().toISOString() })
      .eq('id', dokId)
    if (error) { toast.error('Gagal memverifikasi'); return }
    toast.success(status === 'diverifikasi' ? 'Dokumen diverifikasi ✅' : 'Dokumen ditolak ❌')
    if (selectedPeserta) loadDokumen(selectedPeserta.id)
  }

  async function updateStatusPeserta(pesertaId: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('peserta_seleksi').update({ status }).eq('id', pesertaId)
    if (error) { toast.error('Gagal update status'); return }
    setPeserta(prev => prev.map(p => p.id === pesertaId ? { ...p, status } : p))
    if (selectedPeserta?.id === pesertaId) setSelectedPeserta(prev => prev ? { ...prev, status } : prev)
    // Kirim notifikasi
    await supabase.from('notifikasi').insert({
      peserta_id: pesertaId,
      judul: status === 'lulus_admin' ? '✅ Lulus Administrasi' : '❌ Tidak Memenuhi Syarat (TMS)',
      isi: status === 'lulus_admin'
        ? 'Selamat! Anda dinyatakan lulus tahap administrasi. Nantikan informasi jadwal UKK.'
        : 'Mohon maaf, dokumen Anda tidak memenuhi syarat administrasi.',
      kategori: status === 'lulus_admin' ? 'sukses' : 'peringatan',
    })
    toast.success('Status peserta diperbarui')
  }

  async function simpanNilai(pesertaId: string, tahapanId: string) {
    const key = `${pesertaId}-${tahapanId}`
    const form = nilaiForm[key]
    if (!form?.nilai || !form?.status) { toast.error('Lengkapi nilai dan status'); return }

    setSavingNilai(true)
    const supabase = createClient()
    const { error } = await supabase.from('hasil_seleksi').upsert({
      peserta_id: pesertaId,
      tahapan_id: tahapanId,
      nilai: parseFloat(form.nilai),
      status: form.status,
      catatan: form.catatan ?? '',
    }, { onConflict: 'peserta_id,tahapan_id' })
    setSavingNilai(false)
    if (error) { toast.error('Gagal simpan nilai'); return }
    toast.success('Nilai berhasil disimpan')
  }

  async function generateBeritaAcara() {
    toast.info('Membuat Berita Acara PDF...')
    const res = await fetch(`/api/seleksi/${seleksi.id}/berita-acara`)
    if (!res.ok) { toast.error('Gagal generate PDF'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BeritaAcara_${seleksi.judul.replace(/\s+/g, '_')}.pdf`
    a.click()
    toast.success('Berita Acara berhasil didownload')
  }

  const STATUS_OPTIONS = ['semua', 'terdaftar', 'verifikasi_dokumen', 'lulus_admin', 'tms_admin', 'undangan_ukk', 'lulus_akhir']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push('/kelola/seleksi')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Daftar Seleksi
          </button>
          <h1 className="text-2xl font-bold">{seleksi.judul}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(seleksi.status)}>{seleksi.status}</Badge>
            <span className="text-sm text-muted-foreground">{seleksi.entitas} · {seleksi.jenis}</span>
          </div>
        </div>
        <button onClick={generateBeritaAcara}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors">
          <Download className="h-4 w-4" /> Berita Acara
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Peserta', val: peserta.length, icon: Users, color: 'text-blue-600' },
          { label: 'Lulus Admin', val: peserta.filter(p => p.status === 'lulus_admin').length, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Menunggu Verif', val: peserta.filter(p => p.status === 'terdaftar').length, icon: Loader2, color: 'text-orange-500' },
          { label: 'TMS', val: peserta.filter(p => p.status === 'tms_admin').length, icon: XCircle, color: 'text-red-600' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-bold">{val}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="peserta">
        <TabsList>
          <TabsTrigger value="peserta">Daftar Peserta</TabsTrigger>
          <TabsTrigger value="nilai">Input Nilai UKK</TabsTrigger>
          <TabsTrigger value="tahapan">Tahapan</TabsTrigger>
        </TabsList>

        {/* TAB: DAFTAR PESERTA */}
        <TabsContent value="peserta">
          <div className="bg-card border border-border rounded-xl">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama, NIK, nomor peserta..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>
                      {s === 'semua' ? 'Semua Status' : STATUS_PESERTA_LABELS[s as keyof typeof STATUS_PESERTA_LABELS] ?? s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['No. Peserta', 'Nama', 'Pendidikan', 'Dokumen', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data peserta</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.nomor_peserta ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.nama}</div>
                        <div className="text-xs text-muted-foreground">{p.nik}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.pendidikan}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 text-xs">
                          <span className="text-green-600">✓{p.dokumen_verified}</span>
                          <span className="text-orange-500">⏳{p.dokumen_pending}</span>
                          <span className="text-red-500">✗{p.dokumen_ditolak}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${getStatusColor(p.status)}`}>
                          {STATUS_PESERTA_LABELS[p.status as keyof typeof STATUS_PESERTA_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={async () => { setSelectedPeserta(p); await loadDokumen(p.id) }}
                            className="h-7 px-2 rounded text-xs border border-border hover:bg-accent transition-colors flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Dokumen
                          </button>
                          {p.status === 'verifikasi_dokumen' && (
                            <>
                              <button onClick={() => updateStatusPeserta(p.id, 'lulus_admin')}
                                className="h-7 px-2 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                                Lulus
                              </button>
                              <button onClick={() => updateStatusPeserta(p.id, 'tms_admin')}
                                className="h-7 px-2 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                                TMS
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VERIFIKASI DOKUMEN PANEL */}
          {selectedPeserta && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="font-bold text-lg">Dokumen: {selectedPeserta.nama}</h2>
                    <p className="text-sm text-muted-foreground">{selectedPeserta.nomor_peserta}</p>
                  </div>
                  <button onClick={() => { setSelectedPeserta(null); setDokumenPeserta([]) }}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">✕</button>
                </div>
                <div className="p-6 space-y-3">
                  {loadingDok ? (
                    <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                  ) : dokumenPeserta.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Belum ada dokumen diupload</div>
                  ) : dokumenPeserta.map((dok: Record<string, unknown>) => (
                    <div key={dok.id as string} className="border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-sm">
                            {DOKUMEN_LABELS[dok.jenis_dokumen as keyof typeof DOKUMEN_LABELS]}
                          </p>
                          <p className="text-xs text-muted-foreground">{dok.file_name as string}</p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(dok.status_verifikasi as string)}`}>
                          {STATUS_VERIFIKASI_LABELS[dok.status_verifikasi as keyof typeof STATUS_VERIFIKASI_LABELS]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a href={dok.file_url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs transition-colors">
                          <Eye className="h-3.5 w-3.5" /> Lihat File
                        </a>
                        {dok.status_verifikasi !== 'diverifikasi' && (
                          <>
                            <button onClick={() => verifikasiDokumen(dok.id as string, 'diverifikasi', '')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs transition-colors">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verifikasi
                            </button>
                            <button onClick={() => {
                              const catatan = prompt('Alasan penolakan:')
                              if (catatan !== null) verifikasiDokumen(dok.id as string, 'ditolak', catatan)
                            }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs transition-colors">
                              <XCircle className="h-3.5 w-3.5" /> Tolak
                            </button>
                          </>
                        )}
                      </div>
                      {dok.catatan && (
                        <p className="mt-2 text-xs text-muted-foreground italic">Catatan: {dok.catatan as string}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB: INPUT NILAI UKK */}
        <TabsContent value="nilai">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-lg">Input Nilai UKK</h2>
            </div>
            {tahapan.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Belum ada tahapan seleksi. Tambahkan tahapan terlebih dahulu.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {tahapan.map(t => (
                  <div key={t.id}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                        {t.urutan}
                      </span>
                      <h3 className="font-semibold">{t.nama_tahap}</h3>
                      <Badge className={`text-xs ${getStatusColor(t.status)}`}>{t.status}</Badge>
                      {t.tanggal_mulai && (
                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(t.tanggal_mulai)}</span>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Peserta</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Nilai (0-100)</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Catatan</th>
                            <th className="px-3 py-2 text-xs font-semibold text-muted-foreground"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {peserta.filter(p => ['lulus_admin', 'undangan_ukk', 'lulus_ukk'].includes(p.status)).map(p => {
                            const key = `${p.id}-${t.id}`
                            const f = nilaiForm[key] ?? { nilai: '', status: '', catatan: '' }
                            return (
                              <tr key={p.id} className="border-b border-border/50">
                                <td className="px-3 py-2">
                                  <div className="font-medium text-sm">{p.nama}</div>
                                  <div className="text-xs text-muted-foreground">{p.nomor_peserta}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <input type="number" min="0" max="100" value={f.nilai}
                                    onChange={e => setNilaiForm(prev => ({ ...prev, [key]: { ...f, nilai: e.target.value } }))}
                                    placeholder="0-100"
                                    className="w-20 h-8 px-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                </td>
                                <td className="px-3 py-2">
                                  <select value={f.status}
                                    onChange={e => setNilaiForm(prev => ({ ...prev, [key]: { ...f, status: e.target.value } }))}
                                    className="h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none">
                                    <option value="">Pilih</option>
                                    <option value="lulus">Lulus</option>
                                    <option value="tidak_lulus">Tidak Lulus</option>
                                    <option value="absen">Absen</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2">
                                  <input type="text" value={f.catatan}
                                    onChange={e => setNilaiForm(prev => ({ ...prev, [key]: { ...f, catatan: e.target.value } }))}
                                    placeholder="Catatan (opsional)"
                                    className="w-full h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none" />
                                </td>
                                <td className="px-3 py-2">
                                  <button onClick={() => simpanNilai(p.id, t.id)} disabled={savingNilai}
                                    className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                    Simpan
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB: TAHAPAN */}
        <TabsContent value="tahapan">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Tahapan Seleksi</h2>
            {tahapan.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada tahapan.</p>
            ) : (
              <div className="space-y-3">
                {tahapan.map(t => (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {t.urutan}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{t.nama_tahap}</div>
                      {(t.tanggal_mulai || t.tanggal_selesai) && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t.tanggal_mulai ? formatDate(t.tanggal_mulai) : '?'}
                          {t.tanggal_selesai ? ` – ${formatDate(t.tanggal_selesai)}` : ''}
                        </div>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(t.status)}`}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
