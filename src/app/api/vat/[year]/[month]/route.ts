import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as vatService from "@/lib/services/vat.service";
import { fileVatPeriodSchema } from "@/lib/validators/subscription";

type Params = { params: Promise<{ year: string; month: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { year, month } = await params;
    const result = await vatService.calculateVatPeriod(
      ctx,
      parseInt(year, 10),
      parseInt(month, 10)
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { year, month } = await params;
    const body = fileVatPeriodSchema.parse(await req.json().catch(() => ({})));
    const result = await vatService.fileVatPeriod(
      ctx,
      parseInt(year, 10),
      parseInt(month, 10),
      body.challanRef
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
