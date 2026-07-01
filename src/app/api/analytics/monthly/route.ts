import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as analyticsService from "@/lib/services/analytics.service";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") ?? "6", 10);
    const trend = await analyticsService.getMonthlyTrend(ctx, months);
    return jsonOk(trend);
  } catch (error) {
    return jsonError(error);
  }
}
