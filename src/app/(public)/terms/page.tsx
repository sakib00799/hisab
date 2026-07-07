import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Hisab",
  description: "The terms that govern your use of Hisab.",
};

const LAST_UPDATED = "July 7, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              H
            </span>
            <span className="text-lg font-semibold">Hisab</span>
          </Link>
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-6">
          <section>
            <h2 className="text-lg font-semibold">1. The service</h2>
            <p className="mt-2 text-muted-foreground">
              Hisab provides invoicing, VAT reporting, expense tracking, and
              related accounting tools for businesses in Bangladesh. By
              creating an account you agree to these terms on behalf of the
              business you represent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Your responsibilities</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Keep your login credentials secure and do not share accounts.</li>
              <li>
                Enter accurate business information, including your BIN and
                invoice details. You are responsible for the accuracy of data
                you submit.
              </li>
              <li>Use the service only for lawful business purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Not tax advice</h2>
            <p className="mt-2 text-muted-foreground">
              Hisab generates VAT calculations and NBR-format reports (such as
              Mushak 6.3 and Mushak 9.1) from the data you enter. These are
              tools, not professional tax advice. You remain responsible for
              the accuracy and timely filing of your VAT returns with the
              National Board of Revenue. When in doubt, consult a licensed
              accountant.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Plans, billing, and cancellation</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                The Free plan has usage limits (for example, a monthly invoice
                cap). Paid plans (Business, Pro) unlock additional features as
                described on the upgrade page.
              </li>
              <li>
                Payments are processed in BDT through SSLCommerz. Subscriptions
                run month to month.
              </li>
              <li>
                You can cancel at any time; your plan remains active until the
                end of the paid period, then downgrades to Free. Fees already
                paid are non-refundable except where required by law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Your data</h2>
            <p className="mt-2 text-muted-foreground">
              You own your business data. We process it only to provide the
              service, as described in our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . You can export your records and request deletion of your
              account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Availability and support</h2>
            <p className="mt-2 text-muted-foreground">
              We aim for high availability but do not guarantee uninterrupted
              service. We may perform maintenance, and we will make reasonable
              efforts to announce planned downtime in advance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Limitation of liability</h2>
            <p className="mt-2 text-muted-foreground">
              To the maximum extent permitted by law, Hisab is not liable for
              indirect or consequential losses, including NBR penalties arising
              from late or inaccurate filings, loss of profits, or loss of
              data caused by factors outside our reasonable control. Our total
              liability is limited to the fees you paid in the three months
              before the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Termination</h2>
            <p className="mt-2 text-muted-foreground">
              We may suspend or terminate accounts that violate these terms or
              abuse the service. You may close your account at any time by
              contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Changes to these terms</h2>
            <p className="mt-2 text-muted-foreground">
              We may update these terms as the product evolves. For material
              changes we will notify you by email or in-product notice at
              least 14 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about these terms: email{" "}
              <a href="mailto:support@hisab.app" className="text-primary hover:underline">
                support@hisab.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hisab ·{" "}
        <Link href="/privacy" className="hover:underline">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  );
}
