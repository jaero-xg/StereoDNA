import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded bg-surface-light", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg bg-surface border border-white/5 px-6 py-4 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}
