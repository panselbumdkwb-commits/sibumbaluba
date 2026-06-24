import Link from 'next/link'
import { Shield, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground">SIMBUBALADA</div>
                <div className="text-xs text-muted-foreground">Kota Batu</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan
              Seleksi BUMD-BLUD Kota Batu — dikelola oleh Bagian Perekonomian dan SDA
              Sekretariat Daerah Kota Batu.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Jl. Panglima Sudirman No. 507, Kota Batu, Jawa Timur 65311</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>(0341) 591024</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>simbubalada@kotabatu.go.id</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Menu Utama</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                ['Beranda', '/'],
                ['Profil BUMD', '/profil/bumd'],
                ['Profil BLUD', '/profil/blud'],
                ['Regulasi', '/regulasi'],
                ['SOP', '/sop'],
                ['Pengumuman', '/pengumuman'],
                ['Seleksi', '/seleksi'],
                ['Kontak', '/kontak'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Tautan Terkait</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                ['Pemkot Batu', 'https://www.kotabatu.go.id'],
                ['Perumdam Among Tani', '#'],
                ['PT Batu Wisata Resources', '#'],
                ['Dinkes Kota Batu', '#'],
                ['BPKAD Kota Batu', '#'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Pemerintah Kota Batu. Hak cipta dilindungi.</span>
          <span>SIMBUBALADA v1.0 — Dibangun dengan Next.js & Supabase</span>
        </div>
      </div>
    </footer>
  )
}
