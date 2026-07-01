import { InvoiceStatus, Prisma, VatStatus } from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { requirePlan } from "@/lib/auth/plan-gate";
import { db } from "@/lib/db";
import { badRequest } from "@/lib/errors";
import { getPeriodBounds, getVatDeadline } from "@/lib/vat/constants";
import { PlanType } from "@/generated/prisma";

async function sumOutputVat(
  companyId: string,
  start: Date,
  end: Date
): Promise<number> {
  const result = await db.invoice.aggregate({
    where: {
      companyId,
      invoiceDate: { gte: start, lte: end },
      status: { not: InvoiceStatus.CANCELLED },
    },
    _sum: { vatTotal: true },
  });
  return Number(result._sum.vatTotal ?? 0);
}

async function sumInputVat(
  companyId: string,
  start: Date,
  end: Date
): Promise<number> {
  const result = await db.expense.aggregate({
    where: {
      companyId,
      expenseDate: { gte: start, lte: end },
    },
    _sum: { vatAmount: true },
  });
  return Number(result._sum.vatAmount ?? 0);
}

export async function calculateVatPeriod(
  ctx: CompanyContext,
  year: number,
  month: number
) {
  if (month < 1 || month > 12) throw badRequest("Invalid month");

  const { start, end } = getPeriodBounds(year, month);
  const [outputVat, inputVat, outputRegister, inputRegister, filedPeriod] =
    await Promise.all([
      sumOutputVat(ctx.companyId, start, end),
      sumInputVat(ctx.companyId, start, end),
      db.invoice.findMany({
        where: {
          companyId: ctx.companyId,
          invoiceDate: { gte: start, lte: end },
          status: { not: InvoiceStatus.CANCELLED },
        },
        include: { customer: true },
        orderBy: { invoiceDate: "asc" },
      }),
      db.expense.findMany({
        where: {
          companyId: ctx.companyId,
          expenseDate: { gte: start, lte: end },
        },
        include: { supplier: true },
        orderBy: { expenseDate: "asc" },
      }),
      db.vatPeriod.findUnique({
        where: {
          companyId_periodYear_periodMonth: {
            companyId: ctx.companyId,
            periodYear: year,
            periodMonth: month,
          },
        },
      }),
    ]);

  const netPayable = outputVat - inputVat;
  const deadline = getVatDeadline(year, month);

  return {
    periodYear: year,
    periodMonth: month,
    outputVat,
    inputVat,
    netPayable,
    deadline,
    status: filedPeriod?.status ?? VatStatus.DRAFT,
    filedAt: filedPeriod?.filedAt,
    challanRef: filedPeriod?.challanRef,
    outputRegister,
    inputRegister,
  };
}

export async function fileVatPeriod(
  ctx: CompanyContext,
  year: number,
  month: number,
  challanRef?: string
) {
  assertCanWrite(ctx);
  const calc = await calculateVatPeriod(ctx, year, month);

  return db.vatPeriod.upsert({
    where: {
      companyId_periodYear_periodMonth: {
        companyId: ctx.companyId,
        periodYear: year,
        periodMonth: month,
      },
    },
    create: {
      companyId: ctx.companyId,
      periodYear: year,
      periodMonth: month,
      outputVat: new Prisma.Decimal(calc.outputVat),
      inputVat: new Prisma.Decimal(calc.inputVat),
      netPayable: new Prisma.Decimal(calc.netPayable),
      status: VatStatus.FILED,
      filedAt: new Date(),
      challanRef,
    },
    update: {
      outputVat: new Prisma.Decimal(calc.outputVat),
      inputVat: new Prisma.Decimal(calc.inputVat),
      netPayable: new Prisma.Decimal(calc.netPayable),
      status: VatStatus.FILED,
      filedAt: new Date(),
      challanRef,
    },
  });
}

export async function getVatHistory(ctx: CompanyContext) {
  return db.vatPeriod.findMany({
    where: { companyId: ctx.companyId },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });
}

export async function generateMushak91Html(
  ctx: CompanyContext,
  year: number,
  month: number
) {
  await requirePlan(ctx.companyId, PlanType.BUSINESS);
  const calc = await calculateVatPeriod(ctx, year, month);
  const company = await db.company.findUnique({
    where: { id: ctx.companyId },
  });

  const monthName = new Date(year, month - 1).toLocaleString("en", {
    month: "long",
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #1a365d; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
    th { background: #edf2f7; }
  </style>
</head>
<body>
  <h1>Mushak 9.1 — VAT Return</h1>
  <p><strong>Company:</strong> ${company?.name}</p>
  <p><strong>BIN:</strong> ${company?.binNumber}</p>
  <p><strong>Period:</strong> ${monthName} ${year}</p>
  <hr>
  <p><strong>Output VAT (Sales):</strong> BDT ${calc.outputVat.toLocaleString()}</p>
  <p><strong>Input VAT (Purchases):</strong> BDT ${calc.inputVat.toLocaleString()}</p>
  <p><strong>Net VAT Payable:</strong> BDT ${calc.netPayable.toLocaleString()}</p>
  <p><strong>Filing Deadline:</strong> ${calc.deadline.toLocaleDateString()}</p>
  <h3>Output Register</h3>
  <table>
    <tr><th>Invoice</th><th>Customer</th><th>Date</th><th>VAT</th></tr>
    ${calc.outputRegister
      .map(
        (i) =>
          `<tr><td>${i.invoiceNumber}</td><td>${i.customer.name}</td><td>${i.invoiceDate.toLocaleDateString()}</td><td>${Number(i.vatTotal).toLocaleString()}</td></tr>`
      )
      .join("")}
  </table>
  <h3>Input Register</h3>
  <table>
    <tr><th>Description</th><th>Supplier</th><th>Date</th><th>VAT</th></tr>
    ${calc.inputRegister
      .map(
        (e) =>
          `<tr><td>${e.description ?? e.category}</td><td>${e.supplier?.name ?? "—"}</td><td>${e.expenseDate.toLocaleDateString()}</td><td>${Number(e.vatAmount).toLocaleString()}</td></tr>`
      )
      .join("")}
  </table>
</body>
</html>`;
}

export async function getMonthlyVatBreakdown(
  ctx: CompanyContext,
  months = 6
) {
  const now = new Date();
  const breakdown = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const calc = await calculateVatPeriod(ctx, year, month);
    breakdown.push({
      month: d.toLocaleString("en", { month: "short" }),
      year,
      monthNum: month,
      output: calc.outputVat,
      input: calc.inputVat,
      net: calc.netPayable,
    });
  }

  return breakdown;
}
