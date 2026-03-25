import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import { SearchStrategy, BookDetails } from "./index";

export class GoodreadsStrategy implements SearchStrategy {
  name = "Goodreads";

  match(): boolean {
    const url = window.location.href;
    return /goodreads\.com\/book\/show\/\d+/.test(url);
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

    const buttonHtml = `
      <div class="BookActions__button shelfmark-button">
        <div class="ButtonGroup ButtonGroup--block">
          <div class="Button__container Button__container--block">
            <button
              id="shelfmark-btn"
              class="Button Button--wtr Button--medium Button--block"
              style="text-decoration: none; display: flex; align-items: center; justify-content: center"
            >
              <span class="Button__labelItem">Search in Shelfmark</span>
            </button>
          </div>
        </div>
      </div>`;

    bookActionsList.forEach((container) => {
      if (!container.querySelector(".shelfmark-button")) {
        container.insertAdjacentHTML("afterbegin", buttonHtml);
        container
          .querySelector("#shelfmark-btn")
          ?.addEventListener("click", (e) => {
            handleShelfmarkClick(details);
          });
      }
    });
  }
}
