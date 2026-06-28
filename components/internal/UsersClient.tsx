'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck, UserX, Loader2, Eye, EyeOff, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase-client'

interface RoleRef { name: string }
interface UserRow { id: string; username: string; full_name: string | null; is_active: boolean; created_at: string; role: RoleRef | null }
interface RoleRow { id: string; name: string }
interface Props { users: UserRow[]; roles: RoleRow[] }

const ROLE_BADGE: Record<string, string> = {
  super_admin:     'bg-red-100 text-red-700',
  admin_bumd:      'bg-blue-100 text-blue-700',
  admin_blud:      'bg-emerald-100 text-emerald-700',
  admin_bpsda:     'bg-cyan-100 text-cyan-700',
  panitia_seleksi: 'bg-purple-100 text-purple-700',
  tim_ukk:         'bg-orange-100 text-orange-700',
  tim_seleksi:     'bg-violet-100 text-violet-700',
  peserta:         'bg-yellow-100 text-yellow-700',
  viewer:          'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = { username: '', full_name: '', password: '', role_id: '' }

export default function UsersClient({ users: initial, roles }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editForm, setEditForm] = useState({ full_name: '', role_id: '', password: '' })
  const [showEditPw, setShowEditPw] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // ── Buat user baru ─────────────────────────────────────────
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
      setForm(EMPTY_FORM)
      router.refresh()
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  // ── Edit user ──────────────────────────────────────────────
  function openEdit(u: UserRow) {
    setEditUser(u)
    const roleObj = roles.find(r => r.name === u.role?.name)
    setEditForm({ full_name: u.full_name ?? '', role_id: roleObj?.id ?? '', password: '' })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    if (editForm.password && editForm.password.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editUser.id, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal mengupdate user'); return }
      toast.success('User berhasil diupdate')
      setEditUser(null)
      router.refresh()
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  // ── Hapus user ─────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteUser) return
    setLoading(true)
    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteUser.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gagal menghapus user'); return }
      toast.success('User berhasil dihapus')
      setDeleteUser(null)
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id))
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  // ── Toggle aktif ───────────────────────────────────────────
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

      {/* Form Tambah */}
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
                {roles.filter(r => r.name !== 'viewer' && r.name !== 'tim_seleksi').map(r =>
                  <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>
                )}
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

      {/* Tabel User */}
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
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)}
                        className="h-7 px-2 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => toggleActive(u.id, u.is_active)}
                        className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${u.is_active ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                        {u.is_active ? <><UserX className="h-3 w-3" /> Nonaktif</> : <><UserCheck className="h-3 w-3" /> Aktifkan</>}
                      </button>
                      <button onClick={() => setDeleteUser(u)}
                        className="h-7 px-2 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold flex items-center gap-2"><Pencil className="h-4 w-4 text-primary" /> Edit Pengguna</h3>
              <button onClick={() => setEditUser(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Username</label>
                <input value={editUser.username} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
                <p className="text-xs text-muted-foreground mt-1">Username tidak dapat diubah</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
                <input value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nama Lengkap" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select value={editForm.role_id}
                  onChange={e => setEditForm(f => ({ ...f, role_id: e.target.value }))}
                  className={inputCls}>
                  <option value="">Pilih Role...</option>
                  {roles.filter(r => r.name !== 'viewer' && r.name !== 'tim_seleksi').map(r =>
                    <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Reset Password <span className="text-xs text-muted-foreground font-normal">(kosongkan jika tidak ingin mengubah)</span>
                </label>
                <div className="relative">
                  <input type={showEditPw ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Password baru (opsional)"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={() => setShowEditPw(!showEditPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showEditPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">Batal</button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-xl p-6">
            <h3 className="font-bold text-base mb-2">Hapus Pengguna?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Akun <span className="font-semibold text-foreground">{deleteUser.username}</span> akan dihapus permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
