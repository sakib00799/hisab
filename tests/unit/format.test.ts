import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate } from "@/lib/format";

describe("formatCurrency", () => {
  it("includes all digits of the amount", () => {
    expect(formatCurrency(1_000_000).replace(/\D/g, "")).toBe("1000000");
  });

  it("rounds to whole BDT", () => {
    expect(formatCurrency(99.6).replace(/\D/g, "")).toBe("100");
  });

  it("handles zero", () => {
    expect(formatCurrency(0).replace(/\D/g, "")).toBe("0");
  });
});

describe("formatDate", () => {
  it("formats ISO strings as day month year", () => {
    expect(formatDate("2026-07-27")).toBe("27 Jul 2026");
  });

  it("accepts Date objects", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("5 Jan 2026");
  });
});
