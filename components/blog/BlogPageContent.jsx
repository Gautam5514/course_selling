"use client";

import { useState } from "react";
import BlogHero from "./BlogHero";
import BlogFeatured from "./BlogFeatured";
import BlogGrid from "./BlogGrid";
import BlogNewsletter from "./BlogNewsletter";

export default function BlogPageContent() {
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
      <BlogFeatured />
      <BlogGrid
        activeCategory={activeCategory}
        searchQuery={searchQuery}
      />
      <BlogNewsletter />
    </>
  );
}
