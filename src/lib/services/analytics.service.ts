import { InvoiceStatus } from "@/generated/prisma";
import { CompanyContext } from "@/lib/auth/company-context";
import { db } from "@/lib/db";
import { getPeriodBounds, getVatDeadline } from "@/lib/vat/constants";
import * as vatService from "@/lib/services/vat.service";

export async function getSummary(ctx: CompanyContext) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { start, end } = getPeriodBounds(year, month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevBounds = getPeriodBounds(prevYear, prevMonth);

  const [
    revenueResult,
    prevRevenueResult,
    expensesResult,
    prevExpensesResult,
    outstanding,
    vatCalc,
  ] = await Promise.all([
    db.invoice.aggregate({
      where: {
        companyId: ctx.companyId,
        invoiceDate: { gte: start, lte: end },
        status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] },
      },
      _sum: { subtotal: true },
    }),
    db.invoice.aggregate({
      where: {
        companyId: ctx.companyId,
        invoiceDate: { gte: prevBounds.start, lte: prevBounds.end },
        status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] },
      },
      _sum: { subtotal: true },
    }),
    db.expense.aggregate({
      where: {
        companyId: ctx.companyId,
        expenseDate: { gte: start, lte: end },
      },
      _sum: { totalAmount: true },
    }),
    db.expense.aggregate({
      where: {
        companyId: ctx.companyId,
        expenseDate: { gte: prevBounds.start, lte: prevBounds.end },
      },
      _sum: { totalAmount: true },
    }),
    db.invoice.aggregate({
      where: {
        companyId: ctx.companyId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
      },
      _sum: { total: true },
      _count: true,
    }),
    vatService.calculateVatPeriod(ctx, year, month),
  ]);

  const revenue = Number(revenueResult._sum.subtotal ?? 0);
  const prevRevenue = Number(prevRevenueResult._sum.subtotal ?? 0);
  const expenses = Number(expensesResult._sum.totalAmount ?? 0);
  const prevExpenses = Number(prevExpensesResult._sum.totalAmount ?? 0);

  const revenueChange =
    prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
  const expensesChange =
    prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  const deadline = getVatDeadline(year, month);

  return {
    totalRevenue: revenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    expensesThisMonth: expenses,
    expensesChange: Math.round(expensesChange * 10) / 10,
    vatOwed: vatCalc.netPayable,
    vatDueDate: deadline.toISOString(),
    outstandingInvoices: Number(outstanding._sum.total ?? 0),
    outstandingCount: outstanding._count,
    periodLabel: now.toLocaleString("en", { month: "long", year: "numeric" }),
  };
}

export async function getMonthlyTrend(ctx: CompanyContext, months = 6) {
  const now = new Date();
  const trend = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { start, end } = getPeriodBounds(
      d.getFullYear(),
      d.getMonth() + 1
    );

    const [revenue, expenses] = await Promise.all([
      db.invoice.aggregate({
        where: {
          companyId: ctx.companyId,
          invoiceDate: { gte: start, lte: end },
          status: { not: InvoiceStatus.CANCELLED },
        },
        _sum: { subtotal: true },
      }),
      db.expense.aggregate({
        where: {
          companyId: ctx.companyId,
          expenseDate: { gte: start, lte: end },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    trend.push({
      month: d.toLocaleString("en", { month: "short" }),
      revenue: Number(revenue._sum.subtotal ?? 0),
      expenses: Number(expenses._sum.totalAmount ?? 0),
    });
  }

  return trend;
}

export async function getProfitAndLoss(
  ctx: CompanyContext,
  from: Date,
  to: Date
) {
  const [revenue, expensesByCategory] = await Promise.all([
    db.invoice.aggregate({
      where: {
        companyId: ctx.companyId,
        invoiceDate: { gte: from, lte: to },
        status: { not: InvoiceStatus.CANCELLED },
      },
      _sum: { subtotal: true },
    }),
    db.expense.groupBy({
      by: ["category"],
      where: {
        companyId: ctx.companyId,
        expenseDate: { gte: from, lte: to },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.subtotal ?? 0);
  const categories = expensesByCategory.map((e) => ({
    category: e.category,
    amount: Number(e._sum.totalAmount ?? 0),
  }));
  const totalExpenses = categories.reduce((s, c) => s + c.amount, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    categories,
  };
}

export async function getRecentInvoices(ctx: CompanyContext, limit = 5) {
  return db.invoice.findMany({
    where: { companyId: ctx.companyId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
