import { useEffect, useState } from "react";
import { BookDetails } from "@/strategies";
import { handleShelfmarkClick } from "@/lib/shelfmarkActions";
import "./style.css";

export default function App() {
  const [details, setDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (result) setDetails(result);
          else setError("No book details found.");
        }
      } catch (err) {
        setError("Unsupported book page.");
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

  if (error) {
    return (
      <div className="container">
        <h1>Shelfmark</h1>
        <p className="status-text error">{error}</p>
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
          value={details?.title || ""}
          onChange={(e) =>
            setDetails((prev) =>
              prev ? { ...prev, title: e.target.value } : null
            )
          }
        />
      </div>
      <div className="input-group">
        <label htmlFor="author">Author</label>
        <input
          type="text"
          id="author"
          value={details?.author || ""}
          onChange={(e) =>
            setDetails((prev) =>
              prev ? { ...prev, author: e.target.value } : null
            )
          }
        />
      </div>
      <div className="input-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          value={details?.contentType || "ebook"}
          onChange={(e) =>
            setDetails((prev) =>
              prev ? { ...prev, contentType: e.target.value as any } : null
            )
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
