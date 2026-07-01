import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as bankService from "@/lib/services/bank.service";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const bankAccountId = searchParams.get("account") ?? undefined;
    const unmatched = searchParams.get("unmatched") === "true";

    const transactions = await bankService.listTransactions(ctx, {
      bankAccountId,
      unmatched,
    });
    return jsonOk(transactions);
  } catch (error) {
    return jsonError(error);
  }
}
