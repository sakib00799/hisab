import { beforeEach, describe, expect, it } from "vitest";
import { InvoiceStatus } from "@/generated/prisma";
import { createInvoice } from "@/lib/services/invoice.service";
import { createTenant, db, hasTestDb, resetDb } from "./helpers";

const item = (overrides: Partial<{ description: string; quantity: number; unitPrice: number; vatRate: number }> = {}) => ({
  description: "Supply of goods",
  quantity: 10,
  unitPrice: 1000,
  vatRate: 15,
  ...overrides,
});

describe.skipIf(!hasTestDb)("createInvoice", () => {
  beforeEach(resetDb);

  it("computes subtotal, VAT, and total correctly", async () => {
    const { ctx, customerId } = await createTenant();

    const invoice = await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-01",
      items: [item({ quantity: 2000, unitPrice: 500, vatRate: 5 })],
    });

    expect(Number(invoice.subtotal)).toBe(1_000_000);
    expect(Number(invoice.vatTotal)).toBe(50_000);
    expect(Number(invoice.total)).toBe(1_050_000);
    expect(invoice.items).toHaveLength(1);
  });

  it("sums multiple line items with mixed VAT rates", async () => {
    const { ctx, customerId } = await createTenant();

    const invoice = await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-01",
      items: [
        item({ quantity: 1, unitPrice: 1000, vatRate: 15 }), // VAT 150
        item({ quantity: 2, unitPrice: 500, vatRate: 0 }), // VAT 0
      ],
    });

    expect(Number(invoice.subtotal)).toBe(2000);
    expect(Number(invoice.vatTotal)).toBe(150);
    expect(Number(invoice.total)).toBe(2150);
  });

  it("assigns sequential invoice numbers", async () => {
    const { ctx, customerId } = await createTenant();

    const first = await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-01",
      items: [item()],
    });
    const second = await createInvoice(ctx, {
      customerId,
      invoiceDate: "2026-07-02",
      items: [item()],
    });

    expect(first.invoiceNumber).toBe("INV-0001");
    expect(second.invoiceNumber).toBe("INV-0002");
  });

  it("never duplicates numbers under concurrent creation", async () => {
    const { ctx, customerId } = await createTenant();

    const invoices = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        createInvoice(ctx, {
          customerId,
          invoiceDate: "2026-07-01",
          items: [item({ quantity: i + 1 })],
        })
      )
    );

    const numbers = invoices.map((i) => i.invoiceNumber);
    expect(new Set(numbers).size).toBe(5);
  });

  it("keeps sequences independent per company", async () => {
    const a = await createTenant();
    const b = await createTenant();

    const invA = await createInvoice(a.ctx, {
      customerId: a.customerId,
      invoiceDate: "2026-07-01",
      items: [item()],
    });
    const invB = await createInvoice(b.ctx, {
      customerId: b.customerId,
      invoiceDate: "2026-07-01",
      items: [item()],
    });

    expect(invA.invoiceNumber).toBe("INV-0001");
    expect(invB.invoiceNumber).toBe("INV-0001");
  });

  it("rejects another company's customer", async () => {
    const a = await createTenant();
    const b = await createTenant();

    await expect(
      createInvoice(a.ctx, {
        customerId: b.customerId,
        invoiceDate: "2026-07-01",
        items: [item()],
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("enforces the FREE plan monthly invoice limit (30)", async () => {
    const { ctx, companyId, customerId } = await createTenant();

    // Seed 30 invoices this month directly (bypassing the service for speed).
    await db.invoice.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        companyId,
        customerId,
        invoiceNumber: `SEED-${String(i + 1).padStart(4, "0")}`,
        invoiceDate: new Date(),
        status: InvoiceStatus.SENT,
        subtotal: 100,
        vatTotal: 15,
        total: 115,
      })),
    });

    await expect(
      createInvoice(ctx, {
        customerId,
        invoiceDate: new Date().toISOString().split("T")[0],
        items: [item()],
      })
    ).rejects.toMatchObject({ code: "UPGRADE_REQUIRED" });
  });
});
