import { describe, expect, it } from "vitest";
import { PlanType } from "@/generated/prisma";
import { hasPlan } from "@/lib/auth/plan-gate";

describe("hasPlan", () => {
  it("FREE satisfies only FREE", () => {
    expect(hasPlan(PlanType.FREE, PlanType.FREE)).toBe(true);
    expect(hasPlan(PlanType.FREE, PlanType.BUSINESS)).toBe(false);
    expect(hasPlan(PlanType.FREE, PlanType.PRO)).toBe(false);
    expect(hasPlan(PlanType.FREE, PlanType.ACCOUNTANT_PACK)).toBe(false);
  });

  it("BUSINESS satisfies FREE and BUSINESS but not PRO", () => {
    expect(hasPlan(PlanType.BUSINESS, PlanType.FREE)).toBe(true);
    expect(hasPlan(PlanType.BUSINESS, PlanType.BUSINESS)).toBe(true);
    expect(hasPlan(PlanType.BUSINESS, PlanType.PRO)).toBe(false);
  });

  it("PRO satisfies BUSINESS (Mushak export) and OCR gate", () => {
    expect(hasPlan(PlanType.PRO, PlanType.BUSINESS)).toBe(true);
    expect(hasPlan(PlanType.PRO, PlanType.PRO)).toBe(true);
    expect(hasPlan(PlanType.PRO, PlanType.ACCOUNTANT_PACK)).toBe(false);
  });

  it("ACCOUNTANT_PACK is the highest tier", () => {
    expect(hasPlan(PlanType.ACCOUNTANT_PACK, PlanType.FREE)).toBe(true);
    expect(hasPlan(PlanType.ACCOUNTANT_PACK, PlanType.BUSINESS)).toBe(true);
    expect(hasPlan(PlanType.ACCOUNTANT_PACK, PlanType.PRO)).toBe(true);
    expect(hasPlan(PlanType.ACCOUNTANT_PACK, PlanType.ACCOUNTANT_PACK)).toBe(true);
  });
});
