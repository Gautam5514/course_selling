---
title: Next.js 16 & React 19 Architecture Handbook
subtitle: How a modern full stack React app is put together, from Server Components and caching to auth, AI streaming and zero-downtime deployment.
category: Full Stack
level: Intermediate to Pro
accent: emerald
tags: nextjs, react, typescript, app-router, ai-sdk
highlights: Server Components | Actions & Forms | Cache Components & PPR | Prisma + PostgreSQL | Auth & Security | AI Streaming
tagline: Server Components • Actions • Cache Components • Prisma • Auth • AI SDK
description: This handbook explains the architecture of a Next.js 16 and React 19 app in plain language, with TypeScript code you can type and run. You will learn where code runs, how data is fetched, cached and streamed, how forms, databases, sessions and AI responses fit in, and how to secure, test and deploy the result. It assumes you know basic React and JavaScript, and it ends with a cheat sheet, interview questions and a study plan.
---

# Server Components: the mental model

*Where your React code runs, why it matters, and how one page is built in two places.*

## Why this matters

Think of a restaurant. The kitchen is at the back. It has the raw food, the gas stove and the recipe book. The table is at the front. It has only the finished plate and a bell to call the waiter. Nobody carries the gas stove to the table.

A Next.js 16 app works the same way. The **server** is the kitchen: it can reach the database, the secret keys and the file system. The **browser** is the table: it shows the finished page and reacts to clicks. React 19 lets you write both parts with the same component syntax, but you must always know which side a piece of code runs on. Most bugs and most security problems in this stack come from mixing up the two sides.

This handbook uses one small example app from start to finish: **LearnHub**, a site that lists courses, lets a student enrol, and has an AI study helper.

## What is new in this stack

Before the details, here is the short list of things that changed. Every item is explained in a later chapter.

| Area | What you should know |
|---|---|
| React 19 | Server Components, Actions, `useActionState`, `useOptimistic`, `use()` |
| React 19.2 | `<Activity>`, `useEffectEvent`, View Transitions |
| Bundler | Turbopack is the default for `next dev` and `next build` |
| Request APIs | `params`, `searchParams`, `cookies()`, `headers()` must be awaited |
| Caching | Opt-in with `cacheComponents: true` and the `use cache` directive |
| Network file | `middleware.ts` is deprecated; the new name is `proxy.ts` |

Next.js 16 needs **Node.js 20.9 or newer** and **TypeScript 5.1 or newer**.

## The idea

A **component** is a function that returns UI. In the App Router, every component is a **Server Component** unless you say otherwise. A Server Component:

- runs only on the server, never in the browser;
- can be `async` and can `await` data directly;
- can read the database, the file system and secret environment variables;
- sends **no JavaScript** for itself to the browser.

A **Client Component** is a component in a file that starts with the line `'use client'`. It can use state, effects and click handlers. The next chapter covers it in detail.

```tsx
// app/courses/page.tsx  -> a Server Component (no directive needed)
import { prisma } from '@/lib/prisma'

export default async function CoursesPage() {
  // This line runs on the server. The browser never sees the query.
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, title: true, level: true },
    orderBy: { title: 'asc' },
  })

  return (
    <ul>
      {courses.map((c) => (
        <li key={c.id}>
          {c.title} ({c.level})
        </li>
      ))}
    </ul>
  )
}
```

There is no `useEffect`, no loading flag and no API endpoint here. The component asks for data and returns HTML. That is the main gift of Server Components: **the data and the UI that needs it live in the same place**.

## What actually travels to the browser

When a request comes in, React renders the Server Components on the server. The result is not only HTML. React also produces a compact description of the rendered tree called the **RSC Payload** (RSC means React Server Components).

The RSC Payload contains:

- the rendered output of the Server Components;
- empty slots where Client Components should go, with a link to their JavaScript file;
- the props that the server passes to those Client Components.

:::flow First visit to /courses
Browser | asks for /courses
Server Components | run, fetch data
HTML + RSC Payload | sent to the browser
Hydration | Client Components become interactive
:::

**Hydration** means React attaches event handlers to HTML that already exists. The user can read the page before hydration finishes. Only Client Components are hydrated, because Server Components have nothing to attach.

On later navigations (clicking a `<Link>`), the browser does not ask for a full HTML page. It asks only for the RSC Payload of the new route and React updates the page in place. This is why moving between pages feels like a single-page app.

:::example Dry run: who runs where?
Take this tree for the page `/courses/react-basics`.

| Component | Type | Runs on server | JS sent to browser |
|---|---|---|---|
| `RootLayout` | Server | yes | no |
| `CoursePage` | Server | yes | no |
| `LessonList` | Server | yes | no |
| `EnrolButton` | Client | yes, for first HTML | yes |
| `VideoPlayer` | Client | yes, for first HTML | yes |

Two things surprise beginners. First, Client Components also render once on the server to produce the first HTML. "Client" means "also runs in the browser", not "only in the browser". Second, the three Server Components add zero bytes to the JavaScript bundle, even if they import a big Markdown library.
:::

## What a Server Component cannot do

A Server Component runs once per request and then it is gone. It has no memory between renders and no access to the browser. So it cannot use:

- `useState`, `useReducer`, `useEffect`, `useRef` (there is nothing to keep or re-run);
- event handlers such as `onClick` (there is no browser to click in);
- browser objects such as `window`, `localStorage` or `document`.

If you need any of these, that part of the UI must be a Client Component.

| Need | Server Component | Client Component |
|---|---|---|
| Read the database or secrets | yes | no |
| `async` / `await` in the component | yes | no |
| State and effects | no | yes |
| Click and input handlers | no | yes |
| Adds to the JS bundle | no | yes |

:::warn Thinking "server" means "slow page reload"
Many beginners avoid Server Components because they remember old server-rendered sites where every click reloaded the page. That is not how this works. After the first load, navigation fetches only the RSC Payload and React patches the screen. Layouts stay mounted and keep their state. You get server data with app-like navigation.
:::

## Rendering time: build, request, or both

A Server Component can run at three different moments.

1. **At build time** (`next build`). The output is saved and reused for every visitor. This is called **prerendering**.
2. **At request time**. The component runs for each visitor, because it needs something only a request has, such as a cookie.
3. **Both on one page**. With Cache Components turned on, Next.js prerenders a static shell and streams the request-time parts into it. This is called **Partial Prerendering** and has its own chapter.

You do not pick the mode with a setting. Next.js looks at what each component uses. If it only uses things known at build time, it is prerendered. If it reads `cookies()`, `headers()`, `searchParams` or uncached data, that part waits for a request.

:::tip
When you are unsure where a file runs, add `console.log('where am I?')`. If the message appears in the terminal that runs `next dev`, the code ran on the server. If it appears in the browser console, it ran on the client. A Client Component will print in both places on first load.
:::

:::interview What is the difference between Server-Side Rendering (SSR) and React Server Components?
SSR is about **when** HTML is made: the server renders the component tree to HTML for the first load, and then the browser downloads the same components and hydrates them. All components still ship their JavaScript. React Server Components are about **where a component lives**: a Server Component runs only on the server and its code is never sent to the browser. Its output travels as the RSC Payload. The two work together in Next.js. Server Components produce the payload, SSR turns the full tree (including the first render of Client Components) into HTML for a fast first paint, and only the Client Components are hydrated.
:::

:::revise
- In the App Router every component is a Server Component unless the file starts with `'use client'`.
- Server Components can be `async`, read the database and secrets, and send no JavaScript to the browser.
- The server sends HTML for the first paint plus an RSC Payload that describes the tree and the props for Client Components.
- Client Components render on the server for the first HTML and again in the browser, where they are hydrated.
- Server Components cannot use state, effects, event handlers or browser objects.
- Next.js 16 needs Node.js 20.9+, uses Turbopack by default and makes request APIs async.
:::

# Client Components and the boundary

*How to add interactivity without sending your whole app to the browser.*

## Why this matters

Go back to the restaurant. The kitchen cooks, but the customer still needs a few things at the table: a salt shaker, a menu to flip through, a bell. These are small and they must be at the table, because the customer uses them directly.

Client Components are those table items. They handle clicks, typing, animations and anything that uses browser features. The skill is to keep them **small and at the edges**, so that most of the page stays in the kitchen.

## The idea

Put `'use client'` as the very first line of a file. It is a **directive**: a special string that tells the bundler something about the file.

```tsx
// components/enrol-button.tsx
'use client'

import { useState } from 'react'

export function EnrolButton({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false)   // state needs the browser

  return (
    <>
      <button onClick={() => setOpen(true)}>Enrol now</button>
      {open && <p>Confirm enrolment for course {courseId}?</p>}
    </>
  )
}
```

`'use client'` does not mark one component. It marks a **boundary** in the module graph. The **module graph** is the map of which file imports which file. Everything that this file imports, and everything those files import, becomes part of the client bundle too.

:::flow What 'use client' pulls into the browser
page.tsx | Server
enrol-button.tsx | 'use client' boundary
date-utils.ts | imported, so also client
chart-lib | imported, so also client
:::

So you need the directive only once, at the entry point. Files imported below the boundary do not need their own `'use client'` line.

:::warn Putting 'use client' at the top of a page or layout
If you write `'use client'` in `app/layout.tsx` or in a big page file, every component it imports becomes client code. You lose direct data access, and the JavaScript bundle grows. Keep pages and layouts as Server Components. Move only the interactive piece (a button, a form, a menu) into its own small client file.
:::

## What can cross the boundary

A Server Component passes props to a Client Component. Those props travel over the network inside the RSC Payload, so they must be **serializable**. Serializable means "can be turned into text and rebuilt on the other side".

| Can be passed as a prop | Cannot be passed as a prop |
|---|---|
| strings, numbers, booleans, `null` | ordinary functions and callbacks |
| plain objects and arrays | class instances (for example a model object) |
| `Date`, `Map`, `Set`, `BigInt` | symbols that are not global |
| a Promise | objects with methods |
| JSX (already rendered server output) | |
| a Server Function (marked `'use server'`) | |

```tsx
// app/courses/[slug]/page.tsx  (Server Component)
import { EnrolButton } from '@/components/enrol-button'
import { getCourse } from '@/lib/data/courses'

export default async function Page(props: PageProps<'/courses/[slug]'>) {
  const { slug } = await props.params
  const course = await getCourse(slug)

  // Pass only what the button needs: a string, not the whole row.
  return <EnrolButton courseId={course.id} />
}
```

:::warn Passing a whole database row to the client
Props of a Client Component are visible to anyone who opens the browser's network tab. If you pass the full `user` object, you may send `passwordHash`, `email` or internal notes to the browser even if the component never shows them. Pass the smallest set of fields. Chapter 5 shows how a data layer returns safe objects by default.
:::

## The composition pattern: server content inside a client wrapper

A Client Component cannot **import** a Server Component. Once you are below the boundary, every import is client code. But a Client Component can **receive** already-rendered server output as `children` or any other prop.

Think of a photo frame. The frame (client) can open and close, but the photo inside (server) was printed elsewhere and just slotted in.

```tsx
// components/collapsible.tsx
'use client'

import { useState, type ReactNode } from 'react'

export function Collapsible(props: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <section>
      <button onClick={() => setOpen(!open)}>{props.title}</button>
      {open && props.children}
    </section>
  )
}
```

```tsx
// app/courses/[slug]/page.tsx  (Server Component, part of the JSX)
<Collapsible title="Syllabus">
  {/* LessonList is a Server Component. It can query the database. */}
  <LessonList courseId={course.id} />
</Collapsible>
```

The page (server) renders `LessonList` and hands the result to `Collapsible` as `children`. `Collapsible` does not know or care what is inside. `LessonList` adds no JavaScript to the bundle.

## Context providers

**Context** is React's way to share a value with many components without passing props through every level. Context needs state, so a provider must be a Client Component. Use the same composition pattern: write a small `'use client'` provider component that renders `<ThemeContext value={theme}>{children}</ThemeContext>`, and wrap `children` with it in the root layout. The layout stays a Server Component, because it only passes `children` through. In React 19 you render the context object itself as the provider. The older `.Provider` form still works.

## Keeping server code out of the browser

Some modules must never reach the browser: the database client, code that reads `process.env.SESSION_SECRET`, payment code. If a Client Component imports such a file by mistake, the bundler would try to ship it.

Add one line at the top of server-only files:

```ts
// lib/prisma.ts
import 'server-only'   // build error if a Client Component imports this
```

Now a wrong import fails the build with a clear message instead of leaking a secret. There is a matching `client-only` package for modules that use `window`.

Environment variables follow a simple rule. Only variables whose name starts with `NEXT_PUBLIC_` are put into the browser bundle. Every other variable is `undefined` in client code.

```bash
# .env.local  (never commit this file)
DATABASE_URL="postgresql://..."        # server only
SESSION_SECRET="..."                   # server only
NEXT_PUBLIC_SITE_NAME="LearnHub"       # visible to everyone
```

:::example Dry run: shrink the client bundle
A page shows a course with a long description, a list of 40 lessons and a "Save" heart button. A beginner writes `'use client'` at the top of the page because of the heart.

| Step | Client code | Result |
|---|---|---|
| Whole page is client | description, list, heart, date library | data must come from an API call |
| Move heart to `save-button.tsx` | heart only | page can `await` the database again |
| Pass `courseId` and `initialSaved` | two small props | no extra request on load |

The page went from "everything in the browser" to one tiny interactive island, and the code became shorter.
:::

:::interview Can a Client Component render a Server Component?
It cannot import one, because everything imported below a `'use client'` boundary becomes client code. But it can render one that arrives as a prop, most often `children`. The parent Server Component renders the server child first and passes the finished output into the Client Component as a slot. This is how a client-side modal, tab panel or context provider can wrap server-rendered content without pulling that content into the bundle.
:::

:::interview Do Client Components run on the server?
Yes, once. For the first page load Next.js renders Client Components on the server to produce HTML, so the user sees content early. Then the browser downloads their JavaScript and hydrates them. This is why code that touches `window` directly in the component body crashes on the server. Put such code inside `useEffect` or an event handler, which run only in the browser.
:::

:::revise
- `'use client'` marks a boundary: the file and everything it imports go to the browser.
- Keep the directive on small leaf components, never on a whole page or layout.
- Props that cross the boundary must be serializable; functions are not, except Server Functions.
- A Client Component cannot import a Server Component but can receive one as `children`.
- `import 'server-only'` turns a secret leak into a build error.
- Only `NEXT_PUBLIC_` environment variables reach the browser.
:::

# App Router: files, layouts and special files

*Folders become URLs, and a few reserved file names give you layouts, loading states and error screens.*

## Why this matters

Imagine a big office building. Every floor has the same lift and the same reception desk, but each room is different. You do not rebuild the lift for each room. You build it once and put the rooms inside.

The App Router works like that building. A **layout** is the shared part (header, sidebar). A **page** is the room. Special files add a waiting area (`loading`) and a first-aid box (`error`). Because these are decided by file names, a new developer can open the `app` folder and understand the whole site.

## Folders are routes

Inside `app/`, each folder is one **segment** of the URL. A folder becomes a public page only when it contains a `page.tsx`.

```text
app/
  layout.tsx                 root layout (required)
  page.tsx                   /
  courses/
    page.tsx                 /courses
    loading.tsx              loading UI for /courses
    [slug]/
      page.tsx               /courses/react-basics
      error.tsx              error UI for one course
  (account)/
    layout.tsx               shared layout, not in the URL
    settings/page.tsx        /settings
  api/
    health/route.ts          GET /api/health
  _components/               private folder, never a route
proxy.ts                     runs before requests (project root)
```

| File | Purpose |
|---|---|
| `layout.tsx` | UI shared by a segment and its children; keeps state on navigation |
| `page.tsx` | The unique UI of a route; makes the route public |
| `loading.tsx` | Fallback shown while the page streams in |
| `error.tsx` | Fallback shown when rendering throws |
| `not-found.tsx` | UI for `notFound()` and unknown URLs |
| `route.ts` | An HTTP endpoint instead of a page |
| `template.tsx` | Like a layout, but re-created on every navigation |
| `default.tsx` | Fallback for a parallel route slot |

Folder name patterns:

| Pattern | Example | Meaning |
|---|---|---|
| `[name]` | `courses/[slug]` | dynamic segment, one value |
| `[...name]` | `docs/[...path]` | catch-all, one or more segments |
| `[[...name]]` | `docs/[[...path]]` | optional catch-all, also matches `/docs` |
| `(name)` | `(account)` | route group: organises files, not in the URL |
| `_name` | `_components` | private folder: never routable |
| `@name` | `@modal` | named slot for a parallel route |

## Layouts

The **root layout** is required. It must contain the `<html>` and `<body>` tags.

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'LearnHub', template: '%s | LearnHub' },
  description: 'Short courses for busy students.',
}

export default function RootLayout(props: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <header>LearnHub</header>
        <main>{props.children}</main>
      </body>
    </html>
  )
}
```

`LayoutProps` and `PageProps` are global helper types. Next.js generates them from your folders during `next dev`, `next build` or `npx next typegen`, so you do not import them.

A layout does **not** re-render when you move between its child pages. If the sidebar has an open menu, it stays open. This is a feature, but it has one important result:

:::warn Doing the only auth check in a layout
Because a layout is not re-rendered on every navigation, a check placed only in the layout does not run again when the user moves from `/dashboard` to `/dashboard/billing`. Do the check close to the data: in the page, in the data function, and in every Server Action. Chapter 11 shows the pattern.
:::

## Dynamic routes and async params

In Next.js 16, `params` and `searchParams` are **Promises**. You must `await` them. The old synchronous access from Next.js 14 was removed.

```tsx
// app/courses/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getCourse } from '@/lib/data/courses'

export default async function CoursePage(
  props: PageProps<'/courses/[slug]'>,
) {
  const { slug } = await props.params          // Promise -> value
  const query = await props.searchParams       // ?tab=reviews
  const tab = typeof query.tab === 'string' ? query.tab : 'overview'

  const course = await getCourse(slug)
  if (!course) notFound()                      // renders not-found.tsx

  return (
    <article>
      <h1>{course.title}</h1>
      <p>Showing tab: {tab}</p>
    </article>
  )
}
```

Why did they become async? A page has parts that do not depend on the URL values (the frame, the headings) and parts that do. If `params` is a Promise, Next.js can start rendering the first kind early and wait only where you actually `await`. This is what makes the static shell of Partial Prerendering possible.

The same rule holds for `cookies()`, `headers()` and `draftMode()`: always `await` them.

To prerender known pages at build time, export `generateStaticParams` from the page. It returns the list of values to build, for example `[{ slug: 'sql-101' }]`. Chapter 7 shows it in use.

## How the special files nest

For one segment, Next.js builds this structure for you. The order is worth memorising, because it explains what catches what.

:::flow Nesting inside one route segment
layout.tsx | shared frame
error.tsx | error boundary
loading.tsx | Suspense boundary
page.tsx | your content
:::

- `loading.tsx` wraps the page in a `<Suspense>` boundary. Its content shows at once while the page is still fetching.
- `error.tsx` wraps the loading UI and the page in an **error boundary**. An error boundary is a component that catches errors thrown while rendering its children and shows a fallback instead of a blank screen.
- `error.tsx` does **not** catch errors thrown by the `layout.tsx` in the same folder, because the layout sits outside it. A parent segment's `error.tsx` catches those. For the root layout, use `app/global-error.tsx`.

```tsx
// app/courses/[slug]/error.tsx
'use client'                       // error boundaries must be client

export default function CourseError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <div role="alert">
      <h2>We could not load this course.</h2>
      {/* digest is an id you can search for in the server logs */}
      <p>Reference: {props.error.digest}</p>
      <button onClick={() => props.retry()}>Try again</button>
    </div>
  )
}
```

:::note
`retry` re-fetches and re-renders the failed segment. It became stable in Next.js 16.3. In older versions the prop is called `reset`, which only clears the error and re-renders without fetching again. If you maintain an older app, you will see `reset` in the code.
:::

In production, an error from a Server Component reaches the browser with a generic message. The real message stays in the server logs. This protects you from showing a database error to a visitor.

## Navigation

Use the `<Link>` component for links inside your app. It **prefetches** the target route when the link becomes visible, so the click feels instant. Prefetching means loading something before the user asks for it.

```tsx
import Link from 'next/link'

export function CourseCard(props: { slug: string; title: string }) {
  return <Link href={`/courses/${props.slug}`}>{props.title}</Link>
}
```

:::example Dry run: one request through the files
A logged-out visitor opens `/courses/sql-101`.

1. `proxy.ts` runs first. It lets the request pass.
2. `app/layout.tsx` renders the header.
3. `app/courses/[slug]/loading.tsx` is sent as the first fallback.
4. `page.tsx` awaits `params`, gets `{ slug: 'sql-101' }` and queries the course.
5. The course exists, so the page HTML streams in and replaces the fallback.
6. If the query threw, `error.tsx` would show instead. If the course were missing, `notFound()` would show `not-found.tsx`.
:::

## Route groups and parallel routes in one minute

A **route group** `(name)` lets two sets of pages have different layouts without changing URLs. For example `(marketing)` pages get a wide landing layout, and `(app)` pages get a sidebar.

A **parallel route** `@name` renders a second page into the same layout at the same time, such as a modal or a side panel. In Next.js 16, every slot must have a `default.tsx` file, or the build fails. The simplest one is a component that returns `null`.

:::interview What is the difference between layout.tsx and template.tsx?
Both wrap child routes. A layout is created once and stays mounted while the user moves between its children, so its state and DOM are kept. A template gets a new instance on every navigation, so its state resets and its effects run again. Use a layout by default. Choose a template only when you really need a fresh start per page, for example an enter animation or an effect that must run on each page view.
:::

:::interview Why are params and searchParams Promises in Next.js 16?
They depend on the incoming request, so their values are not known when a page is prerendered. Making them Promises lets Next.js render everything that does not need them ahead of time and pause only at the exact place where the code awaits them. If that place is inside a Suspense boundary, the rest of the page becomes a static shell that is served at once. With synchronous access the framework could not tell which part of the page depended on the URL, so the whole page had to wait for the request.
:::

:::revise
- A folder is a URL segment; it is public only if it has `page.tsx` or `route.ts`.
- Layouts stay mounted between child pages and do not re-render on navigation.
- `params`, `searchParams`, `cookies()` and `headers()` are async in Next.js 16: always `await`.
- Nesting order in a segment: layout, then error, then loading, then page.
- `error.tsx` must be a Client Component and does not catch errors from its own layout.
- Every parallel route slot needs a `default.tsx` in Next.js 16.
:::

# React 19 Actions and the new hooks

*One idea, "an async function that changes something", and four hooks built around it.*

## Why this matters

Think about ordering food on an app. You tap "Place order". The button shows a spinner. The cart shows "1 item ordered" at once, even before the restaurant confirms. If the payment fails, the screen goes back and shows a message.

Before React 19, you wrote all of that by hand: an `isLoading` state, an `error` state, a `try/catch`, and code to roll back. React 19 calls this whole pattern an **Action** and gives you hooks that manage the pending state, the result and the optimistic update for you.

## The idea: transitions and Actions

A **transition** is a state update that React treats as not urgent. The current screen stays usable while the update is being prepared.

In React 19 you can pass an **async** function to `startTransition`. React calls such a function an **Action**. While it runs, `isPending` is `true`. When it finishes, React applies the state updates.

```tsx
'use client'

import { useState, useTransition } from 'react'
import { renameCourse } from '@/app/actions/courses'

export function RenameForm(props: { id: string; title: string }) {
  const [title, setTitle] = useState(props.title)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await renameCourse(props.id, title) // server call
      setError(result.ok ? null : result.message)
    })
  }

  return (
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={save} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```

`renameCourse` is a **Server Function**: an async function marked with `'use server'` that runs on the server. When the browser calls it, React sends a POST request behind the scenes. When a Server Function is used as an Action (in a form or a transition), it is called a **Server Action**. Chapter 8 goes deep into them. Here we focus on the hooks.

## Forms can take a function

In React 19 the `action` prop of a `<form>` accepts a function. React calls it with the form's `FormData` when the user submits. `FormData` is the standard browser object that holds the field names and values of a form.

```tsx
// A Server Component can use a Server Action directly.
import { createReview } from '@/app/actions/reviews'

export function ReviewForm({ courseId }: { courseId: string }) {
  return (
    <form action={createReview}>
      <input type="hidden" name="courseId" value={courseId} />
      <textarea name="text" required />
      <button type="submit">Post review</button>
    </form>
  )
}
```

Two nice things happen. After the action succeeds, React resets the uncontrolled fields of the form. And if the form is rendered by a Server Component, it works even before JavaScript has loaded. This is called **progressive enhancement**: the basic thing works for everyone, and JavaScript makes it nicer.

## useActionState: result and pending in one hook

`useActionState` wraps an action and remembers **what it returned last time**.

```tsx
const [state, formAction, isPending] = useActionState(action, initial)
```

- `state` is the last value the action returned (or `initial` before the first run).
- `formAction` is what you give to `<form action>`.
- `isPending` is `true` while the action runs.

The wrapped action gets a new **first** argument: the previous state. `FormData` moves to second place.

```ts
// app/actions/reviews.ts
'use server'

export type ReviewState = { ok: boolean; message: string }

export async function createReview(
  prev: ReviewState,            // added by useActionState
  formData: FormData,
): Promise<ReviewState> {
  const text = String(formData.get('text') ?? '').trim()
  if (text.length < 10) {
    return { ok: false, message: 'Please write at least 10 characters.' }
  }
  // ... check the user and save to the database (chapter 8)
  return { ok: true, message: 'Thank you for your review.' }
}
```

```tsx
// components/review-form.tsx
'use client'

import { useActionState } from 'react'
import { createReview, type ReviewState } from '@/app/actions/reviews'

const initial: ReviewState = { ok: false, message: '' }

export function ReviewForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] =
    useActionState(createReview, initial)

  return (
    <form action={formAction}>
      <input type="hidden" name="courseId" value={courseId} />
      <textarea name="text" required />
      <button disabled={isPending}>
        {isPending ? 'Posting...' : 'Post review'}
      </button>
      {state.message && <p aria-live="polite">{state.message}</p>}
    </form>
  )
}
```

:::warn Forgetting the extra first argument
The same server function has a different signature depending on how you call it. Used directly in `<form action={fn}>` it receives `(formData)`. Wrapped in `useActionState` it receives `(prevState, formData)`. If you forget `prevState`, your `formData` variable holds the old state object and `formData.get` is not a function. When you see that error, check the parameter list first.
:::

## useFormStatus: pending state for a child

A shared `<SubmitButton>` should not need props to know if its form is busy. `useFormStatus` reads the status of the **nearest parent form**.

```tsx
// components/submit-button.tsx
'use client'

import { useFormStatus } from 'react-dom'    // note: react-dom

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Please wait...' : label}
    </button>
  )
}
```

It must be called in a component rendered **inside** the `<form>`. Calling it in the same component that renders the `<form>` tag always gives `pending: false`.

## useOptimistic: show the result before the server answers

An **optimistic update** means you show the expected result at once and correct it later if the server disagrees. It makes the app feel instant on slow networks.

```tsx
const [optimistic, addOptimistic] = useOptimistic(realValue, reducer)
```

`optimistic` equals `realValue` normally. While an Action is running, it equals whatever the reducer produced. When the Action ends, React throws the optimistic value away and shows the real one again.

```tsx
// components/save-button.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleSaved } from '@/app/actions/saved'

export function SaveButton(props: { courseId: string; saved: boolean }) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(
    props.saved,                            // the real value from server
    (_current, next: boolean) => next,      // how to apply an update
  )
  const [, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved)  // 1. instant feedback
      await toggleSaved(props.courseId)     // 2. real change on server
    })                                      // 3. real prop takes over
  }

  return (
    <button onClick={onClick} aria-pressed={optimisticSaved}>
      {optimisticSaved ? 'Saved' : 'Save'}
    </button>
  )
}
```

:::example Dry run: optimistic save on a slow network
The course is not saved yet. The user clicks. The server takes 800 ms.

| Time | props.saved | optimisticSaved | Button text |
|---|---|---|---|
| 0 ms, before click | false | false | Save |
| 1 ms, after click | false | true | Saved |
| 800 ms, server done, page data refreshed | true | true | Saved |

Now the failure case: the server throws at 800 ms. The action ends, React drops the optimistic value, and `props.saved` is still `false`. The button goes back to "Save" on its own. You did not write any rollback code.
:::

:::warn Calling the optimistic setter outside an Action
`setOptimisticSaved` only works inside a transition or a form action. If you call it in a plain `onClick`, React prints a warning and the value flips back almost immediately, because there is no running Action to keep it alive. Wrap the work in `startTransition(async () => { ... })` or put it in a form `action`.
:::

## use(): read a Promise or context during render

`use` is a new API that reads a value from a **Promise** or from **context**. Unlike hooks, it may be called inside `if` blocks and loops.

Its main job in Next.js is this pattern: a Server Component **starts** a request but does not wait for it. It passes the Promise to a Client Component. The Client Component reads it with `use`. While the Promise is pending, the nearest `<Suspense>` boundary shows its fallback.

```tsx
// app/courses/[slug]/page.tsx  (Server Component)
import { Suspense } from 'react'
import { getReviews } from '@/lib/data/reviews'
import { ReviewList } from '@/components/review-list'

export default async function Page(props: PageProps<'/courses/[slug]'>) {
  const { slug } = await props.params
  const reviewsPromise = getReviews(slug)   // no await: do not block

  return (
    <Suspense fallback={<p>Loading reviews...</p>}>
      <ReviewList reviewsPromise={reviewsPromise} />
    </Suspense>
  )
}
```

```tsx
// components/review-list.tsx
'use client'

import { use } from 'react'

type Review = { id: string; text: string }

export function ReviewList(props: { reviewsPromise: Promise<Review[]> }) {
  const reviews = use(props.reviewsPromise)  // suspends until resolved
  return (
    <ul>
      {reviews.map((r) => (
        <li key={r.id}>{r.text}</li>
      ))}
    </ul>
  )
}
```

:::warn Creating the Promise inside the Client Component
`use(fetch('/api/reviews'))` written directly in a Client Component creates a **new** Promise on every render. React suspends, re-renders, gets another new Promise and never finishes. The Promise must be stable: create it in a Server Component and pass it down, or get it from a library that caches it.
:::

:::interview What is an Action in React 19, and how is it different from a normal event handler?
An Action is an async function that React runs inside a transition, either because you passed it to `startTransition` or because you gave it to a form's `action` prop. React tracks it for you: it exposes a pending state while it runs, keeps the current UI responsive, lets `useOptimistic` show a temporary value, resets the form on success and sends thrown errors to the nearest error boundary. A normal event handler is just a function call. If it is async you must manage loading, errors and rollback yourself with separate state variables.
:::

:::revise
- An Action is an async function run in a transition; React tracks its pending state for you.
- `<form action={fn}>` calls `fn(formData)` and resets the form after success.
- `useActionState` returns `[state, formAction, isPending]` and adds `prevState` as the action's first argument.
- `useFormStatus` comes from `react-dom` and must be used in a child of the form.
- `useOptimistic` shows a temporary value during an Action and returns to the real value afterwards.
- `use(promise)` suspends until the Promise resolves; create the Promise on the server, not in client render.
:::

# Data fetching, Suspense and streaming

*Fetch data in the component that needs it, start requests early, and send the page in pieces.*

## Why this matters

You order a thali at a dhaba. One kind of waiter waits until every item is ready and then brings the full plate. You sit hungry for fifteen minutes. Another waiter brings the roti and dal as soon as they are ready, and the slow special sabzi a little later. You start eating at once.

A web page has the same choice. If one slow query blocks everything, the user stares at a blank screen. With **streaming**, the server sends the ready parts first and the slow parts when they finish, all in one response.

## Fetch where you render

In a Server Component you fetch data by calling an async function and awaiting it. Do it in the component that uses the data. You do not need to fetch everything at the top and pass it down through five levels.

Keep the queries in one folder so that every page uses the same safe functions. This folder is often called the **Data Access Layer** (DAL): the only place in the app that talks to the database.

```ts
// lib/data/courses.ts
import 'server-only'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

// React cache: the same call with the same argument runs the query
// only once per request, however many components ask for it.
export const getCourse = cache(async (slug: string) => {
  return prisma.course.findUnique({
    where: { slug },
    // select = return only these columns. A safe, small object.
    select: {
      id: true, slug: true, title: true, summary: true, level: true,
    },
  })
})
```

An object that contains only the fields the UI is allowed to see is called a **DTO** (Data Transfer Object). Returning DTOs from the data layer means a page cannot leak a secret column by accident.

## Two kinds of "cache" you must not confuse

| | React `cache()` | Next.js `use cache` |
|---|---|---|
| Lives for | one request (one render pass) | many requests |
| Shared between users | no | yes |
| Purpose | avoid asking twice in the same render | avoid asking again for the next visitor |
| Needs a setting | no | `cacheComponents: true` |

`cache()` from React is **deduplication**. Deduplication means removing repeated work. If the page and its metadata function both call `getCourse('sql-101')`, the database is asked once. The next chapter is about the second kind.

For the built-in `fetch` function, two rules apply in Next.js 16:

- A `fetch` response is **not** stored across requests unless you ask for it.
- Identical `GET` `fetch` calls inside one render are deduplicated automatically.

```tsx
// Called on every request. Nothing is remembered for the next visitor.
const res = await fetch('https://api.example.com/rates')
if (!res.ok) throw new Error('Rates service failed')   // check status
const rates: { inr: number } = await res.json()
```

:::warn Forgetting that fetch does not throw on 404 or 500
`fetch` only rejects when the network itself fails. A 500 response still resolves. If you call `res.json()` without checking `res.ok`, you may render an error body as if it were data, or crash on a missing field far away from the real cause. Always check `res.ok` and decide what to do.
:::

## Sequential and parallel requests

Two awaits written one after another run **sequentially**: the second starts only when the first has finished. This is called a **waterfall**, because each request falls after the previous one.

```tsx
// Slow: total time = time(course) + time(reviews) + time(related)
const course = await getCourse(slug)
const reviews = await getReviews(slug)
const related = await getRelated(slug)
```

If the requests do not depend on each other, start them together and wait for all of them. This is **parallel** fetching.

```tsx
// Fast: total time = the slowest one
const [course, reviews, related] = await Promise.all([
  getCourse(slug),
  getReviews(slug),
  getRelated(slug),
])
```

:::example Dry run: waterfall against parallel
Assume `getCourse` takes 100 ms, `getReviews` 300 ms and `getRelated` 200 ms.

| Style | When each starts | Page data ready at |
|---|---|---|
| Sequential | 0, 100, 400 ms | 600 ms |
| `Promise.all` | 0, 0, 0 ms | 300 ms |
| Streaming with Suspense | 0, 0, 0 ms | course at 100, related at 200, reviews at 300 ms |

Parallel halves the wait. Streaming does even better for the user: the course title is visible at 100 ms instead of 300 ms.
:::

Sometimes a waterfall is correct. If the second query needs a value from the first (get the user, then get the orders of that user id), it must wait. Only remove waterfalls between **independent** requests.

`Promise.all` fails as a whole if one promise rejects. If a part is optional, use `Promise.allSettled` or catch the error for that one promise.

## Suspense: show the fast parts first

`<Suspense>` is a React component that shows a **fallback** while something inside it is not ready. Each boundary is one "piece" that can arrive separately.

```tsx
// app/courses/[slug]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCourse, getReviews } from '@/lib/data/courses'

export default async function Page(props: PageProps<'/courses/[slug]'>) {
  const { slug } = await props.params
  const course = await getCourse(slug)            // fast, needed first
  if (!course) notFound()

  return (
    <article>
      <h1>{course.title}</h1>
      <p>{course.summary}</p>

      <Suspense fallback={<p>Loading reviews...</p>}>
        <Reviews slug={slug} />                   {/* slow, streams in */}
      </Suspense>

      <Suspense fallback={<p>Loading related courses...</p>}>
        <Related slug={slug} />                   {/* independent piece */}
      </Suspense>
    </article>
  )
}

async function Reviews({ slug }: { slug: string }) {
  const reviews = await getReviews(slug)          // awaits inside
  return <ul>{reviews.map((r) => <li key={r.id}>{r.text}</li>)}</ul>
}
```

`Reviews` and `Related` are sibling boundaries, so they load in parallel and appear in whatever order they finish.

## How streaming works on the wire

Streaming does not use many requests. It is **one HTTP response** that the server keeps open and writes to in chunks.

:::flow One streamed response
Shell | h1, summary, fallbacks
Chunk 2 | Related HTML arrives
Chunk 3 | Reviews HTML arrives
Connection closes | page complete
:::

1. The server sends the HTML it has: the layout, the heading and the two fallbacks.
2. When `Related` finishes, the server writes its HTML plus a tiny script that swaps it into the place of the fallback.
3. The same happens for `Reviews`, and then the response ends.

The browser paints after step 1. The user reads the title while the rest arrives.

| | `loading.tsx` | `<Suspense>` |
|---|---|---|
| Scope | the whole page of a segment | any part you choose |
| Set up | add a file | wrap a component |
| Best for | a quick page-level skeleton | several independent slow parts |

A good fallback has the same size and shape as the real content. A fallback of this kind is called a **skeleton**. If the fallback is one line and the content is twenty lines, the page jumps when the content arrives.

:::warn Awaiting slow data above the Suspense boundary
`<Suspense>` only helps for work that happens **inside** it. If the page component itself does `await getReviews(slug)` and then passes the result into a boundary, the page has already waited. Move the `await` into the child component, or pass the un-awaited Promise and read it with `use()`.
:::

## The status code is sent early

HTTP sends the status code (200, 404, 500) in the very first bytes. Once streaming has begun, the code is already 200 and cannot be changed.

- If `notFound()` runs **before** anything suspends, the response is a real 404.
- If it runs inside a boundary **after** the shell was sent, the user sees the not-found UI, but the status stays 200.

So do the "does this thing exist?" check at the top of the page, before the first Suspense boundary, as the example above does. This matters for search engines.

Errors work in a similar way. If a streamed part throws, the nearest error boundary replaces just that part. The rest of the page stays.

## When to fetch in the browser instead

Server fetching is the default. Fetch on the client only when the data changes while the page is open and is driven by the user's own session: live search while typing, polling a job status, infinite scroll. For those, use a client data library such as SWR or TanStack Query against a Route Handler. Do not write `useEffect` plus `fetch` by hand for page data. You would have to solve loading states, errors, race conditions and caching yourself.

:::interview What is a request waterfall and how do you fix it?
A waterfall happens when requests that could run together run one after another, so the total time is the sum of all of them. In Server Components it appears when you write several awaits in a row, or when a parent awaits data before rendering a child that then starts its own fetch. To fix it, start independent requests at the same time with `Promise.all`, or split them into sibling components each inside its own Suspense boundary so they fetch in parallel and stream separately. Keep a waterfall only when a later request truly needs the result of an earlier one.
:::

:::interview How can the server send part of a page first and the rest later in a single response?
HTTP allows a response body to be written in chunks while the connection stays open. React renders the tree and, at every Suspense boundary whose content is not ready, emits the fallback and continues. That first HTML is flushed to the browser. When a suspended component finishes, React writes its HTML into the same response along with a small inline script that moves it into the position of the fallback. The browser processes chunks as they arrive, so the user sees the shell quickly and the slow parts fill in without any extra request.
:::

:::revise
- Fetch in the Server Component that needs the data; keep queries in a server-only data layer that returns small DTOs.
- React `cache()` removes duplicate calls inside one request; it is not a cross-request cache.
- `fetch` is not cached across requests by default, and it does not throw on 4xx or 5xx: check `res.ok`.
- Independent requests should run in parallel with `Promise.all` or sibling Suspense boundaries.
- Streaming is one HTTP response written in chunks; each Suspense boundary is a chunk.
- Call `notFound()` before the first boundary, because the status code is sent with the first chunk.
:::

# Caching with Cache Components

*Decide what can be reused, for how long, and how to throw it away at the right moment.*

## Why this matters

A college canteen knows that most students order samosa and tea. It keeps a tray of samosas ready in the morning. Service is instant. But a samosa from the morning should not be sold at night, and if the recipe changes, the old tray must go.

Caching is that ready tray. A **cache** stores the result of slow work so the next request does not repeat it. It brings two questions every time: **how long is the result good for?** and **how do I replace it when the data changes?** Next.js 16 gives one clear set of tools for both.

## The model in Next.js 16

Older versions of Next.js cached many things by default, and developers were often surprised by stale pages. Next.js 16 turns this around with a feature called **Cache Components**:

- By default, data fetching is **dynamic**: it runs when a request arrives.
- You **opt in** to caching by writing the `use cache` directive.

Turn the feature on once:

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

:::note
Cache Components needs the Node.js runtime. With the flag on, the old route segment settings `export const dynamic`, `export const revalidate` and `export const fetchCache` cause an error. They are replaced by `use cache`, `cacheLife` and `<Suspense>`. If the flag is off, the previous caching model still works. This chapter teaches the new model.
:::

## The use cache directive

`'use cache'` can be the first line of an async **function**, an async **component**, or a whole **file**. It tells Next.js: "the return value of this can be stored and reused".

```ts
// lib/data/catalog.ts
import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getPublishedCourses() {
  'use cache'
  cacheLife('hours')            // how long it stays good
  cacheTag('courses')           // a label to throw it away later

  return prisma.course.findMany({
    where: { published: true },
    select: { id: true, slug: true, title: true, pricePaise: true },
    orderBy: { title: 'asc' },
  })
}
```

Now a thousand visitors share one database query per hour instead of a thousand.

A component can be cached in the same way: write `'use cache'` as the first line of an async component. Then the rendered output is stored, not only the data.

## The cache key: what makes two calls "the same"

A **cache key** is the name under which a result is stored. Next.js builds it for you from:

1. the build id (so a new deployment starts with an empty cache);
2. the identity of the function;
3. **the arguments**, and any outer variables the function uses.

```ts
export async function getCourseBySlug(slug: string) {
  'use cache'
  cacheLife('days')
  cacheTag('courses', `course-${slug}`)   // more than one tag is fine
  return prisma.course.findUnique({ where: { slug } })
}

// getCourseBySlug('sql-101')   -> entry A
// getCourseBySlug('react-19')  -> entry B (different argument)
// getCourseBySlug('sql-101')   -> entry A again, no query
```

Because arguments and return values are stored, they must be serializable. Plain objects, arrays, strings, numbers and dates are fine. Class instances are not.

:::warn Returning Prisma Decimal or other class instances from a cached function
A Prisma `Decimal` column comes back as a class instance, which cannot be stored in the cache. The same is true for your own classes. Convert before returning (`price.toNumber()` or `price.toString()`), or store money as an integer number of paise, as this handbook does.
:::

## cacheLife: how long is it good for?

`cacheLife` takes the name of a **profile**. Each profile has three times.

| Time | Meaning |
|---|---|
| `stale` | how long the browser may reuse the result without asking the server |
| `revalidate` | after this, the next request still gets the old result, and a refresh starts in the background |
| `expire` | after this long without a refresh, the next request must wait for a fresh result |

| Profile | `stale` | `revalidate` | `expire` |
|---|---|---|---|
| `default` | 5 min | 15 min | never |
| `seconds` | 30 sec | 1 sec | 1 min |
| `minutes` | 5 min | 1 min | 1 hour |
| `hours` | 5 min | 1 hour | 1 day |
| `days` | 5 min | 1 day | 1 week |
| `weeks` | 5 min | 1 week | 30 days |
| `max` | 5 min | 30 days | 1 year |

If you do not call `cacheLife`, the `default` profile is used. Write it explicitly anyway, so the next reader can see the lifetime at the call site. You can also pass your own numbers in seconds: `cacheLife({ stale: 60, revalidate: 600, expire: 3600 })`.

The behaviour after `revalidate` is called **stale-while-revalidate**: serve the old (stale) answer at once and fetch a new one in the background. Nobody waits, and the next visitor gets the fresh answer.

:::example Dry run: one entry with the hours profile
`getPublishedCourses()` uses `cacheLife('hours')`: revalidate after 1 hour, expire after 1 day.

| Time | What happens | Visitor waits for the query? |
|---|---|---|
| 10:00 | first request, query runs, result stored | yes |
| 10:30 | served from cache | no |
| 11:10 | older than 1 hour: old result served, refresh starts in background | no |
| 11:11 | fresh result served | no |
| next day 15:00, no traffic in between | older than 1 day: must fetch first | yes |
:::

## Throwing the cache away on demand

Time alone is not enough. When an admin edits a course, visitors should not wait an hour. That is what tags are for. You labelled the data with `cacheTag('courses')`. Now you can invalidate everything with that label. To **invalidate** means to mark a cached result as no longer good.

| Function | Where it works | What the next request gets |
|---|---|---|
| `updateTag(tag)` | Server Actions only | waits for fresh data |
| `revalidateTag(tag, 'max')` | Server Actions and Route Handlers | old data now, fresh in background |
| `revalidatePath(path)` | Server Actions and Route Handlers | fresh data for that route |
| `refresh()` | Server Actions only | re-renders the current page; no tag is touched |

```ts
// app/actions/courses.ts
'use server'

import { updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function publishCourse(courseId: string) {
  // ... check that the caller is an admin (chapter 11)
  const course = await prisma.course.update({
    where: { id: courseId },
    data: { published: true },
    select: { slug: true },
  })

  updateTag('courses')                  // the list
  updateTag(`course-${course.slug}`)    // the detail page
}
```

Use `updateTag` when the **same user** who made the change must see it immediately. This is called **read-your-own-writes**. Use `revalidateTag(tag, 'max')` when a small delay is fine, for example when a webhook from a content system tells your app that an article changed.

:::warn Calling revalidateTag with one argument
In Next.js 16, `revalidateTag('courses')` with a single argument is deprecated and gives a TypeScript error. Pass a profile as the second argument, normally `'max'`, or use `updateTag` inside a Server Action when you need the change to show at once.
:::

## The rule that keeps users' data apart

A cached function **cannot** read `cookies()`, `headers()` or `searchParams`. This is on purpose. If it could, the result for one user might be stored and shown to another.

When cached work depends on a request value, read the value **outside** and pass it in as an argument. The argument becomes part of the cache key, so each user gets a separate entry.

```tsx
import { cookies } from 'next/headers'

// Not cached: reads the request.
async function Recommendations() {
  const level = (await cookies()).get('level')?.value ?? 'beginner'
  return <RecommendedList level={level} />
}

// Cached: 'level' is an argument, so it is part of the key.
async function RecommendedList({ level }: { level: string }) {
  'use cache'
  cacheLife('hours')
  const courses = await prisma.course.findMany({
    where: { level, published: true },
    select: { id: true, title: true },
    take: 5,
  })
  return <ul>{courses.map((c) => <li key={c.id}>{c.title}</li>)}</ul>
}
```

:::warn Caching personal data under a key that is not personal
Suppose `getMyEnrolments()` is marked `use cache` and finds the user through some global helper instead of an argument. Every user would share one entry, and user B could see user A's courses. Next.js blocks the usual way this happens by forbidding `cookies()` inside cached code. Keep to the pattern: the user id is always an explicit argument, and it comes from a verified session, never from the URL.
:::

A cached component may still accept `children` and render them without looking inside. The children are not part of the cache entry, so they can be dynamic. This lets you cache a frame around personal content.

## Where is the cache stored?

| Place | What is kept | Lifetime |
|---|---|---|
| Prerendered output | results used while building pages | until revalidated or the next deploy |
| Server memory | results cached at request time | per server instance |
| Browser memory | route data from navigation and prefetch | the `stale` time, at least 30 seconds |

Two facts follow from this table.

On **serverless** hosting, each request may reach a new instance, so the in-memory cache often starts empty. Build-time results still work. On a long-running Node.js server, memory persists between requests. If you run several servers, each has its own memory.

For a cache shared by all instances there is a variant, `'use cache: remote'`, which stores entries in an external store through a cache handler. Another variant, `'use cache: private'`, may read cookies and keeps its result only in the visitor's browser memory. You will rarely need either at the start. Learn plain `use cache` first.

:::tip
Start with no caching. Add `use cache` to a function only when (1) the data is the same for many users, and (2) you can say in one sentence how long it may be old and what event should refresh it. If you cannot say that sentence, do not cache yet.
:::

:::interview What is the difference between updateTag and revalidateTag in Next.js 16?
Both invalidate cached data that carries a tag. `updateTag` works only inside Server Actions and expires the entries immediately, so the next render waits for fresh data. It is made for read-your-own-writes: the user who submitted a form sees the new state at once. `revalidateTag` takes a second argument, usually `'max'`, and uses stale-while-revalidate: it marks the entries stale, the next request still gets the old content quickly, and fresh content is produced in the background. It also works in Route Handlers, so it suits webhooks and content that many people read where a short delay is acceptable.
:::

:::interview Why can a function marked use cache not read cookies?
A cached result is stored under a key made from the function and its arguments, and it may be reused for any later request with the same key. Cookies belong to one user and are not part of that key. If the function read them directly, the stored result could contain one user's data and be served to someone else. Next.js therefore throws an error. The correct design is to read the cookie outside the cached scope and pass the needed value in as an argument, which makes it part of the key, or to leave that part uncached and stream it inside Suspense.
:::

:::revise
- With `cacheComponents: true`, nothing is cached unless you write `'use cache'`.
- The cache key is built from the function and its arguments; arguments and return values must be serializable.
- `cacheLife` profiles set `stale`, `revalidate` and `expire`; after `revalidate` the old value is served while a new one is fetched.
- `cacheTag` labels data; `updateTag` refreshes at once (Server Actions only), `revalidateTag(tag, 'max')` refreshes in the background.
- Cached code cannot read cookies or headers: read them outside and pass values as arguments.
- In-memory cache is per server instance and is empty after every new deployment.
:::

# Partial Prerendering and the static shell

*One page, two speeds: an instant shell from the build, and personal parts streamed at request time.*

## Why this matters

A cricket stadium prints tickets in advance. The stadium name, the match and the gate map are the same on every ticket, so they are printed in bulk. Your seat number is stamped on at the counter. Printing the whole ticket at the counter for each person would create a long queue. Printing everything in advance is impossible, because the seat is not known.

Most real pages are like that ticket. A course page has a title, a description and a lesson list that are the same for everyone, and a small "You are enrolled" box that is personal. **Partial Prerendering** (PPR) prints the common part at build time and stamps the personal part per request.

## The four ways to render a page

| Strategy | HTML is made | Good for | Weak point |
|---|---|---|---|
| Static | at build time | pages equal for all users | cannot show personal data |
| Dynamic | on every request | fully personal pages | every visitor waits for the server |
| ISR | at build, refreshed in background | content that changes sometimes | still all-or-nothing per page |
| PPR | shell at build, holes at request | mixed pages | you must place boundaries well |

**ISR** means Incremental Static Regeneration: a static page that is rebuilt in the background after some time.

Before PPR, one `cookies()` call anywhere made the **whole** page dynamic. With PPR, the decision is made per component, not per page.

## The idea

When `cacheComponents: true` is set, PPR is the default behaviour. There is no extra flag. During `next build`, Next.js renders each route and sorts every component into one of two groups.

| Goes into the static shell | Becomes a hole that streams later |
|---|---|
| components that use no async or request data | components that read `cookies()` or `headers()` |
| anything inside `use cache` (with a normal lifetime) | components that read `searchParams` |
| the **fallback** of each `<Suspense>` | uncached database or `fetch` calls |
| `params` listed by `generateStaticParams` | `params` not known at build time |

The **static shell** is the prerendered HTML with the fallbacks sitting in the holes. It can be stored on a CDN. A **CDN** (Content Delivery Network) is a set of servers around the world that keep copies of files close to users.

:::flow What happens on a visit
Request | /courses/sql-101
Static shell | sent at once, from cache
Server renders holes | reads cookie, queries
Holes stream in | same response
:::

The shell and the dynamic parts arrive in **one** HTTP response. The browser shows the shell immediately, and the holes fill in as chapter 5 described.

## A page built for PPR

```tsx
// app/courses/[slug]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCourseBySlug, getTopSlugs } from '@/lib/data/catalog'
import { EnrolPanel } from './enrol-panel'

export async function generateStaticParams() {
  // Must return at least one item when Cache Components is on.
  return (await getTopSlugs()).map((slug) => ({ slug }))
}

export default async function Page(props: PageProps<'/courses/[slug]'>) {
  const { slug } = await props.params
  const course = await getCourseBySlug(slug)      // 'use cache' inside
  if (!course) notFound()

  return (
    <article>
      <h1>{course.title}</h1>                     {/* in the shell */}
      <p>{course.summary}</p>                     {/* in the shell */}

      <Suspense fallback={<p>Checking your enrolment...</p>}>
        <EnrolPanel courseId={course.id} />       {/* a hole */}
      </Suspense>
    </article>
  )
}
```

```tsx
// app/courses/[slug]/enrol-panel.tsx
import { getCurrentUser } from '@/lib/auth/dal'   // reads the cookie
import { isEnrolled } from '@/lib/data/enrolments'
import { EnrolButton } from '@/components/enrol-button'

export async function EnrolPanel({ courseId }: { courseId: string }) {
  const user = await getCurrentUser()             // request-time data
  if (!user) return <a href="/login">Log in to enrol</a>

  const enrolled = await isEnrolled(user.id, courseId)
  return enrolled
    ? <p>You are enrolled.</p>
    : <EnrolButton courseId={courseId} />
}
```

:::example Dry run: timeline of one visit
A logged-in student opens `/courses/sql-101` on a slow phone.

| Time | Browser shows | Where it came from |
|---|---|---|
| about 50 ms | header, title, summary, "Checking your enrolment..." | static shell |
| meanwhile | nothing new | server verifies session, runs one query |
| about 250 ms | "You are enrolled." replaces the fallback | streamed hole |

The exact numbers depend on your hosting and database. The point is the order: the important content does not wait for the personal part.
:::

## The error that teaches you PPR

With Cache Components on, Next.js checks every route. If a component reads uncached or request-time data and is **not** inside a Suspense boundary, the dev overlay shows a "blocking route" message, and the build can fail. The framework is telling you: "this would force the whole page to wait, and I cannot make a shell".

You have three honest fixes.

| Situation | Fix |
|---|---|
| The data is the same for everyone | put it in a `use cache` function |
| The data is personal or must be live | wrap the component in `<Suspense>` |
| The page must really wait as a whole | opt that route out on purpose |

:::warn Reading request data too high in the tree
If the root layout awaits `cookies()` to show the user's name in the header, nothing below it can be prerendered, and every page loses its shell. Push the read **down** into the smallest component that needs it (a `<UserMenu />`) and wrap only that in `<Suspense>`. The rule of thumb: the deeper the `await`, the bigger the static shell.
:::

## Values that change on every call

`Math.random()`, `Date.now()`, `new Date()` and `crypto.randomUUID()` give a different answer each time. During prerendering that is a problem: should the value be frozen at build time, or be new for every visitor? Next.js asks you to choose.

```tsx
import { connection } from 'next/server'

// Choice 1: new value per request. connection() waits for a request.
async function RequestId() {
  await connection()
  return <small>Request {crypto.randomUUID()}</small>
}

// Choice 2: one value shared by everyone until the cache refreshes.
async function BuiltAt() {
  'use cache'
  cacheLife('days')
  return <small>Updated {new Date().toDateString()}</small>
}
```

`RequestId` must sit inside `<Suspense>`, like any other request-time component.

## Pages for URLs that were not built

`generateStaticParams` lists the slugs to build in advance. For a slug that is not on the list, Next.js renders the page on the first visit and saves the result for later visitors. This is the Cache Components form of ISR. With Cache Components on, the function must return at least one value, so that the build can check the route with a real example.

One more detail: a cached result with a very short lifetime (the `seconds` profile, or an `expire` under five minutes) is not placed in the shell. It becomes a hole, because a shell that is wrong after a few seconds is not useful.

## Two side effects worth knowing

**State is kept when you go back.** With Cache Components, Next.js keeps recently visited routes mounted but hidden, using React's `<Activity>` component. When the user returns, form inputs and open sections are as they left them. Effects are cleaned up while the route is hidden and run again when it is shown.

**Bots get the whole page.** Search engine crawlers need complete HTML. Next.js detects them and waits for the full render instead of sending a shell first. So the code that builds your shell must also work at request time.

:::interview How is Partial Prerendering different from ISR?
ISR works on whole pages. A page is prerendered, served to everyone, and regenerated in the background after a time or on demand. It cannot contain per-user content, because the same HTML goes to all visitors. Partial Prerendering works inside a page. The parts that are static or cached form a shell that is prerendered and can be served from a CDN. The parts that need the request, such as cookies or live data, are left as holes behind Suspense fallbacks and are rendered at request time, then streamed in the same response. So PPR gives the fast first byte of a static page and the personal content of a dynamic page together.
:::

:::interview With Cache Components on, a page fails with a "blocking route" style error. What does it mean and how do you fix it?
It means some component reads data that is only available at request time, such as cookies, headers, search params or an uncached query, and it is not inside a Suspense boundary. Without a boundary, Next.js has no fallback to put in the static shell, so the whole route would have to wait for the request. The fix depends on the data. If it is shared by all users, cache it with `use cache` so it becomes part of the shell. If it is personal or must be fresh, wrap that component in `<Suspense>` with a skeleton, and move the read as deep in the tree as possible so the shell stays large.
:::

:::revise
- PPR is the default when `cacheComponents: true`: a static shell from the build plus holes filled at request time.
- Static and `use cache` content and Suspense fallbacks go into the shell; cookies, headers, search params and uncached data become holes.
- Shell and holes arrive in one streamed response.
- Request-time data outside a Suspense boundary is reported as an error: cache it or wrap it.
- Push `await cookies()` down to the smallest component to keep the shell big.
- Use `connection()` for per-request random values and dates, or cache them to share one value.
:::

# Server Actions, forms and validation

*Change data with a function call, and treat every call as coming from a stranger.*

## Why this matters

At a bank you fill a withdrawal slip. The slip has boxes that guide you, but the cashier does not trust the slip. The cashier checks your signature, checks your balance, and only then gives money. Someone could walk in with a hand-written slip that skips the boxes.

A form in the browser is the slip. A **Server Action** is the cashier. The form's `required` attribute and the disabled button are only guidance for honest users. The server function must check everything again, every time.

## The idea

A **Server Function** is an async function that runs on the server and can be called from the browser. You create one with the `'use server'` directive. When it is used to change data from a form or a transition, we call it a **Server Action**.

```ts
// app/actions/enrolments.ts
'use server'                       // every export here is a Server Function

export async function enrol(courseId: string) {
  // runs on the server
}
```

When the browser "calls" `enrol`, React sends an HTTP **POST** request to the current page URL with an id for the action and the arguments. The server runs the function and sends back the return value together with any refreshed UI, in one round trip.

:::flow One Server Action call
Form submit | browser
POST request | action id + FormData
Server Action | check, save, invalidate
Response | result + fresh UI
:::

:::warn Treating a Server Action like a private function
Every exported Server Function is a **public HTTP endpoint**. Anyone can send a POST to it with any arguments, without using your form or your UI. Hiding the button for non-admins protects nothing. Check who the caller is and what they may do **inside every action**. Do not rely on `proxy.ts` or on a layout for this.
:::

## The five steps of a safe action

Write every action in the same order. After a while it becomes a habit.

| Step | Question | If it fails |
|---|---|---|
| 1. Authenticate | Who is calling? | redirect to login or return an error |
| 2. Validate | Is the input the right shape? | return field errors |
| 3. Authorize | May this user do this to this record? | return "not allowed" |
| 4. Mutate | Do the database change | catch known failures |
| 5. Invalidate and respond | Refresh caches, return or redirect | |

**Authentication** asks "who are you?". **Authorization** asks "are you allowed to do this?". They are different checks.

## Validation with a schema

A **schema** is a description of the shape that data must have. A schema library checks unknown input against it and gives you typed, clean data or a list of problems. This handbook uses **Zod**, a popular TypeScript schema library.

```ts
// lib/validation/review.ts
import { z } from 'zod'

export const reviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),  // "4" -> 4
  text: z.string().trim().min(10, 'Write at least 10 characters.')
    .max(1000, 'Keep it under 1000 characters.'),
})

export type ReviewInput = z.infer<typeof reviewSchema>
```

`FormData` values are always strings (or files). `z.coerce.number()` converts `"4"` to `4` before checking it. `z.infer` gives you the TypeScript type for free, so the schema and the type cannot drift apart.

Keep the schema in its own file so that the client can import it too, if you want to show errors while typing. Client-side checks are for comfort. The server check is for safety.

## A complete action

```ts
// app/actions/reviews.ts
'use server'

import { updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/dal'
import { reviewSchema } from '@/lib/validation/review'

type FieldErrors = Record<string, string[] | undefined>
export type ReviewState = {
  ok: boolean; message: string
  errors?: FieldErrors; values?: { text: string }  // refill on error
}

export async function createReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // 1. Authenticate
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: 'Please log in first.' }

  // 2. Validate
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false, message: 'Please fix the errors below.',
      errors: parsed.error.flatten().fieldErrors,
      values: { text: String(formData.get('text') ?? '') },
    }
  }
  const { courseId, rating, text } = parsed.data
```

`safeParse` never throws. It returns `{ success: true, data }` or `{ success: false, error }`. `flatten().fieldErrors` turns the error into an object such as `{ text: ['Write at least 10 characters.'] }`. (Zod 4 also offers `z.flattenError(error)` for the same job.)

```ts
  // 3. Authorize: only enrolled students may review
  const enrolment = await prisma.enrolment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  })
  if (!enrolment) {
    return { ok: false, message: 'Only enrolled students can review.' }
  }

  // 4. Mutate. userId comes from the session, never from the form.
  await prisma.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, rating, text },
    update: { rating, text },
  })

  // 5. Invalidate and respond
  updateTag(`reviews-${courseId}`)
  return { ok: true, message: 'Thank you for your review.' }
}
```

`upsert` means "update the row if it exists, otherwise create it". It makes the action safe to run twice: a double click cannot create two reviews. An operation that gives the same result when repeated is called **idempotent**.

## The form

The form is the `ReviewForm` from chapter 4, with a rating field. Two small additions use the richer state: the textarea is refilled after a failed submit, and the first error of the field is shown below it.

```tsx
// components/review-form.tsx  (inside the <form>)
<label>
  Your review
  <textarea name="text" defaultValue={state.values?.text} />
</label>
{state.errors?.text && (
  <p role="alert">{state.errors.text[0]}</p>
)}
<button disabled={isPending}>
  {isPending ? 'Posting...' : 'Post review'}
</button>
<p aria-live="polite">{state.message}</p>
```

:::example Dry run: a bad submit and a good submit
The student types "Nice" and rating 4, then presses the button.

| Step | Server | Form shows |
|---|---|---|
| 1 | user found in session | "Posting..." |
| 2 | `text` has 4 characters, schema fails | |
| return | `ok: false`, `errors.text`, `values.text = 'Nice'` | error under the textarea, text still "Nice" |

The student now writes "Nice course, clear examples" and submits again. Validation passes, the enrolment exists, the review is saved, the tag is updated, and the form shows "Thank you for your review." The review list on the page refreshes in the same response.
:::

## Expected errors and unexpected errors

| Kind | Example | What to do |
|---|---|---|
| Expected | invalid input, duplicate email, not enrolled | **return** a state object and show it in the form |
| Unexpected | database is down, a bug | let it **throw**; `error.tsx` shows a fallback |

Do not wrap the whole action in a `try/catch` that returns "Something went wrong". That hides bugs. Catch only the specific failures you can explain to the user.

:::warn Calling redirect inside try/catch
`redirect()` works by throwing a special error that Next.js catches higher up. If you call it inside a `try` block, your own `catch` swallows it and the redirect never happens. Do the database work inside `try/catch`, and call `redirect()` after the block.
:::

## Passing extra arguments

Sometimes the action needs a value that is not typed by the user, such as the id of the row being edited. Send it as a hidden input, or fix it as the first argument with `renameCourse.bind(null, course.id)`. In both cases the value comes from the browser, so the action must still check that the current user may touch that id. Never trust an id just because your own page rendered it.

## What Next.js does for you, and what it does not

| Built-in protection | Still your job |
|---|---|
| Actions accept only POST | check the user in every action |
| The `Origin` header must match the host | validate every argument |
| Action ids are hard to guess and change between builds | authorize access to each record |
| Unused actions are removed from the client bundle | rate limit costly actions |
| Request body limit of 1 MB by default | return only data the user may see |

Whatever an action **returns** is sent to the browser. Return a small state object, not the database row.

For work that should not delay the response, such as writing an audit log, wrap it in `after(() => { ... })` from `next/server`. The callback runs once the response has been sent.

:::interview Why must you validate on the server if the form already validates in the browser?
Browser validation runs on a machine the user controls. Anyone can remove a `required` attribute in dev tools, change a hidden input, or skip the page and send the POST request directly with a script. A Server Action is a public endpoint, so its arguments are untrusted input in the same way as the body of any API request. Client-side validation only improves the experience for honest users by giving quick feedback. The server must check shape with a schema, identity from the session, and permission for the specific record before it writes anything.
:::

:::interview How does the UI update after a Server Action without a second request?
When the action runs, it can invalidate cached data with `updateTag` or `revalidatePath`, or call `refresh()`. Next.js then re-renders the affected Server Components on the server during the same request and includes the new RSC Payload in the response to the POST, along with the action's return value. React applies both in one transition on the client. That is why the list on the page shows the new item right after the form state changes, with a single round trip and no manual refetch code.
:::

:::revise
- A Server Function is created with `'use server'`; every exported one is a public POST endpoint.
- Follow five steps: authenticate, validate, authorize, mutate, invalidate and respond.
- Validate with a schema (`safeParse`) and return field errors as state; never trust ids or user ids from the form.
- Return expected errors, throw unexpected ones; call `redirect()` outside `try/catch`.
- Make actions idempotent where possible so double submits are harmless.
- The response of an action carries both its return value and the refreshed UI.
:::

# Route Handlers and proxy.ts

*HTTP endpoints for other programs, and one file that runs before every request.*

## Why this matters

A shop has a front door for customers and a back door for suppliers. Suppliers do not browse the shelves. They hand over boxes and get a receipt. At the gate stands a guard who checks every vehicle quickly and sends wrong ones away.

Your pages and Server Actions are the front door. **Route Handlers** are the back door: plain HTTP endpoints for mobile apps, webhooks and other services. `proxy.ts` is the guard at the gate.

## Which tool for which caller

| Caller | Wants to | Use |
|---|---|---|
| Your own page | read data | Server Component |
| Your own form or button | change data | Server Action |
| Mobile app, script, partner | read or change data | Route Handler |
| Another service calling you | notify you (webhook) | Route Handler |
| A browser chat UI | receive a long stream | Route Handler |

A **webhook** is an HTTP request that another service sends to you when something happens there, for example "payment succeeded".

## A Route Handler

Create a `route.ts` file and export functions named after HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. They receive a standard web `Request` and return a standard `Response`. A folder cannot have both `page.tsx` and `route.ts`.

```ts
// app/api/courses/[id]/route.ts
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/courses/[id]'>,
) {
  const { id } = await ctx.params              // async, like in pages

  const course = await prisma.course.findFirst({
    where: { id, published: true },
    select: { id: true, slug: true, title: true, pricePaise: true },
  })

  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 })
  }
  return Response.json(course)                 // status 200 by default
}
```

Everything from the previous chapter applies here too. A Route Handler is public. Authenticate, validate the body with a schema, authorize, and return the right status code.

With Cache Components on, a `GET` handler follows the same rules as a page. It runs at request time when it reads the request or uncached data. To cache its data, put `'use cache'` in a helper function and call the helper. The directive cannot be written directly in the handler body.

## A webhook with a signature check

A webhook URL is public, so anyone could call it. The sender proves who it is with a **signature**: a hash of the body made with a secret that only the two of you know. You compute the same hash and compare.

```ts
// app/api/webhooks/cms/route.ts
import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const body = await request.text()            // raw text, for hashing
  const given = request.headers.get('x-signature') ?? ''
  const expected = createHmac('sha256', process.env.CMS_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: 'Bad signature' }, { status: 401 })
  }

  const event = JSON.parse(body) as { type: string; slug?: string }
  if (event.type === 'course.updated' && event.slug) {
    revalidateTag(`course-${event.slug}`, 'max')   // background refresh
    revalidateTag('courses', 'max')
  }
  return Response.json({ received: true })
}
```

`timingSafeEqual` compares two values in constant time. A normal `===` stops at the first different character, and an attacker can measure that tiny time difference to guess a secret piece by piece. The header name and the exact signing format depend on the service that sends the webhook, so read its documentation.

:::warn Using a Route Handler to feed your own Server Components
Beginners often write `await fetch('http://localhost:3000/api/courses')` inside a page. That is a network trip from your server to itself. It is slower, it fails during the build when no server is running, and it loses type safety. Call the data function directly in the Server Component. Keep Route Handlers for callers that are outside your React tree.
:::

## proxy.ts

`proxy.ts` sits in the project root (or in `src/`). It exports one function that runs **before** a matching request reaches a page, an action or a Route Handler. It can redirect, rewrite the URL, or add headers.

In Next.js 16 this file replaces `middleware.ts`. The old name is deprecated, and the exported function is now called `proxy`. The new name says what it is: a thin layer at the network edge of your app. It runs on the Node.js runtime.

```ts
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/settings']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsLogin = PROTECTED.some((p) => pathname.startsWith(p))
  const hasCookie = request.cookies.has('session')   // cheap check only

  if (needsLogin && !hasCookie) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)           // come back later
    return NextResponse.redirect(url)
  }
  return NextResponse.next()                         // continue
}

export const config = {
  // Skip API routes, build files, images and the icon.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

Without a `matcher`, the proxy runs for **every** request, including CSS and image files. A bad redirect there can break the styling of the whole site, so always exclude static files.

:::flow Order of work for one request
proxy.ts | redirect, rewrite, headers
Route match | page or route.ts
Render or handler | your code runs
Response | sent to browser
:::

:::warn Making proxy.ts your only security check
The proxy check above only asks "is there a cookie?". It does not prove the cookie is valid, and it does not know which record the user wants. Server Actions are POST requests to a page URL, so a matcher that skips a path also skips the actions on it. Treat the proxy as a fast first filter for a nicer user experience. The real check lives next to the data, in the data layer and in every action.
:::

Keep the proxy light. It runs on every matched navigation and prefetch, so a database query there slows the whole site.

:::example Dry run: a logged-out visitor opens /dashboard
1. The matcher accepts `/dashboard`, so `proxy` runs. There is no `session` cookie.
2. The proxy answers with a redirect to `/login?next=/dashboard`. No page code ran.
3. After login, the action reads `next` and redirects back, but only if it is a path inside the site. Chapter 13 shows that check and why it matters.
:::

:::interview When would you choose a Route Handler over a Server Action?
A Server Action is tied to my React UI: it is called from a form or a transition, it can only be a POST, and its response carries refreshed UI. I choose it for mutations made by my own pages. A Route Handler is a normal HTTP endpoint with a stable URL, any method, and full control over status codes and headers. I choose it when the caller is not my React tree: a mobile app, a third-party webhook, a cron job, a file download, or a client that needs a long streaming response such as an AI chat. Both should call the same data-layer functions so the rules are written once.
:::

:::interview What changed from middleware to proxy in Next.js 16?
The file convention was renamed from `middleware.ts` to `proxy.ts` and the exported function from `middleware` to `proxy`. The old name is deprecated. The proxy runs on the Node.js runtime, and the runtime cannot be configured in that file. The purpose is the same as before: run a small piece of code before a request completes to redirect, rewrite or set headers. The rename makes it clear that this is a network-level layer in front of the app, not a place for business logic or the main authorization check.
:::

:::revise
- Route Handlers are `route.ts` files that export `GET`, `POST` and other method functions using web `Request` and `Response`.
- Use them for callers outside your React tree: mobile apps, webhooks, streams, downloads.
- `ctx.params` is a Promise in Route Handlers too; type it with `RouteContext`.
- Verify webhook signatures with an HMAC and `timingSafeEqual`.
- `proxy.ts` replaces `middleware.ts`, runs on Node.js before matched requests, and needs a `matcher`.
- The proxy is an optimistic filter; real authorization stays next to the data.
:::

# Database access with Prisma and PostgreSQL

*A typed way to talk to a relational database, and the habits that keep it fast and safe.*

## Why this matters

A library keeps a register: one page for members, one for books, one for "who borrowed what". The librarian does not copy a member's address onto every borrowing line. The line just stores the member number. If the address changes, it is corrected in one place.

A **relational database** such as PostgreSQL works like that register. Data lives in tables, and tables point to each other with ids. **Prisma** is an **ORM** (Object-Relational Mapper): a library that lets you read and write those tables with typed TypeScript objects instead of hand-written SQL strings.

## The schema

You describe your tables in one file. A **model** is one table.

```prisma
// prisma/schema.prisma
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  name         String
  passwordHash String
  role         Role        @default(STUDENT)
  enrolments   Enrolment[]
}

enum Role {
  STUDENT
  ADMIN
}

model Course {
  id         String      @id @default(cuid())
  slug       String      @unique
  title      String
  level      String
  pricePaise Int
  seatsLeft  Int
  published  Boolean     @default(false)
  enrolments Enrolment[]

  @@index([published, title])
}
```

```prisma
model Enrolment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])   // one enrolment per user per course
  @@index([courseId])
}
```

| Piece | Meaning |
|---|---|
| `@id` | the primary key: the unique id of a row |
| `@unique` | no two rows may share this value |
| `@relation` | `userId` is a foreign key that points to `User.id` |
| `@@unique([a, b])` | the **pair** must be unique |
| `@@index([...])` | a lookup structure that makes filtering on these columns fast |

A **migration** is a file of SQL that changes the database from one version of the schema to the next. Prisma writes it for you.

```bash
npx prisma migrate dev --name add-enrolments   # local: create and apply
npx prisma generate                            # rebuild the typed client
npx prisma migrate deploy                      # production: apply only
```

## One client for the whole app

In development, Next.js reloads your modules on every save. If each reload created a new database client, you would soon run out of connections. Store the client on `globalThis`, which survives reloads.

```ts
// lib/prisma.ts
import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma     // reuse after a hot reload
}
```

:::note
This is the Prisma 7 style: the client is generated into your project and connects through a driver adapter. In Prisma 6 and older you import `PrismaClient` from `@prisma/client`, write `new PrismaClient()` and put the connection URL in the schema file. The queries in this chapter are the same in both. Follow the setup page of the version you install.
:::

## Reading data

```ts
// Only the columns you name are fetched and returned.
const courses = await prisma.course.findMany({
  where: { published: true, level: 'beginner' },
  select: { id: true, slug: true, title: true },
  orderBy: { title: 'asc' },
  take: 20,                                  // limit
})

// Related rows and counts in the same query plan.
const course = await prisma.course.findUnique({
  where: { slug: 'sql-101' },
  select: {
    title: true,
    _count: { select: { enrolments: true } },   // number of students
  },
})
```

Always use `select`. Without it Prisma returns every column, including ones like `passwordHash` that should never leave the data layer.

## The N+1 problem

:::example Dry run: counting students for 50 courses
```ts
// Slow: 1 query for the list + 1 query per course
const courses = await prisma.course.findMany({ select: { id: true } })
for (const c of courses) {
  await prisma.enrolment.count({ where: { courseId: c.id } })
}
```

| Version | Queries for 50 courses |
|---|---|
| loop with one `count` per course | 1 + 50 = 51 |
| one `findMany` with `_count` in `select` | 1 or 2 |

The loop is called the **N+1 problem**: one query for the list, then N more for the items. Each query is a network round trip to the database, so the page gets slower as the list grows. Ask for related data in the same call instead.
:::

## Pagination

Do not load ten thousand rows to show ten. Always pass `take`. For long lists use **cursor pagination**: remember the id of the last row shown and ask for the next rows after it with `cursor: { id }` and `skip: 1`. Unlike `skip: 5000`, this stays fast on deep pages, because the database jumps straight to the cursor through the index.

## Transactions

A **transaction** is a group of changes that succeed together or fail together. Enrolling a student must take one seat **and** create the enrolment. If only one of them happens, the data is wrong.

```ts
export async function enrolUser(userId: string, courseId: string) {
  return prisma.$transaction(async (tx) => {
    // Take a seat only if one is left. The check and the change
    // are one statement, so two users cannot take the last seat.
    const taken = await tx.course.updateMany({
      where: { id: courseId, published: true, seatsLeft: { gt: 0 } },
      data: { seatsLeft: { decrement: 1 } },
    })
    if (taken.count === 0) throw new Error('COURSE_FULL')

    // If this fails (already enrolled), the seat is given back,
    // because the whole transaction is rolled back.
    return tx.enrolment.create({ data: { userId, courseId } })
  })
}
```

:::warn Read, then decide, then write
A common bug is: read `seatsLeft`, check `if (seatsLeft > 0)` in JavaScript, then write `seatsLeft - 1`. Two requests can both read `1` at the same moment and both succeed, leaving `-1`. This is a **race condition**. Put the condition in the `where` of the update, as above, so the database checks and changes in one step.
:::

## Raw SQL, safely

Sometimes you need SQL that the query builder cannot express. Use the tagged template form. Prisma sends the values as **parameters**, separate from the SQL text, so user input can never change the query.

```ts
const term = 'react'
// Safe: ${...} becomes a parameter ($1), not part of the SQL string.
const rows = await prisma.$queryRaw<{ id: string; title: string }[]>`
  SELECT id, title FROM "Course"
  WHERE title ILIKE ${'%' + term + '%'}
`
```

Never use `$queryRawUnsafe` with text that contains user input. That is how **SQL injection** happens: the attacker's text is run as SQL.

## Connections on serverless hosts

PostgreSQL allows a limited number of open connections. A long-running server keeps a small **pool** of connections and reuses them. On serverless hosting, many short-lived instances may each open their own, and the limit is reached quickly. The fix is a **connection pooler** in front of the database (many hosted Postgres services include one, and PgBouncer is the classic tool). Use the pooled URL for the app and the direct URL for migrations.

:::interview Why should the seat check and the seat update be one database statement?
If the application reads the number of seats, decides in code and then writes, another request can run between the read and the write. Both requests see one seat left and both write, so the course is overbooked. Putting the condition into the `WHERE` clause of the update makes the database check and modify the row atomically. The second request then matches zero rows and the code can report "course full". Wrapping it with the enrolment insert in a transaction makes sure the seat is returned if the insert fails.
:::

:::revise
- Describe tables as models in `schema.prisma`; create changes with `prisma migrate dev`, apply in production with `prisma migrate deploy`.
- Keep one `PrismaClient` on `globalThis` in development and mark the file `server-only`.
- Always `select` only the columns you need.
- Avoid N+1: load related data and counts in the same query, never in a loop.
- Use transactions for changes that belong together, and put conditions in the `where` of the update to avoid race conditions.
- Use tagged-template `$queryRaw` for raw SQL; never build SQL from user text.
:::

# Authentication with cookies and sessions

*Prove who the user is once, remember it safely, and check it again wherever data is touched.*

## Why this matters

At a concert you show your ticket and ID at the gate once. You get a wristband. Inside, staff look only at the wristband. If you misbehave, security can cut the band off, and you are out.

Login is the gate check. The **session** is the wristband: a small proof that travels with every request. Good auth is about three things: checking the ID properly, making a band that cannot be copied, and looking at it at every door that matters.

## Two words, two jobs

| Word | Question | Example |
|---|---|---|
| Authentication | Who are you? | email and password are correct |
| Authorization | What may you do? | only an admin can publish a course |

## Where does the session live?

| | Stateless session | Database session |
|---|---|---|
| Cookie contains | signed or encrypted data (often a JWT) | a random id only |
| Server lookup per request | none | one query |
| Log out everywhere / ban a user | hard, the token stays valid until it expires | easy, delete the row |
| Good for | simple apps, read-heavy checks | apps that need control over sessions |

A **JWT** (JSON Web Token) is a signed piece of JSON. The server can verify the signature without a database. This handbook builds a **database session**, because it is easy to reason about and easy to revoke. To **revoke** means to cancel something before it expires.

:::tip
For real products, consider a maintained auth library instead of writing everything yourself. It will handle password reset, email verification and social login. Build it by hand once, as below, so you understand what the library does.
:::

## Passwords

Never store a password. Store a **hash**: the output of a one-way function. A password hash function is slow on purpose, and uses a **salt** (random text added to each password) so that two users with the same password get different hashes. Node.js includes `scrypt`, a function made for this.

```ts
// lib/auth/password.ts
import 'server-only'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${key.toString('hex')}`       // store both parts
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(':')
  const known = Buffer.from(hex, 'hex')
  const key = (await scryptAsync(password, salt, 64)) as Buffer
  return key.length === known.length && timingSafeEqual(key, known)
}
```

## Creating a session

```ts
// lib/auth/session.ts
import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')  // unguessable
  const expiresAt = new Date(Date.now() + WEEK_MS)

  // Store only the hash. A leaked database cannot be used to log in.
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  })

  const store = await cookies()
  store.set('session', token, {
    httpOnly: true,                 // JavaScript cannot read it
    secure: process.env.NODE_ENV === 'production',   // HTTPS only
    sameSite: 'lax',                // not sent on cross-site POSTs
    path: '/',
    expires: expiresAt,
  })
}
```

The `Session` model has four fields: `id`, `tokenHash` (unique), `userId` and `expiresAt`.

| Cookie option | Protects against |
|---|---|
| `httpOnly` | a script injected into the page stealing the session (XSS) |
| `secure` | the cookie travelling over plain HTTP |
| `sameSite: 'lax'` | other sites making logged-in POST requests for the user (CSRF) |
| `expires` | a stolen cookie working forever |

:::warn Keeping the session token in localStorage
Anything in `localStorage` can be read by any JavaScript running on your page, including a script injected through one XSS bug or a compromised package. An `httpOnly` cookie cannot be read by JavaScript at all. The browser attaches it to requests by itself. For browser apps, keep session tokens in `httpOnly`, `secure`, `sameSite` cookies.
:::

Cookies can be set only in a Server Action or a Route Handler, not while a Server Component is rendering. Rendering may already have started streaming, and headers cannot be changed after that.

## Login and logout

```ts
// app/actions/auth.ts
'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { loginSchema } from '@/lib/validation/auth'

export async function login(_prev: { message: string }, fd: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { message: 'Enter your email and password.' }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, passwordHash: true },
  })
  const ok = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false
  // Same message for "no such user" and "wrong password".
  if (!user || !ok) return { message: 'Wrong email or password.' }

  await createSession(user.id)
  redirect('/dashboard')
}
```

A `logout` action does the reverse: it deletes the session row whose `tokenHash` matches the cookie, deletes the cookie with `store.delete('session')`, and redirects to `/login`.

The login error message does not say which part was wrong. If it said "no account with this email", an attacker could test which emails are registered. Also add rate limiting to login (chapter 13), or a script can try thousands of passwords.

## The Data Access Layer checks the session

Put the session check in one function and call it everywhere. `cache()` makes sure the database is asked once per request, even if ten components call it.

```ts
// lib/auth/dal.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hashToken } from './session'

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get('session')?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: { select: { id: true, name: true, role: true } },
    },
  })
  if (!session || session.expiresAt < new Date()) return null
  return session.user                 // a small, safe object
})
```

Two small helpers sit in the same file. Pages and actions call these, so nobody repeats the check by hand.

```ts
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'ADMIN') redirect('/')
  return user
}
```

## Where to check

:::flow Layers of an auth check
proxy.ts | cookie present? fast redirect
Page | requireUser() before render
Data function | filter by user.id
Server Action | requireUser() + ownership
:::

| Layer | Checks | Enough alone? |
|---|---|---|
| `proxy.ts` | a cookie exists | no, it is only a quick filter |
| Layout | nothing security-related | no, layouts do not re-run on navigation |
| Page or component | `requireUser()` | protects what is rendered |
| Data function | rows belong to `user.id` | the real protection for reads |
| Server Action / Route Handler | user and ownership | the real protection for writes |

:::example Dry run: someone changes an id in the URL
Riya is logged in and opens `/orders/101`, her own order. She changes the URL to `/orders/102`, which belongs to Aman.

| Code | Result |
|---|---|
| `findUnique({ where: { id } })` | Aman's order is shown. This bug is called **IDOR**. |
| `findFirst({ where: { id, userId: user.id } })` | no row found, `notFound()` shows a 404 |

**IDOR** means Insecure Direct Object Reference: the app trusts an id from the user without checking who owns the record. Put the owner in the `where` clause.
:::

## Sessions and Partial Prerendering

Reading the session uses `cookies()`, so it is request-time data. With Cache Components on, a component that calls `getCurrentUser()` must be inside `<Suspense>`, and a `use cache` function cannot call it. The pattern from chapter 7 applies: the shell is public and cached, and the personal part is a small streamed hole that receives `user.id` as an argument when it needs cached data.

:::interview Compare cookie sessions stored in a database with stateless JWT sessions.
With a database session the cookie holds only a random id. Each request looks the session up, so the server can see all active sessions and end any of them at once, which makes logout, bans and "log out of all devices" simple. The cost is one lookup per request. With a stateless JWT the cookie holds signed data that the server verifies without storage. That is fast and easy to scale, but a token stays valid until it expires, so revoking it early needs extra machinery such as a deny list or very short lifetimes with refresh tokens. In both cases the cookie should be `httpOnly`, `secure` and `sameSite`, and the payload should contain only an id and a role, never personal data.
:::

:::interview Why is an auth check in a layout not enough?
Layouts are kept mounted during client navigation and are not re-rendered when the user moves between child pages, so a check there does not run on every page view. Also, a layout only decides what is rendered. It does nothing for Server Actions and Route Handlers, which are reachable by direct POST requests. The reliable design is to verify the session in a data access layer that every page, data function and action calls, and to authorize each record by its owner. A layout or the proxy can still do a quick redirect for better user experience.
:::

:::revise
- Authentication proves identity; authorization decides permission. Check both on the server.
- Hash passwords with a slow salted function such as scrypt; never store or log the password.
- Keep the session token in an `httpOnly`, `secure`, `sameSite` cookie; store only its hash in the database.
- One cached `getCurrentUser()` in a server-only data layer is the single source of truth.
- Filter every query by the owner (`userId: user.id`) to prevent IDOR.
- The proxy and layouts are convenience checks; pages, data functions and actions hold the real ones.
:::

# Streaming AI responses with the Vercel AI SDK

*Send a model's answer to the screen word by word, without exposing your key or your wallet.*

## Why this matters

Ask a teacher a question. A good teacher starts speaking at once and builds the answer sentence by sentence. Imagine a teacher who stays silent for twenty seconds and then hands you a full page. The answer is the same, but the wait feels broken.

A large language model (**LLM**) produces text one small piece at a time. Each piece is called a **token**, roughly a short word or part of a word. A long answer can take many seconds. If you wait for the full answer, the user sees a frozen screen. If you **stream** it, the first words appear almost at once.

## The idea

The **Vercel AI SDK** is an open source TypeScript library with two parts you will use:

- `ai` (server side): one API, `streamText`, that talks to many model providers;
- `@ai-sdk/react` (client side): the `useChat` hook that sends messages and reads the stream.

Each provider has a small package, for example `@ai-sdk/openai`, `@ai-sdk/anthropic` or `@ai-sdk/google`. You can change the provider without rewriting your UI.

```bash
npm install ai @ai-sdk/react @ai-sdk/openai zod
```

```bash
# .env.local  -> server only, no NEXT_PUBLIC_ prefix
OPENAI_API_KEY="..."
AI_MODEL="gpt-4o-mini"
```

:::flow Path of one chat message
Chat UI | useChat sends messages
Route Handler | auth, limits, streamText
Model provider | returns tokens
Stream | text appears in the UI
:::

Why a Route Handler and not a Server Action? A chat answer is a long streaming HTTP response that a client hook reads piece by piece. A Route Handler gives you a stable URL and full control over the response, which is what `useChat` expects.

:::note
The code below follows the AI SDK version 5 style of API (`UIMessage`, `sendMessage`, `message.parts`). Version 4 used different names (`handleSubmit`, `message.content`). Model names also change often. Check the documentation of the version and provider you install.
:::

## The server: a streaming Route Handler

```ts
// app/api/chat/route.ts
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getCurrentUser } from '@/lib/auth/dal'

export const maxDuration = 30        // let the stream run up to 30 s

const SYSTEM = [
  'You are the LearnHub study helper.',
  'Answer only questions about programming and the courses.',
  'Keep answers short and use simple words.',
].join(' ')

export async function POST(request: Request) {
  const user = await getCurrentUser()                   // 1. who?
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages }: { messages: UIMessage[] } = await request.json()
  if (!Array.isArray(messages) || messages.length > 40) {
    return new Response('Bad request', { status: 400 }) // 2. limits
  }

  const result = streamText({
    model: openai(process.env.AI_MODEL ?? 'gpt-4o-mini'),
    system: SYSTEM,                                     // stays on server
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 800,                               // cap the cost
  })

  return result.toUIMessageStreamResponse()             // 3. stream
}
```

`streamText` returns immediately. It does not wait for the model. `toUIMessageStreamResponse()` turns the stream into an HTTP response that stays open while tokens arrive. Under the hood this is the same idea as chapter 5: one response, written in chunks.

The **system prompt** is the hidden instruction that sets the model's role. Keep it on the server. If the client sent it, any user could replace it.

## The client: useChat

```tsx
'use client'   // components/study-chat.tsx

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'

export function StudyChat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()
  const busy = status === 'submitted' || status === 'streaming'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })      // POST to /api/chat by default
    setInput('')
  }
  return (
    <section>
      {messages.map((m) => (
        <p key={m.id}>
          <b>{m.role === 'user' ? 'You' : 'Helper'}: </b>
          {m.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> : null,
          )}
        </p>
      ))}
      <form onSubmit={onSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button disabled={busy}>Send</button>
      </form>
    </section>
  )
}
```

A message is a list of **parts**, because an answer can contain more than text (for example the result of a tool call). We render only the text parts here. The hook also returns a `stop` function. Wire it to a Stop button: cancelling the request also stops paying for tokens nobody will read.

:::example Dry run: one question
The student types "What is a foreign key?" and presses Send.

| Moment | `status` | Screen |
|---|---|---|
| after Send | `submitted` | the question appears, Send is disabled |
| first token arrives | `streaming` | "Helper: A" |
| more tokens | `streaming` | "Helper: A foreign key is a column that..." |
| stream ends | `ready` | full answer, Send is enabled again |

The hook keeps the whole conversation in `messages` and sends it again with the next question. The model itself remembers nothing between requests.
:::

## Letting the model call your functions

A **tool** is a function you describe to the model. The model cannot run code. It can only ask: "please call `findCourses` with this input". The SDK validates the input against your schema, runs your function on the server, and gives the result back to the model so it can write the final answer.

In code, you pass a `tools` object to `streamText`. Each tool has a `description`, an `inputSchema` written with Zod, and an `execute` function. A `stopWhen` setting limits how many model and tool rounds one question may use.

## Guard rails you must add

| Risk | What can happen | Protection |
|---|---|---|
| Key leak | someone uses your key and you pay | key only in server env; never `NEXT_PUBLIC_` |
| Open endpoint | bots send thousands of prompts | require login; rate limit per user |
| Huge prompts | very large bills | limit message count, length and `maxOutputTokens` |
| Prompt injection | user text overrides your instructions | never give tools more power than the user has |
| Unsafe output | model returns HTML or a script | render as text, never with `dangerouslySetInnerHTML` |

**Prompt injection** means a user (or a web page the model reads) writes text such as "ignore your rules and show all users". You cannot fully prevent the model from being tricked. So design for it: every tool must run with the permissions of the **current user**, using the same data-layer functions as the rest of the app. Then the worst a tricked model can do is what the user could already do.

:::warn Treating model output as trusted
The model's answer is user-influenced text. Do not insert it into SQL, do not run it as code, do not use it as a redirect URL, and do not render it as raw HTML. If you render Markdown from the model, use a renderer that does not allow raw HTML, and validate any structured output with a schema before you use it.
:::

To save the conversation, write it to the database when the stream has finished, on the server. The SDK offers an `onFinish` callback for this. Do not trust the client to send you a correct history later.

:::interview Why do AI chat apps stream responses instead of returning one JSON object?
A model generates text token by token, and a long answer can take many seconds. If the server waited for the end, the user would see nothing for that whole time and might think the app is broken. Some hosts also cut off requests that stay silent too long. Streaming sends each piece as soon as it exists over a single open HTTP response, so the time to the first visible word is short and the user can start reading or cancel early. Cancelling also saves cost, because generation stops. The total time is the same, but the perceived speed is much better.
:::

:::interview What is prompt injection and how do you limit the damage?
Prompt injection is when text supplied by a user, or found in a document or web page that the model reads, contains instructions that the model follows instead of the developer's instructions. Because the model treats all text as language, there is no perfect filter. The practical defence is to limit what the model can do: keep secrets out of the prompt, give tools the smallest possible powers, run every tool with the current user's own permissions through the normal data layer, validate tool inputs with schemas, ask for confirmation before destructive actions, and treat the output as untrusted text when rendering or storing it.
:::

:::revise
- An LLM produces tokens one by one; streaming shows them as they arrive over one HTTP response.
- Server: a Route Handler calls `streamText` and returns `toUIMessageStreamResponse()`.
- Client: `useChat` keeps `messages`, sends with `sendMessage`, and exposes `status` and `stop`.
- The API key and the system prompt stay on the server.
- Require login, rate limit, and cap message size and output tokens to control cost.
- Tools run with the current user's permissions; model output is untrusted text.
:::

# Security headers and common vulnerabilities

*The usual ways web apps get attacked, and the specific defence for each one in this stack.*

## Why this matters

A house has a front door, a back door, windows and a balcony. A thief needs only one of them open. A strong lock on the front door does not help if the kitchen window is left open.

A web app is the same. Login can be perfect and the app can still leak data through one unchecked id or one unsafe piece of HTML. Security is a list of doors, and your job is to close each one. This chapter is that list.

## Security headers

A **security header** is an instruction that your server sends with a response. It tells the browser to switch on a protection. Set them once for all routes in `next.config.ts`.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',          // always use HTTPS
    value: 'max-age=63072000; includeSubDomains',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },   // no embedding in iframes
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,                      // hide "X-Powered-By"
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
```

| Header | What it stops |
|---|---|
| `Strict-Transport-Security` | the browser using plain HTTP for your site |
| `X-Content-Type-Options` | the browser guessing a file type and running an upload as a script |
| `X-Frame-Options` | your page being shown inside another site's frame (clickjacking) |
| `Referrer-Policy` | full URLs of your pages leaking to other sites |
| `Permissions-Policy` | scripts using the camera, microphone and similar features |

## Content Security Policy

A **Content Security Policy** (CSP) is a header that lists where scripts, styles and images may come from. If an attacker manages to inject a script tag, the browser refuses to run it, because its source is not on the list.

A strict CSP uses a **nonce**: a random value created for each request. Only script tags that carry the same nonce may run. In Next.js you create the nonce in `proxy.ts`, put it in the `Content-Security-Policy` header, and Next.js adds it to its own script tags while rendering.

:::warn Expecting a nonce CSP and a static shell together
A nonce must be different for every request, so pages that use it must be rendered at request time. That gives up prerendering and the static shell for those pages. This is a real trade-off. Many teams start with the headers above plus a CSP without nonces, and move to nonces only for the routes that need the strongest protection. Decide on purpose, and test the policy in the browser console before you enforce it.
:::

## The common attacks

| Attack | What the attacker does | Main defence here |
|---|---|---|
| XSS | gets their script to run in another user's page | React escapes text; no raw HTML; CSP |
| CSRF | makes a logged-in user's browser send a request | `sameSite` cookies; Origin check on actions |
| SQL injection | puts SQL into an input | Prisma parameters; no string-built SQL |
| IDOR | changes an id to read someone's record | owner in every `where` |
| Open redirect | uses your site to bounce users to a bad site | allow only internal paths |
| SSRF | makes your server fetch an internal URL | allow-list hosts, for example `images.remotePatterns` |
| Secret leak | reads keys from the bundle or props | `server-only`, DTOs, no `NEXT_PUBLIC_` secrets |
| Brute force | tries many passwords or prompts | rate limiting |

**XSS** means Cross-Site Scripting. **CSRF** means Cross-Site Request Forgery. **SSRF** means Server-Side Request Forgery.

### XSS

React turns any value you put in JSX into text. If a review contains a script tag, the user sees the characters, and nothing runs.

:::example Dry run: a script in a review
A user submits the review text `<img src=x onerror=alert(1)>`.

| How it is rendered | Result |
|---|---|
| `<p>{review.text}</p>` | shown as plain characters; safe |
| `dangerouslySetInnerHTML={{ __html: review.text }}` | the browser builds the tag and runs the code |
| `<a href={review.website}>` with `javascript:alert(1)` | runs on click; validate that URLs start with `https://` |

The escape happens when React renders, so store the text as the user typed it and let React escape it on output.
:::

:::warn Using dangerouslySetInnerHTML with user or model text
The name is honest. It switches off React's protection. Use it only for HTML that your own code produced, or that passed through a well-known sanitizer library on the server. For Markdown, use a renderer that does not pass raw HTML through.
:::

### CSRF

Server Actions accept only POST, and Next.js rejects an action when the `Origin` header does not match the host. Together with a `sameSite` session cookie this covers actions. **Route Handlers do not get the Origin check.** For a handler that changes data using the session cookie, compare the `Origin` header with your own host yourself, and never change data in a `GET`.

### Open redirect

```ts
// lib/safe-redirect.ts
export function safeNext(next: string | null, fallback = '/dashboard') {
  // Accept "/courses/sql-101". Reject "https://evil.example",
  // "//evil.example" and paths with a backslash.
  if (!next) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.includes('\\')) return fallback
  return next
}
```

### Rate limiting

**Rate limiting** means allowing only a fixed number of attempts in a time window. Apply it to login, sign-up, password reset and the AI endpoint.

```ts
// lib/rate-limit.ts
import 'server-only'

const hits = new Map<string, { count: number; resetAt: number }>()

export function allow(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })  // new window
    return true
  }
  entry.count += 1
  return entry.count <= limit
}

// In the login action:
// if (!allow(`login:${email}`)) return { message: 'Try again later.' }
```

This version keeps counts in the memory of one server. With several instances or serverless hosting, each one has its own map, so use a shared store such as Redis in production.

### Secrets and data exposure

- A secret must never have the `NEXT_PUBLIC_` prefix. That prefix copies the value into the browser bundle.
- Mark data and auth modules with `import 'server-only'`.
- Return DTOs from the data layer and small state objects from actions.
- Do not accept a whole object from the client and pass it to `update`. A user could add `role: 'ADMIN'` to the request. This is called **mass assignment**. Pick the allowed fields with a schema.
- Keep dependencies updated and run `npm audit` in CI. Most real break-ins use a known bug in an old package.

:::interview Explain the difference between XSS and CSRF.
In XSS the attacker gets their own JavaScript to run inside your site in the victim's browser, usually because the app rendered untrusted text as HTML. The script then acts as the user and can read the page. Defences are escaping output, avoiding raw HTML, a Content Security Policy and `httpOnly` cookies. In CSRF the attacker does not run code on your site. Another site makes the victim's browser send a request to your site, and the browser attaches the session cookie automatically. Defences are `sameSite` cookies, checking the Origin header, and using POST for changes. XSS abuses the user's trust in the site. CSRF abuses the site's trust in the user's browser.
:::

:::revise
- Set HSTS, `nosniff`, frame, referrer and permissions headers for every route in `next.config.ts`.
- A nonce-based CSP is the strongest script protection, but it forces request-time rendering.
- React escapes text in JSX; `dangerouslySetInnerHTML` and `javascript:` URLs bring XSS back.
- Server Actions check POST and Origin; Route Handlers that use cookies need their own Origin check.
- Prevent IDOR and mass assignment with owner filters and schemas that pick allowed fields.
- Validate redirect targets and rate limit login and AI endpoints.
:::

# Performance: images, fonts, bundle and Turbopack

*What makes a page feel fast, how Next.js helps, and where you can still slow it down.*

## Why this matters

On a crowded train platform, three things annoy you: the train comes late, the doors do not open when you press the button, and the coach position changes just as you start walking. A slow web page annoys in the same three ways.

Google measures these with three numbers called the **Core Web Vitals**. They are a good map of what to fix.

| Metric | Full name | Question it answers | Typical fix |
|---|---|---|---|
| LCP | Largest Contentful Paint | when did the main content appear? | static shell, optimized hero image |
| INP | Interaction to Next Paint | how fast does the page react to a tap? | less client JavaScript |
| CLS | Cumulative Layout Shift | does the page jump while loading? | fixed sizes for images, fonts and skeletons |

## Images

Images are usually the heaviest part of a page. The `next/image` component resizes them for the device, converts them to modern formats, loads them only when they come near the screen (**lazy loading**), and reserves their space so nothing jumps.

```tsx
import Image from 'next/image'

export function CourseHero(props: { src: string; title: string }) {
  return (
    <Image
      src={props.src}
      alt={props.title}                // describe the image for readers
      width={1200}                     // real size: reserves the space
      height={630}
      sizes="(max-width: 768px) 100vw, 800px"   // how wide it is shown
      preload                          // the main image above the fold
    />
  )
}
```

`sizes` tells the browser how wide the image will be on screen, so it can pick the smallest file that still looks sharp. `preload` asks the browser to fetch the image early. Use it only for the one image that is the largest thing on first view. The docs also suggest `loading="eager"` or `fetchPriority="high"` as lighter options for the same goal.

| Next.js 16 image change | Detail |
|---|---|
| `priority` prop | deprecated; use `preload` |
| `images.qualities` | default is `[75]` only; list other values to use them |
| `images.domains` | deprecated; use `images.remotePatterns` |
| Local IP sources | blocked by default (protection against SSRF) |

Remote images must be allowed with `images.remotePatterns` in the config. This stops strangers from using your server as a free image resizer.

:::warn Images without a size
An image with no `width` and `height` (and no `fill` inside a sized parent) has zero height until it loads. Then it pushes the text down. That jump is CLS. Always give real dimensions, or use `fill` with `sizes` inside a container that has a fixed aspect ratio.
:::

## Fonts

A web font loaded from another site costs an extra connection, and the text may flash or shift when the font arrives. `next/font` downloads the font at build time, serves it from your own domain, and prepares a fallback with matching size so the swap does not move the layout.

```tsx
// app/layout.tsx (part)
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

// <html lang="en" className={inter.className}>
```

## Shipping less JavaScript

Every kilobyte of client JavaScript must be downloaded, parsed and run on the user's phone. Less JavaScript is the most reliable way to improve INP.

1. **Keep components on the server.** A Server Component adds nothing to the bundle. This is the biggest lever, and it is why chapter 2 told you to keep `'use client'` on small leaves.
2. **Load heavy client parts later.** `next/dynamic` splits a component into its own file that is fetched only when it renders.
3. **Measure before you guess.** Next.js 16.1 and later include an experimental analyzer: `npx next experimental-analyze`. It shows which modules are large and who imports them.
4. **Load third-party scripts with `next/script`**, so analytics and chat widgets do not block your own code.

:::example Dry run: why is this page slow?
A course page has a 2 MB hero photo in an `<img>` tag, a date library imported in a client header, and a font from an outside site.

| Finding | Metric hurt | Change |
|---|---|---|
| huge unsized `<img>` | LCP and CLS | `next/image` with `width`, `height`, `sizes`, `preload` |
| header is a Client Component only to format a date | INP | format the date in a Server Component |
| outside font request | LCP and CLS | `next/font` |

Each fix removes work from the user's device. None of them needed a faster server.
:::

:::tip
Measure with a production build (`next build` then `next start`), not with `next dev`. Development mode adds checks and does not minify, so its numbers are not what your users get. Test on a mid-range phone or with throttling in the browser dev tools.
:::

## Turbopack

A **bundler** is the tool that takes your many source files and packages them into the files a browser or server can load. **Turbopack** is a bundler written in Rust and built into Next.js. Since Next.js 16 it is the default for both `next dev` and `next build`. You do not need a flag.

| Idea | What it means for you |
|---|---|
| Incremental | after a change it redoes only the work that depends on that change |
| Lazy in dev | it bundles a route only when you open it |
| File system cache | results are stored under `.next`, so restarts and later builds start warm |
| One graph | server and client code are handled in one pass |

Things to know when you upgrade an older project:

- If the project has a custom `webpack` function in the config, `next build` stops with an error so that you do not ship a half-configured build. Either move the settings to the top-level `turbopack` key, or run `next build --webpack` to keep using webpack.
- Turbopack compiles TypeScript but does not type-check it. Run `tsc --noEmit` in CI.
- `next build` no longer runs the linter, and the `next lint` command was removed. Run ESLint (or Biome) yourself.
- `next dev` writes to `.next/dev`, so a dev server and a build can run at the same time.

## The React Compiler

React re-renders a component when its state or props change. Before, developers added `useMemo`, `useCallback` and `memo` by hand to skip unneeded work. The **React Compiler** does this automatically at build time. Support is stable in Next.js 16 but **off by default**. Turn it on with `reactCompiler: true` in the config after installing `babel-plugin-react-compiler`. Builds become a little slower, because the compiler runs through Babel.

:::interview How would you reduce the JavaScript sent to the browser in a Next.js app?
First I keep as much as possible in Server Components, because their code never ships. I check that `'use client'` sits on small leaf components and not on pages or layouts, and that server content is passed into client wrappers as children. Second, I load heavy or rarely used client components with `next/dynamic` so they are split into separate chunks. Third, I look at the bundle analyzer to find large dependencies and replace or lazy-load them, and I load third-party scripts with `next/script`. Finally I verify the effect with a production build and Web Vitals, not in development mode.
:::

:::revise
- Core Web Vitals: LCP (main content), INP (reaction to input), CLS (layout jumps).
- `next/image` needs `alt`, real dimensions and `sizes`; use `preload` (not `priority`) for the main image.
- `next/font` self-hosts fonts and avoids layout shift.
- The best bundle optimization is fewer Client Components; then `next/dynamic` and the analyzer.
- Turbopack is the default bundler in Next.js 16; a custom webpack config needs migration or `--webpack`.
- Type-check and lint yourself in CI; the React Compiler is opt-in.
:::

# Testing and zero-downtime deployment

*Catch mistakes before users do, and release new versions without anyone noticing.*

## Why this matters

A drama group rehearses each scene alone, then runs the whole play once before the show. And when an actor is replaced during a long run, the show does not stop for a week. The new actor walks in between scenes.

Tests are the rehearsal. Deployment is the change of actors while the audience is watching. Both are skills that separate a hobby project from a product.

## What to test with what

| Kind | Checks | Tool | Use it for |
|---|---|---|---|
| Unit | one function alone | Vitest | schemas, helpers, price maths |
| Component | one component in a fake browser | Vitest + Testing Library | Client Components |
| End-to-end (E2E) | the real app in a real browser | Playwright | login, enrol, pages with async Server Components |

Tooling for unit-testing **async Server Components** is still incomplete, so the Next.js docs recommend E2E tests for them. This is one more reason to keep logic out of components: put rules in plain functions and schemas, which are easy to unit test.

```ts
// lib/validation/review.test.ts
import { describe, expect, it } from 'vitest'
import { reviewSchema } from './review'

describe('reviewSchema', () => {
  it('accepts a valid review and converts the rating', () => {
    const result = reviewSchema.safeParse({
      courseId: 'c1', rating: '4', text: 'Clear and useful course.',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.rating).toBe(4)  // number
  })

})
```

```ts
// e2e/login.spec.ts
import { expect, test } from '@playwright/test'

test('a student can log in and see the dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('student@example.com')
  await page.getByLabel('Password').fill('a-long-test-password')
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL('/dashboard')
  const heading = page.getByRole('heading', { name: 'My courses' })
  await expect(heading).toBeVisible()
})
```

Run E2E tests against a production build and a separate test database with known seed data. Find elements by role and label, as a user would, not by CSS class names.

:::warn Testing only the happy path
A test that logs in with the right password proves little. The bugs that hurt are on the other paths: wrong password, a student calling an admin action, user A opening user B's order, a form submitted twice. Write at least one test for "this must be refused" for every rule in your actions.
:::

A simple pipeline for every pull request (**CI**, Continuous Integration, means a server runs these checks automatically):

:::flow CI pipeline
Type check | tsc --noEmit
Lint | eslint
Unit tests | vitest run
Build | next build
E2E | playwright test
:::

## What a build produces

`next build` creates the `.next` folder: prerendered HTML and RSC payloads, JavaScript and CSS files with a hash in their names, and the server code.

| Way to deploy | What you run | Supports |
|---|---|---|
| Node.js server | `next build` then `next start` | all features |
| Docker container | the same, inside an image | all features |
| Static export | `output: 'export'`, plain files | no server features |
| Platform adapter | the host's own integration | depends on the platform |

For containers, set `output: 'standalone'` in the config. The build then creates `.next/standalone` with a small `server.js` and only the needed files from `node_modules`.

A container image then needs only three things copied from the build stage: `.next/standalone`, `.next/static` and `public`. It starts with `node server.js`.

:::warn Expecting NEXT_PUBLIC_ variables to change at runtime
`NEXT_PUBLIC_` values are copied into the JavaScript files **during the build**. Changing the variable on the server later has no effect until you build again. Server-only variables such as `DATABASE_URL` are read at runtime, so the same image can run in staging and production with different secrets.
:::

## Zero-downtime releases

**Zero downtime** means users never see an error page while you release. The usual method is a **rolling deployment**: start new instances, wait until they are healthy, move traffic to them, then stop the old ones.

:::flow Rolling deployment
Apply migration | old code still works
Start new instances | health check passes
Shift traffic | load balancer
Stop old instances | after requests finish
:::

Four things make this safe.

**1. A health check.** The load balancer needs a URL that says "this instance is ready".

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`          // can we reach the DB?
    return Response.json({ status: 'ok' })
  } catch {
    return Response.json({ status: 'db-down' }, { status: 503 })
  }
}
```

**2. Graceful shutdown.** When the platform sends `SIGTERM`, the Next.js server stops taking new requests, finishes the running ones and runs pending `after()` callbacks. Give it enough time before the process is killed.

**3. Backward-compatible migrations.** During a rollout, old and new code run against the **same** database. A migration must not break the old code.

:::example Dry run: rename a column without downtime
You want to rename `User.name` to `User.fullName`. A direct rename breaks the old instances at once. Use the **expand and contract** pattern over several releases.

| Release | Database | Code |
|---|---|---|
| 1. Expand | add `fullName` (nullable) | writes both columns, reads `name` |
| 2. Backfill | copy `name` into `fullName` for old rows | unchanged |
| 3. Switch | no change | reads and writes `fullName` only |
| 4. Contract | drop `name` | unchanged |

At every step, the code that is running works with the schema that exists. Run `prisma migrate deploy` as its own step before starting the new instances, not inside the app's start-up.
:::

**4. Version skew.** For a few minutes, a browser may hold the old JavaScript while the server already runs the new version. This mismatch is called **version skew**. Set a `deploymentId` in the config (or the `NEXT_DEPLOYMENT_ID` variable) for each release. When the browser notices a different id, it does a full page load instead of a broken in-page navigation.

When you run **more than one instance**, three more settings matter:

| Problem | Cause | Setting |
|---|---|---|
| Server Actions fail on some instances | each build made its own encryption key | same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for all |
| Cache differs between instances | `use cache` memory is per instance | shared cache handler, `use cache: remote` |
| Streaming arrives all at once | a reverse proxy buffers the response | disable buffering (nginx: `X-Accel-Buffering: no`) |

:::interview How do you deploy a database schema change without downtime?
During a rolling deploy the old and new application versions run together against one database, so every migration has to be compatible with the version that is still running. I split a breaking change into steps. First expand: add the new column or table without removing anything, and release code that writes to both. Then backfill existing rows. Then release code that reads only the new structure. Last, contract: remove the old column in a later release. Migrations run as a separate step before new instances start. I also keep a rollback plan, which is easy because no step destroys data that the previous version needs.
:::

:::revise
- Unit test schemas and helpers with Vitest; use Playwright E2E for flows and async Server Components.
- Test the refusals: wrong role, wrong owner, invalid input, double submit.
- CI order: type check, lint, unit tests, build, E2E.
- `NEXT_PUBLIC_` values are fixed at build time; server variables are read at runtime.
- Zero downtime needs health checks, graceful shutdown and expand-and-contract migrations.
- With several instances: set `deploymentId`, share the Server Actions encryption key and the cache.
:::

# Cheat sheet, interview questions and study plan

*Everything on a few pages for the night before, plus a plan to make it stick.*

## Why this chapter

Before an exam you do not read the whole textbook again. You read your own short notes. This chapter is that set of short notes. Use the tables to revise, the questions to test yourself, and the plan to turn reading into skill.

## Where does it run?

| Thing | Runs on | Marked by |
|---|---|---|
| Server Component | server only | nothing (the default) |
| Client Component | server for first HTML, then browser | `'use client'` at the top of the file |
| Server Function / Action | server, called over POST | `'use server'` |
| Cached function or component | server, result reused | `'use cache'` |
| Route Handler | server | `route.ts` |
| Proxy | server, before the route | `proxy.ts` |

## Hooks and APIs from React 19

| API | One-line use |
|---|---|
| `useTransition` | pending flag for any async Action |
| `useActionState(fn, initial)` | `[state, formAction, isPending]`; `fn(prevState, formData)` |
| `useFormStatus()` | `{ pending }` of the parent form; import from `react-dom` |
| `useOptimistic(value, reducer)` | temporary value while an Action runs |
| `use(promise)` | read a Promise inside Suspense |
| `cache(fn)` | one result per request for the same arguments |

## Caching in Next.js 16

| API | Use |
|---|---|
| `cacheComponents: true` | turns on `use cache` and Partial Prerendering |
| `cacheLife('hours')` | lifetime: `seconds`, `minutes`, `hours`, `days`, `weeks`, `max` |
| `cacheTag('courses')` | label for on-demand invalidation |
| `updateTag(tag)` | Server Action only; next read is fresh |
| `revalidateTag(tag, 'max')` | serve stale, refresh in background |
| `revalidatePath('/x')` | invalidate one route |
| `refresh()` | re-render the current page from an action |
| `connection()` | wait for a real request before continuing |

## The checklist for every Server Action and Route Handler

1. Get the user from the session, not from the request body.
2. Validate all input with a schema.
3. Check that this user may touch this record.
4. Do the change, in a transaction if it has several steps.
5. Invalidate tags, then return a small result or redirect.

:::warn The five mistakes reviewers see most
1. `'use client'` at the top of a page or layout.
2. Using `params` or `cookies()` without `await`.
3. A Server Action with no auth check, because "the button is hidden".
4. `use cache` on data that depends on the user, without the user id as an argument.
5. Reading cookies high in the tree, so the whole page loses its static shell.
:::

## Rapid-fire interview questions

Cover the answer, say yours aloud, then compare.

**Fundamentals**

- **What is the RSC Payload?** A compact description of the rendered Server Component tree, with slots and props for Client Components. React uses it to update the page without a full reload.
- **What is hydration?** React attaching event handlers and state to HTML that the server already rendered. Only Client Components are hydrated.
- **Can you pass a function from a Server Component to a Client Component?** Only a Server Function. Ordinary functions are not serializable.
- **How do you stop a server module from being imported on the client?** Add `import 'server-only'`, which makes the build fail on a wrong import.

**Routing and rendering**

- **What changed about `params` in Next.js 16?** It is a Promise and must be awaited. Synchronous access was removed.
- **What does `loading.tsx` do?** It wraps the page in a Suspense boundary and shows its content while the page streams.
- **Why can a streamed page not return 404 late?** The status code is sent with the first chunk. Call `notFound()` before anything suspends.
- **What is the static shell?** The prerendered part of a page, including Suspense fallbacks, that is sent at once before dynamic parts stream in.

**Data and caching**

- **Is `fetch` cached by default in Next.js 16?** No. Results are not kept across requests unless you opt in.
- **`cache()` or `use cache`?** `cache()` removes duplicate calls inside one request. `use cache` stores a result across requests.
- **What is stale-while-revalidate?** Serve the old result immediately and refresh it in the background for the next request.
- **Why does a new deployment start with an empty `use cache`?** The build id is part of every cache key.

**Mutations, auth and security**

- **Is a Server Action private?** No. It is a public POST endpoint and must authenticate, validate and authorize.
- **Why store a session token hash instead of the token?** If the database leaks, the hashes cannot be used as cookies.
- **What is IDOR?** Reading or changing a record by guessing its id because the query does not check the owner.
- **What replaced `middleware.ts`?** `proxy.ts`, exporting a `proxy` function, on the Node.js runtime.

:::interview Walk me through what happens when a user opens a product page in a Next.js 16 app with Cache Components.
The request first passes `proxy.ts`, which may redirect or add headers. The route is matched and the server sends the static shell immediately: the layout, any content that was static or produced by `use cache` functions at build time, and the fallbacks of Suspense boundaries. The browser starts painting and downloading the JavaScript for Client Components. Meanwhile the server renders the dynamic holes. It reads the session cookie, runs the uncached queries and streams each finished part into the same response, where a small script swaps it in for its fallback. React then hydrates the Client Components so buttons work. On later navigations only the RSC Payload for the new route is fetched, and layouts stay mounted.
:::

:::interview You join a team whose Next.js app is slow and sometimes shows one user's data to another. Where do you look first?
For the data leak I look at caching and shared state first: any `use cache` function, `unstable_cache` call or module-level variable that holds per-user data without the user id in the key, and any query that takes an id from the URL without filtering by owner. I would move session reads into one data access layer and pass the user id explicitly. For speed I measure a production build with Web Vitals. Then I check for `'use client'` on pages and layouts, request waterfalls from sequential awaits, missing Suspense boundaries that block the shell, N+1 queries in loops, and unoptimized images. I fix the security issue first, because a slow page costs time and a leak costs trust.
:::

## A six-week study plan

| Week | Read | Build |
|---|---|---|
| 1 | chapters 1 to 3 | course list and detail pages with layouts, loading and error files |
| 2 | chapters 4 and 8 | a review form with `useActionState`, Zod and an optimistic "save" button |
| 3 | chapters 5 to 7 | add Suspense, `use cache`, tags, and a personal panel as a streamed hole |
| 4 | chapters 9 to 11 | Prisma schema, login with sessions, owner checks, one webhook |
| 5 | chapters 12 and 13 | the AI study helper with limits; add headers and rate limiting |
| 6 | chapters 14 and 15 | image and bundle clean-up, tests, a container and a health check |

How to use each week:

- Read the chapter once without typing. Then type every example. Do not paste.
- After each chapter, close the notes and explain the revise box aloud in your own words.
- Break things on purpose. Remove an `await` from `params`. Read a cookie outside Suspense. Call an action as the wrong user. Read the error and fix it.
- At the end of the week, answer the interview questions of those chapters without looking.

:::tip
Next.js ships its documentation inside the package. In any project you can read the docs for your exact version under `node_modules/next/dist/docs`. When this handbook and your installed version disagree, trust the docs of your version.
:::

Then pick one project of your own (a notes app with sharing, a seat booking site, a support desk with an AI helper), deploy it, and write a short README that explains where each piece of code runs and why. Being able to explain that is what interviewers look for.

:::revise
- Know where each kind of code runs: Server Component, Client Component, Server Action, Route Handler, proxy.
- Next.js 16 basics: async request APIs, Turbopack by default, `proxy.ts`, opt-in caching with `use cache`.
- Every action and handler: session, schema, ownership, change, invalidate.
- Keep Client Components small, push request data down, and wrap dynamic parts in Suspense.
- Cache only shared data, with an explicit lifetime and a tag.
- Learn by building one full project and breaking it on purpose.
:::
