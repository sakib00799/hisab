import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as bankService from "@/lib/services/bank.service";
import { matchTransactionSchema } from "@/lib/validators/bank";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = matchTransactionSchema.parse(await req.json());
    const txn = await bankService.matchTransaction(ctx, id, body);
    return jsonOk(txn);
  } catch (error) {
    return jsonError(error);
  }
}
