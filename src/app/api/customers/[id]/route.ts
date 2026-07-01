import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as customerService from "@/lib/services/customer.service";
import { updateCustomerSchema } from "@/lib/validators/customer";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = updateCustomerSchema.parse(await req.json());
    const customer = await customerService.updateCustomer(ctx, id, body);
    return jsonOk(customer);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    await customerService.deleteCustomer(ctx, id);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
