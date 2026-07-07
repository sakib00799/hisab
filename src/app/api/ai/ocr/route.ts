import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-response";
import { requireCompany } from "@/lib/auth/company-context";
import { rateLimit } from "@/lib/rate-limit";
import * as ocrService from "@/lib/services/ocr.service";
import { ocrRequestSchema } from "@/lib/validators/subscription";

const OCR_LIMIT = 10;
const OCR_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  try {
    const ctx = await requireCompany();

    const { allowed, retryAfter } = rateLimit(
      `ocr:${ctx.companyId}`,
      OCR_LIMIT,
      OCR_WINDOW_MS
    );
    if (!allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many OCR requests. Try again shortly.",
          },
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

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
