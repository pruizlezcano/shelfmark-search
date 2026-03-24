import { storage } from "#imports";
import "./style.css";

const baseUrlInput = document.getElementById("baseUrl") as HTMLInputElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const statusText = document.getElementById("status") as HTMLParagraphElement;

// Load saved settings
storage.getItem("local:baseUrl").then((baseUrl) => {
  if (baseUrl) {
    baseUrlInput.value = baseUrl as string;
  }
});

// Save settings
saveButton.addEventListener("click", async () => {
  const baseUrl = baseUrlInput.value.trim().replace(/\/$/, "");
  if (!baseUrl) {
    statusText.textContent = "Please enter a valid URL";
    statusText.style.color = "#ff6b6b";
    return;
  }

  try {
    new URL(baseUrl);
    await storage.setItem("local:baseUrl", baseUrl);
    statusText.textContent = "Settings saved!";
    statusText.style.color = "#509e78";
    setTimeout(() => {
      statusText.textContent = "";
    }, 3000);
  } catch (e) {
    statusText.textContent = "Invalid URL format";
    statusText.style.color = "#ff6b6b";
  }
});
