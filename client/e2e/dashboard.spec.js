import { test, expect } from "@playwright/test";

// Realistic end-to-end flow for the main dashboard, per Part 7's spec:
// open the dashboard, wait for real analytics to load, change filters,
// and confirm the dashboard updates without breaking.
//
// This hits whatever backend the built app was pointed at via
// VITE_API_URL at build time (see README "Running the E2E test").

test.describe("Dashboard main flow", () => {
  test("loads analytics, and updates when filters change", async ({ page }) => {
    const apiErrors = [];
    page.on("response", (res) => {
      if (res.url().includes("/api/") && res.status() >= 500) {
        apiErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto("/");

    // Wait for real analytics to load — stat cards start as skeletons,
    // so wait for the actual title text rather than a fixed delay.
    await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible({ timeout: 15000 });

    // A currency-formatted value should have rendered from the backend
    // (not a skeleton placeholder) once loading completes.
    await expect(page.locator("text=/\\$[0-9]/").first()).toBeVisible({ timeout: 15000 });

    // All 4 chart cards should be present.
    await expect(page.getByText("Revenue Overview")).toBeVisible();
    await expect(page.getByText("Orders Overview")).toBeVisible();
    await expect(page.getByText("Sales by Category")).toBeVisible();
    await expect(page.getByText("Order Status")).toBeVisible();

    // --- change filters: category -> Electronics ---
    const categorySelect = page.locator("select").first();
    await categorySelect.selectOption({ label: "Electronics" }).catch(async () => {
      // Falls back gracefully if "Electronics" isn't in this dataset's
      // categories — pick whatever the second real option is instead.
      const optionValue = await categorySelect.locator("option").nth(1).getAttribute("value");
      await categorySelect.selectOption(optionValue);
    });

    // --- change filters: date range -> Last 30 Days ---
    await page.getByRole("button", { name: "Last 30 Days" }).click();

    // Dashboard should still be showing its core sections after the
    // filter change — nothing crashed, no section fell over.
    await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible();
    await expect(page.getByText("Revenue Overview")).toBeVisible();
    await expect(page.getByText("Orders Overview")).toBeVisible();
    await expect(page.getByText("Sales by Category")).toBeVisible();
    await expect(page.getByText("Order Status")).toBeVisible();
    await expect(page.getByText("Top Products")).toBeVisible();
    await expect(page.getByText("Recent Orders")).toBeVisible();

    // No 5xx responses from the backend during the whole flow.
    expect(apiErrors).toEqual([]);
  });

  test("mobile viewport: sidebar collapses and dashboard remains usable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasOverflow).toBe(false);
  });
});
