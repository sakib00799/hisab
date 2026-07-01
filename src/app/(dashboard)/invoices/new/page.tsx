import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewInvoicePage() {
  return (
    <>
      <TopBar title="Create Invoice" />
      <main className="mx-auto max-w-2xl p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          render={<Link href="/invoices" />}
        >
          <ArrowLeft className="size-4" />
          Back to invoices
        </Button>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            New invoice details
          </h2>
          <InvoiceForm />
        </div>
      </main>
    </>
  );
}
