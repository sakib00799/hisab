import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as vatService from "@/lib/services/vat.service";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const history = await vatService.getVatHistory(ctx);
    return jsonOk(history);
  } catch (error) {
    return jsonError(error);
  }
}
