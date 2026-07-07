/** Minimal Resend client via HTTP API — no SDK dependency needed. */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send an email through Resend. Returns false (without throwing) when email
 * is not configured or the API call fails, so callers can treat delivery as
 * best-effort.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.EMAIL_FROM ?? "Hisab <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      console.error("Resend send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend send error:", error);
    return false;
  }
}
