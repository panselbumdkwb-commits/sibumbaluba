import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SeleksiDashboardClient from '@/components/internal/SeleksiDashboardClient'

async function getData(seleksiId: string) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [seleksiRes, pesertaRes, tahapanRes] = await Promise.all([
    supabase.from('seleksi').select('*').eq('id', seleksiId).single(),
    supabase.from('v_peserta_lengkap').select('*').eq('seleksi_id', seleksiId).order('created_at'),
    supabase.from('tahapan_seleksi').select('*').eq('seleksi_id', seleksiId).order('urutan'),
  ])

  if (!seleksiRes.data) redirect('/seleksi')

  return {
    seleksi: seleksiRes.data,
    peserta: pesertaRes.data ?? [],
    tahapan: tahapanRes.data ?? [],
  }
}

export default async function SeleksiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { seleksi, peserta, tahapan } = await getData(id)
  return <SeleksiDashboardClient seleksi={seleksi} peserta={peserta} tahapan={tahapan} />
}
