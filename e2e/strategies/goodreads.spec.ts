import { test, expect } from "../fixtures";
import {
  expectShelfmarkSearchPage,
  GOODREADS_URL,
  openPageAtViewport,
  setExtensionSettings,
  TIMEOUT,
  VIEWPORTS,
  waitForBookDetails,
} from "./helpers";

test.describe("Goodreads strategy", () => {
  test.slow();

  const getGoodreadsButtonSelector = (viewportName: string) =>
    viewportName.startsWith("desktop")
      ? "#shelfmark-btn-desktop"
      : "#shelfmark-btn-mobile";

  test("gets book details", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(GOODREADS_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page);
    expect(details).not.toBeNull();
    expect(details.contentType).toBe("ebook");
    expect(details.title.toLowerCase()).toContain("harry potter");
    expect(details.author?.toLowerCase() || "").toContain("rowling");
  });

  for (const viewport of VIEWPORTS) {
    test(`injects Shelfmark button on ${viewport.name}`, async ({
      context,
    }) => {
      const page = await openPageAtViewport(context, GOODREADS_URL, viewport);

      await expect(page.locator(".shelfmark-button")).toHaveCount(2, {
        timeout: TIMEOUT,
      });
      await expect(page.locator(getGoodreadsButtonSelector(viewport.name))).toHaveCount(1);
    });

    test(`clicking the Shelfmark button opens a search tab on ${viewport.name}`, async ({
      context,
    }) => {
      const baseUrl = "https://example.com";
      await setExtensionSettings(context, {
        baseUrl,
        useCombinedSearch: false,
      });

      const page = await openPageAtViewport(context, GOODREADS_URL, viewport);
      const details = await waitForBookDetails(context, page);

      const [openedPage] = await Promise.all([
        context.waitForEvent("page"),
        page.locator(getGoodreadsButtonSelector(viewport.name)).click(),
      ]);

      await expectShelfmarkSearchPage(openedPage, baseUrl, details);
    });
  }
});
