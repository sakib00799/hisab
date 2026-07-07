import { expect, test } from "@playwright/test";
import { createInvoiceViaUi, signupAndOnboard } from "./helpers";

test.describe("VAT report", () => {
  test("shows output VAT from created invoices", async ({ page }) => {
    await signupAndOnboard(page);

    // 10 × 1,000 @ 15% → output VAT 1,500 this month.
    await createInvoiceViaUi(page, {
      customerName: "VAT Customer",
      description: "VAT test goods",
      quantity: "10",
      unitPrice: "1000",
      vatRate: "15",
    });

    await page.goto("/vat");
    await expect(page.getByText("Output VAT")).toBeVisible();
    await expect(page.getByText("Net VAT Payable")).toBeVisible();
    await expect(page.getByText(/1,500/).first()).toBeVisible();

    // The invoice appears in the output register.
    await expect(page.getByText("Output register")).toBeVisible();
    await expect(page.getByText("INV-0001")).toBeVisible();
  });

  test("FREE plan sees VAT data but export is gated", async ({ page }) => {
    await signupAndOnboard(page);

    await page.goto("/vat");
    // Data visible without a paywall.
    await expect(page.getByText("Output VAT")).toBeVisible();
    // Export gated with an upgrade CTA instead of a download.
    await expect(page.getByText("Mushak 9.1 PDF export")).toBeVisible();
    await expect(page.getByRole("link", { name: /Upgrade/ })).toBeVisible();

    // The export API itself returns 403 UPGRADE_REQUIRED for FREE plan.
    const now = new Date();
    const res = await page.request.get(
      `/api/vat/${now.getFullYear()}/${now.getMonth() + 1}/pdf`
    );
    expect(res.status()).toBe(403);
  });
});
