import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as subscriptionService from "@/lib/services/subscription.service";

export async function POST() {
  try {
    const ctx = await requireCompany();
    const sub = await subscriptionService.cancelSubscription(ctx);
    return jsonOk(sub);
  } catch (error) {
    return jsonError(error);
  }
}
