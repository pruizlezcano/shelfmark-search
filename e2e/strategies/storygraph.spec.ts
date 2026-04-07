import { test, expect } from "../fixtures";
import {
  expectShelfmarkSearchPage,
  openPageAtViewport,
  setExtensionSettings,
  STORYGRAPH_URL,
  TIMEOUT,
  VIEWPORTS,
  waitForBookDetails,
} from "./helpers";

test.describe("StoryGraph strategy", () => {
  test.slow();

  test("gets book details", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(STORYGRAPH_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page, 20000);
    expect(details).not.toBeNull();
    expect(details.contentType).toBe("ebook");
    expect(details.title.toLowerCase()).toContain("harry potter");
    expect(details.author?.toLowerCase() || "").toContain("rowling");
  });

  for (const viewport of VIEWPORTS) {
    test(`injects mobile Shelfmark button on ${viewport.name}`, async ({
      context,
    }) => {
      const page = await openPageAtViewport(context, STORYGRAPH_URL, viewport);

      await expect(
        page.locator(`.shelfmark-button-${viewport.name}`),
      ).toHaveCount(1, {
        timeout: TIMEOUT,
      });
    });

    test(`clicking the mobile Shelfmark button opens a search tab on ${viewport.name}`, async ({
      context,
    }) => {
      const baseUrl = "https://example.com";
      await setExtensionSettings(context, {
        baseUrl,
        useCombinedSearch: false,
      });

      const page = await openPageAtViewport(context, STORYGRAPH_URL, viewport);
      const details = await waitForBookDetails(context, page, 20000);

      const [mobilePage] = await Promise.all([
        context.waitForEvent("page"),
        page.locator(`#shelfmark-btn-${viewport.name}`).click(),
      ]);
      await expectShelfmarkSearchPage(mobilePage, baseUrl, details);
    });
  }
});
