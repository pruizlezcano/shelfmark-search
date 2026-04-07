import { test, expect } from "../fixtures";
import {
  expectShelfmarkSearchPage,
  HARDCOVER_URL,
  setExtensionSettings,
  TIMEOUT,
  waitForBookDetails,
} from "./helpers";

test.describe("Hardcover strategy", () => {
  test.slow();

  test("injects desktop and mobile Shelfmark buttons", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(HARDCOVER_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".shelfmark-button-desktop")).toHaveCount(1, {
      timeout: TIMEOUT,
    });
    await expect(page.locator(".shelfmark-button-mobile")).toHaveCount(1, {
      timeout: TIMEOUT,
    });
  });

  test("gets book details", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(HARDCOVER_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page, 20000);
    expect(details).not.toBeNull();
    expect(details.contentType).toBe("ebook");
    expect(details.title.toLowerCase()).toContain("harry potter");
    expect(details.author?.toLowerCase() || "").toContain("rowling");
  });

  test("clicking the Shelfmark button opens a search tab", async ({
    context,
  }) => {
    const baseUrl = "https://example.com";
    await setExtensionSettings(context, { baseUrl, useCombinedSearch: false });

    const page = await context.newPage();
    await page.goto(HARDCOVER_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page, 20000);

    const [desktopPage] = await Promise.all([
      context.waitForEvent("page"),
      page.locator("#shelfmark-btn-desktop").click(),
    ]);
    await expectShelfmarkSearchPage(desktopPage, baseUrl, details);
  });
});
