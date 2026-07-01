import { NextResponse } from "next/server";
import * as subscriptionService from "@/lib/services/subscription.service";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    payload[key] = String(value);
  });

  const result = await subscriptionService.handlePaymentWebhook(payload);
  return NextResponse.json(result);
}
