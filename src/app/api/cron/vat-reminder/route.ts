import { NextResponse } from "next/server";
import { VatStatus } from "@/generated/prisma";
import { db } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { getVatDeadline } from "@/lib/vat/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Monthly VAT filing reminder (scheduled via vercel.json for day 22).
 * Reminds every company that has not yet filed the previous month's return
 * that the NBR deadline is the 27th.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ sent: 0, skipped: "email not configured" });
  }

  const now = new Date();
  // The return due this month covers the previous calendar month.
  const periodMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const periodYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const deadline = getVatDeadline(periodYear, periodMonth);

  const companies = await db.company.findMany({
    include: {
      users: { select: { email: true } },
      vatPeriods: {
        where: { periodYear, periodMonth },
        select: { status: true },
      },
    },
  });

  const periodLabel = new Date(periodYear, periodMonth - 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  let sent = 0;
  for (const company of companies) {
    const alreadyFiled = company.vatPeriods.some(
      (p) => p.status === VatStatus.FILED
    );
    if (alreadyFiled) continue;

    for (const user of company.users) {
      const ok = await sendEmail({
        to: user.email,
        subject: `VAT return for ${periodLabel} is due ${deadline.toLocaleDateString("en-GB")}`,
        html: `
          <p>Hello,</p>
          <p>A reminder from Hisab: the VAT return (Mushak 9.1) for
          <strong>${company.name}</strong> covering <strong>${periodLabel}</strong>
          is due with NBR by <strong>${deadline.toLocaleDateString("en-GB")}</strong>.</p>
          <p>You can review your figures and export the return from your
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://hisab.app"}/vat">VAT report page</a>.</p>
          <p>— Hisab</p>`,
      });
      if (ok) sent += 1;
    }
  }

  return NextResponse.json({ sent, period: `${periodYear}-${periodMonth}` });
}
