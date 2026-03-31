import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
    browser_specific_settings: {
      gecko: {
        id: "shelfmark-search@pruizlezcano",
        data_collection_permissions: {
          required: ["none"]
        }
      }
    },
    options_ui: {
      page: "entrypoints/options/index.html",
      open_in_tab: true
    }
  }
});
