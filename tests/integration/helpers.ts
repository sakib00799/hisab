import { randomUUID } from "node:crypto";
import { PlanType, SubStatus, UserRole } from "@/generated/prisma";
import type { CompanyContext } from "@/lib/auth/company-context";
import { db } from "@/lib/db";

export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

/** Remove all rows between tests. Order does not matter thanks to CASCADE. */
export async function resetDb() {
  await db.$executeRawUnsafe(
    `TRUNCATE TABLE "Company","User","Customer","Supplier","Invoice","InvoiceItem",
     "InvoiceSequence","Expense","BankAccount","BankTransaction","VatPeriod",
     "Subscription","BillingRecord","OcrCache" CASCADE`
  );
}

export function uniqueBin(): string {
  return String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
}

export interface TestTenant {
  ctx: CompanyContext;
  companyId: string;
  customerId: string;
}

/** Create a company + owner user + FREE subscription + a customer. */
export async function createTenant(
  overrides: { role?: UserRole; plan?: PlanType } = {}
): Promise<TestTenant> {
  const userId = randomUUID();
  const email = `${userId}@test.local`;

  const company = await db.company.create({
    data: {
      name: `Test Co ${userId.slice(0, 8)}`,
      binNumber: uniqueBin(),
      users: {
        create: { id: userId, email, role: overrides.role ?? UserRole.OWNER },
      },
      subscription: {
        create: {
          plan: overrides.plan ?? PlanType.FREE,
          status: SubStatus.ACTIVE,
        },
      },
      invoiceSequence: { create: { lastNumber: 0 } },
    },
  });

  const customer = await db.customer.create({
    data: { companyId: company.id, name: "Test Customer" },
  });

  return {
    ctx: {
      userId,
      email,
      companyId: company.id,
      role: overrides.role ?? UserRole.OWNER,
    },
    companyId: company.id,
    customerId: customer.id,
  };
}

export { db };
