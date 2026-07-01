import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as expenseService from "@/lib/services/expense.service";
import { createExpenseSchema } from "@/lib/validators/expense";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const result = await expenseService.listExpenses(ctx, {
      category,
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
    const body = createExpenseSchema.parse(await req.json());
    const expense = await expenseService.createExpense(ctx, body);
    return jsonOk(expense, 201);
  } catch (error) {
    return jsonError(error);
  }
}
