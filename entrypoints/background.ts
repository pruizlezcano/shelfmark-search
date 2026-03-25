export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "OPEN_OPTIONS") {
      browser.runtime.openOptionsPage();
    }
  });
});
