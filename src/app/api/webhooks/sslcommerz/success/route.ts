import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const { handlePaymentWebhook } = await import(
    "@/lib/services/subscription.service"
  );
  await handlePaymentWebhook(params);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/settings?payment=success`);
}
