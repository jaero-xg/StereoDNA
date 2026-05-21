import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg bg-surface-light',
      className
    )} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-surface/80 border border-white/5 p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
