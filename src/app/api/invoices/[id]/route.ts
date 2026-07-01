import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";
import { updateInvoiceSchema } from "@/lib/validators/invoice";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const invoice = await invoiceService.getInvoice(ctx, id);
    return jsonOk(invoice);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = updateInvoiceSchema.parse(await req.json());
    const invoice = await invoiceService.updateInvoice(ctx, id, body);
    return jsonOk(invoice);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    await invoiceService.deleteInvoice(ctx, id);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
