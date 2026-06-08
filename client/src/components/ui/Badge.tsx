import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "accent";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-surface-light text-text-muted",
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-light tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
