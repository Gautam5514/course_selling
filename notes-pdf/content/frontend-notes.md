---
title: Frontend Notes
subtitle: From your first HTML tag to a job-ready React 19 and Tailwind CSS project, explained in simple words.
category: Frontend
level: Beginner
accent: orange
tags: html, css, javascript, react, tailwind
highlights: Semantic HTML5 | Flexbox & Grid | Modern JavaScript | React 19 Hooks | Tailwind CSS v4 | Interview Q&A
tagline: HTML5 • Modern CSS • JavaScript • React 19 • Tailwind CSS v4
description: Complete beginner-friendly frontend notes in 15 chapters. You learn how the browser works, semantic HTML, CSS layout with Flexbox and Grid, responsive design, core JavaScript, the DOM, async code, React 19 with hooks and Actions, Tailwind CSS v4, accessibility and performance. Every chapter has commented code, common mistakes, interview questions with model answers and a one-minute revision box.
---

# How the web and the browser work

*What really happens between typing a web address and seeing a page on your screen.*

## Why this matters

Before you write any code, you should know where your code runs. Frontend code runs inside the **browser** (Chrome, Firefox, Safari, Edge) on the user's device. If you understand what the browser does with your files, bugs become much easier to find.

Think of a restaurant. You (the customer) read the menu and ask for a dish. The waiter carries your order to the kitchen. The kitchen cooks and the waiter brings the food back.

A **client** is the program that asks. A **server** is the program that answers. **HTTP** (HyperText Transfer Protocol) is the language they both speak. **HTTPS** is the same thing with encryption, so nobody in the middle can read or change the messages.

## From URL to page

Computers find each other with numbers called **IP addresses**, for example `142.250.183.14`. People remember names, not numbers. **DNS** (Domain Name System) is like the contacts app in your phone: you tap a name and the phone finds the number.

:::flow What happens when you open a page
You type a URL | browser reads it
DNS lookup | name to IP address
Connection | TCP and TLS handshake
HTTP request | GET /index.html
HTTP response | status 200 and HTML
Render | page appears
:::

Every request has a **method**, such as `GET` (read data) or `POST` (send data). Every response has a **status code**, a number that tells you how it went: `200` is OK, `404` is not found, `500` is a server error.

:::tip
Remember the groups: `2xx` success, `3xx` redirect, `4xx` the client made a mistake, `5xx` the server made a mistake.
:::

## The three languages of the frontend

A house is a good comparison. **HTML** is the walls and rooms (structure and meaning). **CSS** is the paint and furniture (look and layout). **JavaScript** is the electricity and switches (behaviour).

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <!-- Makes the page fit phone screens (see the responsive chapter) -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My first page</title>
    <link rel="stylesheet" href="style.css" />
    <!-- defer: download now, run after the HTML is parsed -->
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Hello, web</h1>
    <button id="hi">Say hi</button>
  </body>
</html>
```

## How the browser turns files into pixels

The browser does not show your HTML text directly. It builds a few structures first. This set of steps is called the **critical rendering path**.

:::flow Rendering steps
Parse HTML | builds the DOM tree
Parse CSS | builds the CSSOM
Style | match rules to elements
Layout | size and position
Paint | draw pixels
Composite | join layers on screen
:::

- **DOM** (Document Object Model): a tree of objects, one for each HTML element. JavaScript reads and changes the page through this tree.
- **Layout** (also called reflow): the browser calculates the width, height and position of every box.

When JavaScript changes a size or adds an element, the browser must do layout and paint again. When you change only `transform` or `opacity`, the browser can usually skip layout and paint and only composite. That is why animations with `transform` feel smooth.

## Loading scripts the right way

When the HTML parser meets a normal `<script>` tag, it stops, downloads the file, runs it, and only then continues. The user stares at a half-built page.

```html
<!-- 1. Blocks HTML parsing while it downloads and runs -->
<script src="app.js"></script>

<!-- 2. Downloads in parallel, runs after parsing, keeps order -->
<script src="app.js" defer></script>

<!-- 3. Downloads in parallel, runs as soon as it arrives, any order -->
<script src="analytics.js" async></script>

<!-- 4. ES module: deferred by default, can use import and export -->
<script type="module" src="main.js"></script>
```

:::warn
A plain `<script>` in the `<head>` runs before the `<body>` exists. Then `document.querySelector("#hi")` returns `null` and your code crashes with "Cannot read properties of null". Fix it with `defer` or `type="module"`.
:::

:::interview What happens when you type a URL in the browser and press Enter?
1. The browser reads the URL and checks its cache.
2. DNS changes the domain name into an IP address.
3. The browser opens a connection to that server (TCP, and TLS for HTTPS).
4. It sends an HTTP `GET` request. The server sends back a status code, headers and HTML.
5. The browser parses the HTML into the DOM. While parsing, it finds CSS, scripts and images and requests them too.
6. CSS becomes the CSSOM. The browser combines both, calculates layout, paints and composites.
7. JavaScript runs and can change the DOM, which may cause layout and paint again.
:::

:::revise
- Client asks, server answers, HTTP is the language, HTTPS adds encryption.
- DNS turns a domain name into an IP address.
- Status codes: `2xx` success, `3xx` redirect, `4xx` client error, `5xx` server error.
- Browser pipeline: HTML to DOM, CSS to CSSOM, then style, layout, paint, composite.
- Use `defer` or `type="module"` so scripts do not block the page.
- HTML is structure, CSS is look, JavaScript is behaviour.
:::

# Semantic and accessible HTML5

*Choose tags by their meaning, so browsers, search engines and screen readers all understand your page.*

## Why this matters

Imagine a newspaper where every line has the same size and style. No headline, no sections, no captions. You could still read it, but it would be hard to find anything. A page made only of `<div>` tags is like that newspaper.

**Semantic HTML** means using the tag that describes what the content *is*. A `<nav>` is navigation. A `<button>` is something you press. This helps three groups:

- **Screen reader users.** A screen reader is software that reads the page aloud for people who cannot see it. It uses your tags to announce "navigation", "heading level 2", "button".
- **Search engines.** They understand your content better.
- **You and your team.** The code is easier to read.

## The page skeleton

```html
<body>
  <header>
    <a href="/">Gopo Shop</a>
    <nav aria-label="Main">
      <ul>
        <li><a href="/courses">Courses</a></li>
        <li><a href="/notes">Notes</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <h1>Frontend Notes</h1>
    <article>
      <h2>What is HTML?</h2>
      <p>HTML gives structure to a page.</p>
    </article>
    <aside>Related links</aside>
  </main>

  <footer>
    <p>Contact: hello@example.com</p>
  </footer>
</body>
```

| Tag | Meaning |
|---|---|
| `<header>` | Top area of the page or of a section |
| `<nav>` | A group of main navigation links |
| `<main>` | The main content. Only one per page |
| `<section>` | A themed group of content, usually with a heading |
| `<article>` | Content that makes sense on its own: a post, a card, a comment |
| `<aside>` | Side content, related but not essential |
| `<footer>` | Bottom area: contact, copyright, links |

`<div>` and `<span>` have no meaning. Use them only for styling, when no semantic tag fits.

## Headings, links and buttons

Headings (`<h1>` to `<h6>`) are the outline of your page, like the contents page of a book. Use one `<h1>` for the page title. Do not skip levels (for example `<h2>` straight to `<h4>`) just because you like the size. Size is the job of CSS.

Links and buttons look similar but mean different things.

| Element | Job | Keyboard |
|---|---|---|
| `<a href="...">` | Go to another page or place | Enter |
| `<button>` | Do an action on this page | Enter and Space |

```html
<!-- Goes somewhere: a link -->
<a href="/pricing">See pricing</a>

<!-- Does something: a button. type="button" stops form submit -->
<button type="button" id="menu-toggle" aria-expanded="false">
  Menu
</button>

<!-- Image with a text alternative for people who cannot see it -->
<img src="team.jpg" alt="Five students coding around one laptop"
     width="800" height="450" />

<!-- Decorative image: empty alt so screen readers skip it -->
<img src="wave.svg" alt="" />
```

:::warn
Do not build a button from a `<div>` with a click handler. A `<div>` cannot receive keyboard focus, does not react to Enter or Space, and is not announced as a button. A real `<button>` gives you all of this for free.
:::

## Forms that everyone can use

A form is how the user talks back to your site. The three most important rules:

1. Every input has a `<label>`. The label's `for` must match the input's `id`.
2. Use the right `type`. Phones show a better keyboard, and the browser validates for you.
3. Use a real submit `<button>` inside a `<form>`, so pressing Enter works.

```html
<form action="/signup" method="post">
  <label for="name">Full name</label>
  <input id="name" name="name" type="text" required
         autocomplete="name" />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required
         autocomplete="email" aria-describedby="email-hint" />
  <p id="email-hint">We only use this to send your login link.</p>

  <label for="pass">Password</label>
  <input id="pass" name="password" type="password" required
         minlength="8" autocomplete="new-password" />

  <button type="submit">Create account</button>
</form>
```

Things to notice:

- The `name` attribute is the key that is sent to the server. No `name`, no data.
- `required`, `minlength`, `maxlength`, `min`, `max` and `pattern` give you free validation in the browser.
- `autocomplete` lets the browser and password managers fill fields correctly.
- `aria-describedby` connects the hint text to the input, so a screen reader reads it too.

:::note
**ARIA** attributes such as `aria-label` and `aria-expanded` add meaning for screen readers. They add no behaviour. The first rule of ARIA: if a native HTML element can do the job, use the element. A fair use is naming an icon-only button: `<button aria-label="Close">`.
:::

:::interview What is semantic HTML and why should we use it?
Semantic HTML means choosing elements by meaning, such as `<header>`, `<nav>`, `<main>`, `<article>` and `<button>`, not using `<div>` for everything. It gives three benefits. Accessibility: screen readers can announce landmarks, headings and controls and let users jump between them. SEO: search engines understand the structure. Maintainability: developers can read the code faster. Native elements also come with built-in keyboard behaviour.
:::

:::revise
- Pick tags by meaning: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`.
- One `<h1>` per page, and headings go in order without skipping levels.
- Links go somewhere, buttons do something.
- Every input needs a `<label>` and a `name`. Use the right `type`.
- Every meaningful image needs `alt` text. Decorative images get `alt=""`.
- Use native elements first, ARIA only when HTML is not enough.
:::

# CSS basics: box model, selectors and units

*The few core rules that decide how every element looks and how much space it takes.*

## Why this matters

Most CSS frustration comes from three questions. Why is my style not applied? Why is this box bigger than I asked? Which unit should I use? This chapter answers all three.

A CSS **rule** has a selector (who to style) and declarations (what to change).

```css
/* selector { property: value; } */
.card {
  background: white;
  padding: 16px;
  border-radius: 12px;
}
```

## Selectors

A **selector** is a pattern that picks elements, like a filter in a shopping app.

```css
p { }                 /* type: every <p> */
.card { }             /* class: class="card" */
#hero { }             /* id: id="hero" (one per page) */
a[target="_blank"] { }/* attribute */

.card p { }           /* descendant: any <p> inside .card */
.card > p { }         /* child: <p> directly inside .card */
h2 + p { }            /* next sibling: first <p> right after an <h2> */

a:hover { }           /* pseudo-class: a state */
li:first-child { }    /* pseudo-class: a position */
input:focus-visible { } /* keyboard focus */
.card:has(img) { }    /* parent that contains an <img> */
p::first-line { }     /* pseudo-element: a part of an element */
```

## The cascade and specificity

Two rules can target the same element with different values. The browser needs a winner. It checks in this order:

1. **Importance.** A declaration with `!important` beats a normal one.
2. **Specificity.** The more specific selector wins.
3. **Order.** If both are equal, the rule written later wins.

Think of specificity as a score with three columns: ids, classes, types. Compare from left to right, like comparing version numbers.

| Selector | ids | classes | types | Score |
|---|---|---|---|---|
| `p` | 0 | 0 | 1 | 0-0-1 |
| `.card` | 0 | 1 | 0 | 0-1-0 |
| `.card p` | 0 | 1 | 1 | 0-1-1 |
| `a:hover` | 0 | 1 | 1 | 0-1-1 |
| `#hero .title` | 1 | 1 | 0 | 1-1-0 |

Pseudo-classes (`:hover`) and attribute selectors count as classes. An inline `style` attribute beats all selectors. One id beats any number of classes.

:::warn
Do not fix a losing style by adding `!important`. Later you will need a second `!important` to beat the first one, and the file becomes a fight. Keep specificity low and flat instead: style with single classes, and avoid ids and long chains like `.nav ul li a`.
:::

**Inheritance** is the other half of the story. Some properties pass from parent to child automatically, mostly the text ones: `color`, `font-family`, `font-size`, `line-height`. Box properties such as `margin`, `padding`, `border` and `background` do not inherit. That is why you set the font once on `body`.

## The box model

Every element is a rectangular box, like a framed photo. The photo is the **content**. The mat around the photo is the **padding**. The frame is the **border**. The gap between this frame and the next one on the wall is the **margin**.

By default, `width` sets only the content width. Padding and border are added on top. This surprises everyone.

```css
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  /* content-box (default): total = 300 + 20*2 + 2*2 = 344px */
}

/* The fix used by almost every project */
*, *::before, *::after {
  box-sizing: border-box;
  /* border-box: total width is exactly 300px,
     padding and border are counted inside it */
}
```

## Display and position

| Property and value | Behaviour |
|---|---|
| `display: block` | Starts on a new line, takes the full width (`div`, `p`) |
| `display: inline` | Sits in the text line, ignores width and height (`span`, `a`) |
| `display: none` | Removed from the page |
| `position: relative` | Stays in place, becomes the anchor for its children |
| `position: absolute` | Placed relative to the nearest positioned ancestor |
| `position: fixed` | Placed relative to the window, stays while scrolling |
| `position: sticky` | Scrolls normally, then sticks at the edge you set |

## Units

| Unit | Relative to | Use it for |
|---|---|---|
| `px` | Nothing, fixed | Borders, small details |
| `rem` | Font size of the root `<html>` (usually 16px) | Font sizes, spacing |
| `em` | Font size of the element itself | Padding that scales with text |
| `%` | The parent | Widths |
| `vw`, `vh` | 1% of the viewport width or height | Full-screen sections |
| `ch` | Width of the "0" character | Line length, like `max-width: 65ch` |

The **viewport** is the visible area of the browser window. If a user makes the default font bigger in browser settings, `rem` values grow with it and `px` values do not. That is why `rem` is the friendlier choice for text.

## Custom properties (CSS variables)

A custom property is a named value that you define once and reuse. Change it in one place and the whole site updates.

```css
:root {
  --brand: #eb793e;
  --space: 1rem;
  --radius: 12px;
}

.btn {
  background: var(--brand);
  padding: calc(var(--space) / 2) var(--space);
  border-radius: var(--radius);
}

/* Override for one area: custom properties inherit */
.dark-section {
  --brand: #ffb38a;
}
```

:::interview How does CSS specificity work?
When several rules set the same property on an element, the browser compares their selectors. It counts ids, then classes (also attributes and pseudo-classes), then element types. The higher count in the first different column wins. So `#nav a` (1-0-1) beats `.menu .item a` (0-2-1). Inline styles beat selectors, and `!important` beats everything normal. If specificity is equal, the rule that comes later in the CSS wins.
:::

:::revise
- Winner of a style conflict: importance, then specificity, then source order.
- Specificity score: ids, then classes, then types. Keep it low with single classes.
- Box model from inside out: content, padding, border, margin.
- Set `box-sizing: border-box` on everything.
- Text properties inherit, box properties do not.
- Use `rem` for text and spacing, `px` for thin borders, `%` and `fr` for widths.
:::

# Flexbox

*The easiest way to line things up in one direction: a row or a column.*

## Why this matters

Navigation bars, button groups, cards in a row, an icon next to text, centering something on the page. All of these are one-dimensional layouts, and Flexbox solves them in two or three lines.

Think of beads on a string. The string has a direction. You can push the beads to the start, to the end, or spread them out. You can also decide which beads stretch when the string is longer.

## Container and items

You write `display: flex` on the parent. The parent becomes the **flex container** and its direct children become **flex items**.

- The **main axis** is the direction of the string. It is horizontal for `flex-direction: row` (the default) and vertical for `column`.
- The **cross axis** is the other direction.

```css
.row {
  display: flex;
  flex-direction: row;       /* row (default) or column */
  justify-content: space-between; /* main axis */
  align-items: center;       /* cross axis */
  gap: 16px;                 /* space between items */
  flex-wrap: wrap;           /* allow items to go to a new line */
}
```

| Property | Axis | Common values |
|---|---|---|
| `justify-content` | Main | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | Cross | `stretch` (default), `flex-start`, `center`, `flex-end`, `baseline` |
| `align-self` | Cross, one item | Same as `align-items` |
| `gap` | Both | Any length |

## How items grow and shrink

Three properties on the items decide how free space is shared.

| Property | Question it answers | Default |
|---|---|---|
| `flex-basis` | What is my starting size? | `auto` |
| `flex-grow` | How much extra space do I take? | `0` (none) |
| `flex-shrink` | How much do I give up when space is short? | `1` |

The shorthand `flex` sets all three. The most common values:

```css
.item { flex: 1; }        /* 1 1 0%: share space equally */
.item { flex: 2; }        /* takes twice the share of a flex: 1 item */
.item { flex: 0 0 200px; }/* fixed 200px, no grow, no shrink */
.item { flex: 1 1 250px; }/* start at 250px, then grow or shrink */
```

## Patterns you will use every day

### A navigation bar

```html
<header class="nav">
  <a class="logo" href="/">Gopo</a>
  <nav class="links">
    <a href="/courses">Courses</a>
    <a href="/notes">Notes</a>
  </nav>
  <button type="button">Sign in</button>
</header>
```

```css
.nav {
  display: flex;
  align-items: center;  /* vertical centre */
  gap: 24px;
  padding: 12px 24px;
}
.links {
  display: flex;
  gap: 16px;
  margin-left: auto;    /* pushes links and button to the right */
}
```

An `auto` margin inside a flex container eats all the free space on that side. It is the simplest way to push one item away from the others.

### Perfect centering

```css
.center {
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
  min-height: 100dvh;      /* full visible screen height */
}
```

### Footer that stays at the bottom

On a short page the footer should sit at the bottom of the window, not float in the middle.

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  margin: 0;
}
main { flex: 1; }  /* main takes all leftover height */
```

:::warn
A flex item will not shrink below the size of its content, because its default is `min-width: auto`. A long word, a wide image or a code block then pushes the layout out of the screen. Fix it by adding `min-width: 0` (or `overflow: hidden`) to that flex item. The same idea applies to columns with `min-height: 0`.
:::

:::interview What does flex: 1 mean?
It is shorthand for `flex-grow: 1`, `flex-shrink: 1` and `flex-basis: 0%`. The item starts from zero size and takes an equal share of the free space. If all items have `flex: 1`, they get equal widths no matter how much content they have, as long as the content fits.
:::

:::revise
- `display: flex` on the parent, the direct children become flex items.
- `justify-content` works on the main axis, `align-items` on the cross axis.
- `flex: 1` means grow 1, shrink 1, basis 0: share space equally.
- Use `gap` for spacing, and `margin-left: auto` to push an item away.
- Add `min-width: 0` when a flex item refuses to shrink.
- Flexbox is for one direction. For rows and columns together, use Grid.
:::

# CSS Grid and layout patterns

*Rows and columns together, for page layouts and card galleries.*

## Why this matters

Flexbox is a string of beads: one direction. **CSS Grid** is a chessboard: rows and columns at the same time. Page layouts with a sidebar, photo galleries, dashboards and pricing tables are all two-dimensional, and Grid makes them simple.

## The idea

You write `display: grid` on the parent and describe the columns. The children drop into the cells automatically, left to right, top to bottom.

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr; /* three columns */
  gap: 16px;
}
```

The new unit here is `fr`, a **fraction of the free space**. First the browser gives 200px to the first column. Then it splits what is left into two equal parts.

| Value | Meaning |
|---|---|
| `1fr 2fr` | Two columns, the second is twice as wide |
| `repeat(3, 1fr)` | Three equal columns |
| `minmax(200px, 1fr)` | At least 200px, at most one share |
| `auto` | As wide as the content needs |

## Placing items

Grid lines are numbered from 1. A grid with 3 columns has 4 vertical lines. You can tell an item where to start and how far to span.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.feature {
  grid-column: 1 / 3;     /* from line 1 to line 3: two columns */
  grid-row: span 2;       /* two rows tall */
}
.full {
  grid-column: 1 / -1;    /* -1 is the last line: full width */
}
```

## Naming areas

For a whole-page layout, `grid-template-areas` lets you draw the layout with words. It reads like a small map.

```css
.page {
  display: grid;
  min-height: 100dvh;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }

/* On small screens: one column, a new map */
@media (max-width: 700px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas: "header" "main" "sidebar" "footer";
  }
}
```

The row sizes `auto 1fr auto` mean: the header and footer are as tall as their content, and the middle row takes everything else.

## The responsive card grid in one line

This is the most useful Grid pattern. It needs no media query.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

Read it in plain words: "make as many columns as fit, each at least 240px wide, and share the leftover space equally". On a phone you get one column. On a laptop you get four or five.

:::example auto-fit and auto-fill
The container is 1000px wide and you have only 2 cards with `minmax(240px, 1fr)`. Four 240px columns could fit.

- `auto-fill` keeps the 2 empty columns. The cards stay about 240px wide and there is empty space on the right.
- `auto-fit` collapses the empty columns. The 2 cards stretch and fill the whole row.

With many cards, both behave the same.
:::

:::warn
A column of `1fr` really means `minmax(auto, 1fr)`. It cannot become smaller than its content. One long URL or a wide `<pre>` block makes that column grow and breaks the page on phones. Write `minmax(0, 1fr)` to allow the column to shrink, and give the wide child `overflow-x: auto`.
:::

## Flexbox or Grid?

| Question | Flexbox | Grid |
|---|---|---|
| Directions | One (row or column) | Two (rows and columns) |
| Who decides the size? | The content | The layout you define |
| Best for | Navbars, toolbars, small groups | Page layouts, galleries |
| Items line up across rows? | No | Yes |

They work together. A common setup is Grid for the page and the card gallery, and Flexbox inside each card to arrange its content.

:::interview When do you use Flexbox and when do you use Grid?
Flexbox is for one-dimensional layout: a row or a column where the content decides the sizes, like a navbar or a group of buttons. Grid is for two-dimensional layout where I define rows and columns and place items into them, like a page layout or a card gallery. I often use both: Grid for the outer structure and Flexbox inside the components.
:::

:::revise
- Grid is for two dimensions, Flexbox for one.
- `fr` is a share of the free space after fixed sizes are taken.
- `repeat(auto-fit, minmax(240px, 1fr))` gives a responsive gallery with no media query.
- `grid-column: 1 / -1` makes an item span the full width.
- `grid-template-areas` lets you draw a page layout with names.
- Use `minmax(0, 1fr)` when wide content breaks a column.
:::

# Responsive and mobile-first design

*One page that works on a small phone, a tablet and a wide monitor.*

## Why this matters

Your users open the same page on very different screens. **Responsive design** means the layout adapts to the space it has. Water is a good picture: it takes the shape of the glass you pour it into.

## Step zero: the viewport meta tag

Without this tag, a phone pretends to be about 980px wide and then zooms the page out. Everything looks tiny.

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

:::warn
If your media queries seem to do nothing on a real phone, check this tag first. Also never add `user-scalable=no` or `maximum-scale=1`. They stop people with weak eyesight from zooming in.
:::

## Mobile-first

**Mobile-first** means you write the styles for the smallest screen first, with no media query. Then you add improvements for bigger screens with `min-width` queries. A **media query** is a block of CSS that applies only when a condition about the device is true.

Why this order? The phone layout is usually the simplest: one column. It is easier to add complexity as space grows than to remove it as space shrinks.

```css
/* 1. Base: phones. One column. */
.layout {
  display: grid;
  gap: 16px;
  padding: 16px;
}

/* 2. Tablets and up: two columns */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
  }
}

/* 3. Laptops and up: sidebar plus content */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 280px 1fr;
  }
}
```

The widths where the layout changes are called **breakpoints**. There are no magic numbers. Pick the widths where *your* content starts to look bad. Many teams use values near 640, 768, 1024 and 1280 pixels.

## Fluid sizes: fewer breakpoints

Many things do not need a breakpoint at all if the sizes are flexible.

```css
img, video {
  max-width: 100%;   /* never wider than the parent */
  height: auto;      /* keep the shape */
}

.container {
  width: min(100% - 32px, 1100px); /* 16px side space, max 1100px */
  margin-inline: auto;             /* centred */
}

.article {
  max-width: 65ch;   /* comfortable line length for reading */
}
```

### clamp()

`clamp(MIN, PREFERRED, MAX)` picks the preferred value, but never goes below MIN or above MAX. It is like a thermostat with a lowest and a highest setting.

```css
h1 {
  /* never under 1.75rem, never over 3rem, grows with the screen */
  font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
}
.section {
  padding-block: clamp(2rem, 6vw, 5rem);
}
```

## Other media features

Media queries can ask more than the width.

```css
/* The user chose dark mode in the operating system */
@media (prefers-color-scheme: dark) {
  :root { --bg: #111418; --text: #f2f2f2; }
}

/* The user asked for less animation */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}

/* Hover styles only for devices that really can hover */
@media (hover: hover) {
  .card:hover { transform: translateY(-4px); }
}
```

## Container queries

A media query looks at the whole screen. But a card does not care about the screen. It cares about the space *it* gets. The same card can sit in a narrow sidebar or in a wide main area on the same screen.

A **container query** styles an element by the size of its parent container.

```css
/* 1. Mark the parent as a container */
.card-slot {
  container-type: inline-size;  /* watch the width */
  container-name: card;         /* optional name */
}

/* 2. Base card: image on top, text below */
.card { display: grid; gap: 12px; }

/* 3. When the slot is at least 420px wide: image on the left */
@container card (min-width: 420px) {
  .card {
    grid-template-columns: 160px 1fr;
    align-items: center;
  }
}
```

:::interview What does mobile-first mean and why is it used?
Mobile-first means the base CSS is written for small screens, and `min-width` media queries add layout for larger screens. It is used because the small-screen layout is the simplest, so we add rules as space grows and do not have to undo desktop rules. It also forces us to decide what content matters most, and phones do not need to process styles written for desktop.
:::

:::interview What is the difference between media queries and container queries?
A media query applies styles based on the viewport, for example its width, or on user settings such as dark mode. A container query applies styles based on the size of a parent element that is marked with `container-type`. Media queries fit page-level layout. Container queries fit reusable components that must look right in a narrow sidebar and in a wide content area on the same screen.
:::

:::revise
- Always include the viewport meta tag, and never block zoom.
- Mobile-first: base styles for phones, then `min-width` queries for bigger screens.
- Fluid first: `max-width: 100%`, `min()`, `clamp()` and `auto-fit` grids reduce breakpoints.
- `clamp(min, preferred, max)` gives fluid text with safe limits.
- `100dvh` is the visible screen height on phones. It is safer than `100vh`.
- Container queries style a component by the width of its parent.
:::

# JavaScript essentials

*The core of the language: values, functions, scope, closures, arrays, objects and modules.*

## Why this matters

React, Vue, Angular and every other library are just JavaScript. If your base is strong, any framework is easy to learn. If it is weak, every bug looks like magic. All examples in this chapter run in the browser console or with Node.js.

## Variables

A variable is a labelled box that holds a value.

```javascript
const name = "Asha";  // cannot be reassigned
let score = 10;       // can be reassigned
score = 11;

// var is the old way. It ignores block scope. Avoid it.
```

Use `const` by default. Use `let` only when the value must change. This makes your code easier to trust.

## Types

JavaScript has seven **primitive** types (simple, single values) and one type for everything else: **object**.

| Type | Example | Note |
|---|---|---|
| `string` | `"hello"` | Text |
| `number` | `42`, `3.14` | Integers and decimals are the same type |
| `boolean` | `true`, `false` | |
| `undefined` | `let x;` | "No value was given yet" |
| `null` | `null` | "Empty on purpose" |
| `bigint` | `10n` | Very large integers |
| `symbol` | `Symbol("id")` | Unique keys, rarely needed |
| `object` | `{}`, `[]`, functions | Collections and everything complex |

### Equality and truthiness

`===` compares value and type. `==` first converts the types and then compares, which gives surprising results. Always use `===`.

```javascript
console.log(1 == "1");   // true  (string converted to number)
console.log(1 === "1");  // false (different types)
console.log(0 == "");    // true  (surprise)
console.log(null == undefined);  // true
console.log(null === undefined); // false
```

In an `if`, every value acts as true or false. Only these values are **falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is **truthy**, including `"0"`, `[]` and `{}`.

## Functions

A function is a recipe: you give it ingredients (parameters) and it gives back a result (return value).

```javascript
// Function declaration
function add(a, b) {
  return a + b;
}

// Arrow function: shorter, very common in modern code
const multiply = (a, b) => a * b;

// Default parameter and template string
const greet = (name = "friend") => `Hello, ${name}!`;

console.log(add(2, 3));      // 5
console.log(multiply(4, 5)); // 20
console.log(greet());        // Hello, friend!
```

Functions are values. You can store them in variables, pass them to other functions and return them. A function that you pass to another function is called a **callback**.

## Scope and hoisting

**Scope** is the area of code where a variable is visible. Think of rooms in a house. From inside a room you can see things in the hallway, but from the hallway you cannot see inside a closed room.

```javascript
const city = "Patna";          // global scope

function show() {
  const food = "litti";        // function scope
  if (true) {
    const drink = "chai";      // block scope: only inside { }
    console.log(city, food, drink); // all three are visible
  }
  // console.log(drink);       // ReferenceError: drink is not defined
}
show();
```

**Hoisting** means declarations are processed before the code runs. A function declaration can be called above the line where it is written. `let` and `const` are also hoisted, but you cannot use them before their line. That forbidden gap is called the **temporal dead zone**.

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Reassign | Yes | Yes | No |
| Declare twice | Yes | No | No |
| Before its line | `undefined` | Error | Error |

## Closures

Imagine a child who leaves home with a backpack. Wherever the child goes, the things in the backpack go too. A **closure** is a function together with its backpack: the variables from the place where it was created. The function keeps access to them even after the outer function has finished.

```javascript
function createCounter() {
  let count = 0;               // private: lives in the backpack
  return {
    increment: () => ++count,
    reset: () => { count = 0; },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.count);       // undefined: no direct access

const other = createCounter();    // a new, separate backpack
console.log(other.increment());   // 1
```

:::interview What is a closure? Give a practical use.
A closure is a function that remembers the variables of the scope where it was created, even when it runs later, outside that scope. Practical uses: private state (a counter whose value cannot be changed from outside), function factories such as `makeMultiplier(2)`, and callbacks like event handlers or timers that need data from the surrounding function. `debounce` is a classic closure: the returned function remembers the timer id between calls.
:::

## Arrays

An array is an ordered list. The most used array methods take a callback and do **not** change the original array.

```javascript
const products = [
  { name: "Pen", price: 20, inStock: true },
  { name: "Bag", price: 900, inStock: false },
  { name: "Book", price: 250, inStock: true },
];

// map: change every item, same length
const names = products.map((p) => p.name);
// ["Pen", "Bag", "Book"]

// filter: keep the items that pass the test
const available = products.filter((p) => p.inStock);

// find: the first item that passes, or undefined
const bag = products.find((p) => p.name === "Bag");

// reduce: fold everything into one value
const total = products.reduce((sum, p) => sum + p.price, 0); // 1170

// Chain them: names of items in stock, cheapest first
const list = products
  .filter((p) => p.inStock)
  .toSorted((a, b) => a.price - b.price)
  .map((p) => p.name);          // ["Pen", "Book"]
```

:::warn
`sort()` has two traps. It changes the original array, and without a compare function it sorts as text, so `[10, 9, 1].sort()` gives `[1, 10, 9]`. Always pass a compare function such as `(a, b) => a - b`. Use `toSorted()` when you need a sorted copy and want to keep the original.
:::

## Objects, destructuring and spread

An object is a set of key and value pairs, like a contact card.

```javascript
const user = {
  name: "Ravi",
  age: 22,
  address: { city: "Pune" },
};

// Destructuring: pull values out into variables
const { name, age, role = "student" } = user;
const [first, second] = ["a", "b"];

// Spread: copy and change without touching the original
const older = { ...user, age: 23 };
const moreTags = [...["html", "css"], "js"];

// Optional chaining (?.) and nullish coalescing (??)
console.log(user.address?.city);     // "Pune"
console.log(user.company?.name);     // undefined, no crash
console.log(user.nickname ?? "none"); // "none" (only for null/undefined)
```

`??` is safer than `||` for defaults. `0 || 10` gives `10` because `0` is falsy. `0 ?? 10` gives `0`.

### Values and references

Primitives are copied by value. Objects and arrays are copied by **reference**: the variable holds the address of the object, not the object itself. It is like sharing the link to a document: both people edit the same document.

```javascript
const a = { score: 1 };
const b = a;            // same object, two names
b.score = 99;
console.log(a.score);   // 99

const c = { ...a };     // shallow copy: a new top-level object
c.score = 5;
console.log(a.score);   // 99 (unchanged)

// Spread copies only one level. Nested objects are still shared.
const deep = structuredClone(user);  // full, deep copy
deep.address.city = "Delhi";
console.log(user.address.city);      // "Pune"

console.log({} === {}); // false: two different objects
```

This matters a lot in React, where you must create new objects instead of changing old ones.

## ES modules

A module is one file with its own scope. You choose what to share with `export`, and other files take it with `import`. This keeps a large project in small, clear pieces.

```javascript
// math.js
export const PI = 3.14159;
export function area(r) {
  return PI * r * r;
}
export default function double(n) {  // one default export per file
  return n * 2;
}
```

```javascript
// main.js
import double, { PI, area } from "./math.js";

console.log(double(4));  // 8
console.log(area(2));    // 12.56636
```

A build tool such as Vite joins your modules into a few optimised files. This step is called **bundling**.

:::revise
- Use `const` by default, `let` when the value changes, never `var`.
- Always compare with `===`. Know the eight falsy values.
- A closure is a function plus the variables of the scope where it was made.
- `map`, `filter`, `find` and `reduce` do not change the original array. `sort` does.
- Objects and arrays are shared by reference. Copy with spread or `structuredClone`.
- `?.` avoids crashes on missing values, `??` gives defaults for `null` and `undefined` only.
:::

# The DOM and events

*How JavaScript reads the page, changes it and reacts to the user.*

## Why this matters

React hides most DOM work from you, but it still happens underneath. When you understand the DOM and events, you can debug any framework, and you can build small features without any library.

The **DOM** (Document Object Model) is the page as a tree of objects, like a family tree. `document` is the root. Every HTML element is a **node** with a parent and maybe children.

## Finding elements

```javascript
// One element (the first match) or null. Uses CSS selectors.
const title = document.querySelector("h1");
const form = document.querySelector("#signup-form");

// All matches, as a NodeList (works with forEach)
const cards = document.querySelectorAll(".card");
cards.forEach((card) => console.log(card.textContent));

// A real array, so you can use map and filter
const texts = [...cards].map((card) => card.textContent.trim());
```

## Reading and changing

```javascript
const box = document.querySelector(".message");

box.textContent = "Saved!";            // set plain text (safe)
box.classList.add("success");          // add a CSS class
box.classList.toggle("hidden");        // add if missing, else remove
box.setAttribute("role", "status");    // set any attribute
box.style.setProperty("--brand", "teal"); // change a CSS variable

// data-* attributes: <li data-id="42">
const item = document.querySelector("li");
console.log(item.dataset.id);          // "42" (always a string)
```

## Creating and removing elements

```javascript
const list = document.querySelector("#todo-list");

function addTodo(text) {
  const li = document.createElement("li");
  li.textContent = text;           // user text goes in as text
  li.dataset.id = crypto.randomUUID();

  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.className = "delete";

  li.append(" ", del);             // add a space and the button
  list.append(li);                 // put the item on the page
}

addTodo("Learn the DOM");
// later: someElement.remove();
```

:::warn
Never put user input into `innerHTML`. If a user types `<img src=x onerror="stealCookies()">` as their name, the browser runs that code. This attack is called **XSS** (cross-site scripting). Use `textContent` for text. It shows the characters as they are and never runs them.
:::

## Events

An **event** is a signal that something happened: a click, a key press, a form submit, a scroll. You listen with `addEventListener` and give it a callback, called the **event handler**.

```javascript
const button = document.querySelector("#save");

function handleClick(event) {
  console.log(event.type);    // "click"
  console.log(event.target);  // the element that was clicked
}

button.addEventListener("click", handleClick);
// Stop listening when it is no longer needed
button.removeEventListener("click", handleClick);
```

## Bubbling and capturing

When you click a button inside a card, the click does not stay on the button. The event travels in three phases.

:::flow The path of a click
Capture | from document down to the target
Target | the clicked element
Bubble | from the target back up to document
:::

By default your handlers run in the **bubble** phase. So a click on a button also triggers the click handlers of its parent, grandparent and so on, like a bubble rising in water.

| Method | What it does |
|---|---|
| `event.preventDefault()` | Cancels the browser default (follow link, submit form) |
| `event.stopPropagation()` | Stops the event from travelling further |
| `event.target` | The element where the event started |
| `event.currentTarget` | The element whose handler is running now |

## Event delegation

Suppose a list has 500 items and each has a delete button. Adding 500 listeners is slow to set up, and new items added later would have no listener.

**Event delegation** means you put *one* listener on the parent and use bubbling to catch events from all children. It is like one security guard at the building gate, not one guard at every flat.

```javascript
const list = document.querySelector("#todo-list");

list.addEventListener("click", (event) => {
  // Was the click on (or inside) a delete button?
  const button = event.target.closest("button.delete");
  if (!button) return;            // clicked somewhere else: ignore

  const li = button.closest("li");
  console.log("Deleting", li.dataset.id);
  li.remove();
});
```

`closest(selector)` walks up from the element and returns the first ancestor (or the element itself) that matches. It is needed because the user may click an icon *inside* the button, and then `event.target` is the icon.

## Debounce: do not react to every key

A search box that calls the server on every key press wastes requests. **Debounce** waits until the user stops typing for a short time, then runs the function once. Think of a lift door: every new person resets the closing timer.

```javascript
function debounce(fn, delay = 300) {
  let timerId;                         // remembered by the closure
  return (...args) => {
    clearTimeout(timerId);             // cancel the previous plan
    timerId = setTimeout(() => fn(...args), delay);
  };
}

const search = debounce((text) => {
  console.log("Searching for", text);
}, 300);

const input = document.querySelector("#search");
input.addEventListener("input", (e) => search(e.target.value));
```

:::interview What is event delegation and why is it useful?
Event delegation means attaching one event listener to a common parent and not one to each child. Because events bubble up, the parent's handler receives them, and we use `event.target` with `closest()` to find which child was clicked. Benefits: fewer listeners and less memory, and it works for children that are added to the DOM later.
:::

:::revise
- The DOM is a tree of objects. `querySelector` finds elements with CSS selectors.
- Use `textContent` for user text. `innerHTML` with user input opens the door to XSS.
- Events travel: capture down, target, bubble up.
- `preventDefault()` stops the browser default, `stopPropagation()` stops the travel.
- Delegation: one listener on the parent, find the child with `event.target.closest()`.
- Debounce waits for a pause before running a function.
:::

# Asynchronous JavaScript

*How JavaScript waits for slow things such as network requests without freezing the page.*

## Why this matters

Loading data from a server can take a second or more. If JavaScript simply stopped and waited, the page would freeze: no clicks, no scrolling, no animation. Asynchronous code lets the page stay alive while it waits.

Think of a restaurant with one waiter. The waiter takes your order, gives it to the kitchen, and serves other tables. When your food is ready, the waiter brings it. The waiter never stands at the kitchen door doing nothing.

JavaScript is that waiter. It is **single-threaded**: it does one thing at a time. The slow work (network, timers) happens outside, in the browser, and JavaScript gets the result later.

## The event loop

Four pieces work together.

- **Call stack**: the function that is running now, and the functions that called it.
- **Web APIs**: browser features that do the waiting, such as `setTimeout` and `fetch`.
- **Task queue**: finished timers and events wait here.
- **Microtask queue**: finished promises wait here. It has higher priority.

:::flow One turn of the event loop
Run the call stack | until it is empty
Run all microtasks | promise callbacks
Render if needed | update the screen
Take one task | timer, click, network
:::

The **event loop** repeats these steps forever. The key rule: after the current code finishes, *all* microtasks run before the next task.

```javascript
console.log("1 start");

setTimeout(() => console.log("4 timeout"), 0);  // task queue

Promise.resolve().then(() => console.log("3 promise")); // microtask

console.log("2 end");

// Output: 1 start, 2 end, 3 promise, 4 timeout
```

Even with a delay of `0`, the timeout runs last. First the synchronous code finishes (1 and 2), then microtasks (3), then tasks (4).

## From callbacks to promises

The old way to handle async results was to pass a callback. When steps depend on each other, callbacks get nested deeper and deeper. People call this "callback hell".

A **promise** is like the token you get at a food counter. The token is not the food. It is a guarantee that you will get either your food or a "sorry, finished" message. A promise is an object that represents a future result.

| State | Meaning |
|---|---|
| pending | Still waiting |
| fulfilled | Finished with a value |
| rejected | Failed with an error |

A promise changes state only once. After that it is **settled**.

```javascript
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) resolve({ id, name: "Asha" });
      else reject(new Error("Invalid id"));
    }, 100);
  });
}

getUser(1)
  .then((user) => {
    console.log(user.name);        // "Asha"
    return user.name.toUpperCase(); // value for the next then
  })
  .then((upper) => console.log(upper))   // "ASHA"
  .catch((err) => console.log(err.message)) // any error above
  .finally(() => console.log("done"));   // always runs
```

## async and await

`async` and `await` are a cleaner way to write the same promises. The code reads from top to bottom like normal code.

- An `async` function always returns a promise.
- `await` pauses *that function* until the promise settles. The rest of the page keeps running.
- A rejected promise becomes a thrown error, so you catch it with `try...catch`.

```javascript
async function showUser(id) {
  try {
    const user = await getUser(id);   // wait for the result
    console.log("Hello", user.name);
    return user;
  } catch (err) {
    console.log("Failed:", err.message);
    return null;
  } finally {
    console.log("finished");          // runs in both cases
  }
}

showUser(1);   // Hello Asha, finished
showUser(-1);  // Failed: Invalid id, finished
```

## One after another, or all together

```javascript
// (inside an async function or a module)
// Sequential: the second starts after the first ends. About 200ms.
const a = await getUser(1);
const b = await getUser(2);

// Parallel: both start now. About 100ms.
const [c, d] = await Promise.all([getUser(1), getUser(2)]);
```

Use sequential only when the second call needs the result of the first.

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | All are fulfilled | Any one rejects |
| `Promise.allSettled` | All are settled | Never |
| `Promise.race` | The first one settles | The first one rejects |
| `Promise.any` | The first one is fulfilled | All reject |

## fetch: talking to a server

`fetch(url)` sends an HTTP request and returns a promise for the response. Reading the body is a second async step.

```javascript
async function getJSON(url, options) {
  const res = await fetch(url, options);

  // fetch only rejects on network failure. A 404 or 500 is still
  // a "successful" fetch, so we must check res.ok ourselves.
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();     // parses the body as JSON (also async)
}
```

:::warn
`fetch` does **not** reject for HTTP errors like `404` or `500`. It rejects only when the request could not be completed at all, for example no internet. Always check `res.ok` (true for status 200 to 299) before you use the data.
:::

Every request can be in one of four states, and a good UI shows each one: **loading** (a spinner), **error** (a clear message and a retry button), **empty** ("No results yet") and **success** (the data). The React chapters show this pattern in code.

## Cancelling a request

If the user types a new search before the old one returns, the old response is useless and may arrive late and overwrite the new result. `AbortController` cancels a request.

```javascript
let controller;

async function search(text) {
  controller?.abort();                 // cancel the previous request
  controller = new AbortController();
  try {
    const url = `/api/search?q=${encodeURIComponent(text)}`;
    const data = await getJSON(url, { signal: controller.signal });
    console.log(data);
  } catch (err) {
    if (err.name === "AbortError") return; // cancelled on purpose
    console.error(err);
  }
}

// Give up automatically after 5 seconds
// fetch(url, { signal: AbortSignal.timeout(5000) });
```

:::interview Explain the event loop. Why does a promise callback run before setTimeout with 0 delay?
JavaScript runs on one thread with a call stack. Async work is handed to the browser, and when it finishes, its callback is put in a queue. Timers and events go to the task queue. Promise callbacks go to the microtask queue. When the call stack is empty, the event loop first runs all microtasks, and only then takes the next task. So a `then` callback always runs before a `setTimeout` callback, even with a delay of 0.
:::

:::revise
- JavaScript has one thread. The browser does the waiting, the event loop brings results back.
- Order: synchronous code, then all microtasks (promises), then one task (timer, event).
- A promise is pending, then fulfilled or rejected, once.
- `await` pauses only its own `async` function. Catch errors with `try...catch`.
- `fetch` rejects only on network failure. Always check `res.ok`.
- Show loading, error, empty and success states. Cancel old requests with `AbortController`.
:::

# React 19 fundamentals

*Build the screen from small reusable pieces, and let React update the page when data changes.*

## Why this matters

In the DOM chapter you changed the page by hand: find the element, create nodes, update text, remove items. In a big app this gets messy fast, because you must remember every place that shows a piece of data.

**React** is a JavaScript library for building user interfaces. Its main idea: you describe what the screen should look like for the current data, and React works out the DOM changes. A simple formula helps: **UI = f(state)**. The screen is the result of a function, and the input is your data.

Think of LEGO. You build small bricks (a button, a card, a navbar) and join them into bigger things (a page). Each brick is a **component**.

## Starting a project

The quickest way to try React is with Vite, a build tool with a fast development server.

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

Vite creates `src/main.jsx`, which puts your `App` component on the page. It wraps the app in `StrictMode`, a development helper that runs some of your code twice to help you find bugs early.

## Components and JSX

A component is a JavaScript function that returns what should appear on the screen. Its name must start with a capital letter.

```jsx
function Welcome() {
  const name = "Asha";
  const hour = new Date().getHours();

  return (
    <section className="welcome">
      <h1>Hello, {name}</h1>
      <p>{hour < 12 ? "Good morning" : "Good day"}</p>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Welcome />
      <Welcome />
    </main>
  );
}
```

The HTML-like code is **JSX**. It is not HTML and not a string. The build tool turns it into normal JavaScript function calls. JSX has a few rules.

| Rule | Example |
|---|---|
| Return one root element | Wrap in a tag, or in an empty `<>...</>` fragment |
| Close every tag | `<img />`, `<br />`, `<input />` |
| Use camelCase names | `className`, `htmlFor`, `onClick`, `tabIndex` |
| JavaScript goes in curly braces | `{user.name}`, `{price * 2}` |
| `style` takes an object | `style={{ color: "red" }}` |

Inside `{ }` you can put any JavaScript **expression** (something that gives a value). You cannot put statements like `if` or `for`.

## Props

**Props** (properties) are the inputs of a component, like the arguments of a function. The parent passes them, the child reads them.

```jsx
function ProductCard({ title, price, inStock = true, children }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p>Rs. {price}</p>
      {!inStock && <p className="badge">Out of stock</p>}
      {children}
    </article>
  );
}

export default function Shop() {
  return (
    <ProductCard title="Notebook" price={120}>
      <button type="button">Add to cart</button>
    </ProductCard>
  );
}
```

- Text props use quotes: `title="Notebook"`. Everything else uses braces: `price={120}`.
- `children` is a special prop: whatever you write between the opening and closing tag.
- Props are **read-only**. A component must never change its own props. Data flows one way, from parent to child.

## Conditional rendering

```jsx
function Status({ isLoading, error, items }) {
  // 1. Early return for whole-screen states
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div>
      {/* 2. Ternary: either this or that */}
      {items.length === 0 ? <p>No items yet.</p> : <p>Your items:</p>}

      {/* 3. && : show this or nothing */}
      {items.length > 5 && <p>You have many items.</p>}
    </div>
  );
}
```

## Lists and keys

To show a list, turn an array of data into an array of elements with `map`.

```jsx
const courses = [
  { id: "c1", title: "HTML and CSS" },
  { id: "c2", title: "JavaScript" },
  { id: "c3", title: "React" },
];

function CourseList() {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  );
}
```

Every item in a list needs a `key`. A key is like a roll number in a classroom. If students change seats, the teacher still knows who is who. With keys, React knows which item was added, removed or moved, and it keeps each item's state with the right item.

:::warn
Do not use the array index as a key when the list can be reordered, filtered, or have items added or removed. The index describes the position, not the item. After a delete, React matches the wrong items and you see bugs like text in an input jumping to another row. Use a stable id from your data. Never use `Math.random()` as a key, because it changes on every render.
:::

## State

Props come from outside. **State** is the memory inside a component: data that changes over time and should update the screen, such as a counter, the text in an input or whether a menu is open.

```jsx
import { useState } from "react";

export default function Counter() {
  // count: the current value. setCount: the function to change it.
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Add one
      </button>
      <button type="button" onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

`useState` is a **hook**, a special function that lets a component use React features. When you call `setCount`, React runs the component function again with the new value and updates the DOM. This re-run is called a **render**.

Why not a normal variable? A normal `let count = 0` is reset to `0` on every render, and changing it does not tell React to render again.

Note that event handlers get the function itself: `onClick={handleClick}`. If you write `onClick={handleClick()}`, the function runs during render, not on click.

## State must not be mutated

React decides to render by checking whether you gave it a *new* value. If you change an object or array in place, the reference stays the same, and React may not update the screen. Always create a new object or array.

```jsx
import { useState } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn JSX", done: true },
    { id: 2, text: "Learn state", done: false },
  ]);

  const toggle = (id) =>
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t   // new object
    ));
  const remove = (id) =>
    setTodos(todos.filter((t) => t.id !== id));   // new array

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <button type="button" onClick={() => toggle(t.id)}>
            {t.done ? "Done" : "Open"}: {t.text}
          </button>
          <button type="button" onClick={() => remove(t.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

| Task | Do not use (mutates) | Use (new copy) |
|---|---|---|
| Add | `push`, `unshift` | `[...arr, item]` |
| Remove | `splice`, `pop` | `filter` |
| Change one | `arr[i] = x` | `map` |
| Sort | `sort`, `reverse` | `toSorted`, `toReversed` |
| Object field | `obj.x = 1` | `{ ...obj, x: 1 }` |

## Lifting state up

Two components often need the same data. A search box and a result list both need the search text. State cannot be shared sideways between siblings. So you move the state to their closest common parent and pass it down as props. This is called **lifting state up**.

Data goes down through props. Changes go up through callback props such as `onChange`. This one-way flow makes React apps easy to follow.

## How React updates the page

:::flow What happens after setState
Trigger | setState is called
Render | React calls your components
Reconcile | compare new tree with old
Commit | apply only the changes to the DOM
:::

Your components return a light description of the UI, made of plain JavaScript objects. Many people call this the **virtual DOM**. React compares the new description with the previous one. This comparison is called **reconciliation**. Then it changes only the real DOM nodes that are different. Touching the real DOM is the slow part, so doing less of it keeps the app fast.

:::interview What is the virtual DOM and how does reconciliation work?
The virtual DOM is a lightweight JavaScript description of the UI that components return. When state changes, React renders the components again to get a new description and compares it with the previous one. This process is reconciliation. React assumes that elements of different types produce different trees and uses `key` to match list items between renders. After the comparison it commits only the needed changes to the real DOM.
:::

:::interview Why does React need keys in a list?
Keys give each list item a stable identity between renders. With keys React can tell whether an item was added, removed or moved, so it reuses the right DOM nodes and keeps the right component state. Without good keys, React falls back to position, which causes wrong state and extra DOM work when the order changes. Keys must be unique among siblings and stable, so an id from the data is best.
:::

:::revise
- A component is a function that returns JSX. Its name starts with a capital letter.
- Props are read-only inputs from the parent. State is the component's own memory.
- Calling a state setter makes React render the component again.
- Never mutate state. Create new arrays and objects with spread, `map` and `filter`.
- Every list item needs a stable, unique `key`. Avoid the index for changing lists.
- Shared data lives in the closest common parent: lift state up, pass props down.
:::

# React hooks in depth

*useState, useEffect, useRef, useMemo, context and custom hooks, with the rules that keep them working.*

## Why this matters

Hooks are how function components remember things and connect to the world outside React. Most React bugs that beginners meet are hook bugs: stale values, effects that run forever, missing clean-up. Learn the mental model once and these bugs disappear.

## useState, a closer look

### State is a snapshot

Each render has its own fixed value of state, like a photo. Setting state does not change the variable in the current render. It asks React for a new render with a new value.

```jsx
import { useState } from "react";

export default function Likes() {
  const [likes, setLikes] = useState(0);

  function addThreeWrong() {
    setLikes(likes + 1);   // likes is 0 here: sets 1
    setLikes(likes + 1);   // likes is still 0: sets 1
    setLikes(likes + 1);   // result after render: 1
  }

  function addThreeRight() {
    setLikes((n) => n + 1); // updater: gets the latest value
    setLikes((n) => n + 1);
    setLikes((n) => n + 1); // result after render: 3
  }

  return (
    <button type="button" onClick={addThreeRight}>
      {likes} likes
    </button>
  );
}
```

When the new state depends on the old state, pass an **updater function** such as `(n) => n + 1`. React also **batches**: it collects all state updates in one event handler and renders once at the end.

## useEffect

Some code is not about calculating the UI. It connects your component to something outside React: a timer, a browser event, a WebSocket, a third-party map widget. These are **side effects**. `useEffect` lets you run them after React has updated the screen.

Think of an effect as a sync job: "keep this outside thing in sync with these values".

```jsx
import { useEffect, useState } from "react";

export default function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // 1. Setup: connect to the outside system
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    // 2. Cleanup: disconnect
    return () => window.removeEventListener("resize", onResize);
  }, []); // 3. Dependencies: when to run again

  return <p>Window is {width}px wide</p>;
}
```

The **dependency array** tells React when to run the effect again.

| Dependencies | The effect runs |
|---|---|
| Not given | After every render |
| `[]` | Once, after the first render |
| `[a, b]` | After the first render, and when `a` or `b` changes |

The **cleanup** function runs before the effect runs again and when the component is removed from the screen. Every subscription, timer and listener that you start in an effect should be stopped in its cleanup.

:::warn
Three classic effect mistakes:

1. **Missing dependency.** If the effect reads `userId` but the array is `[]`, it keeps using the first `userId` forever. List every value from the component that the effect uses. The React hooks ESLint plugin warns you about this.
2. **Infinite loop.** An effect that sets state, with no dependency array, renders, runs, sets state, renders, and never stops.
3. **Object or function as a dependency.** `{}` and `() => {}` are new on every render, so the effect runs every time. Move them inside the effect or depend on simple values.
:::

## You might not need an effect

Effects are for syncing with *outside* systems. Many effects written by beginners are not needed, and they make the code slower and harder to follow. Two common cases:

### Case 1: data you can calculate

```jsx
import { useEffect, useState } from "react";

// Not needed: extra state, extra effect, one extra render
function CartBad({ items }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price, 0));
  }, [items]);
  return <p>Total: {total}</p>;
}

// Better: calculate it during render
function CartGood({ items }) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return <p>Total: {total}</p>;
}
```

If a value can be calculated from props or other state, it is **derived data**. Do not store it in state. Just calculate it.

### Case 2: reacting to a user action

If something should happen *because the user clicked*, put the code in the click handler, not in an effect that watches a state change.

| You want to | Use |
|---|---|
| Calculate a value from props or state | A plain variable during render |
| Cache a slow calculation | `useMemo` |
| Respond to a click or submit | An event handler |
| Reset all state when an id changes | A different `key` on the component |
| Connect to a timer, listener, socket, widget | `useEffect` |

## useRef

A **ref** is a box with one field, `current`, that stays the same between renders. Changing it does **not** cause a render. It has two uses.

```jsx
import { useEffect, useRef, useState } from "react";

export default function SearchField() {
  const inputRef = useRef(null);      // 1. A handle to a DOM node
  const renders = useRef(0);          // 2. A value that survives renders
  const [text, setText] = useState("");

  useEffect(() => {
    inputRef.current.focus();         // focus the input on first show
  }, []);

  useEffect(() => {
    renders.current += 1;             // change without a new render
  });

  return (
    <input ref={inputRef} value={text} aria-label="Search"
           onChange={(e) => setText(e.target.value)} />
  );
}
```

| | `useState` | `useRef` |
|---|---|---|
| Change causes a render | Yes | No |
| Read during render | Yes | Avoid it |
| Use for | Data shown on the screen | DOM nodes, timer ids, previous values |

In React 19, a function component receives `ref` as a normal prop, so the older `forwardRef` wrapper is not needed for new code.

## useMemo, useCallback and memo

By default, when a component renders, all its children render too. This is usually fast enough. Optimise only when you can see or measure a real slowdown.

- `useMemo(fn, deps)` remembers the **result** of a calculation until a dependency changes.
- `useCallback(fn, deps)` remembers the **function itself**, so its reference stays the same.
- `memo(Component)` skips rendering a component when its props are the same as last time.

```jsx
import { useMemo, useState } from "react";

export default function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);

  // Filters again only when products or query change,
  // not when the theme button is clicked
  const visible = useMemo(
    () => products.filter((p) => p.name.includes(query)),
    [products, query]
  );

  return (
    <div className={dark ? "dark" : ""}>
      <input value={query} aria-label="Filter"
             onChange={(e) => setQuery(e.target.value)} />
      <button type="button" onClick={() => setDark(!dark)}>Theme</button>
      <p>{visible.length} products found</p>
    </div>
  );
}
```

## Context

Sometimes many components at different depths need the same value: the current theme, the logged-in user, the language. Passing it through every level as a prop is called **prop drilling**. **Context** is like a Wi-Fi signal: the provider broadcasts a value, and any component below it can connect directly.

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");   // default value

function ThemeButton() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button type="button" onClick={toggle}>
      Theme: {theme}
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const toggle = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  // React 19: render the context itself as the provider
  return (
    <ThemeContext value={{ theme, toggle }}>
      <ThemeButton />
    </ThemeContext>
  );
}
```

In React 18 and older code you will see `<ThemeContext.Provider value={...}>`. It does the same thing.

## Custom hooks

A **custom hook** is your own function whose name starts with `use` and that calls other hooks. It lets you reuse *logic* between components, the same way components let you reuse UI.

```jsx
import { useEffect, useState } from "react";

// Keeps a piece of state in localStorage
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

```jsx
function Notes() {
  const [text, setText] = useLocalStorage("draft", "");
  return (
    <textarea value={text} aria-label="Draft"
              onChange={(e) => setText(e.target.value)} />
  );
}
```

Each component that calls a custom hook gets its own separate state. Hooks share logic, not data.

## The rules of hooks

1. **Call hooks only at the top level** of a component or a custom hook. Not inside `if`, loops, nested functions, or after an early `return`.
2. **Call hooks only from React function components or custom hooks**, not from normal functions or class components.

Why? React does not know your variable names. It remembers each hook by its **call order** in a render: first hook, second hook, third hook. If a hook sits inside an `if` and is skipped in one render, every hook after it shifts by one position and gets the wrong state.

```jsx
function Profile({ userId }) {
  // Wrong: the hook is skipped when userId is missing
  // if (!userId) return null;
  // const [user, setUser] = useState(null);

  // Right: hooks first, conditions after
  const [user, setUser] = useState(null);
  if (!userId) return null;
  return <p>{user?.name ?? "Loading..."}</p>;
}
```

:::interview Explain useEffect and its dependency array.
`useEffect` runs code after render to synchronise a component with an external system, for example a subscription, a timer or a network request. The dependency array controls when it runs again: no array means after every render, an empty array means only after the first render, and `[a, b]` means when `a` or `b` has changed. The function returned from the effect is the cleanup. React calls it before the next run of the effect and when the component unmounts.
:::

:::interview What is the difference between useMemo and useCallback?
Both cache something between renders until their dependencies change. `useMemo` caches the return value of a function, useful for slow calculations. `useCallback` caches the function itself, useful when the function is passed to a child wrapped in `memo` or used as a dependency of an effect. `useCallback(fn, deps)` is the same as `useMemo(() => fn, deps)`.
:::

:::revise
- State is a snapshot per render. Use an updater `(n) => n + 1` when the new value depends on the old.
- `useEffect` syncs with outside systems: setup, cleanup, dependencies.
- No effect is needed for derived data or for things caused by a user event.
- `useRef` holds a DOM node or a value that changes without a render.
- `useMemo` caches a value, `useCallback` caches a function, `memo` skips a render.
- Hooks are called at the top level, in the same order, only from components and custom hooks.
:::

# Forms, data fetching and state management in React

*Collect input, talk to a server, and decide where each piece of data should live.*

## Why this matters

Almost every real feature is some mix of these three things: a form, a request, and state shared between parts of the screen. React 19 added new tools, called Actions, that remove a lot of repeated code for forms.

## Controlled and uncontrolled inputs

Who owns the value of an input?

- **Controlled**: React state owns it. You pass `value` and `onChange`. React always knows the current text.
- **Uncontrolled**: the DOM owns it. You read the value only when needed, for example on submit, with `FormData` or a ref.

```jsx
import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Derived data: no extra state needed
  const canSubmit = email.includes("@") && password.length >= 8;

  function handleSubmit(e) {
    e.preventDefault();               // stop the page reload
    if (canSubmit) onLogin({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email}
             onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password}
             onChange={(e) => setPassword(e.target.value)} />

      <button type="submit" disabled={!canSubmit}>Log in</button>
    </form>
  );
}
```

| | Controlled | Uncontrolled |
|---|---|---|
| Value lives in | React state | The DOM |
| Read the value | Any time, from state | On submit, with `FormData` or a ref |
| Good for | Live validation, dependent fields | Simple forms, file inputs |
| Set a start value with | `value` | `defaultValue` |

## React 19 Actions

In React 19 you can pass a function to the `action` prop of a `<form>`. React calls it on submit with the form's `FormData`. You do not write `preventDefault`. The function can be `async`. After the action finishes, React resets the uncontrolled fields of the form.

`useActionState` wraps such a function and gives you three things: the latest result, a wrapped action for the form, and a pending flag.

```jsx
import { useActionState } from "react";

// Receives the previous state and the submitted FormData.
// Whatever it returns becomes the new state.
async function subscribe(previousState, formData) {
  const email = String(formData.get("email")).trim();
  if (!email.includes("@")) {
    return { ok: false, message: "Enter a valid email", email };
  }
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    return { ok: false, message: "Server error. Try again.", email };
  }
  return { ok: true, message: "You are subscribed!", email: "" };
}
```

The component passes the wrapped action to the form.

```jsx
const initialState = { ok: false, message: "", email: "" };

export default function Newsletter() {
  const [state, formAction, isPending] =
    useActionState(subscribe, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="news-email">Email</label>
      <input id="news-email" name="email" type="email" required
             defaultValue={state.email} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Subscribe"}
      </button>
      <p role="status">{state.message}</p>
    </form>
  );
}
```

:::warn
The form fields are reset after the action runs, also when your action returns a validation error. The user would have to type everything again. To keep their input, return the submitted values in the state and feed them back with `defaultValue`, as the example does with `email`.
:::

:::note
React 19 also has `useFormStatus` (imported from `react-dom`), which lets a button component inside a form read the pending state of that form, and `useOptimistic`. `useOptimistic` shows the expected result immediately, for example a new comment in the list, while the request is still running, and goes back to the real state when the action ends. Learn it after you are comfortable with `useActionState`.
:::

## Fetching data in an effect

Fetching is syncing with an outside system (the server), so the basic tool is `useEffect`. Two details are essential: handle loading and errors, and ignore old responses.

```jsx
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [state, setState] = useState({
    data: null, error: null, loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === "AbortError") return;  // we cancelled it
        setState({ data: null, error, loading: false });
      });

    // url changed or component removed: cancel the old request
    return () => controller.abort();
  }, [url]);

  return state;
}
```

A component calls `const { data, error, loading } = useFetch("/api/users")` and returns a loading message, an error message, an empty message or the list.

:::warn
Without the cleanup you get a **race condition**. The user opens profile 1, then quickly profile 2. If the response for 1 arrives last, the screen shows user 1 on the page of user 2. Aborting the old request (or ignoring its result with a flag) in the cleanup function fixes this.
:::

## Reading a promise with use and Suspense

React 19 adds `use`, an API that reads the value of a promise during render. While the promise is pending, React shows the `fallback` of the nearest `<Suspense>` boundary. If the promise rejects, the nearest error boundary shows its fallback.

```jsx
import { Suspense, use } from "react";

// Cache: the same id must give the same promise on every render
const cache = new Map();
function fetchUser(id) {
  if (!cache.has(id)) {
    const promise = fetch(`/api/users/${id}`).then((res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    });
    cache.set(id, promise);
  }
  return cache.get(id);
}

function Profile({ userPromise }) {
  const user = use(userPromise);   // suspends until it resolves
  return <h2>{user.name}</h2>;
}

export default function ProfilePage({ id }) {
  return (
    <Suspense fallback={<p>Loading profile...</p>}>
      <Profile userPromise={fetchUser(id)} />
    </Suspense>
  );
}
```

:::warn
Do not create a new promise inside the component that calls `use`, for example `use(fetch(url))`. A new promise is created on every render, so the component suspends again and again. The promise must be stable: cached as above, or created by a framework or a data library and passed down.
:::

In real projects most teams do not write this plumbing by hand. They use a framework with built-in data loading, or a library such as TanStack Query or SWR. These add caching, retry, refetch on focus and removal of duplicate requests. Learn the manual way first so you know what the library does for you.

## Where should state live?

A messy app usually has the right data in the wrong place. Ask these questions in order.

| Kind of state | Example | Where to keep it |
|---|---|---|
| Derived | Total price, filtered list | Nowhere. Calculate it |
| Local UI | Is this dropdown open? | `useState` in the component |
| Shared by a few components | Search text and results | Lift to the common parent |
| App-wide, changes rarely | Theme, language, current user | Context |
| Complex with many actions | Cart, multi-step form | `useReducer` or a store library |
| Server data | Products, orders | A data library or framework |
| Shareable by link | Page number, filters | The URL query string |

### useReducer

When state has many kinds of updates, `useState` calls get scattered. A **reducer** puts all the update logic in one function. You describe *what happened* with an **action** object, and the reducer returns the new state. Think of a bank: you do not change the balance yourself, you hand in a slip (the action) and the bank (the reducer) updates the account.

```jsx
import { useReducer } from "react";

function cartReducer(state, action) {
  switch (action.type) {
    case "added": {
      const found = state.find((i) => i.id === action.item.id);
      if (!found) return [...state, { ...action.item, qty: 1 }];
      return state.map((i) =>
        i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
      );
    }
    case "removed":
      return state.filter((i) => i.id !== action.id);
    case "cleared":
      return [];
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export default function Cart() {
  const [items, dispatch] = useReducer(cartReducer, []);
  const pen = { id: "p1", name: "Pen", price: 20 };
  return (
    <button type="button"
            onClick={() => dispatch({ type: "added", item: pen })}>
      Add pen ({items.length} in cart)
    </button>
  );
}
```

A reducer must be a **pure function**: same input, same output, no mutation, no requests. That makes it very easy to test.

### Context plus reducer, and store libraries

For app-wide state, a common pattern without any library is: keep the reducer in a top component and share `items` and `dispatch` through context.

:::warn
When a context value changes, **every** component that reads that context renders again. If you put one big object with everything in a single context, a small change renders half the app. Split contexts by topic (theme, user, cart), and keep fast-changing data such as input text out of context.
:::

When the app grows, teams often choose a store library such as Redux Toolkit or Zustand. These let a component subscribe to only the slice of state it needs, and they give good debugging tools. You do not need one for a small app.

:::interview What are Actions in React 19 and what does useActionState return?
An Action is a function, usually async, that is passed to the `action` prop of a form or run inside a transition. React calls it with the `FormData`, tracks its pending state and resets the form afterwards. `useActionState(actionFn, initialState)` returns an array with three items: the current state (the last value returned by the action), a new action to pass to the form, and an `isPending` boolean. The action function receives the previous state as its first argument and the `FormData` as its second.
:::

:::interview When would you use Context and when a state library like Redux?
Context is a way to pass a value deep into the tree without prop drilling. It suits data that many components read and that changes rarely, such as theme, language or the logged-in user. A state library suits large client state that changes often and has complex update logic, because components can subscribe to small slices and the tools for debugging are better. For server data I would use a data fetching library, not either of these.
:::

:::revise
- Controlled input: `value` plus `onChange`. Uncontrolled: `defaultValue`, read on submit.
- A form `action` function receives `FormData`. No `preventDefault` needed.
- `useActionState(fn, initial)` returns `[state, formAction, isPending]`.
- Fetch in an effect with loading and error state, and abort in the cleanup.
- `use(promise)` works with `<Suspense>`. The promise must be stable, not created in render.
- Put state as low as possible. Derive what you can. Lift, then context, then a store.
:::

# Tailwind CSS v4 and a small design system

*Style directly in your markup with small utility classes, and keep the whole app consistent with design tokens.*

## Why this matters

With plain CSS you spend a lot of time on things that are not design: inventing class names, jumping between files, and worrying that changing one rule breaks another page.

**Tailwind CSS** is a utility-first CSS framework. A **utility class** does one small job: `p-4` adds padding, `flex` sets `display: flex`, `text-center` centres text. You combine them in the markup, like building with ready-made LEGO bricks.

```jsx
// Plain CSS way: invent a name, write the rules in another file
// <button className="primary-button">Save</button>

// Tailwind way: describe the look right here
function SaveButton() {
  return (
    <button
      type="button"
      className="rounded-lg bg-orange-500 px-4 py-2 font-semibold
                 text-white hover:bg-orange-600"
    >
      Save
    </button>
  );
}
```

## Setup in a Vite project (v4)

Tailwind v4 needs very little setup. There is no JavaScript config file by default.

```bash
npm install tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css : one line loads all of Tailwind */
@import "tailwindcss";
```

Tailwind finds your source files automatically and reads the class names in them. It generates CSS only for the classes you really use, so the final CSS file stays small.

:::note
Older tutorials for Tailwind v3 use `tailwind.config.js` and three `@tailwind base; @tailwind components; @tailwind utilities;` lines. In v4 these are replaced by the single `@import "tailwindcss";` line, and customisation moves into CSS with `@theme`.
:::

## Reading utility classes

Class names follow a pattern, so you can guess most of them.

| Class | CSS it produces |
|---|---|
| `p-4`, `px-4`, `mt-2` | `padding: 1rem`, left and right padding, `margin-top: 0.5rem` |
| `w-full`, `max-w-md` | `width: 100%`, a medium max width |
| `flex`, `items-center`, `gap-4` | Flexbox, `align-items: center`, `gap: 1rem` |
| `grid`, `grid-cols-3` | Grid with three equal columns |
| `text-lg`, `font-bold` | Larger text, bold weight |
| `bg-orange-500`, `text-white` | Background and text colour |
| `rounded-xl`, `shadow-md` | Border radius, box shadow |

Spacing numbers are steps of `0.25rem`. So `p-1` is 4px, `p-4` is 16px and `p-8` is 32px at the default font size. Colours have shades from `50` (lightest) to `950` (darkest).

When you need a value outside the scale, use square brackets: `w-[320px]`, `bg-[#1da1f2]`, `grid-cols-[240px_1fr]`. These are called **arbitrary values**. An underscore stands for a space.

## Variants: responsive, state and dark mode

A **variant** is a prefix that says *when* a utility applies. The pattern is `variant:utility`.

```jsx
function CourseCard({ title, text }) {
  return (
    <article
      className="group rounded-2xl border border-gray-200 bg-white p-4
                 transition hover:shadow-lg md:p-6
                 dark:border-gray-700 dark:bg-gray-900"
    >
      <h3 className="text-lg font-semibold text-gray-900
                     group-hover:text-orange-600 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {text}
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white
                   focus-visible:outline-2 focus-visible:outline-offset-2
                   focus-visible:outline-orange-500
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        Enrol
      </button>
    </article>
  );
}
```

Tailwind is mobile-first. A class without a prefix applies to all sizes. A prefix such as `md:` means "from this width **and up**".

| Prefix | Minimum width |
|---|---|
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |
| `2xl:` | 96rem (1536px) |

For example, `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` gives one column on phones, two columns from `md` and three from `lg`.

Other useful variants: `hover:`, `focus-visible:`, `active:`, `disabled:`, `first:`, `last:`, `group-hover:` (style a child when the parent with class `group` is hovered) and `dark:`.

By default `dark:` follows the operating system setting (`prefers-color-scheme`). If you want your own toggle button, tell Tailwind to use a class instead.

```css
@import "tailwindcss";

/* dark: utilities now apply inside any element with class "dark" */
@custom-variant dark (&:where(.dark, .dark *));
```

Then add or remove the class `dark` on the `<html>` element with JavaScript.

:::warn
Tailwind reads your files as plain text and looks for complete class names. It does not run your code. A class built from pieces, such as `"bg-" + color + "-500"`, is never found, so no CSS is generated for it. Always write full class names and choose between them:

`const tone = isError ? "bg-red-500" : "bg-green-500";`
:::

## Design tokens with @theme

A **design token** is a named design decision: the brand colour, the heading font, the card radius. If every developer picks their own orange, the product looks messy. Tokens keep everyone on the same values.

In Tailwind v4 you define tokens in CSS inside `@theme`. Each token is a CSS variable, and its name decides which utilities are created.

```css
@import "tailwindcss";

@theme {
  /* --color-*  gives bg-*, text-*, border-* utilities */
  --color-brand-50: #fff4ec;
  --color-brand-500: #eb793e;
  --color-brand-600: #d2622a;
  --color-brand-900: #5c2a10;

  /* --font-*  gives font-* utilities */
  --font-display: "Poppins", sans-serif;

  /* --radius-*  gives rounded-* utilities */
  --radius-card: 1rem;

  /* --breakpoint-*  gives a new responsive variant: 3xl: */
  --breakpoint-3xl: 120rem;
}
```

| Token in `@theme` | What you can now write |
|---|---|
| `--color-brand-500` | `bg-brand-500`, `text-brand-500`, `border-brand-500` |
| `--font-display` | `font-display` |
| `--radius-card` | `rounded-card` |
| `--breakpoint-3xl` | `3xl:grid-cols-4` |

The tokens are also normal CSS variables, so `var(--color-brand-500)` works in any custom CSS you write.

## Building a small design system

A **design system** is a set of tokens plus reusable components that use them. Start small: tokens, a Button, an Input and a Card cover most screens.

The trick is to keep the long class lists in **one place**, the component, and choose between them with props. Each variant is a complete class string, so Tailwind can find it.

```jsx
// src/components/Button.jsx
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg " +
  "font-semibold transition focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-brand-500 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  outline: "border border-brand-500 text-brand-600 hover:bg-brand-50",
  ghost: "text-brand-600 hover:bg-brand-50",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "primary", size = "md", className = "", ...props
}) {
  const classes =
    `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return <button type="button" className={classes} {...props} />;
}
```

```jsx
import { Button } from "./Button.jsx";

export function Demo() {
  return (
    <section className="rounded-card border border-gray-200 bg-white p-6">
      <h2 className="font-display text-xl text-brand-900">Frontend Notes</h2>
      <div className="mt-4 flex gap-3">
        <Button>Start reading</Button>
        <Button variant="outline" size="sm">Download</Button>
      </div>
    </section>
  );
}
```

Now a brand colour change is one edit in `@theme`, and a button style change is one edit in `Button.jsx`.

:::interview What is utility-first CSS? What are its advantages and disadvantages?
Utility-first means styling with many small single-purpose classes in the markup, not with custom semantic classes in a separate stylesheet. Advantages: no time spent on naming, a consistent design scale, changes are local so they do not break other pages, and the CSS file stays small because only used classes are generated. Disadvantages: long class lists in the markup, a learning period for the class names, and duplication unless repeated patterns are extracted into components.
:::

:::interview How do you customise the theme in Tailwind CSS v4?
In v4 the configuration is CSS-first. After `@import "tailwindcss";` I add a `@theme` block and define design tokens as CSS variables in special namespaces, for example `--color-brand-500`, `--font-display` or `--breakpoint-3xl`. Tailwind creates the matching utilities and variants, such as `bg-brand-500`, `font-display` and `3xl:`, and also exposes the tokens as normal CSS variables.
:::

:::revise
- Utility-first: small single-job classes combined in the markup.
- v4 setup: the Vite plugin and one line, `@import "tailwindcss";`.
- Variants are prefixes: `md:` (from that width up), `hover:`, `focus-visible:`, `dark:`.
- Define tokens in `@theme`. `--color-brand-500` creates `bg-brand-500` and friends.
- Always write complete class names. Never build them from string pieces.
- Keep long class lists inside reusable components such as `Button` and `Card`.
:::

# Accessibility and performance

*Make the site usable for every person, and fast on every device.*

## Why this matters

A site that looks great but cannot be used with a keyboard, or takes ten seconds to load on a budget phone, fails real people. Accessibility and performance are not extra polish. They are part of quality, and interviewers ask about both.

## Accessibility

**Accessibility** (often written **a11y**: "a", 11 letters, "y") means people with disabilities can use your site. A ramp next to the stairs is a good picture. It is built for wheelchairs, and then people with trolleys, prams and bicycles use it too. In the same way, an accessible site helps blind users and keyboard users, and also anyone using a phone in bright sunlight.

### The checklist that covers most problems

| Area | What to do |
|---|---|
| Structure | Semantic HTML, one `<h1>`, headings in order, landmarks like `<main>` and `<nav>` |
| Keyboard | Everything works with Tab, Shift+Tab, Enter, Space and Escape |
| Focus | A clear visible focus ring. Never remove the outline without a replacement |
| Names | Every input has a label, every icon button has `aria-label` |
| Images | Useful `alt` text, or `alt=""` for decoration |
| Colour | Enough contrast. Do not show meaning with colour alone |
| Motion | Respect `prefers-reduced-motion` |

WCAG (Web Content Accessibility Guidelines) is the standard that most teams follow. For its AA level, normal text needs a contrast ratio of at least 4.5:1 against its background, and large text needs at least 3:1. DevTools shows the ratio when you inspect a colour.

```css
/* A focus ring for keyboard users only */
:focus-visible {
  outline: 3px solid var(--brand, #eb793e);
  outline-offset: 2px;
}

/* Text for screen readers only: hidden on screen, still read aloud */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

:::warn
`outline: none` on buttons and links is one of the most common accessibility bugs. A keyboard user then has no idea where they are on the page. If the default ring does not match your design, restyle it with `:focus-visible`. Do not remove it.
:::

:::tip
Test like your users. Put the mouse away and use only the keyboard for five minutes. Then zoom the page to 200%. Then run the Lighthouse accessibility check. Automatic tools find only a part of the problems, so the keyboard test matters most.
:::

## Performance

### Core Web Vitals

Google defines three measurements of real user experience, called **Core Web Vitals**. They are measured for real visits, and the target should be met for at least 75% of them.

| Metric | Question it answers | Good value |
|---|---|---|
| **LCP** Largest Contentful Paint | How fast does the main content appear? | 2.5 seconds or less |
| **INP** Interaction to Next Paint | How fast does the page react to a tap or click? | 200 milliseconds or less |
| **CLS** Cumulative Layout Shift | Does content jump around while loading? | 0.1 or less |

:::flow Where to look for each metric
LCP | images, fonts, server speed
INP | heavy JavaScript on the main thread
CLS | missing sizes on images and ads
:::

### Images: usually the biggest win

Images are often the heaviest files on a page.

```html
<!-- The main (LCP) image: load it early with high priority -->
<img src="hero-800.avif" alt="Students in a coding class"
     width="800" height="450" fetchpriority="high" />

<!-- Images further down: load only when the user scrolls near -->
<img src="review-1.webp" alt="Portrait of a student"
     width="96" height="96" loading="lazy" decoding="async" />
```

- Always set `width` and `height`. The browser reserves the space before the image arrives, so nothing jumps. This fixes most CLS problems.
- Use modern formats (AVIF, WebP). They are much smaller than JPEG and PNG at similar quality.
- Do not send a 2000px photo to a phone. The `srcset` attribute lets you list several sizes, and the browser picks a fitting one.

:::warn
Do not put `loading="lazy"` on the hero image at the top of the page. It is usually the LCP element, and lazy loading delays it. Lazy load only what is below the first screen.
:::

### Ship less JavaScript: code splitting

The browser must download, parse and run all your JavaScript before the page is fully interactive. **Code splitting** means cutting the bundle into pieces and loading a piece only when it is needed. It is like carrying only today's books to school, not the whole shelf.

```jsx
import { lazy, Suspense, useState } from "react";

// This component goes into its own file, downloaded on demand
const Chart = lazy(() => import("./Chart.jsx"));

export default function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <section>
      <button type="button" onClick={() => setShowChart(true)}>
        Show chart
      </button>
      {showChart && (
        <Suspense fallback={<p>Loading chart...</p>}>
          <Chart />
        </Suspense>
      )}
    </section>
  );
}
```

`lazy` needs the component to be the **default export** of its file. Good places to split: routes (pages), modals, charts, rich text editors and anything heavy that is not visible at first.

Measure first, then fix. Use the Lighthouse and Performance panels in DevTools, and test with network and CPU throttling to feel what a slower phone feels like.

:::interview A page is slow. How would you find and fix the problem?
First I measure: Lighthouse for an overview, the Network panel for large or slow files, and the Performance panel for long JavaScript tasks. Then I fix the largest problem first. Typical fixes: compress and resize images and use modern formats, lazy load below-the-fold images, split the JavaScript bundle by route, remove unused libraries, cache static files, set image dimensions to stop layout shifts, and in React avoid unnecessary renders in large lists. After each change I measure again.
:::

:::interview How do you make a website accessible?
I start with semantic HTML, because native elements give roles and keyboard behaviour for free. I make sure everything works with the keyboard and has a visible focus style. Every input has a label and every meaningful image has alt text. I check colour contrast against WCAG AA. I use ARIA only where HTML is not enough, for example `aria-expanded` on a menu button or a live region for status messages. Then I test with the keyboard, a screen reader and Lighthouse.
:::

:::revise
- Semantic HTML, keyboard support, visible focus, labels and alt text cover most accessibility needs.
- WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text.
- Core Web Vitals: LCP 2.5s or less, INP 200ms or less, CLS 0.1 or less.
- Set `width` and `height` on images. Lazy load below the fold, never the hero image.
- Split code with `lazy` and `Suspense` so users download only what they need.
- Animate `transform` and `opacity`. Measure before and after every fix.
:::

# Interview questions and learning roadmap

*The questions that come up again and again, with model answers, and a clear plan for what to learn next.*

## How to answer in an interview

A good answer has three parts: a one-line definition, a simple example, and one trade-off or real use. Keep it short. If you do not know something, say so and explain how you would find out. Interviewers value clear thinking more than memorised lines.

## HTML and CSS

:::interview What is the difference between display: none, visibility: hidden and opacity: 0?
`display: none` removes the element from the layout. It takes no space and is hidden from screen readers. `visibility: hidden` hides it, but the space stays reserved, and it cannot be clicked. `opacity: 0` makes it fully transparent. It still takes space and can still be clicked and focused.
:::

:::interview How do you centre a div horizontally and vertically?
The modern answers: on the parent use `display: grid; place-items: center;`, or `display: flex; justify-content: center; align-items: center;`. The parent needs a height, for example `min-height: 100dvh`. For horizontal centring of a block with a fixed or max width, `margin-inline: auto` is enough.
:::

:::interview What is the difference between position relative, absolute, fixed and sticky?
`relative` keeps the element in the normal flow and lets me move it from its own place. It also becomes the reference for absolutely positioned children. `absolute` removes the element from the flow and places it relative to the nearest positioned ancestor. `fixed` places it relative to the viewport, so it stays during scrolling. `sticky` behaves like `relative` until a scroll position is reached and then sticks inside its parent.
:::

## JavaScript

:::interview What is the difference between null and undefined?
`undefined` means a variable was declared but has no value yet, or a property or function result does not exist. JavaScript gives it automatically. `null` is a value that a developer assigns on purpose to say "empty". `typeof undefined` is `"undefined"`, and `typeof null` is `"object"`, which is a historical bug. `null == undefined` is true, but `null === undefined` is false.
:::

:::interview What is the difference between debounce and throttle?
Both limit how often a function runs. Debounce waits until the events stop for a given time, then runs once. It fits a search box. Throttle runs at most once in every time window while the events continue. It fits scroll and resize handlers. Debounce says "wait for a pause", throttle says "not more than once per interval".
:::

:::interview What is the output of this code and why?
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
```
The output is `3 3 3` and then `0 1 2`. `var` is function scoped, so there is only one `i`. The callbacks run after the loop ends, when `i` is already 3. `let` is block scoped and each loop turn gets a new `j`, so each callback's closure remembers its own value.
:::

:::interview What is the difference between localStorage, sessionStorage and cookies?
All three store small text data in the browser. `localStorage` stays until it is cleared and is shared by all tabs of the same origin. `sessionStorage` lives only as long as the tab. Neither is sent to the server. Cookies are sent to the server with every request to their domain, can have an expiry date, and are much smaller. A cookie marked `HttpOnly` cannot be read by JavaScript, which makes it the safer place for login tokens.
:::

### A small coding task

Interviewers often ask for a short function. Speak while you write: say the plan first, then code it, then test with one example.

```javascript
// Flatten a nested array of any depth

function flatten(arr) {
  return arr.reduce(
    (flat, x) => flat.concat(Array.isArray(x) ? flatten(x) : x),
    []
  );
}
console.log(flatten([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]
```

## React

:::interview What causes a component to re-render?
A component renders again when its own state changes, when its parent renders (unless it is wrapped in `memo` and its props are the same), or when a context it reads gets a new value. A render does not always change the DOM. React compares the result with the previous one and commits only the differences.
:::

:::interview What is prop drilling and how do you avoid it?
Prop drilling is passing a prop through several layers of components that do not use it, only to reach a deep child. To avoid it I can first try composition, passing components as `children` so the middle layers do not need the data. For values needed in many places I use Context. For large, frequently changing state I use a store library.
:::

:::interview What is the difference between client-side rendering and server-side rendering?
With client-side rendering (CSR) the server sends an almost empty HTML file and a JavaScript bundle. The browser runs the JavaScript and builds the page. With server-side rendering (SSR) the server sends ready HTML, so the content appears sooner and search engines read it easily. Then JavaScript attaches the event handlers, a step called hydration. CSR is simpler to host. SSR usually gives a faster first view and better SEO, at the cost of a server and more complexity.
:::

:::interview What is new in React 19?
The main additions are Actions for async updates and forms: a function passed to a form's `action` prop, with `useActionState` for the result and pending state, `useFormStatus` for form status inside child components, and `useOptimistic` for instant UI feedback. The `use` API reads a promise or a context during render. `ref` is now a normal prop for function components, so `forwardRef` is not needed in new code, and a context can be rendered directly as a provider. React can also place `<title>` and `<meta>` tags written inside components into the document head.
:::

:::warn
Do not learn answers by heart without building anything. The follow-up question is almost always "show me" or "where did you use this?". One small project that you built and can explain line by line is worth more than fifty memorised definitions.
:::

## A learning roadmap

Follow this order. Each step uses the one before it. Do not move on until you have built the small project for the step.

:::flow The path
HTML | structure and forms
CSS | box model, Flexbox, Grid
JavaScript | language, DOM, async
React | components, hooks, data
Tailwind | fast, consistent styling
Portfolio | deploy and share
:::

| Step | Learn | Build this |
|---|---|---|
| 1 | Semantic HTML, forms | A personal profile page with a contact form |
| 2 | CSS basics, Flexbox, Grid, responsive | A landing page that works from 320px to desktop |
| 3 | JavaScript basics, arrays, objects | A quiz or a tip calculator in the console and on a page |
| 4 | DOM, events, fetch | A to-do app with `localStorage`, then a weather or movie search using a public API |
| 5 | React fundamentals and hooks | Rebuild the to-do app and the search app in React |
| 6 | Forms, data, state, Tailwind | A small shop: product list, filters, cart, checkout form |
| 7 | Accessibility, performance, deploy | Audit your shop with Lighthouse, fix it, put it online |

### After these notes

These topics come next. You do not need them on day one, but real jobs use them.

- **Git and GitHub**: save your work in commits, work in branches, open pull requests.
- **TypeScript**: JavaScript with types. It catches many mistakes before the code runs, and most React jobs use it.
- **A React framework** such as Next.js: routing, server rendering and data loading in one place.
- **Testing**: Vitest and React Testing Library for components, Playwright for whole user flows.
- **Deployment**: put your projects online with a static host and a custom domain.

### Portfolio tips

- Three finished, deployed projects are better than ten half-done ones.
- Write a clear README for each project: what it does, the tech used, how to run it, a screenshot and the live link.
- Make every project responsive and keyboard friendly. Reviewers open them on their phone.
- Be ready to explain every line. If you used a tutorial or an AI tool, rebuild one feature alone so that you truly understand it.

:::revise
- Answer in three parts: definition, small example, trade-off.
- Core set to know cold: box model, specificity, Flexbox vs Grid, closures, event loop, promises, keys, hooks rules, `useEffect`.
- Debounce waits for a pause. Throttle limits to once per interval.
- React re-renders on state change, parent render, or context change.
- Learn in order: HTML, CSS, JavaScript, React, Tailwind. Build one project per step.
- Next steps: Git, TypeScript, a React framework, testing and deployment.
:::
