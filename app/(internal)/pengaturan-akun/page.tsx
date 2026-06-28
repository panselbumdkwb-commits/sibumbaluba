import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import GantiPasswordClient from './GantiPasswordClient'

export default async function PengaturanAkunPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('username, full_name, role:roles(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi dan keamanan akun Anda</p>
      </div>

      {/* Info Akun */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base">Informasi Akun</h2>
        <div className="grid gap-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="text-sm font-medium">{profile?.username ?? '-'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Nama Lengkap</span>
            <span className="text-sm font-medium">{profile?.full_name ?? '-'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium capitalize">
              {((profile?.role as { name?: string } | null)?.name ?? 'viewer').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Ganti Password */}
      <GantiPasswordClient />
    </div>
  )
}
