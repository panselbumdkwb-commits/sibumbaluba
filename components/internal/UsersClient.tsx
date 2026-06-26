'use client'

import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck, UserX, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

interface RoleRef { name: string }
interface UserRow { id: string; username: string; full_name: string | null; is_active: boolean; created_at: string; role: RoleRef | null }
interface RoleRow { id: string; name: string }
interface Props { users: UserRow[]; roles: RoleRow[] }

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',   admin_bumd: 'bg-blue-100 text-blue-700',
  admin_blud:  'bg-emerald-100 text-emerald-700', tim_seleksi: 'bg-purple-100 text-purple-700',
  viewer:      'bg-gray-100 text-gray-600',
}

export default function UsersClient({ users: initial, roles }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ username: '', full_name: '', password: '', role_id: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username || !form.password || !form.role_id) { toast.error('Lengkapi semua field'); return }
    if (form.password.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal membuat user'); return }
      toast.success('User berhasil dibuat')
      setShowForm(false)
      setForm({ username: '', full_name: '', password: '', role_id: '' })
      router.refresh()
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ is_active: !isActive }).eq('id', userId)
    if (error) { toast.error('Gagal update'); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
    toast.success(isActive ? 'User dinonaktifkan' : 'User diaktifkan')
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" />
          {showForm ? 'Tutup Form' : 'Tambah Pengguna'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Form Tambah Pengguna
          </h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Username <span className="text-red-500">*</span></label>
              <input value={form.username} onChange={set('username')} placeholder="username_unik" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
              <input value={form.full_name} onChange={set('full_name')} placeholder="Nama Lengkap" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 8 karakter"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role <span className="text-red-500">*</span></label>
              <select value={form.role_id} onChange={set('role_id')} className={inputCls}>
                <option value="">Pilih Role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">Batal</button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Buat Pengguna
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Username','Nama Lengkap','Role','Status','Bergabung','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(u.full_name ?? u.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.full_name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs capitalize ${ROLE_BADGE[u.role?.name ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                      {(u.role?.name ?? 'viewer').replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u.id, u.is_active)}
                      className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                      {u.is_active ? <><UserX className="h-3 w-3" /> Nonaktif</> : <><UserCheck className="h-3 w-3" /> Aktifkan</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
