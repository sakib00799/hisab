"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { z } from "zod";

const invoiceFormSchema = z
  .object({
    customerId: z.string().optional(),
    newCustomerName: z.string().optional(),
    invoiceDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(500, "Description must be 500 characters or less"),
    quantity: z.coerce
      .number({ error: "Quantity is required" })
      .positive("Quantity must be positive"),
    unitPrice: z.coerce
      .number({ error: "Unit price is required" })
      .min(0, "Unit price must be non-negative"),
    vatRate: z.coerce
      .number({ error: "VAT rate is required" })
      .min(0)
      .max(100),
  })
  .superRefine((data, ctx) => {
    const hasCustomer =
      Boolean(data.customerId) || Boolean(data.newCustomerName?.trim());
    if (!hasCustomer) {
      ctx.addIssue({
        code: "custom",
        message: "Customer is required",
        path: ["customerId"],
      });
    }
  });

type InvoiceFormData = z.output<typeof invoiceFormSchema>;

interface Customer {
  id: string;
  name: string;
}

export function InvoiceForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useNewCustomer, setUseNewCustomer] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormData>,
    defaultValues: {
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: "",
      quantity: 1,
      unitPrice: 0,
      vatRate: 15,
    },
  });

  const quantity = useWatch({ control, name: "quantity" }) ?? 0;
  const unitPrice = useWatch({ control, name: "unitPrice" }) ?? 0;
  const vatRate = useWatch({ control, name: "vatRate" }) ?? 0;

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.data ?? []));
  }, []);

  const amount = Number(quantity) * Number(unitPrice);
  const vatAmount = Math.round((amount * Number(vatRate)) / 100);
  const total = amount + vatAmount;

  const customerError =
    errors.newCustomerName?.message ?? errors.customerId?.message;

  async function onSubmit(data: InvoiceFormData) {
    setError(null);
    let customerId = data.customerId;

    if (useNewCustomer && data.newCustomerName?.trim()) {
      const custRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.newCustomerName.trim() }),
      });
      const custData = await custRes.json();
      if (!custRes.ok) {
        setError(custData.error?.message ?? "Failed to create customer");
        return;
      }
      customerId = custData.data.id;
    }

    if (!customerId) {
      setError("Please select or enter a customer");
      return;
    }

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        notes: data.notes,
        items: [
          {
            description: data.description,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            vatRate: data.vatRate,
          },
        ],
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error?.message ?? "Failed to create invoice");
      return;
    }

    track("invoice_created", { total });
    router.push(`/invoices/${result.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customer">Customer</Label>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setUseNewCustomer(!useNewCustomer)}
            >
              {useNewCustomer ? "Select existing" : "Add new customer"}
            </button>
          </div>
          {useNewCustomer ? (
            <Input
              id="newCustomerName"
              placeholder="Karim & Sons"
              {...register("newCustomerName")}
            />
          ) : (
            <select
              id="customer"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              {...register("customerId")}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {customerError && (
            <p className="text-xs text-danger">{customerError}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="e.g. Supply of goods — June 2026, consulting services, monthly retainer..."
            className={cn(
              "flex w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            )}
            {...register("description")}
          />
          <p className="text-xs text-muted-foreground">
            Write any description for this line item — letters, numbers, dates, and Bengali text are all fine.
          </p>
          {errors.description && (
            <p className="text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.001"
            min="0"
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-xs text-danger">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit price (BDT)</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            placeholder="85000"
            {...register("unitPrice")}
          />
          {errors.unitPrice && (
            <p className="text-xs text-danger">{errors.unitPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vatRate">VAT rate (%)</Label>
          <Input
            id="vatRate"
            type="number"
            min="0"
            max="100"
            {...register("vatRate")}
          />
          {errors.vatRate && (
            <p className="text-xs text-danger">{errors.vatRate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue date</Label>
          <Input id="issueDate" type="date" {...register("invoiceDate")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(amount)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">VAT ({vatRate}%)</span>
          <span className="font-medium">{formatCurrency(vatAmount)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-semibold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
