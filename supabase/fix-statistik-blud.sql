-- =============================================================
-- FIX: v_statistik BLUD = 0
-- Masalah: security_invoker = true menyebabkan RLS memblokir
-- query COUNT saat tidak ada session aktif (server component)
-- Solusi: Gunakan SECURITY DEFINER function sebagai wrapper
-- =============================================================

-- 1. Buat function dengan SECURITY DEFINER untuk bypass RLS pada count
CREATE OR REPLACE FUNCTION public.get_statistik()
RETURNS TABLE (
  total_bumd     bigint,
  total_blud     bigint,
  total_seleksi  bigint,
  total_peserta  bigint,
  total_regulasi bigint,
  total_sop      bigint
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM public.bumd      WHERE is_active = true)::bigint,
    (SELECT COUNT(*) FROM public.blud      WHERE is_active = true)::bigint,
    (SELECT COUNT(*) FROM public.seleksi)::bigint,
    (SELECT COUNT(*) FROM public.peserta_seleksi)::bigint,
    (SELECT COUNT(*) FROM public.regulasi  WHERE is_active = true)::bigint,
    (SELECT COUNT(*) FROM public.sop       WHERE is_active = true)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Drop view lama dan buat ulang dengan SECURITY DEFINER
DROP VIEW IF EXISTS public.v_statistik;

CREATE VIEW public.v_statistik
WITH (security_invoker = false)
AS
SELECT
  (SELECT COUNT(*) FROM public.bumd         WHERE is_active = true) AS total_bumd,
  (SELECT COUNT(*) FROM public.blud         WHERE is_active = true) AS total_blud,
  (SELECT COUNT(*) FROM public.seleksi)                             AS total_seleksi,
  (SELECT COUNT(*) FROM public.peserta_seleksi)                     AS total_peserta,
  (SELECT COUNT(*) FROM public.regulasi     WHERE is_active = true) AS total_regulasi,
  (SELECT COUNT(*) FROM public.sop          WHERE is_active = true) AS total_sop;

-- 3. Grant akses ke view
GRANT SELECT ON public.v_statistik TO authenticated;
GRANT SELECT ON public.v_statistik TO anon;

-- 4. Verifikasi
SELECT * FROM public.v_statistik;
