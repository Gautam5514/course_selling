import PdfReaderPage from "@/components/pdf/PdfReaderPage";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const title = id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${title} — Gopo Workspace Notes`,
    description: "Read this free handbook online on Gopo Workspace.",
  };
}

// Full-page reader: no site navbar/footer so the document gets the whole screen.
export default async function PdfPage({ params }) {
  const { id } = await params;
  return <PdfReaderPage id={id} />;
}
