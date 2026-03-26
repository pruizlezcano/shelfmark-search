import { GoodreadsStrategy } from "@/strategies/goodreads";
import { HardcoverStrategy } from "@/strategies/hardcover";
import { logger } from "@/lib/logger";

export default defineContentScript({
  matches: ["*://*.goodreads.com/book/show/*", "*://hardcover.app/books/*"],
  async main() {
    const strategies = [new GoodreadsStrategy(), new HardcoverStrategy()];
    const strategy = strategies.find((s) => s.match());

    if (strategy) {
      logger.log(`Strategy matched: ${strategy.name}`);

      // Listen for requests from the popup
      browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "GET_BOOK_DETAILS") {
          sendResponse(strategy.getBookDetails());
        }
      });

      // Hardcover and other modern web apps might load content dynamically
      const inject = async () => {
        try {
          await strategy.injectShelfmarkButton();
        } catch (e) {
          logger.error(`Error injecting for ${strategy.name}`, e);
        }
      };

      // Initial injection
      await inject();

      // Simple observer to handle potential dynamic loads or navigation
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            inject();
            break;
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
});
