'use client'
import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Native select wrapper yang aman tanpa Radix
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, onChange, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-9 w-full appearance-none items-center justify-between',
          'rounded-md border border-input bg-transparent px-3 py-2 pr-8',
          'text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onChange={e => {
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
    </div>
  )
)
Select.displayName = 'Select'

// Stub exports untuk kompatibilitas dengan kode yang pakai Radix API
function SelectGroup({ children }: { children?: React.ReactNode }) { return <>{children}</> }
function SelectValue({ placeholder }: { placeholder?: string }) { return <span>{placeholder}</span> }
function SelectTrigger({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm', className)} {...props}>{children}</div>
}
function SelectContent({ children }: { children?: React.ReactNode }) { return <>{children}</> }
function SelectLabel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>{children}</div>
}
function SelectItem({ children, value: _v, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: string }) {
  return <div className={cn('relative flex cursor-default items-center rounded-sm py-1.5 pl-2 pr-8 text-sm', className)} {...props}>{children}</div>
}
function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
}

export {
  Select, SelectGroup, SelectValue, SelectTrigger,
  SelectContent, SelectLabel, SelectItem, SelectSeparator
}
