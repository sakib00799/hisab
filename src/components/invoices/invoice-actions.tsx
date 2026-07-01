"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Send, CheckCircle } from "lucide-react";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: "send" | "paid") {
    setLoading(action);
    await fetch(`/api/invoices/${invoiceId}/${action}`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-3 border-t border-border p-6">
      <Button
        variant="outline"
        render={<a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer" />}
      >
        <Download className="size-4" />
        Download PDF
      </Button>
      {status === "DRAFT" && (
        <Button
          onClick={() => handleAction("send")}
          disabled={loading === "send"}
        >
          <Send className="size-4" />
          {loading === "send" ? "Sending..." : "Mark as sent"}
        </Button>
      )}
      {(status === "SENT" || status === "OVERDUE") && (
        <Button
          onClick={() => handleAction("paid")}
          disabled={loading === "paid"}
        >
          <CheckCircle className="size-4" />
          {loading === "paid" ? "Updating..." : "Mark as paid"}
        </Button>
      )}
    </div>
  );
}
