import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-light text-text-muted',
    primary: 'bg-primary/20 text-primary-light',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-accent-green/20 text-accent-green',
    warning: 'bg-accent-orange/20 text-accent-orange',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
