'use client'

import React from 'react'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, CheckCircle2, Clock, XCircle, FileText, LogOut,
  Bell, RefreshCw, Eye, Trash2, Loader2, User
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { fileSizeLabel, getStatusColor, formatDateTime } from '@/lib/utils'
import type { DokumenPeserta, PesertaSeleksi, Seleksi } from '@/lib/types'
import { DOKUMEN_LABELS, STATUS_PESERTA_LABELS, STATUS_VERIFIKASI_LABELS } from '@/lib/types'

const REQUIRED_DOCS = [
  'ktp', 'ijazah', 'cv', 'skck',
  'surat_kesehatan', 'pakta_integritas', 'foto', 'dokumen_pendukung'
] as const

const DOC_ICONS: Record<string, string> = {
  ktp: '🪪', ijazah: '🎓', cv: '📄', skck: '👮',
  surat_kesehatan: '🏥', pakta_integritas: '✍️', foto: '🖼️', dokumen_pendukung: '📎',
}

interface Props {
  peserta: PesertaSeleksi & { seleksi: Seleksi }
  dokumen: DokumenPeserta[]
  notifikasi: Array<{ id: string; judul: string; isi: string | null; created_at: string }>
}

export default function UploadDokumenClient({ peserta, dokumen: initialDokumen, notifikasi }: Props) {
  const router = useRouter()
  const [dokumen, setDokumen] = useState(initialDokumen)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getDok = (jenis: string) => dokumen.find(d => d.jenis_dokumen === jenis)

  const totalRequired = REQUIRED_DOCS.length - 1 // dokumen_pendukung opsional
  const verified = dokumen.filter(d => d.status_verifikasi === 'diverifikasi').length
  const uploaded = dokumen.filter(d => d.file_url).length
  const progress = Math.round((uploaded / totalRequired) * 100)

  async function handleUpload(jenis: string, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext ?? '')) {
      toast.error('Format file harus PDF, JPG, atau PNG')
      return
    }

    setUploading(jenis)
    try {
      const supabase = createClient()
      const path = `${peserta.seleksi_id}/${peserta.id}/${jenis}.${ext}`

      const { error: upError } = await supabase.storage
        .from('seleksi-dokumen')
        .upload(path, file, { upsert: true })

      if (upError) { toast.error('Upload gagal: ' + upError.message); return }

      const { data: urlData } = supabase.storage.from('seleksi-dokumen').getPublicUrl(path)

      const { data: dok, error: dbError } = await supabase
        .from('dokumen_peserta')
        .upsert({
          peserta_id: peserta.id,
          jenis_dokumen: jenis,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          status_verifikasi: 'pending',
        }, { onConflict: 'peserta_id,jenis_dokumen' })
        .select()
        .single()

      if (dbError) { toast.error('Gagal simpan data'); return }

      setDokumen(prev => {
        const idx = prev.findIndex(d => d.jenis_dokumen === jenis)
        if (idx >= 0) { const n = [...prev]; n[idx] = dok as DokumenPeserta; return n }
        return [...prev, dok as DokumenPeserta]
      })

      toast.success(`${DOKUMEN_LABELS[jenis as keyof typeof DOKUMEN_LABELS]} berhasil diupload`)
    } finally {
      setUploading(null)
    }
  }

  async function handleDelete(jenis: string) {
    if (!confirm('Hapus dokumen ini?')) return
    const supabase = createClient()
    const dok = getDok(jenis)
    if (!dok) return

    if (dok.status_verifikasi === 'diverifikasi') {
      toast.error('Dokumen yang sudah diverifikasi tidak dapat dihapus')
      return
    }

    const { error } = await supabase
      .from('dokumen_peserta')
      .delete()
      .eq('id', dok.id)

    if (error) { toast.error('Gagal menghapus dokumen'); return }

    setDokumen(prev => prev.filter(d => d.jenis_dokumen !== jenis))
    toast.success('Dokumen dihapus')
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal-peserta/login')
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'diverifikasi') return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status === 'ditolak') return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-orange-500" />
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
              <FileText className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm">Portal Peserta</div>
              <div className="text-[11px] text-muted-foreground">SIMBUBALADA</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.refresh()}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border hover:bg-accent text-sm transition-colors text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profil Peserta */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-secondary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{peserta.nama}</h1>
              <p className="text-sm text-muted-foreground">{peserta.seleksi?.judul}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {peserta.nomor_peserta && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    No. {peserta.nomor_peserta}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(peserta.status)}`}>
                  {STATUS_PESERTA_LABELS[peserta.status]}
                </span>
              </div>
            </div>
            {/* Progress */}
            <div className="text-center sm:text-right">
              <div className="text-3xl font-bold text-primary">{uploaded}</div>
              <div className="text-xs text-muted-foreground">dari {REQUIRED_DOCS.length} dokumen</div>
              <div className="mt-2 w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{progress}% lengkap</div>
            </div>
          </div>
        </div>

        {/* Notifikasi */}
        {notifikasi.length > 0 && (
          <div className="space-y-2">
            {notifikasi.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">{n.judul}</p>
                  {n.isi && <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">{n.isi}</p>}
                  <p className="text-xs text-blue-400 mt-1">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dokumen Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Upload Dokumen Persyaratan</h2>
            <span className="text-xs text-muted-foreground">PDF/JPG/PNG · Maks 5MB</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {REQUIRED_DOCS.map(jenis => {
              const dok = getDok(jenis)
              const isUploading = uploading === jenis
              const label = DOKUMEN_LABELS[jenis]
              const icon = DOC_ICONS[jenis] ?? '📄'
              const isOpsional = jenis === 'dokumen_pendukung'

              return (
                <div key={jenis}
                  className={`border rounded-xl p-4 transition-all ${
                    dok?.status_verifikasi === 'diverifikasi' ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' :
                    dok?.status_verifikasi === 'ditolak' ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' :
                    dok?.file_url ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' :
                    'border-border bg-card hover:border-primary/40'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        {isOpsional && <span className="text-xs text-muted-foreground">(Opsional)</span>}
                      </div>
                    </div>
                    {dok?.status_verifikasi && (
                      <div className="flex items-center gap-1">
                        <StatusIcon status={dok.status_verifikasi} />
                        <span className={`text-xs font-medium ${
                          dok.status_verifikasi === 'diverifikasi' ? 'text-green-600' :
                          dok.status_verifikasi === 'ditolak' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {STATUS_VERIFIKASI_LABELS[dok.status_verifikasi]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Catatan ditolak */}
                  {dok?.status_verifikasi === 'ditolak' && dok.catatan && (
                    <div className="mb-3 p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-400">
                      ❌ Ditolak: {dok.catatan}
                    </div>
                  )}

                  {dok?.file_url ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate">{dok.file_name}</span>
                        {dok.file_size && <span className="shrink-0">({fileSizeLabel(dok.file_size)})</span>}
                      </div>
                      <div className="flex gap-2">
                        <a href={dok.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-border hover:bg-accent text-xs font-medium transition-colors">
                          <Eye className="h-3.5 w-3.5" /> Lihat
                        </a>
                        {dok.status_verifikasi !== 'diverifikasi' && (
                          <>
                            <button onClick={() => fileRefs.current[jenis]?.click()}
                              disabled={isUploading}
                              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors">
                              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                              Ganti
                            </button>
                            <button onClick={() => handleDelete(jenis)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 text-xs transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[jenis]?.click()}
                      disabled={isUploading}
                      className="w-full h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary/60 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary disabled:opacity-60">
                      {isUploading
                        ? <><Loader2 className="h-5 w-5 animate-spin" /><span className="text-xs">Mengupload...</span></>
                        : <><Upload className="h-5 w-5" /><span className="text-xs font-medium">Klik untuk upload</span></>}
                    </button>
                  )}

                  <input
                    ref={el => { fileRefs.current[jenis] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload(jenis, f)
                      e.target.value = ''
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Ringkasan Dokumen</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Diupload', val: uploaded, color: 'text-blue-600' },
              { label: 'Terverifikasi', val: verified, color: 'text-green-600' },
              { label: 'Ditolak', val: dokumen.filter(d => d.status_verifikasi === 'ditolak').length, color: 'text-red-600' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-3 rounded-xl bg-muted/50">
                <div className={`text-2xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
