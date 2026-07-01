import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import * as ocrService from "@/lib/services/ocr.service";
import { ocrRequestSchema } from "@/lib/validators/subscription";

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();
    const body = ocrRequestSchema.parse(await req.json());
    const result = await ocrService.processOcr(
      ctx,
      body.imageUrl,
      body.imageHash
    );
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
