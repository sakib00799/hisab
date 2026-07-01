import { UserRole } from "@/generated/prisma";
import { db } from "@/lib/db";
import { forbidden, notFound } from "@/lib/errors";
import { getSession, requireAuth } from "@/lib/auth/session";

export interface CompanyContext {
  userId: string;
  email: string;
  companyId: string;
  role: UserRole;
}

export async function getCompanyContext(): Promise<CompanyContext | null> {
  const authUser = await getSession();
  if (!authUser) return null;

  const user = await db.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    companyId: user.companyId,
    role: user.role,
  };
}

export async function requireCompany(): Promise<CompanyContext> {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw notFound("User profile");
  }

  return {
    userId: user.id,
    email: user.email,
    companyId: user.companyId,
    role: user.role,
  };
}

export function assertRole(
  ctx: CompanyContext,
  allowed: UserRole[]
): void {
  if (!allowed.includes(ctx.role)) {
    throw forbidden();
  }
}

export function assertCanWrite(ctx: CompanyContext): void {
  assertRole(ctx, [UserRole.OWNER, UserRole.ACCOUNTANT]);
}
