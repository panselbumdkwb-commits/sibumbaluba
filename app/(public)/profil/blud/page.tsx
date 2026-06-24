import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Hospital, MapPin, Phone, ArrowRight } from 'lucide-react'
import type { Blud } from '@/lib/types'

async function getData() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase.from('blud').select('*').eq('is_active', true).order('nama')
  return (data ?? []) as Blud[]
}

const AKREDITASI_COLOR: Record<string, string> = {
  Paripurna: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Utama:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Madya:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Dasar:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default async function ProfilBludPage() {
  const blud = await getData()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
          <Hospital className="h-3 w-3" /> Badan Layanan Umum Daerah
        </div>
        <h1 className="text-3xl font-bold mb-2">Profil BLUD</h1>
        <p className="text-muted-foreground max-w-xl">
          Profil Puskesmas BLUD yang memberikan pelayanan kesehatan masyarakat di Kota Batu.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blud.map(b => {
          const p = b.profil
          const akreditasi = p?.akreditasi as string | undefined
          return (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-secondary/40 transition-all group">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Hospital className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold leading-tight text-sm">{b.nama}</h2>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{b.jenis}</span>
                    {akreditasi && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${AKREDITASI_COLOR[akreditasi] ?? 'bg-gray-100 text-gray-600'}`}>
                        {akreditasi}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {p?.wilayah && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-secondary" />{p.wilayah}
                  </p>
                )}
                {p?.telepon && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-secondary" />{p.telepon as string}
                  </p>
                )}
                {p?.layanan && Array.isArray(p.layanan) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(p.layanan as string[]).slice(0, 3).map(l => (
                      <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{l}</span>
                    ))}
                    {(p.layanan as string[]).length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{(p.layanan as string[]).length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <Link href={`/profil/blud/${b.slug}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-border hover:bg-secondary hover:text-secondary-foreground hover:border-secondary font-semibold text-xs transition-all">
                Lihat Profil <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
