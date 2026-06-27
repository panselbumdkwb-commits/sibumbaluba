'use client'

import { Radio } from 'lucide-react'

interface Props { items: string[] }

export default function RunningText({ items }: Props) {
  const text = items.join('   ◆   ')
  const doubled = text + '   ◆   ' + text

  return (
    <div className="h-9 flex items-center overflow-hidden bg-gradient-to-r from-[hsl(213,85%,30%)] to-[hsl(213,75%,38%)] text-white">
      <div className="flex items-center gap-2.5 px-4 shrink-0 border-r border-white/20 h-full bg-white/5">
        <Radio className="h-3.5 w-3.5 text-white/90" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap text-white/90">Siaran</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="inline-block whitespace-nowrap animate-marquee text-[12px] font-medium px-6 text-white/90 tracking-wide">
          {doubled}
        </div>
      </div>
    </div>
  )
}
