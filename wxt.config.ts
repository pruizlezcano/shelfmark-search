import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage"],
    options_ui: {
      page: "entrypoints/options/index.html",
      open_in_tab: true
    }
  }
});
