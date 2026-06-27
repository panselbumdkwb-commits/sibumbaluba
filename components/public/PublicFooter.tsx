import Link from 'next/link'
import { Shield, MapPin, Phone, Mail, ExternalLink, ArrowUpRight } from 'lucide-react'

const MENU_LINKS = [
  ['Beranda', '/'],
  ['Profil BUMD', '/profil/bumd'],
  ['Profil BLUD', '/profil/blud'],
  ['Regulasi', '/regulasi'],
  ['SOP', '/sop'],
  ['Pengumuman', '/pengumuman'],
  ['Seleksi Direksi', '/seleksi'],
  ['Kontak', '/kontak'],
]

const EXTERNAL_LINKS = [
  ['Pemkot Batu', 'https://www.kotabatu.go.id'],
  ['Perumdam Among Tani', '#'],
  ['PT Batu Wisata Resources', '#'],
  ['Dinkes Kota Batu', '#'],
  ['BPKAD Kota Batu', '#'],
]

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand col */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(213,85%,30%)] flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground tracking-tight">SIBUMBALUMBA</div>
                <div className="text-[11px] text-muted-foreground font-medium">Kota Batu</div>
              </div>
            </Link>

            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 max-w-sm">
              Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi
              BUMD-BLUD — dikelola oleh Bagian Perekonomian dan SDA Sekretariat Daerah Kota Batu.
            </p>

            <div className="space-y-2.5">
              {[
                { icon: MapPin, text: 'Jl. Panglima Sudirman No. 507, Kota Batu, Jawa Timur 65311' },
                { icon: Phone, text: '(0341) 591024' },
                { icon: Mail, text: 'sibumbalumba@kotabatu.go.id' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                  <span className="leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu col */}
          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 mb-4">Menu Utama</div>
            <ul className="space-y-2.5">
              {MENU_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External col */}
          <div className="md:col-span-4">
            <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 mb-4">Tautan Terkait</div>
            <ul className="space-y-2.5">
              {EXTERNAL_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium group">
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Login card */}
            <div className="mt-8 rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="text-xs font-semibold text-foreground mb-1">Login Internal</div>
              <div className="text-[11px] text-muted-foreground mb-3">Akses dashboard pengelolaan BUMD-BLUD</div>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Masuk ke Sistem <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Pemerintah Kota Batu. Hak cipta dilindungi.
          </span>
          <span className="text-[11px] text-muted-foreground">
            SIBUMBALUMBA v1.1 — Dibangun dengan Next.js & Supabase
          </span>
        </div>
      </div>
    </footer>
  )
}
