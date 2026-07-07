import { describe, expect, it } from "vitest";
import {
  binNumberSchema,
  createCompanySchema,
  normalizeBin,
} from "@/lib/validators/company";
import { createInvoiceSchema, invoiceItemSchema } from "@/lib/validators/invoice";
import { createCustomerSchema } from "@/lib/validators/customer";
import { createExpenseSchema } from "@/lib/validators/expense";

describe("BIN number validation", () => {
  it("accepts exactly 12 digits", () => {
    expect(binNumberSchema.parse("000123456789")).toBe("000123456789");
  });

  it("strips dashes and spaces before validating", () => {
    expect(binNumberSchema.parse("0001-2345-6789")).toBe("000123456789");
    expect(binNumberSchema.parse("0001 2345 6789")).toBe("000123456789");
  });

  it("rejects fewer than 12 digits", () => {
    expect(() => binNumberSchema.parse("12345")).toThrow();
  });

  it("rejects more than 12 digits", () => {
    expect(() => binNumberSchema.parse("1234567890123")).toThrow();
  });

  it("rejects letters", () => {
    expect(() => binNumberSchema.parse("00012345678A")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => binNumberSchema.parse("")).toThrow();
  });

  it("normalizeBin strips separators", () => {
    expect(normalizeBin("000-123 456-789")).toBe("000123456789");
  });
});

describe("createCompanySchema", () => {
  const valid = {
    name: "Rahim Traders",
    binNumber: "000123456789",
  };

  it("accepts minimal valid input with defaults", () => {
    const parsed = createCompanySchema.parse(valid);
    expect(parsed.vatType).toBe("STANDARD");
    expect(parsed.fiscalYearStart).toBe(7);
  });

  it("rejects a missing company name", () => {
    expect(() =>
      createCompanySchema.parse({ ...valid, name: "" })
    ).toThrow();
  });

  it("rejects an invalid vatType", () => {
    expect(() =>
      createCompanySchema.parse({ ...valid, vatType: "MAGIC" })
    ).toThrow();
  });

  it("rejects fiscalYearStart outside 1-12", () => {
    expect(() =>
      createCompanySchema.parse({ ...valid, fiscalYearStart: 13 })
    ).toThrow();
  });
});

describe("invoiceItemSchema", () => {
  const valid = {
    description: "Supply of goods",
    quantity: 10,
    unitPrice: 500,
    vatRate: 15,
  };

  it("accepts a valid item", () => {
    expect(invoiceItemSchema.parse(valid)).toMatchObject(valid);
  });

  it("coerces numeric strings from form input", () => {
    const parsed = invoiceItemSchema.parse({
      ...valid,
      quantity: "2000",
      unitPrice: "500",
      vatRate: "5",
    });
    expect(parsed.quantity).toBe(2000);
    expect(parsed.unitPrice).toBe(500);
    expect(parsed.vatRate).toBe(5);
  });

  it("trims the description and rejects when empty", () => {
    expect(invoiceItemSchema.parse({ ...valid, description: "  x  " }).description).toBe("x");
    expect(() => invoiceItemSchema.parse({ ...valid, description: "   " })).toThrow();
  });

  it("rejects descriptions over 500 characters", () => {
    expect(() =>
      invoiceItemSchema.parse({ ...valid, description: "x".repeat(501) })
    ).toThrow();
  });

  it("rejects zero or negative quantity", () => {
    expect(() => invoiceItemSchema.parse({ ...valid, quantity: 0 })).toThrow();
    expect(() => invoiceItemSchema.parse({ ...valid, quantity: -1 })).toThrow();
  });

  it("rejects negative unit price but allows zero", () => {
    expect(() => invoiceItemSchema.parse({ ...valid, unitPrice: -5 })).toThrow();
    expect(invoiceItemSchema.parse({ ...valid, unitPrice: 0 }).unitPrice).toBe(0);
  });

  it("rejects VAT rates outside 0-100", () => {
    expect(() => invoiceItemSchema.parse({ ...valid, vatRate: -1 })).toThrow();
    expect(() => invoiceItemSchema.parse({ ...valid, vatRate: 101 })).toThrow();
  });
});

describe("createInvoiceSchema", () => {
  const validItem = {
    description: "Goods",
    quantity: 1,
    unitPrice: 100,
    vatRate: 15,
  };

  it("requires a customer", () => {
    expect(() =>
      createInvoiceSchema.parse({
        customerId: "",
        invoiceDate: "2026-07-01",
        items: [validItem],
      })
    ).toThrow();
  });

  it("requires at least one line item", () => {
    expect(() =>
      createInvoiceSchema.parse({
        customerId: "c1",
        invoiceDate: "2026-07-01",
        items: [],
      })
    ).toThrow();
  });

  it("accepts a complete invoice", () => {
    const parsed = createInvoiceSchema.parse({
      customerId: "c1",
      invoiceDate: "2026-07-01",
      dueDate: "2026-07-31",
      items: [validItem],
    });
    expect(parsed.items).toHaveLength(1);
  });
});

describe("createCustomerSchema", () => {
  it("requires a name", () => {
    expect(() => createCustomerSchema.parse({ name: "" })).toThrow();
  });

  it("allows an empty-string email (form default)", () => {
    expect(
      createCustomerSchema.parse({ name: "Karim", email: "" }).email
    ).toBe("");
  });

  it("rejects a malformed email", () => {
    expect(() =>
      createCustomerSchema.parse({ name: "Karim", email: "not-an-email" })
    ).toThrow();
  });
});

describe("createExpenseSchema", () => {
  const valid = {
    category: "RENT",
    amount: 5000,
    expenseDate: "2026-07-01",
  };

  it("defaults vatAmount to 0", () => {
    expect(createExpenseSchema.parse(valid).vatAmount).toBe(0);
  });

  it("rejects unknown categories", () => {
    expect(() =>
      createExpenseSchema.parse({ ...valid, category: "GIFTS" })
    ).toThrow();
  });

  it("rejects negative amounts", () => {
    expect(() =>
      createExpenseSchema.parse({ ...valid, amount: -1 })
    ).toThrow();
  });
});
