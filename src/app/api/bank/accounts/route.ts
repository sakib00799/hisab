import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as bankService from "@/lib/services/bank.service";
import { createBankAccountSchema } from "@/lib/validators/bank";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const accounts = await bankService.listBankAccounts(ctx);
    return jsonOk(accounts);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = createBankAccountSchema.parse(await req.json());
    const account = await bankService.createBankAccount(ctx, body);
    return jsonOk(account, 201);
  } catch (error) {
    return jsonError(error);
  }
}
