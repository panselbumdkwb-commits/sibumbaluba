import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Building2, MapPin, Phone, Globe, ArrowRight } from 'lucide-react'
import type { Bumd } from '@/lib/types'

async function getData() {
  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('bumd').select('*').eq('is_active', true).order('nama')
  return (data ?? []) as Bumd[]
}

export default async function ProfilBumdPage() {
  const bumd = await getData()
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
          <Building2 className="h-3 w-3" /> Badan Usaha Milik Daerah
        </div>
        <h1 className="text-3xl font-bold mb-2">Profil BUMD</h1>
        <p className="text-muted-foreground max-w-xl">
          Informasi lengkap Badan Usaha Milik Daerah yang dimiliki dan dikelola Pemerintah Kota Batu.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {bumd.map(b => (
          <div key={b.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{b.nama}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">{b.jenis}</span>
              </div>
            </div>
            {b.profil && (
              <div className="space-y-2 mb-5">
                {b.profil.alamat && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{b.profil.alamat}</span>
                  </div>
                )}
                {b.profil.telepon && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />{b.profil.telepon}
                  </div>
                )}
                {b.profil.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0 text-primary" />
                    <a href={b.profil.website} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline">{b.profil.website}</a>
                  </div>
                )}
                {b.profil.layanan && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {typeof b.profil.layanan === 'string' ? b.profil.layanan : (b.profil.layanan as string[]).join(', ')}
                  </p>
                )}
              </div>
            )}
            <Link href={`/profil/bumd/${b.slug}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary font-semibold text-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
              Lihat Profil Lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
