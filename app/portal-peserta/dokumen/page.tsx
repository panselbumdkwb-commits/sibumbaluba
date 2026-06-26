import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import UploadDokumenClient from '@/components/public/UploadDokumenClient'
import type { DokumenPeserta, PesertaSeleksi, Seleksi } from '@/lib/types'

async function getData() {
  const supabase = await createServerComponentClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/portal-peserta/login')

  const { data: peserta } = await supabase
    .from('peserta_seleksi')
    .select('*, seleksi(*)')
    .eq('auth_user_id', authUser.id)
    .single()

  if (!peserta) redirect('/portal-peserta/login')

  const { data: dokumen } = await supabase
    .from('dokumen_peserta')
    .select('*')
    .eq('peserta_id', peserta.id)

  const { data: notifikasi } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('peserta_id', peserta.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    peserta: peserta as PesertaSeleksi & { seleksi: Seleksi },
    dokumen: (dokumen ?? []) as DokumenPeserta[],
    notifikasi: notifikasi ?? [],
  }
}

export default async function DokumenPesertaPage() {
  const { peserta, dokumen, notifikasi } = await getData()
  return <UploadDokumenClient peserta={peserta} dokumen={dokumen} notifikasi={notifikasi} />
}
