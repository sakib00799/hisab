import { PlanType } from "@/generated/prisma";
import { CompanyContext } from "@/lib/auth/company-context";
import { requirePlan } from "@/lib/auth/plan-gate";
import { db } from "@/lib/db";
import { badRequest } from "@/lib/errors";

const OCR_PROMPT = `You are a receipt/invoice parser for Bangladesh. Extract the following fields:
- vendor_name: business name on receipt
- date: date of purchase (ISO format YYYY-MM-DD)
- subtotal: amount before VAT (number only, no currency symbol)
- vat_amount: VAT charged (number only, if visible)
- total_amount: total amount paid
- category: one of [COST_OF_GOODS, RENT, UTILITIES, TRANSPORT, MARKETING, SALARIES, OFFICE_SUPPLIES, OTHER]

Respond ONLY with valid JSON. No explanation. If a field is not visible, use null.`;

export interface OcrResult {
  vendor_name: string | null;
  date: string | null;
  subtotal: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  category: string | null;
}

export async function processOcr(
  ctx: CompanyContext,
  imageUrl: string,
  imageHash?: string
) {
  await requirePlan(ctx.companyId, PlanType.PRO);

  if (imageHash) {
    const cached = await db.ocrCache.findUnique({
      where: { imageHash },
    });
    if (cached) {
      return cached.result as unknown as OcrResult;
    }
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  const openaiKey = process.env.OPENAI_API_KEY;

  let result: OcrResult;

  if (aiServiceUrl) {
    const response = await fetch(`${aiServiceUrl}/ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    if (!response.ok) {
      throw badRequest("OCR service failed");
    }
    result = await response.json();
  } else if (openaiKey) {
    result = await callOpenAiVision(imageUrl, openaiKey);
  } else {
    throw badRequest("OCR not configured");
  }

  if (imageHash) {
    await db.ocrCache.upsert({
      where: { imageHash },
      create: { imageHash, result: result as object },
      update: { result: result as object },
    });
  }

  return result;
}

async function callOpenAiVision(
  imageUrl: string,
  apiKey: string
): Promise<OcrResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw badRequest("OpenAI OCR failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as OcrResult;
}
