import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { StatusBadge, mapInvoiceStatus } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireCompany } from "@/lib/auth/company-context";
import * as analyticsService from "@/lib/services/analytics.service";
import {
  TrendingUp,
  FileText,
  Calculator,
  Receipt,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const ctx = await requireCompany();
  const [summary, recentInvoices] = await Promise.all([
    analyticsService.getSummary(ctx),
    analyticsService.getRecentInvoices(ctx, 5),
  ]);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="w-full p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Overview for {summary.periodLabel}
          </p>
          <Button render={<Link href="/invoices/new" />}>
            <Plus className="size-4" />
            New invoice
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            icon={TrendingUp}
            trend={{ value: summary.revenueChange, label: "vs last month" }}
            variant="success"
          />
          <KpiCard
            title="Outstanding Invoices"
            value={formatCurrency(summary.outstandingInvoices)}
            subtitle={`${summary.outstandingCount} unpaid invoices`}
            icon={FileText}
            variant="warning"
          />
          <KpiCard
            title="VAT Owed"
            value={formatCurrency(summary.vatOwed)}
            subtitle={`Due ${formatDate(summary.vatDueDate)}`}
            icon={Calculator}
            variant="danger"
          />
          <KpiCard
            title="Expenses This Month"
            value={formatCurrency(summary.expensesThisMonth)}
            icon={Receipt}
            trend={{ value: summary.expensesChange, label: "vs last month" }}
          />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Recent Invoices</h2>
            <Button variant="ghost" size="sm" render={<Link href="/invoices" />}>
              View all
              <ArrowRight className="size-4" />
            </Button>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No invoices yet.{" "}
              <Link href="/invoices/new" className="text-primary hover:underline">
                Create your first invoice
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-primary hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.customer.name}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(Number(invoice.total))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.dueDate ? formatDate(invoice.dueDate.toISOString()) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={mapInvoiceStatus(invoice.status, invoice.dueDate)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </>
  );
}
