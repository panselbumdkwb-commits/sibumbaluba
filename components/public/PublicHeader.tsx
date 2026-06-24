'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X, Shield, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Profil',
    children: [
      { label: 'BUMD', href: '/profil/bumd' },
      { label: 'BLUD (Puskesmas)', href: '/profil/blud' },
    ],
  },
  { label: 'Regulasi', href: '/regulasi' },
  { label: 'SOP', href: '/sop' },
  { label: 'Pengumuman', href: '/pengumuman' },
  { label: 'Seleksi', href: '/seleksi' },
  { label: 'Kontak', href: '/kontak' },
]

function WIBClock() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    function updateTime() {
      const now = new Date()
      const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
      const h = wib.getHours().toString().padStart(2, '0')
      const m = wib.getMinutes().toString().padStart(2, '0')
      const s = wib.getSeconds().toString().padStart(2, '0')
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
      const day = days[wib.getDay()]
      const date = wib.getDate()
      const month = months[wib.getMonth()]
      const year = wib.getFullYear()
      setTime(`${day}, ${date} ${month} ${year}  ${h}:${m}:${s} WIB`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="hidden sm:inline text-xs tabular-nums text-muted-foreground font-mono tracking-tight">
      {time}
    </span>
  )
}

export default function PublicHeader() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      {/* Top bar */}
      <div className="border-b border-border/30 bg-primary/5">
        <div className="container mx-auto flex h-8 items-center justify-between px-4 text-xs">
          <span className="text-muted-foreground">
            Pemerintah Kota Batu – Bagian Perekonomian dan SDA
          </span>
          <WIBClock />
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-foreground">
                SIMBUBALADA
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                Kota Batu
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(item.label)}
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {dropdownOpen === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              Login Internal
            </Link>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 pb-4">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label}>
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground mt-2">
                  {item.label}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium mt-1',
                  pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/login"
            className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Login Internal
          </Link>
        </div>
      )}
    </header>
  )
}
