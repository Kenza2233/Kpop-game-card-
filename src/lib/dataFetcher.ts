import { KpopCard } from "./types";

/**
 * Fetches card data from the public directory with retry logic.
 * @param url The URL to fetch from.
 * @param retries Number of retries before giving up.
 * @returns A promise that resolves to an array of KpopCard objects.
 */
export async function fetchCardData(url: string, retries: number = 3): Promise<KpopCard[]> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch card data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data as KpopCard[];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${i + 1} failed. Retrying...`, lastError);
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to fetch card data after multiple attempts");
}
