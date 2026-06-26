'use client'

import React from 'react'

import { useState } from 'react'
import { Search, Download, BookOpen } from 'lucide-react'

interface SopItem {
  id: string; judul: string; kode: string | null; versi: string
  file_url: string | null; kategori: { nama: string; entitas: string } | null
}
interface Props {
  sop: SopItem[]
  kategori: Array<{ id: string; nama: string; entitas: string }>
}

const ENTITAS_COLOR: Record<string, string> = {
  BUMD: 'bg-blue-100 text-blue-700',
  BLUD: 'bg-emerald-100 text-emerald-700',
  Umum: 'bg-gray-100 text-gray-700',
}

export default function SopPublikClient({ sop, kategori }: Props) {
  const [search, setSearch] = useState('')
  const [filterEntitas, setFilterEntitas] = useState('')

  const filtered = sop.filter(s =>
    s.judul.toLowerCase().includes(search.toLowerCase()) &&
    (!filterEntitas || s.kategori?.entitas === filterEntitas)
  )

  const grouped: Record<string, SopItem[]> = {}
  filtered.forEach(s => {
    const k = `${s.kategori?.entitas ?? 'Umum'} – ${s.kategori?.nama ?? 'Lainnya'}`
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(s)
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari SOP..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2">
          {['', 'BUMD', 'BLUD', 'Umum'].map(e => (
            <button key={e} onClick={() => setFilterEntitas(e)}
              className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors border ${filterEntitas === e ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}>
              {e || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>SOP tidak ditemukan</p>
        </div>
      ) : Object.entries(grouped).map(([kat, items]) => {
        const [entitas] = kat.split(' – ')
        return (
          <div key={kat} className="mb-8">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${ENTITAS_COLOR[entitas] ?? 'bg-gray-100 text-gray-700'}`}>{entitas}</span>
              <span>{kat.split(' – ')[1]}</span>
              <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
            </h2>
            <div className="grid gap-3">
              {items.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-all">
                  <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.judul}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {s.kode && <span>{s.kode}</span>}
                      <span>· Versi {s.versi}</span>
                    </div>
                  </div>
                  {s.file_url ? (
                    <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-medium transition-colors shrink-0">
                      <Download className="h-3.5 w-3.5" /> Unduh
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted shrink-0">Segera</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
