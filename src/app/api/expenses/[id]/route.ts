import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as expenseService from "@/lib/services/expense.service";
import { updateExpenseSchema } from "@/lib/validators/expense";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    const body = updateExpenseSchema.parse(await req.json());
    const expense = await expenseService.updateExpense(ctx, id, body);
    return jsonOk(expense);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { id } = await params;
    await expenseService.deleteExpense(ctx, id);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
