import { createServerComponentClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, FileText, Download, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import RegulasiFilerClient from '@/components/internal/RegulasiFilterClient'

async function getData() {
  const supabase = await createServerComponentClient()
  const [regulasiRes, kategoriRes] = await Promise.all([
    supabase.from('regulasi').select('*, kategori:kategori_regulasi(nama)').order('tahun', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('kategori_regulasi').select('*').order('urutan'),
  ])
  return { regulasi: regulasiRes.data ?? [], kategori: kategoriRes.data ?? [] }
}

export default async function RegulasiKelolaPage() {
  const { regulasi, kategori } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Regulasi</h1>
          <p className="text-sm text-muted-foreground mt-1">{regulasi.length} regulasi terdaftar</p>
        </div>
        <Link href="/regulasi/kelola/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Tambah Regulasi
        </Link>
      </div>

      <RegulasiFilerClient regulasi={regulasi} kategori={kategori} />
    </div>
  )
}
