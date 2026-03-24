import { BookDetails } from "@/strategies";

export const shelfmarkUrl = (
  baseUrl: string,
  bookDetails: BookDetails
): string => {
  const queryParams = new URLSearchParams({
    q: bookDetails.title,
    author: bookDetails.author || "",
    content_type: bookDetails.contentType
  });

  return `${baseUrl}/?${queryParams.toString()}`;
};
