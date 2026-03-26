import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import { SearchStrategy, BookDetails } from "./index";
import { logger } from "@/lib/logger";

export class HardcoverStrategy implements SearchStrategy {
  name = "Hardcover";

  match(): boolean {
    const url = window.location.href;
    return /hardcover\.app\/books\//.test(url);
  }

  getBookDetails(): BookDetails | null {
    const titleContainer = document.querySelector("h1");
    const title = titleContainer?.textContent?.trim();

    const authorContainer = titleContainer?.parentElement?.querySelector("a");
    const author = authorContainer?.textContent?.trim();

    if (!title) {
      logger.error("Details not found for this book");
      return null;
    }

    logger.log({ title, author });

    return { title, author, contentType: "ebook" };
  }

  async injectShelfmarkButton(): Promise<void> {
    const details = this.getBookDetails();
    if (!details) return;

    // Desktop
    const desktopContainer = document.querySelector(
      ".flex.flex-col.col-span-4.lg\\:col-span-2 > .hidden.lg\\:block > div"
    );

    if (desktopContainer) {
      if (!desktopContainer.querySelector(".shelfmark-button-desktop")) {
        const desktopButtonHtml = `
          <div class="mt-2 shelfmark-button-desktop">
            <button
              id="shelfmark-btn-desktop"
              class="inline-flex items-center justify-center rounded-lg font-semibold shadow-button transition-all bg-primary text-primary-foreground hover:opacity-90 border border-primary text-base py-2.5 px-3.5"
            >
              <span class="Button__labelItem">Search in Shelfmark</span>
            </button>
          </div>`;

        desktopContainer.insertAdjacentHTML("beforeend", desktopButtonHtml);
        desktopContainer
          .querySelector("#shelfmark-btn-desktop")
          ?.addEventListener("click", (e) => {
            handleShelfmarkClick(details);
          });
      }
    } else {
      logger.error(this.name, "desktopContainer not found");
    }

    // Mobile
    const mobileContainer = document.querySelector(
      ".lg\\:hidden.mt-8.flex.flex-row.justify-center > div"
    );

    if (mobileContainer) {
      if (!mobileContainer.querySelector(".shelfmark-button-mobile")) {
        const mobileButtonHtml = `
          <div class="mt-2 flex justify-center shelfmark-button-mobile">
            <button
              id="shelfmark-btn-mobile"
              class="inline-flex items-center justify-center rounded-lg font-semibold shadow-button transition-all bg-primary text-primary-foreground hover:opacity-90 border border-primary py-3 px-4 text-sm"
            >
              <span class="Button__labelItem">Shelfmark</span>
            </button>
          </div>`;

        mobileContainer.insertAdjacentHTML("beforeend", mobileButtonHtml);
        mobileContainer
          .querySelector("#shelfmark-btn-mobile")
          ?.addEventListener("click", (e) => {
            handleShelfmarkClick(details);
          });
      }
    } else {
      logger.error(this.name, "mobileContainer not found");
    }
  }
}
