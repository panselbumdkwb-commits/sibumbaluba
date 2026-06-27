-- ============================================================
-- SIBUMBALUMBA - Seed Admin User
-- Jalankan SETELAH schema.sql dan setup storage
-- Ganti password setelah login pertama!
-- ============================================================

-- LANGKAH 1: Buat user di Supabase Auth melalui Dashboard:
--   Authentication → Users → Add User
--   Email: superadmin@SIBUMBALUMBA.internal
--   Password: Admin@SIMBU2025! (GANTI setelah login pertama)
--   Centang "Auto Confirm User"

-- LANGKAH 2: Setelah user terbuat, ambil ID-nya dari tabel auth.users
--   Kemudian jalankan query berikut (ganti UUID dengan ID sebenarnya):

-- CONTOH (ganti 'your-auth-user-uuid-here' dengan UUID yang sebenarnya):
/*
INSERT INTO users (id, username, full_name, role_id, is_active)
VALUES (
  'your-auth-user-uuid-here',  -- UUID dari auth.users
  'superadmin',
  'Super Administrator SIBUMBALUMBA',
  (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1),
  true
);
*/

-- ── ALTERNATIF: Gunakan Supabase Edge Function atau API ───────
-- Script ini bisa dijalankan via Supabase CLI atau Dashboard

-- Verifikasi seed data berhasil:
SELECT 'Roles:' as info, count(*) as jumlah FROM roles
UNION ALL
SELECT 'BUMD:', count(*) FROM bumd
UNION ALL
SELECT 'BLUD:', count(*) FROM blud
UNION ALL
SELECT 'Kategori Regulasi:', count(*) FROM kategori_regulasi
UNION ALL
SELECT 'Kategori SOP:', count(*) FROM kategori_sop
UNION ALL
SELECT 'Regulasi:', count(*) FROM regulasi
UNION ALL
SELECT 'SOP:', count(*) FROM sop
UNION ALL
SELECT 'Pengumuman:', count(*) FROM pengumuman;

-- ============================================================
-- CHECKLIST SETUP SUPABASE
-- ============================================================
-- [ ] 1. Buat project Supabase baru
-- [ ] 2. Jalankan supabase/schema.sql di SQL Editor
-- [ ] 3. Jalankan supabase/storage.sql di SQL Editor
-- [ ] 4. Buat user superadmin via Auth Dashboard
-- [ ] 5. Jalankan INSERT users di atas dengan UUID yang benar
-- [ ] 6. Verifikasi: SELECT * FROM users;
-- [ ] 7. Verifikasi: SELECT * FROM v_statistik;
-- [ ] 8. Test login di /login dengan username: superadmin
-- ============================================================
