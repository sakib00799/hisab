import {
  PlanType,
  SubStatus,
  UserRole,
  VatType,
} from "@/generated/prisma";
import { CompanyContext } from "@/lib/auth/company-context";
import { db } from "@/lib/db";
import { conflict, notFound } from "@/lib/errors";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  normalizeBin,
} from "@/lib/validators/company";
import { requireAuth } from "@/lib/auth/session";

export async function createCompanyForUser(
  authUserId: string,
  email: string,
  input: CreateCompanyInput
) {
  const existingUser = await db.user.findUnique({ where: { id: authUserId } });
  if (existingUser) {
    throw conflict("User already has a company");
  }

  const binNumber = normalizeBin(input.binNumber);

  const existingBin = await db.company.findUnique({ where: { binNumber } });
  if (existingBin) {
    throw conflict("A company with this BIN already exists");
  }

  return db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.name,
        binNumber,
        tinNumber: input.tinNumber,
        vatType: input.vatType as VatType,
        businessCategory: input.businessCategory,
        address: input.address,
        fiscalYearStart: input.fiscalYearStart,
      },
    });

    await tx.user.create({
      data: {
        id: authUserId,
        email,
        role: UserRole.OWNER,
        companyId: company.id,
      },
    });

    await tx.subscription.create({
      data: {
        companyId: company.id,
        plan: PlanType.FREE,
        status: SubStatus.ACTIVE,
      },
    });

    await tx.invoiceSequence.create({
      data: { companyId: company.id, lastNumber: 0 },
    });

    if (input.bankName && input.accountNumber) {
      await tx.bankAccount.create({
        data: {
          companyId: company.id,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
        },
      });
    }

    return company;
  });
}

export async function getCompany(ctx: CompanyContext) {
  const company = await db.company.findUnique({
    where: { id: ctx.companyId },
    include: { subscription: true },
  });
  if (!company) throw notFound("Company");
  return company;
}

export async function updateCompany(
  ctx: CompanyContext,
  input: UpdateCompanyInput
) {
  const data: UpdateCompanyInput & { binNumber?: string } = { ...input };
  if (input.binNumber) {
    data.binNumber = normalizeBin(input.binNumber);
  }
  return db.company.update({
    where: { id: ctx.companyId },
    data,
  });
}

export async function getAuthMe() {
  const authUser = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      company: { include: { subscription: true } },
    },
  });
  return { authUser, profile: user };
}
