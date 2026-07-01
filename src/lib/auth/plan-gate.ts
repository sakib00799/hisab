import { PlanType } from "@/generated/prisma";
import { db } from "@/lib/db";
import { upgradeRequired } from "@/lib/errors";

const PLAN_ORDER: Record<PlanType, number> = {
  FREE: 0,
  BUSINESS: 1,
  PRO: 2,
  ACCOUNTANT_PACK: 3,
};

export async function getCompanyPlan(companyId: string): Promise<PlanType> {
  const sub = await db.subscription.findUnique({
    where: { companyId },
  });
  return sub?.plan ?? PlanType.FREE;
}

export async function requirePlan(
  companyId: string,
  minPlan: PlanType
): Promise<PlanType> {
  const plan = await getCompanyPlan(companyId);
  if (PLAN_ORDER[plan] < PLAN_ORDER[minPlan]) {
    throw upgradeRequired();
  }
  return plan;
}

export function hasPlan(current: PlanType, min: PlanType): boolean {
  return PLAN_ORDER[current] >= PLAN_ORDER[min];
}
