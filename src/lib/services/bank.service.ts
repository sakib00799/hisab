import { Prisma, TxnType } from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { categorizeTransaction } from "@/lib/bank/categorize";
import { parseBankCsv } from "@/lib/bank/parsers";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/errors";
import { CreateBankAccountInput } from "@/lib/validators/bank";

export async function listBankAccounts(ctx: CompanyContext) {
  return db.bankAccount.findMany({
    where: { companyId: ctx.companyId },
    include: { _count: { select: { transactions: true } } },
  });
}

export async function createBankAccount(
  ctx: CompanyContext,
  input: CreateBankAccountInput
) {
  assertCanWrite(ctx);
  return db.bankAccount.create({
    data: {
      companyId: ctx.companyId,
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      accountType: input.accountType,
    },
  });
}

export async function importCsv(
  ctx: CompanyContext,
  bankAccountId: string,
  csvContent: string,
  bankHint?: string
) {
  assertCanWrite(ctx);

  const account = await db.bankAccount.findFirst({
    where: { id: bankAccountId, companyId: ctx.companyId },
  });
  if (!account) throw notFound("Bank account");

  const parsed = parseBankCsv(csvContent, bankHint);
  if (parsed.length === 0) {
    throw badRequest("No transactions found in CSV");
  }

  const existing = await db.bankTransaction.findMany({
    where: { bankAccountId },
    select: { transactionDate: true, amount: true, description: true },
  });

  const existingKeys = new Set(
    existing.map(
      (t) =>
        `${t.transactionDate.toISOString()}-${Number(t.amount)}-${t.description}`
    )
  );

  const toInsert = parsed.filter((t) => {
    const key = `${t.transactionDate.toISOString()}-${t.amount}-${t.description}`;
    return !existingKeys.has(key);
  });

  if (toInsert.length === 0) {
    return { imported: 0, skipped: parsed.length };
  }

  await db.bankTransaction.createMany({
    data: toInsert.map((t) => ({
      bankAccountId,
      transactionDate: t.transactionDate,
      description: t.description,
      amount: new Prisma.Decimal(t.amount),
      type: t.type as TxnType,
      category: categorizeTransaction(t.description),
    })),
  });

  return { imported: toInsert.length, skipped: parsed.length - toInsert.length };
}

export interface TransactionFilters {
  bankAccountId?: string;
  unmatched?: boolean;
  from?: Date;
  to?: Date;
}

export async function listTransactions(
  ctx: CompanyContext,
  filters: TransactionFilters = {}
) {
  const where: Prisma.BankTransactionWhereInput = {
    bankAccount: { companyId: ctx.companyId },
  };

  if (filters.bankAccountId) where.bankAccountId = filters.bankAccountId;
  if (filters.unmatched) {
    where.matchedExpenseId = null;
    where.matchedInvoiceId = null;
  }
  if (filters.from || filters.to) {
    where.transactionDate = {};
    if (filters.from) where.transactionDate.gte = filters.from;
    if (filters.to) where.transactionDate.lte = filters.to;
  }

  return db.bankTransaction.findMany({
    where,
    include: { bankAccount: true },
    orderBy: { transactionDate: "desc" },
  });
}

export async function matchTransaction(
  ctx: CompanyContext,
  transactionId: string,
  match: { invoiceId?: string; expenseId?: string }
) {
  assertCanWrite(ctx);

  const txn = await db.bankTransaction.findFirst({
    where: {
      id: transactionId,
      bankAccount: { companyId: ctx.companyId },
    },
  });
  if (!txn) throw notFound("Transaction");

  if (!match.invoiceId && !match.expenseId) {
    throw badRequest("Provide invoiceId or expenseId");
  }

  if (match.invoiceId) {
    const invoice = await db.invoice.findFirst({
      where: { id: match.invoiceId, companyId: ctx.companyId },
    });
    if (!invoice) throw notFound("Invoice");
  }

  if (match.expenseId) {
    const expense = await db.expense.findFirst({
      where: { id: match.expenseId, companyId: ctx.companyId },
    });
    if (!expense) throw notFound("Expense");
  }

  return db.bankTransaction.update({
    where: { id: transactionId },
    data: {
      matchedInvoiceId: match.invoiceId ?? null,
      matchedExpenseId: match.expenseId ?? null,
    },
  });
}
