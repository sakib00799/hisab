import { TopBar } from "@/components/layout/top-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireCompany } from "@/lib/auth/company-context";
import { getCompanyPlan, hasPlan } from "@/lib/auth/plan-gate";
import { PlanType } from "@/generated/prisma";
import * as vatService from "@/lib/services/vat.service";
import { VatActions } from "@/components/vat/vat-actions";
import { VatExportBanner } from "@/components/vat/vat-export-banner";
import { VatMonthlyChart } from "@/components/vat/vat-monthly-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Calculator,
  CalendarClock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function VatReportPage() {
  const ctx = await requireCompany();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [vatData, breakdown, plan] = await Promise.all([
    vatService.calculateVatPeriod(ctx, year, month),
    vatService.getMonthlyVatBreakdown(ctx, 6),
    getCompanyPlan(ctx.companyId),
  ]);

  const canExport = hasPlan(plan, PlanType.BUSINESS);
  const daysLeft = daysUntil(vatData.deadline);
  const isFiled = vatData.status === "FILED";

  const periodLabel = now.toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  const deadlineUrgent = daysLeft <= 7;
  const deadlineSoon = daysLeft <= 14;

  return (
    <>
      <TopBar title="VAT Report" />
      <main className="space-y-6 p-6">
        {/* Period & deadline banner */}
        <div
          className={`rounded-lg border p-4 ${
            deadlineUrgent
              ? "border-danger/30 bg-danger/5"
              : deadlineSoon
                ? "border-warning/30 bg-warning/5"
                : "border-border bg-surface"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CalendarClock
                className={`mt-0.5 size-5 shrink-0 ${
                  deadlineUrgent
                    ? "text-danger"
                    : deadlineSoon
                      ? "text-warning"
                      : "text-primary"
                }`}
              />
              <div>
                <p className="font-medium text-foreground">
                  {periodLabel} · Filing deadline{" "}
                  {formatDate(vatData.deadline.toISOString())}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {daysLeft > 0
                    ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining to file with NBR`
                    : daysLeft === 0
                      ? "Deadline is today"
                      : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`}
                </p>
              </div>
            </div>
            <VatActions year={year} month={month} isFiled={isFiled} />
          </div>
          {deadlineUrgent && !isFiled && (
            <p className="mt-3 flex items-center gap-2 text-sm text-danger">
              <AlertTriangle className="size-4 shrink-0" />
              VAT return for this period should be filed soon to avoid NBR penalties.
            </p>
          )}
        </div>

        {/* KPI summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Output VAT"
            value={formatCurrency(vatData.outputVat)}
            subtitle="VAT collected on sales"
            icon={TrendingUp}
          />
          <KpiCard
            title="Input VAT"
            value={formatCurrency(vatData.inputVat)}
            subtitle="VAT paid on purchases"
            icon={TrendingDown}
          />
          <KpiCard
            title="Net VAT Payable"
            value={formatCurrency(vatData.netPayable)}
            subtitle={
              vatData.netPayable >= 0
                ? "Amount due to NBR"
                : "Input credit (carry forward)"
            }
            icon={Calculator}
            variant={vatData.netPayable > 0 ? "danger" : "success"}
          />
        </div>

        {/* Export — gated feature, not a full-page block */}
        <VatExportBanner canExport={canExport} year={year} month={month} />

        {/* Monthly trend */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">6-month VAT trend</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Output vs input VAT by month
          </p>
          <div className="mt-6">
            <VatMonthlyChart breakdown={breakdown} />
          </div>
        </section>

        {/* Registers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Output register</h2>
              <p className="text-sm text-muted-foreground">
                Sales invoices · {periodLabel}
              </p>
            </div>
            {vatData.outputRegister.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No sales invoices this month.{" "}
                <a href="/invoices/new" className="text-primary hover:underline">
                  Create an invoice
                </a>
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatData.outputRegister.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-sm">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.customer.name}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(Number(inv.vatTotal))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Input register</h2>
              <p className="text-sm text-muted-foreground">
                Purchase expenses · {periodLabel}
              </p>
            </div>
            {vatData.inputRegister.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No expenses this month.{" "}
                <a href="/expenses" className="text-primary hover:underline">
                  Add an expense
                </a>
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatData.inputRegister.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-sm">
                        {exp.description ?? exp.category.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exp.supplier?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(Number(exp.vatAmount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
