import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import * as invoiceService from "@/lib/services/invoice.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const invoice = await invoiceService.markInvoiceSent(ctx, id);

    // Best-effort email delivery — marking as sent succeeds regardless.
    let emailed = false;
    if (invoice.customer.email && isEmailConfigured()) {
      const full = await invoiceService.getInvoice(ctx, id);
      emailed = await sendEmail({
        to: invoice.customer.email,
        subject: `Invoice ${invoice.invoiceNumber} from ${full.company.name}`,
        html: invoiceService.generateInvoiceHtml(full),
      });
    }

    return jsonOk({ ...invoice, emailed });
  } catch (error) {
    return jsonError(error);
  }
}
