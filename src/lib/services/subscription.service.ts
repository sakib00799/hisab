import crypto from "crypto";
import {
  PlanType,
  Prisma,
  SubStatus,
} from "@/generated/prisma";
import { CompanyContext, assertCanWrite } from "@/lib/auth/company-context";
import { db } from "@/lib/db";
import { badRequest } from "@/lib/errors";

const PLAN_PRICES: Record<Exclude<PlanType, "FREE">, number> = {
  BUSINESS: 2499,
  PRO: 5999,
  ACCOUNTANT_PACK: 14999,
};

export async function getSubscription(ctx: CompanyContext) {
  const sub = await db.subscription.findUnique({
    where: { companyId: ctx.companyId },
    include: {
      billingHistory: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  return sub;
}

export async function initiateUpgrade(
  ctx: CompanyContext,
  plan: Exclude<PlanType, "FREE">
) {
  assertCanWrite(ctx);

  const company = await db.company.findUnique({
    where: { id: ctx.companyId },
  });
  if (!company) throw badRequest("Company not found");

  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePass = process.env.SSLCOMMERZ_STORE_PASS;
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!storeId || !storePass) {
    throw badRequest("Payment gateway not configured");
  }

  const tranId = `HISAB-${ctx.companyId}-${Date.now()}`;
  const amount = PLAN_PRICES[plan];

  const payload = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePass,
    total_amount: String(amount),
    currency: "BDT",
    tran_id: tranId,
    success_url: `${appUrl}/api/webhooks/sslcommerz/success`,
    fail_url: `${appUrl}/payment/failed`,
    cancel_url: `${appUrl}/payment/cancelled`,
    ipn_url: `${appUrl}/api/webhooks/sslcommerz`,
    product_name: `Hisab ${plan} Plan`,
    product_category: "SaaS Subscription",
    cus_name: company.name,
    cus_email: ctx.email,
    shipping_method: "NO",
    product_profile: "non-physical-goods",
    value_a: plan,
    value_b: ctx.companyId,
  });

  const sessionUrl = isLive
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  const response = await fetch(sessionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  const result = await response.json();

  if (result.status !== "SUCCESS" || !result.GatewayPageURL) {
    throw badRequest(result.failedreason ?? "Payment initiation failed");
  }

  await db.billingRecord.create({
    data: {
      subscription: { connect: { companyId: ctx.companyId } },
      amount: new Prisma.Decimal(amount),
      status: "pending",
      sslTxnId: tranId,
    },
  });

  return { gatewayUrl: result.GatewayPageURL, tranId };
}

export function validateSslHash(payload: Record<string, string>): boolean {
  const storePass = process.env.SSLCOMMERZ_STORE_PASS;
  if (!storePass) return false;

  const verifyKey = payload.verify_key;
  if (!verifyKey) return false;

  const keys = verifyKey.split(",").map((k) => k.trim());
  let hashString = "";
  for (const key of keys) {
    hashString += `${key}=${payload[key] ?? ""}&`;
  }
  hashString += `store_passwd=${storePass}`;

  const hash = crypto.createHash("md5").update(hashString).digest("hex");
  return hash === payload.verify_sign;
}

export async function handlePaymentWebhook(payload: Record<string, string>) {
  if (!validateSslHash(payload)) {
    return { status: "invalid" as const };
  }

  if (payload.status !== "VALID" && payload.status !== "VALIDATED") {
    return { status: "ignored" as const };
  }

  const companyId = payload.value_b;
  const plan = payload.value_a as PlanType;
  const tranId = payload.tran_id;

  if (!companyId || !plan) {
    return { status: "invalid" as const };
  }

  const existing = await db.billingRecord.findUnique({
    where: { sslTxnId: tranId },
  });
  if (existing?.status === "success") {
    return { status: "duplicate" as const };
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        plan,
        status: SubStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        sslTransactionId: tranId,
      },
      update: {
        plan,
        status: SubStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        sslTransactionId: tranId,
      },
    });

    await tx.billingRecord.updateMany({
      where: { sslTxnId: tranId },
      data: {
        status: "success",
        paidAt: now,
        amount: new Prisma.Decimal(parseFloat(payload.amount ?? "0")),
      },
    });
  });

  return { status: "success" as const };
}

export async function cancelSubscription(ctx: CompanyContext) {
  assertCanWrite(ctx);
  return db.subscription.update({
    where: { companyId: ctx.companyId },
    data: {
      plan: PlanType.FREE,
      status: SubStatus.CANCELLED,
      currentPeriodEnd: new Date(),
    },
  });
}

export async function getBillingHistory(ctx: CompanyContext) {
  const sub = await db.subscription.findUnique({
    where: { companyId: ctx.companyId },
  });
  if (!sub) return [];
  return db.billingRecord.findMany({
    where: { subscriptionId: sub.id },
    orderBy: { createdAt: "desc" },
  });
}
