import { test, expect } from "../fixtures";
import { STORYGRAPH_URL, TIMEOUT, waitForBookDetails } from "./helpers";

test.describe("StoryGraph strategy", () => {
  test.slow();

  test("injects desktop and mobile Shelfmark buttons", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(STORYGRAPH_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".shelfmark-button-desktop")).toHaveCount(1, {
      timeout: TIMEOUT
    });
    await expect(page.locator(".shelfmark-button-mobile")).toHaveCount(1, {
      timeout: TIMEOUT
    });
  });

  test("gets book details", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(STORYGRAPH_URL, { waitUntil: "domcontentloaded" });

    const details = await waitForBookDetails(context, page, 20000);
    expect(details).not.toBeNull();
    expect(details.contentType).toBe("ebook");
    expect(details.title.toLowerCase()).toContain("harry potter");
    expect(details.author?.toLowerCase() || "").toContain("rowling");
  });
});
