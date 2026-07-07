import { Page, expect } from "@playwright/test";

export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

export function uniqueBin(): string {
  return String(Date.now()).padStart(12, "0").slice(-12);
}

export const TEST_PASSWORD = "E2ePassword123";

/** Sign up a fresh user and complete the onboarding wizard to the dashboard. */
export async function signupAndOnboard(
  page: Page,
  options: { companyName?: string } = {}
) {
  const email = uniqueEmail();
  const companyName = options.companyName ?? `E2E Traders ${Date.now()}`;

  await page.goto("/signup");
  await page.fill("#name", "E2E Tester");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  // Step 1 — company details
  await expect(page.getByText("Step 1 of 4")).toBeVisible({ timeout: 20_000 });
  await page.fill("#company", companyName);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2 — VAT registration
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
  await page.fill("#bin", uniqueBin());
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3 — bank account (optional, skip)
  await expect(page.getByText("Step 3 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 — finish
  await expect(page.getByText("Step 4 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Go to dashboard" }).click();

  await page.waitForURL("**/dashboard", { timeout: 30_000 });
  return { email, companyName };
}

/** Create an invoice through the UI with a brand-new customer. */
export async function createInvoiceViaUi(
  page: Page,
  input: {
    customerName: string;
    description: string;
    quantity: string;
    unitPrice: string;
    vatRate: string;
  }
) {
  await page.goto("/invoices/new");
  await page.getByRole("button", { name: "Add new customer" }).click();
  await page.fill("#newCustomerName", input.customerName);
  await page.fill("#description", input.description);
  await page.fill("#quantity", input.quantity);
  await page.fill("#unitPrice", input.unitPrice);
  await page.fill("#vatRate", input.vatRate);
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.waitForURL(/\/invoices\/(?!new)[^/]+$/, { timeout: 30_000 });
}
