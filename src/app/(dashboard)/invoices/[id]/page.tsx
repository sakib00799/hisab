import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { StatusBadge, mapInvoiceStatus } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { ArrowLeft } from "lucide-react";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const ctx = await requireCompany();
  const { id } = await params;

  let invoice;
  try {
    invoice = await invoiceService.getInvoice(ctx, id);
  } catch {
    notFound();
  }

  return (
    <>
      <TopBar title={invoice.invoiceNumber} />
      <main className="mx-auto max-w-3xl p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          render={<Link href="/invoices" />}
        >
          <ArrowLeft className="size-4" />
          Back to invoices
        </Button>

        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <div className="flex items-start justify-between border-b border-border p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {invoice.invoiceNumber}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {invoice.customer.name}
              </p>
            </div>
            <StatusBadge
              status={mapInvoiceStatus(invoice.status, invoice.dueDate)}
            />
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Issue date</p>
              <p className="mt-1 font-medium">
                {formatDate(invoice.invoiceDate.toISOString())}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due date</p>
              <p className="mt-1 font-medium">
                {invoice.dueDate
                  ? formatDate(invoice.dueDate.toISOString())
                  : "—"}
              </p>
            </div>
          </div>

          {invoice.items.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              <h3 className="mb-3 text-sm font-medium">Line items</h3>
              <ul className="space-y-2">
                {invoice.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.description} × {Number(item.quantity)}
                    </span>
                    <span>{formatCurrency(Number(item.lineTotal))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-border p-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(Number(invoice.subtotal))}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">VAT</span>
              <span className="font-medium">
                {formatCurrency(Number(invoice.vatTotal))}
              </span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="text-lg font-semibold">Total due</span>
              <span className="text-2xl font-semibold text-primary">
                {formatCurrency(Number(invoice.total))}
              </span>
            </div>
          </div>

          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
          />
        </div>
      </main>
    </>
  );
}
