# PANDUAN DEPLOY SIBUMBALUMBA
## Step-by-Step: Supabase + GitHub + Vercel

---

## TAHAP 1 — SETUP SUPABASE

### 1.1 Buat Project
1. Buka https://supabase.com → Login → **New Project**
2. Isi nama project: `sibumbalumba`
3. Pilih region: **Southeast Asia (Singapore)**
4. Buat password database (simpan baik-baik!)
5. Klik **Create new project** → tunggu ~2 menit

### 1.2 Ambil API Keys
1. Buka **Project Settings** → **API**
2. Catat tiga nilai ini:
   ```
   Project URL  → NEXT_PUBLIC_SUPABASE_URL
   anon public  → NEXT_PUBLIC_SUPABASE_ANON_KEY
   service_role → SUPABASE_SERVICE_ROLE_KEY  (RAHASIA!)
   ```

### 1.3 Jalankan Schema Database
1. Buka **SQL Editor** di dashboard Supabase
2. Klik **New query**
3. Copy-paste seluruh isi file `supabase/schema.sql`
4. Klik **Run** (▶) → tunggu hingga selesai
5. Pastikan tidak ada error merah

### 1.4 Jalankan Seed Data
1. Buat query baru lagi di SQL Editor
2. Copy-paste seluruh isi file `supabase/seed-data.sql`
3. Klik **Run**
4. Hasil yang benar (baris terakhir):
   ```
   roles=5, bumd=2, blud=5, regulasi=11, sop=11, pengumuman=3
   ```

### 1.5 Setup Storage Buckets
1. Buat query baru
2. Copy-paste isi file `supabase/storage.sql`
3. Klik **Run**
4. Cek di **Storage** → harus ada 4 bucket:
   - `seleksi-dokumen` (private)
   - `regulasi-files` (private)
   - `sop-files` (private)
   - `pengumuman-files` (public)

### 1.6 Buat User Super Admin
1. Buka **Authentication** → **Users** → **Add user** → **Create new user**
2. Isi:
   - Email: `superadmin@sibumbalumba.internal`
   - Password: `Admin@SIMBU2025!`
   - ☑ Auto Confirm User
3. Klik **Create user**
4. Setelah terbuat, klik user tersebut → **copy UUID**-nya

5. Buka SQL Editor → jalankan (ganti UUID):
   ```sql
   INSERT INTO users (id, username, full_name, role_id, is_active)
   VALUES (
     'PASTE-UUID-DISINI',
     'superadmin',
     'Super Administrator SIBUMBALUMBA',
     '00000000-0000-0000-0000-000000000001',
     true
   );
   ```

6. Verifikasi:
   ```sql
   SELECT u.username, r.name AS role
   FROM users u JOIN roles r ON u.role_id = r.id;
   ```

---

## TAHAP 2 — SETUP GITHUB

### 2.1 Buat Repository
1. Buka https://github.com → **New repository**
2. Nama: `sibumbalumba`
3. Visibility: **Private** (disarankan)
4. Klik **Create repository**

### 2.2 Upload Kode
```bash
# Extract ZIP yang didownload
unzip sibumbalumba-v1.0.zip
cd sibumbalumba

# Buat file .env.local dari template
cp .env.example .env.local
# Edit .env.local dengan nilai dari Supabase

# Init git dan push
git init
git add .
git commit -m "feat: SIBUMBALUMBA v1.0 initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/sibumbalumba.git
git push -u origin main
```

---

## TAHAP 3 — DEPLOY KE VERCEL

### 3.1 Import Project
1. Buka https://vercel.com → Login
2. Klik **Add New** → **Project**
3. Pilih repository `sibumbalumba` dari GitHub
4. Framework: **Next.js** (otomatis terdeteksi)

### 3.2 Set Environment Variables
Di halaman **Configure Project** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) |

> ⚠️ Pastikan ketiga variabel ini diisi sebelum deploy!

### 3.3 Deploy
1. Klik **Deploy**
2. Tunggu proses build (~3-5 menit)
3. Jika sukses → URL Vercel akan muncul (misal: `sibumbalumba.vercel.app`)

### 3.4 Verifikasi Deploy
Buka URL Vercel dan cek:
- [ ] Halaman beranda muncul dengan benar
- [ ] Menu navigasi berfungsi
- [ ] Login di `/login` dengan `superadmin` / `Admin@SIMBU2025!`
- [ ] Dashboard muncul setelah login
- [ ] Data BUMD dan BLUD tampil di profil publik

---

## TAHAP 4 — KONFIGURASI PASCA DEPLOY

### 4.1 Update Supabase Auth Settings
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Isi **Site URL**: `https://sibumbalumba.vercel.app`
3. Tambah **Redirect URLs**:
   ```
   https://sibumbalumba.vercel.app/**
   ```

### 4.2 Ganti Password Default
1. Login dengan superadmin
2. Buat user baru dengan password kuat via `/users`
3. Atau reset via Supabase Auth dashboard

### 4.3 Tambah User Internal
Login sebagai superadmin → `/users` → Tambah Pengguna:

| Username | Role | Untuk |
|----------|------|-------|
| `admin_bumd` | admin_bumd | Staff pembina BUMD |
| `admin_blud` | admin_blud | Staff pembina BLUD |
| `tim_seleksi` | tim_seleksi | Panitia seleksi |
| `viewer1` | viewer | Pimpinan (read-only) |

### 4.4 Custom Domain (Opsional)
Vercel Dashboard → Project → **Settings** → **Domains**:
```
sibumbalumba.kotabatu.go.id
```
Tambah DNS CNAME record di pengelola domain:
```
CNAME sibumbalumba → cname.vercel-dns.com
```

---

## TROUBLESHOOTING

### ❌ Build error: "Cannot find module bcryptjs"
Pastikan `serverExternalPackages: ['bcryptjs']` ada di `next.config.ts`

### ❌ Error: "Invalid API key"
Cek environment variables di Vercel → **Settings** → **Environment Variables**
Pastikan tidak ada spasi di awal/akhir nilai key

### ❌ Login gagal: "Akun tidak ditemukan"
Pastikan INSERT users sudah dijalankan dengan UUID yang benar dari auth.users

### ❌ Upload dokumen gagal
Cek bucket `seleksi-dokumen` sudah ada di Supabase Storage
Pastikan storage.sql sudah dijalankan

### ❌ Data profil kosong
Jalankan ulang `seed-data.sql` di Supabase SQL Editor

### ❌ Views error (security_definer)
Jalankan `fix-security-definer-view.sql` di SQL Editor

---

## STRUKTUR LOGIN

| User | URL Login | Credential Default |
|------|-----------|--------------------|
| Internal (Admin, Tim Seleksi) | `/login` | username + password |
| Peserta Seleksi | `/portal-peserta/login` | username + password saat daftar |

---

## URUTAN FILE SQL (WAJIB DIJALANKAN BERURUTAN)

```
1. supabase/schema.sql          ← Schema + RLS + Views
2. supabase/storage.sql         ← Bucket storage
3. supabase/seed-data.sql       ← Data awal BUMD, BLUD, dll
4. supabase/seed-admin.sql      ← Panduan buat user admin
```

---

*SIBUMBALUMBA v1.0 — Pemerintah Kota Batu © 2025*
