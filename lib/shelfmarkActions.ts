import { storage } from "#imports";
import { BookDetails } from "@/strategies";

/**
 * Handles the logic for clicking a Shelfmark button.
 * If baseUrl is set, opens the search URL in a new tab.
 * If baseUrl is NOT set, opens the extension options page.
 *
 * @param details - Metadata about the book to search for
 */
export const handleShelfmarkClick = async (details: BookDetails | null) => {
  const [baseUrl, useCombinedSearch] = await Promise.all([
    storage.getItem<string>("local:baseUrl"),
    storage.getItem<boolean>("local:useCombinedSearch")
  ]);

  if (baseUrl && details) {
    const url = buildSearchUrl(baseUrl, details, !!useCombinedSearch);
    window.open(url, "_blank");
  } else {
    // Background script handles this message to open options reliably
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  }
};

/**
 * Constructs the Shelfmark search URL for a given book.
 *
 * @param baseUrl - The base URL of the Shelfmark instance
 * @param bookDetails - Metadata about the book (title, author, content type)
 * @param combined - Whether to combine title and author in the 'q' parameter
 * @returns A fully qualified URL for performing the search
 */
export const buildSearchUrl = (
  baseUrl: string,
  bookDetails: BookDetails,
  combined: boolean = false
): string => {
  const queryParams = new URLSearchParams({
    content_type: bookDetails.contentType
  });

  if (combined) {
    const query = [bookDetails.title, bookDetails.author]
      .filter(Boolean)
      .join(" ");
    queryParams.set("q", query);
  } else {
    queryParams.set("q", bookDetails.title);
    queryParams.set("author", bookDetails.author || "");
  }

  return `${baseUrl}/?${queryParams.toString()}`;
};
