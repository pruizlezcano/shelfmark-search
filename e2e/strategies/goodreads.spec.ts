import { test, expect } from "../fixtures";
import {
  expectShelfmarkSearchPage,
  GOODREADS_URL,
  setExtensionSettings,
  TIMEOUT,
  waitForBookDetails,
} from "./helpers";

test.describe("Goodreads strategy", () => {
  test.slow();

  test("injects Shelfmark button", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(GOODREADS_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".shelfmark-button")).toHaveCount(2, {
      timeout: TIMEOUT,
    });
  });

  test("gets book details", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(GOODREADS_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page);
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
    await page.goto(GOODREADS_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page);
    const [openedPage] = await Promise.all([
      context.waitForEvent("page"),
      page.locator("#shelfmark-btn").first().click(),
    ]);

    await expectShelfmarkSearchPage(openedPage, baseUrl, details);
  });
});
