'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BarChart3, FileText, BookOpen, Bell,
  Users, UserCheck, FileBarChart, Shield, Building2, Hospital,
  ChevronRight, X, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User, RoleName } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: RoleName[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',        href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Monitoring BUMD',  href: '/monev/bumd',         icon: Building2,   roles: ['super_admin','admin_bumd','admin_bpsda'] },
  { label: 'Monitoring BLUD',  href: '/monev/blud',         icon: Hospital,    roles: ['super_admin','admin_blud','admin_bpsda'] },
  { label: 'Seleksi',          href: '/kelola/seleksi',     icon: UserCheck,   roles: ['super_admin','panitia_seleksi','tim_ukk','tim_seleksi'] },
  { label: 'Pengumuman',       href: '/pengumuman/kelola',  icon: Bell,        roles: ['super_admin','panitia_seleksi','tim_seleksi'] },
  { label: 'Regulasi',         href: '/regulasi/kelola',    icon: FileText,    roles: ['super_admin'] },
  { label: 'SOP',              href: '/sop/kelola',         icon: BookOpen,    roles: ['super_admin'] },
  { label: 'Laporan',          href: '/laporan',            icon: FileBarChart,roles: ['super_admin','admin_bumd','admin_blud'] },
  { label: 'Manajemen User',   href: '/users',              icon: Users,       roles: ['super_admin'] },
]

interface NavLinkProps { item: NavItem; role: RoleName; collapsed: boolean }
function NavLink({ item, role, collapsed }: NavLinkProps) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  if (item.roles && !item.roles.includes(role)) return null

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
    </Link>
  )
}

interface Props { user: User }

export default function InternalSidebar({ user }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const role = (user.role?.name ?? 'viewer') as RoleName

  return (
    <aside className={cn(
      'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">SIBUMBALUMBA</div>
            <div className="text-[10px] text-muted-foreground capitalize">
              {role.replace(/_/g, ' ')}
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-accent text-muted-foreground shrink-0"
          aria-label="Toggle sidebar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(item => (
          <React.Fragment key={item.href}>
            <NavLink item={item} role={role} collapsed={collapsed as boolean} />
          </React.Fragment>
        ))}
      </nav>

      {/* User info + Ganti Password */}
      {!collapsed && (
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {(user.full_name ?? user.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{user.full_name ?? user.username}</div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
          <Link
            href="/pengaturan-akun"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Pengaturan Akun
          </Link>
        </div>
      )}
    </aside>
  )
}
