import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as expenseService from "@/lib/services/expense.service";
import { updateSupplierSchema } from "@/lib/validators/expense";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = updateSupplierSchema.parse(await req.json());
    const supplier = await expenseService.updateSupplier(ctx, id, body);
    return jsonOk(supplier);
  } catch (error) {
    return jsonError(error);
  }
}
