import { createServerComponentClient } from '@/lib/supabase-server'
import { BookOpen } from 'lucide-react'
import SopPublikClient from '@/components/public/SopPublikClient'

async function getData() {
  const supabase = await createServerComponentClient()
  const [sopRes, kategoriRes] = await Promise.all([
    supabase.from('sop').select('*, kategori:kategori_sop(nama, entitas)').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('kategori_sop').select('*').order('entitas').order('urutan'),
  ])
  return { sop: sopRes.data ?? [], kategori: kategoriRes.data ?? [] }
}

export default async function SopPage() {
  const { sop, kategori } = await getData()
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-4">
          <BookOpen className="h-3 w-3" />
          Standar Operasional Prosedur
        </div>
        <h1 className="text-3xl font-bold mb-2">SOP</h1>
        <p className="text-muted-foreground max-w-xl">
          Kumpulan Standar Operasional Prosedur untuk pengelolaan BUMD, BLUD, dan proses seleksi Kota Batu.
        </p>
      </div>
      <SopPublikClient sop={sop} kategori={kategori} />
    </div>
  )
}
