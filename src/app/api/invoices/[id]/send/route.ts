import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const invoice = await invoiceService.markInvoiceSent(ctx, id);
    return jsonOk(invoice);
  } catch (error) {
    return jsonError(error);
  }
}
