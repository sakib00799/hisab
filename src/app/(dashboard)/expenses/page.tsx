"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { expenseCategories } from "@/lib/validators/expense";
import { Plus } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: string;
  vatAmount: string;
  totalAmount: string;
  expenseDate: string;
  supplier: { name: string } | null;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "OTHER" as (typeof expenseCategories)[number],
    description: "",
    amount: "",
    vatAmount: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  function loadExpenses() {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((d) => setExpenses(d.data?.data ?? []));
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.category,
        description: form.description || undefined,
        amount: parseFloat(form.amount),
        vatAmount: parseFloat(form.vatAmount || "0"),
        expenseDate: form.expenseDate,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setForm({
        category: "OTHER",
        description: "",
        amount: "",
        vatAmount: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
      loadExpenses();
      router.refresh();
    }
  }

  return (
    <>
      <TopBar title="Expenses" />
      <main className="p-6">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4" />
            Add expense
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-border bg-surface p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as typeof form.category })
                  }
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Office supplies purchase"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (before VAT)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Input VAT</Label>
                <Input
                  type="number"
                  value={form.vatAmount}
                  onChange={(e) => setForm({ ...form, vatAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save expense"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="rounded-lg border border-border bg-surface shadow-sm">
          {expenses.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No expenses recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="text-sm">
                      {formatDate(exp.expenseDate)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exp.category.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exp.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(Number(exp.amount))}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(Number(exp.vatAmount))}
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
