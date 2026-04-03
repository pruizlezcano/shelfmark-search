import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import { SearchStrategy, BookDetails } from "./index";
import { logger } from "@/lib/logger";

export class StorygraphStrategy implements SearchStrategy {
  name = "Storygraph";

  match(): boolean {
    const url = window.location.href;
    return /app\.thestorygraph\.com\/books\//.test(url);
  }

  getBookDetails(): BookDetails | null {
    const container = document.querySelector(".book-title-author-and-series");
    if (!container) {
      logger.error("Details not found for this book");
      return null;
    }
    const title = container?.querySelector("h3")?.textContent?.trim();
    const p = container?.querySelectorAll("p")!;
    const author = p[p?.length - 1].querySelector("a")?.textContent?.trim();

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
    const desktopContainer = document.querySelectorAll(".action-menu")[0];

    if (desktopContainer) {
      if (!desktopContainer.querySelector(".shelfmark-button-desktop")) {
        const desktopButtonHtml = `
          <div class="flex lg:gap-2 mt-3 lg:mt-4 font-semibold w-full">
            <button
              id="shelfmark-btn-desktop"
              class="btn-dropdown grow text-sm lg:text-xs px-4 py-1.5 lg:py-2 w-full rounded-sm border-2 text-center shelfmark-button-desktop"
            >
              <span>Search in Shelfmark</span>
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
    const mobileContainer = document.querySelectorAll(".action-menu")[1];
    const affiliateLinks = mobileContainer?.querySelector(".affiliate-links");

    if (mobileContainer) {
      if (!mobileContainer.querySelector(".shelfmark-button-mobile")) {
        const mobileButtonHtml = `
          <div class="flex lg:gap-2 mt-3 lg:mt-4 font-semibold w-full">
            <button
              id="shelfmark-btn-mobile"
              class="btn-dropdown grow text-sm lg:text-xs px-4 py-1.5 lg:py-2 w-full rounded-sm border-2 text-center shelfmark-button-mobile"
            >
              <span class="link-text">Search in Shelfmark</span>
            </button>
          </div>`;

        // Insert before affiliate links if they exist, otherwise at the end
        if (affiliateLinks) {
          affiliateLinks.insertAdjacentHTML("beforebegin", mobileButtonHtml);
        } else {
          mobileContainer.insertAdjacentHTML("beforeend", mobileButtonHtml);
        }
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
