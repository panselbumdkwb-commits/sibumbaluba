-- =============================================================
-- SIBUMBALUMBA - FIX LEGACY ROLE FUNCTIONS
-- =============================================================
-- FILE   : supabase/migrations/002_fix_legacy_role_functions.sql
-- TANGGAL: 2026-06-30
-- TUJUAN : Memperbaiki RLS policy yang masih menggunakan role lama
--          (tim_seleksi) agar mengenali role baru
--          (panitia_seleksi, penilai_ukk, admin_bpsda)
-- =============================================================
-- CARA PENGGUNAAN:
-- Jalankan file ini di Supabase → SQL Editor setelah migration
-- 001_sibumbalumba_init.sql
-- =============================================================


-- =============================================================
-- BAGIAN 1: UPDATE FUNGSI is_tim_seleksi()
-- Sekarang mencakup: super_admin, panitia_seleksi, penilai_ukk,
-- tim_seleksi (role lama, dipertahankan untuk kompatibilitas)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_tim_seleksi()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() IN (
    'super_admin', 'panitia_seleksi', 'penilai_ukk', 'tim_seleksi'
  );
$function$;


-- =============================================================
-- BAGIAN 2: UPDATE FUNGSI is_admin_bumd()
-- Sekarang mencakup: super_admin, admin_bumd, admin_bpsda
-- (admin_bpsda punya akses penuh ke monev BUMD & BLUD)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_admin_bumd()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() IN (
    'super_admin', 'admin_bumd', 'admin_bpsda'
  );
$function$;


-- =============================================================
-- BAGIAN 3: UPDATE FUNGSI is_admin_blud()
-- Sekarang mencakup: super_admin, admin_blud, admin_bpsda
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_admin_blud()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() IN (
    'super_admin', 'admin_blud', 'admin_bpsda'
  );
$function$;


-- =============================================================
-- BAGIAN 4: UPDATE FUNGSI is_super_admin()
-- Tetap hanya super_admin
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() = 'super_admin';
$function$;


-- =============================================================
-- BAGIAN 5: UPDATE FUNGSI is_internal_user()
-- Semua role internal kecuali peserta
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() IN (
    'super_admin', 'admin_bumd', 'admin_blud', 'admin_bpsda',
    'panitia_seleksi', 'penilai_ukk', 'tim_seleksi', 'viewer'
  );
$function$;


-- =============================================================
-- BAGIAN 6: PASTIKAN SEMUA POLICY ALL PUNYA WITH CHECK
-- Tabel seleksi (sudah diperbaiki sebelumnya, dipastikan lagi)
-- =============================================================
DROP POLICY IF EXISTS "seleksi_manage" ON public.seleksi;
CREATE POLICY "seleksi_manage" ON public.seleksi
  FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'panitia_seleksi'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'panitia_seleksi'));

-- Tahapan seleksi
DROP POLICY IF EXISTS "tahapan_manage" ON public.tahapan_seleksi;
CREATE POLICY "tahapan_manage" ON public.tahapan_seleksi
  FOR ALL
  USING (public.is_tim_seleksi())
  WITH CHECK (public.is_tim_seleksi());

-- Hasil seleksi
DROP POLICY IF EXISTS "hasil_manage" ON public.hasil_seleksi;
CREATE POLICY "hasil_manage" ON public.hasil_seleksi
  FOR ALL
  USING (public.is_tim_seleksi())
  WITH CHECK (public.is_tim_seleksi());

-- Dokumen peserta — update
DROP POLICY IF EXISTS "dokumen_update_tim" ON public.dokumen_peserta;
CREATE POLICY "dokumen_update_tim" ON public.dokumen_peserta
  FOR UPDATE
  USING (public.is_tim_seleksi())
  WITH CHECK (public.is_tim_seleksi());

-- Peserta seleksi — update
DROP POLICY IF EXISTS "peserta_update_tim" ON public.peserta_seleksi;
CREATE POLICY "peserta_update_tim" ON public.peserta_seleksi
  FOR UPDATE
  USING (public.is_tim_seleksi())
  WITH CHECK (public.is_tim_seleksi());

-- Monev BUMD — pastikan WITH CHECK ada
DROP POLICY IF EXISTS "monev_bumd_manage" ON public.monev_bumd;
CREATE POLICY "monev_bumd_manage" ON public.monev_bumd
  FOR ALL
  USING (public.is_admin_bumd())
  WITH CHECK (public.is_admin_bumd());

-- Monev BLUD — pastikan WITH CHECK ada
DROP POLICY IF EXISTS "monev_blud_manage" ON public.monev_blud;
CREATE POLICY "monev_blud_manage" ON public.monev_blud
  FOR ALL
  USING (public.is_admin_blud())
  WITH CHECK (public.is_admin_blud());

-- Pengumuman — pastikan WITH CHECK ada
DROP POLICY IF EXISTS "pengumuman_manage" ON public.pengumuman;
CREATE POLICY "pengumuman_manage" ON public.pengumuman
  FOR ALL
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- Notifikasi — pastikan WITH CHECK ada
DROP POLICY IF EXISTS "notifikasi_manage" ON public.notifikasi;
CREATE POLICY "notifikasi_manage" ON public.notifikasi
  FOR ALL
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());


-- =============================================================
-- BAGIAN 7: TAMBAH FUNGSI BARU UNTUK PENILAI UKK
-- (akses spesifik tahapan UKK: ujian tulis, presentasi, wawancara)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_penilai_ukk()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $function$
  SELECT public.get_my_role() IN ('super_admin', 'penilai_ukk');
$function$;


-- =============================================================
-- BAGIAN 8: VERIFIKASI SEMUA FUNGSI BEKERJA
-- =============================================================
SELECT
  public.is_tim_seleksi()   AS is_tim_seleksi,
  public.is_admin_bumd()    AS is_admin_bumd,
  public.is_admin_blud()    AS is_admin_blud,
  public.is_super_admin()   AS is_super_admin,
  public.is_internal_user() AS is_internal_user,
  public.is_penilai_ukk()   AS is_penilai_ukk;

-- Verifikasi semua policy ALL sudah punya WITH CHECK
SELECT
  tablename,
  policyname,
  cmd,
  CASE WHEN with_check IS NULL THEN '⚠️ TIDAK ADA' ELSE '✅ ADA' END AS with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'ALL'
ORDER BY tablename, policyname;

-- Verifikasi role semua akun
SELECT
  u.username,
  r.name AS role,
  u.is_active
FROM public.users u
LEFT JOIN public.roles r ON r.id = u.role_id
ORDER BY r.name, u.username;
