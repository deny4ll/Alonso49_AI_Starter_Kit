import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
  className?: string
}

const TONES: Record<string, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/15 text-destructive',
  primary: 'bg-primary/15 text-primary',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function statusTone(status: string): BadgeProps['tone'] {
  switch (status) {
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    case 'PENDING_REVIEW':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function processingTone(status: string): BadgeProps['tone'] {
  switch (status) {
    case 'READY':
      return 'success'
    case 'FAILED':
      return 'danger'
    default:
      return 'warning'
  }
}
