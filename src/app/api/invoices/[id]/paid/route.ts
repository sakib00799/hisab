import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const invoice = await invoiceService.markInvoicePaid(ctx, id, body.paidAt);
    return jsonOk(invoice);
  } catch (error) {
    return jsonError(error);
  }
}
