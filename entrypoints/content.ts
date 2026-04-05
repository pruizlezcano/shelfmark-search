import {
  GoodreadsStrategy,
  HardcoverStrategy,
  StorygraphStrategy
} from "@/strategies";
import { logger } from "@/lib/logger";

export default defineContentScript({
  matches: [
    "*://*.goodreads.com/*",
    "*://hardcover.app/*",
    "*://app.thestorygraph.com/*"
  ],
  async main() {
    const strategies = [
      new GoodreadsStrategy(),
      new HardcoverStrategy(),
      new StorygraphStrategy()
    ];
    let currentStrategy = strategies.find((s) => s.match()) ?? null;
    let currentUrl = window.location.href;
    let observer: MutationObserver | null = null;
    let injectionInFlight: Promise<void> | null = null;
    let reinjectRequested = false;

    const refreshStrategy = (): void => {
      const nextStrategy = strategies.find((s) => s.match()) ?? null;
      const strategyChanged = nextStrategy?.name !== currentStrategy?.name;
      const urlChanged = window.location.href !== currentUrl;

      currentStrategy = nextStrategy;
      currentUrl = window.location.href;

      if (currentStrategy && (strategyChanged || urlChanged)) {
        logger.log(`Strategy matched: ${currentStrategy.name}`);
      }
    };

    const disconnectObserver = (): void => {
      observer?.disconnect();
      observer = null;
    };

    const ensureObserver = (): void => {
      if (!currentStrategy || observer || !document.body) return;

      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            requestInject();
            break;
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    };

    const inject = async (): Promise<void> => {
      refreshStrategy();

      if (!currentStrategy) {
        disconnectObserver();
        return;
      }

      ensureObserver();

      try {
        await currentStrategy.injectShelfmarkButton();
      } catch (e) {
        logger.error(`Error injecting for ${currentStrategy.name}`, e);
      }
    };

    const requestInject = (): void => {
      if (injectionInFlight) {
        reinjectRequested = true;
        return;
      }

      injectionInFlight = (async () => {
        do {
          reinjectRequested = false;
          await inject();
        } while (reinjectRequested);
      })().finally(() => {
        injectionInFlight = null;
      });
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_BOOK_DETAILS") {
        refreshStrategy();
        sendResponse(currentStrategy?.getBookDetails() ?? null);
      }
    });

    const notifyNavigation = (): void => {
      if (window.location.href === currentUrl) return;
      requestInject();
    };

    const wrapHistoryMethod = (method: "pushState" | "replaceState"): void => {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        notifyNavigation();
        return result;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");
    window.addEventListener("popstate", notifyNavigation);
    window.addEventListener("hashchange", notifyNavigation);
    window.setInterval(notifyNavigation, 500);

    requestInject();
  }
});
