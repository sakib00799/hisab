import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge, mapInvoiceStatus } from "@/components/dashboard/status-badge";
import { Input } from "@/components/ui/input";
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
import * as invoiceService from "@/lib/services/invoice.service";
import { Plus, Search } from "lucide-react";

export default async function InvoicesPage() {
  const ctx = await requireCompany();
  const { data: invoices } = await invoiceService.listInvoices(ctx, {
    limit: 50,
  });

  return (
    <>
      <TopBar title="Invoices" />
      <main className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoices or customers..." className="pl-9" />
          </div>
          <Button render={<Link href="/invoices/new" />}>
            <Plus className="size-4" />
            Create invoice
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-sm">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No invoices yet.</p>
              <Button className="mt-4" render={<Link href="/invoices/new" />}>
                Create your first invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
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
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invoice.invoiceDate.toISOString())}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.dueDate
                        ? formatDate(invoice.dueDate.toISOString())
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(Number(invoice.subtotal))}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatCurrency(Number(invoice.vatTotal))}
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
