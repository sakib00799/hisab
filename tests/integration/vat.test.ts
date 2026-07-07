import { beforeEach, describe, expect, it } from "vitest";
import { ExpenseCategory, InvoiceStatus, PlanType } from "@/generated/prisma";
import { createInvoice } from "@/lib/services/invoice.service";
import {
  calculateVatPeriod,
  generateMushak91Html,
} from "@/lib/services/vat.service";
import { createTenant, db, hasTestDb, resetDb } from "./helpers";

describe.skipIf(!hasTestDb)("calculateVatPeriod", () => {
  beforeEach(resetDb);

  it("computes output, input, and net VAT from seeded documents", async () => {
    const { ctx, companyId, customerId } = await createTenant();

    // Output: two invoices in July 2026 (VAT 150 + 300).
    await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-05",
      items: [{ description: "A", quantity: 1, unitPrice: 1000, vatRate: 15 }],
    });
    await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-20",
      items: [{ description: "B", quantity: 2, unitPrice: 1000, vatRate: 15 }],
    });

    // Input: one expense with VAT 100.
    await db.expense.create({
      data: {
        companyId,
        category: ExpenseCategory.COST_OF_GOODS,
        amount: 2000,
        vatAmount: 100,
        totalAmount: 2100,
        expenseDate: new Date(2026, 6, 10),
      },
    });

    const calc = await calculateVatPeriod(ctx, 2026, 7);
    expect(calc.outputVat).toBe(450);
    expect(calc.inputVat).toBe(100);
    expect(calc.netPayable).toBe(350);
    expect(calc.outputRegister).toHaveLength(2);
    expect(calc.inputRegister).toHaveLength(1);
  });

  it("excludes cancelled invoices and documents outside the period", async () => {
    const { ctx, companyId, customerId } = await createTenant();

    // In-period, but cancelled → excluded.
    await db.invoice.create({
      data: {
        companyId,
        customerId,
        invoiceNumber: "CANCELLED-1",
        invoiceDate: new Date(2026, 6, 10),
        status: InvoiceStatus.CANCELLED,
        subtotal: 1000,
        vatTotal: 150,
        total: 1150,
      },
    });
    // Previous month → excluded.
    await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-06-30",
      items: [{ description: "June", quantity: 1, unitPrice: 1000, vatRate: 15 }],
    });

    const calc = await calculateVatPeriod(ctx, 2026, 7);
    expect(calc.outputVat).toBe(0);
    expect(calc.outputRegister).toHaveLength(0);
  });

  it("reports negative net payable as input credit", async () => {
    const { ctx, companyId } = await createTenant();

    await db.expense.create({
      data: {
        companyId,
        category: ExpenseCategory.COST_OF_GOODS,
        amount: 10000,
        vatAmount: 1500,
        totalAmount: 11500,
        expenseDate: new Date(2026, 6, 15),
      },
    });

    const calc = await calculateVatPeriod(ctx, 2026, 7);
    expect(calc.netPayable).toBe(-1500);
  });

  it("rejects an invalid month", async () => {
    const { ctx } = await createTenant();
    await expect(calculateVatPeriod(ctx, 2026, 13)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});

describe.skipIf(!hasTestDb)("Mushak 9.1 plan gating", () => {
  beforeEach(resetDb);

  it("blocks FREE plan companies from generating the export", async () => {
    const { ctx } = await createTenant({ plan: PlanType.FREE });
    await expect(generateMushak91Html(ctx, 2026, 7)).rejects.toMatchObject({
      code: "UPGRADE_REQUIRED",
    });
  });

  it("allows BUSINESS plan companies to generate the export", async () => {
    const { ctx } = await createTenant({ plan: PlanType.BUSINESS });
    const html = await generateMushak91Html(ctx, 2026, 7);
    expect(html).toContain("Mushak 9.1");
  });
});
