'use client'

import React from 'react'

import { useState } from 'react'
import { Search, Download, FileText, ExternalLink } from 'lucide-react'

interface Regulasi {
  id: string; judul: string; nomor: string | null; tahun: number | null
  file_url: string | null; kategori: { nama: string; urutan: number } | null
}
interface Props {
  regulasi: Regulasi[]
  kategori: Array<{ id: string; nama: string }>
}

export default function RegulasiPublikClient({ regulasi, kategori }: Props) {
  const [search, setSearch] = useState('')
  const [filterKat, setFilterKat] = useState('')

  const filtered = regulasi.filter(r => {
    const q = search.toLowerCase()
    return (r.judul.toLowerCase().includes(q) || (r.nomor ?? '').toLowerCase().includes(q)) &&
      (!filterKat || r.kategori?.nama === filterKat)
  })

  // Group by kategori
  const grouped: Record<string, Regulasi[]> = {}
  filtered.forEach(r => {
    const k = r.kategori?.nama ?? 'Lainnya'
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(r)
  })

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari regulasi..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={filterKat} onChange={e => setFilterKat(e.target.value)}
          className="h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none">
          <option value="">Semua Kategori</option>
          {kategori.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
        </select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Tidak ada regulasi yang ditemukan</p>
        </div>
      ) : Object.entries(grouped).map(([kat, items]) => (
        <div key={kat} className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full inline-block" />
            {kat}
            <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
          </h2>
          <div className="grid gap-3">
            {items.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-primary/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.judul}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.nomor && <span className="text-xs text-muted-foreground">{r.nomor}</span>}
                    {r.tahun && <span className="text-xs text-muted-foreground">· {r.tahun}</span>}
                  </div>
                </div>
                {r.file_url ? (
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors shrink-0">
                    <Download className="h-3.5 w-3.5" /> Unduh
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted">Segera</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
