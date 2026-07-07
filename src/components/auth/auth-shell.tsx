import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthShell({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
          H
        </div>
        <span className="text-2xl font-semibold text-foreground">Hisab</span>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Business accounting made simple for Bangladesh
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLink({ href, children, className }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn("text-sm font-medium text-primary hover:underline", className)}
    >
      {children}
    </Link>
  );
}
