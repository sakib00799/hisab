import { jsonError } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import { pdfResponse } from "@/lib/pdf";
import * as vatService from "@/lib/services/vat.service";

export const maxDuration = 60;

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
    return await pdfResponse(html, `mushak-9.1-${year}-${month}.pdf`);
  } catch (error) {
    return jsonError(error);
  }
}
