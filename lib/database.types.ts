// lib/database.types.ts
// Simplified Supabase database types for SIBUMBALUMBA
// Run `npx supabase gen types typescript` for full auto-generated types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: string; name: string; permissions: Json; created_at: string }
        Insert: { id?: string; name: string; permissions?: Json; created_at?: string }
        Update: { id?: string; name?: string; permissions?: Json }
      }
      users: {
        Row: { id: string; username: string; full_name: string | null; role_id: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id: string; username: string; full_name?: string | null; role_id?: string | null; is_active?: boolean }
        Update: { username?: string; full_name?: string | null; role_id?: string | null; is_active?: boolean }
      }
      bumd: {
        Row: { id: string; nama: string; singkatan: string | null; jenis: string; slug: string; profil: Json; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; nama: string; singkatan?: string | null; jenis: string; slug: string; profil?: Json; is_active?: boolean }
        Update: { nama?: string; singkatan?: string | null; jenis?: string; slug?: string; profil?: Json; is_active?: boolean }
      }
      blud: {
        Row: { id: string; nama: string; jenis: string; slug: string; profil: Json; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; nama: string; jenis: string; slug: string; profil?: Json; is_active?: boolean }
        Update: { nama?: string; jenis?: string; slug?: string; profil?: Json; is_active?: boolean }
      }
      kategori_regulasi: {
        Row: { id: string; nama: string; urutan: number; created_at: string }
        Insert: { id?: string; nama: string; urutan?: number }
        Update: { nama?: string; urutan?: number }
      }
      regulasi: {
        Row: { id: string; judul: string; nomor: string | null; tahun: number | null; kategori_id: string | null; deskripsi: string | null; file_url: string | null; is_active: boolean; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; judul: string; nomor?: string | null; tahun?: number | null; kategori_id?: string | null; file_url?: string | null; is_active?: boolean }
        Update: { judul?: string; nomor?: string | null; tahun?: number | null; file_url?: string | null; is_active?: boolean }
      }
      kategori_sop: {
        Row: { id: string; nama: string; entitas: string; urutan: number; created_at: string }
        Insert: { id?: string; nama: string; entitas: string; urutan?: number }
        Update: { nama?: string; entitas?: string; urutan?: number }
      }
      sop: {
        Row: { id: string; judul: string; kode: string | null; kategori_id: string | null; deskripsi: string | null; file_url: string | null; versi: string; is_active: boolean; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; judul: string; kode?: string | null; kategori_id?: string | null; file_url?: string | null; versi?: string; is_active?: boolean }
        Update: { judul?: string; kode?: string | null; file_url?: string | null; versi?: string; is_active?: boolean }
      }
      monev_bumd: {
        Row: { id: string; bumd_id: string; periode: string; rkap: Json; laporan_keuangan: Json; rasio_kinerja: Json; gcg: Json; spi: Json; status: string; catatan: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; bumd_id: string; periode: string; rkap?: Json; laporan_keuangan?: Json; rasio_kinerja?: Json; gcg?: Json; spi?: Json; status?: string; catatan?: string | null }
        Update: { periode?: string; rkap?: Json; status?: string; catatan?: string | null }
      }
      monev_blud: {
        Row: { id: string; blud_id: string; periode: string; rba: Json; laporan_kinerja: Json; laporan_keuangan: Json; spm: Json; akreditasi: Json; status: string; catatan: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; blud_id: string; periode: string; rba?: Json; laporan_kinerja?: Json; laporan_keuangan?: Json; spm?: Json; akreditasi?: Json; status?: string }
        Update: { periode?: string; rba?: Json; status?: string }
      }
      seleksi: {
        Row: { id: string; judul: string; jenis: string; entitas: string; entitas_id: string | null; status: string; pengumuman_url: string | null; jadwal: Json; persyaratan: string | null; kuota: number; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; judul: string; jenis: string; entitas: string; status?: string; jadwal?: Json; persyaratan?: string | null; kuota?: number }
        Update: { judul?: string; jenis?: string; entitas?: string; status?: string; jadwal?: Json; persyaratan?: string | null; kuota?: number }
      }
      peserta_seleksi: {
        Row: { id: string; seleksi_id: string; auth_user_id: string | null; nik: string; nama: string; ttl: string | null; alamat: string | null; pendidikan: string | null; whatsapp: string | null; username: string; password_hash: string; status: string; nomor_peserta: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; seleksi_id: string; auth_user_id?: string | null; nik: string; nama: string; ttl?: string | null; alamat?: string | null; pendidikan?: string | null; whatsapp?: string | null; username: string; password_hash: string; status?: string }
        Update: { status?: string; auth_user_id?: string | null }
      }
      dokumen_peserta: {
        Row: { id: string; peserta_id: string; jenis_dokumen: string; file_url: string | null; file_name: string | null; file_size: number | null; status_verifikasi: string; catatan: string | null; verified_by: string | null; verified_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; peserta_id: string; jenis_dokumen: string; file_url?: string | null; file_name?: string | null; file_size?: number | null; status_verifikasi?: string; catatan?: string | null }
        Update: { file_url?: string | null; file_name?: string | null; file_size?: number | null; status_verifikasi?: string; catatan?: string | null; verified_by?: string | null; verified_at?: string | null }
      }
      tahapan_seleksi: {
        Row: { id: string; seleksi_id: string; nama_tahap: string; urutan: number; tanggal_mulai: string | null; tanggal_selesai: string | null; lokasi: string | null; keterangan: string | null; status: string }
        Insert: { id?: string; seleksi_id: string; nama_tahap: string; urutan: number; tanggal_mulai?: string | null; tanggal_selesai?: string | null; status?: string }
        Update: { nama_tahap?: string; urutan?: number; tanggal_mulai?: string | null; tanggal_selesai?: string | null; status?: string }
      }
      hasil_seleksi: {
        Row: { id: string; peserta_id: string; tahapan_id: string; nilai: number | null; status: string; catatan: string | null; penilai: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; peserta_id: string; tahapan_id: string; nilai?: number | null; status: string; catatan?: string | null }
        Update: { nilai?: number | null; status?: string; catatan?: string | null }
      }
      pengumuman: {
        Row: { id: string; judul: string; isi: string | null; kategori: string; is_publik: boolean; file_url: string | null; seleksi_id: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; judul: string; isi?: string | null; kategori: string; is_publik?: boolean; file_url?: string | null }
        Update: { judul?: string; isi?: string | null; kategori?: string; is_publik?: boolean; file_url?: string | null }
      }
      audit_logs: {
        Row: { id: string; user_id: string | null; aksi: string; tabel: string | null; record_id: string | null; detail: Json; ip_address: string | null; created_at: string }
        Insert: { id?: string; user_id?: string | null; aksi: string; tabel?: string | null; record_id?: string | null; detail?: Json }
        Update: never
      }
      notifikasi: {
        Row: { id: string; user_id: string | null; peserta_id: string | null; judul: string; isi: string | null; kategori: string; is_read: boolean; action_url: string | null; created_at: string }
        Insert: { id?: string; user_id?: string | null; peserta_id?: string | null; judul: string; isi?: string | null; kategori?: string; is_read?: boolean; action_url?: string | null }
        Update: { is_read?: boolean }
      }
    }
    Views: {
      v_statistik: {
        Row: { total_bumd: number; total_blud: number; total_seleksi: number; total_peserta: number; total_regulasi: number; total_sop: number }
      }
      v_peserta_lengkap: {
        Row: { id: string; seleksi_id: string; nama: string; nik: string; nomor_peserta: string | null; status: string; seleksi_judul: string; seleksi_jenis: string; seleksi_entitas: string; total_dokumen: number; dokumen_verified: number; dokumen_ditolak: number; dokumen_pending: number; whatsapp: string | null; pendidikan: string | null; created_at: string; username: string; ttl: string | null; alamat: string | null; password_hash: string; auth_user_id: string | null; updated_at: string }
      }
    }
    Functions: {
      get_user_role: { Args: Record<never, never>; Returns: string }
      is_super_admin: { Args: Record<never, never>; Returns: boolean }
    }
  }
}
