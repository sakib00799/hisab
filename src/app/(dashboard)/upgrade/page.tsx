"use client";

import Link from "next/link";
import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    id: "BUSINESS" as const,
    name: "Business",
    price: 2499,
    features: [
      "Unlimited invoices",
      "Mushak 9.1 VAT export",
      "Bank statement import",
      "Expense tracking",
    ],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: 5999,
    features: [
      "Everything in Business",
      "Receipt OCR",
      "Accountant access",
      "Priority support",
    ],
  },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: "BUSINESS" | "PRO") {
    setLoading(plan);
    setError(null);
    const res = await fetch("/api/subscription/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setError(data.error?.message ?? "Upgrade failed");
      return;
    }

    if (data.data?.gatewayUrl) {
      window.location.href = data.data.gatewayUrl;
    }
  }

  return (
    <>
      <TopBar title="Upgrade" />
      <main className="mx-auto max-w-2xl p-6">
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm"
            >
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10">
                  <Sparkles className="size-6 text-accent" />
                </div>
                <h2 className="mt-3 text-xl font-semibold">{plan.name}</h2>
                <p className="mt-2">
                  <span className="text-3xl font-bold">৳{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </p>
              </div>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full bg-accent hover:bg-accent/90"
                onClick={() => upgrade(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? "Redirecting..." : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="text-primary hover:underline">
            Back to dashboard
          </Link>
        </p>
      </main>
    </>
  );
}
