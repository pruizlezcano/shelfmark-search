import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve(".output/chrome-mv3");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let background = context.serviceWorkers()[0];
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }

    const extensionId = background?.url()?.split("/")[2];
    if (!extensionId) {
      throw new Error("Could not resolve extension ID from service worker URL");
    }
    await use(extensionId);
  }
});
export const expect = test.expect;
