import { expect, test } from "@playwright/test";
import { signupAndOnboard } from "./helpers";

test.describe("auth and onboarding", () => {
  test("signup → company wizard → dashboard", async ({ page }) => {
    const { companyName } = await signupAndOnboard(page);

    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    // Real company name (not a hardcoded placeholder) in the top bar.
    await expect(page.getByText(companyName)).toBeVisible();
    await expect(page.getByText("Total Revenue")).toBeVisible();
  });

  test("landing page links to privacy and terms", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(
      page.getByRole("heading", { name: "Privacy Policy" })
    ).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Terms of Service" }).click();
    await expect(
      page.getByRole("heading", { name: "Terms of Service" })
    ).toBeVisible();
  });
});
