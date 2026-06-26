import { createServerComponentClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Hospital, MapPin, Phone, Mail, ArrowLeft, Award, Users, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { Blud, BludProfil } from '@/lib/types'

async function getData(slug: string): Promise<Blud | null> {
  const supabase = await createServerComponentClient()
  const { data } = await supabase.from('blud').select('*').eq('slug', slug).single()
  return data as Blud | null
}

const AKREDITASI_COLOR: Record<string, string> = {
  Paripurna: 'bg-green-500', Utama: 'bg-blue-500',
  Madya: 'bg-yellow-500',   Dasar: 'bg-orange-500',
}

export default async function ProfilBludDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bludData = await getData(slug)
  if (!bludData) notFound()
  const blud = bludData!

  // notFound() melempar exception, jadi blud pasti non-null di bawah ini
  const p = blud.profil as BludProfil

  return (
    <div className="container mx-auto px-4 py-10">
      <Link href="/profil/blud"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar BLUD
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Hospital className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-emerald-200 text-sm font-medium mb-1">{blud.jenis} – BLUD</div>
            <h1 className="text-2xl lg:text-3xl font-bold">{blud.nama}</h1>
            {p?.wilayah && <p className="text-emerald-200 mt-1 text-sm">{p.wilayah as string}</p>}
            {p?.akreditasi && (
              <div className="flex items-center gap-2 mt-3">
                <Award className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-semibold">Akreditasi {p.akreditasi as string}</span>
                <span className={`h-2 w-2 rounded-full ${AKREDITASI_COLOR[p.akreditasi as string] ?? 'bg-gray-400'}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kontak */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Informasi Kontak</h3>
            <div className="space-y-3 text-sm">
              {p?.alamat && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                  <span className="text-muted-foreground">{p.alamat as string}</span>
                </div>
              )}
              {p?.telepon && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-muted-foreground">{p.telepon as string}</span>
                </div>
              )}
              {p?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-muted-foreground">{p.email as string}</span>
                </div>
              )}
              {p?.kepala && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-muted-foreground">Kepala: {p.kepala as string}</span>
                </div>
              )}
              {p?.jml_penduduk_wilayah && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-muted-foreground">Penduduk: {p.jml_penduduk_wilayah as string}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layanan */}
        <div className="lg:col-span-2 space-y-6">
          {p?.layanan && Array.isArray(p.layanan) && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <h3 className="font-bold">Layanan Unggulan</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {(p.layanan as string[]).map(l => (
                  <div key={l} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Jam Pelayanan</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Senin – Kamis', '07.30 – 16.00 WIB'],
                ['Jumat', '07.30 – 11.00 WIB'],
                ['Sabtu', '07.30 – 13.00 WIB'],
                ['UGD (Darurat)', '24 Jam'],
              ].map(([hari, jam]) => (
                <div key={hari} className="flex justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground">{hari}</span>
                  <span className="font-semibold">{jam}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
