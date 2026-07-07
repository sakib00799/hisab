import { expect, test } from "@playwright/test";
import { createInvoiceViaUi, signupAndOnboard } from "./helpers";

test.describe("invoice slice", () => {
  test("create invoice with a new customer, see it in detail and list", async ({
    page,
  }) => {
    await signupAndOnboard(page);

    await page.goto("/invoices/new");
    await page.getByRole("button", { name: "Add new customer" }).click();
    await page.fill("#newCustomerName", "Karim & Sons");
    await page.fill("#description", "Supply of goods — July 2026");
    await page.fill("#quantity", "10");
    await page.fill("#unitPrice", "1000");
    await page.fill("#vatRate", "15");

    // Live totals update before submitting: 10,000 + 1,500 VAT = 11,500.
    await expect(page.getByText("Subtotal")).toBeVisible();
    await expect(page.getByText(/11,500/)).toBeVisible();

    await page.getByRole("button", { name: "Create invoice" }).click();
    await page.waitForURL(/\/invoices\/(?!new)[^/]+$/, { timeout: 30_000 });

    // Detail page shows the sequential number and totals.
    await expect(page.getByText("INV-0001").first()).toBeVisible();
    await expect(page.getByText("Karim & Sons").first()).toBeVisible();
    await expect(page.getByText("Total due")).toBeVisible();

    // List page shows the invoice.
    await page.goto("/invoices");
    await expect(
      page.getByRole("link", { name: "INV-0001" })
    ).toBeVisible();
  });

  test("second invoice gets the next sequential number", async ({ page }) => {
    await signupAndOnboard(page);

    await createInvoiceViaUi(page, {
      customerName: "First Customer",
      description: "First delivery",
      quantity: "1",
      unitPrice: "500",
      vatRate: "15",
    });

    await page.goto("/invoices/new");
    await page.fill("#description", "Second delivery");
    await page.fill("#quantity", "2");
    await page.fill("#unitPrice", "750",);
    await page.fill("#vatRate", "15");
    // Existing customer is preselectable from the dropdown.
    await page.selectOption("#customer", { label: "First Customer" });
    await page.getByRole("button", { name: "Create invoice" }).click();
    await page.waitForURL(/\/invoices\/(?!new)[^/]+$/, { timeout: 30_000 });

    await expect(page.getByText("INV-0002").first()).toBeVisible();
  });
});
