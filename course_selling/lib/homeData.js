// Server-side data for the landing page. The page is prerendered and refreshed
// in the background (ISR), so visitors get real notes and reviews in the first
// HTML response and never wait for the API (which may be asleep). Every call
// is optional: on any failure we return null and the client loads it instead.
import { api } from "./api";
import { blogCards } from "@/data/blogCards";

const SERVER_TIMEOUT_MS = 5000;

async function optional(promise) {
  try {
    const { data } = await promise;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function getHomeData() {
  const [featuredNotes, reviews] = await Promise.all([
    optional(api.listNotes({ featured: true }, { next: { revalidate: 300 }, timeoutMs: SERVER_TIMEOUT_MS })),
    optional(api.getLatestReviews(9, { timeoutMs: SERVER_TIMEOUT_MS })),
  ]);
  return { blogCards, featuredNotes, reviews };
}
