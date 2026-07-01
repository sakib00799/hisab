"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

interface VatActionsProps {
  year: number;
  month: number;
  isFiled: boolean;
}

export function VatActions({ year, month, isFiled }: VatActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markFiled() {
    setLoading(true);
    await fetch(`/api/vat/${year}/${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setLoading(false);
    router.refresh();
  }

  if (isFiled) {
    return (
      <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
        <FileCheck className="mr-1.5 size-4" />
        Filed
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={markFiled}
      disabled={loading}
    >
      <FileCheck className="size-4" />
      {loading ? "Saving..." : "Mark as filed"}
    </Button>
  );
}
