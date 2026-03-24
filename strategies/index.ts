export interface BookDetails {
  title: string;
  author?: string;
  contentType: "ebook" | "audiobook";
}

export interface SearchStrategy {
  name: string;
  match(): boolean;
  getBookDetails(): BookDetails | null;
  injectShelfmarkButton(): void | Promise<void>;
}
