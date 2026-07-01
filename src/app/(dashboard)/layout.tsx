import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCompanyContext } from "@/lib/auth/company-context";
import { getSession } from "@/lib/auth/session";
import { getCompany } from "@/lib/services/company.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getSession();
  if (!authUser) {
    redirect("/login");
  }

  const ctx = await getCompanyContext();
  if (!ctx) {
    redirect("/onboarding");
  }

  const company = await getCompany(ctx);

  return (
    <DashboardShell company={{ name: company.name }}>
      {children}
    </DashboardShell>
  );
}
