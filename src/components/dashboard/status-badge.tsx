import { cn } from "@/lib/utils";

export type DisplayInvoiceStatus =
  | "paid"
  | "pending"
  | "due_soon"
  | "overdue"
  | "draft"
  | "sent"
  | "cancelled";

const statusConfig: Record<
  DisplayInvoiceStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-green-50 text-accent border-green-200",
  },
  pending: {
    label: "Pending",
    className: "bg-slate-50 text-muted-foreground border-slate-200",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-primary border-blue-200",
  },
  draft: {
    label: "Draft",
    className: "bg-slate-50 text-muted-foreground border-slate-200",
  },
  due_soon: {
    label: "Due Soon",
    className: "bg-amber-50 text-warning border-amber-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-danger border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-50 text-muted-foreground border-slate-200 line-through",
  },
};

export function mapInvoiceStatus(
  status: string,
  dueDate?: Date | string | null
): DisplayInvoiceStatus {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "draft") return "draft";
  if (normalized === "sent") {
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 0) return "overdue";
      if (daysUntilDue <= 7) return "due_soon";
    }
    return "sent";
  }
  if (normalized === "overdue") return "overdue";
  if (normalized === "cancelled") return "cancelled";
  return "pending";
}

interface StatusBadgeProps {
  status: DisplayInvoiceStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key =
    typeof status === "string" && status in statusConfig
      ? (status as DisplayInvoiceStatus)
      : mapInvoiceStatus(status);
  const config = statusConfig[key];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
