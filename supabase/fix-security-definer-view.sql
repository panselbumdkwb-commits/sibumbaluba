-- ============================================================
-- SIBUMBALUMBA - Hotfix: Security Definer View
-- Jalankan di Supabase SQL Editor jika sudah deploy schema lama
--
-- Error yang diperbaiki:
--   [ERROR] security_definer_view: v_peserta_lengkap
--   [ERROR] security_definer_view: v_statistik
--
-- Root cause:
--   View yang dibuat oleh role "postgres" (superuser) secara
--   default menggunakan SECURITY DEFINER, sehingga RLS dari
--   tabel yang dirujuk tidak berlaku — semua data bisa dibaca
--   terlepas dari policy yang ada.
--
-- Fix:
--   Tambahkan WITH (security_invoker = true) agar view
--   menjalankan query dengan izin user yang sedang login,
--   sehingga RLS tetap aktif.
-- ============================================================

-- ── Drop view lama ────────────────────────────────────────────
DROP VIEW IF EXISTS public.v_peserta_lengkap;
DROP VIEW IF EXISTS public.v_statistik;

-- ── Buat ulang dengan SECURITY INVOKER ───────────────────────

CREATE VIEW public.v_peserta_lengkap
WITH (security_invoker = true)
AS
SELECT
  p.*,
  s.judul   AS seleksi_judul,
  s.jenis   AS seleksi_jenis,
  s.entitas AS seleksi_entitas,
  COUNT(d.id)                                                       AS total_dokumen,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'diverifikasi')  AS dokumen_verified,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'ditolak')       AS dokumen_ditolak,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'pending')       AS dokumen_pending
FROM peserta_seleksi p
JOIN seleksi s          ON p.seleksi_id = s.id
LEFT JOIN dokumen_peserta d ON p.id     = d.peserta_id
GROUP BY p.id, s.judul, s.jenis, s.entitas;

CREATE VIEW public.v_statistik
WITH (security_invoker = true)
AS
SELECT
  (SELECT COUNT(*) FROM bumd        WHERE is_active = true)             AS total_bumd,
  (SELECT COUNT(*) FROM blud        WHERE is_active = true)             AS total_blud,
  (SELECT COUNT(*) FROM seleksi     WHERE status IN ('buka','selesai')) AS total_seleksi,
  (SELECT COUNT(*) FROM peserta_seleksi)                                AS total_peserta,
  (SELECT COUNT(*) FROM regulasi    WHERE is_active = true)             AS total_regulasi,
  (SELECT COUNT(*) FROM sop         WHERE is_active = true)             AS total_sop;

-- ── Verifikasi: pastikan tidak ada lagi SECURITY DEFINER ──────
SELECT
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('v_peserta_lengkap', 'v_statistik');

-- Harus TIDAK ada kata "security_definer" di kolom definition.
-- Jika query di atas mengembalikan 2 baris tanpa error → fix berhasil.

-- ── Verifikasi linter (opsional) ──────────────────────────────
-- Buka Supabase Dashboard → Database → Linter
-- Pastikan kedua error security_definer_view sudah hilang.
