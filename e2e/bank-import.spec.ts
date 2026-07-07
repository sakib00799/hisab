import path from "node:path";
import { expect, test } from "@playwright/test";
import { signupAndOnboard } from "./helpers";

test.describe("bank import", () => {
  test("add account, import BRAC CSV, transactions appear", async ({
    page,
  }) => {
    await signupAndOnboard(page);

    await page.goto("/bank");
    await page.getByPlaceholder("BRAC Bank").fill("BRAC Bank");
    // The account-number input is the second text input in the add form.
    await page
      .locator("form")
      .filter({ hasText: "Bank name" })
      .locator("input")
      .nth(1)
      .fill("9876543210");
    await page.getByRole("button", { name: "Add account" }).click();

    await expect(page.getByText("Import CSV statement")).toBeVisible();

    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, "fixtures", "brac-statement.csv"));

    // Imported rows appear with auto-categorization.
    await expect(page.getByText("bKash transfer to supplier")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("Customer payment INV-0001")).toBeVisible();
    await expect(page.getByText("Mobile Banking")).toBeVisible();
  });
});
