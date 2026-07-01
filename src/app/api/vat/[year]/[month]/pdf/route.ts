import { jsonError } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import { htmlToPdfResponse } from "@/lib/pdf";
import * as vatService from "@/lib/services/vat.service";

type Params = { params: Promise<{ year: string; month: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const ctx = await requireCompany();
    const { year, month } = await params;
    const html = await vatService.generateMushak91Html(
      ctx,
      parseInt(year, 10),
      parseInt(month, 10)
    );
    return htmlToPdfResponse(html, `mushak-9.1-${year}-${month}.html`);
  } catch (error) {
    return jsonError(error);
  }
}
