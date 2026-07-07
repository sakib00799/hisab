# Deployment runbook — staging and production

Two environments, one repo:

| | Staging | Production |
| --- | --- | --- |
| Git branch | `staging` | `main` |
| Vercel | Preview deployments of `staging` (or a second project) | Production deployments of `main` |
| Supabase project | `hisab-staging` (create separately) | current project (`hmdbhmbzymjtsopznycu`) |

## 1. One-time staging setup

1. Create a second Supabase project named `hisab-staging`
   (same region: `ap-southeast-1`). Disable "Confirm email" under
   Authentication → Providers → Email, same as dev.
2. In Vercel → Project → Settings → Environment Variables, add the staging
   values scoped to the **Preview** environment (Production keeps its own):
   - `DATABASE_URL` — staging Supabase, session pooler port 5432
     (URL-encode special characters in the password, e.g. `@` → `%40`)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — staging keys
   - `NEXT_PUBLIC_APP_URL` — the staging URL
   - `SSLCOMMERZ_*` — sandbox credentials, `SSLCOMMERZ_IS_LIVE=false`
3. Apply migrations to the staging database from your machine:

```powershell
$env:DATABASE_URL = "<staging session-pooler URL>"
npx prisma migrate deploy
```

4. In Supabase (staging) → Authentication → URL Configuration: set Site URL
   and Redirect URLs to the staging domain.

## 2. Promotion process (staging → production)

1. All work merges to `staging` first; Vercel builds a preview.
2. Test on staging (see `docs/vat-verification.md` and the QA matrix in the
   production plan).
3. Promote: `git checkout main && git merge staging && git push origin main`.
4. Vercel deploys `main` to production automatically.
5. If the release contains new migrations, apply them to production **before**
   merging to `main`:

```powershell
$env:DATABASE_URL = "<production session-pooler URL>"
npx prisma migrate deploy
```

Never run `prisma migrate dev` against staging or production.

## 3. Environment variables (production checklist)

Required: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.

Recommended: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
(source maps), `NEXT_PUBLIC_POSTHOG_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
`CRON_SECRET` (protects `/api/cron/vat-reminder`), `SSLCOMMERZ_STORE_ID`,
`SSLCOMMERZ_STORE_PASS`, `SSLCOMMERZ_IS_LIVE`, `OPENAI_API_KEY` (OCR).

## 4. Backups

Supabase daily backups require the Pro plan (Database → Backups → enable).
Until then, schedule a weekly manual export:

```powershell
npx supabase db dump --db-url "<production session-pooler URL>" -f backup.sql
```

Store dumps outside your laptop (e.g. Google Drive) and test a restore once.

## 5. Monitoring

- Sentry: set both DSN vars; check Issues after each deploy.
- PostHog funnel: `signup → onboarding_complete → invoice_created →
  vat_viewed → upgrade_clicked` (events are emitted by the app).
- Uptime: add UptimeRobot/Better Stack checks on `/` and `/api/auth/me`
  (expect 401 JSON from the latter when logged out — treat 401 as "up").

## 6. Launch-day checklist (production)

Infrastructure

- [ ] `prisma migrate deploy` run against production (includes RLS migration)
- [ ] Supabase daily backups enabled (Pro plan) or weekly dump scheduled
- [ ] Custom domain added in Vercel with SSL; `NEXT_PUBLIC_APP_URL` updated
- [ ] Supabase Auth Site URL / Redirect URLs point at the final domain
- [ ] Supabase Auth: enable leaked-password protection (Auth → Providers →
      Password security) — flagged by the Supabase security advisor

Payments and email

- [ ] SSLCommerz live credentials set; `SSLCOMMERZ_IS_LIVE=true`
- [ ] One real BDT payment tested end to end (webhook upgrades the plan)
- [ ] Resend domain verified; `RESEND_API_KEY` + `EMAIL_FROM` set
- [ ] `CRON_SECRET` set — the VAT reminder cron (`vercel.json`, day 22) sends
      only when email is configured

Monitoring and legal

- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set; a test error appears in Sentry
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set; funnel dashboard created (see
      `docs/beta-program.md`)
- [ ] Uptime checks live on `/` and `/api/auth/me`
- [ ] `/privacy` and `/terms` reachable from the landing page footer

## 7. Database security notes

- RLS is enabled on all tables (`prisma/migrations/20260707000000_enable_rls`).
  Prisma connects as the table owner and is unaffected; direct PostgREST
  access with the publishable key is blocked.
- If Supabase Storage buckets are added later (receipts, logos), create them
  **private** and serve files via signed URLs only.
- The SSLCommerz webhook validates `verify_sign` (MD5 with store password)
  before touching subscriptions; test with a sandbox IPN after each deploy
  that touches payments.
