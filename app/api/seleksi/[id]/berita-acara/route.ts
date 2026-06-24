import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerComponentClient()

    // Ambil data seleksi lengkap
    const [seleksiRes, pesertaRes, hasilRes, tahapanRes] = await Promise.all([
      supabase.from('seleksi').select('*').eq('id', id).single(),
      supabase.from('peserta_seleksi').select('*').eq('seleksi_id', id).order('nomor_peserta'),
      supabase.from('hasil_seleksi').select('*, tahapan:tahapan_seleksi(nama_tahap, urutan), peserta:peserta_seleksi(nama, nomor_peserta)').eq('peserta_id', id),
      supabase.from('tahapan_seleksi').select('*').eq('seleksi_id', id).order('urutan'),
    ])

    if (!seleksiRes.data) {
      return NextResponse.json({ error: 'Seleksi tidak ditemukan' }, { status: 404 })
    }

    const seleksi = seleksiRes.data
    const peserta = pesertaRes.data ?? []
    const tahapan = tahapanRes.data ?? []

    // Generate HTML untuk PDF (dikirim sebagai HTML, di-print oleh browser)
    const now = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    const lulusAkhir = peserta.filter(p => p.status === 'lulus_akhir')
    const lulusAdmin = peserta.filter(p => ['lulus_admin', 'undangan_ukk', 'lulus_ukk', 'lulus_akhir'].includes(p.status))

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Berita Acara – ${seleksi.judul}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 2cm; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 3px double #000; padding-bottom: 16px; }
    .header h1 { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .header p { font-size: 11pt; margin-top: 4px; }
    h2 { font-size: 13pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 20px 0 12px; }
    .nomor { text-align: center; margin-bottom: 20px; font-size: 11pt; }
    .isi p { text-align: justify; line-height: 1.8; margin-bottom: 8px; }
    .isi strong { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11pt; }
    th { background: #f0f0f0; border: 1px solid #000; padding: 6px 8px; text-align: center; font-weight: bold; }
    td { border: 1px solid #000; padding: 5px 8px; }
    .ttd { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .ttd-box { text-align: center; }
    .ttd-box .space { height: 70px; }
    .ttd-box p { border-top: 1px solid #000; display: inline-block; padding-top: 4px; min-width: 200px; }
    .lampiran { margin-top: 16px; }
    @media print { body { padding: 1.5cm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pemerintah Kota Batu</h1>
    <p>Bagian Perekonomian dan Sumber Daya Alam</p>
    <p>Sekretariat Daerah Kota Batu</p>
    <p>Jl. Panglima Sudirman No. 507, Kota Batu, Jawa Timur 65311</p>
  </div>

  <h2>Berita Acara</h2>
  <h2>Proses ${seleksi.jenis} ${seleksi.entitas}</h2>
  <div class="nomor">Nomor: .........../BA-SIMBUBALADA/${new Date().getFullYear()}</div>

  <div class="isi">
    <p>Pada hari ini, tanggal <strong>${now}</strong>, kami yang bertanda tangan di bawah ini, Tim Seleksi
    yang dibentuk berdasarkan Keputusan Wali Kota Batu, telah melaksanakan proses seleksi
    <strong>${seleksi.jenis}</strong> untuk <strong>${seleksi.entitas}</strong> Kota Batu
    dengan judul: <strong>"${seleksi.judul}"</strong>.</p>

    <p>Proses seleksi dilaksanakan melalui tahapan sebagai berikut:</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th><th>Tahapan</th><th>Tanggal</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${tahapan.map((t, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${t.nama_tahap}</td>
          <td style="text-align:center">${t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
          <td style="text-align:center">${t.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="isi">
    <p>Jumlah pendaftar yang masuk: <strong>${peserta.length} orang</strong></p>
    <p>Jumlah peserta lulus administrasi: <strong>${lulusAdmin.length} orang</strong></p>
    <p>Jumlah peserta dinyatakan lulus akhir: <strong>${lulusAkhir.length} orang</strong></p>
  </div>

  <p style="margin-top:16px; font-weight:bold;">Daftar Peserta Lulus Akhir:</p>
  <table>
    <thead>
      <tr><th>No</th><th>Nomor Peserta</th><th>Nama Lengkap</th><th>Pendidikan</th><th>Keterangan</th></tr>
    </thead>
    <tbody>
      ${lulusAkhir.length > 0 ? lulusAkhir.map((p, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td style="text-align:center">${p.nomor_peserta ?? '-'}</td>
          <td>${p.nama}</td>
          <td style="text-align:center">${p.pendidikan ?? '-'}</td>
          <td style="text-align:center">Lulus</td>
        </tr>
      `).join('') : '<tr><td colspan="5" style="text-align:center">Belum ada peserta lulus akhir</td></tr>'}
    </tbody>
  </table>

  <div class="isi" style="margin-top:16px;">
    <p>Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
  </div>

  <div class="ttd">
    <div class="ttd-box">
      <p>Ketua Tim Seleksi</p>
      <div class="space"></div>
      <p>( ............................. )<br/>NIP. ............................</p>
    </div>
    <div class="ttd-box">
      <p>Sekretaris Tim Seleksi</p>
      <div class="space"></div>
      <p>( ............................. )<br/>NIP. ............................</p>
    </div>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="BeritaAcara_${id}.html"`,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal generate berita acara' }, { status: 500 })
  }
}
