// app/(public)/regulasi/page.tsx
import { createServerComponentClient } from '@/lib/supabase'
import { FileText, Download, Search } from 'lucide-react'
import RegulasiPublikClient from '@/components/public/RegulasiPublikClient'

async function getData() {
  const supabase = await createServerComponentClient()
  const [regulasiRes, kategoriRes] = await Promise.all([
    supabase.from('regulasi').select('*, kategori:kategori_regulasi(nama, urutan)').eq('is_active', true).order('tahun', { ascending: false }),
    supabase.from('kategori_regulasi').select('*').order('urutan'),
  ])
  return { regulasi: regulasiRes.data ?? [], kategori: kategoriRes.data ?? [] }
}

export default async function RegulasiPage() {
  const { regulasi, kategori } = await getData()
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <FileText className="h-3 w-3" />
          Dokumen Hukum & Peraturan
        </div>
        <h1 className="text-3xl font-bold mb-2">Regulasi</h1>
        <p className="text-muted-foreground max-w-xl">
          Kumpulan peraturan perundang-undangan dan regulasi yang mengatur pengelolaan BUMD dan BLUD Kota Batu.
        </p>
      </div>
      <RegulasiPublikClient regulasi={regulasi} kategori={kategori} />
    </div>
  )
}
