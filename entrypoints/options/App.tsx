import { useState, useEffect } from "react";
import { storage } from "#imports";
import "./style.css";

export default function App() {
  const [baseUrl, setBaseUrl] = useState("");
  const [useCombinedSearch, setUseCombinedSearch] = useState(false);
  const [status, setStatus] = useState({ msg: "", type: "" });

  useEffect(() => {
    storage.getItem<string>("local:baseUrl").then((val) => {
      if (val) setBaseUrl(val);
    });
    storage.getItem<boolean>("local:useCombinedSearch").then((val) => {
      if (val !== null) setUseCombinedSearch(val);
    });
  }, []);

  const handleSave = async () => {
    let sanitizedUrl = baseUrl.trim();
    if (!sanitizedUrl) {
      return setStatus({ msg: "Please enter a valid URL", type: "error" });
    }

    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }

    const urlRegex =
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%\+.~#?&\/=]*)$/;
    if (!urlRegex.test(sanitizedUrl)) {
      return setStatus({ msg: "Invalid URL format", type: "error" });
    }

    try {
      const { origin, pathname } = new URL(sanitizedUrl);
      const finalUrl = origin + pathname.replace(/\/+$/, "");

      await Promise.all([
        storage.setItem("local:baseUrl", finalUrl),
        storage.setItem("local:useCombinedSearch", useCombinedSearch)
      ]);

      setBaseUrl(finalUrl);
      setStatus({ msg: "Settings saved!", type: "success" });
      setTimeout(() => setStatus({ msg: "", type: "" }), 3000);
    } catch {
      setStatus({ msg: "Invalid URL format", type: "error" });
    }
  };

  return (
    <div className="container">
      <h1>Shelfmark Search</h1>
      <div className="input-group">
        <label htmlFor="baseUrl">Shelfmark Base URL</label>
        <input
          type="url"
          id="baseUrl"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://shelfmark.com"
        />
      </div>
      <p className="help-text">The full URL of your Shelfmark instance.</p>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="useCombinedSearch"
          checked={useCombinedSearch}
          onChange={(e) => setUseCombinedSearch(e.target.checked)}
        />
        <label htmlFor="useCombinedSearch">Universal Search Mode</label>
      </div>
      <p className="help-text">
        Combines title and author in a single query string.
      </p>

      <button onClick={handleSave}>Save Settings</button>
      <p className={`status-text ${status.type}`}>{status.msg}</p>
    </div>
  );
}
