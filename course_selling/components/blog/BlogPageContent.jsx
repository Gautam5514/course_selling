"use client";

import { useState } from "react";
import BlogHero from "./BlogHero";
import BlogFeatured from "./BlogFeatured";
import BlogGrid from "./BlogGrid";
import BlogNewsletter from "./BlogNewsletter";

export default function BlogPageContent({ posts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <BlogHero
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <BlogFeatured posts={posts} />
      <BlogGrid
        posts={posts}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
      />
      <BlogNewsletter />
    </>
  );
}
