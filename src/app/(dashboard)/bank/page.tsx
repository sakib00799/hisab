"use client";

import { useEffect, useState } from "react";
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
import { Upload } from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
}

interface Transaction {
  id: string;
  transactionDate: string;
  description: string;
  amount: string;
  type: string;
  category: string | null;
}

export default function BankPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [importing, setImporting] = useState(false);

  function loadData() {
    fetch("/api/bank/accounts")
      .then((r) => r.json())
      .then((d) => {
        const accs = d.data ?? [];
        setAccounts(accs);
        if (accs.length && !selectedAccount) setSelectedAccount(accs[0].id);
      });
    fetch("/api/bank/transactions")
      .then((r) => r.json())
      .then((d) => setTransactions(d.data ?? []));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addAccount(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/bank/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankName, accountNumber }),
    });
    setBankName("");
    setAccountNumber("");
    loadData();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedAccount) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bankAccountId", selectedAccount);

    await fetch("/api/bank/import", { method: "POST", body: formData });
    setImporting(false);
    loadData();
  }

  return (
    <>
      <TopBar title="Bank Import" />
      <main className="p-6 space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Add bank account</h2>
          <form onSubmit={addAccount} className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Bank name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="BRAC Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Account number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add account</Button>
            </div>
          </form>
        </div>

        {accounts.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Import CSV statement</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Account</Label>
                <select
                  className="flex h-9 rounded-md border border-input px-3 text-sm"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} — {a.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>CSV file</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importing}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports BRAC, Dutch-Bangla, Islami Bank, and Eastern Bank formats.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Transactions</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Upload className="mx-auto mb-2 size-8 opacity-50" />
              Import a bank statement to see transactions here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">
                      {formatDate(txn.transactionDate)}
                    </TableCell>
                    <TableCell className="text-sm">{txn.description}</TableCell>
                    <TableCell className="text-sm">{txn.type}</TableCell>
                    <TableCell className="text-sm">{txn.category ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(Number(txn.amount))}
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
