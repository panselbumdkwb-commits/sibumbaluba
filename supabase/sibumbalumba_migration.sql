-- =============================================================
-- SIBUMBALUMBA - Kota Batu
-- Sistem Informasi Monitoring, Evaluasi, Pembinaan,
-- Pengelolaan dan Seleksi BUMD-BLUD Kota Batu
-- =============================================================
-- FILE   : sibumbalumba_migration.sql
-- TANGGAL: 2026-06-28
-- VERSI  : 1.0.0
-- =============================================================
-- CARA PENGGUNAAN:
-- Jalankan file ini di Supabase → SQL Editor
-- Atau simpan di: supabase/migrations/001_sibumbalumba_init.sql
-- =============================================================


-- =============================================================
-- BAGIAN 1: ROLES
-- =============================================================

-- Hapus roles duplikat yang tidak sesuai skema
DELETE FROM public.roles
WHERE id NOT IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);

-- Insert roles tambahan
INSERT INTO public.roles (id, name, permissions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin',     '{"all": true}'),
  ('00000000-0000-0000-0000-000000000002', 'admin_bumd',      '{"bumd": true, "monev_bumd": true}'),
  ('00000000-0000-0000-0000-000000000003', 'admin_blud',      '{"blud": true, "monev_blud": true}'),
  ('00000000-0000-0000-0000-000000000004', 'tim_seleksi',     '{"seleksi": true, "peserta": true, "dokumen": true}'),
  ('00000000-0000-0000-0000-000000000005', 'viewer',          '{"read_only": true}'),
  ('00000000-0000-0000-0000-000000000006', 'panitia_seleksi', '{"seleksi": true, "peserta": true, "dokumen": true}'),
  ('00000000-0000-0000-0000-000000000007', 'tim_ukk',         '{"seleksi": true, "peserta": true, "dokumen": true}'),
  ('00000000-0000-0000-0000-000000000008', 'admin_bpsda',     '{"monev_bumd": true, "monev_blud": true}'),
  ('00000000-0000-0000-0000-000000000009', 'peserta',         '{"portal_peserta": true}')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  permissions = EXCLUDED.permissions;


-- =============================================================
-- BAGIAN 2: TAHUN ANGGARAN
-- =============================================================

CREATE TABLE IF NOT EXISTS public.tahun_anggaran (
  tahun      INTEGER PRIMARY KEY,
  is_aktif   BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.tahun_anggaran (tahun, is_aktif) VALUES
  (2021, false),
  (2022, false),
  (2023, false),
  (2024, false),
  (2025, false),
  (2026, true),
  (2027, false),
  (2028, false),
  (2029, false),
  (2030, false)
ON CONFLICT (tahun) DO NOTHING;


-- =============================================================
-- BAGIAN 3: DATA BUMD
-- =============================================================

INSERT INTO public.bumd (id, nama, jenis, slug, profil, is_active) VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'Perumdam Among Tirto',
    'Perumdam',
    'perumdam-among-tirto',
    '{"singkatan": "PAT", "bidang": "Air Minum", "alamat": "Kota Batu"}',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'PT. Batu Wisata Resource',
    'Perseroda',
    'pt-batu-wisata-resource',
    '{"singkatan": "BWR", "bidang": "Pariwisata", "alamat": "Kota Batu"}',
    true
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- BAGIAN 4: DATA BLUD
-- =============================================================

INSERT INTO public.blud (id, nama, jenis, slug, profil, is_active) VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Puskesmas Batu',
    'PKM',
    'puskesmas-batu',
    '{"alamat": "Kec. Batu, Kota Batu"}',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Puskesmas Beji',
    'PKM',
    'puskesmas-beji',
    '{"alamat": "Kec. Junrejo, Kota Batu"}',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Puskesmas Bumiaji',
    'PKM',
    'puskesmas-bumiaji',
    '{"alamat": "Kec. Bumiaji, Kota Batu"}',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    'Puskesmas Junrejo',
    'PKM',
    'puskesmas-junrejo',
    '{"alamat": "Kec. Junrejo, Kota Batu"}',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    'Puskesmas Sisir',
    'PKM',
    'puskesmas-sisir',
    '{"alamat": "Kec. Batu, Kota Batu"}',
    true
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- BAGIAN 5: TAMBAH KOLOM USERS (entity_id, entity_type)
-- =============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS entity_id   UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT NULL;
-- entity_type: 'bumd' atau 'blud'


-- =============================================================
-- BAGIAN 6: BUAT SEMUA AKUN USER
-- =============================================================

DO $$
DECLARE
  uid UUID;
  acc RECORD;
BEGIN
  FOR acc IN SELECT * FROM (VALUES
    -- (email, password, username, full_name, role_id, entity_id, entity_type)
    ('admin.bumd1@sibumbalumba.id', 'BumdPAT@2026!', 'admin.bumd1', 'Admin Perumdam Among Tirto',    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', 'bumd'),
    ('admin.bumd2@sibumbalumba.id', 'BumdBWR@2026!', 'admin.bumd2', 'Admin PT Batu Wisata Resource', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102', 'bumd'),
    ('admin.blud1@sibumbalumba.id', 'BludBtu@2026!', 'admin.blud1', 'Admin Puskesmas Batu',          '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000201', 'blud'),
    ('admin.blud2@sibumbalumba.id', 'BludBji@2026!', 'admin.blud2', 'Admin Puskesmas Beji',          '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000202', 'blud'),
    ('admin.blud3@sibumbalumba.id', 'BludBmj@2026!', 'admin.blud3', 'Admin Puskesmas Bumiaji',       '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000203', 'blud'),
    ('admin.blud4@sibumbalumba.id', 'BludJrj@2026!', 'admin.blud4', 'Admin Puskesmas Junrejo',       '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000204', 'blud'),
    ('admin.blud5@sibumbalumba.id', 'BludSsr@2026!', 'admin.blud5', 'Admin Puskesmas Sisir',         '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000205', 'blud'),
    ('panitia1@sibumbalumba.id',    'Panitia1@2026!','panitia1',    'Panitia Seleksi 1',             '00000000-0000-0000-0000-000000000006', NULL, NULL),
    ('panitia2@sibumbalumba.id',    'Panitia2@2026!','panitia2',    'Panitia Seleksi 2',             '00000000-0000-0000-0000-000000000006', NULL, NULL),
    ('panitia3@sibumbalumba.id',    'Panitia3@2026!','panitia3',    'Panitia Seleksi 3',             '00000000-0000-0000-0000-000000000006', NULL, NULL),
    ('timukk1@sibumbalumba.id',     'TimUKK1@2026!', 'timukk1',     'Tim UKK 1',                    '00000000-0000-0000-0000-000000000007', NULL, NULL),
    ('timukk2@sibumbalumba.id',     'TimUKK2@2026!', 'timukk2',     'Tim UKK 2',                    '00000000-0000-0000-0000-000000000007', NULL, NULL),
    ('timukk3@sibumbalumba.id',     'TimUKK3@2026!', 'timukk3',     'Tim UKK 3',                    '00000000-0000-0000-0000-000000000007', NULL, NULL),
    ('timukk4@sibumbalumba.id',     'TimUKK4@2026!', 'timukk4',     'Tim UKK 4',                    '00000000-0000-0000-0000-000000000007', NULL, NULL),
    ('timukk5@sibumbalumba.id',     'TimUKK5@2026!', 'timukk5',     'Tim UKK 5',                    '00000000-0000-0000-0000-000000000007', NULL, NULL),
    ('bpsda1@sibumbalumba.id',      'Bpsda1@2026!',  'bpsda1',      'Admin BPSDA 1',                '00000000-0000-0000-0000-000000000008', NULL, NULL),
    ('bpsda2@sibumbalumba.id',      'Bpsda2@2026!',  'bpsda2',      'Admin BPSDA 2',                '00000000-0000-0000-0000-000000000008', NULL, NULL),
    ('bpsda3@sibumbalumba.id',      'Bpsda3@2026!',  'bpsda3',      'Admin BPSDA 3',                '00000000-0000-0000-0000-000000000008', NULL, NULL)
  ) AS t(email, password, username, full_name, role_id, entity_id, entity_type)
  LOOP
    SELECT id INTO uid FROM auth.users WHERE email = acc.email;
    IF uid IS NULL THEN
      uid := gen_random_uuid();
      INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, aud, role
      ) VALUES (
        uid, acc.email,
        crypt(acc.password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', acc.full_name),
        NOW(), NOW(), 'authenticated', 'authenticated'
      );
    END IF;

    INSERT INTO public.users (id, username, full_name, role_id, entity_id, entity_type, is_active)
    VALUES (uid, acc.username, acc.full_name, acc.role_id::UUID, acc.entity_id::UUID, acc.entity_type, true)
    ON CONFLICT (id) DO UPDATE SET
      username    = EXCLUDED.username,
      full_name   = EXCLUDED.full_name,
      role_id     = EXCLUDED.role_id,
      entity_id   = EXCLUDED.entity_id,
      entity_type = EXCLUDED.entity_type,
      is_active   = true;
  END LOOP;
END $$;

-- Pastikan akun admin utama mendapat role super_admin
UPDATE public.users
SET role_id = '00000000-0000-0000-0000-000000000001'
WHERE username = 'admin';


-- =============================================================
-- BAGIAN 7: TABEL PENILAIAN TIM UKK
-- =============================================================

-- Tambah kolom tipe_tahap & involves_ukk di tahapan_seleksi
ALTER TABLE public.tahapan_seleksi
  ADD COLUMN IF NOT EXISTS involves_ukk BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipe_tahap   TEXT DEFAULT NULL;
-- tipe_tahap: 'administrasi','ujian_tulis','presentasi','wawancara','lainnya'

-- Tabel detail penilaian Tim UKK
CREATE TABLE IF NOT EXISTS public.penilaian_ukk (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hasil_id      UUID REFERENCES public.hasil_seleksi(id)    ON DELETE CASCADE,
  tahapan_id    UUID REFERENCES public.tahapan_seleksi(id)  ON DELETE CASCADE,
  peserta_id    UUID REFERENCES public.peserta_seleksi(id)  ON DELETE CASCADE,
  penilai_id    UUID REFERENCES auth.users(id),

  -- Tipe tahapan yang dinilai
  tipe_tahap    TEXT NOT NULL,
  -- Nilai: 'ujian_tulis', 'presentasi', 'wawancara'

  -- UJIAN TULIS (bobot 20%)
  nilai_tulis_pengetahuan_umum  NUMERIC(5,2) DEFAULT 0, -- Pengetahuan Umum & Kebijakan Daerah
  nilai_tulis_manajemen         NUMERIC(5,2) DEFAULT 0, -- Manajemen & Tata Kelola BUMD/BLUD
  nilai_tulis_keuangan          NUMERIC(5,2) DEFAULT 0, -- Kemampuan Keuangan & Analisis
  nilai_tulis_total             NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((nilai_tulis_pengetahuan_umum + nilai_tulis_manajemen + nilai_tulis_keuangan) / 3, 2)
  ) STORED,

  -- PRESENTASI PAPARAN (bobot 30%)
  nilai_presentasi_substansi    NUMERIC(5,2) DEFAULT 0, -- Substansi & Relevansi Materi
  nilai_presentasi_inovasi      NUMERIC(5,2) DEFAULT 0, -- Inovasi & Visi Misi
  nilai_presentasi_komunikasi   NUMERIC(5,2) DEFAULT 0, -- Kemampuan Komunikasi
  nilai_presentasi_penguasaan   NUMERIC(5,2) DEFAULT 0, -- Penguasaan Materi
  nilai_presentasi_total        NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((nilai_presentasi_substansi + nilai_presentasi_inovasi +
           nilai_presentasi_komunikasi + nilai_presentasi_penguasaan) / 4, 2)
  ) STORED,

  -- WAWANCARA (bobot 50%)
  nilai_wawancara_integritas    NUMERIC(5,2) DEFAULT 0, -- Integritas & Komitmen
  nilai_wawancara_kepemimpinan  NUMERIC(5,2) DEFAULT 0, -- Kepemimpinan & Manajerial
  nilai_wawancara_strategis     NUMERIC(5,2) DEFAULT 0, -- Pemikiran Strategis
  nilai_wawancara_komunikasi    NUMERIC(5,2) DEFAULT 0, -- Komunikasi & Interpersonal
  nilai_wawancara_teknis        NUMERIC(5,2) DEFAULT 0, -- Kompetensi Teknis Bidang
  nilai_wawancara_total         NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((nilai_wawancara_integritas + nilai_wawancara_kepemimpinan +
           nilai_wawancara_strategis  + nilai_wawancara_komunikasi +
           nilai_wawancara_teknis) / 5, 2)
  ) STORED,

  -- NILAI AKHIR GABUNGAN (otomatis)
  -- Tulis 20% + Presentasi 30% + Wawancara 50%
  nilai_akhir                   NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND(
      (ROUND((nilai_tulis_pengetahuan_umum + nilai_tulis_manajemen + nilai_tulis_keuangan) / 3, 2) * 0.20) +
      (ROUND((nilai_presentasi_substansi + nilai_presentasi_inovasi +
              nilai_presentasi_komunikasi + nilai_presentasi_penguasaan) / 4, 2) * 0.30) +
      (ROUND((nilai_wawancara_integritas + nilai_wawancara_kepemimpinan +
              nilai_wawancara_strategis  + nilai_wawancara_komunikasi +
              nilai_wawancara_teknis) / 5, 2) * 0.50)
    , 2)
  ) STORED,

  catatan    TEXT,
  status     TEXT DEFAULT 'draft', -- 'draft', 'final'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- BAGIAN 8: HELPER FUNCTIONS
-- =============================================================

-- Fungsi: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT r.name
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fungsi: ambil entity_id user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_entity_id()
RETURNS UUID AS $$
  SELECT entity_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =============================================================
-- BAGIAN 9: ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Aktifkan RLS semua tabel
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bumd            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blud            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_bumd      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_blud      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seleksi         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahapan_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peserta_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hasil_seleksi   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_ukk   ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- ROLES: semua user login bisa baca
-- -------------------------------------------------------
DROP POLICY IF EXISTS "roles_read_all" ON public.roles;
CREATE POLICY "roles_read_all" ON public.roles
  FOR SELECT USING (true);

-- -------------------------------------------------------
-- USERS
-- -------------------------------------------------------
DROP POLICY IF EXISTS "users_read_self"    ON public.users;
DROP POLICY IF EXISTS "users_read_admin"   ON public.users;
DROP POLICY IF EXISTS "users_manage_admin" ON public.users;

CREATE POLICY "users_read_self" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_read_admin" ON public.users
  FOR SELECT USING (public.get_my_role() = 'super_admin');

CREATE POLICY "users_manage_admin" ON public.users
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- -------------------------------------------------------
-- BUMD
-- -------------------------------------------------------
DROP POLICY IF EXISTS "bumd_read_all"     ON public.bumd;
DROP POLICY IF EXISTS "bumd_manage_admin" ON public.bumd;
DROP POLICY IF EXISTS "bumd_manage_own"   ON public.bumd;

CREATE POLICY "bumd_read_all" ON public.bumd
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "bumd_manage_admin" ON public.bumd
  FOR ALL USING (public.get_my_role() = 'super_admin');

CREATE POLICY "bumd_manage_own" ON public.bumd
  FOR UPDATE USING (
    public.get_my_role() = 'admin_bumd'
    AND id = public.get_my_entity_id()
  );

-- -------------------------------------------------------
-- BLUD
-- -------------------------------------------------------
DROP POLICY IF EXISTS "blud_read_all"     ON public.blud;
DROP POLICY IF EXISTS "blud_manage_admin" ON public.blud;
DROP POLICY IF EXISTS "blud_manage_own"   ON public.blud;

CREATE POLICY "blud_read_all" ON public.blud
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "blud_manage_admin" ON public.blud
  FOR ALL USING (public.get_my_role() = 'super_admin');

CREATE POLICY "blud_manage_own" ON public.blud
  FOR UPDATE USING (
    public.get_my_role() = 'admin_blud'
    AND id = public.get_my_entity_id()
  );

-- -------------------------------------------------------
-- MONEV BUMD
-- -------------------------------------------------------
DROP POLICY IF EXISTS "monev_bumd_manage_admin"  ON public.monev_bumd;
DROP POLICY IF EXISTS "monev_bumd_manage_own"    ON public.monev_bumd;
DROP POLICY IF EXISTS "monev_bumd_manage_bpsda"  ON public.monev_bumd;

CREATE POLICY "monev_bumd_manage_admin" ON public.monev_bumd
  FOR ALL USING (public.get_my_role() = 'super_admin');

CREATE POLICY "monev_bumd_manage_own" ON public.monev_bumd
  FOR ALL USING (
    public.get_my_role() = 'admin_bumd'
    AND bumd_id = public.get_my_entity_id()
  );

CREATE POLICY "monev_bumd_manage_bpsda" ON public.monev_bumd
  FOR ALL USING (public.get_my_role() = 'admin_bpsda');

-- -------------------------------------------------------
-- MONEV BLUD
-- -------------------------------------------------------
DROP POLICY IF EXISTS "monev_blud_manage_admin"  ON public.monev_blud;
DROP POLICY IF EXISTS "monev_blud_manage_own"    ON public.monev_blud;
DROP POLICY IF EXISTS "monev_blud_manage_bpsda"  ON public.monev_blud;

CREATE POLICY "monev_blud_manage_admin" ON public.monev_blud
  FOR ALL USING (public.get_my_role() = 'super_admin');

CREATE POLICY "monev_blud_manage_own" ON public.monev_blud
  FOR ALL USING (
    public.get_my_role() = 'admin_blud'
    AND blud_id = public.get_my_entity_id()
  );

CREATE POLICY "monev_blud_manage_bpsda" ON public.monev_blud
  FOR ALL USING (public.get_my_role() = 'admin_bpsda');

-- -------------------------------------------------------
-- SELEKSI
-- -------------------------------------------------------
DROP POLICY IF EXISTS "seleksi_manage"    ON public.seleksi;
DROP POLICY IF EXISTS "seleksi_read_ukk"  ON public.seleksi;

CREATE POLICY "seleksi_manage" ON public.seleksi
  FOR ALL USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi')
  );

CREATE POLICY "seleksi_read_ukk" ON public.seleksi
  FOR SELECT USING (
    public.get_my_role() IN ('tim_ukk', 'peserta')
  );

-- -------------------------------------------------------
-- TAHAPAN SELEKSI
-- -------------------------------------------------------
DROP POLICY IF EXISTS "tahapan_manage" ON public.tahapan_seleksi;
DROP POLICY IF EXISTS "tahapan_read"   ON public.tahapan_seleksi;

CREATE POLICY "tahapan_manage" ON public.tahapan_seleksi
  FOR ALL USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi')
  );

CREATE POLICY "tahapan_read" ON public.tahapan_seleksi
  FOR SELECT USING (
    public.get_my_role() IN ('tim_ukk', 'peserta')
  );

-- -------------------------------------------------------
-- PESERTA SELEKSI
-- -------------------------------------------------------
DROP POLICY IF EXISTS "peserta_manage_self" ON public.peserta_seleksi;

CREATE POLICY "peserta_manage_self" ON public.peserta_seleksi
  FOR ALL USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi', 'tim_ukk')
    OR id = auth.uid()
  );

-- -------------------------------------------------------
-- DOKUMEN PESERTA
-- -------------------------------------------------------
DROP POLICY IF EXISTS "dokumen_manage" ON public.dokumen_peserta;

CREATE POLICY "dokumen_manage" ON public.dokumen_peserta
  FOR ALL USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi', 'tim_ukk')
    OR peserta_id = auth.uid()
  );

-- -------------------------------------------------------
-- HASIL SELEKSI
-- -------------------------------------------------------
DROP POLICY IF EXISTS "hasil_manage" ON public.hasil_seleksi;
DROP POLICY IF EXISTS "hasil_read"   ON public.hasil_seleksi;

CREATE POLICY "hasil_manage" ON public.hasil_seleksi
  FOR ALL USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi')
  );

CREATE POLICY "hasil_read" ON public.hasil_seleksi
  FOR SELECT USING (
    public.get_my_role() IN ('tim_ukk', 'peserta')
  );

-- -------------------------------------------------------
-- PENILAIAN UKK
-- -------------------------------------------------------
DROP POLICY IF EXISTS "penilaian_ukk_manage_own"   ON public.penilaian_ukk;
DROP POLICY IF EXISTS "penilaian_ukk_read_all_ukk" ON public.penilaian_ukk;
DROP POLICY IF EXISTS "penilaian_ukk_read_panitia" ON public.penilaian_ukk;
DROP POLICY IF EXISTS "penilaian_ukk_manage_admin" ON public.penilaian_ukk;

-- Tim UKK kelola penilaian milik sendiri
CREATE POLICY "penilaian_ukk_manage_own" ON public.penilaian_ukk
  FOR ALL USING (
    public.get_my_role() = 'tim_ukk'
    AND penilai_id = auth.uid()
  );

-- Tim UKK bisa baca semua penilaian (untuk rekap antar penilai)
CREATE POLICY "penilaian_ukk_read_all_ukk" ON public.penilaian_ukk
  FOR SELECT USING (public.get_my_role() = 'tim_ukk');

-- Panitia & super_admin bisa lihat semua
CREATE POLICY "penilaian_ukk_read_panitia" ON public.penilaian_ukk
  FOR SELECT USING (
    public.get_my_role() IN ('super_admin', 'panitia_seleksi')
  );

-- Super admin kelola semua
CREATE POLICY "penilaian_ukk_manage_admin" ON public.penilaian_ukk
  FOR ALL USING (public.get_my_role() = 'super_admin');


-- =============================================================
-- BAGIAN 10: TRIGGER NONAKTIFKAN PESERTA TIDAK LOLOS
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_peserta_tidak_lolos()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika status hasil_seleksi diubah menjadi 'tidak_lulus'
  IF NEW.status = 'tidak_lulus' AND OLD.status != 'tidak_lulus' THEN

    -- Nonaktifkan akun di tabel users
    UPDATE public.users
    SET is_active = false, updated_at = NOW()
    WHERE id = (
      SELECT auth_user_id FROM public.peserta_seleksi WHERE id = NEW.peserta_id
    );

    -- Update status peserta
    UPDATE public.peserta_seleksi
    SET status = 'tidak_lulus', updated_at = NOW()
    WHERE id = NEW.peserta_id;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_peserta_tidak_lolos ON public.hasil_seleksi;
CREATE TRIGGER on_peserta_tidak_lolos
  AFTER UPDATE ON public.hasil_seleksi
  FOR EACH ROW EXECUTE FUNCTION public.handle_peserta_tidak_lolos();


-- =============================================================
-- BAGIAN 11: VERIFIKASI AKHIR
-- =============================================================

-- Cek semua tabel & status RLS
SELECT
  tablename,
  rowsecurity AS rls_aktif
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Cek semua akun user
SELECT
  u.username,
  u.full_name,
  r.name AS role,
  u.entity_type,
  CASE
    WHEN u.entity_type = 'bumd' THEN (SELECT nama FROM public.bumd WHERE id = u.entity_id)
    WHEN u.entity_type = 'blud' THEN (SELECT nama FROM public.blud WHERE id = u.entity_id)
    ELSE '—'
  END AS entity_nama,
  u.is_active
FROM public.users u
LEFT JOIN public.roles r ON r.id = u.role_id
ORDER BY r.name, u.username;

-- Cek tahun anggaran
SELECT tahun, is_aktif FROM public.tahun_anggaran ORDER BY tahun;
