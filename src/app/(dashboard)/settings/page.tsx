import { TopBar } from "@/components/layout/top-bar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <main className="p-6">
        <div className="rounded-lg border border-border bg-surface p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            Company profile, VAT settings, and team members.
          </p>
        </div>
      </main>
    </>
  );
}
