"use client";

import { useEffect, useId, useState } from "react";

/**
 * Renders a ```mermaid block as a diagram. Mermaid is loaded on demand so it
 * never weighs on pages without diagrams. Until it renders (or if it fails)
 * the source is shown as a plain code block, so nothing is ever lost.
 */
export default function MermaidDiagram({ chart }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          themeVariables: {
            primaryColor: "#e8f3ee",
            primaryBorderColor: "#093c33",
            primaryTextColor: "#0f2820",
            lineColor: "#57534e",
            secondaryColor: "#fdf1e6",
            tertiaryColor: "#faf7f2",
            clusterBkg: "#faf7f2",
            clusterBorder: "#d6d3d1",
            actorBkg: "#e8f3ee",
            actorBorder: "#093c33",
            noteBkgColor: "#fdf1e6",
            noteBorderColor: "#f3843f",
            fontSize: "14px",
          },
        });
        const { svg: out } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled) setSvg(out);
      } catch {
        if (!cancelled) setSvg(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (!svg) {
    return (
      <pre className="readme-pre">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      className="readme-mermaid"
      role="img"
      aria-label="Architecture diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
