import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/blog/BlogPostContent";
import { techBlogPosts } from "@/data/blogsData";

export async function generateStaticParams() {
  return techBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = techBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found — helloS Technical Handbook",
    };
  }

  return {
    title: `${post.title} — helloS Technical Handbook`,
    description: post.subtitle || post.summary,
    openGraph: {
      title: post.title,
      description: post.subtitle,
      images: [
        {
          url: post.heroImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = techBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <BlogPostContent post={post} />
      </main>
      <Footer />
    </div>
  );
}
