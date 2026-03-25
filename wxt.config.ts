import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage", "scripting", "tabs"],
    options_ui: {
      page: "entrypoints/options/index.html",
      open_in_tab: true
    }
  }
});
