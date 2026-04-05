import { test, expect } from "../fixtures";
import { GOODREADS_URL, TIMEOUT, waitForBookDetails } from "./helpers";

test.describe("Goodreads strategy", () => {
  test.slow();

  test("injects Shelfmark button", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(GOODREADS_URL, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".shelfmark-button")).toHaveCount(2, {
      timeout: TIMEOUT
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
});
