import type { BookDetails, SearchStrategy } from "./index";

export abstract class CachedBookStrategy implements SearchStrategy {
  abstract name: string;
  private cachedUrl: string | null = null;
  private cachedDetails: BookDetails | null = null;

  abstract match(): boolean;
  protected abstract extractBookDetails(): BookDetails | null;
  abstract injectShelfmarkButton(): void | Promise<void>;

  getBookDetails(): BookDetails | null {
    const url = window.location.href;

    if (this.cachedUrl === url && this.cachedDetails) {
      return this.cachedDetails;
    }

    if (this.cachedUrl !== url) {
      this.cachedUrl = url;
      this.cachedDetails = null;
    }

    const details = this.extractBookDetails();

    if (details && details.title.trim() && details.author?.trim()) {
      this.cachedDetails = details;
    }

    return details;
  }
}
