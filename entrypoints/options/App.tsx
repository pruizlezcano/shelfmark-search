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
    const sanitizedUrl = baseUrl.trim().replace(/\/$/, "");
    if (!sanitizedUrl) {
      setStatus({ msg: "Please enter a URL", type: "error" });
      return;
    }

    try {
      new URL(sanitizedUrl);
      await Promise.all([
        storage.setItem("local:baseUrl", sanitizedUrl),
        storage.setItem("local:useCombinedSearch", useCombinedSearch)
      ]);
      setStatus({ msg: "Settings saved!", type: "success" });
      setTimeout(() => setStatus({ msg: "", type: "" }), 3000);
    } catch (e) {
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
        Cobines title and author in a single quey string.
      </p>

      <button onClick={handleSave}>Save Settings</button>
      <p className={`status-text ${status.type}`}>{status.msg}</p>
    </div>
  );
}
