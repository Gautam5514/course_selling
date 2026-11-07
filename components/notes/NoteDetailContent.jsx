import Link from "next/link";
import CodeBlock from "@/components/notes/CodeBlock";
import { absoluteUrl } from "@/lib/api";

/** Convert a YouTube watch/short URL into an embeddable URL; otherwise return null. */
function youTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    /* not a parseable url */
  }
  return null;
}

function VideoPlayer({ url }) {
  const embed = youTubeEmbed(url);
  if (embed) {
    return (
      <div className="relative my-6 aspect-video w-full overflow-hidden rounded-xl border border-[#0f2820]/15 shadow-sm">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={embed}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Fallback: treat as a direct video file.
  return (
    <video controls className="my-6 w-full rounded-xl border border-[#0f2820]/15 shadow-sm">
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
}

function FileBlock({ content }) {
  const href = absoluteUrl(content.downloadUrl || `/api/uploads/${content.uploadId}/raw`);
  return (
    <div className="my-6 flex items-center justify-between gap-4 rounded-xl border border-[#0f2820]/15 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-2xl">📄</span>
        <div>
          <p className="font-semibold">Attached file</p>
          <p className="text-sm text-[#0f2820]/60">Click to download</p>
        </div>
      </div>
      <a
        href={href}
        download
        className="inline-flex items-center rounded-md bg-[#0f2820] px-4 py-2 text-sm font-semibold text-[#faf7f2] transition hover:bg-[#0f2820]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3843f]"
      >
        Download
      </a>
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "CODE":
      return (
        <CodeBlock
          code={block.content.code}
          language={block.content.language}
          filename={block.content.filename}
        />
      );
    case "FILE":
      return <FileBlock content={block.content} />;
    case "RICH_TEXT":
      if (block.content.html) {
        return (
          <div
            className="prose my-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content.html }}
          />
        );
      }
      return (
        <div className="my-6 whitespace-pre-wrap leading-relaxed">
          {block.content.markdown}
        </div>
      );
    case "SQL":
      return (
        <CodeBlock
          code={block.content.sql}
          language={`sql (${block.content.dialect || "sql"})`}
          filename="query.sql"
        />
      );
    case "EMBED":
      return (
        <div className="my-6 aspect-video w-full overflow-hidden rounded-xl border border-[#0f2820]/15">
          <iframe className="h-full w-full" src={block.content.url} title="Embedded content" allowFullScreen />
        </div>
      );
    default:
      return null;
  }
}

export default function NoteDetailContent({ note }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link href="/pdf-notes" className="text-sm font-medium text-[#f3843f] hover:underline">
        ← Back to notes
      </Link>

      <header className="mt-4">
        {note.category && (
          <span className="inline-block rounded-full bg-[#f3843f]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f3843f]">
            {note.category}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{note.title}</h1>
        {note.description && (
          <p className="mt-3 text-lg text-[#0f2820]/70">{note.description}</p>
        )}
        {note.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((t) => (
              <span key={t} className="rounded-md bg-[#0f2820]/5 px-2.5 py-1 text-xs text-[#0f2820]/70">
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>

      {note.videoUrl && <VideoPlayer url={note.videoUrl} />}

      {/* Primary file (e.g. the main PDF) if present and not already a block. */}
      {note.primaryFileUrl && (
        <FileBlock content={{ downloadUrl: note.primaryFileUrl }} />
      )}

      <div className="mt-2">
        {note.blocks?.map((block) => (
          <Block key={block.id} block={block} />
        ))}
      </div>
    </article>
  );
}
