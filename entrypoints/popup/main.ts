import "./style.css";
import { BookDetails } from "@/strategies";
import { storage } from "#imports";
import { shelfmarkUrl } from "@/lib/shelfmarkUrl";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="shelfmark-popup">
    <h1>Shelfmark Search</h1>
    <div id="loading">Loading book details...</div>
    <div id="form" style="display: none;">
      <div class="input-group">
        <label for="title">Title</label>
        <input type="text" id="title" placeholder="Title" />
      </div>
      <div class="input-group">
        <label for="author">Author</label>
        <input type="text" id="author" placeholder="Author" />
      </div>
      <div class="input-group">
        <label for="type">Type</label>
        <select id="type">
          <option value="ebook">eBook</option>
          <option value="audiobook">Audiobook</option>
        </select>
      </div>
      <button id="search-btn">Go to Shelfmark</button>
    </div>
    <div id="error" style="display: none; color: red;">
      No book details found. Are you on a book page?
    </div>
  </div>
`;

async function init() {
  const loading = document.getElementById("loading")!;
  const form = document.getElementById("form")!;
  const error = document.getElementById("error")!;
  const titleInput = document.getElementById("title") as HTMLInputElement;
  const authorInput = document.getElementById("author") as HTMLInputElement;
  const typeSelect = document.getElementById("type") as HTMLSelectElement;
  const searchBtn = document.getElementById("search-btn") as HTMLButtonElement;

  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    if (tabs[0]?.id) {
      const details: BookDetails | null = await browser.tabs.sendMessage(
        tabs[0].id,
        { type: "GET_BOOK_DETAILS" }
      );

      if (details) {
        loading.style.display = "none";
        form.style.display = "block";
        titleInput.value = details.title;
        authorInput.value = details.author || "";
        typeSelect.value = details.contentType;

        searchBtn.addEventListener("click", async () => {
          const title = titleInput.value;
          const author = authorInput.value;
          const type = typeSelect.value;

          const baseUrl =
            (await storage.getItem<string>("local:baseUrl")) ||
            "https://shelfmark.com";
          const searchUrl = shelfmarkUrl(baseUrl, details);
          browser.tabs.create({ url: searchUrl });
        });
      } else {
        loading.style.display = "none";
        error.style.display = "block";
      }
    }
  } catch (err) {
    console.error("Error fetching book details:", err);
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "Error: Make sure you are on a supported book page.";
  }
}

init();
