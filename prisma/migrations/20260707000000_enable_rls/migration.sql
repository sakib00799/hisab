-- Enable Row Level Security on all application tables (defense in depth).
--
-- The app reads/writes Postgres exclusively through Prisma connected as the
-- table owner, and table owners bypass RLS unless FORCE is set — so this does
-- not affect application behavior. It blocks direct PostgREST/Supabase-client
-- access with the publishable (anon) key, which the app never uses for data.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceSequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VatPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OcrCache" ENABLE ROW LEVEL SECURITY;
