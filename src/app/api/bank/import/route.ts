import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as bankService from "@/lib/services/bank.service";

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bankAccountId = formData.get("bankAccountId") as string;
    const bankHint = (formData.get("bankHint") as string) ?? undefined;

    if (!file || !bankAccountId) {
      return jsonError(new Error("file and bankAccountId are required"));
    }

    const csvContent = await file.text();
    const result = await bankService.importCsv(
      ctx,
      bankAccountId,
      csvContent,
      bankHint
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
