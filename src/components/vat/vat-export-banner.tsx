import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Lock, Sparkles } from "lucide-react";

interface VatExportBannerProps {
  canExport: boolean;
  year: number;
  month: number;
}

export function VatExportBanner({
  canExport,
  year,
  month,
}: VatExportBannerProps) {
  if (canExport) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Download className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mushak 9.1 export</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Download your NBR-ready VAT return PDF for filing.
            </p>
          </div>
        </div>
        <Button
          render={
            <a
              href={`/api/vat/${year}/${month}/pdf`}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <Download className="size-4" />
          Export PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Mushak 9.1 PDF export
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your VAT totals are calculated above. Upgrade to Business to download
            the NBR filing PDF.
          </p>
        </div>
      </div>
      <Button
        className="shrink-0 bg-accent hover:bg-accent/90"
        render={<Link href="/upgrade" />}
      >
        <Sparkles className="size-4" />
        Upgrade — ৳2,499/mo
      </Button>
    </div>
  );
}
