-- =============================================================
-- SIBUMBALUMBA - MONEV BUMD UPGRADE
-- Performance Based Monitoring System
-- =============================================================
-- FILE   : supabase/migrations/003_monev_upgrade_schema.sql
-- TANGGAL: 2026-07-01
-- TUJUAN : Upgrade sistem Monev BUMD menjadi Performance Based
--          Monitoring System dengan indikator dinamis,
--          scoring otomatis, dan workflow approval
-- =============================================================
-- REGULASI ACUAN:
-- - UU No. 23/2014 tentang Pemerintahan Daerah
-- - UU No. 1/2022 tentang HKPD
-- - PP No. 54/2017 tentang BUMD
-- - Permendagri No. 37/2018
-- - Khusus Perumdam: aturan SPAM/air minum
-- - Khusus Perseroda: UU PT, regulasi pariwisata
-- =============================================================


-- =============================================================
-- BAGIAN 1: MASTER KATEGORI INDIKATOR
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_kategori (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode        TEXT UNIQUE NOT NULL,         -- cth: 'KEU', 'OPR', 'GCG'
  nama        TEXT NOT NULL,                -- cth: 'Keuangan'
  deskripsi   TEXT,
  urutan      INTEGER DEFAULT 0,
  icon        TEXT,                         -- nama icon lucide-react
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.monev_subkategori (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori_id  UUID REFERENCES public.monev_kategori(id) ON DELETE CASCADE,
  kode         TEXT NOT NULL,
  nama         TEXT NOT NULL,
  urutan       INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(kategori_id, kode)
);


-- =============================================================
-- BAGIAN 2: MASTER INDIKATOR DINAMIS
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_indikator (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode            TEXT UNIQUE NOT NULL,       -- cth: 'KEU-001'
  nama            TEXT NOT NULL,
  kategori_id     UUID REFERENCES public.monev_kategori(id),
  subkategori_id  UUID REFERENCES public.monev_subkategori(id),

  -- Deskripsi teknis
  tujuan          TEXT,
  dasar_hukum     TEXT,                       -- regulasi yang melandasi
  definisi        TEXT,
  rumus           TEXT,                       -- formula perhitungan
  satuan          TEXT,                       -- %, Rp, orang, dll

  -- Tipe data input
  tipe_data       TEXT NOT NULL DEFAULT 'angka'
                  CHECK (tipe_data IN (
                    'angka','persen','rupiah','boolean',
                    'checklist','dokumen','tanggal','teks'
                  )),

  -- Konfigurasi penilaian
  bobot           NUMERIC(5,2) DEFAULT 0,     -- bobot dalam kategori (%)
  arah_penilaian  TEXT DEFAULT 'positif'
                  CHECK (arah_penilaian IN ('positif','negatif')),
                  -- positif: makin tinggi makin baik (laba)
                  -- negatif: makin rendah makin baik (biaya)

  -- Periode pelaporan
  periode         TEXT DEFAULT 'tahunan'
                  CHECK (periode IN ('bulanan','triwulan','semester','tahunan')),

  -- Sumber & metode
  sumber_data     TEXT,
  metode_penilaian TEXT,

  -- Scoring thresholds (bisa dikustomisasi per indikator)
  threshold_sangat_baik  NUMERIC(10,2),  -- >= nilai ini = Sangat Baik
  threshold_baik         NUMERIC(10,2),
  threshold_cukup        NUMERIC(10,2),
  threshold_kurang       NUMERIC(10,2),  -- < nilai ini = Tidak Baik

  -- Berlaku untuk jenis BUMD apa
  -- NULL = berlaku semua, atau list jenis: ['Perumdam','Perseroda']
  berlaku_untuk   JSONB DEFAULT '["Perumdam","Perseroda","PD","lainnya"]',

  -- Metadata
  is_wajib        BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  urutan          INTEGER DEFAULT 0,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- BAGIAN 3: TARGET INDIKATOR PER BUMD PER TAHUN
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_target (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indikator_id    UUID REFERENCES public.monev_indikator(id) ON DELETE CASCADE,
  bumd_id         UUID REFERENCES public.bumd(id) ON DELETE CASCADE,
  tahun           INTEGER NOT NULL,           -- 2021-2030
  periode         TEXT NOT NULL,             -- 'tahunan','semester_1','triwulan_1', dll
  target_nilai    NUMERIC(15,4),             -- nilai target
  target_dokumen  TEXT,                      -- deskripsi dokumen yang diharapkan
  bobot_override  NUMERIC(5,2),              -- override bobot dari indikator
  keterangan      TEXT,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(indikator_id, bumd_id, tahun, periode)
);


-- =============================================================
-- BAGIAN 4: REALISASI / INPUT DATA
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_realisasi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id       UUID REFERENCES public.monev_target(id) ON DELETE CASCADE,
  bumd_id         UUID REFERENCES public.bumd(id) ON DELETE CASCADE,
  indikator_id    UUID REFERENCES public.monev_indikator(id) ON DELETE CASCADE,
  tahun           INTEGER NOT NULL,
  periode         TEXT NOT NULL,

  -- Nilai realisasi (sesuai tipe_data)
  nilai_realisasi   NUMERIC(15,4),           -- untuk tipe angka/persen/rupiah
  nilai_boolean     BOOLEAN,                 -- untuk tipe boolean
  nilai_teks        TEXT,                    -- untuk tipe teks/checklist
  nilai_tanggal     DATE,                    -- untuk tipe tanggal
  dokumen_url       TEXT,                    -- untuk tipe dokumen
  dokumen_nama      TEXT,

  -- Scoring otomatis (dihitung oleh sistem)
  persentase_capaian NUMERIC(8,4),           -- realisasi/target * 100
  skor_raw           NUMERIC(8,4),           -- persentase * bobot
  kategori_capaian   TEXT,                   -- Sangat Baik/Baik/Cukup/Kurang/Tidak Baik

  -- Catatan
  catatan_input      TEXT,
  catatan_verifikasi TEXT,
  catatan_approval   TEXT,

  -- Workflow approval
  -- draft → submitted → verified → approved → final
  status             TEXT DEFAULT 'draft'
                     CHECK (status IN (
                       'draft','submitted','verified',
                       'approved','rejected','final'
                     )),

  -- Siapa yang melakukan tiap tahap
  submitted_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMP WITH TIME ZONE,
  verified_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at     TIMESTAMP WITH TIME ZONE,
  approved_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMP WITH TIME ZONE,
  finalized_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  finalized_at    TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- BAGIAN 5: RINGKASAN SKOR PER BUMD PER PERIODE
-- (dihitung otomatis dari realisasi)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_skor_ringkasan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bumd_id         UUID REFERENCES public.bumd(id) ON DELETE CASCADE,
  tahun           INTEGER NOT NULL,
  periode         TEXT NOT NULL,

  -- Skor per kategori
  skor_keuangan        NUMERIC(8,4) DEFAULT 0,
  skor_operasional     NUMERIC(8,4) DEFAULT 0,
  skor_tata_kelola     NUMERIC(8,4) DEFAULT 0,
  skor_sdm             NUMERIC(8,4) DEFAULT 0,
  skor_pelayanan       NUMERIC(8,4) DEFAULT 0,
  skor_csr             NUMERIC(8,4) DEFAULT 0,
  skor_kontribusi      NUMERIC(8,4) DEFAULT 0,

  -- Skor total
  skor_total           NUMERIC(8,4) DEFAULT 0,
  kategori_kinerja     TEXT,   -- Sangat Baik/Baik/Cukup/Kurang/Tidak Baik
  ranking              INTEGER,

  -- Progress pelaporan
  total_indikator      INTEGER DEFAULT 0,
  indikator_terisi     INTEGER DEFAULT 0,
  indikator_final      INTEGER DEFAULT 0,
  persentase_pelaporan NUMERIC(5,2) DEFAULT 0,

  -- Metadata
  dihitung_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bumd_id, tahun, periode)
);


-- =============================================================
-- BAGIAN 6: TINDAK LANJUT REKOMENDASI
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_tindak_lanjut (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bumd_id         UUID REFERENCES public.bumd(id) ON DELETE CASCADE,
  realisasi_id    UUID REFERENCES public.monev_realisasi(id) ON DELETE SET NULL,
  tahun           INTEGER NOT NULL,
  periode         TEXT NOT NULL,

  -- Detail masalah
  permasalahan    TEXT NOT NULL,
  analisis        TEXT,
  rekomendasi     TEXT NOT NULL,

  -- Penanganan
  pic             TEXT,                      -- Person In Charge
  deadline        DATE,
  progress        INTEGER DEFAULT 0          -- 0-100 persen
                  CHECK (progress >= 0 AND progress <= 100),
  bukti_url       TEXT,
  bukti_nama      TEXT,

  -- Status
  status          TEXT DEFAULT 'open'
                  CHECK (status IN ('open','in_progress','selesai','ditutup')),

  -- Metadata
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- BAGIAN 7: HISTORY / AUDIT TRAIL MONEV
-- =============================================================

CREATE TABLE IF NOT EXISTS public.monev_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabel           TEXT NOT NULL,             -- nama tabel yang diubah
  record_id       UUID NOT NULL,             -- id record yang diubah
  aksi            TEXT NOT NULL,             -- INSERT/UPDATE/DELETE/APPROVE/REJECT
  data_lama       JSONB,
  data_baru       JSONB,
  keterangan      TEXT,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- BAGIAN 8: INDEKS UNTUK PERFORMA
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_monev_realisasi_bumd_tahun
  ON public.monev_realisasi(bumd_id, tahun, periode);

CREATE INDEX IF NOT EXISTS idx_monev_realisasi_status
  ON public.monev_realisasi(status);

CREATE INDEX IF NOT EXISTS idx_monev_target_bumd_tahun
  ON public.monev_target(bumd_id, tahun);

CREATE INDEX IF NOT EXISTS idx_monev_indikator_kategori
  ON public.monev_indikator(kategori_id);

CREATE INDEX IF NOT EXISTS idx_monev_indikator_berlaku
  ON public.monev_indikator USING gin(berlaku_untuk);

CREATE INDEX IF NOT EXISTS idx_monev_skor_tahun
  ON public.monev_skor_ringkasan(tahun, periode);

CREATE INDEX IF NOT EXISTS idx_monev_history_record
  ON public.monev_history(record_id, tabel);


-- =============================================================
-- BAGIAN 9: RLS UNTUK TABEL BARU
-- =============================================================

ALTER TABLE public.monev_kategori        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_subkategori     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_indikator       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_target          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_realisasi       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_skor_ringkasan  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_tindak_lanjut   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monev_history         ENABLE ROW LEVEL SECURITY;

-- Semua user internal bisa baca
CREATE POLICY "monev_kategori_read" ON public.monev_kategori
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_subkategori_read" ON public.monev_subkategori
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_indikator_read" ON public.monev_indikator
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_target_read" ON public.monev_target
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_realisasi_read" ON public.monev_realisasi
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_skor_read" ON public.monev_skor_ringkasan
  FOR SELECT USING (public.is_internal_user());
CREATE POLICY "monev_tindak_lanjut_read" ON public.monev_tindak_lanjut
  FOR SELECT USING (public.is_internal_user());

-- Hanya super_admin yang bisa kelola master indikator
CREATE POLICY "monev_kategori_manage" ON public.monev_kategori
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
CREATE POLICY "monev_subkategori_manage" ON public.monev_subkategori
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
CREATE POLICY "monev_indikator_manage" ON public.monev_indikator
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Admin BUMD/BLUD/BPSDA bisa input realisasi dan target
CREATE POLICY "monev_target_manage" ON public.monev_target
  FOR ALL USING (public.is_admin_bumd())
  WITH CHECK (public.is_admin_bumd());
CREATE POLICY "monev_realisasi_manage" ON public.monev_realisasi
  FOR ALL USING (public.is_admin_bumd())
  WITH CHECK (public.is_admin_bumd());
CREATE POLICY "monev_tindak_lanjut_manage" ON public.monev_tindak_lanjut
  FOR ALL USING (public.is_admin_bumd())
  WITH CHECK (public.is_admin_bumd());

-- History hanya super_admin
CREATE POLICY "monev_history_read" ON public.monev_history
  FOR SELECT USING (public.is_super_admin());
CREATE POLICY "monev_history_insert" ON public.monev_history
  FOR INSERT WITH CHECK (public.is_internal_user());

-- Service role full access
CREATE POLICY "monev_kategori_service"       ON public.monev_kategori        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_subkategori_service"    ON public.monev_subkategori     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_indikator_service"      ON public.monev_indikator       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_target_service"         ON public.monev_target          FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_realisasi_service"      ON public.monev_realisasi       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_skor_service"           ON public.monev_skor_ringkasan  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_tindak_lanjut_service"  ON public.monev_tindak_lanjut   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "monev_history_service"        ON public.monev_history         FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =============================================================
-- BAGIAN 10: FUNCTION SCORING OTOMATIS
-- =============================================================

CREATE OR REPLACE FUNCTION public.hitung_kategori_capaian(
  p_persentase NUMERIC,
  p_indikator_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_sangat_baik  NUMERIC := 100;
  v_baik         NUMERIC := 85;
  v_cukup        NUMERIC := 70;
  v_kurang       NUMERIC := 60;
BEGIN
  -- Ambil threshold custom per indikator jika ada
  IF p_indikator_id IS NOT NULL THEN
    SELECT
      COALESCE(threshold_sangat_baik, 100),
      COALESCE(threshold_baik, 85),
      COALESCE(threshold_cukup, 70),
      COALESCE(threshold_kurang, 60)
    INTO v_sangat_baik, v_baik, v_cukup, v_kurang
    FROM public.monev_indikator
    WHERE id = p_indikator_id;
  END IF;

  RETURN CASE
    WHEN p_persentase >= v_sangat_baik THEN 'Sangat Baik'
    WHEN p_persentase >= v_baik        THEN 'Baik'
    WHEN p_persentase >= v_cukup       THEN 'Cukup'
    WHEN p_persentase >= v_kurang      THEN 'Kurang'
    ELSE 'Tidak Baik'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


CREATE OR REPLACE FUNCTION public.hitung_skor_realisasi(
  p_realisasi_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_r           RECORD;
  v_target      NUMERIC;
  v_realisasi   NUMERIC;
  v_bobot       NUMERIC;
  v_persentase  NUMERIC;
  v_skor        NUMERIC;
  v_kategori    TEXT;
BEGIN
  SELECT
    r.*,
    t.target_nilai,
    COALESCE(t.bobot_override, i.bobot) AS bobot_efektif,
    i.arah_penilaian,
    i.tipe_data
  INTO v_r
  FROM public.monev_realisasi r
  JOIN public.monev_target t ON t.id = r.target_id
  JOIN public.monev_indikator i ON i.id = r.indikator_id
  WHERE r.id = p_realisasi_id;

  IF NOT FOUND THEN RETURN; END IF;

  v_target    := v_r.target_nilai;
  v_realisasi := v_r.nilai_realisasi;
  v_bobot     := v_r.bobot_efektif;

  -- Hitung persentase capaian
  IF v_target IS NULL OR v_target = 0 THEN
    v_persentase := 0;
  ELSIF v_r.arah_penilaian = 'negatif' THEN
    -- Indikator negatif: jika realisasi < target = bagus
    v_persentase := LEAST((v_target / NULLIF(v_realisasi, 0)) * 100, 150);
  ELSE
    -- Indikator positif: jika realisasi > target = bagus
    v_persentase := LEAST((v_realisasi / v_target) * 100, 150);
  END IF;

  -- Hitung skor = persentase * bobot / 100
  v_skor := (v_persentase * v_bobot) / 100;

  -- Kategori capaian
  v_kategori := public.hitung_kategori_capaian(v_persentase, v_r.indikator_id);

  -- Update realisasi
  UPDATE public.monev_realisasi SET
    persentase_capaian = ROUND(v_persentase, 4),
    skor_raw           = ROUND(v_skor, 4),
    kategori_capaian   = v_kategori,
    updated_at         = NOW()
  WHERE id = p_realisasi_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger: hitung skor otomatis setiap kali realisasi diisi/diupdate
CREATE OR REPLACE FUNCTION public.trigger_hitung_skor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nilai_realisasi IS NOT NULL AND NEW.target_id IS NOT NULL THEN
    PERFORM public.hitung_skor_realisasi(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_realisasi_insert ON public.monev_realisasi;
CREATE TRIGGER on_realisasi_insert
  AFTER INSERT ON public.monev_realisasi
  FOR EACH ROW EXECUTE FUNCTION public.trigger_hitung_skor();

DROP TRIGGER IF EXISTS on_realisasi_update ON public.monev_realisasi;
CREATE TRIGGER on_realisasi_update
  AFTER UPDATE OF nilai_realisasi ON public.monev_realisasi
  FOR EACH ROW EXECUTE FUNCTION public.trigger_hitung_skor();


-- =============================================================
-- BAGIAN 11: FUNCTION HITUNG RINGKASAN SKOR BUMD
-- =============================================================

CREATE OR REPLACE FUNCTION public.hitung_skor_ringkasan_bumd(
  p_bumd_id UUID,
  p_tahun   INTEGER,
  p_periode TEXT
)
RETURNS VOID AS $$
DECLARE
  v_skor          RECORD;
  v_total         NUMERIC := 0;
  v_kategori      TEXT;
  v_total_ind     INTEGER;
  v_terisi        INTEGER;
  v_final         INTEGER;
BEGIN
  -- Hitung skor per kategori
  SELECT
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'KEU'), 0)  AS keuangan,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'OPR'), 0)  AS operasional,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'GCG'), 0)  AS tata_kelola,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'SDM'), 0)  AS sdm,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'PLY'), 0)  AS pelayanan,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'CSR'), 0)  AS csr,
    COALESCE(SUM(r.skor_raw) FILTER (WHERE k.kode = 'KTB'), 0)  AS kontribusi,
    COUNT(r.id)                                                   AS total_ind,
    COUNT(r.id) FILTER (WHERE r.nilai_realisasi IS NOT NULL)      AS terisi,
    COUNT(r.id) FILTER (WHERE r.status = 'final')                 AS final_ind
  INTO v_skor
  FROM public.monev_realisasi r
  JOIN public.monev_indikator i  ON i.id = r.indikator_id
  JOIN public.monev_kategori k   ON k.id = i.kategori_id
  WHERE r.bumd_id = p_bumd_id
    AND r.tahun   = p_tahun
    AND r.periode = p_periode;

  v_total := v_skor.keuangan + v_skor.operasional + v_skor.tata_kelola +
             v_skor.sdm + v_skor.pelayanan + v_skor.csr + v_skor.kontribusi;

  v_kategori := CASE
    WHEN v_total >= 90 THEN 'Sangat Baik'
    WHEN v_total >= 80 THEN 'Baik'
    WHEN v_total >= 70 THEN 'Cukup'
    WHEN v_total >= 60 THEN 'Kurang'
    ELSE 'Tidak Baik'
  END;

  -- Upsert ringkasan
  INSERT INTO public.monev_skor_ringkasan (
    bumd_id, tahun, periode,
    skor_keuangan, skor_operasional, skor_tata_kelola,
    skor_sdm, skor_pelayanan, skor_csr, skor_kontribusi,
    skor_total, kategori_kinerja,
    total_indikator, indikator_terisi, indikator_final,
    persentase_pelaporan, dihitung_at
  ) VALUES (
    p_bumd_id, p_tahun, p_periode,
    ROUND(v_skor.keuangan::NUMERIC, 4),
    ROUND(v_skor.operasional::NUMERIC, 4),
    ROUND(v_skor.tata_kelola::NUMERIC, 4),
    ROUND(v_skor.sdm::NUMERIC, 4),
    ROUND(v_skor.pelayanan::NUMERIC, 4),
    ROUND(v_skor.csr::NUMERIC, 4),
    ROUND(v_skor.kontribusi::NUMERIC, 4),
    ROUND(v_total::NUMERIC, 4), v_kategori,
    v_skor.total_ind, v_skor.terisi, v_skor.final_ind,
    CASE WHEN v_skor.total_ind > 0
         THEN ROUND((v_skor.terisi::NUMERIC / v_skor.total_ind) * 100, 2)
         ELSE 0 END,
    NOW()
  )
  ON CONFLICT (bumd_id, tahun, periode) DO UPDATE SET
    skor_keuangan        = EXCLUDED.skor_keuangan,
    skor_operasional     = EXCLUDED.skor_operasional,
    skor_tata_kelola     = EXCLUDED.skor_tata_kelola,
    skor_sdm             = EXCLUDED.skor_sdm,
    skor_pelayanan       = EXCLUDED.skor_pelayanan,
    skor_csr             = EXCLUDED.skor_csr,
    skor_kontribusi      = EXCLUDED.skor_kontribusi,
    skor_total           = EXCLUDED.skor_total,
    kategori_kinerja     = EXCLUDED.kategori_kinerja,
    total_indikator      = EXCLUDED.total_indikator,
    indikator_terisi     = EXCLUDED.indikator_terisi,
    indikator_final      = EXCLUDED.indikator_final,
    persentase_pelaporan = EXCLUDED.persentase_pelaporan,
    dihitung_at          = NOW(),
    updated_at           = NOW();

  -- Update ranking semua BUMD untuk tahun & periode ini
  UPDATE public.monev_skor_ringkasan s SET
    ranking = sub.rank
  FROM (
    SELECT id, RANK() OVER (
      PARTITION BY tahun, periode ORDER BY skor_total DESC
    ) AS rank
    FROM public.monev_skor_ringkasan
    WHERE tahun = p_tahun AND periode = p_periode
  ) sub
  WHERE s.id = sub.id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================
-- BAGIAN 12: DATA MASTER KATEGORI INDIKATOR
-- =============================================================

INSERT INTO public.monev_kategori (kode, nama, deskripsi, urutan, icon) VALUES
  ('KEU', 'Keuangan',           'Indikator kinerja keuangan BUMD',                   1, 'TrendingUp'),
  ('OPR', 'Operasional',        'Indikator kinerja operasional sesuai jenis usaha',  2, 'Settings'),
  ('GCG', 'Tata Kelola (GCG)',  'Prinsip Good Corporate Governance',                 3, 'Shield'),
  ('SDM', 'SDM',                'Sumber Daya Manusia',                               4, 'Users'),
  ('PLY', 'Pelayanan Publik',   'Standar Pelayanan Minimal dan kepuasan masyarakat', 5, 'HeartHandshake'),
  ('CSR', 'CSR & Sosial',       'Program tanggung jawab sosial perusahaan',          6, 'Heart'),
  ('KTB', 'Kontribusi Daerah',  'Kontribusi BUMD terhadap PAD dan keuangan daerah',  7, 'Building'),
  ('PRN', 'Perencanaan',        'Business Plan, RKAP, KPI Direksi',                  8, 'FileBarChart'),
  ('RSK', 'Risiko & Audit',     'Risk Register, Audit Internal/Eksternal',           9, 'AlertTriangle')
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 13: SUBKATEGORI KEUANGAN
-- =============================================================

INSERT INTO public.monev_subkategori (kategori_id, kode, nama, urutan)
SELECT k.id, sub.kode, sub.nama, sub.urutan
FROM public.monev_kategori k
CROSS JOIN (VALUES
  ('KEU-PRF', 'Profitabilitas', 1),
  ('KEU-LKS', 'Likuiditas',     2),
  ('KEU-SOL', 'Solvabilitas',   3),
  ('KEU-EFI', 'Efisiensi',      4),
  ('KEU-PRT', 'Pertumbuhan',    5),
  ('KEU-AST', 'Aset & Modal',   6),
  ('KEU-DIV', 'Dividen & PAD',  7)
) AS sub(kode, nama, urutan)
WHERE k.kode = 'KEU'
ON CONFLICT (kategori_id, kode) DO NOTHING;


-- =============================================================
-- BAGIAN 14: SEED INDIKATOR KEUANGAN UMUM (berlaku semua BUMD)
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan,
  threshold_sangat_baik, threshold_baik, threshold_cukup, threshold_kurang
)
SELECT
  ind.kode, ind.nama,
  k.id AS kategori_id,
  sk.id AS subkategori_id,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  ind.berlaku_untuk::jsonb, ind.is_wajib, ind.urutan,
  ind.t_sb, ind.t_b, ind.t_c, ind.t_k
FROM (VALUES
  -- Profitabilitas
  ('KEU-001','Return on Equity (ROE)','KEU','KEU-PRF',
   'Mengukur kemampuan BUMD menghasilkan laba dari ekuitas',
   'PP 54/2017 Pasal 91',
   'Perbandingan laba bersih terhadap total ekuitas',
   'Laba Bersih / Total Ekuitas × 100%',
   '%', 5.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,1, 100,80,60,40),

  ('KEU-002','Return on Asset (ROA)','KEU','KEU-PRF',
   'Mengukur kemampuan aset menghasilkan laba',
   'PP 54/2017 Pasal 91',
   'Perbandingan laba bersih terhadap total aset',
   'Laba Bersih / Total Aset × 100%',
   '%', 5.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,2, 100,80,60,40),

  ('KEU-003','Net Profit Margin (NPM)','KEU','KEU-PRF',
   'Mengukur efisiensi menghasilkan laba dari pendapatan',
   'PP 54/2017',
   'Perbandingan laba bersih terhadap pendapatan',
   'Laba Bersih / Pendapatan × 100%',
   '%', 4.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,3, 100,80,60,40),

  -- Likuiditas
  ('KEU-004','Current Ratio','KEU','KEU-LKS',
   'Mengukur kemampuan BUMD memenuhi kewajiban jangka pendek',
   'PP 54/2017',
   'Perbandingan aset lancar terhadap kewajiban lancar',
   'Aset Lancar / Kewajiban Lancar',
   'x', 3.00, 'positif','tahunan','angka',
   '["Perumdam","Perseroda","PD","lainnya"]',true,4, 100,80,60,40),

  ('KEU-005','Quick Ratio','KEU','KEU-LKS',
   'Mengukur likuiditas tanpa persediaan',
   'PP 54/2017',
   'Perbandingan aset lancar dikurangi persediaan terhadap kewajiban lancar',
   '(Aset Lancar - Persediaan) / Kewajiban Lancar',
   'x', 2.00, 'positif','tahunan','angka',
   '["Perumdam","Perseroda","PD","lainnya"]',true,5, 100,80,60,40),

  -- Solvabilitas
  ('KEU-006','Debt to Equity Ratio (DER)','KEU','KEU-SOL',
   'Mengukur proporsi utang terhadap ekuitas',
   'PP 54/2017',
   'Perbandingan total utang terhadap ekuitas',
   'Total Utang / Total Ekuitas',
   'x', 3.00, 'negatif','tahunan','angka',
   '["Perumdam","Perseroda","PD","lainnya"]',true,6, 100,80,60,40),

  ('KEU-007','Debt Ratio','KEU','KEU-SOL',
   'Mengukur proporsi aset yang dibiayai utang',
   'PP 54/2017',
   'Perbandingan total utang terhadap total aset',
   'Total Utang / Total Aset × 100%',
   '%', 2.00, 'negatif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,7, 100,80,60,40),

  -- Pertumbuhan
  ('KEU-008','Pertumbuhan Pendapatan','KEU','KEU-PRT',
   'Mengukur tingkat pertumbuhan pendapatan',
   'PP 54/2017',
   'Perbandingan pertumbuhan pendapatan tahun ini vs tahun lalu',
   '(Pendapatan t - Pendapatan t-1) / Pendapatan t-1 × 100%',
   '%', 4.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,8, 100,80,60,40),

  ('KEU-009','Pertumbuhan Laba','KEU','KEU-PRT',
   'Mengukur tingkat pertumbuhan laba bersih',
   'PP 54/2017',
   'Perbandingan pertumbuhan laba tahun ini vs tahun lalu',
   '(Laba t - Laba t-1) / Laba t-1 × 100%',
   '%', 4.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,9, 100,80,60,40),

  -- Aset & Modal
  ('KEU-010','Total Aset','KEU','KEU-AST',
   'Nilai total aset BUMD',
   'PP 54/2017',
   'Seluruh aset yang dimiliki BUMD',
   'Aset Lancar + Aset Tidak Lancar',
   'Rp', 2.00, 'positif','tahunan','rupiah',
   '["Perumdam","Perseroda","PD","lainnya"]',true,10, 100,80,60,40),

  ('KEU-011','Total Ekuitas','KEU','KEU-AST',
   'Nilai ekuitas BUMD',
   'PP 54/2017',
   'Modal yang dimiliki BUMD',
   'Total Aset - Total Kewajiban',
   'Rp', 2.00, 'positif','tahunan','rupiah',
   '["Perumdam","Perseroda","PD","lainnya"]',true,11, 100,80,60,40),

  -- Dividen
  ('KEU-012','Dividen ke Daerah','KEU','KEU-DIV',
   'Kontribusi dividen kepada Pemda',
   'PP 54/2017, Perda BUMD',
   'Total dividen yang disetor kepada Pemerintah Daerah',
   'Laba Bersih × Persentase Dividen',
   'Rp', 4.00, 'positif','tahunan','rupiah',
   '["Perumdam","Perseroda","PD","lainnya"]',true,12, 100,80,60,40),

  ('KEU-013','Dividend Payout Ratio','KEU','KEU-DIV',
   'Persentase laba yang dibagikan sebagai dividen',
   'PP 54/2017',
   'Perbandingan dividen terhadap laba bersih',
   'Dividen / Laba Bersih × 100%',
   '%', 2.00, 'positif','tahunan','persen',
   '["Perumdam","Perseroda","PD","lainnya"]',true,13, 100,80,60,40)

) AS ind(kode,nama,kat_kode,subkat_kode,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,berlaku_untuk,is_wajib,urutan,
         t_sb,t_b,t_c,t_k)
JOIN public.monev_kategori k ON k.kode = ind.kat_kode
JOIN public.monev_subkategori sk ON sk.kode = ind.subkat_kode AND sk.kategori_id = k.id
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 15: INDIKATOR OPERASIONAL KHUSUS PERUMDAM (air minum)
-- Regulasi: Permendagri 37/2018, Perpres 90/2016 SPAM
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan
)
SELECT
  ind.kode, ind.nama, k.id, NULL,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  '["Perumdam"]'::jsonb, true, ind.urutan
FROM (VALUES
  ('OPR-PDM-001','Cakupan Pelayanan Air Minum',
   'Mengukur persentase penduduk terlayani jaringan air minum',
   'Perpres 90/2016, Permendagri 37/2018',
   'Persentase jumlah pelanggan SR dibanding total KK dalam wilayah pelayanan',
   'Jumlah SR Aktif / Total KK Wilayah × 100%',
   '%', 8.00, 'positif','tahunan','persen',1),

  ('OPR-PDM-002','Tingkat Kehilangan Air (NRW)',
   'Mengukur efisiensi distribusi air minum',
   'Permendagri 37/2018 Pasal 24',
   'Persentase air yang hilang dalam sistem distribusi',
   '(Air Diproduksi - Air Terjual) / Air Diproduksi × 100%',
   '%', 8.00, 'negatif','tahunan','persen',2),

  ('OPR-PDM-003','Kontinuitas Aliran Air',
   'Mengukur ketersediaan air selama 24 jam',
   'Permendagri 37/2018',
   'Rata-rata jam pelayanan air per hari',
   'Total jam aliran / Total titik ukur',
   'jam/hari', 5.00, 'positif','tahunan','angka',3),

  ('OPR-PDM-004','Kualitas Air (Memenuhi Baku Mutu)',
   'Memastikan kualitas air sesuai standar kesehatan',
   'Permenkes 492/2010, Permendagri 37/2018',
   'Persentase sampel air yang memenuhi baku mutu',
   'Sampel Memenuhi Standar / Total Sampel × 100%',
   '%', 7.00, 'positif','tahunan','persen',4),

  ('OPR-PDM-005','Jumlah Sambungan Rumah (SR) Aktif',
   'Mengukur pertumbuhan pelanggan',
   'Perpres 90/2016',
   'Total sambungan rumah yang aktif berlangganan',
   'Count SR Aktif',
   'SR', 4.00, 'positif','tahunan','angka',5),

  ('OPR-PDM-006','Tarif Air vs HPP',
   'Memastikan tarif menutupi biaya produksi',
   'Permendagri 71/2016 tentang Tarif Air Minum',
   'Perbandingan tarif rata-rata terhadap HPP air',
   'Tarif Rata-rata / HPP Air × 100%',
   '%', 4.00, 'positif','tahunan','persen',6),

  ('OPR-PDM-007','Penagihan dan Kolektibilitas',
   'Mengukur efektivitas penagihan piutang pelanggan',
   'PP 54/2017',
   'Persentase tagihan yang berhasil ditagih',
   'Penerimaan / Total Tagihan × 100%',
   '%', 4.00, 'positif','tahunan','persen',7)

) AS ind(kode,nama,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,urutan)
JOIN public.monev_kategori k ON k.kode = 'OPR'
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 16: INDIKATOR OPERASIONAL KHUSUS PERSERODA (pariwisata)
-- Regulasi: UU 10/2009 tentang Kepariwisataan, PP 54/2017
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan
)
SELECT
  ind.kode, ind.nama, k.id, NULL,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  '["Perseroda"]'::jsonb, true, ind.urutan
FROM (VALUES
  ('OPR-PSR-001','Jumlah Kunjungan Wisatawan',
   'Mengukur jumlah wisatawan yang dilayani',
   'UU 10/2009, PP 54/2017',
   'Total wisatawan nusantara dan mancanegara yang berkunjung',
   'Count Total Wisatawan',
   'orang', 8.00, 'positif','tahunan','angka',1),

  ('OPR-PSR-002','Pendapatan dari Sektor Pariwisata',
   'Mengukur total pendapatan dari layanan wisata',
   'UU 10/2009, PP 54/2017',
   'Total pendapatan dari tiket, akomodasi, dan layanan wisata',
   'Sum Pendapatan Wisata',
   'Rp', 8.00, 'positif','tahunan','rupiah',2),

  ('OPR-PSR-003','Tingkat Hunian (Occupancy Rate)',
   'Mengukur tingkat pemanfaatan fasilitas wisata',
   'UU 10/2009',
   'Persentase utilisasi kapasitas fasilitas wisata',
   'Hari Terpakai / Total Hari Tersedia × 100%',
   '%', 6.00, 'positif','tahunan','persen',3),

  ('OPR-PSR-004','Indeks Kepuasan Wisatawan',
   'Mengukur kepuasan pengunjung terhadap layanan',
   'UU 25/2009 tentang Pelayanan Publik',
   'Hasil survei kepuasan wisatawan (skala 1-100)',
   'Survey Score / Skala Maksimum × 100',
   'skor', 6.00, 'positif','tahunan','angka',4),

  ('OPR-PSR-005','Jumlah Produk/Destinasi Wisata',
   'Mengukur diversifikasi produk wisata',
   'UU 10/2009',
   'Total destinasi dan produk wisata yang dikelola',
   'Count Destinasi Aktif',
   'destinasi', 4.00, 'positif','tahunan','angka',5),

  ('OPR-PSR-006','Pendapatan per Wisatawan (Revenue per Visitor)',
   'Mengukur efektivitas monetisasi wisatawan',
   'PP 54/2017',
   'Rata-rata pendapatan yang diperoleh per wisatawan',
   'Total Pendapatan / Total Wisatawan',
   'Rp', 4.00, 'positif','tahunan','rupiah',6),

  ('OPR-PSR-007','Investasi Pengembangan Produk Wisata',
   'Mengukur komitmen investasi pengembangan',
   'PP 54/2017',
   'Total investasi capex untuk pengembangan destinasi wisata',
   'Sum Capex Wisata',
   'Rp', 4.00, 'positif','tahunan','rupiah',7)

) AS ind(kode,nama,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,urutan)
JOIN public.monev_kategori k ON k.kode = 'OPR'
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 17: INDIKATOR TATA KELOLA GCG (berlaku semua BUMD)
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan
)
SELECT
  ind.kode, ind.nama, k.id, NULL,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  '["Perumdam","Perseroda","PD","lainnya"]'::jsonb, ind.is_wajib, ind.urutan
FROM (VALUES
  ('GCG-001','RKAP Disetujui Tepat Waktu',
   'Memastikan RKAP disahkan sebelum tahun berjalan',
   'PP 54/2017 Pasal 79',
   'RKAP telah disetujui oleh RUPS/KPM sebelum 31 Desember',
   'Tanggal Persetujuan RKAP ≤ 31 Desember tahun sebelumnya',
   'boolean', 4.00, 'positif','tahunan','boolean',true,1),

  ('GCG-002','Laporan Tahunan (Annual Report) Tersedia',
   'Memastikan transparansi pelaporan tahunan',
   'PP 54/2017 Pasal 85',
   'Annual Report telah disusun dan dipublikasikan',
   'Ketersediaan Annual Report',
   'boolean', 4.00, 'positif','tahunan','boolean',true,2),

  ('GCG-003','Laporan Keuangan Diaudit Tepat Waktu',
   'Memastikan laporan keuangan diaudit sesuai ketentuan',
   'PP 54/2017 Pasal 84',
   'Laporan keuangan telah diaudit oleh KAP/BPK sebelum batas waktu',
   'Tanggal penerbitan LK Audited ≤ 30 April',
   'boolean', 5.00, 'positif','tahunan','boolean',true,3),

  ('GCG-004','RUPS/Rapat KPM Terlaksana',
   'Memastikan mekanisme RUPS berjalan sesuai ketentuan',
   'PP 54/2017, UU PT',
   'RUPS Tahunan telah dilaksanakan',
   'Ketersediaan risalah RUPS',
   'boolean', 3.00, 'positif','tahunan','boolean',true,4),

  ('GCG-005','Kepatuhan Pembayaran Pajak',
   'Memastikan BUMD patuh kewajiban perpajakan',
   'UU 36/2008 tentang PPh',
   'Seluruh kewajiban pajak dibayar tepat waktu (tidak ada denda)',
   'Kepatuhan pajak = tidak ada STP/SKP',
   'boolean', 4.00, 'positif','tahunan','boolean',true,5),

  ('GCG-006','Kepatuhan BPJS Ketenagakerjaan & Kesehatan',
   'Memastikan pemenuhan hak jaminan sosial karyawan',
   'UU 24/2011 tentang BPJS',
   'Seluruh karyawan terdaftar dan iuran dibayar rutin',
   'Persentase karyawan terdaftar BPJS',
   '%', 3.00, 'positif','tahunan','persen',true,6),

  ('GCG-007','Penilaian GCG/AKHLAK',
   'Mengukur implementasi GCG secara komprehensif',
   'Permendagri 37/2018, PermenBUMN terkait',
   'Nilai assessment GCG atau implementasi nilai AKHLAK',
   'Skor Assessment GCG (0-100)',
   'skor', 6.00, 'positif','tahunan','angka',true,7),

  ('GCG-008','Sistem Pengendalian Internal (SPI)',
   'Memastikan sistem kontrol internal berjalan efektif',
   'PP 60/2008 tentang SPIP',
   'SPI telah berjalan dan dilaporkan',
   'Ketersediaan laporan SPI',
   'boolean', 3.00, 'positif','tahunan','boolean',true,8)

) AS ind(kode,nama,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,is_wajib,urutan)
JOIN public.monev_kategori k ON k.kode = 'GCG'
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 18: INDIKATOR SDM (berlaku semua BUMD)
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan
)
SELECT
  ind.kode, ind.nama, k.id, NULL,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  '["Perumdam","Perseroda","PD","lainnya"]'::jsonb, true, ind.urutan
FROM (VALUES
  ('SDM-001','Jumlah Pegawai',
   'Mengetahui total SDM BUMD',
   'PP 54/2017',
   'Total pegawai tetap dan kontrak',
   'Count Total Pegawai',
   'orang', 2.00, 'positif','tahunan','angka',1),

  ('SDM-002','Produktivitas Pegawai (Revenue/Pegawai)',
   'Mengukur efisiensi SDM dalam menghasilkan pendapatan',
   'PP 54/2017',
   'Rata-rata pendapatan yang dihasilkan per pegawai',
   'Total Pendapatan / Jumlah Pegawai',
   'Rp', 4.00, 'positif','tahunan','rupiah',2),

  ('SDM-003','Persentase Pegawai Berpendidikan S1/D4+',
   'Mengukur kualitas SDM berdasarkan pendidikan',
   'PP 54/2017',
   'Proporsi pegawai dengan pendidikan minimal S1/D4',
   'Pegawai S1+ / Total Pegawai × 100%',
   '%', 2.00, 'positif','tahunan','persen',3),

  ('SDM-004','Realisasi Pelatihan/Diklat',
   'Mengukur investasi pengembangan kompetensi',
   'PP 54/2017',
   'Jumlah jam pelatihan per pegawai per tahun',
   'Total Jam Pelatihan / Total Pegawai',
   'jam/orang', 3.00, 'positif','tahunan','angka',4),

  ('SDM-005','Tingkat Turnover Pegawai',
   'Mengukur stabilitas SDM BUMD',
   'PP 54/2017',
   'Persentase pegawai yang keluar dalam setahun',
   'Pegawai Keluar / Rata-rata Pegawai × 100%',
   '%', 2.00, 'negatif','tahunan','persen',5)

) AS ind(kode,nama,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,urutan)
JOIN public.monev_kategori k ON k.kode = 'SDM'
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 19: INDIKATOR KONTRIBUSI DAERAH (berlaku semua BUMD)
-- =============================================================

INSERT INTO public.monev_indikator (
  kode, nama, kategori_id, subkategori_id,
  tujuan, dasar_hukum, definisi, rumus, satuan,
  bobot, arah_penilaian, periode, tipe_data,
  berlaku_untuk, is_wajib, urutan
)
SELECT
  ind.kode, ind.nama, k.id, NULL,
  ind.tujuan, ind.dasar_hukum, ind.definisi, ind.rumus, ind.satuan,
  ind.bobot, ind.arah_penilaian, ind.periode, ind.tipe_data,
  '["Perumdam","Perseroda","PD","lainnya"]'::jsonb, true, ind.urutan
FROM (VALUES
  ('KTB-001','Kontribusi terhadap PAD',
   'Mengukur kontribusi BUMD terhadap Pendapatan Asli Daerah',
   'UU 23/2014, PP 54/2017',
   'Total setoran BUMD kepada Pemerintah Daerah (dividen+pajak+lainnya)',
   'Sum Setoran ke Pemda',
   'Rp', 5.00, 'positif','tahunan','rupiah',1),

  ('KTB-002','ROI Penyertaan Modal Daerah (PMD)',
   'Mengukur imbal hasil investasi Pemda di BUMD',
   'PP 54/2017, Permendagri 77/2020',
   'Perbandingan dividen terhadap total PMD yang ditanamkan',
   'Dividen / Total PMD × 100%',
   '%', 5.00, 'positif','tahunan','persen',2),

  ('KTB-003','Realisasi Program CSR/TJSL',
   'Mengukur kontribusi sosial BUMD kepada masyarakat',
   'UU 40/2007 tentang PT, PP 47/2012',
   'Persentase realisasi anggaran CSR terhadap rencana',
   'Realisasi CSR / Anggaran CSR × 100%',
   '%', 3.00, 'positif','tahunan','persen',3)

) AS ind(kode,nama,tujuan,dasar_hukum,definisi,rumus,satuan,
         bobot,arah_penilaian,periode,tipe_data,urutan)
JOIN public.monev_kategori k ON k.kode = 'KTB'
ON CONFLICT (kode) DO NOTHING;


-- =============================================================
-- BAGIAN 20: VERIFIKASI AKHIR
-- =============================================================

-- Cek jumlah indikator per kategori
SELECT
  k.kode,
  k.nama AS kategori,
  COUNT(i.id) AS jumlah_indikator,
  SUM(i.bobot) AS total_bobot
FROM public.monev_kategori k
LEFT JOIN public.monev_indikator i ON i.kategori_id = k.id AND i.is_active = true
GROUP BY k.id, k.kode, k.nama, k.urutan
ORDER BY k.urutan;

-- Cek indikator khusus per jenis BUMD
SELECT
  kode, nama,
  berlaku_untuk,
  bobot,
  tipe_data
FROM public.monev_indikator
WHERE berlaku_untuk != '["Perumdam","Perseroda","PD","lainnya"]'
ORDER BY kode;

-- Cek semua tabel baru
SELECT tablename, rowsecurity AS rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'monev_%'
ORDER BY tablename;
