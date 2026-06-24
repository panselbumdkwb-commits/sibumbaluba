'use client'

import { Volume2 } from 'lucide-react'

interface RunningTextProps {
  items: string[]
}

export default function RunningText({ items }: RunningTextProps) {
  const text = items.join('  ◆  ')
  // Duplicate for seamless loop
  const doubled = text + '  ◆  ' + text

  return (
    <div className="bg-primary text-primary-foreground flex items-center overflow-hidden h-9">
      <div className="flex items-center gap-2 px-4 shrink-0 bg-primary/80 border-r border-white/20 h-full">
        <Volume2 className="h-3.5 w-3.5" />
        <span className="text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          Info
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div
          className="inline-block whitespace-nowrap animate-marquee text-sm py-2 px-4"
          aria-live="polite"
        >
          {doubled}
        </div>
      </div>
    </div>
  )
}
