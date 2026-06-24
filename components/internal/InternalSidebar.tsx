'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BarChart3, FileText, BookOpen, Bell,
  Users, UserCheck, FileBarChart, Shield, Building2, Hospital,
  ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User, RoleName } from '@/lib/types'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: RoleName[]
  children?: NavItem[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Monitoring BUMD', href: '/monev/bumd', icon: Building2,
    roles: ['super_admin', 'admin_bumd'],
  },
  {
    label: 'Monitoring BLUD', href: '/monev/blud', icon: Hospital,
    roles: ['super_admin', 'admin_blud'],
  },
  {
    label: 'Seleksi', href: '/seleksi', icon: UserCheck,
    roles: ['super_admin', 'tim_seleksi'],
  },
  { label: 'Regulasi', href: '/regulasi/kelola', icon: FileText },
  { label: 'SOP', href: '/sop/kelola', icon: BookOpen },
  { label: 'Pengumuman', href: '/pengumuman/kelola', icon: Bell },
  { label: 'Laporan', href: '/laporan', icon: FileBarChart },
  {
    label: 'Manajemen User', href: '/users', icon: Users,
    roles: ['super_admin'],
  },
]

function NavLink({ item, role }: { item: NavItem; role: RoleName }) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  if (item.roles && !item.roles.includes(role)) return null

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
      <span className="truncate">{item.label}</span>
      {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
    </Link>
  )
}

interface Props { user: User }

export default function InternalSidebar({ user }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const role = (user.role?.name ?? 'viewer') as RoleName

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">SIMBUBALADA</div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {role.replace('_', ' ')}
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-accent text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(item => (
            <NavLink key={item.href} item={item} role={role} />
          ))}
        </nav>

        {/* User info */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {user.full_name?.charAt(0) ?? user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{user.full_name ?? user.username}</div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
