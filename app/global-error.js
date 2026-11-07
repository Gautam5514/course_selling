"use client";

/** Last-resort boundary (root layout failed). Must render its own <html>. */
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf7f2", color: "#0f2820" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 420 }}>
            <p style={{ color: "#f3843f", fontWeight: 800, letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase" }}>Something went wrong</p>
            <h1 style={{ fontSize: 30, margin: "8px 0", fontWeight: 800 }}>We hit a snag</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>This wasn&apos;t you. Please try again, and if it keeps happening, come back in a few minutes.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 24, padding: "12px 28px", borderRadius: 999, border: 0, background: "#093c33", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
