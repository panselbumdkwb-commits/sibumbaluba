'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Users, Shield } from 'lucide-react'

const FEATURES = [
  { icon: BarChart3, label: 'Monitoring & Evaluasi', desc: 'BUMD & BLUD real-time' },
  { icon: FileText, label: 'Regulasi & SOP', desc: 'Dokumen terstruktur & mudah diakses' },
  { icon: Users, label: 'Seleksi Terbuka', desc: 'Proses seleksi direksi transparan' },
  { icon: Shield, label: 'GCG Terintegrasi', desc: 'Tata kelola berstandar nasional' },
]

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/40">
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Shield className="h-3 w-3" />
            Pemerintah Kota Batu – Bagian Perekonomian dan SDA
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-4">
            <span className="gradient-text">SIMBUBALADA</span>
            <br />
            <span className="text-2xl lg:text-3xl font-medium text-muted-foreground mt-2 block">
              Sistem Informasi BUMD-BLUD Kota Batu
            </span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
            Platform terpadu untuk monitoring, evaluasi, pembinaan, pengelolaan dan seleksi
            Badan Usaha Milik Daerah (BUMD) dan Badan Layanan Umum Daerah (BLUD) Kota Batu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kelola/seleksi"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              Lihat Seleksi Aktif
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pengumuman"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-accent transition-all"
            >
              Pengumuman
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="card-glass p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="font-semibold text-sm text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
