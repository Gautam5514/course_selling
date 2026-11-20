// SERVER-SIDE ONLY: import this from pages (server components), never from a
// "use client" file. blogsData.js holds every full article (~90 KB); listing
// pages only need the card fields, so pages build these light summaries on the
// server and hand them to client components as props.
import { techBlogPosts } from "./blogsData";

function toCard(post) {
  // Everything except the article body.
  const { sections, tableOfContents, ...card } = post;
  return card;
}

/** Every post, in curated order, without the article body. */
export const blogCards = techBlogPosts.map(toCard);

/** Up to `limit` other posts for the "Related" strip, same category first. */
export function relatedCards(post, limit = 3) {
  return blogCards
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category ? 1 : 0) - (a.category === post.category ? 1 : 0))
    .slice(0, limit)
    .map(({ slug, title, category, heroImage }) => ({ slug, title, category, heroImage }));
}
