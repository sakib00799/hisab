import { Prisma } from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { db } from "@/lib/db";
import { notFound } from "@/lib/errors";
import {
  CreateExpenseInput,
  CreateSupplierInput,
  UpdateExpenseInput,
} from "@/lib/validators/expense";

export async function listSuppliers(ctx: CompanyContext) {
  return db.supplier.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(
  ctx: CompanyContext,
  input: CreateSupplierInput
) {
  assertCanWrite(ctx);
  return db.supplier.create({
    data: {
      companyId: ctx.companyId,
      name: input.name,
      binNumber: input.binNumber,
      contact: input.contact,
      email: input.email || null,
    },
  });
}

export async function updateSupplier(
  ctx: CompanyContext,
  id: string,
  input: Partial<CreateSupplierInput>
) {
  assertCanWrite(ctx);
  const supplier = await db.supplier.findFirst({
    where: { id, companyId: ctx.companyId },
  });
  if (!supplier) throw notFound("Supplier");
  return db.supplier.update({ where: { id }, data: input });
}

export interface ExpenseListFilters {
  category?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export async function listExpenses(
  ctx: CompanyContext,
  filters: ExpenseListFilters = {}
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const where: Prisma.ExpenseWhereInput = { companyId: ctx.companyId };

  if (filters.category) {
    where.category = filters.category as Prisma.EnumExpenseCategoryFilter["equals"];
  }
  if (filters.from || filters.to) {
    where.expenseDate = {};
    if (filters.from) where.expenseDate.gte = filters.from;
    if (filters.to) where.expenseDate.lte = filters.to;
  }

  const [data, total] = await Promise.all([
    db.expense.findMany({
      where,
      include: { supplier: true },
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.expense.count({ where }),
  ]);

  return { data, meta: { total, page, limit } };
}

export async function getExpense(ctx: CompanyContext, id: string) {
  const expense = await db.expense.findFirst({
    where: { id, companyId: ctx.companyId },
    include: { supplier: true },
  });
  if (!expense) throw notFound("Expense");
  return expense;
}

export async function createExpense(
  ctx: CompanyContext,
  input: CreateExpenseInput
) {
  assertCanWrite(ctx);
  const totalAmount = input.amount + input.vatAmount;

  return db.expense.create({
    data: {
      companyId: ctx.companyId,
      supplierId: input.supplierId,
      category: input.category,
      description: input.description,
      amount: new Prisma.Decimal(input.amount),
      vatAmount: new Prisma.Decimal(input.vatAmount),
      totalAmount: new Prisma.Decimal(totalAmount),
      expenseDate: new Date(input.expenseDate),
      receiptUrl: input.receiptUrl,
    },
    include: { supplier: true },
  });
}

export async function updateExpense(
  ctx: CompanyContext,
  id: string,
  input: UpdateExpenseInput
) {
  assertCanWrite(ctx);
  await getExpense(ctx, id);

  const amount = input.amount;
  const data: Prisma.ExpenseUpdateInput = { ...input };

  if (input.expenseDate) {
    data.expenseDate = new Date(input.expenseDate);
  }
  if (amount !== undefined) {
    data.amount = new Prisma.Decimal(amount);
    data.totalAmount = new Prisma.Decimal(amount + (input.vatAmount ?? 0));
  }
  if (input.vatAmount !== undefined) {
    data.vatAmount = new Prisma.Decimal(input.vatAmount);
  }

  return db.expense.update({
    where: { id },
    data,
    include: { supplier: true },
  });
}

export async function deleteExpense(ctx: CompanyContext, id: string) {
  assertCanWrite(ctx);
  await getExpense(ctx, id);
  return db.expense.delete({ where: { id } });
}
