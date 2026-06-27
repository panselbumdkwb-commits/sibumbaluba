# SIBUMBALUMBA

**Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu**

Dikelola oleh Bagian Perekonomian dan Sumber Daya Alam, Sekretariat Daerah Kota Batu.

---

## 🗂️ Daftar Isi

- [Fitur Sistem](#fitur-sistem)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Setup Lokal](#setup-lokal)
- [Setup Supabase](#setup-supabase)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Role & Hak Akses](#role--hak-akses)

---

## ✨ Fitur Sistem

### Portal Publik
- **Beranda** — Hero banner, running text pengumuman, statistik, seleksi aktif
- **Profil BUMD** — Perumdam Among Tani, PT Batu Wisata Resources
- **Profil BLUD** — 5 Puskesmas (Batu, Beji, Bumiaji, Junrejo, Sisir)
- **Regulasi** — Database regulasi terfilter & dapat diunduh
- **SOP** — Standar Operasional Prosedur BUMD/BLUD
- **Pengumuman** — Informasi publik terkini
- **Seleksi** — Informasi dan pendaftaran seleksi
- **Kontak** — Informasi kontak dan form pesan

### Portal Peserta Seleksi
- Registrasi diri (2 langkah)
- Login dengan username + password
- Upload 8 jenis dokumen (PDF/JPG, maks 5MB)
- Tracking status verifikasi real-time
- Notifikasi setiap perubahan status
- Lihat hasil & nilai per tahapan

### Dashboard Internal
- **Dashboard** — Statistik dan ringkasan data
- **Monev BUMD** — Input data RKAP, rasio kinerja, GCG, SPI
- **Monev BLUD** — Input data RBA, SPM, akreditasi
- **Seleksi** — Kelola seleksi, verifikasi dokumen, input nilai UKK, generate Berita Acara
- **Regulasi** — CRUD regulasi dengan upload file
- **SOP** — CRUD SOP dengan upload file
- **Pengumuman** — CRUD pengumuman, toggle publik/internal
- **Laporan** — Rekap dan ekspor data
- **Manajemen User** — CRUD pengguna internal (Super Admin only)

---

## 🛠️ Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, ShadCN UI |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| State | React useState/useEffect |
| Forms | Native React forms + Zod validation |
| Notifikasi | Sonner (toast) |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## 📁 Struktur Proyek

```
SIBUMBALUMBA/
├── app/
│   ├── (public)/           # Halaman tanpa login
│   │   ├── page.tsx        # Beranda
│   │   ├── profil/bumd/    # Profil BUMD
│   │   ├── profil/blud/    # Profil BLUD
│   │   ├── regulasi/       # Regulasi publik
│   │   ├── sop/            # SOP publik
│   │   ├── pengumuman/     # Pengumuman publik
│   │   ├── seleksi/        # Info & daftar seleksi
│   │   └── kontak/         # Kontak
│   ├── (internal)/         # Halaman dengan auth guard
│   │   ├── dashboard/      # Dashboard utama
│   │   ├── monev/bumd/     # Monev BUMD
│   │   ├── monev/blud/     # Monev BLUD
│   │   ├── seleksi/        # Manajemen seleksi
│   │   ├── regulasi/kelola/# Kelola regulasi
│   │   ├── sop/kelola/     # Kelola SOP
│   │   ├── pengumuman/     # Kelola pengumuman
│   │   ├── laporan/        # Laporan
│   │   └── users/          # Manajemen user
│   ├── portal-peserta/     # Portal peserta seleksi
│   │   ├── login/          # Login peserta
│   │   ├── dokumen/        # Upload dokumen
│   │   └── hasil/          # Hasil seleksi
│   ├── api/                # API Routes
│   │   ├── auth/login/     # Login internal
│   │   ├── peserta/login/  # Login peserta
│   │   ├── seleksi/registrasi/ # Daftar seleksi
│   │   ├── seleksi/[id]/berita-acara/ # Generate BA
│   │   └── users/create/   # Buat user
│   └── login/              # Login internal
├── components/
│   ├── ui/                 # ShadCN components
│   ├── public/             # Komponen portal publik
│   └── internal/           # Komponen dashboard
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Helper auth
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   └── database.types.ts   # Supabase generated types
├── supabase/
│   ├── schema.sql          # Schema database lengkap
│   ├── storage.sql         # Setup storage buckets
│   └── seed-admin.sql      # Seed data admin
└── middleware.ts            # Route protection
```

---

## 🚀 Setup Lokal

### Prasyarat
- Node.js 20+
- npm / yarn
- Akun Supabase

### 1. Clone & Install

```bash
git clone https://github.com/pemkot-batu/SIBUMBALUMBA.git
cd SIBUMBALUMBA
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Setup Supabase

### Langkah 1 — Buat Project Supabase

1. Masuk ke [supabase.com](https://supabase.com)
2. Buat project baru
3. Pilih region **Southeast Asia (Singapore)**
4. Catat **Project URL** dan **API Keys**

### Langkah 2 — Jalankan Schema SQL

1. Buka **SQL Editor** di Supabase Dashboard
2. Paste & jalankan isi file `supabase/schema.sql`
3. Paste & jalankan isi file `supabase/storage.sql`

### Langkah 3 — Buat User Super Admin

1. Buka **Authentication → Users → Add User**
2. Email: `superadmin@SIBUMBALUMBA.internal`
3. Password: `Admin@SIMBU2025!` *(ganti setelah pertama login)*
4. Centang **"Auto Confirm User"**
5. Catat UUID user yang dibuat
6. Jalankan di SQL Editor:

```sql
INSERT INTO users (id, username, full_name, role_id, is_active)
VALUES (
  'UUID-DARI-LANGKAH-4',
  'superadmin',
  'Super Administrator',
  (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1),
  true
);
```

### Langkah 4 — Konfigurasi Storage

Storage bucket sudah dibuat via `storage.sql`. Pastikan:
- `seleksi-dokumen` → Private
- `regulasi-files` → Private
- `sop-files` → Private
- `pengumuman-files` → Public

### Langkah 5 — Verifikasi

```sql
SELECT * FROM v_statistik;
-- Harus menampilkan data statistik
```

---

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "initial commit: SIBUMBALUMBA v1.0"
git remote add origin https://github.com/org/SIBUMBALUMBA.git
git push -u origin main
```

### 2. Import di Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repository GitHub
3. Framework: **Next.js** (auto-detect)

### 3. Set Environment Variables di Vercel

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
```

### 4. Deploy

Klik **Deploy** — Vercel otomatis build dan deploy.

### 5. Custom Domain (Opsional)

Di **Project Settings → Domains**, tambahkan:
```
SIBUMBALUMBA.kotabatu.go.id
```

---

## 📖 Panduan Penggunaan

### Login Internal
- URL: `/login`
- Username + password (bukan email)
- Redirect ke `/dashboard` setelah berhasil

### Login Peserta
- URL: `/portal-peserta/login`
- Username + password yang dibuat saat registrasi
- Redirect ke `/portal-peserta/dokumen`

### Alur Seleksi (Tim Seleksi)
1. Buat seleksi baru di `/seleksi/baru`
2. Set status ke **"Buka"**
3. Peserta mendaftar via portal publik
4. Verifikasi dokumen peserta di `/seleksi/{id}`
5. Update status peserta (Lulus Admin / TMS)
6. Input nilai UKK per tahapan
7. Generate Berita Acara PDF

---

## 🔐 Role & Hak Akses

| Role | Dashboard | Monev BUMD | Monev BLUD | Seleksi | Regulasi/SOP | Users |
|------|-----------|------------|------------|---------|--------------|-------|
| `super_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin_bumd` | ✅ | ✅ | ❌ | ❌ | Baca | ❌ |
| `admin_blud` | ✅ | ❌ | ✅ | ❌ | Baca | ❌ |
| `tim_seleksi` | ✅ | ❌ | ❌ | ✅ | Baca | ❌ |
| `viewer` | ✅ | Baca | Baca | Baca | Baca | ❌ |

---

## 📞 Kontak & Dukungan

**Bagian Perekonomian dan SDA**
Sekretariat Daerah Kota Batu
Jl. Panglima Sudirman No. 507, Kota Batu 65311
Telp: (0341) 591024
Email: SIBUMBALUMBA@kotabatu.go.id

---

*SIBUMBALUMBA v1.0 — © 2025 Pemerintah Kota Batu*
