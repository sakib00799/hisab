"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeBin } from "@/lib/validators/company";

function isValidBin(bin: string): boolean {
  return /^\d{12}$/.test(normalizeBin(bin));
}

function formatValidationError(data: {
  error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } };
}): string {
  const fieldErrors = data.error?.details?.fieldErrors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) return first;
  }
  return data.error?.message ?? "Failed to create company";
}

const steps = [
  { id: 1, title: "Company details" },
  { id: 2, title: "VAT registration" },
  { id: 3, title: "Bank account" },
  { id: 4, title: "All set" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    binNumber: "",
    tinNumber: "",
    vatType: "STANDARD" as const,
    businessCategory: "",
    bankName: "",
    accountNumber: "",
  });

  const progress = (step / steps.length) * 100;

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function finishOnboarding() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        binNumber: formData.binNumber,
        tinNumber: formData.tinNumber || undefined,
        vatType: formData.vatType,
        businessCategory: formData.businessCategory || undefined,
        address: formData.address || undefined,
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(formatValidationError(data));
      return;
    }

    router.push("/dashboard");
  }

  function next() {
    if (step === 2 && !isValidBin(formData.binNumber)) {
      setError("BIN must be exactly 12 digits (e.g. 000123456789)");
      return;
    }

    setError(null);

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <AuthShell
      title="Set up your business"
      subtitle={`Step ${step} of ${steps.length}: ${steps[step - 1].title}`}
    >
      <div className="mb-6 space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex flex-col items-center gap-1",
                s.id <= step ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                  s.id < step
                    ? "bg-accent text-white"
                    : s.id === step
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {s.id < step ? <Check className="size-3.5" /> : s.id}
              </div>
              <span className="hidden text-xs sm:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              placeholder="Rahim Traders Ltd."
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Business address</Label>
            <Input
              id="address"
              placeholder="Motijheel, Dhaka"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Business category</Label>
            <Input
              id="category"
              placeholder="Trading, Manufacturing, Services..."
              value={formData.businessCategory}
              onChange={(e) => updateField("businessCategory", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bin">Business Identification Number (BIN)</Label>
            <Input
              id="bin"
              placeholder="000123456789"
              value={formData.binNumber}
              onChange={(e) => updateField("binNumber", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Exactly 12 digits — dashes are optional (e.g. 000123456789)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tin">TIN (optional)</Label>
            <Input
              id="tin"
              placeholder="123456789012"
              value={formData.tinNumber}
              onChange={(e) => updateField("tinNumber", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Optional — you can add bank accounts later for statement import.
          </p>
          <div className="space-y-2">
            <Label htmlFor="bank">Bank name</Label>
            <Input
              id="bank"
              placeholder="Dutch-Bangla Bank"
              value={formData.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account number</Label>
            <Input
              id="account"
              placeholder="1234567890"
              value={formData.accountNumber}
              onChange={(e) => updateField("accountNumber", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/10">
            <Check className="size-8 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              You&apos;re ready to go
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is set up. Create your first invoice or explore the
              dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && step < 4 && (
          <Button variant="outline" onClick={back} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={next}
          className="flex-1"
          disabled={
            loading ||
            (step === 1 && !formData.name) ||
            (step === 2 && !formData.binNumber.trim())
          }
        >
          {loading
            ? "Saving..."
            : step === steps.length
              ? "Go to dashboard"
              : "Continue"}
        </Button>
      </div>
    </AuthShell>
  );
}
