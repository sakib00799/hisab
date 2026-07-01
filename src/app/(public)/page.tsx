import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calculator,
  Landmark,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              H
            </div>
            <span className="text-lg font-semibold">Hisab</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your business accounts,
            <br />
            <span className="text-primary">without the headache</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Invoices, VAT reports, and expense tracking — built for Dhaka business
            owners who need clarity, not complexity.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" render={<Link href="/signup" />}>
              Start free trial
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-surface py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Invoicing",
                desc: "Create and track invoices in seconds",
              },
              {
                icon: Calculator,
                title: "VAT Reports",
                desc: "NBR-ready VAT summaries every month",
              },
              {
                icon: Landmark,
                title: "Bank Import",
                desc: "Match bank transactions automatically",
              },
              {
                icon: Shield,
                title: "Secure",
                desc: "Your data stays private and backed up",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border p-6">
                <feature.icon className="size-8 text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hisab. Made for Bangladesh businesses.
      </footer>
    </div>
  );
}
