-- =============================================================
-- SIBUMBALUMBA - SECURITY HARDENING
-- =============================================================

-- =============================================
-- 1. RATE LIMITING TABLE (blokir brute force)
-- =============================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address  TEXT NOT NULL,
  username    TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success     BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip 
  ON public.login_attempts(ip_address, attempted_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_username 
  ON public.login_attempts(username, attempted_at);

-- Auto cleanup login attempts > 24 jam
CREATE OR REPLACE FUNCTION public.cleanup_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.login_attempts 
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. AUDIT LOG YANG LEBIH LENGKAP
-- =============================================
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address  TEXT,
  ADD COLUMN IF NOT EXISTS user_agent  TEXT,
  ADD COLUMN IF NOT EXISTS severity    TEXT DEFAULT 'info';

-- =============================================
-- 3. SESSION BLACKLIST (untuk force logout)
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_blacklist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason     TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 4. PASTIKAN SEMUA TABEL SENSITIF ADA RLS
-- =============================================
ALTER TABLE public.login_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- Hanya super_admin yang bisa lihat audit logs
DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- Service role full access ke login_attempts
DROP POLICY IF EXISTS "login_attempts_service" ON public.login_attempts;
CREATE POLICY "login_attempts_service" ON public.login_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "session_blacklist_service" ON public.session_blacklist;
CREATE POLICY "session_blacklist_service" ON public.session_blacklist
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- 5. REVOKE AKSES PUBLIK YANG TIDAK PERLU
-- =============================================
REVOKE ALL ON public.users          FROM anon;
REVOKE ALL ON public.roles          FROM anon;
REVOKE ALL ON public.audit_logs     FROM anon;
REVOKE ALL ON public.monev_bumd     FROM anon;
REVOKE ALL ON public.monev_blud     FROM anon;
REVOKE ALL ON public.peserta_seleksi FROM anon;
REVOKE ALL ON public.penilaian_ukk  FROM anon;

-- Tabel publik tetap bisa dibaca tanpa login
GRANT SELECT ON public.bumd         TO anon;
GRANT SELECT ON public.blud         TO anon;
GRANT SELECT ON public.regulasi     TO anon;
GRANT SELECT ON public.sop          TO anon;
GRANT SELECT ON public.pengumuman   TO anon;
GRANT SELECT ON public.seleksi      TO anon;
GRANT SELECT ON public.v_statistik  TO anon;

-- =============================================
-- 6. FUNCTION CEK BRUTE FORCE
-- =============================================
CREATE OR REPLACE FUNCTION public.check_brute_force(
  p_ip TEXT,
  p_username TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_ip_count      INTEGER;
  v_user_count    INTEGER;
BEGIN
  -- Cek percobaan gagal dari IP dalam 15 menit terakhir
  SELECT COUNT(*) INTO v_ip_count
  FROM public.login_attempts
  WHERE ip_address = p_ip
    AND success = false
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  -- Cek percobaan gagal username dalam 15 menit terakhir
  SELECT COUNT(*) INTO v_user_count
  FROM public.login_attempts
  WHERE username = p_username
    AND success = false
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  -- Blokir jika > 5 percobaan gagal
  IF v_ip_count >= 5 OR v_user_count >= 5 THEN
    RETURN true; -- IS blocked
  END IF;

  RETURN false; -- NOT blocked
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. FUNCTION LOG LOGIN ATTEMPT
-- =============================================
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_ip       TEXT,
  p_username TEXT,
  p_success  BOOLEAN
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.login_attempts (ip_address, username, success)
  VALUES (p_ip, p_username, p_success);

  -- Catat di audit log jika gagal
  IF NOT p_success THEN
    INSERT INTO public.audit_logs (
      table_name, operation, new_data, severity
    ) VALUES (
      'auth', 'LOGIN_FAILED',
      jsonb_build_object('username', p_username, 'ip', p_ip),
      'warning'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. VERIFIKASI
-- =============================================
SELECT 
  tablename,
  rowsecurity AS rls_aktif
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
