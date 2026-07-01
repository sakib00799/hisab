import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as subscriptionService from "@/lib/services/subscription.service";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const history = await subscriptionService.getBillingHistory(ctx);
    return jsonOk(history);
  } catch (error) {
    return jsonError(error);
  }
}
