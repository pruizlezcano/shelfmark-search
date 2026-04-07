import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import type { BookDetails } from "./types";
import { logger } from "@/lib/logger";
import { CachedBookStrategy } from "./base";

export class GoodreadsStrategy extends CachedBookStrategy {
  name = "Goodreads";

  match(): boolean {
    const url = window.location.href;
    return /goodreads\.com\/book\/show\/\d+/.test(url);
  }

  protected extractBookDetails(): BookDetails | null {
    const title = document
      .querySelector('[data-testid="bookTitle"]')
      ?.textContent?.trim();
    const author = document
      .querySelector('[data-testid="name"]')
      ?.textContent?.trim();

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

    const bookActionsList = document.querySelectorAll(".BookActions");
    if (bookActionsList.length === 0) {
      logger.error(this.name, "Can't find .BookActions");
      return;
    }

    bookActionsList.forEach((container, index) => {
      const variant = index === 0 ? "desktop" : "mobile";
      const buttonHtml = `
      <div class="BookActions__button shelfmark-button shelfmark-button-${variant}">
        <div class="ButtonGroup ButtonGroup--block">
          <div class="Button__container Button__container--block">
            <button
              id="shelfmark-btn-${variant}"
              class="Button Button--wtr Button--medium Button--block"
              data-testid="shelfmark-btn-${variant}"
              style="text-decoration: none; display: flex; align-items: center; justify-content: center"
            >
              <span class="Button__labelItem">Search in Shelfmark</span>
            </button>
          </div>
        </div>
      </div>`;

      if (!container.querySelector(`.shelfmark-button-${variant}`)) {
        container.insertAdjacentHTML("afterbegin", buttonHtml);
        container
          .querySelector(`#shelfmark-btn-${variant}`)
          ?.addEventListener("click", () => {
            handleShelfmarkClick(details);
          });
      }
    });
  }
}
