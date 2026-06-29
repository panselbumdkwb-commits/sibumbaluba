'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X, Shield, ChevronDown, Building2, FileText } from 'lucide-react'
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
  const [time, setTime] = useState('')
  useEffect(() => {
    function tick() {
      const now = new Date()
      const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
      const pad = (n: number) => String(n).padStart(2, '0')
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
      setTime(`${days[wib.getDay()]}, ${wib.getDate()} ${months[wib.getMonth()]} ${wib.getFullYear()}  ${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())} WIB`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="hidden md:inline text-[11px] tabular-nums text-white/70 font-mono">{time}</span>
}

export default function PublicHeader() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Gov bar */}
      <div className="bg-gradient-to-r from-[hsl(213,85%,30%)] to-[hsl(213,75%,38%)]">
        <div className="container mx-auto flex h-9 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[11px] text-white/90 font-medium tracking-wide">
              Pemerintah Kota Batu — Bagian Perekonomian & SDA Setda
            </span>
          </div>
          <WIBClock />
        </div>
      </div>

      {/* Main nav */}
      <div className={cn(
        'border-b transition-all duration-200',
        scrolled
          ? 'bg-background/95 backdrop-blur-xl border-border shadow-sm'
          : 'bg-background border-border/60'
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-[62px] items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="h-[38px] w-[38px] rounded-lg bg-gradient-to-br from-primary to-[hsl(213,85%,30%)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="h-[18px] w-[18px] text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-bold tracking-tight text-foreground">SIBUMBALUMBA</div>
                <div className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">Kota Batu</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  <div key={item.label} className="relative"
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}>
                    <button className={cn(
                      'flex items-center gap-1 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all',
                      'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}>
                      {item.label}
                      <ChevronDown className={cn('h-3 w-3 transition-transform', dropdown === item.label && 'rotate-180')} />
                    </button>
                    {dropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-border bg-background shadow-xl py-1.5 overflow-hidden">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={item.href} href={item.href!}
                    className={cn(
                      'px-3.5 py-2 rounded-md text-[13px] font-medium transition-all',
                      pathname === item.href
                        ? 'text-primary bg-primary/8 font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}>
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right — hanya 1 tombol Login Internal + Portal Peserta */}
            <div className="flex items-center gap-2 shrink-0">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                  aria-label="Ganti tema"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              <Link href="/portal-peserta/login"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-[13px] font-semibold text-foreground hover:bg-muted/60 transition-all">
                <FileText className="h-3.5 w-3.5 text-secondary" />
                Portal Peserta
              </Link>
              <Link href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                <Shield className="h-3.5 w-3.5" />
                Login Internal
              </Link>
              <button
                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-xl shadow-xl px-4 pb-5">
          <div className="pt-3 space-y-0.5">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <div className="px-3 pt-3 pb-1 text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70">{item.label}</div>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.href} href={item.href!} onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href ? 'text-primary bg-primary/8 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}>
                  {item.label}
                </Link>
              )
            )}
            {/* Mobile: Portal Peserta + Login Internal */}
            <div className="pt-3 space-y-2">
              <Link href="/portal-peserta/login" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted/60 transition-colors">
                <FileText className="h-4 w-4 text-secondary" /> Portal Peserta
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Shield className="h-4 w-4" /> Login Internal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
