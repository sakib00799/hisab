import {
  InvoiceStatus,
  PlanType,
  Prisma,
} from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { getCompanyPlan } from "@/lib/auth/plan-gate";
import { db } from "@/lib/db";
import { badRequest, notFound, upgradeRequired } from "@/lib/errors";
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@/lib/validators/invoice";
import { computeLineItem } from "@/lib/vat/constants";

const FREE_INVOICE_LIMIT = 30;

function buildItems(items: CreateInvoiceInput["items"]) {
  return items.map((item) => {
    const { vatAmount, lineTotal } = computeLineItem(
      item.quantity,
      item.unitPrice,
      item.vatRate
    );
    const subtotal = item.quantity * item.unitPrice;
    return {
      description: item.description,
      quantity: new Prisma.Decimal(item.quantity),
      unitPrice: new Prisma.Decimal(item.unitPrice),
      vatRate: new Prisma.Decimal(item.vatRate),
      vatAmount: new Prisma.Decimal(vatAmount),
      lineTotal: new Prisma.Decimal(lineTotal),
      subtotal,
      vatAmountNum: vatAmount,
    };
  });
}

function toInvoiceItemCreate(
  item: ReturnType<typeof buildItems>[number]
) {
  return {
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    vatRate: item.vatRate,
    vatAmount: item.vatAmount,
    lineTotal: item.lineTotal,
  };
}

function sumTotals(lineItems: ReturnType<typeof buildItems>) {
  const subtotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const vatTotal = lineItems.reduce((s, i) => s + i.vatAmountNum, 0);
  const total = subtotal + vatTotal;
  return {
    subtotal: new Prisma.Decimal(Math.round(subtotal * 100) / 100),
    vatTotal: new Prisma.Decimal(Math.round(vatTotal * 100) / 100),
    total: new Prisma.Decimal(Math.round(total * 100) / 100),
  };
}

async function getNextInvoiceNumber(
  tx: Prisma.TransactionClient,
  companyId: string
): Promise<string> {
  const seq = await tx.invoiceSequence.upsert({
    where: { companyId },
    create: { companyId, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  const num = String(seq.lastNumber).padStart(4, "0");
  return `INV-${num}`;
}

async function assertInvoiceLimit(companyId: string) {
  const plan = await getCompanyPlan(companyId);
  if (plan !== PlanType.FREE) return;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const count = await db.invoice.count({
    where: {
      companyId,
      createdAt: { gte: start, lte: end },
      status: { not: InvoiceStatus.CANCELLED },
    },
  });

  if (count >= FREE_INVOICE_LIMIT) {
    throw upgradeRequired();
  }
}

export interface InvoiceListFilters {
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export async function listInvoices(
  ctx: CompanyContext,
  filters: InvoiceListFilters = {}
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const where: Prisma.InvoiceWhereInput = { companyId: ctx.companyId };

  if (filters.status) where.status = filters.status;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.from || filters.to) {
    where.invoiceDate = {};
    if (filters.from) where.invoiceDate.gte = filters.from;
    if (filters.to) where.invoiceDate.lte = filters.to;
  }
  if (filters.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
      { customer: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [data, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { invoiceDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  return { data, meta: { total, page, limit } };
}

export async function getInvoice(ctx: CompanyContext, id: string) {
  const invoice = await db.invoice.findFirst({
    where: { id, companyId: ctx.companyId },
    include: { customer: true, items: true, company: true },
  });
  if (!invoice) throw notFound("Invoice");
  return invoice;
}

export async function getNextNumberPreview(ctx: CompanyContext) {
  const seq = await db.invoiceSequence.findUnique({
    where: { companyId: ctx.companyId },
  });
  const next = (seq?.lastNumber ?? 0) + 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

export async function createInvoice(
  ctx: CompanyContext,
  input: CreateInvoiceInput
) {
  assertCanWrite(ctx);
  await assertInvoiceLimit(ctx.companyId);

  const customer = await db.customer.findFirst({
    where: { id: input.customerId, companyId: ctx.companyId },
  });
  if (!customer) throw notFound("Customer");

  const lineItems = buildItems(input.items);
  const totals = sumTotals(lineItems);

  return db.$transaction(async (tx) => {
    const invoiceNumber = await getNextInvoiceNumber(tx, ctx.companyId);

    return tx.invoice.create({
      data: {
        companyId: ctx.companyId,
        customerId: input.customerId,
        invoiceNumber,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes,
        subtotal: totals.subtotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
        items: {
          create: lineItems.map(toInvoiceItemCreate),
        },
      },
      include: { customer: true, items: true },
    });
  });
}

export async function updateInvoice(
  ctx: CompanyContext,
  id: string,
  input: UpdateInvoiceInput
) {
  assertCanWrite(ctx);
  const existing = await getInvoice(ctx, id);
  if (existing.status !== InvoiceStatus.DRAFT) {
    throw badRequest("Only draft invoices can be edited");
  }

  const data: Prisma.InvoiceUpdateInput = {};
  if (input.invoiceDate) data.invoiceDate = new Date(input.invoiceDate);
  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.customerId) data.customer = { connect: { id: input.customerId } };

  if (input.items) {
    const lineItems = buildItems(input.items);
    const totals = sumTotals(lineItems);
    data.subtotal = totals.subtotal;
    data.vatTotal = totals.vatTotal;
    data.total = totals.total;
    data.items = {
      deleteMany: {},
      create: lineItems.map(toInvoiceItemCreate),
    };
  }

  return db.invoice.update({
    where: { id },
    data,
    include: { customer: true, items: true },
  });
}

export async function deleteInvoice(ctx: CompanyContext, id: string) {
  assertCanWrite(ctx);
  const existing = await getInvoice(ctx, id);
  if (existing.status !== InvoiceStatus.DRAFT) {
    throw badRequest("Only draft invoices can be deleted");
  }
  return db.invoice.delete({ where: { id } });
}

export async function markInvoiceSent(ctx: CompanyContext, id: string) {
  assertCanWrite(ctx);
  const invoice = await getInvoice(ctx, id);
  if (invoice.status !== InvoiceStatus.DRAFT) {
    throw badRequest("Invoice is not in draft status");
  }
  return db.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.SENT },
    include: { customer: true, items: true },
  });
}

export async function markInvoicePaid(
  ctx: CompanyContext,
  id: string,
  paidAt?: string
) {
  assertCanWrite(ctx);
  const invoice = await getInvoice(ctx, id);
  if (invoice.status === InvoiceStatus.CANCELLED) {
    throw badRequest("Cannot mark cancelled invoice as paid");
  }
  return db.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
    include: { customer: true, items: true },
  });
}

export function generateInvoiceHtml(invoice: Awaited<ReturnType<typeof getInvoice>>) {
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align:right">${item.quantity}</td>
        <td style="text-align:right">${Number(item.unitPrice).toLocaleString()}</td>
        <td style="text-align:right">${Number(item.vatRate)}%</td>
        <td style="text-align:right">${Number(item.vatAmount).toLocaleString()}</td>
        <td style="text-align:right">${Number(item.lineTotal).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
    h1 { color: #1a365d; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
    th { background: #f7fafc; }
    .totals { margin-top: 24px; text-align: right; }
  </style>
</head>
<body>
  <h1>${invoice.company.name}</h1>
  <p>BIN: ${invoice.company.binNumber}</p>
  <p>${invoice.company.address ?? ""}</p>
  <hr>
  <h2>Tax Invoice (Mushak 6.3)</h2>
  <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
  <p><strong>Date:</strong> ${invoice.invoiceDate.toLocaleDateString()}</p>
  <p><strong>Customer:</strong> ${invoice.customer.name}</p>
  ${invoice.customer.binNumber ? `<p><strong>Customer BIN:</strong> ${invoice.customer.binNumber}</p>` : ""}
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>VAT Rate</th>
        <th>VAT</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <p>Subtotal: BDT ${Number(invoice.subtotal).toLocaleString()}</p>
    <p>VAT Total: BDT ${Number(invoice.vatTotal).toLocaleString()}</p>
    <p><strong>Grand Total: BDT ${Number(invoice.total).toLocaleString()}</strong></p>
  </div>
</body>
</html>`;
}
