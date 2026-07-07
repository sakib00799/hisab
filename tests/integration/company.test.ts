import { beforeEach, describe, expect, it } from "vitest";
import { PlanType, SubStatus, UserRole } from "@/generated/prisma";
import { createCompanyForUser } from "@/lib/services/company.service";
import { db, hasTestDb, resetDb, uniqueBin } from "./helpers";

describe.skipIf(!hasTestDb)("createCompanyForUser (onboarding)", () => {
  beforeEach(resetDb);

  it("creates company, owner user, FREE subscription, and invoice sequence", async () => {
    const bin = uniqueBin();
    const company = await createCompanyForUser("auth-user-1", "owner@test.local", {
      name: "Rahim Traders",
      binNumber: bin,
      vatType: "STANDARD",
      fiscalYearStart: 7,
    });

    expect(company.name).toBe("Rahim Traders");
    expect(company.binNumber).toBe(bin);

    const user = await db.user.findUnique({ where: { id: "auth-user-1" } });
    expect(user?.companyId).toBe(company.id);
    expect(user?.role).toBe(UserRole.OWNER);

    const sub = await db.subscription.findUnique({
      where: { companyId: company.id },
    });
    expect(sub?.plan).toBe(PlanType.FREE);
    expect(sub?.status).toBe(SubStatus.ACTIVE);

    const seq = await db.invoiceSequence.findUnique({
      where: { companyId: company.id },
    });
    expect(seq?.lastNumber).toBe(0);
  });

  it("normalizes a dashed BIN before storing", async () => {
    const company = await createCompanyForUser("auth-user-2", "a@test.local", {
      name: "Dash Co",
      binNumber: "0001-2345-6789",
      vatType: "STANDARD",
      fiscalYearStart: 7,
    });
    expect(company.binNumber).toBe("000123456789");
  });

  it("creates a bank account when provided during onboarding", async () => {
    const company = await createCompanyForUser("auth-user-3", "b@test.local", {
      name: "Bank Co",
      binNumber: uniqueBin(),
      vatType: "STANDARD",
      fiscalYearStart: 7,
      bankName: "BRAC Bank",
      accountNumber: "1234567890",
    });

    const accounts = await db.bankAccount.findMany({
      where: { companyId: company.id },
    });
    expect(accounts).toHaveLength(1);
    expect(accounts[0].bankName).toBe("BRAC Bank");
  });

  it("rejects a second company for the same user", async () => {
    await createCompanyForUser("auth-user-4", "c@test.local", {
      name: "First Co",
      binNumber: uniqueBin(),
      vatType: "STANDARD",
      fiscalYearStart: 7,
    });

    await expect(
      createCompanyForUser("auth-user-4", "c@test.local", {
        name: "Second Co",
        binNumber: uniqueBin(),
        vatType: "STANDARD",
        fiscalYearStart: 7,
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects a duplicate BIN across companies", async () => {
    const bin = uniqueBin();
    await createCompanyForUser("auth-user-5", "d@test.local", {
      name: "Original Co",
      binNumber: bin,
      vatType: "STANDARD",
      fiscalYearStart: 7,
    });

    await expect(
      createCompanyForUser("auth-user-6", "e@test.local", {
        name: "Copycat Co",
        binNumber: bin,
        vatType: "STANDARD",
        fiscalYearStart: 7,
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
