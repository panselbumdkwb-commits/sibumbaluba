// lib/types.ts
// SIBUMBALUBA - TypeScript Type Definitions

export type RoleName = 'super_admin' | 'admin_bumd' | 'admin_blud' | 'tim_seleksi' | 'viewer'

export interface Role {
  id: string
  name: RoleName
  permissions: Record<string, boolean>
  created_at: string
}

export interface User {
  id: string
  username: string
  full_name: string | null
  role_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  role?: Role
}

// ── BUMD ──────────────────────────────────────────────────────
export interface BumdProfil {
  alamat?: string
  telepon?: string
  email?: string
  website?: string
  tahun_berdiri?: string
  modal_dasar?: string
  direktur?: string
  layanan?: string | string[]
  visi?: string
  misi?: string[]
  coverage?: string
  pelanggan?: string
  bidang?: string[]
}

export interface Bumd {
  id: string
  nama: string
  singkatan: string | null
  jenis: 'Perumdam' | 'Perseroda' | 'PD' | 'lainnya'
  slug: string
  profil: BumdProfil
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── BLUD ──────────────────────────────────────────────────────
export interface BludProfil {
  alamat?: string
  telepon?: string
  email?: string
  wilayah?: string
  kepala?: string
  tahun_berdiri?: string
  layanan?: string[]
  akreditasi?: string
  jml_penduduk_wilayah?: string
}

export interface Blud {
  id: string
  nama: string
  jenis: 'PKM' | 'RSUD' | 'lainnya'
  slug: string
  profil: BludProfil
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── REGULASI ──────────────────────────────────────────────────
export interface KategoriRegulasi {
  id: string
  nama: string
  urutan: number
}

export interface Regulasi {
  id: string
  judul: string
  nomor: string | null
  tahun: number | null
  kategori_id: string | null
  deskripsi: string | null
  file_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  kategori?: KategoriRegulasi
}

// ── SOP ───────────────────────────────────────────────────────
export interface KategoriSop {
  id: string
  nama: string
  entitas: 'BUMD' | 'BLUD' | 'Umum'
  urutan: number
}

export interface Sop {
  id: string
  judul: string
  kode: string | null
  kategori_id: string | null
  deskripsi: string | null
  file_url: string | null
  versi: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  kategori?: KategoriSop
}

// ── MONEV ─────────────────────────────────────────────────────
export interface RkapData {
  pendapatan_target?: number
  pendapatan_realisasi?: number
  laba_target?: number
  laba_realisasi?: number
  capex_target?: number
  capex_realisasi?: number
  catatan?: string
}

export interface RasioKinerja {
  roi?: number
  roe?: number
  npm?: number
  current_ratio?: number
  debt_ratio?: number
  catatan?: string
}

export interface GcgData {
  nilai?: number
  kategori?: string
  catatan?: string
}

export interface SpiData {
  nilai?: number
  temuan?: number
  rekomendasi?: number
  catatan?: string
}

export interface MonevBumd {
  id: string
  bumd_id: string
  periode: string
  rkap: RkapData
  laporan_keuangan: Record<string, unknown>
  rasio_kinerja: RasioKinerja
  gcg: GcgData
  spi: SpiData
  status: 'draft' | 'submitted' | 'verified'
  catatan: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  bumd?: Bumd
}

export interface RbaData {
  pagu?: number
  realisasi?: number
  persentase?: number
}

export interface SpmData {
  indikator?: string
  target?: number
  capaian?: number
  keterangan?: string
}

export interface MonevBlud {
  id: string
  blud_id: string
  periode: string
  rba: RbaData
  laporan_kinerja: Record<string, unknown>
  laporan_keuangan: Record<string, unknown>
  spm: SpmData
  akreditasi: Record<string, unknown>
  status: 'draft' | 'submitted' | 'verified'
  catatan: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  blud?: Blud
}

// ── SELEKSI ───────────────────────────────────────────────────
export type StatusSeleksi = 'draft' | 'buka' | 'tutup' | 'selesai'
export type JenisSeleksi = 'Direksi' | 'Dewan Pengawas' | 'Dewas' | 'Direktur' | 'Komisaris' | 'lainnya'

export interface JadwalSeleksi {
  pendaftaran_mulai?: string
  pendaftaran_selesai?: string
  verifikasi_mulai?: string
  verifikasi_selesai?: string
  pengumuman_admin?: string
  ukk?: string
  pengumuman_akhir?: string
}

export interface Seleksi {
  id: string
  judul: string
  jenis: JenisSeleksi
  entitas: 'BUMD' | 'BLUD'
  entitas_id: string | null
  status: StatusSeleksi
  pengumuman_url: string | null
  jadwal: JadwalSeleksi
  persyaratan: string | null
  kuota: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type StatusPeserta =
  | 'terdaftar'
  | 'verifikasi_dokumen'
  | 'lulus_admin'
  | 'tms_admin'
  | 'undangan_ukk'
  | 'lulus_ukk'
  | 'tms_ukk'
  | 'lulus_akhir'
  | 'tidak_lulus'

export interface PesertaSeleksi {
  id: string
  seleksi_id: string
  auth_user_id: string | null
  nik: string
  nama: string
  ttl: string | null
  alamat: string | null
  pendidikan: string | null
  whatsapp: string | null
  username: string
  password_hash: string
  status: StatusPeserta
  nomor_peserta: string | null
  created_at: string
  updated_at: string
  seleksi?: Seleksi
}

export type JenisDokumen =
  | 'ktp'
  | 'ijazah'
  | 'cv'
  | 'skck'
  | 'surat_kesehatan'
  | 'pakta_integritas'
  | 'foto'
  | 'dokumen_pendukung'

export type StatusVerifikasi = 'pending' | 'diverifikasi' | 'ditolak'

export interface DokumenPeserta {
  id: string
  peserta_id: string
  jenis_dokumen: JenisDokumen
  file_url: string | null
  file_name: string | null
  file_size: number | null
  status_verifikasi: StatusVerifikasi
  catatan: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface TahapanSeleksi {
  id: string
  seleksi_id: string
  nama_tahap: string
  urutan: number
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  lokasi: string | null
  keterangan: string | null
  status: 'belum' | 'berjalan' | 'selesai'
}

export interface HasilSeleksi {
  id: string
  peserta_id: string
  tahapan_id: string
  nilai: number | null
  status: 'lulus' | 'tidak_lulus' | 'absen'
  catatan: string | null
  penilai: string | null
  created_at: string
  updated_at: string
  peserta?: PesertaSeleksi
  tahapan?: TahapanSeleksi
}

// ── PENGUMUMAN ────────────────────────────────────────────────
export interface Pengumuman {
  id: string
  judul: string
  isi: string | null
  kategori: 'umum' | 'seleksi' | 'monev' | 'regulasi' | 'sop'
  is_publik: boolean
  file_url: string | null
  seleksi_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── NOTIFIKASI ────────────────────────────────────────────────
export interface Notifikasi {
  id: string
  user_id: string | null
  peserta_id: string | null
  judul: string
  isi: string | null
  kategori: 'info' | 'sukses' | 'peringatan' | 'error'
  is_read: boolean
  action_url: string | null
  created_at: string
}

// ── VIEWS ─────────────────────────────────────────────────────
export interface PesertaLengkap extends PesertaSeleksi {
  seleksi_judul: string
  seleksi_jenis: JenisSeleksi
  seleksi_entitas: 'BUMD' | 'BLUD'
  total_dokumen: number
  dokumen_verified: number
  dokumen_ditolak: number
  dokumen_pending: number
}

export interface Statistik {
  total_bumd: number
  total_blud: number
  total_seleksi: number
  total_peserta: number
  total_regulasi: number
  total_sop: number
}

// ── FORM TYPES ────────────────────────────────────────────────
export interface RegisterPesertaForm {
  seleksi_id: string
  nik: string
  nama: string
  ttl: string
  alamat: string
  pendidikan: string
  whatsapp: string
  username: string
  password: string
  confirmPassword: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface VerifikasiDokumenForm {
  status_verifikasi: StatusVerifikasi
  catatan: string
}

export interface InputNilaiForm {
  peserta_id: string
  tahapan_id: string
  nilai: number
  status: 'lulus' | 'tidak_lulus' | 'absen'
  catatan: string
}

// ── API RESPONSES ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ── DOKUMEN LABELS ────────────────────────────────────────────
export const DOKUMEN_LABELS: Record<JenisDokumen, string> = {
  ktp: 'Kartu Tanda Penduduk (KTP)',
  ijazah: 'Ijazah Terakhir',
  cv: 'Curriculum Vitae (CV)',
  skck: 'SKCK',
  surat_kesehatan: 'Surat Keterangan Sehat',
  pakta_integritas: 'Pakta Integritas',
  foto: 'Pas Foto',
  dokumen_pendukung: 'Dokumen Pendukung',
}

export const STATUS_PESERTA_LABELS: Record<StatusPeserta, string> = {
  terdaftar: 'Terdaftar',
  verifikasi_dokumen: 'Verifikasi Dokumen',
  lulus_admin: 'Lulus Administrasi',
  tms_admin: 'TMS Administrasi',
  undangan_ukk: 'Undangan UKK',
  lulus_ukk: 'Lulus UKK',
  tms_ukk: 'TMS UKK',
  lulus_akhir: 'Lulus Akhir',
  tidak_lulus: 'Tidak Lulus',
}

export const STATUS_VERIFIKASI_LABELS: Record<StatusVerifikasi, string> = {
  pending: 'Menunggu Verifikasi',
  diverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
}
