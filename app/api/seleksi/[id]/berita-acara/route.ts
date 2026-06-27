import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

interface PesertaRow  { nama: string; nomor_peserta: string | null; pendidikan: string | null; status: string }
interface TahapanRow  { nama_tahap: string; tanggal_mulai: string | null; status: string }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerComponentClient()

    const [seleksiRes, pesertaRes, tahapanRes] = await Promise.all([
      supabase.from('seleksi').select('*').eq('id', id).single(),
      supabase.from('peserta_seleksi')
        .select('nama,nomor_peserta,pendidikan,status')
        .eq('seleksi_id', id)
        .order('nomor_peserta'),
      supabase.from('tahapan_seleksi')
        .select('nama_tahap,tanggal_mulai,status')
        .eq('seleksi_id', id)
        .order('urutan'),
    ])

    if (!seleksiRes.data) {
      return NextResponse.json({ error: 'Seleksi tidak ditemukan' }, { status: 404 })
    }

    const seleksi  = seleksiRes.data
    const peserta  = (pesertaRes.data ?? []) as PesertaRow[]
    const tahapan  = (tahapanRes.data ?? []) as TahapanRow[]
    const now      = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const lulusAkhir  = peserta.filter((p: PesertaRow) => p.status === 'lulus_akhir')
    const lulusAdmin  = peserta.filter((p: PesertaRow) =>
      ['lulus_admin','undangan_ukk','lulus_ukk','lulus_akhir'].includes(p.status)
    )

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Berita Acara – ${seleksi.judul}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Times New Roman',serif;font-size:12pt;color:#000;padding:2cm}
  .header{text-align:center;border-bottom:3px double #000;padding-bottom:16px;margin-bottom:20px}
  .header h1{font-size:13pt;font-weight:bold;text-transform:uppercase}
  h2{font-size:12pt;font-weight:bold;text-align:center;text-transform:uppercase;margin:16px 0 8px}
  .nomor{text-align:center;margin-bottom:20px}
  p{text-align:justify;line-height:1.8;margin-bottom:8px}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11pt}
  th{background:#eee;border:1px solid #000;padding:5px 8px;text-align:center;font-weight:bold}
  td{border:1px solid #000;padding:4px 8px}
  .ttd{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
  .ttd-box{text-align:center}.space{height:70px}
  .ttd-box p{border-top:1px solid #000;display:inline-block;padding-top:4px;min-width:180px}
  @media print{body{padding:1.5cm}}
</style>
</head>
<body>
<div class="header">
  <h1>Pemerintah Kota Batu</h1>
  <p>Bagian Perekonomian dan Sumber Daya Alam – Sekretariat Daerah Kota Batu</p>
  <p>Jl. Panglima Sudirman No. 507, Kota Batu, Jawa Timur 65311</p>
</div>
<h2>Berita Acara Seleksi</h2>
<h2>${seleksi.jenis} ${seleksi.entitas} Kota Batu</h2>
<div class="nomor">Nomor: .........../BA-SIBUMBALUMBA/${new Date().getFullYear()}</div>
<p>Pada hari ini <strong>${now}</strong>, Tim Seleksi yang dibentuk berdasarkan Keputusan Wali Kota Batu
telah melaksanakan proses seleksi <strong>${seleksi.jenis}</strong> untuk <strong>${seleksi.entitas}</strong>
dengan judul: <strong>&ldquo;${seleksi.judul}&rdquo;</strong>.</p>
<p><strong>Tahapan yang dilaksanakan:</strong></p>
<table>
  <thead><tr><th>No</th><th>Tahapan</th><th>Tanggal</th><th>Status</th></tr></thead>
  <tbody>
    ${tahapan.map((t: TahapanRow, i: number) => `<tr>
      <td style="text-align:center">${i+1}</td><td>${t.nama_tahap}</td>
      <td style="text-align:center">${t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
      <td style="text-align:center">${t.status}</td>
    </tr>`).join('')}
  </tbody>
</table>
<p>Jumlah pendaftar: <strong>${peserta.length} orang</strong></p>
<p>Lulus administrasi: <strong>${lulusAdmin.length} orang</strong></p>
<p>Lulus akhir: <strong>${lulusAkhir.length} orang</strong></p>
<p><strong>Daftar Peserta Lulus Akhir:</strong></p>
<table>
  <thead><tr><th>No</th><th>No. Peserta</th><th>Nama Lengkap</th><th>Pendidikan</th><th>Ket.</th></tr></thead>
  <tbody>
    ${lulusAkhir.length > 0
      ? lulusAkhir.map((p: PesertaRow, i: number) => `<tr>
          <td style="text-align:center">${i+1}</td>
          <td style="text-align:center">${p.nomor_peserta ?? '-'}</td>
          <td>${p.nama}</td>
          <td style="text-align:center">${p.pendidikan ?? '-'}</td>
          <td style="text-align:center">Lulus</td>
        </tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center">Belum ada peserta lulus akhir</td></tr>'
    }
  </tbody>
</table>
<p>Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
<div class="ttd">
  <div class="ttd-box"><p>Ketua Tim Seleksi</p><div class="space"></div>
    <p>( ............................. )<br/>NIP. ......................</p></div>
  <div class="ttd-box"><p>Sekretaris Tim Seleksi</p><div class="space"></div>
    <p>( ............................. )<br/>NIP. ......................</p></div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal generate berita acara' }, { status: 500 })
  }
}
