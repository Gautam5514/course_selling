---
title: Full Stack Notes
subtitle: Build and ship real web apps with Next.js 16, React 19 and PostgreSQL, from the first request to deployment.
category: Full Stack
level: Intermediate to Pro
accent: emerald
tags: nextjs, react, postgresql, server-actions, fullstack
highlights: App Router | Server Components | PostgreSQL and SQL | Cache Components | Server Actions | Auth and Deployment
tagline: Next.js 16 • React 19 • PostgreSQL • Server Actions • Auth • Deployment
description: A complete path from "I know some React" to "I can build and deploy a full stack app". You learn the Next.js 16 App Router, Server and Client Components, plain SQL with PostgreSQL, caching with use cache, Server Actions, Route Handlers and cookie based login. A worked task manager project, security basics, testing, deployment and interview questions tie it all together.
---

# What full stack means and how a request travels

*The three parts of every web app, and the trip one click makes through them.*

## Why this matters

Think of a restaurant. The **dining hall** is what the customer sees. The **kitchen** is where the food is made. The **store room** is where the ingredients are kept. A customer never walks into the store room. A waiter carries the order in and the food out.

A web app works the same way:

| Restaurant | Web app | In these notes |
|---|---|---|
| Dining hall | **Frontend**: what the user sees in the browser | React 19 |
| Kitchen | **Backend**: code on a server that makes decisions | Next.js 16 |
| Store room | **Database**: where data is kept safely | PostgreSQL |
| Waiter | **HTTP**: the request and the response | Fetch, forms |

A **full stack developer** can build all three parts and connect them. That is the skill these notes teach.

## The trip of one request

A **request** is a message from the browser that asks for something. A **response** is the answer from the server. They travel over **HTTP**, the language that browsers and servers speak.

:::flow What happens when you open /tasks
Browser | asks for /tasks
Server | runs your Next.js code
Database | returns the rows
Server | builds the HTML
Browser | shows the page
:::

Here is a request and its response as plain text. You can see them in the Network tab of the browser dev tools.

```text
GET /tasks HTTP/1.1            <- method and path
Host: example.com              <- which site
Cookie: session=eyJhbGciOi...  <- who is asking (sent automatically)

HTTP/1.1 200 OK                <- status code
Content-Type: text/html        <- what kind of answer

<!DOCTYPE html> ...            <- the body
```

## Methods and status codes

The **method** says what you want to do. The **status code** says how it went.

The four methods you will use most: `GET` reads and must not change anything, `POST` creates something or runs an action, `PUT` or `PATCH` updates, and `DELETE` removes.

| Code | Meaning | Typical cause |
|---|---|---|
| `200`, `201`, `204` | OK, Created, OK with no body | It worked |
| `307`, `308` | Redirect | Page moved, or login needed |
| `400`, `422` | Bad input | A form field is wrong |
| `401`, `403` | Not logged in, not allowed | Auth problem |
| `404` | Not found | Wrong URL or id |
| `500` | Server error | A bug in your code |

## The whole stack in one file

Next.js lets one project hold the frontend and the backend. This small page already uses all three layers.

```jsx
// app/tasks/page.js  (runs on the server, never in the browser)
import { query } from '@/lib/db'      // our database helper (chapter 5)

export default async function TasksPage() {
  // Backend + database: ask Postgres for rows
  const tasks = await query(
    'SELECT id, title FROM tasks ORDER BY id DESC'
  )

  // Frontend: turn the rows into HTML
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

The browser receives ready HTML. It never sees the SQL, the database password or the `query` function.

:::warn
The browser is not a safe place. Anyone can open dev tools and send any request they like. So every important rule (who is logged in, what they may change, what input is valid) must be checked **on the server**. Checks in the browser are only for comfort.
:::

:::interview What happens between typing a URL and seeing the page?
The browser finds the server's IP address using DNS, opens a secure connection (HTTPS) and sends a `GET` request with cookies. The server matches the path to a route, runs its code, often reads the database, and sends back HTML. The browser shows it and downloads CSS and JavaScript. React then attaches event handlers, a step called hydration, and the page becomes interactive.
:::

:::revise
- Full stack means frontend, backend and database, plus the HTTP messages between them.
- A request has a method, a path and headers. A response has a status code and a body.
- `GET` reads, `POST` creates or acts, `PATCH` updates, `DELETE` removes.
- Next.js lets one project hold both the UI and the server code.
- Never trust the browser. Every rule that matters is checked on the server.
:::

# Project setup and the App Router

*Create a Next.js 16 project and learn how folders and special files become pages.*

## Why this matters

In a housing society, the address tells you where a flat is: block, floor, door. In Next.js the **folder path is the address**. You do not write a list of routes. You create folders and files, and Next.js builds the routes from them. This is called **file-system routing**.

## Create the project

You need Node.js 20.9 or newer.

```bash
npx create-next-app@latest task-manager
# Choose "customize settings" if you want JavaScript instead of
# TypeScript. Keep App Router: Yes. Keep the import alias @/*
cd task-manager
npm run dev        # starts the dev server on http://localhost:3000
```

Turbopack is the default bundler, so no flag is needed. The old `next lint` command is gone: linting runs with the ESLint CLI.

## Folders are URLs, files are UI

```text
app/
  layout.js             root layout (required, has <html> and <body>)
  page.js               /
  not-found.js          UI for any unknown URL
  tasks/
    page.js             /tasks
    loading.js          shown while /tasks is loading
    error.js            shown if /tasks crashes
    [id]/
      page.js           /tasks/1, /tasks/2, ...
  (auth)/
    login/page.js       /login      (the folder "(auth)" is not in the URL)
    signup/page.js      /signup
  api/
    tasks/route.js      /api/tasks  (returns JSON, not a page)
proxy.js                runs before requests (old name: middleware)
```

| File | What it does |
|---|---|
| `page.js` | The UI of a route. Without it the folder is not a public URL |
| `layout.js` | Shared UI that wraps pages (navbar, footer). Keeps its state on navigation |
| `loading.js` | Instant loading UI while the page waits for data |
| `error.js` | Fallback UI when something below it throws |
| `not-found.js` | UI for a 404 |
| `route.js` | An API endpoint. Cannot sit in the same folder as `page.js` |

| Folder name | Meaning |
|---|---|
| `[id]` | Dynamic segment. Matches one value, like `/tasks/42` |
| `[...slug]` | Catch-all. Matches many segments, like `/docs/a/b/c` |
| `(group)` | Route group. Organises files, does not appear in the URL |
| `_private` | Private folder. Never becomes a route |

## Layouts and pages

A **layout** is like the frame of a photo. The photo changes, the frame stays. The root layout is required and must contain the `html` and `body` tags.

```jsx
// app/layout.js
import Link from 'next/link'
import './globals.css'

// Sets <title> and <meta name="description"> for every page
export const metadata = {
  title: 'Task Manager',
  description: 'A small full stack app built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          {/* Link changes pages without a full reload */}
          <Link href="/">Home</Link> <Link href="/tasks">Tasks</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

`<Link>` is the Next.js version of the `<a>` tag. It loads the next page in the background (**prefetching**) and swaps only the part of the screen that changes.

## Dynamic routes and async params

A dynamic folder such as `[id]` gives the page a `params` prop. In Next.js 16, `params` is a **Promise**. You must `await` it. The query string (the part after `?`) arrives as `searchParams`, which is also a Promise.

```jsx
// app/tasks/[id]/page.js      URL: /tasks/42?tab=notes
import { notFound } from 'next/navigation'
import { getTaskById } from '@/lib/data/tasks'

export default async function TaskPage({ params, searchParams }) {
  const { id } = await params           // { id: '42' }  always a string
  const { tab } = await searchParams    // { tab: 'notes' }

  const task = await getTaskById(Number(id))
  if (!task) notFound()                 // shows not-found.js with a 404

  return (
    <article>
      <h1>{task.title}</h1>
      <p>Open tab: {tab ?? 'details'}</p>
    </article>
  )
}
```

:::warn
Old tutorials write `params.id` directly. In Next.js 16 that no longer works, because synchronous access was removed. Always write `const { id } = await params`. The same rule applies to `searchParams`, `cookies()` and `headers()`.
:::

## Loading, error and not-found files

These three files handle the "not ready" and "went wrong" states so you do not write that logic in every page.

A `loading.js` file simply exports a component that returns the placeholder, for example `<p>Loading tasks...</p>`. An `error.js` file looks like this:

```jsx
// app/tasks/error.js
'use client' // error files must be Client Components

export default function ErrorPage({ error, retry }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      {/* retry() fetches and renders this part again.
          Older versions called this prop reset. */}
      <button onClick={() => retry()}>Try again</button>
    </div>
  )
}
```

## Proxy, the new name for middleware

A **proxy** is like the security guard at the gate. Every visitor passes the guard before reaching any flat. In Next.js, a `proxy.js` file in the project root exports a `proxy(request)` function that runs before a request reaches your pages. Before version 16 this file was called `middleware.js`, a name that is now deprecated. Keep the proxy fast: it is for redirects and quick checks, not for database work. Chapter 10 uses it to protect routes.

:::interview What is the difference between a layout and a page?
A page is the UI for one exact URL. A layout wraps the pages below its folder. When the user moves between two pages with the same layout, the layout does not re-render and keeps its state. Only the page part changes. The root layout is required and holds the `html` and `body` tags.
:::

:::revise
- Folders make the URL. `page.js` makes the folder a real route.
- `layout.js` wraps pages and survives navigation. The root layout is required.
- `[id]` is dynamic, `[...slug]` is catch-all, `(group)` is hidden from the URL.
- In Next.js 16, `params` and `searchParams` are Promises. Always `await` them.
- `loading.js`, `error.js` and `not-found.js` handle waiting, crashes and 404s.
- `proxy.js` replaces `middleware.js` and runs before the request reaches a route.
:::

# Server Components and Client Components

*Where each piece of your code runs, and how the two worlds pass data.*

## Why this matters

When you order a sofa, some parts come **ready-made** from the factory. Other parts, like a reclining handle, must **work in your home**. Sending the whole factory to your home would be silly.

React in Next.js works the same way:

- A **Server Component** is made in the factory (the server). The browser receives only the finished HTML. Its code is never downloaded.
- A **Client Component** is also sent as JavaScript, so it can react to clicks and typing in the browser.

In the App Router, every component is a Server Component **by default**. You opt in to the client with one line: `'use client'`.

## Which one do I need?

| You need | Use |
|---|---|
| Read from the database or use a secret key | Server Component |
| Show data that needs no clicks | Server Component |
| `useState`, `useEffect`, `onClick`, `onChange` | Client Component |
| Browser APIs such as `localStorage` or `window` | Client Component |

A good rule: keep everything on the server, and make only the small interactive leaves client components.

## A server page with a client button

```jsx
// app/tasks/[id]/page.js   Server Component (no directive needed)
import { getTaskById } from '@/lib/data/tasks'
import CopyLinkButton from './copy-link-button'

export default async function TaskPage({ params }) {
  const { id } = await params
  const task = await getTaskById(Number(id))   // runs only on the server

  return (
    <article>
      <h1>{task.title}</h1>
      {/* Data goes from server to client through props */}
      <CopyLinkButton path={`/tasks/${task.id}`} />
    </article>
  )
}
```

```jsx
// app/tasks/[id]/copy-link-button.js
'use client' // must be the first line, above the imports

import { useState } from 'react'

export default function CopyLinkButton({ path }) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    // window and navigator exist only in the browser
    await navigator.clipboard.writeText(window.location.origin + path)
    setCopied(true)
  }

  return (
    <button onClick={handleClick}>{copied ? 'Copied' : 'Copy link'}</button>
  )
}
```

## The boundary

`'use client'` draws a **boundary**. The file with the directive, and everything it **imports**, becomes part of the JavaScript sent to the browser. You do not need to repeat the directive in each imported file.

**Hydration** means React connects event handlers to the HTML that the server already sent. Before hydration the page is visible but buttons do not respond yet.

:::warn
Do not put `'use client'` at the top of a page or layout just because one button needs a click handler. That pushes the whole tree into the browser bundle and removes your direct access to the database. Move the interactive part into a small file and mark only that file.
:::

## What can cross the boundary

Props that go from a Server Component to a Client Component travel over the network, so they must be **serializable**. That means they can be turned into text and back.

| Can pass | Cannot pass |
|---|---|
| Strings, numbers, booleans, `null` | Normal functions and event handlers |
| Plain objects and arrays | Class instances, database clients |
| `Date`, `Map`, `Set`, Promises | Anything that holds a secret you do not want public |
| Server Functions (chapter 8), JSX | |

Props are also **public**: whatever you pass to a Client Component is sent to the browser. Never pass a whole user row with `password_hash` in it. Select only the fields the UI needs.

## Server content inside a client wrapper

A Client Component cannot **import** a Server Component. But it can receive one as `children`. The server renders the child first and hands over the result.

```jsx
// app/ui/collapsible.js
'use client'

import { useState } from 'react'

export default function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <section>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && children}
    </section>
  )
}
```

```jsx
// app/tasks/page.js   Server Component
import Collapsible from '@/app/ui/collapsible'
import TaskStats from './task-stats'     // async Server Component

export default function Page() {
  return (
    <Collapsible title="Show stats">
      <TaskStats />    {/* still rendered on the server */}
    </Collapsible>
  )
}
```

## Keep server code out of the browser

A file such as `lib/db.js` holds your database connection. If someone imports it into a Client Component by mistake, the build should fail loudly. One import does that.

Add the line `import 'server-only'` at the top of such a file. Any import from a Client Component then becomes a build error.

Environment variables give a second layer of safety. Only variables whose name starts with `NEXT_PUBLIC_` are placed in the browser bundle. All others stay on the server.

:::interview Can a Server Component use useState? Why not?
No. State exists to react to things that happen over time in the browser, such as clicks. A Server Component runs once on the server and its code is not sent to the browser, so there is nothing to re-render later. If a part of the UI needs state, move it into a Client Component and pass server data to it as props.
:::

:::revise
- Components are Server Components by default. Add `'use client'` only where you need state, effects, event handlers or browser APIs.
- `'use client'` marks a boundary: the file and everything it imports ship to the browser.
- Props that cross the boundary must be serializable, and they are visible to the user.
- Pass Server Components into Client Components as `children`.
- Add `import 'server-only'` to files that must never reach the browser.
:::

# PostgreSQL essentials with plain SQL

*Tables, keys, relations, joins, indexes and transactions, the parts of SQL you use every day.*

## Why this matters

A spreadsheet is fine for a shopping list. It is not fine when a thousand people edit it at the same time and no row may ever be half saved. A **relational database** is a very strict spreadsheet. Every column has a type, rows in different tables are linked by rules, and changes are safe even when the server crashes in the middle.

**PostgreSQL** (often called Postgres) is a free, open source relational database. You talk to it with **SQL**, a language for asking questions about data.

To practise, run Postgres locally (for example with the official `postgres` Docker image) or create a free hosted database, and open a SQL prompt with `psql`.

## Tables, types and constraints

A **table** holds one kind of thing. A **row** is one item. A **column** is one fact about it. A **constraint** is a rule the database enforces for you, so bad data can never get in.

```sql
CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,     -- no two users share one
  password_hash TEXT        NOT NULL,            -- never the real password
  role          TEXT        NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER     NOT NULL
             REFERENCES users (id) ON DELETE CASCADE,
  title      TEXT        NOT NULL
             CHECK (char_length(title) BETWEEN 1 AND 200),
  done       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Term | Plain meaning |
|---|---|
| **Primary key** | The column that identifies one row. Unique and never empty |
| **Foreign key** | A column that points to a row in another table (`user_id`) |
| `NOT NULL`, `UNIQUE` | The value is required. No two rows share it |
| `CHECK` | A custom rule, such as the allowed roles |
| `ON DELETE CASCADE` | When the user is deleted, their tasks are deleted too |

`GENERATED ALWAYS AS IDENTITY` lets Postgres pick the next id: 1, 2, 3 and so on. `TIMESTAMPTZ` stores an exact moment in time, including the time zone.

## Relations

- **One to many**: one user has many tasks. Put a foreign key on the "many" side (`tasks.user_id`).
- **Many to many**: a task has many tags and a tag has many tasks. Use a third table with two foreign keys (`task_tags`).
- **One to one**: a user has one profile. Use a foreign key with a `UNIQUE` constraint.

## The four basic statements

```sql
-- Create. RETURNING gives back the new row, including its id
INSERT INTO tasks (user_id, title)
VALUES (1, 'Learn SQL joins')
RETURNING id, title, done;

-- Read
SELECT id, title, done
FROM tasks
WHERE user_id = 1 AND done = false
ORDER BY created_at DESC
LIMIT 20;

-- Update. Without WHERE every row would change
UPDATE tasks SET done = true WHERE id = 5 AND user_id = 1;

-- Delete
DELETE FROM tasks WHERE id = 5 AND user_id = 1;
```

:::warn
An `UPDATE` or `DELETE` without `WHERE` changes **every** row in the table. Write the `WHERE` part first.
:::

## Joins

A **join** combines rows from two tables that belong together. Think of matching each task with the name on its owner's ID card.

```sql
-- INNER JOIN: only tasks that have a matching user
SELECT t.id, t.title, u.name AS owner
FROM tasks t
JOIN users u ON u.id = t.user_id
WHERE t.done = false;

-- LEFT JOIN: every user, even users with zero tasks
SELECT u.name,
       COUNT(t.id)::int AS total,
       COUNT(t.id) FILTER (WHERE t.done)::int AS finished
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id
ORDER BY total DESC;
```

A plain `JOIN` keeps only rows that match on both sides. A `LEFT JOIN` keeps every row of the left table and fills `NULL` where the right side has no match.

`GROUP BY` folds many rows into one row per group. `COUNT` is an **aggregate**, a function that turns many values into one.

## Indexes

Finding a word in a book is slow if you read every page. The **index** at the back takes you straight to the page. A database index does the same for a column.

```sql
-- Our list page always filters by user and sorts by newest first
CREATE INDEX tasks_user_created_idx
  ON tasks (user_id, created_at DESC);

-- Ask Postgres how it runs a query and how long it takes
EXPLAIN ANALYZE
SELECT id, title FROM tasks
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 20;
```

In the output, `Seq Scan` means Postgres read the whole table. `Index Scan` means it used an index.

:::tip
Primary keys and `UNIQUE` columns get an index automatically. Foreign keys do **not**. Index the columns you often use in `WHERE`, `JOIN` or `ORDER BY`, but not everything: each index makes writes a little slower.
:::

## Transactions

When you send money, two things happen: your balance goes down and your friend's goes up. If only the first one happens, money is lost. A **transaction** groups statements so that **all** of them succeed or **none** of them do.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;

COMMIT;      -- save both changes together
-- or ROLLBACK; to undo everything since BEGIN
```

The safety rules of a transaction are known as **ACID**: **A**tomic (all or nothing), **C**onsistent (constraints are never broken), **I**solated (transactions do not see each other's half done work) and **D**urable (after `COMMIT` the data survives a crash).

:::interview What is the difference between a primary key and a foreign key?
A primary key identifies one row inside its own table. It is unique and not null, and a table has only one. A foreign key is a column that stores the primary key of a row in another table, which creates a link between the two tables. The database refuses a foreign key value that does not exist in the other table, so you cannot have a task that belongs to a missing user.
:::

:::revise
- A table has typed columns. Constraints (`NOT NULL`, `UNIQUE`, `CHECK`, foreign keys) keep bad data out.
- A primary key identifies a row. A foreign key links to a row in another table.
- `JOIN` keeps matching rows only. `LEFT JOIN` keeps all rows of the left table.
- Indexes speed up reads on filtered and sorted columns and slow down writes a little.
- A transaction is all or nothing: `BEGIN`, then `COMMIT` or `ROLLBACK`.
- Always write the `WHERE` part of `UPDATE` and `DELETE`.
:::

# Talking to Postgres from Next.js

*One connection pool, safe parameters, SQL migrations and a small data layer.*

## Why this matters

Your Next.js server and your database are two separate programs. They need a phone line between them. That line is called a **connection**, and the library that opens it is called a **driver**.

## Which tool, and why

You can send plain SQL through a driver, or use an **ORM** (such as Drizzle or Prisma) where you write JavaScript objects and the library generates the SQL.

These notes use **`pg`**, the long-standing PostgreSQL driver for Node.js, with plain SQL. The reason is simple: interviews and real debugging need SQL. Once you know SQL, any ORM is easy to pick up later.

```bash
npm install pg
```

```bash
# .env.local  (never commit this file)
DATABASE_URL=postgres://postgres:secret@localhost:5432/postgres
```

## One pool for the whole app

Opening a connection is slow, like dialling a number each time you want to say one word. A **connection pool** keeps a few lines open and lends one to each query.

```js
// lib/db.js
import 'server-only'
import { Pool } from 'pg'

// In development, files reload often. Keeping the pool on globalThis
// stops every reload from opening a new set of connections.
const globalForDb = globalThis

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,                    // most connections this server opens
    idleTimeoutMillis: 30000,   // close a connection idle for 30 s
  })

if (process.env.NODE_ENV !== 'production') globalForDb.pgPool = pool

// Small helper: run one query, return only the rows
export async function query(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}
```

## Parameters, never string building

A **parameterized query** sends the SQL text and the values separately. In the text you write `$1`, `$2`. The values go in an array. Postgres treats them only as data, never as SQL.

```js
// lib/data/tasks.js
import 'server-only'
import { query } from '@/lib/db'

export async function getTasksForUser(userId) {
  return query(
    `SELECT id, title, done, created_at
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]                         // $1
  )
}

export async function getTaskById(id) {
  const rows = await query(
    'SELECT id, user_id, title, done FROM tasks WHERE id = $1',
    [id]
  )
  return rows[0] ?? null             // one row or null
}

export async function createTask(userId, title) {
  const rows = await query(
    `INSERT INTO tasks (user_id, title) VALUES ($1, $2)
     RETURNING id, title, done`,
    [userId, title]
  )
  return rows[0]
}
```

:::warn
Never build SQL with template strings such as `` `WHERE email = '${email}'` ``. A user can type `' OR '1'='1` and change the meaning of your query. This attack is called **SQL injection**. Always use `$1`, `$2` and the values array.
:::

A folder like `lib/data` is called a **data layer**. Pages and actions call these functions. They do not write SQL themselves.

:::note
The `pg` driver returns `BIGINT` and `COUNT(*)` values as strings, because they can be larger than a safe JavaScript number. That is why our tables use `INTEGER` ids and our counts are cast with `::int`.
:::

## Transactions in code

A transaction must run on **one** connection. So you borrow a client from the pool, use it for every statement and give it back at the end.

```js
// lib/db.js  (continued)
export async function withTransaction(work) {
  const client = await pool.connect()     // borrow one connection
  try {
    await client.query('BEGIN')
    const result = await work(client)     // run all statements on it
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')        // undo everything
    throw error
  } finally {
    client.release()                      // always give it back
  }
}
```

Inside `work` you call `client.query(...)` for each statement, for example to insert a user and their first task together. If any statement throws, nothing is saved.

## Migrations

Your table design will change: a new column this week, a new table next week. A **migration** is a small numbered SQL file that records one change. Run in order, the files rebuild the same database on every machine. Think of them as Git commits for your schema.

```text
db/migrations/
  001_users_and_tasks.sql     the CREATE TABLE statements from chapter 4
  002_task_index.sql          CREATE INDEX tasks_user_created_idx ...
  003_courses.sql             a new table added later
```

```js
// scripts/migrate.mjs
// Run: node --env-file=.env.local scripts/migrate.mjs
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(`CREATE TABLE IF NOT EXISTS migrations (
  name TEXT PRIMARY KEY, run_at TIMESTAMPTZ NOT NULL DEFAULT now())`)

const done = await client.query('SELECT name FROM migrations')
const applied = new Set(done.rows.map((row) => row.name))
const dir = path.join(process.cwd(), 'db/migrations')

for (const file of fs.readdirSync(dir).sort()) {
  if (applied.has(file)) continue               // already ran
  const sql = fs.readFileSync(path.join(dir, file), 'utf8')
  await client.query('BEGIN')
  try {
    await client.query(sql)                     // run the whole file
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [file])
    await client.query('COMMIT')
    console.log('applied', file)
  } catch (error) {
    await client.query('ROLLBACK')              // nothing is half applied
    throw error
  }
}
await client.end()
```

Never edit a migration that has already run somewhere else. Add a new file instead.

## Pooling on serverless hosts

On a normal server, one Node.js process lives for days and its pool of 10 connections is enough. On a **serverless** host, your code runs in many short-lived copies. If 200 copies each open their own pool, Postgres runs out of connections.

What to do:

- Use the **pooled connection string** that your database host gives you. It points to a pooler such as PgBouncer that sits in front of Postgres and shares a small number of real connections.
- Keep `max` small on serverless, for example 1 to 5 per copy.
- Use the direct (non pooled) connection string for running migrations.

:::interview Why do we need a connection pool?
Opening a database connection takes a network handshake and authentication, and Postgres can hold only a limited number of connections. A pool opens a few once and reuses them for many queries, which is faster and protects the database. In serverless setups an external pooler such as PgBouncer plays the same role across many app instances.
:::

:::revise
- A driver (`pg`) sends SQL to Postgres. An ORM generates that SQL for you.
- Create one `Pool` for the whole app and reuse it. Keep it on `globalThis` in development.
- Always pass values with `$1`, `$2` and an array. Never build SQL from user input.
- Keep SQL in a data layer (`lib/data`), marked with `server-only`.
- A transaction needs one client: `connect`, `BEGIN`, `COMMIT` or `ROLLBACK`, then `release`.
- Migrations are ordered SQL files. On serverless, connect through a pooler.
:::

# Fetching data and streaming with Suspense

*Read data in Server Components and show the page piece by piece instead of all at once.*

## Why this matters

In a restaurant, the waiter brings water and starters first. You do not sit at an empty table until the slowest dish is ready. A web page should behave the same way: show what is ready now, and bring the slow parts when they arrive. This is called **streaming**.

## Fetch where you render

A Server Component can be an `async` function and `await` the database directly. There is no `useEffect`, no loading state and no API endpoint in between.

```jsx
// app/tasks/task-list.js   async Server Component
import { getTasksForUser } from '@/lib/data/tasks'

export default async function TaskList({ userId }) {
  const tasks = await getTasksForUser(userId)

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.done ? 'Done: ' : 'To do: '}
          {task.title}
        </li>
      ))}
    </ul>
  )
}
```

For an outside API, `await fetch(url)` works the same way. A `fetch` call is **not cached** by default. Chapter 7 shows how to cache.

## Suspense: show the fast parts first

`<Suspense>` is a React component. It shows a **fallback** (a placeholder) while the component inside it is still waiting for data. Everything outside the boundary is sent to the browser immediately.

```jsx
// app/tasks/page.js
import { Suspense } from 'react'
import TaskList from './task-list'
import TaskStats from './task-stats'

export default function TasksPage() {
  return (
    <>
      <h1>My tasks</h1>      {/* sent at once */}

      <Suspense fallback={<p>Loading stats...</p>}>
        <TaskStats />        {/* streams in when its query finishes */}
      </Suspense>

      <Suspense fallback={<p>Loading tasks...</p>}>
        <TaskList userId={1} />   {/* fixed id until chapter 10 */}
      </Suspense>
    </>
  )
}
```

Use `loading.js` when one loading screen for the whole page is enough. Use `<Suspense>` when parts of the page load at different speeds.

`loading.js` is a shortcut: Next.js wraps your `page.js` in a Suspense boundary for you. It does not cover the `layout.js` of the same folder.

## Sequential and parallel requests

Two `await` lines one after another run **one by one**. If the second does not need the result of the first, start both and wait together.

```jsx
// Slow: 300 ms + 300 ms = 600 ms
const user = await getUser(userId)
const tasks = await getTasksForUser(userId)

// Fast: both start now, total is about 300 ms
const [user2, tasks2] = await Promise.all([
  getUser(userId),
  getTasksForUser(userId),
])
```

:::warn
A chain of awaits that do not depend on each other is called a **waterfall**, a very common reason for slow pages. Use `Promise.all`, or give each part its own component and Suspense boundary.
:::

## Ask once per request with React cache

Often the navbar and the page both need the current user. React's `cache` function remembers a result **for the length of one request**, so the query runs once.

```js
// lib/data/users.js
import 'server-only'
import { cache } from 'react'
import { query } from '@/lib/db'

// Many components can call getUser(1) in one request.
// The query runs only once. The next request starts fresh.
export const getUser = cache(async (id) => {
  const rows = await query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  )
  return rows[0] ?? null
})
```

:::interview How is fetching in a Server Component different from useEffect?
With `useEffect` the browser downloads JavaScript, renders an empty state, then sends a second request, so the user waits twice and you must build an API endpoint. A Server Component fetches on the server, close to the database, while the HTML is produced. Secrets stay on the server, less JavaScript is shipped, and Suspense streams the slow parts.
:::

:::revise
- Server Components can be `async` and can `await` the database or `fetch` directly.
- `<Suspense>` shows a fallback for the slow part and lets the rest of the page arrive first.
- Use `Promise.all` for requests that do not depend on each other.
- React `cache` shares one result between components during a single request.
:::

# Caching and revalidation in Next.js 16

*Remember results so the next visitor does not wait, and refresh them at the right moment.*

## Why this matters

A chai stall does not boil fresh tea for every cup. It makes a kettle and pours from it. After some time the tea is old, so the seller makes a new kettle. **Caching** is the kettle: store a result once and reuse it. **Revalidation** is making a new kettle when the old one is stale.

## Turn on Cache Components

Next.js 16 has a caching model called **Cache Components**. You switch it on in the config file. These notes assume it is on. Older projects without it cache with `fetch(url, { cache: 'force-cache' })` and `unstable_cache`.

```js
// next.config.mjs
const nextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

With this flag the rule is easy to remember: **nothing is cached unless you ask for it**. For every piece of a page, you choose one of three kinds.

| Kind | Example | What you do |
|---|---|---|
| Static | A heading, a footer | Nothing. It is prerendered automatically |
| Cached | A course list from the database | Add `'use cache'` |
| Fresh per request | Data that reads cookies, or must be live | Wrap in `<Suspense>` |

At build time Next.js renders the static and cached parts into a **static shell**, ready HTML that is sent instantly. The fresh parts stream in at request time. This mix is called **Partial Prerendering**.

:::warn
With Cache Components on, a component that reads uncached data, `cookies()`, `headers()`, `params` or `searchParams` must sit inside a `<Suspense>` boundary (or a `loading.js`), or be cached. If it does not, Next.js shows a "blocking route" error that tells you which fix to apply.
:::

## The use cache directive

Put `'use cache'` as the first line inside an async function or component. Next.js stores the return value. The function's arguments become the **cache key**, so different arguments give separate entries.

```js
// lib/data/courses.js
import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { query } from '@/lib/db'

export async function getPublishedCourses() {
  'use cache'
  cacheLife('hours')       // how long the result stays good
  cacheTag('courses')      // a label, so we can refresh it later

  return query(
    `SELECT id, slug, title FROM courses
     WHERE published = true ORDER BY title`
  )
}
```

## cacheLife: time-based refresh

`cacheLife` takes a profile name. Each profile has three numbers.

| Profile | `stale` | `revalidate` | `expire` |
|---|---|---|---|
| `minutes` | 5 min | 1 min | 1 hour |
| `hours` | 5 min | 1 hour | 1 day |
| `max` | 5 min | 30 days | 1 year |

**stale** is how long the browser may reuse the data without asking the server. After **revalidate**, the next request still gets the old data quickly while a fresh copy is prepared in the background. After **expire** with no requests, the next visitor waits for fresh data. Without `cacheLife`, the `default` profile applies (revalidate after 15 minutes).

## On-demand refresh after a change

When an admin edits a course, they expect to see the change now. For that you refresh the cache **on demand**, usually inside a Server Action (chapter 8).

| Function | What it does | Use it when |
|---|---|---|
| `updateTag('courses')` | Expires the tag now. The next read is fresh | The user must see their own change. Server Actions only |
| `revalidateTag('courses', 'max')` | Marks the tag stale. Old data is served while new data loads. The second argument is required in Next.js 16 | A short delay is fine, for example a webhook |
| `revalidatePath('/courses')` | Refreshes everything for one URL path | You do not have tags for that page |
| `refresh()` | Re-renders the current route only | The page shows uncached data that just changed |

```js
// app/admin/courses/actions.js
'use server'

import { updateTag } from 'next/cache'
import { requireRole } from '@/lib/dal'      // chapter 10
import { query } from '@/lib/db'

export async function publishCourse(courseId) {
  await requireRole('admin')

  await query('UPDATE courses SET published = true WHERE id = $1', [
    courseId,
  ])

  // Everything tagged 'courses' is expired. The admin sees fresh data.
  updateTag('courses')
}
```

## Cached and personal data on one page

A cached function cannot read `cookies()` or `headers()`, because the cached result is shared. Read the cookie outside, in a component behind Suspense, and pass plain values in as arguments if needed.

```jsx
// app/courses/page.js
import { Suspense } from 'react'
import { getPublishedCourses } from '@/lib/data/courses'
import { getCurrentUser } from '@/lib/dal'

export default function CoursesPage() {
  return (
    <>
      <h1>Courses</h1>                       {/* static */}
      <CourseList />                         {/* cached, in the shell */}
      <Suspense fallback={<p>Checking login...</p>}>
        <Greeting />                         {/* fresh, streams in */}
      </Suspense>
    </>
  )
}

async function CourseList() {
  const courses = await getPublishedCourses()    // 'use cache' inside
  return <p>{courses.length} courses</p>         // or render a list
}

async function Greeting() {
  const user = await getCurrentUser()            // reads a cookie
  return <p>{user ? `Welcome back, ${user.name}` : 'Please log in'}</p>
}
```

Never cache one user's private data under a key shared by all users. Either leave personal data uncached, or pass the user id as an argument so it becomes part of the cache key.

:::interview When would you use updateTag and when revalidateTag?
Both refresh cached data by tag. `updateTag` works only in Server Actions and expires the entry at once, so a user sees their own change in the same response. `revalidateTag(tag, 'max')` uses stale-while-revalidate: visitors get the old value while a new one is built in the background. I use it where a short delay is fine, or in a Route Handler called by a webhook.
:::

:::revise
- With `cacheComponents: true`, nothing is cached unless you add `'use cache'`.
- Static and cached parts form the static shell. Fresh parts stream inside `<Suspense>`.
- `cacheLife('hours')` sets how long a result is good. `cacheTag('name')` labels it.
- `updateTag` refreshes now (Server Actions only). `revalidateTag(tag, 'max')` refreshes in the background.
- A cached function cannot read cookies. Pass values in as arguments, and never share private data.
:::

# Server Actions and forms

*Change data by calling a server function straight from a form, with validation and instant feedback.*

## Why this matters

At a bank you fill a slip and hand it to the clerk. The clerk checks it, updates the ledger and tells you the result. You never touch the ledger yourself. A **Server Function** is that clerk: an async function that runs on the server and can be called from the browser. When it is used to submit a form or change data, it is called a **Server Action**.

You mark it with `'use server'`. Next.js creates a hidden `POST` endpoint for it, so you write no `fetch` and no API route.

## The four steps of every action

First a small validation file. **zod** is a library that checks the shape of data.

```js
// lib/validation.js
import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Too long'),
})

export const idSchema = z.coerce.number().int().positive()

// Turn zod issues into { fieldName: 'first message' }
export function fieldErrors(zodError) {
  const errors = {}
  for (const issue of zodError.issues) {
    const field = issue.path[0] ?? 'form'
    if (!errors[field]) errors[field] = issue.message
  }
  return errors
}
```

```js
// app/tasks/actions.js
'use server'   // every export of this file is a Server Function

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/dal'             // chapter 10
import { createTask } from '@/lib/data/tasks'
import { taskSchema, fieldErrors } from '@/lib/validation'

export async function addTask(prevState, formData) {
  const user = await requireUser()                  // 1. who is asking?

  const parsed = taskSchema.safeParse({             // 2. is the input valid?
    title: formData.get('title'),
  })
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) }    // tell the form
  }

  await createTask(user.id, parsed.data.title)      // 3. change the data
  revalidatePath('/tasks')                          // 4. refresh the page
  return { errors: {} }
}
```

:::warn
A Server Action is a public `POST` endpoint. Anyone can call it with any data, without your form. Every action must check **who** the user is and **validate** every input, even hidden fields and ids.
:::

## The form: useActionState

`useActionState` is a React 19 hook that connects a form to an action. It gives you the last returned value (`state`), a function for the form (`formAction`) and a `pending` flag that is true while the server works. Because the hook passes the previous state first, the action signature is `(prevState, formData)`.

```jsx
// app/tasks/add-task-form.js
'use client'

import { useActionState } from 'react'
import { addTask } from './actions'

export default function AddTaskForm() {
  const [state, formAction, pending] = useActionState(addTask, {
    errors: {},
  })

  return (
    <form action={formAction}>
      <label htmlFor="title">New task</label>
      <input id="title" name="title" required maxLength={200} />
      {state.errors.title && <p role="alert">{state.errors.title}</p>}
      <button disabled={pending}>{pending ? 'Adding...' : 'Add task'}</button>
    </form>
  )
}
```

The `name` of each input becomes the key in `FormData`. The `required` attribute is only quick feedback. The real check is the zod schema on the server.

A reusable submit button can read the state of its parent form with `useFormStatus` from `react-dom`: `const { pending } = useFormStatus()`. That component must be rendered **inside** the `<form>`.

## Extra arguments with bind

A delete button needs to say **which** task. Use `bind` to fix the first argument. This form works in a Server Component, even before JavaScript has loaded.

```jsx
// inside a Server Component that renders one task
import { deleteTask } from './actions'

<form action={deleteTask.bind(null, task.id)}>
  <button>Delete</button>
</form>

// actions.js: the bound value arrives first, then the FormData
// export async function deleteTask(taskId, formData) { ... }
```

## Optimistic UI

When you tick a checkbox, waiting for the server feels slow. **Optimistic UI** shows the expected result at once and corrects it if the server disagrees. React's `useOptimistic` hook does this.

```jsx
// app/tasks/task-checkbox.js
'use client'

import { startTransition, useOptimistic } from 'react'
import { toggleTask } from './actions'

export default function TaskCheckbox({ task }) {
  // Starts as the real value. Can be overridden while an action runs.
  const [done, setDone] = useOptimistic(task.done)

  function handleChange() {
    startTransition(async () => {
      setDone(!done)               // show the new state immediately
      await toggleTask(task.id)    // then tell the server
    })                             // on failure React shows the real value
  }

  return <input type="checkbox" checked={done} onChange={handleChange} />
}
```

Three rules save a lot of debugging. A `'use server'` file may export only async functions, so schemas live in another file. Return expected errors and throw unexpected ones. Call `redirect()` last and outside `try`/`catch`, because it works by throwing.

:::interview How is a Server Action different from an API route?
Both run on the server. A Server Action is a function you pass to a form or call from a Client Component. Next.js creates the `POST` endpoint and can return the updated UI in the same response. A Route Handler is a URL you design yourself that returns JSON for any client. I use actions for my own UI, and Route Handlers for public APIs, mobile apps and webhooks.
:::

:::revise
- `'use server'` makes an async function callable from the browser through a hidden `POST` request.
- Every action: authenticate, validate with zod, change data, refresh the cache.
- `useActionState` gives `[state, formAction, pending]`. The action receives `(prevState, formData)`.
- `useFormStatus` reads the pending state inside a form. `bind` passes extra arguments. `useOptimistic` shows the result early.
:::

# Route Handlers and a small REST API

*Build JSON endpoints for clients that are not your own React pages.*

## Why this matters

Your pages are the dine-in area of the restaurant. Customers who order through a delivery app do not need the dining hall. They need a **counter** that hands out food in a box. A **Route Handler** is that counter: a URL that returns data (usually JSON) instead of a page.

| Use a Server Action when | Use a Route Handler when |
|---|---|
| Your own form or button changes data | A mobile app or another service calls you |
| You want the UI refreshed in one step | A payment or CMS service sends a webhook |

**REST** is a common style for such APIs: the URL names a thing (`/api/tasks/5`) and the HTTP method says what to do with it.

## A collection: list and create

A Route Handler lives in a file named `route.js`. You export one function per HTTP method. Each receives a web `Request` and returns a `Response`.

```js
// app/api/tasks/route.js
import { getCurrentUser } from '@/lib/dal'
import { createTask, getTasksForUser } from '@/lib/data/tasks'
import { fieldErrors, taskSchema } from '@/lib/validation'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Login needed' }, { status: 401 })

  const tasks = await getTasksForUser(user.id)
  return Response.json({ data: tasks })                 // 200 by default
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Login needed' }, { status: 401 })

  const body = await request.json().catch(() => null)   // bad JSON -> null
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error)
    return Response.json({ errors }, { status: 422 })
  }

  const task = await createTask(user.id, parsed.data.title)
  return Response.json({ data: task }, { status: 201 })  // 201 Created
}
```

## One item: update and delete

In a dynamic folder the second argument holds `params`. As in pages, it is a Promise.

```js
// app/api/tasks/[id]/route.js
import { getCurrentUser } from '@/lib/dal'
import { deleteTask } from '@/lib/data/tasks'
import { idSchema } from '@/lib/validation'

export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Login needed' }, { status: 401 })

  const { id } = await params
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) {
    return Response.json({ error: 'Bad id' }, { status: 400 })
  }

  const deleted = await deleteTask(parsedId.data, user.id)
  if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 })

  return new Response(null, { status: 204 })    // success, empty body
}
```

A `PATCH` handler follows the same steps and returns the updated row. Clients call these URLs with `fetch` and check `response.ok` before reading the JSON.

:::warn
Do not `fetch` your own Route Handler from a Server Component. That is an extra network trip from the server to itself. Call the data function directly.
:::

A `route.js` file cannot share a folder with `page.js`. In a webhook handler, verify the sender first, then call `revalidateTag('courses', 'max')`.

:::interview Which status code do you return for a validation error, and why not 200 with an error message?
`400` or `422`, with a body that lists the field errors. Status codes are part of the contract: clients, logs and monitoring tools use them to tell success from failure without reading the body. `401` means not logged in, `403` not allowed, `404` not found, and `500` is kept for server bugs.
:::

:::revise
- `route.js` exports functions named after HTTP methods and returns a `Response`.
- `Response.json(data, { status })` sends JSON. `204` means success with no body.
- `params` is a Promise here too. Check the user and validate input in every handler.
- Use Route Handlers for outside callers. Server Components call the data layer directly.
:::

# Authentication and authorization

*Know who the user is, remember it safely in a cookie, and check it before every sensitive step.*

## Why this matters

At an office gate you show your ID once and get a visitor badge. After that, guards look only at the badge. But the badge does not open every room. **Authentication** is proving who you are (the ID check). A **session** is the badge that remembers it. **Authorization** is deciding which rooms you may enter.

## Passwords

Never store a password. Store a **hash**: a one-way scramble that cannot be turned back. A password hash such as bcrypt is slow on purpose and adds a random **salt**, so equal passwords get different hashes.

We use two small libraries: `bcryptjs` for hashing and `jose` for signed tokens (`npm install bcryptjs jose`). Create a long random secret with `openssl rand -base64 32` and save it as `SESSION_SECRET` in `.env.local`.

## Where does the session live?

| | Stateless (signed token) | Database session |
|---|---|---|
| Cookie holds | A signed token with the user id | A random session id |
| Server lookup | None, just verify the signature | One row in a `sessions` table |
| Log out everywhere | Hard, the token is valid until it expires | Easy, delete the rows |

A **JWT** (JSON Web Token) is a signed token. Anyone can read its content, but nobody can change it without the secret. We use a JWT inside an **httpOnly cookie**, a cookie that JavaScript in the browser cannot read.

```js
// lib/session.js
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const key = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload                 // { userId, iat, exp }
  } catch {
    return null                    // missing, changed or expired
  }
}
```

```js
// lib/session.js  (continued)
export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,                                  // hidden from JS
    secure: process.env.NODE_ENV === 'production',   // HTTPS only
    sameSite: 'lax',                                 // limits cross-site use
    maxAge: 60 * 60 * 24 * 7,                        // 7 days, in seconds
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

Do not keep the token in `localStorage`, where any script on the page can read it. And keep the token small: only an id, never an email or a password.

## Sign up, log in, log out

Add the signup rules to `lib/validation.js`, then write the three actions.

```js
export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
})
```

```js
// app/(auth)/actions.js
'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { fieldErrors, signupSchema } from '@/lib/validation'
```

```js
// same file
export async function signup(prevState, formData) {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const { name, email, password } = parsed.data
  const hash = await bcrypt.hash(password, 10)     // 10 = cost factor
  let rows
  try {
    rows = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id`,
      [name, email, hash]
    )
  } catch (error) {
    // 23505 is the Postgres code for a UNIQUE violation
    if (error.code !== '23505') throw error
    return { errors: { email: 'This email is already registered' } }
  }
  await createSession(rows[0].id)
  redirect('/tasks')
}
```

```js
// same file
export async function login(prevState, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  const rows = await query(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [email]
  )
  const user = rows[0]
  const ok = user ? await bcrypt.compare(password, user.password_hash) : false

  // One message for both cases, so nobody learns which emails exist
  if (!ok) return { message: 'Wrong email or password' }

  await createSession(user.id)
  redirect('/tasks')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
```

## The Data Access Layer

Put all "who is the user" logic in one file, often called a **Data Access Layer** (DAL). Pages, actions and Route Handlers all ask this file. React `cache` runs the lookup once per request.

```js
// lib/dal.js
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/session'

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get('session')?.value
  const session = token ? await verifyToken(token) : null
  if (!session?.userId) return null

  // Fresh from the database: a deleted user or a changed role counts now
  const rows = await query(
    'SELECT id, name, role FROM users WHERE id = $1',
    [session.userId]
  )
  return rows[0] ?? null
})
```

```js
// lib/dal.js  (continued)
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(role) {
  const user = await requireUser()
  if (user.role !== role) throw new Error('Forbidden')
  return user
}
```

## A quick gate in proxy.js

The proxy can send visitors without a valid cookie to `/login` before any page renders. This is an **optimistic check**: fast, cookie only, no database query.

```js
// proxy.js
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/session'

export async function proxy(request) {
  const token = request.cookies.get('session')?.value
  const session = token ? await verifyToken(token) : null

  if (!session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/tasks/:path*', '/admin/:path*'] }
```

:::warn
The proxy is a convenience, not your security. Always call `requireUser()` or `requireRole()` close to the data, and filter queries by `user_id`. A check in a layout is also not enough, because layouts do not re-render on every navigation.
:::

:::interview What is the difference between authentication and authorization?
Authentication answers "who are you?", for example by checking an email and password and then issuing a session. Authorization answers "are you allowed to do this?", for example only the owner may delete a task. Authentication happens at login and is re-verified from the cookie on each request. Authorization is checked for every action and every piece of data.
:::

:::revise
- Authentication is who you are. Authorization is what you may do.
- Store a slow, salted hash (bcrypt), never the password.
- Keep the session in an httpOnly, secure, sameSite cookie. Put only an id in the token.
- One DAL file answers "who is the user". Use it in pages, actions and Route Handlers.
- `proxy.js` gives a fast first gate. Real checks sit next to the data.
:::

# Mini project: a task manager

*Schema, list page, create, toggle and delete, built from the pieces of the earlier chapters.*

## Why this matters

Reading about gears is not the same as riding the cycle. This chapter joins every part into one small app where each user manages their own tasks.

```text
app/
  layout.js                 nav with the user's name
  (auth)/login/page.js      forms that use the auth actions
  (auth)/signup/page.js
  (auth)/actions.js         signup, login, logout      (chapter 10)
  tasks/
    page.js                 list + filter + add form
    actions.js              addTask, toggleTask, deleteTask
    add-task-form.js        client, useActionState     (chapter 8)
    task-checkbox.js        client, useOptimistic      (chapter 8)
lib/
  db.js  session.js  dal.js  validation.js
  data/tasks.js             all SQL for tasks
db/migrations/              001_users_and_tasks.sql ...
proxy.js                    redirects visitors without a session
```

## Step 1: the data layer

The schema is the `users` and `tasks` tables from chapter 4. Every query takes the `userId`, so one user can never touch another user's rows.

```js
// lib/data/tasks.js  (added to the functions from chapter 5)
export async function toggleTaskDone(id, userId) {
  const rows = await query(
    `UPDATE tasks SET done = NOT done
     WHERE id = $1 AND user_id = $2      -- ownership check in SQL
     RETURNING id`,
    [id, userId]
  )
  return rows.length === 1               // false: not found or not yours
}

export async function deleteTask(id, userId) {
  const rows = await query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  )
  return rows.length === 1
}
```

## Step 2: the actions

`addTask` is the function from chapter 8. The other two follow the same four steps.

```js
// app/tasks/actions.js  (continued)
import { deleteTask as removeTask, toggleTaskDone } from '@/lib/data/tasks'
import { idSchema } from '@/lib/validation'

export async function toggleTask(taskId) {
  const user = await requireUser()
  const id = idSchema.parse(taskId)       // throws on a bad id
  await toggleTaskDone(id, user.id)
  revalidatePath('/tasks')
}

export async function deleteTask(taskId, formData) {
  const user = await requireUser()
  const id = idSchema.parse(taskId)
  await removeTask(id, user.id)
  revalidatePath('/tasks')
}
```

The task list is personal and not cached, so `revalidatePath('/tasks')` is enough: Next.js renders the page again and sends the new list in the same response. If you later cache the list with `'use cache'` and a tag such as `tasks-${userId}`, switch to `updateTag`.

## Step 3: the page

The page itself is not `async`. The heading and the form are static and appear at once. The list reads the cookie and the database, so it sits behind `<Suspense>`.

```jsx
// app/tasks/page.js
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/dal'
import { getTasksForUser } from '@/lib/data/tasks'
import { deleteTask } from './actions'
import AddTaskForm from './add-task-form'
import TaskCheckbox from './task-checkbox'

export const metadata = { title: 'My tasks' }

export default function TasksPage({ searchParams }) {
  return (
    <>
      <h1>My tasks</h1>
      <AddTaskForm />
      <p>
        <Link href="/tasks">All</Link>{' '}
        <Link href="/tasks?filter=open">Open</Link>{' '}
        <Link href="/tasks?filter=done">Done</Link>
      </p>
      <Suspense fallback={<p>Loading tasks...</p>}>
        <TaskList searchParams={searchParams} />
      </Suspense>
    </>
  )
}
```

```jsx
// same file
async function TaskList({ searchParams }) {
  const user = await requireUser()             // redirects if logged out
  const { filter } = await searchParams        // 'open', 'done' or undefined
  const tasks = await getTasksForUser(user.id)
  const visible = tasks.filter((task) =>
    filter === 'done' ? task.done : filter === 'open' ? !task.done : true
  )

  if (visible.length === 0) return <p>Nothing here yet.</p>

  return (
    <ul>
      {visible.map((task) => (
        <li key={task.id}>
          <TaskCheckbox task={{ id: task.id, done: task.done }} />
          {task.title}
          <form action={deleteTask.bind(null, task.id)}>
            <button>Delete</button>
          </form>
        </li>
      ))}
    </ul>
  )
}
```

The filter lives in the URL (`?filter=done`), so the link can be shared. `TaskCheckbox` receives only `id` and `done`, not the whole row.

The navbar shows the user's name in the same way: a small async `UserMenu` component calls `getCurrentUser()`, and the root layout wraps only that component in `<Suspense>`.

## What happens when you tick a task

:::flow Toggle a task
Checkbox | optimistic tick shows
toggleTask | POST to the server
requireUser | cookie verified
UPDATE | only if user_id matches
revalidatePath | new list in the response
:::

:::warn
The most common bug in a project like this is trusting the id. `DELETE FROM tasks WHERE id = $1` lets any logged-in user delete anyone's task by changing a number. Always add `AND user_id = $2` with the id from the **session**, never from the form.
:::

:::interview How do you make sure a user can only change their own data?
I take the user id from the verified session on the server, never from the request body. Every query that reads or changes a row includes `user_id = $n` in the `WHERE` clause, so a foreign id simply matches zero rows. I keep these queries in one data layer so the rule cannot be forgotten, and I return 404 so the caller cannot learn which ids exist.
:::

:::revise
- Data layer functions take `userId` and filter by it in SQL.
- Each action: `requireUser`, validate, call the data layer, `revalidatePath`.
- The page shell is static. The personal list streams inside `<Suspense>`.
- Client Components are small leaves: the add form and the checkbox.
- Filters go in `searchParams`. Client props carry only the needed fields.
:::

# Errors, validation and security basics

*Plan for wrong input, broken requests and people who try to misuse your app.*

## Why this matters

A lift has a weight limit, a door sensor and an alarm button. Most days nobody needs them. A serious app is built the same way: it expects wrong input, failures and misuse.

## Two kinds of errors

| | Expected error | Unexpected error |
|---|---|---|
| Example | Empty title, wrong password, email taken | Database is down, a bug |
| What to do | **Return** it as a value and show it near the form | **Throw** it and let `error.js` show a fallback |
| User sees | A clear message they can act on | "Something went wrong" and a retry button |

Log unexpected errors on the server, and never show a stack trace or SQL text to users.

## Validate at every door

Data enters your server through `FormData`, JSON bodies, `params`, `searchParams`, cookies and headers. Treat all of it as untrusted. Environment variables deserve a check as well, so that a missing value fails at startup and not in front of a user.

```js
// lib/env.js
import 'server-only'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, 'Use at least 32 characters'),
})

// Throws a readable error at startup if something is missing
export const env = schema.parse(process.env)
```

Local secrets live in `.env.local`, which is never committed to Git. Production secrets are set in the host's dashboard. A variable with the `NEXT_PUBLIC_` prefix is copied into the browser JavaScript at build time, so it must never hold a secret.

## The common attacks

| Attack | What it is | Your defence |
|---|---|---|
| SQL injection | Input changes the meaning of a query | Parameters (`$1`), never string building |
| XSS | An attacker's script runs on your page | React escapes text. Avoid `dangerouslySetInnerHTML` |
| CSRF | Another site makes the user's browser send a request | `sameSite` cookies, no changes on `GET` |
| Broken access control | A user reads or edits someone else's row | Session user id in every query |
| Data leak | Too many fields sent to the browser | Select only needed columns |

```js
// SQL injection. Input:  x' OR '1'='1
// BAD: the input becomes part of the SQL and matches every user
await pool.query(`SELECT * FROM users WHERE email = '${email}'`)

// GOOD: the input stays data
await pool.query('SELECT id, name FROM users WHERE email = $1', [email])
```

**XSS** (cross-site scripting): React turns text into safe characters before it shows it, so `{task.title}` is safe even if the title contains a `<script>` tag. The danger starts when you insert raw HTML, so avoid `dangerouslySetInnerHTML` with content that users wrote.

**CSRF** (cross-site request forgery): Server Actions accept only `POST`, and Next.js rejects an action whose `Origin` header does not match the host. Together with a `sameSite: 'lax'` cookie this covers the usual cases. In your own Route Handlers, never change data in a `GET`.

:::warn
Do not return whole database rows to the browser. `SELECT *` on `users` includes `password_hash`. If that object is passed to a Client Component or returned from an action, it travels to the browser. Name the columns you need in every query.
:::

:::tip
Add **rate limiting** to the login action: only a few attempts per minute for one IP address or account. This slows down password guessing.
:::

:::interview How do you prevent SQL injection?
I never join user input into a SQL string. I use parameterized queries, where the SQL text contains placeholders such as `$1` and the values are sent separately, so the database treats them only as data. If a table or column name must be dynamic, I pick it from a fixed allow-list in code. I also validate input with a schema.
:::

:::revise
- Return expected errors as values. Throw unexpected ones to `error.js`.
- Validate every input on the server: forms, JSON, params, search params, env.
- SQL injection is stopped by parameters. XSS is stopped by React escaping and no raw HTML.
- Server Actions check the `Origin`. Keep cookies `httpOnly` and `sameSite`.
- Only `NEXT_PUBLIC_` variables reach the browser. Secrets never get that prefix.
- Select only the columns you need. Never send whole rows to the client.
:::

# Testing and code quality

*Small automatic checks that tell you something broke before your users do.*

## Why this matters

A pilot runs a checklist before every flight, even after thousands of flights. Tests are your checklist. They catch the mistake you made at midnight.

| Kind | Checks | Tool | Speed |
|---|---|---|---|
| Unit | One function alone | Vitest | Very fast |
| Integration | Several parts together, such as the data layer and a test database | Vitest | Medium |
| End-to-end (E2E) | The real app in a real browser | Playwright | Slower |

Write many unit tests and a few E2E tests for the flows that must never break.

## Unit tests with Vitest

Pure logic such as a validation schema is the easiest thing to test. Install Vitest with `npm install -D vitest` and add `"test": "vitest"` to the scripts.

```js
// lib/validation.test.js
import { expect, test } from 'vitest'
import { fieldErrors, taskSchema } from './validation'

test('a normal title is accepted and trimmed', () => {
  const result = taskSchema.safeParse({ title: '  Buy milk  ' })
  expect(result.success).toBe(true)
  expect(result.data.title).toBe('Buy milk')
})

test('an empty title gives a clear message', () => {
  const result = taskSchema.safeParse({ title: '   ' })
  expect(result.success).toBe(false)
  expect(fieldErrors(result.error)).toEqual({ title: 'Title is required' })
})
```

:::warn
Unit test tools do not fully support `async` Server Components yet, and the Next.js docs recommend E2E tests for them. So keep logic in plain functions (validation, data layer) that are easy to unit test, and cover pages with Playwright.
:::

## End-to-end tests with Playwright

Playwright opens a real browser and clicks through your app like a user. Set it up with `npm init playwright@latest`. In `playwright.config.js`, set `use.baseURL` to `http://localhost:3000` and let the `webServer` option run `npm run build && npm run start`, so the tests hit the real production build.

```js
// e2e/tasks.spec.js
import { expect, test } from '@playwright/test'

test('a user can log in and add a task', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('correct-horse-battery')
  await page.getByRole('button', { name: 'Log in' }).click()

  await page.getByLabel('New task').fill('Write an E2E test')
  await page.getByRole('button', { name: 'Add task' }).click()

  await expect(page.getByText('Write an E2E test')).toBeVisible()
})
```

Run E2E tests against a **separate test database** filled with known data, never against production. For code quality, **ESLint** finds likely bugs and **Prettier** formats code the same way for everyone. A CI service such as GitHub Actions can run `npx eslint .`, `npx vitest run` and `npm run build` on every push, so broken code is noticed at once.

:::interview What would you test first in a small full stack app?
The parts where a mistake costs the most. First, unit tests for validation and business rules, because they are cheap. Second, the data layer's access rules, for example that user A cannot delete user B's task. Third, one or two E2E tests for the main flow, all run in CI.
:::

:::revise
- Unit tests check one function, E2E tests check the real app in a browser.
- Keep logic in plain functions so it can be unit tested with Vitest.
- Use Playwright for pages with async Server Components and for full user flows.
- Tests use their own database. CI runs lint, tests and build on every push.
:::

# Deployment and performance

*Put the app on the internet, keep its secrets safe and keep it fast.*

## Why this matters

A dish that is perfect in your kitchen still has to reach the customer hot. **Deployment** means running your app on a computer that is always online, with a real database and real secrets.

## What the build produces

```bash
npm run build    # compiles the app and prerenders static and cached parts
npm run start    # starts the production server (default port 3000)
```

`next build` creates the `.next` folder. During the build, Next.js renders the static shells of your routes. If a prerendered part calls a cached database function, the build machine needs a working `DATABASE_URL` too.

## Where to host

| Option | What you manage | Notes |
|---|---|---|
| Platform with a Next.js adapter (for example Vercel) | Almost nothing | Connect the Git repo, set env vars |
| Node.js server on a VPS or a platform like Railway or Render | The process | `next build`, then `next start`. All features work |
| Docker container | The image | Runs anywhere containers run. All features work |
| Static export | Only files | No server features: no actions, no cookies |

For Docker, the `standalone` output copies only the files the server needs into `.next/standalone`. Add `output: 'standalone'` to `next.config.mjs`. The Docker image then needs only that folder, plus `.next/static` and `public`, and starts with `node server.js`.

## The database in production

Use a managed PostgreSQL service (for example Neon, Supabase, AWS RDS or Railway) that handles backups and updates.

- Keep the database in the **same region** as the app. Distance adds delay to every query.
- Use the **pooled** connection string for the app, and require SSL.
- Run migrations as a deploy step **before** the new code starts.
- Turn on automatic backups and test a restore.

:::flow A safe deploy
Push | to the main branch
CI | lint, test, build
Migrate | run new SQL files
Release | start the new version
Check | logs and a smoke test
:::

:::warn
Three common mistakes break deploys. One: a secret is missing on the host, because `.env.local` is not uploaded. Two: a secret was given the `NEXT_PUBLIC_` prefix and is now public. Three: a `NEXT_PUBLIC_` value was changed on the host without a rebuild. These values are fixed at build time.
:::

## Performance checklist

| Area | Do this |
|---|---|
| Rendering | Keep components on the server. Make client parts small |
| Waiting | Stream slow parts with `<Suspense>`. Avoid waterfalls with `Promise.all` |
| Caching | `'use cache'` for shared data that changes rarely |
| Database | Index filtered columns, select only needed columns, use `LIMIT` |
| Images and fonts | `next/image` and `next/font` size and load them well |
| Navigation | Use `<Link>` so pages are prefetched |

One database habit matters more than the rest: avoid the **N+1 problem**. That is one query for a list, then one more query for each item.

Do not loop over users and query the tasks of each one. Ask once:

```sql
-- One query instead of one per user
SELECT u.id, u.name, COUNT(t.id)::int AS task_count
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id;
```

Measure before and after with Lighthouse in Chrome and with `EXPLAIN ANALYZE` in Postgres. Do not guess.

:::interview Your page is slow in production. How do you find the cause?
I measure first. In the browser Network tab I check whether the delay is in the server response or in downloading JavaScript and images. If the server is slow, I look for sequential awaits, N+1 queries and missing indexes, and run `EXPLAIN ANALYZE`. Then I fix the largest cost: add an index, combine queries, cache shared data, or stream the slow part with Suspense. If the client is slow, I move code back to Server Components and optimise images.
:::

:::revise
- `next build` compiles and prerenders. `next start` runs the server.
- Host on an adapter platform, a Node.js server or Docker (`output: 'standalone'`).
- Set secrets on the host. `NEXT_PUBLIC_` values are public and fixed at build time.
- Use managed Postgres in the same region, a pooled connection and backups.
- Run migrations before the new version starts.
- Speed comes from server rendering, streaming, caching, indexes and no N+1 queries.
:::

# Interview questions and your project roadmap

*The questions you will be asked, with model answers, and a plan for building your own app.*

## Why this matters

Reading notes is like watching cricket on TV. You only learn to bat by holding the bat. Use the first half of this chapter to check your understanding and the second half to build something of your own.

## Mixed interview questions

:::interview What are React Server Components, and what problem do they solve?
They are components that run only on the server and send their rendered output to the browser, not their code. They can read the database and use secrets directly. This removes the "fetch after load" step, keeps data logic off the client and reduces the JavaScript the browser must download. Interactive parts are still written as Client Components.
:::

:::interview What changed in Next.js 16 that breaks older code?
Request data is async only: `params`, `searchParams`, `cookies()` and `headers()` must be awaited. `middleware.js` is renamed to `proxy.js` and runs on the Node.js runtime. Turbopack is the default bundler. `next lint` is removed. `revalidateTag` needs a second argument, and `updateTag` and `refresh` are new. Caching moves to the opt-in Cache Components model with `use cache`.
:::

:::interview Explain Partial Prerendering in simple words.
One page can have parts that are the same for everyone and parts that depend on the request. Next.js prerenders the shared parts into a static shell that is sent instantly. The request-specific parts are wrapped in Suspense, so their fallback is in the shell and the real content streams in from the same response. You get the speed of a static page and the freshness of a dynamic one.
:::

:::interview How would you add pagination to a long list?
The simple way is `LIMIT 20 OFFSET 40` with the page number in `searchParams`. It is easy, but it gets slower on deep pages because the database still walks over the skipped rows. For long lists I use keyset pagination: remember the last row and ask for the next ones.
:::

```sql
-- Keyset pagination: rows that come after the last one we showed.
-- $2 and $3 are created_at and id of that last row.
SELECT id, title, created_at
FROM tasks
WHERE user_id = $1
  AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

:::interview Two requests update the same row at the same time. What can go wrong?
A lost update. Both read the old value, both calculate a new one, and the second write overwrites the first. Fixes: let the database calculate in one statement, lock the row inside a transaction with `SELECT ... FOR UPDATE`, or keep a version column and update only if the version has not changed.
:::

```sql
-- Safe: the database reads and writes in one step
UPDATE products SET stock = stock - 1
WHERE id = $1 AND stock > 0
RETURNING stock;   -- zero rows returned means sold out
```

:::warn
Do not memorise answers word for word. Interviewers ask "why?" twice. For each answer, be ready to show where you used the idea in your own project.
:::

## Build your own project

:::flow Roadmap
Schema | tables and migrations
Read | list and detail pages
Write | actions and validation
Auth | sessions and ownership
Polish | errors, tests, deploy
:::

| Week | Goal | Done when |
|---|---|---|
| 1 | Idea, tables, migrations, seed data | You can query your data in `psql` |
| 2 | List and detail pages with Suspense | Pages show real rows and a 404 |
| 3 | Forms with Server Actions and zod | Create, edit and delete work with clear errors |
| 4 | Sign up, log in, ownership and one role | A second account cannot see your data |
| 5 | Caching, error pages, tests, deployment | A public URL and a README |

Project ideas: an **expense splitter** (joins and transactions), a **course notes site** (cached public pages, an admin role, tag-based revalidation), a **booking app** (constraints and row locks) or a **job board** (search, filters, pagination and a JSON API).

:::tip
Finish one small project fully, including login, tests and deployment, before starting a bigger one. A deployed app that you can explain line by line is worth more than three half-built clones.
:::

:::revise
- Explain every answer with the "why" and with an example from your own code.
- Know the Next.js 16 changes: async request APIs, `proxy.js`, `use cache`, `updateTag`.
- Know your SQL: joins, indexes, transactions, pagination and safe updates.
- Build in this order: schema, read, write, auth, polish.
- One finished, deployed project beats many unfinished ones.
:::
