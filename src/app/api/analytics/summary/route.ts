import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as analyticsService from "@/lib/services/analytics.service";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const summary = await analyticsService.getSummary(ctx);
    return jsonOk(summary);
  } catch (error) {
    return jsonError(error);
  }
}
