import { jsonError } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import { htmlToPdfResponse } from "@/lib/pdf";
import * as invoiceService from "@/lib/services/invoice.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const invoice = await invoiceService.getInvoice(ctx, id);
    const html = invoiceService.generateInvoiceHtml(invoice);
    return htmlToPdfResponse(html, `${invoice.invoiceNumber}.html`);
  } catch (error) {
    return jsonError(error);
  }
}
