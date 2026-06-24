-- ============================================================
-- SIMBUBALADA - Sistem Informasi Monitoring, Evaluasi,
-- Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES & USERS
-- ============================================================

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. BUMD & BLUD MASTER
-- ============================================================

CREATE TABLE bumd (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  singkatan text,
  jenis text CHECK (jenis IN ('Perumdam','Perseroda','PD','lainnya')),
  slug text UNIQUE,
  profil jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER bumd_updated_at BEFORE UPDATE ON bumd
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE blud (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  jenis text CHECK (jenis IN ('PKM','RSUD','lainnya')),
  slug text UNIQUE,
  profil jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER blud_updated_at BEFORE UPDATE ON blud
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. REGULASI & SOP
-- ============================================================

CREATE TABLE kategori_regulasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  urutan int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE regulasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  nomor text,
  tahun int,
  kategori_id uuid REFERENCES kategori_regulasi(id) ON DELETE SET NULL,
  deskripsi text,
  file_url text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER regulasi_updated_at BEFORE UPDATE ON regulasi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE kategori_sop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  entitas text CHECK (entitas IN ('BUMD','BLUD','Umum')),
  urutan int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  kode text,
  kategori_id uuid REFERENCES kategori_sop(id) ON DELETE SET NULL,
  deskripsi text,
  file_url text,
  versi text DEFAULT '1.0',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER sop_updated_at BEFORE UPDATE ON sop
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. MONITORING & EVALUASI
-- ============================================================

CREATE TABLE monev_bumd (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bumd_id uuid REFERENCES bumd(id) ON DELETE CASCADE,
  periode text NOT NULL, -- e.g. '2024-TW1', '2024-TAHUNAN'
  rkap jsonb DEFAULT '{}'::jsonb,
  laporan_keuangan jsonb DEFAULT '{}'::jsonb,
  rasio_kinerja jsonb DEFAULT '{}'::jsonb,
  gcg jsonb DEFAULT '{}'::jsonb,
  spi jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','verified')),
  catatan text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER monev_bumd_updated_at BEFORE UPDATE ON monev_bumd
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE monev_blud (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blud_id uuid REFERENCES blud(id) ON DELETE CASCADE,
  periode text NOT NULL,
  rba jsonb DEFAULT '{}'::jsonb,
  laporan_kinerja jsonb DEFAULT '{}'::jsonb,
  laporan_keuangan jsonb DEFAULT '{}'::jsonb,
  spm jsonb DEFAULT '{}'::jsonb,
  akreditasi jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','verified')),
  catatan text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER monev_blud_updated_at BEFORE UPDATE ON monev_blud
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. SELEKSI
-- ============================================================

CREATE TABLE seleksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  jenis text CHECK (jenis IN ('Direksi','Dewan Pengawas','Dewas','Direktur','Komisaris','lainnya')),
  entitas text CHECK (entitas IN ('BUMD','BLUD')),
  entitas_id uuid, -- FK to bumd.id or blud.id
  status text DEFAULT 'draft' CHECK (status IN ('draft','buka','tutup','selesai')),
  pengumuman_url text,
  jadwal jsonb DEFAULT '{}'::jsonb,
  persyaratan text,
  kuota int DEFAULT 1,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER seleksi_updated_at BEFORE UPDATE ON seleksi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE peserta_seleksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seleksi_id uuid REFERENCES seleksi(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users ON DELETE SET NULL, -- for portal login
  nik text NOT NULL,
  nama text NOT NULL,
  ttl text, -- tempat, tanggal lahir
  alamat text,
  pendidikan text,
  whatsapp text,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  status text DEFAULT 'terdaftar' CHECK (status IN (
    'terdaftar','verifikasi_dokumen','lulus_admin','tms_admin',
    'undangan_ukk','lulus_ukk','tms_ukk','lulus_akhir','tidak_lulus'
  )),
  nomor_peserta text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER peserta_seleksi_updated_at BEFORE UPDATE ON peserta_seleksi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate nomor peserta
CREATE OR REPLACE FUNCTION generate_nomor_peserta()
RETURNS TRIGGER AS $$
DECLARE
  seq int;
  kode text;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM peserta_seleksi WHERE seleksi_id = NEW.seleksi_id;
  kode := 'PS-' || to_char(now(), 'YYYY') || '-' || LPAD(seq::text, 4, '0');
  NEW.nomor_peserta := kode;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER peserta_nomor_trigger BEFORE INSERT ON peserta_seleksi
  FOR EACH ROW WHEN (NEW.nomor_peserta IS NULL)
  EXECUTE FUNCTION generate_nomor_peserta();

CREATE TABLE dokumen_peserta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peserta_id uuid REFERENCES peserta_seleksi(id) ON DELETE CASCADE,
  jenis_dokumen text NOT NULL CHECK (jenis_dokumen IN (
    'ktp','ijazah','cv','skck','surat_kesehatan',
    'pakta_integritas','foto','dokumen_pendukung'
  )),
  file_url text,
  file_name text,
  file_size int,
  status_verifikasi text DEFAULT 'pending' CHECK (
    status_verifikasi IN ('pending','diverifikasi','ditolak')
  ),
  catatan text,
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(peserta_id, jenis_dokumen)
);

CREATE TRIGGER dokumen_peserta_updated_at BEFORE UPDATE ON dokumen_peserta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE tahapan_seleksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seleksi_id uuid REFERENCES seleksi(id) ON DELETE CASCADE,
  nama_tahap text NOT NULL,
  urutan int NOT NULL,
  tanggal_mulai date,
  tanggal_selesai date,
  lokasi text,
  keterangan text,
  status text DEFAULT 'belum' CHECK (status IN ('belum','berjalan','selesai'))
);

CREATE TABLE hasil_seleksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peserta_id uuid REFERENCES peserta_seleksi(id) ON DELETE CASCADE,
  tahapan_id uuid REFERENCES tahapan_seleksi(id) ON DELETE CASCADE,
  nilai numeric(5,2),
  status text CHECK (status IN ('lulus','tidak_lulus','absen')),
  catatan text,
  penilai uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(peserta_id, tahapan_id)
);

CREATE TRIGGER hasil_seleksi_updated_at BEFORE UPDATE ON hasil_seleksi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. PENGUMUMAN
-- ============================================================

CREATE TABLE pengumuman (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  isi text,
  kategori text CHECK (kategori IN ('umum','seleksi','monev','regulasi','sop')),
  is_publik boolean DEFAULT false,
  file_url text,
  seleksi_id uuid REFERENCES seleksi(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER pengumuman_updated_at BEFORE UPDATE ON pengumuman
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. AUDIT & NOTIFIKASI
-- ============================================================

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  aksi text NOT NULL,
  tabel text,
  record_id uuid,
  detail jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notifikasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  peserta_id uuid REFERENCES peserta_seleksi(id) ON DELETE CASCADE,
  judul text NOT NULL,
  isi text,
  kategori text DEFAULT 'info' CHECK (kategori IN ('info','sukses','peringatan','error')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_monev_bumd_bumd_id ON monev_bumd(bumd_id);
CREATE INDEX idx_monev_bumd_periode ON monev_bumd(periode);
CREATE INDEX idx_monev_blud_blud_id ON monev_blud(blud_id);
CREATE INDEX idx_monev_blud_periode ON monev_blud(periode);
CREATE INDEX idx_peserta_seleksi_id ON peserta_seleksi(seleksi_id);
CREATE INDEX idx_peserta_status ON peserta_seleksi(status);
CREATE INDEX idx_peserta_username ON peserta_seleksi(username);
CREATE INDEX idx_dokumen_peserta_id ON dokumen_peserta(peserta_id);
CREATE INDEX idx_hasil_peserta_id ON hasil_seleksi(peserta_id);
CREATE INDEX idx_notifikasi_user_id ON notifikasi(user_id);
CREATE INDEX idx_notifikasi_peserta_id ON notifikasi(peserta_id);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_pengumuman_publik ON pengumuman(is_publik, created_at DESC);

-- ============================================================
-- VIEWS
-- ============================================================

-- v_peserta_lengkap: SECURITY INVOKER agar RLS tetap aktif per user
CREATE VIEW v_peserta_lengkap
WITH (security_invoker = true)
AS
SELECT
  p.*,
  s.judul  AS seleksi_judul,
  s.jenis  AS seleksi_jenis,
  s.entitas AS seleksi_entitas,
  COUNT(d.id)                                                        AS total_dokumen,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'diverifikasi')   AS dokumen_verified,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'ditolak')        AS dokumen_ditolak,
  COUNT(d.id) FILTER (WHERE d.status_verifikasi = 'pending')        AS dokumen_pending
FROM peserta_seleksi p
JOIN seleksi          s ON p.seleksi_id = s.id
LEFT JOIN dokumen_peserta d ON p.id      = d.peserta_id
GROUP BY p.id, s.judul, s.jenis, s.entitas;

-- v_statistik: SECURITY INVOKER agar RLS tetap aktif per user
-- Catatan: subquery COUNT hanya menghitung baris yang boleh dilihat oleh
-- querying user sesuai RLS masing-masing tabel.
CREATE VIEW v_statistik
WITH (security_invoker = true)
AS
SELECT
  (SELECT COUNT(*) FROM bumd         WHERE is_active = true)              AS total_bumd,
  (SELECT COUNT(*) FROM blud         WHERE is_active = true)              AS total_blud,
  (SELECT COUNT(*) FROM seleksi      WHERE status IN ('buka','selesai'))  AS total_seleksi,
  (SELECT COUNT(*) FROM peserta_seleksi)                                  AS total_peserta,
  (SELECT COUNT(*) FROM regulasi     WHERE is_active = true)              AS total_regulasi,
  (SELECT COUNT(*) FROM sop          WHERE is_active = true)              AS total_sop;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bumd ENABLE ROW LEVEL SECURITY;
ALTER TABLE blud ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_regulasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_sop ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop ENABLE ROW LEVEL SECURITY;
ALTER TABLE monev_bumd ENABLE ROW LEVEL SECURITY;
ALTER TABLE monev_blud ENABLE ROW LEVEL SECURITY;
ALTER TABLE seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE peserta_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahapan_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT r.name FROM users u
  JOIN roles r ON u.role_id = r.id
  WHERE u.id = auth.uid() AND u.is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT get_user_role() = 'super_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_bumd()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('super_admin','admin_bumd');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_blud()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('super_admin','admin_blud');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_tim_seleksi()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('super_admin','tim_seleksi');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS boolean AS $$
  SELECT get_user_role() IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ROLES TABLE
CREATE POLICY "roles_read" ON roles FOR SELECT USING (is_internal_user());
CREATE POLICY "roles_manage" ON roles FOR ALL USING (is_super_admin());

-- USERS TABLE
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid() OR is_super_admin());
CREATE POLICY "users_manage" ON users FOR ALL USING (is_super_admin());

-- BUMD TABLE
CREATE POLICY "bumd_public_read" ON bumd FOR SELECT USING (is_active = true OR is_admin_bumd());
CREATE POLICY "bumd_manage" ON bumd FOR ALL USING (is_admin_bumd());

-- BLUD TABLE
CREATE POLICY "blud_public_read" ON blud FOR SELECT USING (is_active = true OR is_admin_blud());
CREATE POLICY "blud_manage" ON blud FOR ALL USING (is_admin_blud());

-- KATEGORI REGULASI
CREATE POLICY "kat_reg_read" ON kategori_regulasi FOR SELECT TO public USING (true);
CREATE POLICY "kat_reg_manage" ON kategori_regulasi FOR ALL USING (is_super_admin());

-- REGULASI
CREATE POLICY "regulasi_public_read" ON regulasi FOR SELECT USING (is_active = true OR is_internal_user());
CREATE POLICY "regulasi_manage" ON regulasi FOR ALL USING (is_super_admin());

-- KATEGORI SOP
CREATE POLICY "kat_sop_read" ON kategori_sop FOR SELECT TO public USING (true);
CREATE POLICY "kat_sop_manage" ON kategori_sop FOR ALL USING (is_super_admin());

-- SOP
CREATE POLICY "sop_public_read" ON sop FOR SELECT USING (is_active = true OR is_internal_user());
CREATE POLICY "sop_manage" ON sop FOR ALL USING (is_super_admin());

-- MONEV BUMD
CREATE POLICY "monev_bumd_read" ON monev_bumd FOR SELECT USING (is_admin_bumd());
CREATE POLICY "monev_bumd_manage" ON monev_bumd FOR ALL USING (is_admin_bumd());

-- MONEV BLUD
CREATE POLICY "monev_blud_read" ON monev_blud FOR SELECT USING (is_admin_blud());
CREATE POLICY "monev_blud_manage" ON monev_blud FOR ALL USING (is_admin_blud());

-- SELEKSI
CREATE POLICY "seleksi_public_read" ON seleksi FOR SELECT USING (
  status IN ('buka','tutup','selesai') OR is_internal_user()
);
CREATE POLICY "seleksi_manage" ON seleksi FOR ALL USING (is_tim_seleksi());

-- PESERTA SELEKSI
CREATE POLICY "peserta_read_tim" ON peserta_seleksi FOR SELECT USING (is_tim_seleksi());
CREATE POLICY "peserta_read_own" ON peserta_seleksi FOR SELECT USING (
  auth_user_id = auth.uid()
);
CREATE POLICY "peserta_insert_public" ON peserta_seleksi FOR INSERT WITH CHECK (true); -- public registration
CREATE POLICY "peserta_update_tim" ON peserta_seleksi FOR UPDATE USING (is_tim_seleksi());
CREATE POLICY "peserta_delete" ON peserta_seleksi FOR DELETE USING (is_super_admin());

-- DOKUMEN PESERTA
CREATE POLICY "dokumen_read_tim" ON dokumen_peserta FOR SELECT USING (is_tim_seleksi());
CREATE POLICY "dokumen_read_own" ON dokumen_peserta FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM peserta_seleksi p
    WHERE p.id = dokumen_peserta.peserta_id AND p.auth_user_id = auth.uid()
  )
);
CREATE POLICY "dokumen_insert_own" ON dokumen_peserta FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM peserta_seleksi p
    WHERE p.id = peserta_id AND p.auth_user_id = auth.uid()
  ) OR is_tim_seleksi()
);
CREATE POLICY "dokumen_update_tim" ON dokumen_peserta FOR UPDATE USING (is_tim_seleksi());
CREATE POLICY "dokumen_update_own" ON dokumen_peserta FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM peserta_seleksi p
    WHERE p.id = peserta_id AND p.auth_user_id = auth.uid()
    AND status_verifikasi = 'pending'
  )
);

-- TAHAPAN SELEKSI
CREATE POLICY "tahapan_read" ON tahapan_seleksi FOR SELECT USING (
  is_internal_user() OR
  EXISTS (SELECT 1 FROM seleksi s WHERE s.id = seleksi_id AND s.status IN ('buka','selesai'))
);
CREATE POLICY "tahapan_manage" ON tahapan_seleksi FOR ALL USING (is_tim_seleksi());

-- HASIL SELEKSI
CREATE POLICY "hasil_read_tim" ON hasil_seleksi FOR SELECT USING (is_tim_seleksi());
CREATE POLICY "hasil_read_own" ON hasil_seleksi FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM peserta_seleksi p
    WHERE p.id = peserta_id AND p.auth_user_id = auth.uid()
  )
);
CREATE POLICY "hasil_manage" ON hasil_seleksi FOR ALL USING (is_tim_seleksi());

-- PENGUMUMAN
CREATE POLICY "pengumuman_public_read" ON pengumuman FOR SELECT USING (
  is_publik = true OR is_internal_user()
);
CREATE POLICY "pengumuman_manage" ON pengumuman FOR ALL USING (is_internal_user());

-- AUDIT LOGS
CREATE POLICY "audit_read" ON audit_logs FOR SELECT USING (is_super_admin());
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT WITH CHECK (true); -- system inserts

-- NOTIFIKASI
CREATE POLICY "notifikasi_read_own" ON notifikasi FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM peserta_seleksi p WHERE p.id = peserta_id AND p.auth_user_id = auth.uid())
);
CREATE POLICY "notifikasi_manage" ON notifikasi FOR ALL USING (is_internal_user());
CREATE POLICY "notifikasi_update_own" ON notifikasi FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET POLICIES (run after creating bucket)
-- ============================================================
-- Create bucket via Supabase Dashboard: "seleksi-dokumen" (private)
-- Create bucket: "regulasi-files" (private)
-- Create bucket: "sop-files" (private)
-- Create bucket: "pengumuman-files" (public)

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (id, name, permissions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin', '{"all": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'admin_bumd', '{"bumd": true, "monev_bumd": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'admin_blud', '{"blud": true, "monev_blud": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'tim_seleksi', '{"seleksi": true, "peserta": true, "dokumen": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', 'viewer', '{"read_only": true}'::jsonb);

-- BUMD Data
INSERT INTO bumd (id, nama, singkatan, jenis, slug, profil) VALUES
(
  gen_random_uuid(),
  'Perusahaan Umum Daerah Air Minum Among Tani',
  'Perumdam Among Tani',
  'Perumdam',
  'perumdam-among-tani',
  '{
    "alamat": "Jl. Panglima Sudirman No. 507, Kota Batu",
    "telepon": "(0341) 591049",
    "email": "perumdam.amongtani@gmail.com",
    "website": "https://perumdam-amongtani.com",
    "tahun_berdiri": "1974",
    "modal_dasar": "Rp 20.000.000.000",
    "direktur": "...",
    "layanan": "Penyediaan air bersih dan air minum untuk masyarakat Kota Batu",
    "visi": "Menjadi perusahaan air minum yang handal, profesional dan mampu memberikan pelayanan terbaik",
    "misi": ["Meningkatkan kualitas dan kuantitas pelayanan air minum", "Meningkatkan sumber daya manusia yang profesional"],
    "coverage": "75% wilayah Kota Batu",
    "pelanggan": "35.000+"
  }'::jsonb
),
(
  gen_random_uuid(),
  'PT Batu Wisata Resources',
  'PT BWR',
  'Perseroda',
  'pt-batu-wisata-resources',
  '{
    "alamat": "Jl. A. Yani No. 1, Kota Batu",
    "telepon": "(0341) 512345",
    "email": "bwr@kotabatu.go.id",
    "tahun_berdiri": "2012",
    "modal_dasar": "Rp 10.000.000.000",
    "direktur": "...",
    "layanan": "Pariwisata, perhotelan, dan pengembangan sumber daya wisata Kota Batu",
    "visi": "Menjadi perusahaan daerah unggulan dalam pengelolaan pariwisata Kota Batu",
    "misi": ["Mengelola dan mengembangkan potensi wisata daerah", "Meningkatkan PAD melalui sektor pariwisata"],
    "bidang": ["Pariwisata", "Perhotelan", "Event Organizer", "MICE"]
  }'::jsonb
);

-- BLUD Data (5 Puskesmas)
INSERT INTO blud (id, nama, jenis, slug, profil) VALUES
(
  gen_random_uuid(),
  'UPTD Puskesmas Batu',
  'PKM',
  'puskesmas-batu',
  '{
    "alamat": "Jl. Dewi Sartika No. 1, Kec. Batu, Kota Batu",
    "telepon": "(0341) 592040",
    "email": "pkm.batu@kotabatu.go.id",
    "wilayah": "Kecamatan Batu",
    "kepala": "dr. ...",
    "tahun_berdiri": "1980",
    "layanan": ["Rawat Jalan", "UGD", "KIA", "Gigi", "Laboratorium"],
    "akreditasi": "Paripurna",
    "jml_penduduk_wilayah": "±50.000 jiwa"
  }'::jsonb
),
(
  gen_random_uuid(),
  'UPTD Puskesmas Beji',
  'PKM',
  'puskesmas-beji',
  '{
    "alamat": "Jl. Beji, Kec. Junrejo, Kota Batu",
    "telepon": "(0341) 595xxx",
    "email": "pkm.beji@kotabatu.go.id",
    "wilayah": "Sebagian Kec. Junrejo",
    "kepala": "dr. ...",
    "layanan": ["Rawat Jalan", "UGD", "KIA", "Gigi", "Laboratorium"],
    "akreditasi": "Utama"
  }'::jsonb
),
(
  gen_random_uuid(),
  'UPTD Puskesmas Bumiaji',
  'PKM',
  'puskesmas-bumiaji',
  '{
    "alamat": "Jl. Raya Bumiaji, Kec. Bumiaji, Kota Batu",
    "telepon": "(0341) 596xxx",
    "email": "pkm.bumiaji@kotabatu.go.id",
    "wilayah": "Kecamatan Bumiaji",
    "kepala": "dr. ...",
    "layanan": ["Rawat Jalan", "UGD", "KIA", "Gigi", "Laboratorium"],
    "akreditasi": "Utama"
  }'::jsonb
),
(
  gen_random_uuid(),
  'UPTD Puskesmas Junrejo',
  'PKM',
  'puskesmas-junrejo',
  '{
    "alamat": "Jl. Raya Junrejo, Kec. Junrejo, Kota Batu",
    "telepon": "(0341) 597xxx",
    "email": "pkm.junrejo@kotabatu.go.id",
    "wilayah": "Sebagian Kec. Junrejo",
    "kepala": "dr. ...",
    "layanan": ["Rawat Jalan", "UGD", "KIA", "Gigi", "Laboratorium"],
    "akreditasi": "Madya"
  }'::jsonb
),
(
  gen_random_uuid(),
  'UPTD Puskesmas Sisir',
  'PKM',
  'puskesmas-sisir',
  '{
    "alamat": "Jl. Raya Sisir, Kec. Batu, Kota Batu",
    "telepon": "(0341) 598xxx",
    "email": "pkm.sisir@kotabatu.go.id",
    "wilayah": "Sebagian Kec. Batu",
    "kepala": "dr. ...",
    "layanan": ["Rawat Jalan", "UGD", "KIA", "Gigi", "Laboratorium"],
    "akreditasi": "Utama"
  }'::jsonb
);

-- Kategori Regulasi
INSERT INTO kategori_regulasi (nama, urutan) VALUES
  ('Undang-Undang', 1),
  ('Peraturan Pemerintah', 2),
  ('Peraturan Menteri', 3),
  ('Peraturan Daerah (Perda)', 4),
  ('Peraturan Wali Kota (Perwali)', 5),
  ('Keputusan Wali Kota', 6),
  ('Keputusan Kepala Dinas', 7),
  ('Pedoman Teknis', 8);

-- Seed Regulasi
INSERT INTO regulasi (judul, nomor, tahun, kategori_id, is_active) VALUES
(
  'Undang-Undang tentang Pemerintahan Daerah',
  'UU No. 23',
  2014,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Undang-Undang' LIMIT 1),
  true
),
(
  'Peraturan Pemerintah tentang Perusahaan Umum Daerah dan Perusahaan Perseroan Daerah',
  'PP No. 54',
  2017,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Pemerintah' LIMIT 1),
  true
),
(
  'Permendagri tentang Pedoman Penilaian dan Evaluasi Pelaksanaan Penyelenggaraan BUMD',
  'Permendagri No. 118',
  2018,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Menteri' LIMIT 1),
  true
),
(
  'Permendagri tentang Pedoman Teknis Pengelolaan Keuangan BLUD',
  'Permendagri No. 79',
  2018,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Menteri' LIMIT 1),
  true
),
(
  'Peraturan Menteri PUPR tentang Penyelenggaraan SPAM',
  'Permen PUPR No. 25',
  2016,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Menteri' LIMIT 1),
  true
),
(
  'Perda Kota Batu tentang Pendirian Perumdam Among Tani',
  'Perda No. 3',
  2020,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Daerah (Perda)' LIMIT 1),
  true
),
(
  'Perda Kota Batu tentang Pendirian PT Batu Wisata Resources',
  'Perda No. 4',
  2020,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Daerah (Perda)' LIMIT 1),
  true
),
(
  'Perwali Kota Batu tentang Tata Cara Seleksi Direksi dan Dewas BUMD',
  'Perwali No. 15',
  2023,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Wali Kota (Perwali)' LIMIT 1),
  true
),
(
  'Perwali Kota Batu tentang Penetapan BLUD Puskesmas',
  'Perwali No. 22',
  2021,
  (SELECT id FROM kategori_regulasi WHERE nama = 'Peraturan Wali Kota (Perwali)' LIMIT 1),
  true
);

-- Kategori SOP
INSERT INTO kategori_sop (nama, entitas, urutan) VALUES
  ('Pembinaan dan Pengawasan', 'BUMD', 1),
  ('Monitoring dan Evaluasi', 'BUMD', 2),
  ('Pelaporan Kinerja', 'BUMD', 3),
  ('Tata Kelola Perusahaan (GCG)', 'BUMD', 4),
  ('Pengelolaan Keuangan', 'BLUD', 1),
  ('Monitoring Kinerja Pelayanan', 'BLUD', 2),
  ('Pelaporan dan Akreditasi', 'BLUD', 3),
  ('Standar Pelayanan Minimal (SPM)', 'BLUD', 4),
  ('Seleksi Direksi/Dewas', 'Umum', 1),
  ('Administrasi Kepegawaian', 'Umum', 2),
  ('Manajemen Dokumen', 'Umum', 3);

-- Seed SOP
INSERT INTO sop (judul, kode, kategori_id, is_active) VALUES
(
  'SOP Pembinaan Rutin BUMD Triwulanan',
  'SOP-BUMD-01',
  (SELECT id FROM kategori_sop WHERE nama = 'Pembinaan dan Pengawasan' LIMIT 1),
  true
),
(
  'SOP Evaluasi Kinerja BUMD Tahunan',
  'SOP-BUMD-02',
  (SELECT id FROM kategori_sop WHERE nama = 'Monitoring dan Evaluasi' LIMIT 1),
  true
),
(
  'SOP Penerimaan dan Verifikasi Laporan Keuangan BUMD',
  'SOP-BUMD-03',
  (SELECT id FROM kategori_sop WHERE nama = 'Pelaporan Kinerja' LIMIT 1),
  true
),
(
  'SOP Penilaian GCG BUMD',
  'SOP-BUMD-04',
  (SELECT id FROM kategori_sop WHERE nama = 'Tata Kelola Perusahaan (GCG)' LIMIT 1),
  true
),
(
  'SOP Pengelolaan Anggaran RBA BLUD',
  'SOP-BLUD-01',
  (SELECT id FROM kategori_sop WHERE nama = 'Pengelolaan Keuangan' LIMIT 1),
  true
),
(
  'SOP Monitoring Capaian SPM Puskesmas',
  'SOP-BLUD-02',
  (SELECT id FROM kategori_sop WHERE nama = 'Standar Pelayanan Minimal (SPM)' LIMIT 1),
  true
),
(
  'SOP Pelaporan Kinerja BLUD Triwulanan',
  'SOP-BLUD-03',
  (SELECT id FROM kategori_sop WHERE nama = 'Pelaporan dan Akreditasi' LIMIT 1),
  true
),
(
  'SOP Persiapan dan Pendampingan Akreditasi Puskesmas',
  'SOP-BLUD-04',
  (SELECT id FROM kategori_sop WHERE nama = 'Pelaporan dan Akreditasi' LIMIT 1),
  true
),
(
  'SOP Proses Seleksi Direksi dan Dewan Pengawas BUMD',
  'SOP-SEL-01',
  (SELECT id FROM kategori_sop WHERE nama = 'Seleksi Direksi/Dewas' LIMIT 1),
  true
),
(
  'SOP Verifikasi Dokumen Peserta Seleksi',
  'SOP-SEL-02',
  (SELECT id FROM kategori_sop WHERE nama = 'Seleksi Direksi/Dewas' LIMIT 1),
  true
),
(
  'SOP Uji Kompetensi dan Kelayakan (UKK)',
  'SOP-SEL-03',
  (SELECT id FROM kategori_sop WHERE nama = 'Seleksi Direksi/Dewas' LIMIT 1),
  true
);

-- Seed Pengumuman
INSERT INTO pengumuman (judul, isi, kategori, is_publik) VALUES
(
  'Selamat Datang di SIMBUBALADA Kota Batu',
  'Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu telah resmi diluncurkan. Sistem ini bertujuan untuk meningkatkan transparansi dan akuntabilitas pengelolaan BUMD dan BLUD di Kota Batu.',
  'umum',
  true
),
(
  'Jadwal Monitoring dan Evaluasi BUMD Triwulan I Tahun 2025',
  'Pelaksanaan monitoring dan evaluasi kinerja BUMD Triwulan I Tahun 2025 akan dilaksanakan pada bulan April 2025. Seluruh Direksi BUMD diharapkan mempersiapkan laporan kinerja dan laporan keuangan.',
  'monev',
  true
);

-- ============================================================
-- AUDIT LOG TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, aksi, tabel, record_id, detail)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE to_jsonb(NEW)
    END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_seleksi AFTER INSERT OR UPDATE OR DELETE ON seleksi
  FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_peserta AFTER INSERT OR UPDATE OR DELETE ON peserta_seleksi
  FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_dokumen AFTER INSERT OR UPDATE OR DELETE ON dokumen_peserta
  FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_hasil AFTER INSERT OR UPDATE OR DELETE ON hasil_seleksi
  FOR EACH ROW EXECUTE FUNCTION log_audit();
