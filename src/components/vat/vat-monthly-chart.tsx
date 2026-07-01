import { formatCurrency } from "@/lib/format";

interface MonthData {
  month: string;
  year: number;
  monthNum: number;
  output: number;
  input: number;
  net: number;
}

interface VatMonthlyChartProps {
  breakdown: MonthData[];
}

export function VatMonthlyChart({ breakdown }: VatMonthlyChartProps) {
  const maxValue = Math.max(
    ...breakdown.map((m) => Math.max(m.output, m.input)),
    1
  );

  return (
    <div className="space-y-5">
      {breakdown.map((m) => (
        <div key={`${m.year}-${m.monthNum}`} className="space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
            <span className="font-medium text-foreground">{m.month}</span>
            <span className="text-muted-foreground sm:text-right">
              Output:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(m.output)}
              </span>
            </span>
            <span className="text-muted-foreground sm:text-right">
              Input:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(m.input)}
              </span>
            </span>
            <span className="sm:text-right">
              Net:{" "}
              <span
                className={
                  m.net >= 0 ? "font-semibold text-danger" : "font-semibold text-accent"
                }
              >
                {formatCurrency(m.net)}
              </span>
            </span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-all"
              style={{ width: `${(m.output / maxValue) * 100}%` }}
              title={`Output: ${formatCurrency(m.output)}`}
            />
            <div
              className="bg-muted-foreground/35 transition-all"
              style={{ width: `${(m.input / maxValue) * 100}%` }}
              title={`Input: ${formatCurrency(m.input)}`}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          Output VAT (sales)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/35" />
          Input VAT (purchases)
        </span>
      </div>
    </div>
  );
}
