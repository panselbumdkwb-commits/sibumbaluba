import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UsersClient from '@/components/internal/UsersClient'

interface RoleRef { name: string }
interface UserRow {
  id: string; username: string; full_name: string | null
  is_active: boolean; created_at: string; role: RoleRef | null
}
interface RoleRow { id: string; name: string }

async function getData() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role:roles(name)').eq('id', user.id).single()
  const roleName = (me?.role as RoleRef | null)?.name
  if (roleName !== 'super_admin') redirect('/dashboard')

  const [usersRes, rolesRes] = await Promise.all([
    supabase.from('users').select('id,username,full_name,is_active,created_at,role:roles(name)').order('created_at', { ascending: false }),
    supabase.from('roles').select('id,name').order('name'),
  ])

  return { users: (usersRes.data ?? []) as UserRow[], roles: (rolesRes.data ?? []) as RoleRow[] }
}

export default async function UsersPage() {
  const { users, roles } = await getData()
  const count = (roleName: string) => users.filter(u => u.role?.name === roleName).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} pengguna terdaftar</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Super Admin', role: 'super_admin', color: 'text-red-600' },
          { label: 'Admin BUMD',  role: 'admin_bumd',  color: 'text-blue-600' },
          { label: 'Admin BLUD',  role: 'admin_blud',  color: 'text-emerald-600' },
          { label: 'Tim Seleksi', role: 'tim_seleksi', color: 'text-purple-600' },
        ].map(({ label, role, color }) => (
          <div key={role} className="bg-card border border-border rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{count(role)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <UsersClient users={users} roles={roles} />
    </div>
  )
}
