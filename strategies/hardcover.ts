import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import { SearchStrategy, BookDetails } from "./index";

export class HardcoverStrategy implements SearchStrategy {
  name = "Hardcover";

  match(): boolean {
    return window.location.hostname.includes("hardcover.app");
  }

  getBookDetails(): BookDetails | null {
    const title = document.querySelector("h1")?.textContent?.trim();
    const author = document
      .querySelector(
        "div.font-semibold:nth-child(2) > span:nth-child(1) > span:nth-child(2) > a:nth-child(2) > span:nth-child(1)"
      )
      ?.textContent?.trim();

    if (!title) return null;

    return { title, author, contentType: "ebook" };
  }

  async injectShelfmarkButton(): Promise<void> {
    const details = this.getBookDetails();
    if (!details) return;

    // Desktop
    const desktopContainer = document.querySelector(
      ".flex.flex-col.col-span-4.lg\\:col-span-2 > .hidden.lg\\:block > div"
    );

    if (
      desktopContainer &&
      !desktopContainer.querySelector(".shelfmark-button-desktop")
    ) {
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

    // Mobile
    const mobileContainer = document.querySelector(
      ".lg\\:hidden.mt-8.flex.flex-row.justify-center > div"
    );
    if (
      mobileContainer &&
      !mobileContainer.querySelector(".shelfmark-button-mobile")
    ) {
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
  }
}
