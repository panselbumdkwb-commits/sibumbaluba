import { createServerComponentClient } from '@/lib/supabase'
import HeroBanner from '@/components/public/HeroBanner'
import RunningText from '@/components/public/RunningText'
import StatistikWidget from '@/components/public/StatistikWidget'
import PengumumanList from '@/components/public/PengumumanList'
import SeleksiWidget from '@/components/public/SeleksiWidget'
import type { Statistik, Pengumuman, Seleksi } from '@/lib/types'

async function getData() {
  const supabase = await createServerComponentClient()

  const [statistikRes, pengumumanRes, seleksiRes] = await Promise.all([
    supabase.from('v_statistik').select('*').single(),
    supabase
      .from('pengumuman')
      .select('*')
      .eq('is_publik', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('seleksi')
      .select('*')
      .in('status', ['buka', 'tutup'])
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return {
    statistik: (statistikRes.data ?? {
      total_bumd: 2, total_blud: 5, total_seleksi: 0,
      total_peserta: 0, total_regulasi: 9, total_sop: 11,
    }) as Statistik,
    pengumuman: (pengumumanRes.data ?? []) as Pengumuman[],
    seleksi: (seleksiRes.data ?? []) as Seleksi[],
  }
}

export default async function BerandaPage() {
  const { statistik, pengumuman, seleksi } = await getData()

  return (
    <div className="flex flex-col gap-0">
      <RunningText
        items={pengumuman.map(p => p.judul).length > 0
          ? pengumuman.map(p => p.judul)
          : ['Selamat datang di SIMBUBALADA Kota Batu', 'Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD']}
      />
      <HeroBanner />
      <StatistikWidget statistik={statistik} />
      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PengumumanList pengumuman={pengumuman} />
        </div>
        <div>
          <SeleksiWidget seleksi={seleksi} />
        </div>
      </section>
    </div>
  )
}
