import { storage } from "#imports";
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

    const baseUrl = (await storage.getItem("local:baseUrl")) as string;
    if (!baseUrl) {
      console.warn("Shelfmark Search: baseUrl not configured");
      return;
    }

    const queryParams = new URLSearchParams({
      q: details.title,
      author: details.author || "",
      content_type: details.contentType
    });
    const searchUrl = `${baseUrl}/?${queryParams.toString()}`;

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
          <a
            href="${searchUrl}"
            target="_blank"
            class="inline-flex items-center justify-center rounded-lg font-semibold shadow-button transition-all bg-primary text-primary-foreground hover:opacity-90 border border-primary text-base py-2.5 px-3.5"
          >
            <span class="Button__labelItem">Search in Shelfmark</span>
          </a>
        </div>`;

      desktopContainer.insertAdjacentHTML("beforeend", desktopButtonHtml);
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
          <a
            href="${searchUrl}"
            target="_blank"
            class="inline-flex items-center justify-center rounded-lg font-semibold shadow-button transition-all bg-primary text-primary-foreground hover:opacity-90 border border-primary py-3 px-4 text-sm"
          >
            <span class="Button__labelItem">Shelfmark</span>
          </a>
        </div>`;

      mobileContainer.insertAdjacentHTML("beforeend", mobileButtonHtml);
    }
  }
}
