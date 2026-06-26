-- ============================================================
-- SIMBUBALADA - Complete Seed Data
-- Jalankan di Supabase SQL Editor SETELAH schema.sql
-- Aman dijalankan ulang (ON CONFLICT DO NOTHING)
-- ============================================================

-- ── 1. ROLES ─────────────────────────────────────────────────
INSERT INTO roles (id, name, permissions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin',  '{"all": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'admin_bumd',   '{"bumd": true, "monev_bumd": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'admin_blud',   '{"blud": true, "monev_blud": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'tim_seleksi',  '{"seleksi": true, "peserta": true, "dokumen": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', 'viewer',       '{"read_only": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ── 2. BUMD ───────────────────────────────────────────────────
INSERT INTO bumd (id, nama, singkatan, jenis, slug, is_active, profil) VALUES
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Perusahaan Umum Daerah Air Minum Among Tani',
  'Perumdam Among Tani',
  'Perumdam',
  'perumdam-among-tani',
  true,
  jsonb_build_object(
    'alamat',        'Jl. Panglima Sudirman No. 507, Kota Batu, Jawa Timur 65311',
    'telepon',       '(0341) 591049',
    'email',         'perumdam.amongtani@gmail.com',
    'website',       'https://perumdam-amongtani.com',
    'tahun_berdiri', '1974',
    'modal_dasar',   'Rp 20.000.000.000',
    'direktur',      'Direktur Perumdam Among Tani',
    'layanan',       'Penyediaan, pengelolaan, dan distribusi air bersih dan air minum untuk masyarakat Kota Batu',
    'visi',          'Menjadi perusahaan air minum yang handal, profesional, dan mampu memberikan pelayanan terbaik kepada masyarakat Kota Batu',
    'misi',          jsonb_build_array(
                       'Meningkatkan kualitas dan kuantitas pelayanan air minum yang memenuhi standar kesehatan',
                       'Meningkatkan sumber daya manusia yang profesional dan berdedikasi tinggi',
                       'Mengoptimalkan pengelolaan aset dan keuangan perusahaan secara transparan',
                       'Memperluas jangkauan layanan air minum ke seluruh wilayah Kota Batu',
                       'Menerapkan tata kelola perusahaan yang baik (GCG)'
                     ),
    'coverage',      '75% wilayah Kota Batu',
    'pelanggan',     '35.000+',
    'bidang',        jsonb_build_array('Air Minum', 'Pengolahan Air', 'Distribusi Air Bersih')
  )
),
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  'PT Batu Wisata Resources',
  'PT BWR',
  'Perseroda',
  'pt-batu-wisata-resources',
  true,
  jsonb_build_object(
    'alamat',        'Jl. A. Yani No. 1, Kota Batu, Jawa Timur 65311',
    'telepon',       '(0341) 512345',
    'email',         'bwr@kotabatu.go.id',
    'tahun_berdiri', '2012',
    'modal_dasar',   'Rp 10.000.000.000',
    'direktur',      'Direktur PT Batu Wisata Resources',
    'layanan',       'Pengelolaan pariwisata, perhotelan, dan pengembangan sumber daya wisata Kota Batu',
    'visi',          'Menjadi perusahaan daerah unggulan dalam pengelolaan pariwisata dan sumber daya alam Kota Batu yang berkelanjutan',
    'misi',          jsonb_build_array(
                       'Mengelola dan mengembangkan potensi wisata daerah secara profesional',
                       'Meningkatkan Pendapatan Asli Daerah (PAD) melalui sektor pariwisata',
                       'Menciptakan lapangan kerja bagi masyarakat Kota Batu',
                       'Mengembangkan produk wisata yang berdaya saing nasional',
                       'Menerapkan prinsip pariwisata berkelanjutan dan ramah lingkungan'
                     ),
    'bidang',        jsonb_build_array('Pariwisata', 'Perhotelan', 'Event Organizer', 'MICE', 'Kuliner Daerah')
  )
)
ON CONFLICT (id) DO UPDATE SET
  nama     = EXCLUDED.nama,
  profil   = EXCLUDED.profil,
  updated_at = now();

-- ── 3. BLUD (5 Puskesmas) ─────────────────────────────────────
INSERT INTO blud (id, nama, jenis, slug, is_active, profil) VALUES
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'UPTD Puskesmas Batu',
  'PKM',
  'puskesmas-batu',
  true,
  jsonb_build_object(
    'alamat',              'Jl. Dewi Sartika No. 1, Kel. Sisir, Kec. Batu, Kota Batu 65311',
    'telepon',             '(0341) 592040',
    'email',               'pkm.batu@kotabatu.go.id',
    'wilayah',             'Kecamatan Batu (Kel. Sisir, Kel. Temas, Kel. Ngaglik, Kel. Oro-Oro Ombo)',
    'kepala',              'Kepala UPTD Puskesmas Batu',
    'tahun_berdiri',       '1980',
    'akreditasi',          'Paripurna',
    'jml_penduduk_wilayah','± 50.000 jiwa',
    'layanan',             jsonb_build_array(
                             'Rawat Jalan Umum', 'UGD 24 Jam', 'KIA & KB', 'Poli Gigi',
                             'Laboratorium', 'Farmasi', 'Promosi Kesehatan', 'Sanitasi'
                           )
  )
),
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'UPTD Puskesmas Beji',
  'PKM',
  'puskesmas-beji',
  true,
  jsonb_build_object(
    'alamat',              'Jl. Beji No. 15, Desa Beji, Kec. Junrejo, Kota Batu 65326',
    'telepon',             '(0341) 595123',
    'email',               'pkm.beji@kotabatu.go.id',
    'wilayah',             'Sebagian Kecamatan Junrejo (Desa Beji, Desa Tlekung, Desa Junrejo)',
    'kepala',              'Kepala UPTD Puskesmas Beji',
    'akreditasi',          'Utama',
    'jml_penduduk_wilayah','± 35.000 jiwa',
    'layanan',             jsonb_build_array(
                             'Rawat Jalan Umum', 'UGD', 'KIA & KB', 'Poli Gigi',
                             'Laboratorium', 'Farmasi', 'Konseling Gizi'
                           )
  )
),
(
  'bbbbbbbb-0000-0000-0000-000000000003',
  'UPTD Puskesmas Bumiaji',
  'PKM',
  'puskesmas-bumiaji',
  true,
  jsonb_build_object(
    'alamat',              'Jl. Raya Bumiaji No. 20, Desa Bumiaji, Kec. Bumiaji, Kota Batu 65331',
    'telepon',             '(0341) 596456',
    'email',               'pkm.bumiaji@kotabatu.go.id',
    'wilayah',             'Kecamatan Bumiaji (9 Desa)',
    'kepala',              'Kepala UPTD Puskesmas Bumiaji',
    'akreditasi',          'Utama',
    'jml_penduduk_wilayah','± 40.000 jiwa',
    'layanan',             jsonb_build_array(
                             'Rawat Jalan Umum', 'UGD', 'KIA & KB', 'Poli Gigi',
                             'Laboratorium', 'Farmasi', 'Kesehatan Jiwa', 'TB DOTS'
                           )
  )
),
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'UPTD Puskesmas Junrejo',
  'PKM',
  'puskesmas-junrejo',
  true,
  jsonb_build_object(
    'alamat',              'Jl. Raya Junrejo No. 5, Desa Torongrejo, Kec. Junrejo, Kota Batu 65324',
    'telepon',             '(0341) 597789',
    'email',               'pkm.junrejo@kotabatu.go.id',
    'wilayah',             'Sebagian Kecamatan Junrejo (Desa Torongrejo, Desa Dadaprejo, Desa Mojorejo, Desa Pendem)',
    'kepala',              'Kepala UPTD Puskesmas Junrejo',
    'akreditasi',          'Madya',
    'jml_penduduk_wilayah','± 30.000 jiwa',
    'layanan',             jsonb_build_array(
                             'Rawat Jalan Umum', 'UGD', 'KIA & KB', 'Poli Gigi',
                             'Laboratorium', 'Farmasi'
                           )
  )
),
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'UPTD Puskesmas Sisir',
  'PKM',
  'puskesmas-sisir',
  true,
  jsonb_build_object(
    'alamat',              'Jl. Raya Sisir No. 88, Kel. Sisir, Kec. Batu, Kota Batu 65313',
    'telepon',             '(0341) 598012',
    'email',               'pkm.sisir@kotabatu.go.id',
    'wilayah',             'Sebagian Kecamatan Batu (Kel. Songgokerto, Kel. Pesanggrahan, Desa Sumberejo)',
    'kepala',              'Kepala UPTD Puskesmas Sisir',
    'akreditasi',          'Utama',
    'jml_penduduk_wilayah','± 45.000 jiwa',
    'layanan',             jsonb_build_array(
                             'Rawat Jalan Umum', 'UGD 24 Jam', 'KIA & KB', 'Poli Gigi',
                             'Laboratorium', 'Farmasi', 'Poli Lansia', 'Kesehatan Jiwa'
                           )
  )
)
ON CONFLICT (id) DO UPDATE SET
  nama   = EXCLUDED.nama,
  profil = EXCLUDED.profil,
  updated_at = now();

-- ── 4. KATEGORI REGULASI ──────────────────────────────────────
INSERT INTO kategori_regulasi (id, nama, urutan) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'Undang-Undang',              1),
  ('cccccccc-0000-0000-0000-000000000002', 'Peraturan Pemerintah',       2),
  ('cccccccc-0000-0000-0000-000000000003', 'Peraturan Menteri',          3),
  ('cccccccc-0000-0000-0000-000000000004', 'Peraturan Daerah (Perda)',   4),
  ('cccccccc-0000-0000-0000-000000000005', 'Peraturan Wali Kota (Perwali)', 5),
  ('cccccccc-0000-0000-0000-000000000006', 'Keputusan Wali Kota',        6),
  ('cccccccc-0000-0000-0000-000000000007', 'Keputusan Kepala Dinas',     7),
  ('cccccccc-0000-0000-0000-000000000008', 'Pedoman Teknis',             8)
ON CONFLICT (id) DO NOTHING;

-- ── 5. REGULASI ───────────────────────────────────────────────
INSERT INTO regulasi (id, judul, nomor, tahun, kategori_id, is_active) VALUES
  ('dddddddd-0001-0000-0000-000000000000','Undang-Undang tentang Pemerintahan Daerah','UU No. 23',2014,'cccccccc-0000-0000-0000-000000000001',true),
  ('dddddddd-0002-0000-0000-000000000000','Peraturan Pemerintah tentang Perusahaan Umum Daerah dan Perusahaan Perseroan Daerah','PP No. 54',2017,'cccccccc-0000-0000-0000-000000000002',true),
  ('dddddddd-0003-0000-0000-000000000000','Permendagri tentang Pedoman Penilaian dan Evaluasi BUMD','Permendagri No. 118',2018,'cccccccc-0000-0000-0000-000000000003',true),
  ('dddddddd-0004-0000-0000-000000000000','Permendagri tentang Pedoman Teknis Pengelolaan Keuangan BLUD','Permendagri No. 79',2018,'cccccccc-0000-0000-0000-000000000003',true),
  ('dddddddd-0005-0000-0000-000000000000','Peraturan Menteri PUPR tentang Penyelenggaraan SPAM','Permen PUPR No. 25',2016,'cccccccc-0000-0000-0000-000000000003',true),
  ('dddddddd-0006-0000-0000-000000000000','Perda Kota Batu tentang Pendirian Perumdam Among Tani','Perda No. 3',2020,'cccccccc-0000-0000-0000-000000000004',true),
  ('dddddddd-0007-0000-0000-000000000000','Perda Kota Batu tentang Pendirian PT Batu Wisata Resources','Perda No. 4',2020,'cccccccc-0000-0000-0000-000000000004',true),
  ('dddddddd-0008-0000-0000-000000000000','Perwali Kota Batu tentang Tata Cara Seleksi Direksi dan Dewas BUMD','Perwali No. 15',2023,'cccccccc-0000-0000-0000-000000000005',true),
  ('dddddddd-0009-0000-0000-000000000000','Perwali Kota Batu tentang Penetapan BLUD Puskesmas','Perwali No. 22',2021,'cccccccc-0000-0000-0000-000000000005',true),
  ('dddddddd-0010-0000-0000-000000000000','Peraturan Menteri Kesehatan tentang Puskesmas','Permenkes No. 43',2019,'cccccccc-0000-0000-0000-000000000003',true),
  ('dddddddd-0011-0000-0000-000000000000','Peraturan Menteri Kesehatan tentang Standar Pelayanan Minimal Bidang Kesehatan','Permenkes No. 4',2019,'cccccccc-0000-0000-0000-000000000003',true)
ON CONFLICT (id) DO NOTHING;

-- ── 6. KATEGORI SOP ───────────────────────────────────────────
INSERT INTO kategori_sop (id, nama, entitas, urutan) VALUES
  ('eeeeeeee-0001-0000-0000-000000000000', 'Pembinaan dan Pengawasan',       'BUMD', 1),
  ('eeeeeeee-0002-0000-0000-000000000000', 'Monitoring dan Evaluasi',        'BUMD', 2),
  ('eeeeeeee-0003-0000-0000-000000000000', 'Pelaporan Kinerja',              'BUMD', 3),
  ('eeeeeeee-0004-0000-0000-000000000000', 'Tata Kelola Perusahaan (GCG)',   'BUMD', 4),
  ('eeeeeeee-0005-0000-0000-000000000000', 'Pengelolaan Keuangan',           'BLUD', 1),
  ('eeeeeeee-0006-0000-0000-000000000000', 'Monitoring Kinerja Pelayanan',   'BLUD', 2),
  ('eeeeeeee-0007-0000-0000-000000000000', 'Pelaporan dan Akreditasi',       'BLUD', 3),
  ('eeeeeeee-0008-0000-0000-000000000000', 'Standar Pelayanan Minimal (SPM)','BLUD', 4),
  ('eeeeeeee-0009-0000-0000-000000000000', 'Seleksi Direksi/Dewas',          'Umum', 1),
  ('eeeeeeee-0010-0000-0000-000000000000', 'Administrasi Kepegawaian',       'Umum', 2),
  ('eeeeeeee-0011-0000-0000-000000000000', 'Manajemen Dokumen',              'Umum', 3)
ON CONFLICT (id) DO NOTHING;

-- ── 7. SOP ────────────────────────────────────────────────────
INSERT INTO sop (id, judul, kode, kategori_id, versi, is_active) VALUES
  ('ffffffff-0001-0000-0000-000000000000','SOP Pembinaan Rutin BUMD Triwulanan',            'SOP-BUMD-01','eeeeeeee-0001-0000-0000-000000000000','1.0',true),
  ('ffffffff-0002-0000-0000-000000000000','SOP Evaluasi Kinerja BUMD Tahunan',              'SOP-BUMD-02','eeeeeeee-0002-0000-0000-000000000000','1.0',true),
  ('ffffffff-0003-0000-0000-000000000000','SOP Penerimaan dan Verifikasi Laporan Keuangan BUMD','SOP-BUMD-03','eeeeeeee-0003-0000-0000-000000000000','1.0',true),
  ('ffffffff-0004-0000-0000-000000000000','SOP Penilaian GCG BUMD',                        'SOP-BUMD-04','eeeeeeee-0004-0000-0000-000000000000','1.0',true),
  ('ffffffff-0005-0000-0000-000000000000','SOP Pengelolaan Anggaran RBA BLUD',              'SOP-BLUD-01','eeeeeeee-0005-0000-0000-000000000000','1.0',true),
  ('ffffffff-0006-0000-0000-000000000000','SOP Monitoring Capaian SPM Puskesmas',           'SOP-BLUD-02','eeeeeeee-0008-0000-0000-000000000000','1.0',true),
  ('ffffffff-0007-0000-0000-000000000000','SOP Pelaporan Kinerja BLUD Triwulanan',          'SOP-BLUD-03','eeeeeeee-0007-0000-0000-000000000000','1.0',true),
  ('ffffffff-0008-0000-0000-000000000000','SOP Persiapan dan Pendampingan Akreditasi Puskesmas','SOP-BLUD-04','eeeeeeee-0007-0000-0000-000000000000','1.0',true),
  ('ffffffff-0009-0000-0000-000000000000','SOP Proses Seleksi Direksi dan Dewan Pengawas BUMD','SOP-SEL-01','eeeeeeee-0009-0000-0000-000000000000','1.0',true),
  ('ffffffff-0010-0000-0000-000000000000','SOP Verifikasi Dokumen Peserta Seleksi',         'SOP-SEL-02','eeeeeeee-0009-0000-0000-000000000000','1.0',true),
  ('ffffffff-0011-0000-0000-000000000000','SOP Uji Kompetensi dan Kelayakan (UKK)',         'SOP-SEL-03','eeeeeeee-0009-0000-0000-000000000000','1.0',true)
ON CONFLICT (id) DO NOTHING;

-- ── 8. PENGUMUMAN AWAL ────────────────────────────────────────
INSERT INTO pengumuman (id, judul, isi, kategori, is_publik) VALUES
(
  '11111111-0001-0000-0000-000000000000',
  'Selamat Datang di SIMBUBALADA Kota Batu',
  'Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu telah resmi diluncurkan. Sistem ini bertujuan untuk meningkatkan transparansi dan akuntabilitas pengelolaan BUMD dan BLUD di Kota Batu. Masyarakat dapat mengakses informasi profil, regulasi, SOP, dan pengumuman seleksi melalui portal ini.',
  'umum',
  true
),
(
  '11111111-0002-0000-0000-000000000000',
  'Jadwal Monitoring dan Evaluasi BUMD Triwulan I Tahun 2025',
  'Pelaksanaan monitoring dan evaluasi kinerja BUMD Triwulan I Tahun 2025 akan dilaksanakan pada bulan April 2025. Seluruh Direksi BUMD diharapkan mempersiapkan laporan kinerja dan laporan keuangan sesuai format yang telah ditentukan.',
  'monev',
  true
),
(
  '11111111-0003-0000-0000-000000000000',
  'Pedoman Upload Dokumen Portal Peserta Seleksi',
  'Kepada seluruh peserta seleksi, harap memperhatikan ketentuan upload dokumen: (1) Format file PDF/JPG/PNG, (2) Ukuran maksimal 5MB per file, (3) Dokumen harus terbaca jelas, (4) Pastikan semua dokumen wajib diupload sebelum batas waktu verifikasi.',
  'seleksi',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ── VERIFIKASI ────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM roles)             AS roles,
  (SELECT count(*) FROM bumd)              AS bumd,
  (SELECT count(*) FROM blud)              AS blud,
  (SELECT count(*) FROM kategori_regulasi) AS kat_regulasi,
  (SELECT count(*) FROM regulasi)          AS regulasi,
  (SELECT count(*) FROM kategori_sop)      AS kat_sop,
  (SELECT count(*) FROM sop)               AS sop,
  (SELECT count(*) FROM pengumuman)        AS pengumuman;
