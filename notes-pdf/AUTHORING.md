# Writing notes for the PDF builder

Each note is one Markdown file: `content/<slug>.md`. `node build.mjs <slug>` turns it into
`dist/<slug>.pdf` (cover, contents page with page numbers, one section per chapter) and
records the page count and chapter list in `dist/manifest.json`. The backend script
`backend/src/scripts/publishNotes.js` uploads those PDFs to storage and attaches them to the notes.

`content/_sample.md` is a short working example of everything below.

## File layout

```
---
title: DSA Notes
subtitle: One sentence shown on the cover under the title.
category: DSA
level: All Levels
accent: amber
tags: dsa, algorithms, interview
highlights: Big-O | Arrays & Hashing | Trees & Graphs | Dynamic Programming
tagline: Big-O • Arrays & Hashing • Trees & Graphs • Dynamic Programming
description: Two or three plain sentences about what the reader will learn. Shown on the contents page and on the website.
---

# First chapter title

*One-sentence summary of the chapter, in italics. It appears under the chapter title and in the contents page.*

Chapter text...

# Second chapter title
```

- Front matter is simple `key: value` lines (no quotes, no multi-line values).
  `highlights` (cover pills, 4 to 6 short items) are separated by `|`, `tags` by commas.
- Every `# H1` starts a new chapter on a new page. Chapters are numbered automatically, so do
  not write "Chapter 1:" in the title. Use `##` for sections and `###` for sub-sections.
- The first line after the H1 must be the italic one-sentence summary.

## Blocks

Standard Markdown works: paragraphs, bold, lists, tables, links, fenced code with a language
(` ```python `, `javascript`, `jsx`, `typescript`, `sql`, `bash`, `yaml`, `dockerfile`, `json`, `html`, `css`, `hcl`, `text`).

Extra blocks start with `:::type` on its own line and end with `:::` on its own line.
Markdown (including code fences) works inside them. Blocks cannot be nested.

| Block | Use it for |
|---|---|
| `:::tip` | A practical shortcut or rule of thumb |
| `:::warn` | A common mistake and how to avoid it |
| `:::interview The question?` | A real interview question (after the type) with a short model answer inside |
| `:::example Optional title` | A worked example or dry run |
| `:::note` | Extra detail that is useful but not required |
| `:::revise` | The LAST block of every chapter: 4 to 6 bullet points to revise in one minute |
| `:::flow Optional title` | A simple left-to-right diagram: one box per line, `Label \| small sub-label` |

A custom title can follow the type for `tip`, `warn`, `note` and `example` too.

```
:::flow Request path
Browser | sends HTTPS request
Load balancer | picks a healthy server
App server | runs your code
Database | stores the data
:::
```

Flow diagrams wrap after about four boxes, so keep them to 3 to 6 boxes with short labels.

## Layout rules

- Code lines: at most 78 characters, or they wrap badly. Code blocks: at most about 30 lines;
  split longer ones and explain between the parts.
- Tables: at most 5 columns, short cells.
- No images, no raw HTML, no emojis, no footnotes.
- Every chapter ends with exactly one `:::revise` block (the website shows its text as the
  chapter's key points).

## Writing style

- Easy language. Short sentences and common words, as if you explain to a friend who is a
  beginner. Explain every technical term the first time it appears.
- Start each idea with the "why" or a real-life comparison, then the definition, then code.
- Code must be correct and runnable, with comments on the lines that matter.
- Honest content only: no made-up statistics, no fake company claims.
