#!/usr/bin/env node
/**
 * Builds the notes PDFs: content/<slug>.md -> dist/<slug>.pdf + dist/manifest.json
 *
 *   node build.mjs            build every note
 *   node build.mjs dsa-notes  build one note
 *
 * Needs Google Chrome (or CHROME_PATH) for printing and python3 + pypdf for
 * page numbers. The authoring format is described in AUTHORING.md.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import hljs from 'highlight.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');
const CHROME =
  process.env.CHROME_PATH ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));

const ACCENTS = {
  amber: ['#d98a0b', '#fdf3dc'],
  orange: ['#eb793e', '#fdeee4'],
  emerald: ['#17a673', '#e4f5ee'],
  indigo: ['#5b63e6', '#eaebfc'],
  purple: ['#9a55e0', '#f2e9fc'],
  rose: ['#e2496d', '#fce8ed'],
  sky: ['#1f9bd8', '#e4f3fb'],
  teal: ['#12a39a', '#e2f5f3'],
};

const CALLOUTS = {
  tip: 'Tip',
  warn: 'Common mistake',
  interview: 'Interview question',
  note: 'Note',
  example: 'Example',
  revise: 'Quick revision',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const language = (lang || '').trim().split(/\s+/)[0];
      const known = language && hljs.getLanguage(language);
      const html = known ? hljs.highlight(text, { language }).value : esc(text);
      const lines = text.split('\n').length;
      const label = language && language !== 'text' ? ` data-lang="${esc(language)}"` : '';
      return `<pre${label}${lines > 34 ? ' class="long"' : ''}><code>${html}</code></pre>\n`;
    },
  },
});
const md = (s) => marked.parse(s);
const inline = (s) => marked.parseInline(s);
const plain = (s) => s.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').replace(/\*([^*]*)\*/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();

function parseFrontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('missing front matter (--- ... ---)');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  for (const key of ['tags', 'highlights']) meta[key] = (meta[key] || '').split(/\s*[|,]\s*/).filter(Boolean);
  return { meta, body: src.slice(m[0].length) };
}

function renderFlow(title, lines) {
  const boxes = lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [main, sub] = l.split(/\s+\|\s+/);
      return `<div class="flow-box">${inline(main)}${sub ? `<small>${inline(sub)}</small>` : ''}</div>`;
    });
  return `<div class="flow">${title ? `<div class="flow-title">${esc(title)}</div>` : ''}<div class="flow-row">${boxes.join('<div class="flow-arrow">→</div>')}</div></div>\n`;
}

/** Markdown + `:::type Title` … `:::` blocks -> HTML. Returns the revise-box text too. */
function renderBody(src) {
  const out = [];
  let buf = [];
  let block = null;
  let fence = null;
  const revise = [];
  const flush = () => {
    if (buf.length) out.push(md(buf.join('\n')));
    buf = [];
  };
  for (const line of src.split('\n')) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) fence = fence ? (line.trim().startsWith(fence) ? null : fence) : f[1];
    if (!fence && !f) {
      const open = line.match(/^:::\s*([a-z]+)\s*(.*)$/);
      if (open && !block) {
        if (open[1] !== 'flow' && !CALLOUTS[open[1]]) throw new Error(`unknown block ":::${open[1]}"`);
        flush();
        block = { type: open[1], title: open[2].trim(), lines: [] };
        continue;
      }
      if (/^:::\s*$/.test(line) && block) {
        if (block.type === 'flow') out.push(renderFlow(block.title, block.lines));
        else {
          if (block.type === 'revise') revise.push(...block.lines.map((l) => plain(l.replace(/^\s*[-*]\s+/, ''))).filter(Boolean));
          // An interview box keeps its label and shows the question in bold below it.
          const isQuestion = block.type === 'interview' && block.title;
          const label = isQuestion ? CALLOUTS.interview : block.title || CALLOUTS[block.type];
          const question = isQuestion ? `<p class="question">${inline(block.title)}</p>` : '';
          out.push(`<div class="callout ${block.type}"><div class="callout-title">${esc(label)}</div>${question}${md(block.lines.join('\n'))}</div>\n`);
        }
        block = null;
        continue;
      }
    }
    (block ? block.lines : buf).push(line);
  }
  if (block) throw new Error(`":::${block.type}" block is never closed`);
  if (fence) throw new Error('a code fence is never closed');
  flush();
  return { html: out.join(''), revise };
}

function splitChapters(body) {
  const chapters = [];
  let cur = null;
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h1 = !fence && line.match(/^#\s+(.+)$/);
    if (h1) {
      cur = { title: h1[1].trim(), lines: [] };
      chapters.push(cur);
    } else if (cur) cur.lines.push(line);
    else if (line.trim()) throw new Error('content before the first "# Chapter" heading');
  }
  return chapters.map((c, i) => {
    let text = c.lines.join('\n').replace(/^\n+/, '');
    let summary = '';
    const lead = text.match(/^\*([^*\n][^\n]*?)\*\s*\n/);
    if (lead) {
      summary = lead[1].trim();
      text = text.slice(lead[0].length);
    }
    const { html, revise } = renderBody(text);
    return { number: String(i + 1).padStart(2, '0'), title: c.title, summary, html, revise };
  });
}

const LOGO = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="60" height="60" rx="19" fill="#faf7f2"/><path d="M43 23a16 16 0 1 0 3 21V33H33" stroke="#0b463b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="44" y="13" width="9" height="9" rx="3" fill="#f3843f"/></svg>`;

function page(meta, chapters, pageOf = {}) {
  const [accent, accentSoft] = ACCENTS[meta.accent] || ACCENTS.emerald;
  const css = fs.readFileSync(path.join(ROOT, 'theme.css'), 'utf8');
  const toc = chapters
    .map(
      (c) =>
        `<li><a href="#ch-${c.number}"><span class="toc-num">${c.number}</span><span class="toc-title">${inline(c.title)}${c.summary ? `<small>${inline(c.summary)}</small>` : ''}</span><span class="toc-page">${pageOf[c.number] ?? ''}</span></a></li>`
    )
    .join('\n');
  const body = chapters
    .map(
      (c) => `<section class="chapter" id="ch-${c.number}">
<header class="chapter-head"><div class="chapter-label">Chapter ${c.number}</div><h1>${inline(c.title)}</h1>${c.summary ? `<p class="chapter-lead">${inline(c.summary)}</p>` : ''}</header>
${c.html}</section>`
    )
    .join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(meta.title)} | Gopo Workspace</title>
<meta name="author" content="${esc(meta.author || 'Gautam Pandit')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=block" rel="stylesheet">
<style>${css}
:root{--accent:${accent};--accent-soft:${accentSoft};}
@page{@bottom-left{content:"gopo. Workspace  ·  ${meta.title.replace(/"/g, '')}";}}
@page cover{@bottom-left{content:none;}}
</style></head><body>
<section class="cover">
  <div class="brand">${LOGO}<div><div class="brand-name">gopo<i>.</i></div><div class="brand-sub">Workspace</div></div></div>
  <div class="cover-main">
    <span class="cover-kicker">${esc(meta.category || 'Notes')} · ${esc(meta.level || 'All Levels')}</span>
    <h1>${esc(meta.title)}</h1>
    <p class="cover-sub">${esc(meta.subtitle || meta.description || '')}</p>
    <ul class="cover-points">${meta.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
  </div>
  <div class="cover-foot"><div><b>${esc(meta.author || 'Gautam Pandit')}</b>Instructor &amp; Founder, Gopo Workspace</div><div>${chapters.length} chapters · ${esc(meta.edition || '2026 Edition')}</div></div>
</section>
<section class="toc">
  <div class="eyebrow">Contents</div>
  <h2>What is inside</h2>
  <p class="toc-intro">${esc(meta.description || '')}</p>
  <ol class="toc-list">${toc}</ol>
  <div class="howto">
    <div><b>Read</b>One chapter at a time, top to bottom. Each one is short on purpose.</div>
    <div><b>Type</b>Type every code example yourself. Do not copy and paste.</div>
    <div><b>Revise</b>The dark box at the end of each chapter is your one-minute revision.</div>
    <div><b>Build</b>Open the project that ships with these notes and apply what you read.</div>
  </div>
</section>
${body}
<p class="endnote">You finished <b>${esc(meta.title)}</b>. Now build the project that ships with these notes.<br>gopo. Workspace · free notes, real projects.</p>
</body></html>`;
}

function print(htmlFile, pdfFile) {
  if (!CHROME) throw new Error('Google Chrome not found. Set CHROME_PATH.');
  // A private profile per run lets several builds print at the same time.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-pdf-'));
  try {
    execFileSync(
    CHROME,
    [`--user-data-dir=${profile}`, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--generate-pdf-document-outline', '--virtual-time-budget=20000', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href],
    { stdio: ['ignore', 'ignore', 'ignore'], timeout: 120000 }
    );
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

/**
 * Ask pypdf how many pages there are and where each chapter opens. An opener
 * is "Chapter NN" directly followed by the chapter title, so a sentence that
 * only mentions "chapter 10" is never mistaken for one.
 */
function inspect(pdfFile, chapters) {
  const py = `
import json, re, sys
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
want = json.loads(sys.argv[2])
squash = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
pages = {}
for i, p in enumerate(r.pages):
    t = squash(p.extract_text() or "")
    for num, title in want.items():
        if num not in pages and ("chapter" + num + squash(title)[:18]) in t:
            pages[num] = i + 1
print(json.dumps({"count": len(r.pages), "pages": pages}))
`;
  const want = Object.fromEntries(chapters.map((c) => [c.number, plain(c.title)]));
  return JSON.parse(execFileSync('python3', ['-c', py, pdfFile, JSON.stringify(want)], { encoding: 'utf8' }));
}

function build(slug) {
  const src = fs.readFileSync(path.join(CONTENT, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n');
  const { meta, body } = parseFrontMatter(src);
  for (const k of ['title', 'category', 'description']) if (!meta[k]) throw new Error(`front matter is missing "${k}"`);
  const chapters = splitChapters(body);
  if (!chapters.length) throw new Error('no chapters found');
  const htmlFile = path.join(DIST, `${slug}.html`);
  const pdfFile = path.join(DIST, `${slug}.pdf`);

  // Pass 1 finds the chapter pages, pass 2 prints them into the contents page.
  fs.writeFileSync(htmlFile, page(meta, chapters));
  print(htmlFile, pdfFile);
  let info = inspect(pdfFile, chapters);
  // The cover is page 1 but carries no number; printed numbers match the PDF page index.
  fs.writeFileSync(htmlFile, page(meta, chapters, info.pages));
  print(htmlFile, pdfFile);
  info = inspect(pdfFile, chapters);
  const lost = chapters.filter((c) => !info.pages[c.number]).map((c) => c.number);
  if (lost.length) throw new Error(`could not find the page of chapter ${lost.join(', ')}`);
  const nums = chapters.map((c) => info.pages[c.number]);
  if (nums.some((n, i) => i && n <= nums[i - 1])) throw new Error('chapter page numbers are not increasing');

  const words = body.split(/\s+/).length;
  console.log(`${slug}: ${info.count} pages, ${chapters.length} chapters, ~${words} words, ${(fs.statSync(pdfFile).size / 1024).toFixed(0)} KB`);
  return {
    slug,
    file: `${slug}.pdf`,
    pages: info.count,
    title: meta.title,
    category: meta.category,
    level: meta.level || 'All Levels',
    tagline: meta.tagline || meta.highlights.slice(0, 4).join(' • '),
    description: meta.description,
    tags: meta.tags,
    chapters: chapters.map((c) => ({
      number: String(Number(c.number)),
      title: plain(c.title),
      summary: plain(c.summary),
      contentSnippet: c.revise.join(' ').slice(0, 900),
    })),
  };
}

fs.mkdirSync(DIST, { recursive: true });
const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
const manifestFile = path.join(DIST, 'manifest.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
let failed = false;
for (const slug of slugs) {
  try {
    manifest[slug] = build(slug);
  } catch (err) {
    failed = true;
    console.error(`${slug}: FAILED - ${err.message}`);
  }
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
process.exit(failed ? 1 : 0);
