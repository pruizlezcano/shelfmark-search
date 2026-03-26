import { useEffect, useState } from "react";
import { BookDetails } from "@/strategies";
import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import { logger } from "@/lib/logger";
import "./style.css";

export default function App() {
  const [details, setDetails] = useState<BookDetails>({
    title: "",
    author: "",
    contentType: "ebook"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true
        });
        if (tabs[0]?.id) {
          const result: BookDetails | null = await browser.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_BOOK_DETAILS" }
          );
          if (result) {
            setDetails(result);
          }
        }
      } catch (err) {
        logger.log("Popup", "Could not fetch book details", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h1>Shelfmark</h1>
        <p className="status-text loading">Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shelfmark Search</h1>
      <div className="input-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={details.title}
          onChange={(e) =>
            setDetails((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter book title"
        />
      </div>
      <div className="input-group">
        <label htmlFor="author">Author</label>
        <input
          type="text"
          id="author"
          value={details.author}
          onChange={(e) =>
            setDetails((prev) => ({ ...prev, author: e.target.value }))
          }
          placeholder="Enter author name"
        />
      </div>
      <div className="input-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          value={details.contentType}
          onChange={(e) =>
            setDetails((prev) => ({
              ...prev,
              contentType: e.target.value as any
            }))
          }
        >
          <option value="ebook">eBook</option>
          <option value="audiobook">Audiobook</option>
        </select>
      </div>

      <button onClick={() => handleShelfmarkClick(details)}>
        Go to Shelfmark
      </button>
    </div>
  );
}
