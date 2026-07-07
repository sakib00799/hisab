import { expect, test } from "@playwright/test";
import { signupAndOnboard } from "./helpers";

test.describe("session and route protection", () => {
  test("unauthenticated visitors are redirected away from the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/(login|signup)/, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Log in/i })).toBeVisible();
  });

  test("session survives a page reload", async ({ page }) => {
    await signupAndOnboard(page);

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
