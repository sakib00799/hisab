import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Hisab",
  description: "How Hisab collects, uses, and protects your business data.",
};

const LAST_UPDATED = "July 7, 2026";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose-hisab mt-8 space-y-8 text-sm leading-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold">1. Who we are</h2>
            <p className="mt-2 text-muted-foreground">
              Hisab (&quot;we&quot;, &quot;us&quot;) provides business accounting software —
              invoicing, VAT reporting, and expense tracking — for businesses in
              Bangladesh. This policy explains what data we collect, why we
              collect it, and how we protect it, in line with the Bangladesh
              Data Protection Act 2023 and other applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Data we collect</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account data:</strong> your
                name, email address, and password (stored as a secure hash by
                our authentication provider).
              </li>
              <li>
                <strong className="text-foreground">Business data:</strong>{" "}
                company name, BIN/TIN numbers, address, customers, suppliers,
                invoices, expenses, bank transactions you import, and VAT
                records you create in the product.
              </li>
              <li>
                <strong className="text-foreground">Payment data:</strong>{" "}
                subscription payments are processed by SSLCommerz. We never see
                or store your full card or mobile banking credentials — we
                store only the transaction reference and payment status.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> pages
                visited and product events (for example &quot;invoice created&quot;),
                collected through PostHog analytics, and error reports
                collected through Sentry. These help us fix bugs and improve
                the product.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. How we use your data</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>To provide the service: invoices, VAT reports, dashboards.</li>
              <li>To process subscription payments and manage your plan.</li>
              <li>To send service emails such as invoice delivery and VAT filing reminders.</li>
              <li>To diagnose errors and improve reliability and usability.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              We do not sell your data. We do not share your business data with
              third parties except the processors listed below, and only to
              operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Where your data lives</h2>
            <p className="mt-2 text-muted-foreground">
              Your data is stored in a dedicated PostgreSQL database hosted by
              Supabase. Application hosting is provided by Vercel. Analytics
              are processed by PostHog and error monitoring by Sentry. Each
              provider processes data only as needed to run the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Cookies and analytics</h2>
            <p className="mt-2 text-muted-foreground">
              We use strictly necessary cookies to keep you signed in. With
              your continued use of the product we also collect analytics
              events through PostHog to understand which features are used.
              Analytics data is tied to your account only after you sign in,
              and is never used for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Data retention and deletion</h2>
            <p className="mt-2 text-muted-foreground">
              We keep your data for as long as your account is active. VAT and
              invoice records may need to be retained per NBR requirements
              (typically 5 years). To delete your account and data, email us at
              the address below — we will delete or anonymise your data within
              30 days, except records we are legally required to keep.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Security</h2>
            <p className="mt-2 text-muted-foreground">
              All traffic is encrypted with TLS. Data is isolated per company
              at the application layer, with database row-level security as an
              additional safeguard. Access to production systems is restricted
              and audited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Your rights</h2>
            <p className="mt-2 text-muted-foreground">
              You may request a copy of your data, correction of inaccurate
              data, or deletion of your account at any time. Contact us and we
              will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about this policy or your data: email{" "}
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
