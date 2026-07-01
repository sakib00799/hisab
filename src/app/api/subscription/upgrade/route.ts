import { PlanType } from "@/generated/prisma";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as subscriptionService from "@/lib/services/subscription.service";
import { upgradeSubscriptionSchema } from "@/lib/validators/subscription";

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = upgradeSubscriptionSchema.parse(await req.json());
    const result = await subscriptionService.initiateUpgrade(
      ctx,
      body.plan as Exclude<PlanType, "FREE">
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
