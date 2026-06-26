'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'
import type { User } from '@/lib/types'

interface Props { user: User }

export default function InternalHeader({ user }: Props) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Berhasil logout')
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 rounded-md hover:bg-accent">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-foreground">
          Selamat Datang, {user.full_name ?? user.username}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {user.role?.name?.replace('_', ' ') ?? 'User'}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifikasi */}
        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
