-- ============================================================
-- SIMBUBALADA - Fix Duplicate Key Error
-- Jalankan ini jika muncul error:
--   "duplicate key value violates unique constraint bumd_slug_key"
--   "duplicate key value violates unique constraint blud_slug_key"
--
-- PENYEBAB: schema.sql lama menyertakan INSERT data tanpa
-- ON CONFLICT, sehingga data ganda saat dijalankan ulang.
--
-- SOLUSI: Hapus data lama yang tidak pakai UUID fixed,
-- lalu jalankan ulang seed-data.sql.
-- ============================================================

-- ── STEP 1: Hapus data BUMD/BLUD lama (pakai gen_random_uuid) ─
-- Ini hanya menghapus baris yang slugnya sama tapi UUID-nya bukan
-- UUID fixed dari seed-data.sql

DELETE FROM bumd
WHERE slug IN ('perumdam-among-tani', 'pt-batu-wisata-resources')
  AND id NOT IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002'
  );

DELETE FROM blud
WHERE slug IN ('puskesmas-batu','puskesmas-beji','puskesmas-bumiaji','puskesmas-junrejo','puskesmas-sisir')
  AND id NOT IN (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000005'
  );

-- ── STEP 2: Hapus kategori & regulasi/SOP lama jika ada duplikat ─
DELETE FROM regulasi
WHERE id NOT IN (
  'dddddddd-0001-0000-0000-000000000000',
  'dddddddd-0002-0000-0000-000000000000',
  'dddddddd-0003-0000-0000-000000000000',
  'dddddddd-0004-0000-0000-000000000000',
  'dddddddd-0005-0000-0000-000000000000',
  'dddddddd-0006-0000-0000-000000000000',
  'dddddddd-0007-0000-0000-000000000000',
  'dddddddd-0008-0000-0000-000000000000',
  'dddddddd-0009-0000-0000-000000000000',
  'dddddddd-0010-0000-0000-000000000000',
  'dddddddd-0011-0000-0000-000000000000'
);

DELETE FROM sop
WHERE id NOT IN (
  'ffffffff-0001-0000-0000-000000000000',
  'ffffffff-0002-0000-0000-000000000000',
  'ffffffff-0003-0000-0000-000000000000',
  'ffffffff-0004-0000-0000-000000000000',
  'ffffffff-0005-0000-0000-000000000000',
  'ffffffff-0006-0000-0000-000000000000',
  'ffffffff-0007-0000-0000-000000000000',
  'ffffffff-0008-0000-0000-000000000000',
  'ffffffff-0009-0000-0000-000000000000',
  'ffffffff-0010-0000-0000-000000000000',
  'ffffffff-0011-0000-0000-000000000000'
);

DELETE FROM kategori_regulasi
WHERE id NOT IN (
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000004',
  'cccccccc-0000-0000-0000-000000000005',
  'cccccccc-0000-0000-0000-000000000006',
  'cccccccc-0000-0000-0000-000000000007',
  'cccccccc-0000-0000-0000-000000000008'
);

DELETE FROM kategori_sop
WHERE id NOT IN (
  'eeeeeeee-0001-0000-0000-000000000000',
  'eeeeeeee-0002-0000-0000-000000000000',
  'eeeeeeee-0003-0000-0000-000000000000',
  'eeeeeeee-0004-0000-0000-000000000000',
  'eeeeeeee-0005-0000-0000-000000000000',
  'eeeeeeee-0006-0000-0000-000000000000',
  'eeeeeeee-0007-0000-0000-000000000000',
  'eeeeeeee-0008-0000-0000-000000000000',
  'eeeeeeee-0009-0000-0000-000000000000',
  'eeeeeeee-0010-0000-0000-000000000000',
  'eeeeeeee-0011-0000-0000-000000000000'
);

-- ── STEP 3: Verifikasi kondisi sebelum re-seed ─────────────────
SELECT 'bumd' AS tabel, count(*) AS jumlah FROM bumd
UNION ALL
SELECT 'blud', count(*) FROM blud
UNION ALL
SELECT 'kategori_regulasi', count(*) FROM kategori_regulasi
UNION ALL
SELECT 'regulasi', count(*) FROM regulasi
UNION ALL
SELECT 'kategori_sop', count(*) FROM kategori_sop
UNION ALL
SELECT 'sop', count(*) FROM sop;

-- ── STEP 4: Setelah script ini berhasil ───────────────────────
-- Jalankan seed-data.sql untuk mengisi data yang benar.
-- seed-data.sql menggunakan ON CONFLICT DO UPDATE
-- sehingga aman dijalankan berulang kali.
-- ============================================================
