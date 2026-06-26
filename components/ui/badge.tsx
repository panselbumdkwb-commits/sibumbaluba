import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps {
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  style?: React.CSSProperties
  title?: string
  role?: string
  'aria-label'?: string
}

const VARIANT_CLASSES: Record<string, string> = {
  default:     'border-transparent bg-primary text-primary-foreground',
  secondary:   'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline:     'border-border text-foreground bg-transparent',
  success:     'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning:     'border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  info:        'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
