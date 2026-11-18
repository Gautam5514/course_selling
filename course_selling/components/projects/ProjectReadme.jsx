import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import MermaidDiagram from "@/components/projects/MermaidDiagram";

const ALERT_LABELS = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
};

/** GitHub-style alerts: `> [!NOTE]` becomes a labelled, coloured callout. */
function rehypeGithubAlerts() {
  const walk = (node) => {
    if (!node.children) return;
    for (const child of node.children) {
      if (child.type === "element" && child.tagName === "blockquote") {
        const para = child.children.find((c) => c.type === "element" && c.tagName === "p");
        const first = para?.children?.[0];
        const match = first?.type === "text" && first.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);
        if (match) {
          first.value = first.value.slice(match[0].length);
          const kind = match[1];
          child.properties = { ...child.properties, className: ["readme-alert", `readme-alert-${kind.toLowerCase()}`] };
          child.children.unshift({
            type: "element",
            tagName: "p",
            properties: { className: ["readme-alert-title"] },
            children: [{ type: "text", value: ALERT_LABELS[kind] }],
          });
        }
      }
      walk(child);
    }
  };
  return (tree) => walk(tree);
}

function textOf(node) {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return textOf(node.props?.children);
}

/**
 * Renders a repository README. Relative image paths are pointed at
 * raw.githubusercontent.com and relative links at the file on GitHub, so the
 * document looks the same here as it does on the repository page.
 */
export default function ProjectReadme({ markdown, repo, branch = "main", repoPrivate = false }) {
  const canLink = Boolean(repo) && !repoPrivate;

  const urlTransform = (url, key) => {
    if (!url) return url;
    if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return ""; // drop any other scheme (javascript:, data: …)
    // Relative path inside the repository.
    if (!canLink || url.startsWith("../")) return "";
    const path = url.replace(/^\.?\//, "");
    return key === "src"
      ? `https://raw.githubusercontent.com/${repo}/${branch}/${path}`
      : `https://github.com/${repo}/blob/${branch}/${path}`;
  };

  const components = {
    a({ node, href, children, ...rest }) {
      if (!href) return <span>{children}</span>;
      const external = /^https?:/i.test(href);
      return (
        <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
        </a>
      );
    },
    img({ node, src, alt, ...rest }) {
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt || ""} loading="lazy" {...rest} />;
    },
    table({ node, children, ...rest }) {
      return (
        <div className="readme-table-wrap">
          <table {...rest}>{children}</table>
        </div>
      );
    },
    pre({ node, children }) {
      const code = Array.isArray(children) ? children[0] : children;
      const className = code?.props?.className || "";
      if (/language-mermaid/.test(className)) {
        return <MermaidDiagram chart={textOf(code).trim()} />;
      }
      const lang = className.match(/language-([\w-]+)/)?.[1];
      return (
        <pre className="readme-pre" data-lang={lang || undefined}>
          {children}
        </pre>
      );
    },
  };

  return (
    <div className="readme">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeGithubAlerts]}
        urlTransform={urlTransform}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
