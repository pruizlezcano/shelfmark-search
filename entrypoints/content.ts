import { GoodreadsStrategy } from "@/strategies/goodreads";
import { HardcoverStrategy } from "@/strategies/hardcover";

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    const strategies = [new GoodreadsStrategy(), new HardcoverStrategy()];
    const strategy = strategies.find((s) => s.match());

    if (strategy) {
      console.log(`Shelfmark Search: Strategy matched: ${strategy.name}`);

      // Hardcover and other modern web apps might load content dynamically
      const inject = async () => {
        try {
          await strategy.injectShelfmarkButton();
        } catch (e) {
          console.error(
            `Shelfmark Search: Error injecting for ${strategy.name}`,
            e
          );
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
