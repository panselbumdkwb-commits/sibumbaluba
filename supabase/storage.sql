-- ============================================================
-- SIMBUBALADA - Supabase Storage Setup
-- Jalankan di Supabase SQL Editor SETELAH schema.sql
-- ============================================================

-- ── 1. Buat Buckets ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'seleksi-dokumen',
    'seleksi-dokumen',
    false,  -- Private: hanya bisa diakses via signed URL
    5242880, -- 5MB
    ARRAY['application/pdf','image/jpeg','image/jpg','image/png']
  ),
  (
    'regulasi-files',
    'regulasi-files',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf']
  ),
  (
    'sop-files',
    'sop-files',
    false,
    10485760,
    ARRAY['application/pdf']
  ),
  (
    'pengumuman-files',
    'pengumuman-files',
    true,   -- Public
    10485760,
    ARRAY['application/pdf','image/jpeg','image/png']
  )
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage Policies: seleksi-dokumen ─────────────────────

-- Peserta bisa upload ke folder mereka sendiri
CREATE POLICY "peserta_upload_own_docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'seleksi-dokumen'
  AND auth.role() = 'authenticated'
  AND (
    -- Path: {seleksi_id}/{peserta_id}/{filename}
    EXISTS (
      SELECT 1 FROM public.peserta_seleksi p
      WHERE p.auth_user_id = auth.uid()
      AND name LIKE '%' || p.id::text || '%'
    )
    OR
    -- Tim seleksi / admin bisa upload semua
    public.is_tim_seleksi()
  )
);

-- Peserta hanya bisa lihat dokumen mereka sendiri
CREATE POLICY "peserta_read_own_docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'seleksi-dokumen'
  AND (
    public.is_tim_seleksi()
    OR
    EXISTS (
      SELECT 1 FROM public.peserta_seleksi p
      WHERE p.auth_user_id = auth.uid()
      AND name LIKE '%' || p.id::text || '%'
    )
  )
);

-- Tim seleksi bisa update/delete dokumen
CREATE POLICY "tim_seleksi_manage_docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'seleksi-dokumen'
  AND public.is_tim_seleksi()
);

-- Peserta bisa hapus dokumen mereka sendiri (belum diverifikasi)
CREATE POLICY "peserta_delete_own_pending_docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'seleksi-dokumen'
  AND EXISTS (
    SELECT 1 FROM public.peserta_seleksi p
    WHERE p.auth_user_id = auth.uid()
    AND name LIKE '%' || p.id::text || '%'
  )
);

-- ── 3. Storage Policies: regulasi-files ──────────────────────
CREATE POLICY "regulasi_read_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'regulasi-files');

CREATE POLICY "regulasi_manage_admin"
ON storage.objects FOR ALL
USING (bucket_id = 'regulasi-files' AND public.is_super_admin());

-- ── 4. Storage Policies: sop-files ───────────────────────────
CREATE POLICY "sop_read_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'sop-files');

CREATE POLICY "sop_manage_admin"
ON storage.objects FOR ALL
USING (bucket_id = 'sop-files' AND public.is_super_admin());

-- ── 5. Storage Policies: pengumuman-files ────────────────────
CREATE POLICY "pengumuman_read_public"
ON storage.objects FOR SELECT
USING (bucket_id = 'pengumuman-files');

CREATE POLICY "pengumuman_manage_internal"
ON storage.objects FOR ALL
USING (bucket_id = 'pengumuman-files' AND public.is_internal_user());

-- ============================================================
-- CATATAN PENTING
-- ============================================================
-- Setelah menjalankan SQL ini:
-- 1. Pergi ke Supabase Dashboard → Storage
-- 2. Pastikan keempat bucket sudah terbuat
-- 3. Untuk bucket 'seleksi-dokumen' dan 'regulasi-files':
--    Gunakan Signed URLs untuk akses file (sudah private)
-- 4. Update lib/supabase.ts jika perlu Signed URL helper
-- ============================================================
