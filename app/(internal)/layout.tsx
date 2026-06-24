import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase'
import InternalSidebar from '@/components/internal/InternalSidebar'
import InternalHeader from '@/components/internal/InternalHeader'
import type { User } from '@/lib/types'

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerComponentClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!user || !user.is_active) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <InternalSidebar user={user as User} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <InternalHeader user={user as User} />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}
