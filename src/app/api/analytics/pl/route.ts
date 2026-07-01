import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as analyticsService from "@/lib/services/analytics.service";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;
    const pl = await analyticsService.getProfitAndLoss(ctx, fromDate, toDate);
    return jsonOk(pl);
  } catch (error) {
    return jsonError(error);
  }
}
