import { describe, expect, it } from "vitest";
import {
  ALLOWED_VAT_RATES,
  VAT_RATES,
  computeLineItem,
  getPeriodBounds,
  getVatDeadline,
} from "@/lib/vat/constants";

describe("computeLineItem", () => {
  it("computes standard 15% VAT", () => {
    const r = computeLineItem(10, 100, 15);
    expect(r.subtotal).toBe(1000);
    expect(r.vatAmount).toBe(150);
    expect(r.lineTotal).toBe(1150);
  });

  it("computes the invoice-form example (2000 × 500 @ 5%)", () => {
    const r = computeLineItem(2000, 500, 5);
    expect(r.subtotal).toBe(1_000_000);
    expect(r.vatAmount).toBe(50_000);
    expect(r.lineTotal).toBe(1_050_000);
  });

  it("rounds VAT to 2 decimal places (7.5% truncated rate)", () => {
    const r = computeLineItem(1, 33.33, 7.5);
    expect(r.vatAmount).toBe(2.5); // 2.49975 → 2.5
    expect(r.lineTotal).toBe(35.83);
  });

  it("handles zero-rated items", () => {
    const r = computeLineItem(5, 200, 0);
    expect(r.subtotal).toBe(1000);
    expect(r.vatAmount).toBe(0);
    expect(r.lineTotal).toBe(1000);
  });

  it("handles fractional quantities", () => {
    const r = computeLineItem(2.5, 100, 15);
    expect(r.subtotal).toBe(250);
    expect(r.vatAmount).toBe(37.5);
    expect(r.lineTotal).toBe(287.5);
  });

  it("handles zero quantity and zero price", () => {
    expect(computeLineItem(0, 100, 15).lineTotal).toBe(0);
    expect(computeLineItem(10, 0, 15).lineTotal).toBe(0);
  });
});

describe("getVatDeadline", () => {
  it("is the 27th of the following month", () => {
    const d = getVatDeadline(2026, 6);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // July (0-indexed)
    expect(d.getDate()).toBe(27);
  });

  it("rolls over December into January of the next year", () => {
    const d = getVatDeadline(2025, 12);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0); // January
    expect(d.getDate()).toBe(27);
  });
});

describe("getPeriodBounds", () => {
  it("covers the entire month", () => {
    const { start, end } = getPeriodBounds(2026, 7);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(6);
    expect(start.getHours()).toBe(0);
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(6);
    expect(end.getHours()).toBe(23);
  });

  it("handles February in a non-leap year", () => {
    const { end } = getPeriodBounds(2026, 2);
    expect(end.getDate()).toBe(28);
  });

  it("handles February in a leap year", () => {
    const { end } = getPeriodBounds(2024, 2);
    expect(end.getDate()).toBe(29);
  });

  it("handles December", () => {
    const { start, end } = getPeriodBounds(2026, 12);
    expect(start.getMonth()).toBe(11);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe("VAT rate constants", () => {
  it("standard rate is 15% per NBR", () => {
    expect(VAT_RATES.STANDARD).toBe(15);
  });

  it("allowed rates match NBR-published rates", () => {
    expect([...ALLOWED_VAT_RATES]).toEqual([0, 4, 5, 7.5, 10, 15]);
  });
});
