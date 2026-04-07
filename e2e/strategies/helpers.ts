import {
  expect,
  type BrowserContext,
  type Page,
  type Worker,
} from "@playwright/test";
import type { BookDetails } from "@/strategies";

export const GOODREADS_URL =
  "https://www.goodreads.com/book/show/42844155-harry-potter-and-the-philosopher-s-stone";
export const HARDCOVER_URL =
  "https://hardcover.app/books/harry-potter-and-the-philosophers-stone";
export const STORYGRAPH_URL =
  "https://app.thestorygraph.com/books/6717e73a-6ab8-448a-b92c-7a7ac25be732";
export const TIMEOUT = 5000;
export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 430, height: 932 },
] as const;

export const getExtensionWorker = async (
  context: BrowserContext,
): Promise<Worker> => {
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker");
  return worker;
};

export const getBookDetailsFromActiveTab = async (
  context: BrowserContext,
): Promise<BookDetails | null> => {
  const worker = await getExtensionWorker(context);
  return worker.evaluate(async () => {
    const chromeApi = (globalThis as any).chrome;
    const [tab] = await chromeApi.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return null;
    try {
      return await chromeApi.tabs.sendMessage(tab.id, {
        type: "GET_BOOK_DETAILS",
      });
    } catch {
      return null;
    }
  });
};

export const setExtensionSettings = async (
  context: BrowserContext,
  settings: {
    baseUrl?: string;
    useCombinedSearch?: boolean;
  },
): Promise<void> => {
  const worker = await getExtensionWorker(context);
  await worker.evaluate(async ({ baseUrl, useCombinedSearch }) => {
    const chromeApi = (globalThis as any).chrome;
    if (baseUrl !== undefined) {
      await chromeApi.storage.local.set({ baseUrl });
    }
    if (useCombinedSearch !== undefined) {
      await chromeApi.storage.local.set({ useCombinedSearch });
    }
  }, settings);
};

export const expectShelfmarkSearchPage = async (
  openedPage: Page,
  expectedBaseUrl: string,
  expectedDetails: BookDetails,
): Promise<void> => {
  await openedPage.waitForURL((url) => url.href !== "about:blank");

  const url = new URL(openedPage.url());
  expect(url.origin + url.pathname.replace(/\/+$/, "")).toBe(expectedBaseUrl);
  expect(url.searchParams.get("content_type")).toBe(
    expectedDetails.contentType,
  );
  expect(url.searchParams.get("q")).toBe(expectedDetails.title);
  expect(url.searchParams.get("author")).toBe(expectedDetails.author || "");
};

export const openPageAtViewport = async (
  context: BrowserContext,
  url: string,
  viewport: { width: number; height: number },
): Promise<Page> => {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return page;
};

export const waitForBookDetails = async (
  context: BrowserContext,
  page: Page,
  timeoutMs = TIMEOUT,
): Promise<BookDetails> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const details = await getBookDetailsFromActiveTab(context);
    if (details?.title && details.title.trim().length > 0) return details;
    await page.waitForTimeout(250);
  }

  throw new Error("Timed out waiting for non-empty book details");
};
