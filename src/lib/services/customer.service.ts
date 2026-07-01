import { Prisma } from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/errors";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/validators/customer";

export async function listCustomers(ctx: CompanyContext, search?: string) {
  const where: Prisma.CustomerWhereInput = { companyId: ctx.companyId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { binNumber: { contains: search, mode: "insensitive" } },
    ];
  }
  return db.customer.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getCustomer(ctx: CompanyContext, id: string) {
  const customer = await db.customer.findFirst({
    where: { id, companyId: ctx.companyId },
  });
  if (!customer) throw notFound("Customer");
  return customer;
}

export async function createCustomer(
  ctx: CompanyContext,
  input: CreateCustomerInput
) {
  assertCanWrite(ctx);
  return db.customer.create({
    data: {
      companyId: ctx.companyId,
      name: input.name,
      binNumber: input.binNumber || null,
      email: input.email || null,
      phone: input.phone,
      address: input.address,
    },
  });
}

export async function updateCustomer(
  ctx: CompanyContext,
  id: string,
  input: UpdateCustomerInput
) {
  assertCanWrite(ctx);
  await getCustomer(ctx, id);
  return db.customer.update({
    where: { id },
    data: {
      ...input,
      email: input.email === "" ? null : input.email,
    },
  });
}

export async function deleteCustomer(ctx: CompanyContext, id: string) {
  assertCanWrite(ctx);
  await getCustomer(ctx, id);
  const invoiceCount = await db.invoice.count({
    where: { customerId: id, companyId: ctx.companyId },
  });
  if (invoiceCount > 0) {
    throw badRequest("Cannot delete customer with invoices");
  }
  return db.customer.delete({ where: { id } });
}
