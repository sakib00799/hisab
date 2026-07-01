import { InvoiceStatus } from "@/generated/prisma";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as invoiceService from "@/lib/services/invoice.service";
import { createInvoiceSchema } from "@/lib/validators/invoice";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as InvoiceStatus | null;
    const search = searchParams.get("search") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const result = await invoiceService.listInvoices(ctx, {
      status: status ?? undefined,
      search,
      page,
      limit,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = createInvoiceSchema.parse(await req.json());
    const invoice = await invoiceService.createInvoice(ctx, body);
    return jsonOk(invoice, 201);
  } catch (error) {
    return jsonError(error);
  }
}
