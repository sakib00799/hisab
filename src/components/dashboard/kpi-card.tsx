import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "danger" | "warning" | "success";
}

const variantStyles = {
  default: "text-primary",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-accent",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KpiCardProps) {
  return (
    <div className="min-h-[120px] rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-semibold tracking-tight break-words", variantStyles[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="shrink-0 rounded-md bg-muted p-2.5">
          <Icon className={cn("size-5", variantStyles[variant])} />
        </div>
      </div>
      {trend && (
        <p className="mt-3 text-sm text-muted-foreground">
          <span
            className={cn(
              "font-medium",
              trend.value >= 0 ? "text-accent" : "text-danger"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>{" "}
          {trend.label}
        </p>
      )}
    </div>
  );
}
