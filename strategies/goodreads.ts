import { storage } from "#imports";
import { SearchStrategy, BookDetails } from "./index";

export class GoodreadsStrategy implements SearchStrategy {
  name = "Goodreads";

  match(): boolean {
    return window.location.hostname.includes("goodreads.com");
  }

  getBookDetails(): BookDetails | null {
    const title = document
      .querySelector('[data-testid="bookTitle"]')
      ?.textContent?.trim();
    const author = document
      .querySelector('[data-testid="name"]')
      ?.textContent?.trim();

    if (!title) return null;

    return { title, author, contentType: "ebook" };
  }

  async injectShelfmarkButton(): Promise<void> {
    const details = this.getBookDetails();
    if (!details) return;

    const bookActionsList = document.querySelectorAll(".BookActions");
    if (bookActionsList.length === 0) return;

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

    const buttonHtml = `
      <div class="BookActions__button shelfmark-button">
        <div class="ButtonGroup ButtonGroup--block">
          <div class="Button__container Button__container--block">
            <a
              href="${searchUrl}"
              target="_blank"
              class="Button Button--wtr Button--medium Button--block"
              style="text-decoration: none; display: flex; align-items: center; justify-content: center;"
            >
              <span class="Button__labelItem">Search in Shelfmark</span>
            </a>
          </div>
        </div>
      </div>`;

    bookActionsList.forEach((container) => {
      if (!container.querySelector(".shelfmark-button")) {
        container.insertAdjacentHTML("afterbegin", buttonHtml);
      }
    });
  }
}
