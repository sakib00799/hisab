import { beforeEach, describe, expect, it } from "vitest";
import { UserRole } from "@/generated/prisma";
import { getCustomer, listCustomers } from "@/lib/services/customer.service";
import {
  createInvoice,
  getInvoice,
  listInvoices,
} from "@/lib/services/invoice.service";
import { createTenant, hasTestDb, resetDb } from "./helpers";

describe.skipIf(!hasTestDb)("tenant isolation", () => {
  beforeEach(resetDb);

  it("prevents reading another company's invoice by ID", async () => {
    const a = await createTenant();
    const b = await createTenant();

    const invoice = await createInvoice(b.ctx, {
      customerId: b.customerId,
      invoiceDate: "2026-07-01",
      items: [{ description: "Secret", quantity: 1, unitPrice: 100, vatRate: 15 }],
    });

    await expect(getInvoice(a.ctx, invoice.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    // The owner can still read it.
    await expect(getInvoice(b.ctx, invoice.id)).resolves.toMatchObject({
      id: invoice.id,
    });
  });

  it("lists only the caller's invoices", async () => {
    const a = await createTenant();
    const b = await createTenant();

    await createInvoice(a.ctx, {
      customerId: a.customerId,
      invoiceDate: "2026-07-01",
      items: [{ description: "A1", quantity: 1, unitPrice: 100, vatRate: 15 }],
    });
    await createInvoice(b.ctx, {
      customerId: b.customerId,
      invoiceDate: "2026-07-01",
      items: [{ description: "B1", quantity: 1, unitPrice: 100, vatRate: 15 }],
    });

    const listA = await listInvoices(a.ctx);
    expect(listA.data).toHaveLength(1);
    expect(listA.data[0].items[0].description).toBe("A1");
  });

  it("prevents reading another company's customer", async () => {
    const a = await createTenant();
    const b = await createTenant();

    await expect(getCustomer(a.ctx, b.customerId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });

    const customersA = await listCustomers(a.ctx);
    expect(customersA.map((c) => c.id)).not.toContain(b.customerId);
  });

  it("blocks VIEWER role from write operations", async () => {
    const viewer = await createTenant({ role: UserRole.VIEWER });

    await expect(
      createInvoice(viewer.ctx, {
        customerId: viewer.customerId,
        invoiceDate: "2026-07-01",
        items: [{ description: "X", quantity: 1, unitPrice: 100, vatRate: 15 }],
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
