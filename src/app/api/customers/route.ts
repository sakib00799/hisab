import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as customerService from "@/lib/services/customer.service";
import { createCustomerSchema } from "@/lib/validators/customer";

export async function GET(req: Request) {
  try {
    const ctx = await requireCompany();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const customers = await customerService.listCustomers(ctx, search);
    return jsonOk(customers);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = createCustomerSchema.parse(await req.json());
    const customer = await customerService.createCustomer(ctx, body);
    return jsonOk(customer, 201);
  } catch (error) {
    return jsonError(error);
  }
}
