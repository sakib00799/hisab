import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const number = await invoiceService.getNextNumberPreview(ctx);
    return jsonOk({ invoiceNumber: number });
  } catch (error) {
    return jsonError(error);
  }
}
