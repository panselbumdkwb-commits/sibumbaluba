import { createServerComponentClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Building2, MapPin, Phone, Mail, Globe, Calendar, Target, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Bumd, BumdProfil } from '@/lib/types'

async function getData(slug: string): Promise<Bumd | null> {
  const supabase = await createServerComponentClient()
  const { data } = await supabase.from('bumd').select('*').eq('slug', slug).single()
  return data as Bumd | null
}

export default async function ProfilBumdDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bumdData = await getData(slug)
  if (!bumdData) notFound()
  const bumd = bumdData!

  // Setelah notFound() dipanggil jika null, bumd pasti non-null di sini
  const p = bumd.profil as BumdProfil

  return (
    <div className="container mx-auto px-4 py-10">
      <Link href="/profil/bumd"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar BUMD
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <div className="text-blue-200 text-sm font-medium mb-1">{bumd.jenis}</div>
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{bumd.nama}</h1>
            {bumd.singkatan && <p className="text-blue-200 text-lg mt-1">{bumd.singkatan}</p>}
            {p?.layanan && (
              <p className="text-blue-100 text-sm mt-3 max-w-2xl leading-relaxed">
                {typeof p.layanan === 'string' ? p.layanan : (p.layanan as string[]).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kontak */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Informasi Kontak</h3>
            <div className="space-y-3">
              {[
                { icon: MapPin,    val: p?.alamat },
                { icon: Phone,    val: p?.telepon },
                { icon: Mail,     val: p?.email },
                { icon: Globe,    val: p?.website, isLink: true },
                { icon: Calendar, val: p?.tahun_berdiri ? `Berdiri: ${p.tahun_berdiri}` : undefined },
              ].filter(i => i.val).map(({ icon: Icon, val, isLink }) => (
                <div key={String(val)} className="flex items-start gap-3 text-sm">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  {isLink
                    ? <a href={String(val)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{val}</a>
                    : <span className="text-muted-foreground">{val}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {(p?.modal_dasar || p?.pelanggan || p?.coverage) && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Data Singkat</h3>
              <div className="space-y-3">
                {p.modal_dasar && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modal Dasar</span>
                    <span className="font-semibold">{p.modal_dasar}</span>
                  </div>
                )}
                {p.pelanggan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pelanggan</span>
                    <span className="font-semibold">{p.pelanggan}</span>
                  </div>
                )}
                {p.coverage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-semibold">{p.coverage}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visi Misi */}
        <div className="lg:col-span-2 space-y-6">
          {p?.visi && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Visi</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed italic">&ldquo;{p.visi}&rdquo;</p>
            </div>
          )}

          {p?.misi && Array.isArray(p.misi) && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-secondary" />
                <h3 className="font-bold">Misi</h3>
              </div>
              <ol className="space-y-3">
                {(p.misi as string[]).map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {p?.bidang && Array.isArray(p.bidang) && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Bidang Usaha</h3>
              <div className="flex flex-wrap gap-2">
                {(p.bidang as string[]).map(b => (
                  <span key={b} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
