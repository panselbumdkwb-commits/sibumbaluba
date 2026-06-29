'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Users, Shield, TrendingUp } from 'lucide-react'

const FEATURES = [
  { icon: BarChart3, label: 'Monitoring & Evaluasi',  desc: 'Data BUMD & BLUD real-time dan akurat',       color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { icon: FileText,  label: 'Regulasi & SOP',         desc: 'Dokumen terstruktur & mudah diakses',          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { icon: Users,     label: 'Seleksi Terbuka',        desc: 'Proses seleksi direksi yang transparan',       color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { icon: Shield,    label: 'GCG Terintegrasi',       desc: 'Tata kelola berstandar nasional',              color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
]

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,85%,97%)] via-background to-[hsl(142,55%,97%)] dark:from-[hsl(213,50%,10%)] dark:via-background dark:to-[hsl(142,30%,8%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(213,85%,40%,0.08),transparent)]" />
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(hsl(213,85%,40%) 1px,transparent 1px),linear-gradient(to right,hsl(213,85%,40%) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-7 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Bagian Perekonomian dan SDA — Sekretariat Daerah Kota Batu
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Left */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-foreground mb-5">
              <span className="bg-gradient-to-r from-primary via-[hsl(213,85%,45%)] to-secondary bg-clip-text text-transparent">
                SIBUMBALUMBA
              </span>
              <br />
              <span className="text-[0.52em] font-semibold text-muted-foreground leading-relaxed">
                Sistem Informasi BUMD-BLUD Kota Batu
              </span>
            </h1>

            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Platform digital terpadu untuk monitoring, evaluasi, pembinaan, pengelolaan
              dan seleksi Badan Usaha Milik Daerah (BUMD) dan Badan Layanan Umum Daerah
              (BLUD) Kota Batu.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/seleksi"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200">
                Seleksi Aktif <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/portal-peserta/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/60 hover:border-primary/30 transition-all duration-200">
                <FileText className="h-4 w-4 text-secondary" /> Portal Peserta
              </Link>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc, color }) => (
                <div key={label}
                  className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-4 hover:border-primary/20 hover:bg-background hover:shadow-sm transition-all duration-200 backdrop-blur-sm">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground leading-tight">{label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hanya statistik, tanpa card Login Internal */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Kinerja Platform</span>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              {[
                { label: 'BUMD Aktif',          val: '2',   note: 'Terus dipantau' },
                { label: 'BLUD (Puskesmas)',    val: '5',   note: 'Kota Batu' },
                { label: 'Total Regulasi',      val: '9+',  note: 'Perda & Perwali' },
                { label: 'SOP Tersedia',        val: '11+', note: 'Prosedur operasional' },
              ].map(({ label, val, note }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-[11px] text-muted-foreground">{note}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary tabular-nums">{val}</div>
                </div>
              ))}
            </div>

            {/* Hanya Portal Peserta di sini, tidak ada Login Internal */}
            <Link href="/portal-peserta/daftar"
              className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 p-5 hover:bg-secondary/10 hover:border-secondary/30 transition-all group">
              <div>
                <div className="text-sm font-semibold text-foreground">Daftar Seleksi</div>
                <div className="text-xs text-muted-foreground mt-0.5">Daftar sebagai peserta seleksi</div>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
