import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as expenseService from "@/lib/services/expense.service";
import { createSupplierSchema } from "@/lib/validators/expense";

export async function GET() {
  try {
    const ctx = await requireCompany();
    const suppliers = await expenseService.listSuppliers(ctx);
    return jsonOk(suppliers);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = createSupplierSchema.parse(await req.json());
    const supplier = await expenseService.createSupplier(ctx, body);
    return jsonOk(supplier, 201);
  } catch (error) {
    return jsonError(error);
  }
}
