import type { BrowserContext, Page, Worker } from "@playwright/test";
import type { BookDetails } from "@/strategies";

export const GOODREADS_URL =
  "https://www.goodreads.com/book/show/42844155-harry-potter-and-the-philosopher-s-stone";
export const HARDCOVER_URL =
  "https://hardcover.app/books/harry-potter-and-the-philosophers-stone";
export const STORYGRAPH_URL =
  "https://app.thestorygraph.com/books/6717e73a-6ab8-448a-b92c-7a7ac25be732";
export const TIMEOUT = 5000;

export const getExtensionWorker = async (
  context: BrowserContext
): Promise<Worker> => {
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker");
  return worker;
};

export const getBookDetailsFromActiveTab = async (
  context: BrowserContext
): Promise<BookDetails | null> => {
  const worker = await getExtensionWorker(context);
  return worker.evaluate(async () => {
    const chromeApi = (globalThis as any).chrome;
    const [tab] = await chromeApi.tabs.query({
      active: true,
      currentWindow: true
    });
    if (!tab?.id) return null;
    try {
      return await chromeApi.tabs.sendMessage(tab.id, {
        type: "GET_BOOK_DETAILS"
      });
    } catch {
      return null;
    }
  });
};

export const waitForBookDetails = async (
  context: BrowserContext,
  page: Page,
  timeoutMs = TIMEOUT
): Promise<BookDetails> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const details = await getBookDetailsFromActiveTab(context);
    if (details?.title && details.title.trim().length > 0) return details;
    await page.waitForTimeout(250);
  }

  throw new Error("Timed out waiting for non-empty book details");
};
