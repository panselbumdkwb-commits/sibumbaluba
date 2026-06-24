import { createServerComponentClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Plus, Shield, UserCheck, UserX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import UsersClient from '@/components/internal/UsersClient'

async function getData() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('users').select('role:roles(name)').eq('id', user.id).single()

  if ((me?.role as { name?: string } | null)?.name !== 'super_admin') redirect('/dashboard')

  const [usersRes, rolesRes] = await Promise.all([
    supabase.from('users').select('*, role:roles(name)').order('created_at', { ascending: false }),
    supabase.from('roles').select('*').order('name'),
  ])

  return { users: usersRes.data ?? [], roles: rolesRes.data ?? [] }
}

export default async function UsersPage() {
  const { users, roles } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Super Admin', val: users.filter(u => (u.role as { name?: string } | null)?.name === 'super_admin').length, color: 'text-red-600 bg-red-50' },
          { label: 'Admin BUMD', val: users.filter(u => (u.role as { name?: string } | null)?.name === 'admin_bumd').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Admin BLUD', val: users.filter(u => (u.role as { name?: string } | null)?.name === 'admin_blud').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Tim Seleksi', val: users.filter(u => (u.role as { name?: string } | null)?.name === 'tim_seleksi').length, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold">{val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <UsersClient users={users} roles={roles} />
    </div>
  )
}
