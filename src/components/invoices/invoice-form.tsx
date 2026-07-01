"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { createInvoiceSchema } from "@/lib/validators/invoice";
import { z } from "zod";

const formSchema = createInvoiceSchema.extend({
  newCustomerName: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof formSchema>;

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [
        { description: "", quantity: 1, unitPrice: 0, vatRate: 15 },
      ],
    },
  });

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.data ?? []));
  }, []);

  const items = watch("items");
  const item = items[0];
  const amount = (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
  const vatRate = Number(item?.vatRate) || 0;
  const vatAmount = Math.round((amount * vatRate) / 100);
  const total = amount + vatAmount;

  async function onSubmit(data: InvoiceFormData) {
    setError(null);
    let customerId = data.customerId;

    if (useNewCustomer && data.newCustomerName) {
      const custRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.newCustomerName }),
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
        items: data.items,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error?.message ?? "Failed to create invoice");
      return;
    }

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
          {errors.customerId && (
            <p className="text-xs text-danger">{errors.customerId.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Supply of goods — June 2026"
            {...register("items.0.description")}
          />
          {errors.items?.[0]?.description && (
            <p className="text-xs text-danger">
              {errors.items[0].description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.001"
            {...register("items.0.quantity", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit price (BDT)</Label>
          <Input
            id="unitPrice"
            type="number"
            placeholder="85000"
            {...register("items.0.unitPrice", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vatRate">VAT rate (%)</Label>
          <Input
            id="vatRate"
            type="number"
            {...register("items.0.vatRate", { valueAsNumber: true })}
          />
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
