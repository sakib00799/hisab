# Hisab — Founder Reference Document
> AI-Powered VAT & Financial Operations SaaS for Bangladesh SMEs  
> Last updated: June 2026 | Status: Pre-build

---

## Table of Contents
1. [The One-Line Pitch](#1-the-one-line-pitch)
2. [Problem & Solution](#2-problem--solution)
3. [Target Customer](#3-target-customer)
4. [Business Model & Pricing](#4-business-model--pricing)
5. [MVP Feature List](#5-mvp-feature-list)
6. [Week-by-Week Development Roadmap](#6-week-by-week-development-roadmap)
7. [Tech Stack](#7-tech-stack)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [System Architecture](#10-system-architecture)
11. [UI Screens](#11-ui-screens)
12. [Key Business Logic](#12-key-business-logic)
13. [Payment Integration](#13-payment-integration)
14. [Growth & Acquisition](#14-growth--acquisition)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Metrics to Track](#16-metrics-to-track)
17. [Funding Targets](#17-funding-targets)
18. [Build Checklist](#18-build-checklist)

---

## 1. The One-Line Pitch

> **"Replace your accountant for VAT. File in 5 minutes, not 5 hours."**

**Positioning:** Hisab is not generic accounting software. It is a Bangladesh-first NBR compliance tool that automates VAT return generation, invoice creation, and expense tracking — priced below what most SMEs pay their accountant monthly.

**Core value prop (memorize this for every sales call):**
- You pay your accountant BDT 8,000/month
- Hisab costs BDT 2,499/month
- You save BDT 5,500/month + get 24/7 visibility into your finances

---

## 2. Problem & Solution

### The Problem
Every VAT-registered business in Bangladesh must:
- File monthly VAT returns (Mushak 9.1) with NBR
- Maintain VAT input/output registers (Mushak 6.3, 6.6)
- Issue Mushak-compliant purchase/sales invoices
- Reconcile bank statements manually
- Prepare for income tax annually

**What actually happens today:**
- Business owners keep notebooks or Excel
- Hire an accountant at BDT 3,000–15,000/month
- Accountant visits once or twice a month, files manually
- Business owner has zero real-time financial visibility
- Errors in VAT returns → NBR penalties BDT 10,000–50,000+
- If accountant leaves → business is paralyzed

### The Solution
Hisab replaces the manual VAT compliance workflow with:
1. **Smart invoicing** — creates Mushak 6.3-compliant sales invoices with auto VAT calculation
2. **Expense tracking** — with AI receipt OCR for input tax credit capture
3. **Auto VAT engine** — calculates output VAT - input VAT = net payable every month
4. **One-click export** — generates Mushak 9.1 return PDF ready for NBR filing
5. **Bank reconciliation** — imports CSV from all major Bangladesh banks, auto-categorizes

### Why Now
- NBR digitizing enforcement since 2019 (more audits, higher penalties)
- 87% of registered business owners have smartphones (BTRC 2023)
- No cloud-native, Bangladesh-specific accounting SaaS exists
- Tally is desktop + expensive + Indian; Wave/QuickBooks have zero BDT/NBR support

---

## 3. Target Customer

### Primary (go here first)
- **Who:** Owner-operators of VAT-registered SMEs in Dhaka, Chittagong, Gazipur
- **Business types:** Trading firms, importers, small manufacturers, service companies, restaurants, tech companies
- **Size:** 1–20 employees, BDT 30 lakh–5 crore annual turnover
- **Pain level:** High — they're either paying an accountant monthly or doing it wrong
- **Where to find them:** Facebook business groups, FBCCI chamber events, LinkedIn, cold WhatsApp

### Secondary (Month 3+)
- **Accounting firms** managing 10–50 SME clients (B2B2B channel)
  - Offer them: Accountant Pack plan (BDT 14,999/month, manage 25 clients)
  - Revenue share: 30% for each client they bring in
  - They become your sales force

### Tertiary (Year 2)
- Larger businesses needing multi-user access, inventory linkage, income tax prep

### Customer Profile (use for ads targeting)
- Age 28–55, male, business owner or finance manager
- Urban (Dhaka Metro, Chittagong, Sylhet)
- Has a smartphone, uses Facebook and WhatsApp daily
- Already spends money on an accountant — price-sensitive but not price-resistant if ROI is clear
- Skeptical of software — needs to see it work before paying

---

## 4. Business Model & Pricing

### Plans

| Plan | Price/Month (BDT) | Price/Month (USD) | Key Limits |
|------|-------------------|-------------------|------------|
| **Free** | 0 | $0 | 30 invoices/month, no VAT export, no OCR |
| **Business** | 2,499 | ~$22 | Unlimited invoices, VAT return export, bank import |
| **Pro** | 5,999 | ~$54 | Everything + receipt OCR, accountant access, WhatsApp bot |
| **Accountant Pack** | 14,999 | ~$136 | Manage up to 25 client companies |

### Freemium Rules (Critical)
- **Free tier must create urgency** — the VAT return export (Mushak 9.1 PDF) is PAYWALLED on Business plan
- This is the conversion trigger — every free user who needs to file hits this wall
- 30-invoice limit ensures free is viable for micro-businesses but not real SMEs
- Never make the free tier so good that people don't upgrade

### Revenue Targets

| Month | Customers | Avg ARPU | MRR |
|-------|-----------|----------|-----|
| Month 3 | 30 | BDT 2,800 | BDT 84,000 (~$760) |
| Month 6 | 150 | BDT 3,200 | BDT 480,000 (~$4,360) |
| Month 12 | 500 | BDT 3,500 | BDT 1,750,000 (~$15,900) |
| Month 18 | 1,200 | BDT 4,000 | BDT 4,800,000 (~$43,600) |
| Month 24 | 2,500 | BDT 4,500 | BDT 11,250,000 (~$102,000) |

**$1M ARR milestone = ~2,800 paying customers at $30/month average**  
At 10x ARR multiple → **$10M valuation**

### LTV / CAC Targets
- Average subscription: BDT 3,500/month
- Target monthly churn: <4% (industry standard SaaS BD)
- LTV = 3,500 / 0.04 = BDT 87,500 (~$795)
- CAC target: <BDT 10,000 ($90) — must be <LTV/3 to be sustainable

---

## 5. MVP Feature List

### MUST HAVE (Ship before launch)

#### Authentication & Onboarding
- [ ] Email + password signup
- [ ] Google OAuth login
- [ ] Company onboarding wizard (BIN, TIN, company name, VAT type, business category, fiscal year start)
- [ ] BIN number validation (12-digit format check)
- [ ] Email verification flow
- [ ] Password reset

#### Invoice Management
- [ ] Create sales invoice (line items, per-item VAT rate, auto-total)
- [ ] Customer select / quick-add customer inline
- [ ] Customer BIN field (required for B2B VAT)
- [ ] Invoice PDF generation (Mushak 6.3 format compliant)
- [ ] Invoice list with status (Draft / Sent / Paid / Overdue)
- [ ] Mark invoice as paid
- [ ] Invoice number auto-generation (sequential, per company)
- [ ] Basic invoice search and date filter

#### Expense Tracking
- [ ] Manual expense entry (date, supplier, category, amount, VAT amount)
- [ ] Expense categories (COGS, Rent, Utilities, Transport, Marketing, Other)
- [ ] Expense list with filter by category / date range
- [ ] Supplier management (name, BIN, contact)

#### VAT Engine
- [ ] Auto-populate VAT output register from invoices
- [ ] Auto-populate VAT input register from expenses
- [ ] Monthly VAT liability calculation: Output VAT - Input VAT = Net Payable
- [ ] Mushak 9.1 return PDF export (PAYWALLED — Business plan+)
- [ ] Period selector (month + year)
- [ ] "Mark as Filed" action with filed date

#### Dashboard
- [ ] This month: Revenue, Expenses, VAT Payable (3 KPI cards)
- [ ] Outstanding invoices count + total amount
- [ ] VAT deadline countdown (27th of each month)
- [ ] Recent 10 transactions list
- [ ] 6-month revenue/expense bar chart

#### Settings
- [ ] Company profile edit (name, BIN, TIN, logo upload, address)
- [ ] Invite accountant by email (view-only role)

#### Subscription & Payment
- [ ] SSLCommerz payment integration
- [ ] Plan selection screen
- [ ] Subscription status display
- [ ] Feature gating based on plan

---

### SHOULD HAVE (Ship within Month 2)
- [ ] Bank statement CSV import (BRAC, Dutch-Bangla, Islami Bank, Eastern Bank format support)
- [ ] Auto-categorization of imported bank transactions (rule-based)
- [ ] Manual transaction-to-invoice matching
- [ ] Receipt image upload (manual fill, no OCR yet)
- [ ] P&L report (monthly, quarterly)
- [ ] Email invoice to customer
- [ ] VAT deadline email reminder (auto, 5 days before 27th)
- [ ] Customer portal (customer views/downloads their invoice via link)
- [ ] Basic user roles (Owner, Accountant, Viewer)

---

### NICE TO HAVE (Month 3+)
- [ ] AI receipt OCR (OpenAI Vision API)
- [ ] WhatsApp expense logging bot
- [ ] Bengali UI toggle
- [ ] Inventory tracking (basic)
- [ ] Income tax worksheet
- [ ] Recurring invoices
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Accountant Pack dashboard (manage multiple companies)
- [ ] Nagad payment option
- [ ] API access for developers

---

### NEVER BUILD IN YEAR 1
- Payroll module (separate product — NabobHR)
- E-commerce integration
- ERP features (manufacturing, BOM)
- Hardware (receipt printers, POS terminals)

---

## 6. Week-by-Week Development Roadmap

### Week 1 — Foundation
**Goal:** App skeleton running with auth + company setup

Tasks:
- [ ] Initialize Next.js 14 project (App Router)
- [ ] Set up Supabase project (DB, Auth, Storage)
- [ ] Configure Prisma with Supabase connection string
- [ ] Run initial DB migration (users, companies tables)
- [ ] Build signup page → email verification → company onboarding wizard
- [ ] Build login page with Google OAuth
- [ ] Set up Sentry (do this NOW, not later)
- [ ] Configure GitHub Actions CI (lint + type-check on push)
- [ ] Set up Vercel project + environment variables
- [ ] Set up Supabase Row Level Security policies for companies

**End of Week 1 checkpoint:** Can create an account, set up company with BIN/TIN, land on empty dashboard.

---

### Week 2 — Invoice Engine
**Goal:** Full invoice create → PDF download flow working

Tasks:
- [ ] Customer management (CRUD)
- [ ] Invoice creation form (line items, VAT rate per item, auto-total)
- [ ] Invoice auto-numbering (INV-0001, INV-0002...)
- [ ] Invoice PDF generation via Puppeteer (Mushak 6.3 format)
- [ ] Bengali font support in PDF (use Hind Siliguri or Noto Sans Bengali)
- [ ] Invoice list page (table with status column)
- [ ] Invoice detail view
- [ ] Mark invoice as paid action
- [ ] Dashboard skeleton with KPI cards (data can be hardcoded for now)

**End of Week 2 checkpoint:** Can create a professional Mushak-compliant invoice PDF and download it.

---

### Week 3 — Expense + VAT Calculation
**Goal:** VAT engine working end-to-end

Tasks:
- [ ] Supplier management (CRUD)
- [ ] Expense entry form (date, supplier, category, amount, VAT amount, notes)
- [ ] Expense list with filters
- [ ] VAT output register (auto from invoices)
- [ ] VAT input register (auto from expenses)
- [ ] Monthly net VAT calculation
- [ ] VAT report page (period selector, register table, net payable display)
- [ ] Mushak 9.1 PDF export (implement the paywall gate here)
- [ ] Mark as filed action
- [ ] P&L calculation (revenue - expenses by category)

**End of Week 3 checkpoint:** Can enter a full month of invoices + expenses, view VAT liability, export Mushak 9.1 PDF (on paid plan).

---

### Week 4 — Bank Import + Dashboard Polish
**Goal:** Bank reconciliation working; dashboard shows real data

Tasks:
- [ ] Bank statement CSV parser (handle BRAC, Dutch-Bangla, Islami Bank column formats)
- [ ] Parsed transactions review table
- [ ] Manual match transaction → invoice or expense
- [ ] Rule-based auto-categorization (e.g., "bKash" → Mobile Banking category)
- [ ] Dashboard charts (6-month bar chart using Recharts or Chart.js)
- [ ] Real KPI card data (connect to actual DB queries)
- [ ] Outstanding invoices widget
- [ ] VAT deadline countdown (logic: 27th of month, show days remaining)

**End of Week 4 checkpoint:** Dashboard shows real financial data; bank statement CSV imports cleanly.

---

### Week 5 — AI Service (OCR)
**Goal:** Receipt OCR microservice deployed and callable

Tasks:
- [ ] Initialize Python FastAPI project
- [ ] Deploy FastAPI to Railway
- [ ] OpenAI Vision API integration for receipt parsing
- [ ] Prompt engineering for receipt extraction (vendor, date, amount, VAT amount, category)
- [ ] Endpoint: `POST /ocr` — accepts image URL, returns structured JSON
- [ ] Supabase Storage integration (receipt image upload from Next.js frontend)
- [ ] Connect Next.js `/api/ai/ocr` → FastAPI microservice
- [ ] Pre-fill expense form from OCR result
- [ ] Fallback: if OCR confidence is low, show raw result for manual correction
- [ ] Cost control: cache OCR results by image hash (don't re-process same receipt)

**End of Week 5 checkpoint:** Upload a receipt photo → form auto-fills. Gate this on Pro plan.

---

### Week 6 — Payments + Subscriptions
**Goal:** Real payments flowing; plan gating enforced

Tasks:
- [ ] SSLCommerz integration (test credentials first)
- [ ] Subscription plans table in DB
- [ ] Plan selection / pricing page UI
- [ ] Payment initiation → SSL gateway redirect
- [ ] Webhook handler for payment confirmation (`POST /api/webhooks/sslcommerz`)
- [ ] Update subscription status on successful payment
- [ ] Feature gating middleware (check plan before serving paywalled API routes)
- [ ] Subscription status display in settings
- [ ] Billing history table
- [ ] Cancellation flow (downgrade to free, not delete)
- [ ] Failed payment handling + email notification

**End of Week 6 checkpoint:** Can accept real BDT payments; Business plan unlocks VAT export; Pro plan unlocks OCR.

---

### Week 7 — Polish + Landing Page
**Goal:** Ready for beta users

Tasks:
- [ ] Build landing page (headline, ROI calculator, features, pricing, CTA)
- [ ] Onboarding tutorial (3-step modal on first login)
- [ ] Empty states for all list views (with "Add your first invoice" CTAs)
- [ ] Email notification: invoice sent confirmation, VAT deadline reminder (Day 22 of month)
- [ ] Invite accountant flow (email invite → limited access)
- [ ] Privacy Policy page (Bangladesh Data Protection Act 2023 compliant)
- [ ] Terms of Service page
- [ ] Error boundaries on all pages
- [ ] Mobile responsiveness audit
- [ ] Load test: Supabase query performance with 1000 invoice records

**End of Week 7 checkpoint:** Product feels production-ready. Show it to 5 strangers and watch them use it.

---

### Week 8 — Beta + Fixes
**Goal:** 10 beta users using the product; 5 paying

Tasks:
- [ ] Recruit 10 beta users from Facebook business groups (offer 3 months free)
- [ ] Do live onboarding call with each beta user (screen share)
- [ ] Fix top 10 bugs from beta feedback
- [ ] Add PostHog analytics (track: signup → invoice_created → vat_report_viewed → payment)
- [ ] Fix all Sentry errors from beta
- [ ] Performance: any page over 2s load time → fix it
- [ ] Formal launch preparation

---

## 7. Tech Stack

### Decision Table

| Layer | Technology | Why This, Not Alternatives |
|-------|-----------|---------------------------|
| **Framework** | Next.js 14 (App Router) | Full-stack in one repo. API routes = no separate Express server. SSR for fast initial load. Vercel deployment is 1 command. |
| **UI Components** | shadcn/ui + Tailwind CSS | Copy-paste components, no abstraction lock-in. Tailwind = fast to customize. shadcn gives you tables, forms, dialogs that look professional immediately. |
| **Charts** | Recharts | React-native, no CDN dependency, customizable. Lighter than Chart.js for this use case. |
| **Database** | PostgreSQL via Supabase | Managed Postgres (no ops overhead) + Auth + Storage bundled. Free tier is generous (500MB DB, 1GB storage). You don't set up a server. |
| **ORM** | Prisma | Type-safe queries. Great migrations. `prisma studio` for DB inspection. Works perfectly with Supabase Postgres. |
| **Auth** | Supabase Auth | Already included in Supabase. JWT-based. Email/password + Google OAuth out of the box. No extra service to configure. |
| **File Storage** | Supabase Storage | Already included. Use for receipt images, exported PDFs, company logos. Signed URLs for private access. |
| **AI Service** | Python FastAPI (Railway) | Python is non-negotiable for AI/ML work. Keep it as a separate microservice — don't mix Python into Next.js runtime. |
| **OCR/AI** | OpenAI GPT-4o Vision API | Best receipt parsing accuracy. $0.00255 per image. With caching, cost is negligible. Tesseract as fallback for simple receipts. |
| **PDF Generation** | Puppeteer + @sparticuz/chromium | Headless Chrome generates pixel-perfect PDFs. Works in Vercel serverless with the sparticuz package. Bengali font rendering works. |
| **Hosting (Web)** | Vercel | Best-in-class Next.js hosting. Free hobby tier works until you have paying customers. Auto-deploys on git push. |
| **Hosting (Python)** | Railway | $5/month for the AI microservice. Simple Docker deployment. Env variables managed via dashboard. |
| **Email** | Resend | Cleanest API (`resend.emails.send()`). Free tier: 3,000 emails/month. Better deliverability than SendGrid for new domains. |
| **Payments** | SSLCommerz | The only gateway with bKash + Nagad + Rocket + all bank cards in one integration. Mandatory for Bangladesh. |
| **Background Jobs** | Vercel Cron | Built-in cron expressions. Use for: monthly VAT reminder (22nd of each month), overdue invoice alerts. No Redis/BullMQ needed at MVP scale. |
| **Analytics** | PostHog | Open-source product analytics. Session replay. Feature flags. Free cloud tier: 1M events/month. Better than Mixpanel for solo founders (no sales calls). |
| **Error Monitoring** | Sentry | Set up on Day 1. Free tier is sufficient. You will debug production issues without this at your peril. |
| **CI/CD** | GitHub Actions | Free. Lint + type-check + run tests on every PR. Deploy to Vercel automatically on merge to main. |
| **Search** | PostgreSQL full-text search | `tsvector` + `tsquery` handles invoice/customer search at MVP scale. Skip Elasticsearch complexity entirely. |

### Environment Variables (keep this updated)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (direct connection for Prisma)
DATABASE_URL=

# OpenAI
OPENAI_API_KEY=

# SSLCommerz
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false

# Resend
RESEND_API_KEY=

# Python AI Service
AI_SERVICE_URL=https://your-railway-app.up.railway.app

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 8. Database Schema

### Full Schema (Prisma format)

```prisma
model Company {
  id               String   @id @default(cuid())
  name             String
  binNumber        String   @unique  // 12-digit BIN
  tinNumber        String?           // 12-digit TIN
  vatType          VatType  @default(STANDARD)
  businessCategory String?
  address          String?
  logoUrl          String?
  fiscalYearStart  Int      @default(7)  // Month number (7 = July for BD fiscal year)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  users            User[]
  customers        Customer[]
  suppliers        Supplier[]
  invoices         Invoice[]
  expenses         Expense[]
  bankAccounts     BankAccount[]
  vatPeriods       VatPeriod[]
  subscription     Subscription?
}

enum VatType {
  STANDARD        // 15% VAT
  ZERO_RATED      // 0% VAT (exports)
  EXEMPT          // VAT exempt
  TRUNCATED       // Reduced rate (4%, 5%, 7.5%, 10%)
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(OWNER)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

enum UserRole {
  OWNER       // Full access
  ACCOUNTANT  // Create/edit invoices + expenses, view reports
  VIEWER      // Read-only
}

model Customer {
  id         String    @id @default(cuid())
  companyId  String
  company    Company   @relation(fields: [companyId], references: [id])
  name       String
  binNumber  String?   // For B2B VAT invoice
  email      String?
  phone      String?
  address    String?
  createdAt  DateTime  @default(now())
  invoices   Invoice[]
}

model Supplier {
  id         String    @id @default(cuid())
  companyId  String
  company    Company   @relation(fields: [companyId], references: [id])
  name       String
  binNumber  String?   // For input tax credit
  contact    String?
  email      String?
  createdAt  DateTime  @default(now())
  expenses   Expense[]
}

model Invoice {
  id            String        @id @default(cuid())
  companyId     String
  company       Company       @relation(fields: [companyId], references: [id])
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  invoiceNumber String        // INV-0001, auto-generated per company
  invoiceDate   DateTime
  dueDate       DateTime?
  status        InvoiceStatus @default(DRAFT)
  notes         String?
  subtotal      Decimal       @db.Decimal(12, 2)
  vatTotal      Decimal       @db.Decimal(12, 2)
  total         Decimal       @db.Decimal(12, 2)
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  items         InvoiceItem[]
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model InvoiceItem {
  id          String   @id @default(cuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Decimal  @db.Decimal(10, 3)
  unitPrice   Decimal  @db.Decimal(12, 2)
  vatRate     Decimal  @db.Decimal(5, 2)  // 0, 4, 5, 7.5, 10, 15
  vatAmount   Decimal  @db.Decimal(12, 2)
  lineTotal   Decimal  @db.Decimal(12, 2)
}

model Expense {
  id              String          @id @default(cuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])
  supplierId      String?
  supplier        Supplier?       @relation(fields: [supplierId], references: [id])
  category        ExpenseCategory
  description     String?
  amount          Decimal         @db.Decimal(12, 2)  // Amount before VAT
  vatAmount       Decimal         @db.Decimal(12, 2)  // Input VAT claimable
  totalAmount     Decimal         @db.Decimal(12, 2)  // Amount + VAT
  expenseDate     DateTime
  receiptUrl      String?         // Supabase storage path
  ocrProcessed    Boolean         @default(false)
  status          ExpenseStatus   @default(PENDING)
  createdAt       DateTime        @default(now())
}

enum ExpenseCategory {
  COST_OF_GOODS
  RENT
  UTILITIES
  TRANSPORT
  MARKETING
  SALARIES
  BANK_CHARGES
  PROFESSIONAL_FEES
  OFFICE_SUPPLIES
  OTHER
}

enum ExpenseStatus {
  PENDING     // Not reconciled
  RECONCILED  // Matched to bank transaction
  APPROVED
}

model BankAccount {
  id            String            @id @default(cuid())
  companyId     String
  company       Company           @relation(fields: [companyId], references: [id])
  bankName      String
  accountNumber String
  accountType   String?
  createdAt     DateTime          @default(now())
  transactions  BankTransaction[]
}

model BankTransaction {
  id              String       @id @default(cuid())
  bankAccountId   String
  bankAccount     BankAccount  @relation(fields: [bankAccountId], references: [id])
  transactionDate DateTime
  description     String
  amount          Decimal      @db.Decimal(12, 2)
  type            TxnType      // CREDIT or DEBIT
  category        String?      // Auto-categorized
  matchedExpenseId String?     // If reconciled
  matchedInvoiceId String?     // If reconciled
  createdAt       DateTime     @default(now())
}

enum TxnType {
  CREDIT  // Money in
  DEBIT   // Money out
}

model VatPeriod {
  id           String    @id @default(cuid())
  companyId    String
  company      Company   @relation(fields: [companyId], references: [id])
  periodYear   Int       // 2024
  periodMonth  Int       // 1-12
  outputVat    Decimal   @db.Decimal(12, 2)  // VAT collected on sales
  inputVat     Decimal   @db.Decimal(12, 2)  // VAT paid on purchases
  netPayable   Decimal   @db.Decimal(12, 2)  // outputVat - inputVat
  status       VatStatus @default(DRAFT)
  filedAt      DateTime?
  challanRef   String?   // NBR challan reference number
  createdAt    DateTime  @default(now())

  @@unique([companyId, periodYear, periodMonth])
}

enum VatStatus {
  DRAFT   // Auto-calculated, not filed
  FILED   // Marked as filed by user
}

model Subscription {
  id                    String    @id @default(cuid())
  companyId             String    @unique
  company               Company   @relation(fields: [companyId], references: [id])
  plan                  PlanType  @default(FREE)
  status                SubStatus @default(ACTIVE)
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  sslTransactionId      String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  billingHistory        BillingRecord[]
}

enum PlanType {
  FREE
  BUSINESS
  PRO
  ACCOUNTANT_PACK
}

enum SubStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  TRIALING
}

model BillingRecord {
  id             String       @id @default(cuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
  amount         Decimal      @db.Decimal(10, 2)
  currency       String       @default("BDT")
  status         String       // success | failed | pending
  sslTxnId       String?
  paidAt         DateTime?
  createdAt      DateTime     @default(now())
}
```

### Row Level Security (Supabase SQL — run these)
```sql
-- Enable RLS on all tables
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;

-- Users can only see their company's data
CREATE POLICY "Company isolation" ON "Invoice"
  USING (
    "companyId" IN (
      SELECT "companyId" FROM "User" WHERE id = auth.uid()
    )
  );
-- Repeat for every table with companyId
```

---

## 9. API Endpoints

### Auth
```
POST   /api/auth/signup              Create account + company
POST   /api/auth/login               Email/password login
POST   /api/auth/logout              Clear session
GET    /api/auth/me                  Current user + company info
POST   /api/auth/invite              Invite accountant by email
```

### Companies
```
GET    /api/companies/me             Get company profile
PUT    /api/companies/me             Update company profile
POST   /api/companies/me/logo        Upload company logo
```

### Invoices
```
GET    /api/invoices                 List invoices (pagination, filters: status, date, customer)
POST   /api/invoices                 Create invoice
GET    /api/invoices/:id             Get invoice detail
PUT    /api/invoices/:id             Update invoice (only DRAFT)
DELETE /api/invoices/:id             Delete invoice (only DRAFT)
POST   /api/invoices/:id/send        Mark as SENT (triggers email to customer)
POST   /api/invoices/:id/paid        Mark as PAID with payment date
GET    /api/invoices/:id/pdf         Stream PDF download
GET    /api/invoices/next-number     Get next invoice number (INV-0001)
```

### Expenses
```
GET    /api/expenses                 List expenses (pagination, filters: category, date)
POST   /api/expenses                 Create expense
PUT    /api/expenses/:id             Update expense
DELETE /api/expenses/:id             Delete expense
POST   /api/expenses/:id/receipt     Upload receipt image → returns storage URL
```

### Customers & Suppliers
```
GET    /api/customers                List customers
POST   /api/customers                Create customer
PUT    /api/customers/:id            Update customer
DELETE /api/customers/:id            Delete customer (if no invoices)

GET    /api/suppliers                List suppliers
POST   /api/suppliers                Create supplier
PUT    /api/suppliers/:id            Update supplier
```

### VAT
```
GET    /api/vat/:year/:month         Calculate VAT for period (output, input, net)
POST   /api/vat/:year/:month/file    Mark period as filed (sets filedAt, challanRef)
GET    /api/vat/:year/:month/pdf     Export Mushak 9.1 PDF [PAYWALLED: Business+]
GET    /api/vat/history              List all filed periods
```

### Bank
```
GET    /api/bank/accounts            List bank accounts
POST   /api/bank/accounts            Add bank account
POST   /api/bank/import              Upload CSV → parse + save transactions
GET    /api/bank/transactions        List transactions (filter: account, date, unmatched)
POST   /api/bank/transactions/:id/match  Match txn to invoice or expense
```

### Analytics
```
GET    /api/analytics/summary        Dashboard KPIs (revenue, expenses, vat payable, outstanding)
GET    /api/analytics/pl             P&L report (by month, by category)
GET    /api/analytics/monthly        Monthly revenue/expense for chart (last 6 or 12 months)
```

### AI
```
POST   /api/ai/ocr                   Upload receipt URL → returns {vendor, date, amount, vatAmount, category} [PAYWALLED: Pro+]
```

### Subscription & Payments
```
GET    /api/subscription             Get current plan + status
POST   /api/subscription/upgrade     Initiate payment (returns SSL session URL)
POST   /api/webhooks/sslcommerz      Payment confirmation webhook (no auth, verify SSL signature)
GET    /api/subscription/billing     Billing history
POST   /api/subscription/cancel      Cancel subscription (downgrades to free at period end)
```

---

## 10. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                         │
│                    Next.js 14 App Router                      │
│              (React Server Components + Client)               │
└────────────────────────┬────────────────────────────────────-┘
                         │ HTTPS
┌────────────────────────▼──────────────────────────────────────┐
│                     Vercel Edge Network                        │
│          Next.js App (Pages + API Routes)                      │
│                                                                │
│  ┌─────────────────┐    ┌──────────────────────────────────┐  │
│  │  React Pages    │    │         API Routes               │  │
│  │  /dashboard     │    │  /api/invoices/*                 │  │
│  │  /invoices      │    │  /api/expenses/*                 │  │
│  │  /vat           │    │  /api/vat/*                      │  │
│  │  /bank          │    │  /api/auth/*                     │  │
│  │  /settings      │    │  /api/webhooks/sslcommerz        │  │
│  └─────────────────┘    └──────────────────────────────────┘  │
└───────────┬──────────────────────────┬────────────────────────┘
            │                          │
┌───────────▼──────────┐   ┌──────────▼──────────────────────┐
│  Supabase (Postgres)  │   │  Railway (Python FastAPI)        │
│                       │   │                                   │
│  - companies          │   │  POST /ocr                        │
│  - invoices           │   │    └── Supabase Storage URL       │
│  - expenses           │   │    └── OpenAI Vision API          │
│  - bank_transactions  │   │    └── Returns structured JSON    │
│  - vat_periods        │   │                                   │
│  - subscriptions      │   │  (Future: attrition model,        │
│                       │   │   expense auto-categorization ML) │
│  Auth (JWT)           │   │                                   │
│  Storage (receipts,   │   └───────────────────────────────────┘
│    logos, PDFs)       │
│  RLS enforced         │
└───────────────────────┘

External Services:
┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────┐
│ SSLCommerz  │  │   Resend    │  │  OpenAI API  │  │ Sentry  │
│ (Payments)  │  │  (Email)    │  │  (OCR/AI)    │  │ (Errors)│
└─────────────┘  └─────────────┘  └──────────────┘  └─────────┘
```

### Authentication Flow
```
1. User submits email/password
2. Supabase Auth validates → issues JWT (access token + refresh token)
3. Tokens stored in HTTP-only cookies (Next.js middleware handles this)
4. Every API route calls: supabase.auth.getUser() with cookie session
5. If invalid/expired → 401 → client redirects to /login
6. getUser() returns user → look up User table → get companyId
7. All DB queries filtered by companyId (+ Supabase RLS as backup)
```

### Receipt OCR Flow
```
1. User selects receipt image in expense form
2. Client uploads to Supabase Storage → gets signed URL
3. Client calls POST /api/ai/ocr with { imageUrl }
4. Next.js API calls Railway FastAPI: POST /ocr { imageUrl }
5. FastAPI: downloads image → sends to OpenAI Vision API
6. OpenAI returns: { vendor, date, amount, vat_amount, category }
7. FastAPI returns JSON to Next.js → Next.js returns to client
8. Client pre-fills expense form fields
9. User reviews, corrects if needed, saves expense
10. Store OCR result hash → skip re-processing same image
```

### VAT Calculation Logic
```
Monthly VAT Calculation:
─────────────────────────────────────────────────────
Output VAT = SUM(invoice.vatTotal) 
             WHERE invoice.invoiceDate BETWEEN period_start AND period_end
             AND invoice.status != CANCELLED

Input VAT  = SUM(expense.vatAmount)
             WHERE expense.expenseDate BETWEEN period_start AND period_end

Net Payable = Output VAT - Input VAT

IF Net Payable > 0 → Pay to NBR by 27th of following month
IF Net Payable < 0 → Excess input credit (carry forward or refund claim)
─────────────────────────────────────────────────────
```

---

## 11. UI Screens

### Screen 1: Landing Page
- **Purpose:** Convert SME owner from ad/search to signup
- **Key components:**
  - Hero: "Replace Your Accountant. File VAT in 5 Minutes."
  - ROI Calculator: Input field "How much do you pay your accountant?" → shows annual savings
  - Feature section: Invoice → Expense → VAT (3-step visual flow)
  - Pricing table (all 4 plans, Free highlighted to reduce friction)
  - Testimonial section (use beta user quotes)
  - CTA: "Start Free — No Credit Card Required"
- **Important:** The ROI calculator is the most critical conversion element. Build it as an interactive widget.

### Screen 2: Signup + Company Onboarding
- **Purpose:** Account creation + company configuration
- **Flow:**
  - Step 1: Email + password (or Google OAuth)
  - Step 2: Company name, BIN number (with format tooltip: 12 digits), TIN number (optional)
  - Step 3: VAT type (Standard 15% / Zero-rated / Exempt / Truncated), business category
  - Step 4: Fiscal year start (default July for BD), bank account (optional, skip-able)
- **Design note:** Wizard with progress bar. Maximum 4 steps. Don't overwhelm.
- **APIs:** POST /api/auth/signup, POST /api/companies

### Screen 3: Dashboard
- **Purpose:** Financial health at a glance after login
- **Components:**
  - Top banner: "VAT return due in X days" (red if <7 days, yellow if <14)
  - KPI cards row: This Month Revenue | This Month Expenses | VAT Payable | Outstanding Invoices
  - Revenue vs Expenses bar chart (last 6 months, Recharts)
  - Recent transactions list (last 10, with invoice/expense badge)
  - Quick actions: "+ New Invoice", "+ Add Expense", "View VAT Report"
- **APIs:** GET /api/analytics/summary, GET /api/analytics/monthly

### Screen 4: Invoice List
- **Purpose:** Manage all invoices
- **Components:**
  - Search bar (customer name, invoice number)
  - Filters: Status (All / Draft / Sent / Paid / Overdue), Date range
  - Table: Invoice #, Customer, Date, Due Date, Amount, VAT, Total, Status, Actions
  - Status badges (color-coded)
  - Bulk select + Mark as Paid action
  - "+ New Invoice" button (prominent, top right)
  - Pagination
- **APIs:** GET /api/invoices

### Screen 5: Create / Edit Invoice
- **Purpose:** Issue a Mushak-compliant sales invoice
- **Components:**
  - Customer select (searchable dropdown + "Add New Customer" inline)
  - Invoice date (default today) + Due date
  - Line items table: Description | Qty | Unit Price | VAT Rate (dropdown: 0%, 5%, 7.5%, 10%, 15%) | VAT Amount | Line Total
  - "+ Add Line Item" button
  - Subtotal / VAT Total / Grand Total auto-computed
  - Notes field (optional)
  - Action buttons: "Save Draft" | "Save & Download PDF" | "Save & Send to Customer"
- **UX:** Line item VAT auto-calculates on blur. Total updates in real-time.
- **APIs:** GET /api/invoices/next-number, POST /api/invoices, GET /api/customers

### Screen 6: Invoice Detail
- **Purpose:** View invoice + take actions
- **Components:**
  - Invoice preview (same layout as PDF)
  - Status timeline (Created → Sent → Paid)
  - Actions based on status: Download PDF, Send Email, Mark as Paid, Edit (if Draft), Cancel
  - Activity log (created by, sent at, paid at)
- **APIs:** GET /api/invoices/:id, GET /api/invoices/:id/pdf

### Screen 7: Expense List + Add Expense
- **Purpose:** Track all business expenses + capture input VAT
- **List components:** Date filter, category filter, table (Date, Supplier, Category, Amount, VAT, Receipt), totals row
- **Add Expense modal:**
  - Date picker
  - Supplier select / quick-add
  - Category dropdown
  - Amount (before VAT)
  - VAT Amount (input VAT claim)
  - Receipt upload button → triggers OCR if Pro plan
  - OCR result panel: shows extracted data with "Looks right?" confirm/edit flow
  - Notes
- **APIs:** GET /api/expenses, POST /api/expenses, POST /api/ai/ocr

### Screen 8: VAT Report
- **Purpose:** View monthly VAT position + export return
- **Components:**
  - Period picker (month + year)
  - Summary cards: Output VAT | Input VAT | Net Payable (red if positive = you owe)
  - Output VAT table: invoice by invoice breakdown
  - Input VAT table: expense by expense breakdown
  - "Export Mushak 9.1 PDF" button (paywalled → upsell modal if on Free)
  - "Mark as Filed" button + challan reference input
  - Filed history: list of past filed periods
- **Critical:** Make it crystal clear what the net payable is. No confusion. Big number, big font.
- **APIs:** GET /api/vat/:year/:month, POST /api/vat/:year/:month/file, GET /api/vat/:year/:month/pdf

### Screen 9: Bank Statement Import
- **Purpose:** Reconcile bank transactions with invoices/expenses
- **Components:**
  - Bank account select + "Add Account" option
  - CSV upload area (drag-and-drop + click)
  - Sample CSV download link (show expected column format)
  - Parsed transactions preview table (before saving)
  - After import: transactions list with "Match" button on each
  - Match modal: search invoices or expenses → confirm match
  - Unmatched transactions count badge
- **APIs:** POST /api/bank/import, GET /api/bank/transactions, POST /api/bank/transactions/:id/match

### Screen 10: Customer Management
- **Purpose:** Maintain customer database
- **Components:** Table (Name, BIN, Email, Phone, Outstanding Balance), add/edit modal, delete (only if no invoices)
- **Important field:** BIN number — required for B2B VAT; show tooltip explaining why

### Screen 11: Settings
- **Tabs:**
  - **Company:** Edit name, BIN, TIN, logo, address, fiscal year, VAT type
  - **Team:** List of users (owner + invited accountants), invite by email, remove access
  - **Subscription:** Current plan, next billing date, "Upgrade" CTA, billing history
  - **Notifications:** Toggle email reminders (VAT deadline, overdue invoices)

### Screen 12: Subscription/Upgrade
- **Purpose:** Convert free to paid
- **Components:**
  - Plan comparison table (features side by side)
  - Current plan highlighted
  - Payment options: bKash, Nagad, Card (all via SSLCommerz)
  - "Trusted by X businesses" social proof
  - FAQ: "Can I cancel anytime?" "Is my data safe?" "Do I need an accountant?"
- **UX tip:** Show the ROI again here. "Business plan saves you BDT 5,500/month vs. accountant fees."

---

## 12. Key Business Logic

### Invoice Number Generation
```typescript
// Always sequential per company, never reuse, gap-free
async function getNextInvoiceNumber(companyId: string): Promise<string> {
  const lastInvoice = await db.invoice.findFirst({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true }
  });
  
  if (!lastInvoice) return 'INV-0001';
  
  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
  const nextNumber = String(lastNumber + 1).padStart(4, '0');
  return `INV-${nextNumber}`;
}
```

### VAT Rate Rules (Bangladesh)
```typescript
const VAT_RATES = {
  STANDARD: 15,          // Most goods and services
  REDUCED_10: 10,        // Some construction services
  REDUCED_7_5: 7.5,      // Some professional services
  REDUCED_5: 5,          // Some food items
  REDUCED_4: 4,          // Some basic necessities
  ZERO_RATED: 0,         // Exports, some essential goods
  EXEMPT: 0,             // Truly exempt (not the same as zero-rated — no input claim)
} as const;
```

### VAT Period Dates
```typescript
// NBR VAT filing: due by 27th of the FOLLOWING month
// Period: 1st to last day of month
function getVatDeadline(year: number, month: number): Date {
  // month is 1-indexed
  const followingMonth = month === 12 ? 1 : month + 1;
  const followingYear = month === 12 ? year + 1 : year;
  return new Date(followingYear, followingMonth - 1, 27);
}
```

### Feature Gating Middleware
```typescript
// Use this in every paywalled API route
async function requirePlan(
  companyId: string, 
  minPlan: 'BUSINESS' | 'PRO' | 'ACCOUNTANT_PACK'
) {
  const sub = await db.subscription.findUnique({ where: { companyId } });
  const planOrder = { FREE: 0, BUSINESS: 1, PRO: 2, ACCOUNTANT_PACK: 3 };
  
  if (!sub || planOrder[sub.plan] < planOrder[minPlan]) {
    throw new Error('UPGRADE_REQUIRED');
  }
}
```

### OCR Prompt (OpenAI Vision)
```typescript
const OCR_PROMPT = `
You are a receipt/invoice parser for Bangladesh. Extract the following fields:
- vendor_name: business name on receipt
- date: date of purchase (ISO format YYYY-MM-DD)
- subtotal: amount before VAT (number only, no currency symbol)
- vat_amount: VAT charged (number only, if visible)
- total_amount: total amount paid
- category: one of [COST_OF_GOODS, RENT, UTILITIES, TRANSPORT, MARKETING, SALARIES, OFFICE_SUPPLIES, OTHER]

Respond ONLY with valid JSON. No explanation. If a field is not visible, use null.
Example: {"vendor_name": "Meena Bazar", "date": "2024-01-15", "subtotal": 850.00, "vat_amount": 127.50, "total_amount": 977.50, "category": "COST_OF_GOODS"}
`;
```

---

## 13. Payment Integration

### SSLCommerz Integration Flow
```typescript
// 1. Initiate payment session
async function initiatePayment(companyId: string, plan: PlanType) {
  const prices = { BUSINESS: 2499, PRO: 5999, ACCOUNTANT_PACK: 14999 };
  
  const payload = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
    total_amount: prices[plan],
    currency: 'BDT',
    tran_id: `HISAB-${companyId}-${Date.now()}`,
    success_url: `${APP_URL}/api/webhooks/sslcommerz/success`,
    fail_url: `${APP_URL}/payment/failed`,
    cancel_url: `${APP_URL}/payment/cancelled`,
    product_name: `Hisab ${plan} Plan`,
    product_category: 'SaaS Subscription',
    cus_name: company.name,
    cus_email: user.email,
    // Required by SSLCommerz:
    shipping_method: 'NO',
    product_profile: 'non-physical-goods',
  };
  
  // POST to SSLCommerz session URL
  // Returns: { GatewayPageURL } — redirect user here
}

// 2. Webhook handler (POST /api/webhooks/sslcommerz)
async function handlePaymentWebhook(payload: SSLPayload) {
  // ALWAYS validate the hash — don't skip this
  const isValid = validateSSLHash(payload);
  if (!isValid) return { status: 'invalid' };
  
  if (payload.status === 'VALID') {
    await db.subscription.update({
      where: { companyId },
      data: {
        plan: payload.value_a,  // plan passed in custom field
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: addMonths(new Date(), 1),
        sslTransactionId: payload.tran_id,
      }
    });
  }
}
```

### Important SSLCommerz Notes
- Use sandbox for development: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php`
- Live endpoint: `https://securepay.sslcommerz.com/gwprocess/v4/api.php`
- Always verify the MD5 hash of the IPN response before updating subscription
- SSLCommerz doesn't do automatic recurring billing — you must re-initiate each month OR use their stored card feature (ask them about it)
- For MVP: manual monthly payment is fine. Send reminder email on day 25, payment link in email.

---

## 14. Growth & Acquisition

### Month 1–2: Get First 30 Paying Customers (Manual)

**Step 1:** Join these Facebook groups (they have 20,000–100,000 members each):
- "Bangladesh SME Business Community"
- "Dhaka Business Network"
- "Import Export Bangladesh"
- "বাংলাদেশ উদ্যোক্তা (Bangladesh Entrepreneurs)"
- Any district-level trader association group

**Post template (use in groups, don't make it sound like an ad):**
```
আমি একটি নতুন সফটওয়্যার তৈরি করেছি যেটা দিয়ে VAT return মাত্র ৫ মিনিটে করা যায়।
প্রথম ৩০ জন ব্যবসায়ী ৩ মাস বিনামূল্যে ব্যবহার করতে পারবেন।
আগ্রহীরা comment করুন বা message করুন।

[English version]
I built a tool that generates VAT returns in 5 minutes. First 30 businesses get 3 months free.
Comment or message me if interested.
```

**Step 2:** Do 1-on-1 demos via WhatsApp video call or Google Meet.  
**Don't send a link and hope.** Walk them through it. Watch where they get confused.

**Step 3:** After demo, send them an invoice for BDT 0 (free beta). Set a calendar reminder to follow up at month 3 to convert to paid.

---

### Month 3–6: Accountant Channel

Approach 10 accounting firms in Dhaka (they're listed on ICAB website).  
**Pitch:** "Your clients already pay you BDT 3,000–15,000/month for VAT work. Hisab does 80% of the work for you in minutes. You serve more clients with the same time. You earn 30% of their monthly subscription."

For an accountant managing 30 clients at BDT 2,499/month Business plan:  
30 × 2,499 × 30% = **BDT 22,491/month passive income** for them.  
That's a real number that gets attention.

---

### Month 6–12: Paid Acquisition

Facebook/Instagram targeting:
- Age: 30–55
- Location: Dhaka, Chittagong, Sylhet, Gazipur, Narayanganj
- Interests: Business, Entrepreneurship, Import/Export
- Behavior: Page admins (these are business owners)

Ad creative: video showing "Before Hisab" (notebook, accountant stress) vs "After Hisab" (3 clicks, VAT return done). No fancy production needed. Screen recording + voiceover.

Target CAC: BDT 5,000–8,000 (5% conversion from landing page visit → trial → paid)

---

### Viral Mechanics
1. **Invoice footer** — every PDF has "Powered by Hisab" with a tiny link (removable on Pro). When a supplier sends a Mushak-compliant invoice to a buyer, the buyer sees it and asks "how did you make this?"
2. **Accountant network** — one accountant using Hisab for 30 clients = 30 customers who all heard about it from their trusted accountant
3. **FBCCI word of mouth** — chamber members talk. One member who saves BDT 5,000/month tells five others.

---

## 15. Risks & Mitigations

### Risk 1: NBR changes Mushak form format
- **Probability:** Medium (happens every 2–3 years)
- **Impact:** High — your core PDF export breaks
- **Mitigation:** Abstract ALL Mushak form fields into a JSON configuration. Changing the form = update the config, not code. Follow NBR SROs (Statutory Regulatory Orders) quarterly.

### Risk 2: SSLCommerz payment downtime
- **Probability:** Medium (happens 2–3 times/year)
- **Impact:** Medium — can't accept new subscriptions during downtime
- **Mitigation:** Build payment abstraction layer. SSLCommerz and SurjoPay use similar APIs. Switching should be a config change, not a rewrite.

### Risk 3: OpenAI API cost spike
- **Probability:** Low (they've been reducing prices)
- **Impact:** Medium — OCR becomes expensive at scale
- **Mitigation:** Cache OCR results by image hash. Add Tesseract as fallback for clear, text-only receipts. Rate-limit OCR calls per company per day.

### Risk 4: SMEs don't pay for software
- **Probability:** Medium (real cultural challenge)
- **Impact:** High — no revenue
- **Mitigation:** Price anchored against accountant cost (not as "software cost"). Free tier creates habit before asking for payment. First paywall should be felt on the most painful day (VAT deadline week).

### Risk 5: NBR builds a free government tool
- **Probability:** Low (government digital projects in BD move slowly)
- **Impact:** High — kills the VAT return export value prop
- **Mitigation:** If this happens, pivot from "VAT filing tool" to "financial operations platform." VAT export is a feature, not the whole product. Bank reconciliation, P&L, invoicing, and business insights are the real moat.

### Risk 6: Larger Indian SaaS enters Bangladesh
- **Probability:** Low in next 2 years
- **Impact:** Medium
- **Mitigation:** Move fast. Your moat is: local support (WhatsApp), BDT pricing, bKash payment, BD-specific compliance, and the relationships you build in the first 12 months.

### Risk 7: Data breach / customer financial data exposed
- **Probability:** Low (if you follow security checklist)
- **Impact:** Very high — kills trust, possible legal liability
- **Mitigation:** RLS on all tables, no public buckets, signed URLs for storage, encrypt NID/BIN fields at rest, never log financial data, quarterly security audit.

---

## 16. Metrics to Track

### Set these up in PostHog from Day 1

**Acquisition:**
- Signups per day / week
- Signup source (direct, Facebook ad, referral, organic search)
- Time from landing page visit → signup (conversion rate)

**Activation:**
- % of signups who create their first invoice within 48 hours
- % of signups who reach "View VAT Report" within first week
- This is your activation metric — if it's below 40%, your onboarding is broken

**Revenue:**
- MRR (Monthly Recurring Revenue)
- MRR growth rate (target: >15%/month)
- ARPU (Average Revenue Per User)
- New MRR vs Churned MRR vs Expansion MRR

**Retention:**
- Monthly churn rate (target: <4%)
- Net Revenue Retention (target: >100%)
- DAU/MAU ratio (how often are users logging in?)

**Product:**
- Invoices created per week (engagement signal)
- VAT report views per month (shows they're using core feature)
- OCR usage rate (Pro plan engagement)
- Bank imports per month

**Business:**
- Payback period on CAC
- LTV:CAC ratio (target: >3x)
- Months to first BDT 1M MRR

### Weekly Review (do this every Monday, 30 minutes)
```
1. How many signups last week? vs. week before?
2. How many conversions from free to paid? 
3. How many churns? What was their reason?
4. What's the #1 error in Sentry?
5. What feature is most used in PostHog?
6. Did we hit MRR target?
```

---

## 17. Funding Targets

### Stage 0: Pre-revenue (now)
- Build with zero external capital
- Use free tiers of all services

### Stage 1: Friends & Family / Angel (Month 6–9)
- Trigger: 100+ paying customers, BDT 300,000+ MRR
- Amount: $20,000–50,000 (BDT 22–55 lakh)
- Source: Local angels, IDLC Venture, BdJobs founder network
- Use: Hire 1 customer support person, invest in Facebook ads
- Valuation: ~$500K–$1M (10x ARR multiple)

### Stage 2: Seed (Month 12–18)
- Trigger: 500+ customers, BDT 1.5M+ MRR (~$13,600/month), <4% churn
- Amount: $300,000–$600,000
- Source: Anchorless Bangladesh, BD Venture, 500 Global
- Use: 3-person team, product expansion, South Asia entry
- Valuation: $3–5M

### Stage 3: Series A (Month 24+)
- Trigger: $1M ARR, launched in India or Myanmar, NRR >110%
- Amount: $3–5M
- Source: YC (if incorporated in US), Surge by Sequoia, Tiger Global
- Valuation: $10–15M

### What Investors Will Ask — Be Ready
1. "What's your churn rate?" — Must be <5%/month for seed stage
2. "Why won't NBR or Tally copy this?" — Your answer: local support, BDT pricing, bKash, speed of iteration
3. "What's the path to India?" — Bangladesh validation → identical compliance pain in small/mid India markets
4. "Why you?" — ML/AI background means you can build competitive OCR moat; full-stack means no hiring dependency

---

## 18. Build Checklist

### Before Writing a Single Line of Code
- [ ] Talk to 20 potential customers (business owners in your network)
- [ ] Ask: "How do you file VAT today?" and shut up for 5 minutes
- [ ] Ask: "How much do you pay your accountant?"
- [ ] Ask: "Would you pay BDT 2,499/month if VAT filing took 5 minutes?"
- [ ] Get 5 people to say "yes" before building anything
- [ ] Verify your understanding of Mushak 9.1 format with an actual accountant (1 hour consult, pay them BDT 500)

### Week 1 Setup Checklist
- [ ] Create GitHub repository (private)
- [ ] Initialize Next.js 14 project
- [ ] Set up Supabase project (save all keys)
- [ ] Configure Prisma + connection string
- [ ] Add Sentry (mandatory before any users)
- [ ] Set up GitHub Actions CI
- [ ] Deploy skeleton to Vercel (even if it's just a hello world)
- [ ] Create Railway account + set up Python service skeleton
- [ ] Register domain (hisab.com.bd or similar)
- [ ] Create a simple landing page even if it's just an email capture

### Pre-Launch Checklist
- [ ] Privacy Policy live (Bangladesh Data Protection Act 2023 compliant)
- [ ] Terms of Service live
- [ ] Error pages (404, 500) designed properly
- [ ] All Sentry errors from beta resolved
- [ ] Loading states on every async operation
- [ ] Mobile responsive (test on actual Android phone, not just browser dev tools)
- [ ] SSLCommerz switched from sandbox to live
- [ ] Supabase backups enabled (daily)
- [ ] PostHog funnel tracking configured
- [ ] VAT calculation formula verified by an accountant
- [ ] PDF output reviewed and approved by at least 5 beta users
- [ ] All environment variables set in Vercel production

### Security Checklist
- [ ] Row Level Security enabled and tested on all Supabase tables
- [ ] No sensitive data in client-side console.log
- [ ] Supabase Storage buckets are private (not public)
- [ ] Signed URLs with expiry for receipt downloads
- [ ] SSLCommerz webhook hash validation implemented
- [ ] Rate limiting on OCR endpoint
- [ ] Input validation on BIN/TIN number fields
- [ ] HTTP-only cookies for auth tokens (no localStorage for JWT)

---

## Quick Reference

| Item | Value |
|------|-------|
| VAT standard rate | 15% |
| VAT filing deadline | 27th of following month |
| NBR VAT portal | ibas.finance.gov.bd |
| BIN format | 9-digit (new) or 11-digit (old), verify with customer |
| TIN format | 12-digit |
| Mushak invoice form | Mushak 6.3 (sales invoice) |
| Mushak purchase form | Mushak 6.6 (purchase record) |
| VAT return form | Mushak 9.1 |
| NBR penalty (late filing) | BDT 10,000 minimum |
| Bangladesh fiscal year | July 1 – June 30 |
| Weekend days | Friday + Saturday |
| Currency | BDT (৳) |
| Primary payment method | bKash (mobile money) |
| Secondary payment | Nagad, Rocket, bank cards |

---

*This document is your source of truth while building Hisab. Update it as decisions change. When in doubt, re-read Section 3 (who you're building for) and Section 18 (talk to customers first).*
