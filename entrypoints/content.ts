import { GoodreadsStrategy } from "@/strategies/goodreads";

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    const strategies = [new GoodreadsStrategy()];
    const strategy = strategies.find((s) => s.match());

    if (strategy) {
      console.log(`Shelfmark Search: Strategy matched: ${strategy.name}`);
      strategy.injectShelfmarkButton();
    }
  }
});
