import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', opts ?? {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    buka: 'bg-green-100 text-green-700',
    tutup: 'bg-yellow-100 text-yellow-700',
    selesai: 'bg-blue-100 text-blue-700',
    terdaftar: 'bg-slate-100 text-slate-700',
    verifikasi_dokumen: 'bg-orange-100 text-orange-700',
    lulus_admin: 'bg-green-100 text-green-700',
    tms_admin: 'bg-red-100 text-red-700',
    undangan_ukk: 'bg-purple-100 text-purple-700',
    lulus_ukk: 'bg-emerald-100 text-emerald-700',
    tms_ukk: 'bg-red-100 text-red-700',
    lulus_akhir: 'bg-blue-100 text-blue-700',
    tidak_lulus: 'bg-red-100 text-red-700',
    pending: 'bg-orange-100 text-orange-700',
    diverifikasi: 'bg-green-100 text-green-700',
    ditolak: 'bg-red-100 text-red-700',
    submitted: 'bg-blue-100 text-blue-700',
    verified: 'bg-green-100 text-green-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}
