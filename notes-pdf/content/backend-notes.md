---
title: Backend Notes
subtitle: From your first Express server to production-grade Node.js services, in easy language with code you can run.
category: Backend
level: Intermediate to Advanced
accent: indigo
tags: nodejs, express, mongodb, redis, microservices
highlights: Node.js & Express | REST API Design | MongoDB | Auth & Security | Redis & Queues | Microservices
tagline: Node.js • Express • MongoDB • Auth • Redis • Kafka • Microservices
description: A complete path through backend engineering with Node.js. You start with HTTP and the event loop, build clean Express and MongoDB APIs with validation, authentication and security, then learn caching, rate limiting, queues, Kafka, microservices, testing and deployment. Every chapter has commented code, common mistakes, interview questions and a one-minute revision box.
---

# How a backend works

*What really happens between a button click in the browser and the data that comes back.*

## Why this matters

Think of a restaurant. You (the **client**) do not walk into the kitchen. You give your order to a waiter. The waiter carries it to the kitchen (the **server**). The kitchen takes items from the store room (the **database**), cooks, and the waiter brings the plate back. The rules the waiter follows are called **HTTP**.

- **Client**: any program that sends a request. A browser, a mobile app, or another server.
- **Server**: a program that waits for requests and sends back responses.
- **HTTP** (HyperText Transfer Protocol): the agreed format of the request and the response. **HTTPS** is the same thing, sent through an encrypted connection. HTTP is **stateless**: the server does not remember you between two requests, so every request must carry its own identity.
- **API** (Application Programming Interface): the list of requests your server understands.

:::flow One request, start to end
Client | browser or app
DNS | name to IP address
Server | runs your code
Database | reads or writes data
Response | status + JSON
:::

## What a request looks like

A request is just text with four parts: a method, a path, headers and an optional body.

```text
POST /api/v1/courses HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"title": "Node.js Basics", "price": 499}
```

The response has a status code, headers and a body, for example `HTTP/1.1 201 Created` followed by `Content-Type: application/json` and the JSON of the new course.

```text
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/courses/665f1c2ab1

{"id": "665f1c2ab1", "title": "Node.js Basics", "price": 499}
```

## HTTP methods

The method tells the server what kind of action you want.

| Method | Meaning | Safe | Idempotent |
|---|---|---|---|
| `GET` | Read data | Yes | Yes |
| `POST` | Create something new | No | No |
| `PUT` | Replace the whole item | No | Yes |
| `PATCH` | Change some fields | No | Not always |
| `DELETE` | Remove the item | No | Yes |

Two words in this table are asked in almost every interview:

- **Safe** means the request does not change any data. Reading a menu does not change the kitchen.
- **Idempotent** means doing the same request many times leaves the server in the same state as doing it once. Pressing a lift button five times still calls the lift once.

## Status codes

The status code is a three-digit summary of what happened. The first digit gives the family.

| Code | Name | Use it when |
|---|---|---|
| `200` | OK | A read or update worked |
| `201` | Created | A new item was created |
| `400` | Bad Request | The input is wrong |
| `401` | Unauthorized | You are not logged in |
| `403` | Forbidden | Logged in, but not allowed |
| `404` | Not Found | The item does not exist |
| `409` | Conflict | Clashes with current data, like a duplicate email |
| `429` | Too Many Requests | The client hit a rate limit |
| `500` | Internal Server Error | A bug or crash on the server |
| `503` | Service Unavailable | The server is overloaded or restarting |

## Headers and JSON

**Headers** are small key and value pairs that describe the request or response. The body is the real data. Headers are like the labels on a courier parcel. Common ones are `Content-Type` (the format of the body), `Authorization` (who is calling) and `Cache-Control` (caching rules).

**JSON** (JavaScript Object Notation) is the most common body format. It is text that looks like a JavaScript object.

## A server with no framework

```javascript
import http from 'node:http';

const server = http.createServer((req, res) => {
  // req = what the client sent, res = what we send back
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
  console.log('Server is ready on http://localhost:3000');
});
```

:::warn
Do not send `200 OK` with a body like `{ "error": "User not found" }`. Clients, monitoring tools and caches all read the status code first. Use `404` for missing data, `400` for bad input and `500` for server bugs.
:::

:::interview What is the difference between PUT and PATCH?
`PUT` replaces the whole resource with the body you send. If you leave out a field, that field is removed or reset. `PATCH` changes only the fields you send. `PUT` is idempotent, because sending the same full object twice gives the same result. `PATCH` is idempotent only if the change is a fixed value, such as "set price to 499". A change like "add 1 to views" is not idempotent.
:::

:::revise

- `GET` reads, `POST` creates, `PUT` replaces, `PATCH` edits, `DELETE` removes.
- Safe means no data changes. Idempotent means repeating the request gives the same end state.
- `2xx` success, `4xx` client mistake, `5xx` server mistake. Always send the correct code.
- HTTP is stateless, so every request must carry its own identity.
:::

# Node.js internals you must know

*One thread, an event loop and a lot of waiting done smartly: the reason Node.js is fast and the reason it sometimes freezes.*

## Why this matters

Picture a small tea stall with **one** worker. He takes an order, puts the tea on the stove, and takes the next order while the tea boils. He never stands and stares at the stove. When a tea is ready, he serves it. One person can serve many customers, as long as no single task keeps him busy for long.

Node.js works the same way:

- Your JavaScript runs on **one main thread**. A thread is one line of work that the computer runs step by step.
- Slow work such as reading a file, calling a database or waiting for the network is called **I/O** (input and output). Node.js hands this work to the operating system or to a small helper pool, and continues with other code. This is **non-blocking I/O**.
- When the slow work finishes, its callback is put in a queue. The **event loop** is the loop that keeps picking callbacks from the queues and running them, one at a time.

## The event loop in simple steps

:::flow One round of the event loop
Timers | setTimeout, setInterval
Poll | I/O callbacks
Check | setImmediate
Close | cleanup callbacks
:::

After **every** callback, Node.js first empties the **microtask queue**. Microtasks are promise callbacks (`.then`, and the code after `await`). So promises always run before the next timer or I/O callback.

```javascript
console.log('1: start');                       // runs now

setTimeout(() => console.log('4: timer'), 0);  // timers phase, later

Promise.resolve().then(() => console.log('3: promise'));  // microtask

console.log('2: end');                         // runs now

// Output: 1: start, 2: end, 3: promise, 4: timer
```

## Who does the slow work?

Node.js uses a C library named **libuv** for the slow work. Network calls (HTTP, database, Redis) are handled by the operating system with no extra thread. File system, `crypto` and `zlib` work runs in the libuv **thread pool**, which has 4 threads by default.

## What blocks the loop

If one callback takes 2 seconds of pure CPU work, every other user waits 2 seconds. The tea seller is stuck stirring one pot.

```javascript
import crypto from 'node:crypto';

// BAD: the Sync version runs on the main thread.
// No other request is served until it finishes.
const key1 = crypto.pbkdf2Sync('secret', 'salt', 600_000, 32, 'sha256');

// GOOD: the async version runs in the libuv thread pool.
// The event loop is free while the hash is computed.
crypto.pbkdf2('secret', 'salt', 600_000, 32, 'sha256', (err, key2) => {
  console.log('hash ready', key2.length);
});
```

| Blocks the loop | Better choice |
|---|---|
| `fs.readFileSync` inside a request | `await fs.promises.readFile` |
| A loop over millions of items | Do it in the database, or in a worker thread |
| A badly written regular expression | Simple patterns, input length limits |
| Sync crypto such as `pbkdf2Sync` | The async versions |

A **worker thread** (`node:worker_threads`) is a second JavaScript thread. Use it for heavy CPU work such as image resizing or PDF creation. For most APIs, the better answer is a background job, which you will learn in a later chapter.

:::warn
`await` does not make slow code fast. `await` only helps when the work is real I/O. A heavy `for` loop inside an `async` function still blocks the event loop, because it is still your JavaScript running on the main thread.
:::

## Streams

Reading a 2 GB file into memory to send it is like filling a water tank before you give someone a glass of water. A **stream** is a pipe. Data flows in small pieces called **chunks**, so memory use stays small.

```javascript
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

// Read -> compress -> write, a few kilobytes at a time.
// pipeline() connects the streams, handles errors and
// closes every stream when one of them fails.
await pipeline(
  createReadStream('access.log'),
  createGzip(),
  createWriteStream('access.log.gz'),
);
console.log('Compressed without loading the file into memory');
```

## ES modules

A **module** is one file with its own scope. Modern Node.js uses **ES modules** (ESM), the same `import` and `export` syntax as the browser. Turn it on with `"type": "module"` in `package.json`. All code in these notes uses ESM.

Three things change when you move from the old CommonJS style (`require`):

- Relative imports need the file extension: `'./math.js'`, not `'./math'`.
- `__dirname` and `__filename` do not exist. Use `import.meta.dirname` and `import.meta.filename` on current Node.js versions.
- You can use `await` at the top level of a file.

:::interview Is Node.js single threaded? Then how does it handle thousands of requests?
Your JavaScript runs on one main thread, but waiting is not done on that thread. Network I/O is handled by the operating system, and file and crypto work goes to the libuv thread pool. The main thread only starts the work and later runs a short callback when the result is ready. Most backend requests are mostly waiting (for the database, for other services), so one thread can serve thousands of them.
:::

:::revise
- JavaScript runs on one main thread. The event loop picks callbacks from queues and runs them one by one.
- I/O is non-blocking: the OS or the libuv thread pool does the waiting.
- Microtasks (promises) run before timers and I/O callbacks.
- Heavy CPU work and `Sync` functions block every user. Move them to a worker thread or a background job.
- Streams move data in chunks. Use `pipeline()` so errors and backpressure are handled.
- ES modules: `"type": "module"`, file extensions in imports, top-level `await`.
:::

# Express fundamentals

*Routing, the middleware chain, and a folder structure that stays clean when the project grows.*

## Why this matters

The plain `http` server from the first chapter works, but you would have to write your own routing, body parsing and error handling. **Express** is a small framework that gives you these pieces. Most Node.js backends you will meet in jobs use Express or something with the same ideas.

Install it with `npm install express`. The code here is written for Express 4 and also runs on Express 5.

## Your first Express app

```javascript
import express from 'express';

const app = express();

const courses = [{ id: 1, title: 'Node.js Basics' }];

app.get('/api/v1/courses', (req, res) => {
  res.json(courses);                        // 200 by default
});

app.get('/api/v1/courses/:id', (req, res) => {
  // :id is a route parameter. It is always a string.
  const course = courses.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
});


app.listen(3000, () => console.log('API on http://localhost:3000'));
```

## Middleware: the heart of Express

Think of airport security. Before you reach the plane, you pass several counters: ticket check, bag scan, passport check. Each counter either lets you go to the next one or stops you.

A **middleware** is a function that runs between the request and the final handler. It gets `(req, res, next)`. It can read or change `req` and `res`, send a response, or call `next()` to pass control to the next function.

:::flow The middleware chain
Request
express.json | parse body
Logger | record the call
Auth | who is this?
Route handler | do the work
Error handler | catches failures
:::

```javascript
// A middleware that measures how long each request takes.
export function requestTimer(req, res, next) {
  const start = process.hrtime.bigint();

  // 'finish' fires when the response has been sent.
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`,
    );
  });

  next();   // very important: pass control to the next function
}

// app.use(requestTimer);              -> runs for every request
// app.use('/api/v1/admin', onlyAdmin) -> runs only under this path
// router.post('/', requireAuth, createCourse) -> runs for one route
```

:::warn
Order matters. Express runs middleware in the order you register it. If you add `express.json()` after your routes, `req.body` is `undefined` in those routes. The second classic mistake is to forget `next()`: the request then hangs until the client times out. Also `return` after `res.json(...)` inside an `if`, or you send two responses and get "Cannot set headers after they are sent".
:::

## A clean folder structure

A single `index.js` file is fine for 5 routes. With 50 routes it becomes a mess. Split the code by responsibility.

```text
src/
  server.js          starts the HTTP server (the only file that listens)
  app.js             builds the Express app: middleware + routes
  config/env.js      reads and checks environment variables
  routes/            URL -> controller mapping
  controllers/       read req, call a service, send res
  services/          business rules (no req or res here)
  models/            database schemas
  middlewares/       auth, validation, error handler
  utils/             small helpers
```

Here is one feature cut into these layers.

```javascript
// routes/course.routes.js
import { Router } from 'express';
import * as controller from '../controllers/course.controller.js';

const router = Router();          // a mini app for one resource
router.get('/', controller.list);
router.post('/', controller.create);
export default router;

// app.js
import express from 'express';
import courseRoutes from './routes/course.routes.js';

export const app = express();
app.use(express.json());
app.use('/api/v1/courses', courseRoutes);   // mount under a prefix
```

```javascript
// controllers/course.controller.js
import * as courseService from '../services/course.service.js';

export async function create(req, res) {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ data: course });
}

// services/course.service.js
import { Course } from '../models/course.model.js';

export async function createCourse({ title, price }) {
  // Business rule lives here, not in the controller.
  const finalPrice = price < 0 ? 0 : price;
  return Course.create({ title, price: finalPrice });
}
```

The service does not know about `req` or `res`. So you can call it from a test, a background job or a script without a fake HTTP request.

:::interview What is middleware in Express? Name the types.
Middleware is a function with the signature `(req, res, next)` that runs in order for each request. It can change the request or response, end the request, or call `next()`. Types: application-level (`app.use`), router-level (`router.use`), built-in (`express.json`, `express.static`), third-party (`helmet`, `cors`), and error-handling middleware, which has four arguments `(err, req, res, next)`.
:::

:::revise
- Input lives in `req.params`, `req.query` and `req.body`.
- Middleware runs in registration order. Call `next()` or send a response, never both.
- Use `Router()` to group the routes of one resource and mount it with a prefix.
- Layers: route, controller, service, model. Only routes and controllers know about HTTP.
- Keep `app.js` (builds the app) apart from `server.js` (listens). Tests need this.
:::

# REST API design

*How to name URLs, page through data and report errors so that other developers enjoy using your API.*

## Why this matters

**REST** (Representational State Transfer) is a style for designing HTTP APIs. The main idea: the URL names a **thing** (a resource), and the HTTP method says **what to do** with it. Think of a library. The shelf number tells you which book. Whether you read, add or remove the book is a different matter.

## Naming resources

| Avoid | Prefer | Why |
|---|---|---|
| `POST /createCourse` | `POST /courses` | The method is already the verb |
| `GET /course/42` | `GET /courses/42` | Plural nouns, always |
| `GET /getUserOrders?id=7` | `GET /users/7/orders` | Shows the relation |
| `POST /courses/42/delete` | `DELETE /courses/42` | Use the right method |

## Pagination

Never return "all rows". A table with 10 rows today can have 10 million rows next year. **Pagination** means returning the data in pages.

| Type | Request | Good | Weak point |
|---|---|---|---|
| Offset | `?page=3&limit=20` | Simple, can jump to any page | Slow on deep pages, items can shift |
| Cursor | `?after=abc&limit=20` | Fast on any depth, stable | No jump to page 50 |

With **offset** pagination, `skip(100000)` reads 100,000 rows and throws them away. A **cursor** is a pointer to the last item you saw. The database jumps straight to it using an index.

```javascript
// utils/pagination.js
// Turns ?page=2&limit=500 into safe numbers.
export function parsePagination(query, { maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const wanted = Number.parseInt(query.limit, 10) || 20;
  const limit = Math.min(maxLimit, Math.max(1, wanted));
  return { page, limit, skip: (page - 1) * limit };
}

// parsePagination({ page: '2', limit: '500' })
//   -> { page: 2, limit: 100, skip: 100 }
```

```javascript
// services/course.service.js : cursor pagination, newest first
import { Course } from '../models/course.model.js';

export async function listCourses({ after, limit = 20 }) {
  // MongoDB ids grow with time, so _id works as a cursor.
  const filter = after ? { _id: { $lt: after } } : {};

  const docs = await Course.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)        // ask for one extra item
    .lean();

  const hasMore = docs.length > limit;   // the extra item tells us
  const items = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore ? String(items.at(-1)._id) : null;

  return { items, nextCursor };
}
```

The client sends `nextCursor` back as `?after=...` to get the next page. When `nextCursor` is `null`, there is no more data.

## Filtering and sorting

Use query parameters: `GET /courses?category=backend&minPrice=100&sort=-price`. A minus sign in front is a common way to say "descending".

Never pass `req.query` straight into a database query. Allow only the fields you choose.

## Versioning

One day you must change a response in a way that breaks old mobile apps. **Versioning** lets old and new clients live together. The simplest way is a prefix in the URL: `/api/v1/courses` and later `/api/v2/courses`. Adding a new optional field is not a breaking change. Removing or renaming a field is.

## Idempotency for POST

A user pays for a course. The network is slow, the app shows an error, and the user taps "Pay" again. Without protection, you charge twice.

The fix is an **idempotency key**. The client creates a unique id for the action and sends it in a header. The server remembers the key and the response. If the same key comes again, the server returns the saved response and does not repeat the work.

```javascript
// middlewares/idempotency.js
const seen = new Map();   // demo only. Use Redis with a TTL in production.

export function idempotent(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) return next();              // header not sent: normal flow

  const saved = seen.get(key);
  if (saved) {                          // same key again: replay
    return res.status(saved.status).json(saved.body);
  }

  const sendJson = res.json.bind(res);
  res.json = (body) => {                // remember the first response
    if (res.statusCode < 500) {
      seen.set(key, { status: res.statusCode, body });
    }
    return sendJson(body);
  };
  next();
}
```

In a real system, store the key with the user id in Redis or the database, keep it for about a day, and use a unique index so two requests with the same key cannot both run.

## One error format everywhere

The frontend should handle errors with one piece of code. So every error from your API must have the same shape.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

`code` is a stable string for programs and `message` is for humans. Success responses also get one shape: `{ "data": ... }`.

:::warn
Do not leak internals in errors. A response like `MongoServerError: E11000 duplicate key ... index: email_1` tells an attacker your database, your collection and your index names. Log the full error on the server. Send the client a clean code and message.
:::

:::interview What is idempotency and how do you make a payment API idempotent?
An operation is idempotent if repeating it gives the same end state as doing it once. For payments, the client sends a unique `Idempotency-Key` header. The server stores the key with the result, inside the same transaction as the payment if possible, and puts a unique index on the key. A repeated request with the same key gets the stored result and no second charge is made.
:::

:::revise
- URLs name things with plural nouns. HTTP methods are the verbs.
- Always paginate. Offset is simple. Cursor is fast and stable for large data.
- Whitelist filter and sort fields. Never pass `req.query` straight to the database.
- Version from day one with `/api/v1`. Adding fields is safe, removing fields is breaking.
- Use an `Idempotency-Key` for `POST` requests that must not run twice.
- One error shape for the whole API: `code`, `message`, optional `details`.
:::

# MongoDB and Mongoose

*Documents, schema design, indexes, aggregation and transactions, with the choices that decide if your database stays fast.*

## Why this matters

**MongoDB** is a document database. In a SQL database, data lives in rows and tables. In MongoDB, data lives in **documents** (JSON-like objects) inside **collections**. Think of a student file in a school office: one folder holds the student's form, marks and address together. You open one folder and you have everything.

**Mongoose** is a library that sits between your code and MongoDB. It adds **schemas** (the allowed shape of a document), validation and helper methods. Install it with `npm install mongoose`.

## Schema and model

```javascript
// models/course.model.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['backend', 'frontend', 'dsa'] },
    // Reference: store only the id of the instructor.
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Embed: lessons live inside the course document.
    lessons: [{ title: String, durationMin: Number }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true },   // adds createdAt and updatedAt
);

export const Course = mongoose.model('Course', courseSchema);
```

Connect once at startup with `await mongoose.connect(process.env.MONGO_URI)`. For read-only queries, add `.select('title price')` to fetch only the fields you need and `.lean()` to get plain objects, which is faster. `.populate('instructor', 'name')` replaces a referenced id with the real document.

## Embed or reference?

This is the main design question in MongoDB. **Embed** means keeping related data inside the same document. **Reference** means storing only an id and keeping the data in another collection.

| Question | Embed | Reference |
|---|---|---|
| Is the data read together? | Yes | No |
| How many child items? | Few, with a clear limit | Many, or no limit |
| Is the child shared by many parents? | No | Yes |
| Does the child change often on its own? | No | Yes |

:::warn
Do not embed arrays that grow without limit, such as all comments of a post or all log entries of a user. A MongoDB document has a 16 MB size limit, and large documents get slow long before that. If you cannot say "this array will stay small", use a separate collection.
:::

## Indexes

Without an index, MongoDB reads every document to find a match. This is a **collection scan**. It is like searching for a word by reading the whole book. An **index** is the list at the back of the book: sorted words with page numbers.

```javascript
// Single field index: fast lookups by category.
courseSchema.index({ category: 1 });

// Compound index. Order of fields matters:
// Equality first, then Sort, then Range (the "ESR" rule).
// Serves: find({ category, published }).sort({ createdAt: -1 })
courseSchema.index({ category: 1, published: 1, createdAt: -1 });

```

Check a query with `.explain()`: you want the stage `IXSCAN` (index scan), not `COLLSCAN`. Indexes are not free. Every index makes writes a little slower and uses memory, because MongoDB must update it on each insert and update. Index the fields you filter and sort by often. Do not index everything.

## Aggregation basics

`find` gets documents. **Aggregation** calculates over documents: totals, averages, groups. An aggregation is a **pipeline**: a list of stages, where each stage takes the output of the previous one. Think of a factory line.

```javascript
// Revenue and number of sales per course, top 5, for paid orders.
const report = await Order.aggregate([
  { $match: { status: 'paid' } },            // 1. filter early
  {
    $group: {                                // 2. group by course
      _id: '$course',
      revenue: { $sum: '$amount' },
      sales: { $sum: 1 },
    },
  },
  { $sort: { revenue: -1 } },                // 3. biggest first
  { $limit: 5 },                             // 4. keep top 5
]);
// -> [{ _id: <courseId>, revenue: 49900, sales: 100 }, ...]
```

Put `$match` as early as you can. It reduces the work for every later stage and it can use an index.

## Transactions

Sometimes two writes must both happen or both fail. Example: reduce the seats of a course **and** create the enrollment. A **transaction** groups writes into one "all or nothing" unit.

```javascript
import mongoose from 'mongoose';

export async function enroll(userId, courseId) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // The filter makes the check and the update one atomic step.
      const course = await Course.findOneAndUpdate(
        { _id: courseId, seatsLeft: { $gt: 0 } },
        { $inc: { seatsLeft: -1 } },
        { session, new: true },
      );
      if (!course) throw new Error('No seats left');

      // create() needs an array when you pass a session.
      await Enrollment.create(
        [{ user: userId, course: courseId }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}
```

If any line throws, everything inside is rolled back. Transactions need MongoDB to run as a **replica set** (a group of servers that hold the same data), which is the default on MongoDB Atlas. A change to **one** document is always atomic, so many cases need no transaction at all.

:::interview When do you embed and when do you reference in MongoDB?
Embed when the child data is read together with the parent, is small with a clear upper limit, and belongs to only that parent. Reference when the child list can grow without limit, when the child is shared by many parents, or when it is updated often on its own. A good rule is "data that is used together stays together", with the limit that arrays must not grow forever.
:::

:::revise
- MongoDB stores JSON-like documents in collections. Mongoose adds schemas and validation.
- Embed small, bounded data that is read together. Reference large or shared data.
- No index means a full collection scan. Check queries with `explain()` and look for `IXSCAN`.
- Compound index order: Equality, Sort, Range.
- Use `.lean()` and `.select()` for read-only queries.
- A single document update is atomic. Use a transaction when several documents must change together.
:::

# Validation and error handling

*Check every input at the door, and send every failure through one place.*

## Why this matters

A security guard at a building gate checks every visitor once. After that, people inside can trust each other. **Validation** is that guard for your API. You check the data at the **boundary** (the point where data enters your system), so the code inside can trust it.

## Validate at the boundary with zod

**zod** is a library to describe the shape of data and check it. Install it with `npm install zod`. You write a **schema** once and get checking, clean error messages and converted values.

```javascript
// validators/course.validator.js
import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  price: z.number().int().min(0).max(100_000),
  category: z.enum(['backend', 'frontend', 'dsa']),
  tags: z.array(z.string().max(30)).max(10).default([]),
});
```

By default, `z.object` removes keys that are not in the schema. So a user cannot sneak in `"role": "admin"` or `"published": true`. This attack is called **mass assignment**.

```javascript
// middlewares/validate.js
import { AppError } from '../utils/AppError.js';

// source is 'body', 'query' or 'params'
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);   // never throws

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(
      new AppError(400, 'VALIDATION_ERROR', 'Invalid input', details),
    );
  }

  // Express 5 makes req.query read-only, so we keep the clean,
  // converted data in our own property.
  req.valid = { ...req.valid, [source]: result.data };
  next();
};

// router.post('/', validate(createCourseSchema), controller.create);
// In the controller, read req.valid.body, not req.body.
```

## Two kinds of errors

| | Operational error | Programmer error |
|---|---|---|
| What | A known failure at run time | A bug in the code |
| Examples | Invalid input, not found, duplicate email, timeout | `undefined.name`, wrong argument, a typo |
| Client sees | A clear `4xx` message | A generic `500` |
| What you do | Handle it and move on | Log it, fix the code |

To tell them apart, create your own error class for the known failures.

```javascript
// utils/AppError.js
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;       // HTTP status, for example 404
    this.code = code;           // stable code, for example 'NOT_FOUND'
    this.details = details;     // optional extra data
    this.isOperational = true;  // "we expected this kind of failure"
  }
}

// utils/asyncHandler.js
// Catches a rejected promise and passes the error to Express.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

In Express 4, an error thrown inside an `async` handler is not caught by Express. The request hangs, and you get an "unhandled rejection". `asyncHandler` fixes that. In Express 5 it is not needed, but it does no harm. Inside a handler you now simply write `throw new AppError(404, 'NOT_FOUND', 'Course not found')`.

## The central error middleware

Express knows a middleware is an error handler when it has **four** arguments. Register it **after** all routes. Every `next(err)` and every caught error lands here.

```javascript
// middlewares/errorHandler.js
import { AppError } from '../utils/AppError.js';

// Turn well-known library errors into AppErrors.
function normalize(err) {
  if (err.isOperational) return err;
  if (err.name === 'CastError') {               // bad MongoDB id
    return new AppError(400, 'BAD_ID', 'Invalid id format');
  }
  if (err.code === 11000) {                     // unique index hit
    return new AppError(409, 'DUPLICATE', 'This value already exists');
  }
  if (err.type === 'entity.parse.failed') {     // broken JSON body
    return new AppError(400, 'BAD_JSON', 'Body is not valid JSON');
  }
  return null;                                  // unknown: a bug
}

export function notFound(req, res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Route does not exist'));
}
```

```javascript
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);   // response already started

  const known = normalize(err);
  if (known) {
    return res.status(known.status).json({
      error: {
        code: known.code,
        message: known.message,
        details: known.details,
      },
    });
  }

  // Programmer error: log everything, tell the client nothing.
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

// app.js, at the very end:
// app.use(notFound);
// app.use(errorHandler);
```

Some errors happen outside any request, for example in a timer. Listen for `unhandledRejection` and `uncaughtException` on `process`, log the error and exit with `process.exit(1)`. After an unknown error the program may be in a broken state, and a process manager or container platform will start a fresh copy.

:::warn
Do not write `try { ... } catch (e) { res.status(500).json({ error: e.message }) }` in every controller. It repeats code, hides the real status (a "not found" becomes a 500) and can leak internal messages. Throw an `AppError` and let the central handler answer.
:::

:::interview How do you handle errors in an Express application?
I validate input at the boundary with a schema library and turn failures into a 400. Inside the app I throw a custom `AppError` with a status and a code for expected failures. Async handlers are wrapped so that rejected promises go to `next(err)`. One error middleware with four arguments, registered last, converts errors into one JSON format, logs unknown errors and returns a generic 500 for them. `unhandledRejection` and `uncaughtException` are logged and the process exits so that it restarts in a clean state.
:::

:::revise
- Validate `body`, `query` and `params` at the boundary. Inside, trust the clean data.
- zod removes unknown keys by default, which blocks mass assignment.
- Throw `AppError(status, code, message)` for expected failures.
- Wrap async handlers (needed in Express 4) so errors reach `next(err)`.
- One error middleware with four arguments, placed last, formats every error.
- Unknown errors: log the full details, send a generic 500, never leak the stack trace.
:::

# Authentication and authorization

*Proving who the user is, keeping them logged in safely, and deciding what they may do.*

## Why this matters

At an airport, your ID card proves **who you are**. Your boarding pass says **where you may go**. These are two different checks.

- **Authentication** (authN): who are you? Login with email and password.
- **Authorization** (authZ): what are you allowed to do? Only admins may delete a course.

## Storing passwords with bcrypt

Never store a password as plain text. If the database leaks, every account is lost. Store a **hash**: a one-way scramble. You can turn a password into a hash, but you cannot turn a hash back into the password.

A fast hash such as SHA-256 is a bad choice here, because an attacker can try billions of guesses per second. **bcrypt** is slow on purpose, and it adds a **salt**: a random value mixed in, so two users with the same password get different hashes. Install it with `npm install bcrypt`.

```javascript
// services/auth.service.js
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 12;   // each +1 doubles the work

// Sign-up: hash first, then save. Never save the password itself.
export const hashPassword = (password) =>
  bcrypt.hash(password, SALT_ROUNDS);

export async function login({ email, password }) {
  // passwordHash has "select: false" in the schema, so ask for it.
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  // Same message for "no such email" and "wrong password".
  if (!ok) throw new AppError(401, 'BAD_LOGIN', 'Wrong email or password');
  return user;
}
```

## Sessions vs JWT

HTTP is stateless. After login, the server must recognise the user on the next request. There are two main ways.

**Session**: like a cloakroom token. The server keeps your data in a store (often Redis) and gives you a random id in a cookie. On each request, the server looks up the id.

**JWT** (JSON Web Token): like a signed pass. The token itself holds the data (user id, role) and a **signature**. The server checks the signature with its secret key. No lookup is needed.

| | Session | JWT |
|---|---|---|
| Where is the data? | On the server | Inside the token |
| Lookup per request | Yes | No |
| Log out or ban at once | Easy: delete the session | Hard: valid until it expires |
| Fits best | One web app with its own backend | Many services, mobile apps |

A JWT has three parts joined by dots: `header.payload.signature`. The payload is only **encoded**, not encrypted. Anyone can read it. Never put passwords or secrets in it.

## Access token and refresh token

A JWT cannot be cancelled easily. So keep it short-lived, and use a second token to get new ones.

- **Access token**: a JWT that lives about 15 minutes. Sent with every API call.
- **Refresh token**: a long random string that lives for days. Used only to get a new access token. It is stored in the database, so it **can** be cancelled.

```javascript
// utils/tokens.js
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },   // sub = subject
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
}

// The refresh token is random, not a JWT.
export const newRefreshToken = () =>
  crypto.randomBytes(32).toString('hex');

// Store only the hash, like a password.
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
```

```javascript
// middlewares/auth.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('Authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'NO_TOKEN', 'Please log in'));
  }
  try {
    // Throws if the signature is wrong or the token has expired.
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],          // accept only what we sign with
    });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'BAD_TOKEN', 'Invalid or expired token'));
  }
}
```

## Where to keep the tokens in a browser

Send the refresh token in an **httpOnly cookie**. JavaScript in the page cannot read such a cookie, so a script injected by an attacker cannot steal it. The access token goes back in the JSON body and the frontend keeps it in memory.

```javascript
// controllers/auth.controller.js (uses cookie-parser to read cookies)
const COOKIE = {
  httpOnly: true,                 // not readable by page JavaScript
  secure: true,                   // sent only over HTTPS
  sameSite: 'strict',             // not sent from other sites
  path: '/api/v1/auth',           // sent only to the auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const refresh = asyncHandler(async (req, res) => {
  const old = req.cookies.refreshToken;
  if (!old) throw new AppError(401, 'NO_TOKEN', 'Please log in');

  // Find and delete in one step, so a token works only once.
  const session = await Session.findOneAndDelete({
    tokenHash: hashToken(old),
    expiresAt: { $gt: new Date() },
  });
  if (!session) throw new AppError(401, 'BAD_TOKEN', 'Please log in');

  const user = await User.findById(session.user);
  if (!user) throw new AppError(401, 'BAD_TOKEN', 'Please log in');
  const next = newRefreshToken();
  await Session.create({
    user: user._id,
    tokenHash: hashToken(next),
    expiresAt: new Date(Date.now() + COOKIE.maxAge),
  });

  res.cookie('refreshToken', next, COOKIE);
  res.json({ accessToken: signAccessToken(user) });
});
```

Giving a new refresh token on every use is called **rotation**. A stolen old token is useless after the real user refreshes. **Logout** deletes the session document and clears the cookie.

## Role-based access control

**RBAC** means each user has a role, and each route says which roles may enter.

```javascript
// middlewares/auth.js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'FORBIDDEN', 'You are not allowed'));
  }
  next();
};

// router.delete('/:id', requireAuth, requireRole('admin'), remove);
```

Roles are not enough. Also check **ownership**: an instructor may edit only their own course. The security chapter shows how.

:::warn
Do not store tokens in `localStorage`. Any script that runs on your page, including a hacked npm package, can read it and send your token away. This attack is called **XSS** (cross-site scripting). Use an httpOnly cookie for the long-lived token.
:::

:::interview How do you log a user out if you use JWT?
You cannot delete a JWT that the client already holds. So keep the access token short, about 15 minutes, and delete the refresh token on the server at logout. After that the user cannot get new access tokens. For instant logout, for example of a banned user, keep a small deny list of token ids in Redis until those tokens expire.
:::

:::revise
- Authentication is "who are you". Authorization is "what may you do".
- Store passwords only as bcrypt hashes with a cost of 10 to 12 or more.
- Use a short access token and a rotating refresh token stored (hashed) in the database.
- Keep the refresh token in an httpOnly, secure, sameSite cookie.
- A JWT payload is readable by anyone. Verify it with a fixed algorithm list.
- Check the role and also the ownership of the resource.
:::

# Security essentials

*The small set of defences that stops the most common attacks on a Node.js API.*

## Why this matters

You lock your house door even if you have never been robbed. Bots scan the internet all day and try known attacks on every server they find, small projects included. A few habits stop most of these attacks.

## Safe defaults in one file

```javascript
// app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

export const app = express();

app.set('trust proxy', 1);   // we run behind one proxy or load balancer
app.use(helmet());           // sets safe HTTP response headers

app.use(cors({
  origin: ['https://app.example.com'],   // only our frontend
  credentials: true,                     // allow cookies
}));

app.use(express.json({ limit: '100kb' }));   // refuse huge bodies

// At most 10 login tries per IP in 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,                 // named "max" in older versions
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', loginLimiter);
```

**CORS** (Cross-Origin Resource Sharing) is often misunderstood. Browsers block a page on `site-a.com` from reading responses of `api.site-b.com`, unless the API says it is allowed. CORS is a browser rule. It does not stop `curl`, Postman or another server. So CORS is not authentication.

:::warn
Do not use `origin: '*'` together with cookies, and do not copy the request's `Origin` header back without checking it. Both let any website call your API with the cookies of your logged-in users. List the exact frontend addresses you trust.
:::

## NoSQL injection

**Injection** means the attacker's input is treated as a command, not as data. In MongoDB, the danger is an object where you expected a string.

```javascript
// The attacker sends this JSON body:
// { "email": "admin@site.com", "password": { "$ne": null } }

// BAD: req.body goes straight into the query.
// The query becomes: password "not equal to null" -> always true.
const user = await User.findOne({
  email: req.body.email,
  password: req.body.password,
});

// GOOD: validate first. zod refuses an object where a string
// is expected, so the request ends with a 400.
const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(72),
});
const { email, password } = loginSchema.parse(req.body);
```

The rule is simple: every value that goes into a query must have passed validation, and must have the type you expect. As a second safety layer, Mongoose has a `sanitizeFilter` setting that makes it ignore query operators inside user-supplied values.

## Secrets and environment config

A **secret** is any value that gives access: database passwords, JWT keys, API keys. Secrets must not be in your code and must not be in Git. Put them in **environment variables**: values given to the process from outside.

```javascript
// config/env.js : read once, check once, fail fast
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().default(3000),
  MONGO_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),   // long and random
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.issues);
  process.exit(1);          // do not start with a broken config
}

export const env = parsed.data;
```

For local work, keep the values in a `.env` file that is listed in `.gitignore`. Current Node.js versions can load it with `node --env-file=.env src/server.js`. In production, the hosting platform or a secret manager provides the variables.

## Broken access control

This is the most common serious bug in real APIs. The user is logged in, but can read or change data of **another** user by changing an id in the URL. It is also called **IDOR** (insecure direct object reference).

```javascript
// BAD: any logged-in user can read any order by guessing ids.
const order = await Order.findById(req.params.id);

// GOOD: the owner is part of the query itself.
const order = await Order.findOne({
  _id: req.params.id,
  user: req.user.id,
});
if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');
```

## A short OWASP checklist

**OWASP** is a non-profit group that publishes a well known list of the top web application risks. These are the ones you meet most in a Node.js API.

| Risk | In simple words | Your defence |
|---|---|---|
| Broken access control | A user reaches data of others | Check role and ownership on every route |
| Injection | Input runs as a command | Validate types, never build queries from raw input |
| Security misconfiguration | Unsafe defaults left on | `helmet`, strict CORS, no stack traces to clients |
| Vulnerable components | An old package has a known hole | `npm audit`, regular updates, fewer packages |

:::interview How do you secure a Node.js REST API?
I use HTTPS only, validate all input with schemas, and hash passwords with bcrypt. Authentication uses short-lived access tokens and refresh tokens in httpOnly cookies. Every route checks the role and the ownership of the resource. I add `helmet` for headers, a strict CORS origin list, body size limits and rate limits, with stricter limits on login. Secrets come from environment variables that are checked at startup. Dependencies are scanned with `npm audit`. Errors return a generic message and the details go to the logs.
:::

:::revise
- `helmet`, strict `cors`, a body size limit and rate limits are the basic set for every app.
- CORS is a browser rule, not authentication.
- Validate types before any database query to stop NoSQL injection.
- Secrets live in environment variables, are checked at startup and never go into Git.
- Put the owner id inside the query to stop users from reading each other's data.
- Keep packages updated and run `npm audit`.
:::

# Caching and rate limiting with Redis

*Answer repeated questions from memory, and stop any single client from taking more than a fair share.*

## Why this matters

A shopkeeper keeps the items that sell most on the counter. He does not walk to the store room for every customer. A **cache** is that counter: a small, fast place for data that is asked for again and again.

**Redis** is an in-memory data store. It keeps data in RAM, so reads and writes are very fast. It stores **keys** with values such as strings, lists, hashes and sorted sets, and every key can have a **TTL** (time to live): the number of seconds after which Redis deletes the key by itself. Use the official client (`npm install redis`): create it once with `createClient({ url })`, call `await redis.connect()`, and share it.

## The cache-aside pattern

This is the most common caching pattern. The application looks **aside** into the cache first.

```javascript
// services/course.service.js
const TTL_SECONDS = 300;

export async function getCourse(id) {
  const key = `course:${id}`;

  const cached = await redis.get(key);          // 1. look in the cache
  if (cached) return JSON.parse(cached);        //    hit

  const course = await Course.findById(id).lean();   // 2. miss
  if (!course) throw new AppError(404, 'NOT_FOUND', 'Course not found');

  // 3. save for next time. EX = expire after N seconds.
  await redis.set(key, JSON.stringify(course), { EX: TTL_SECONDS });
  return course;
}

export async function updateCourse(id, changes) {
  const course = await Course.findByIdAndUpdate(id, changes, {
    new: true,
    runValidators: true,
  }).lean();
  await redis.del(`course:${id}`);   // invalidate: delete the old copy
  return course;
}
```

## TTL and invalidation

Cached data can become old (**stale**). You have two tools:

- **TTL**: the key dies after some time. Simple, and it limits how old the data can be.
- **Invalidation**: when the data changes, delete the key at once. The next read loads fresh data.

Use both. Delete on write, and still set a TTL as a safety net for the cases you forget.

:::warn
On a write, **delete** the cache key. Do not try to update it. If two updates run at the same time, the older value can be written to the cache last and stay there. Deleting is safe: the next reader loads the correct value from the database.
:::

## Cache stampede

A popular key expires. At that moment 500 requests arrive, all see a miss, and all run the same slow database query. This is a **cache stampede**. It is like 500 people running to the store room for the same item.

Protection idea: only **one** caller loads the data. The others wait for that result.

```javascript
// utils/singleFlight.js
const inFlight = new Map();   // key -> promise of the running load

export function singleFlight(key, loader) {
  if (inFlight.has(key)) return inFlight.get(key);   // join the wait

  const promise = loader().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
```

This works inside one Node.js process. With many servers, use a short Redis lock as well: `SET lock:course:42 1 NX EX 10`. `NX` means "set only if the key does not exist", so only one server gets the lock and loads the data. The others wait a few milliseconds and read the cache again. Also add a little random time (**jitter**) to each TTL, so many keys do not expire in the same second.

## Rate limiting

A water tank has a tap with a fixed flow. However hard you turn it, only so much water comes out per minute. A **rate limiter** is that tap for requests. It protects you from abuse, from bugs in clients that loop, and from high bills.

| Algorithm | How it works | Good | Weak point |
|---|---|---|---|
| Fixed window | Count requests per clock minute | Very simple, little memory | Up to 2x the limit around a window edge |
| Sliding window | Look at the last 60 seconds from now | Smooth and fair | A bit more work or memory |
| Token bucket | Tokens refill at a steady rate, a request spends one | Allows short bursts | Two settings to tune |

The fixed window problem: with a limit of 100 per minute, a client can send 100 requests at 12:00:59 and 100 more at 12:01:00. That is 200 requests in two seconds.

### Token bucket

Imagine a bucket that holds up to 10 tokens. Every second, 2 new tokens drop in. Each request takes one token. If the bucket is empty, the request is refused. A full bucket allows a burst of 10, and the long-run rate is 2 per second.

```javascript
export class TokenBucket {
  constructor({ capacity, refillPerSec, now = Date.now }) {
    this.capacity = capacity;        // largest burst
    this.refillPerSec = refillPerSec;
    this.now = now;                  // can be replaced in tests
    this.tokens = capacity;          // start full
    this.last = now();
  }

  take(cost = 1) {
    const t = this.now();
    const elapsedSec = (t - this.last) / 1000;
    // Refill for the time that passed, but never above capacity.
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsedSec * this.refillPerSec,
    );
    this.last = t;

    if (this.tokens < cost) return false;   // refuse
    this.tokens -= cost;
    return true;                            // allow
  }
}
```

### A Redis rate limiter

With several servers, the counter must live in a shared place. Redis is the usual choice. The count and the expiry must be set in **one atomic step**, so we use a small **Lua script**. Redis runs a script fully before it does anything else.

```javascript
// middlewares/rateLimit.js : fixed window in Redis
const SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count`;

export const rateLimit = ({ limit, windowSec }) =>
  async (req, res, next) => {
    const windowId = Math.floor(Date.now() / 1000 / windowSec);
    const key = `rl:${req.user?.id ?? req.ip}:${windowId}`;
    try {
      const count = await redis.eval(SCRIPT, {
        keys: [key],
        arguments: [String(windowSec)],
      });
      res.set('RateLimit-Limit', String(limit));
      res.set('RateLimit-Remaining', String(Math.max(0, limit - count)));
      if (count > limit) {
        res.set('Retry-After', String(windowSec));
        return res.status(429).json({
          error: { code: 'RATE_LIMITED', message: 'Too many requests' },
        });
      }
      next();
    } catch {
      next();   // Redis is down: let the request pass ("fail open")
    }
  };
```

:::interview Design a rate limiter for an API that runs on many servers.
The state must be shared, so I keep counters in Redis, keyed by user id or IP address. For a simple version I use a fixed window with `INCR` and `EXPIRE` inside a Lua script, so the two commands are atomic. To avoid the burst at window edges I use a sliding window counter or a token bucket, also in a Lua script. The API returns `429` with a `Retry-After` header and `RateLimit` headers. I decide per route whether to fail open or closed when Redis is down.
:::

:::revise
- Redis keeps data in memory with an optional TTL per key.
- Cache-aside: read the cache, on a miss read the database and fill the cache.
- On writes, update the database, then delete the cache key. Always set a TTL too.
- Stampede protection: one loader per key, plus jitter on TTLs.
- Fixed window is simple but bursty at edges. Sliding window is smooth. Token bucket allows bursts.
- On many servers, keep counters in Redis and make the steps atomic with a Lua script.
:::

# Background jobs and message queues

*Do slow work later, outside the request, and let services talk through messages without losing any.*

## Why this matters

In a busy restaurant, the cashier does not cook your food while you stand at the counter. He gives you a token number and the kitchen works on it. You are free in two seconds, and the kitchen can work at its own speed.

A **queue** is that token system. The API puts a **job** (a small description of work) into the queue and answers the user at once. A separate program called a **worker** takes jobs from the queue and does the work.

Use a queue for work that is slow (emails, PDFs, image resizing), work that may fail and need a retry (webhooks, notifications), and work that comes in spikes, which the queue absorbs while workers drain it steadily.

:::flow A job queue
API | adds a job
Queue | stored in Redis
Worker | takes the job
Done | or retry later
:::

## A job queue with BullMQ

**BullMQ** is a popular job queue library for Node.js that stores jobs in Redis. Install it with `npm install bullmq`. The part that adds jobs is the **producer**. The part that processes them is the **worker**. They are normally two separate processes.

```javascript
// queues/email.queue.js (used by the API process)
import { Queue } from 'bullmq';

const connection = { host: '127.0.0.1', port: 6379 };

export const emailQueue = new Queue('email', { connection });

export function queueWelcomeEmail(user) {
  // Put only small data in a job: ids, not whole documents.
  return emailQueue.add(
    'welcome',
    { userId: String(user._id), email: user.email },
    {
      attempts: 5,                                    // try up to 5 times
      backoff: { type: 'exponential', delay: 2000 },  // 2s, 4s, 8s, ...
      removeOnComplete: 1000,   // keep only the last 1000 finished jobs
      removeOnFail: 5000,
    },
  );
}
```

```javascript
// workers/email.worker.js (a separate process: node email.worker.js)
import { Worker } from 'bullmq';
import { sendWelcomeEmail } from '../services/mail.service.js';

const connection = { host: '127.0.0.1', port: 6379 };

const worker = new Worker(
  'email',
  async (job) => {
    // If this function throws, BullMQ retries the job later.
    if (job.name === 'welcome') await sendWelcomeEmail(job.data);
  },
  { connection, concurrency: 5 },   // 5 jobs at the same time
);


// Finish the current jobs before the process stops.
process.on('SIGTERM', () => worker.close());
```

## Kafka concepts

A job queue gives each job to **one** worker, and the job is removed when done. **Apache Kafka** is different. It is an **event log**: an ordered list of events that is stored for a set time. Many independent readers can read the same events, each at its own position. Think of a newspaper. It is printed once, many people read it, and yesterday's copy is still there.

| Word | Meaning |
|---|---|
| **Broker** | One Kafka server. A cluster has several |
| **Topic** | A named stream of events, for example `orders` |
| **Partition** | A topic is split into partitions. Order is kept **inside** one partition |
| **Offset** | The position number of a message in its partition |
| **Producer / Consumer** | Writes messages to a topic / reads them |
| **Consumer group** | A team of consumers that share the work of one topic |

The examples below use the `kafkajs` client, created with `new Kafka({ clientId, brokers })`. Two rules explain most of Kafka:

1. Messages with the **same key** go to the **same partition**. So all events of one order (key = order id) stay in the right order.
2. Inside one consumer group, each partition is read by only one consumer. So the number of partitions is the upper limit of parallel work in a group. A **different** group gets its own full copy of the stream.

## At-least-once delivery and idempotent consumers

Networks fail. A consumer can process a message and crash before it saves its offset. After the restart, it gets the same message again. This is **at-least-once delivery**: no message is lost, but some arrive twice. It is the normal mode for Kafka and for job queues.

So the consumer must be **idempotent**: handling the same message twice must give the same result as handling it once. The usual trick: every event has a unique id, and the consumer records the ids it has finished.

```javascript
// The enrollment service reacts to "order.paid" events.
const consumer = kafka.consumer({ groupId: 'enrollment-service' });
await consumer.connect();
await consumer.subscribe({ topic: 'orders' });

await consumer.run({
  // The offset is saved after this function finishes without error.
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    if (event.type !== 'order.paid') return;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // _id is unique: a second insert of the same id fails.
        await ProcessedEvent.create([{ _id: event.id }], { session });
        await Enrollment.create(
          [{ user: event.userId, course: event.courseId }],
          { session },
        );
      });
    } catch (err) {
      if (err.code !== 11000) throw err;   // real error: retry later
      // 11000 = duplicate key: we handled this event before. Skip.
    } finally {
      await session.endSession();
    }
  },
});
```

## The transactional outbox pattern

A service often must do two things: save data in its database **and** publish an event. Doing both directly is called a **dual write**, and it is unsafe. If the database write works and the publish fails, other services never hear about the order. If you publish first and the database write fails, you announced an order that does not exist.

The **outbox pattern** fixes this. Write the event into an `outbox` collection **in the same transaction** as the data. A separate small process, the **relay**, reads the outbox and publishes to Kafka. It is like putting a letter in the "outgoing" tray on your desk: the office boy posts it later, and it cannot be forgotten. The relay reads unsent outbox documents in order, publishes each one with `producer.send`, and then marks it as sent. If it crashes in between, the event is sent again, which is safe because consumers are idempotent.

```javascript
import { randomUUID } from 'node:crypto';

// 1. One transaction: the order AND the event, or neither.
await session.withTransaction(async () => {
  const [order] = await Order.create(
    [{ user: userId, course: courseId, amount, status: 'paid' }],
    { session },
  );
  await Outbox.create(
    [{
      topic: 'orders',
      key: String(order._id),
      payload: {
        id: randomUUID(),            // event id, used for dedupe
        type: 'order.paid',
        orderId: String(order._id),
        userId: String(userId),
        courseId: String(courseId),
      },
    }],
    { session },
  );
});
```

:::warn
Do not assume a message arrives exactly once. Design every consumer and every job so that running it twice is harmless. A worker that sends "payment received" emails or adds wallet money without a dedupe check will one day do it twice.
:::

:::interview What does at-least-once delivery mean, and how do you deal with duplicates?
The system promises that every message is delivered, but in failure cases the same message can be delivered more than once, for example when a consumer crashes after doing the work and before saving its offset. I deal with it by making consumers idempotent: each event carries a unique id, and the consumer stores processed ids with a unique index, inside the same transaction as its own changes. A duplicate then fails the unique check and is skipped.
:::

:::revise
- Move slow or retryable work out of the request into a queue. Answer the user at once.
- BullMQ: a producer adds jobs to Redis, a worker processes them with retries and backoff.
- Kafka is an ordered log. Same key means same partition, which keeps order.
- One partition is read by one consumer per group. Different groups each get all messages.
- Delivery is at-least-once, so every consumer must be idempotent.
- Outbox: save the event in the same transaction as the data, publish it later with a relay.
:::

# Microservices and service communication

*When to split a backend into services, how the services talk, and how to stop one failure from spreading.*

## Why this matters

A small shop has one person who sells, bills and packs. It works well. A big mall has separate teams for billing, security and delivery, and they need phones, rules and managers to work together. The mall can serve more people, but it is much harder to run.

- A **monolith** is one application that holds all features and is deployed as one unit.
- **Microservices** are many small applications. Each owns one business area (users, orders, payments), has its own database, and is deployed on its own.

## Monolith first

Microservices solve **team and scale** problems. They do not make code cleaner by themselves. They add network calls, partial failures, harder debugging and more deployment work.

A sensible path: start with a **modular monolith**. That is one app with clear folders per business area (the structure from the Express chapter), where modules call each other only through their service functions. If one module later needs its own scaling or its own team, you can cut it out along that clean line.

:::warn
Do not split a small project into microservices to look modern. If your services share one database, or must always be deployed together, you have built a **distributed monolith**: all the pain of both styles and the benefits of neither.
:::

## How services talk

| Style | How | Use it when |
|---|---|---|
| REST over HTTP | JSON requests, wait for the answer | Simple calls, public APIs |
| gRPC | Binary messages over HTTP/2, with a typed contract | Fast internal calls between services |
| Events | Publish to Kafka or a queue, no waiting | Others should react, the caller does not need an answer |

REST and gRPC are **synchronous**: the caller waits. If the other service is down, the caller has a problem right now. Events are **asynchronous**: the caller publishes and moves on. The other service can be down for a minute and catch up later.

## The API gateway

Clients should not need to know the address of 12 services. An **API gateway** is the single front door, like the reception desk of an office that sends every visitor to the right room.

The gateway handles the tasks that are the same for all services: checking the token, rate limiting, CORS, request logging and routing. The services behind it stay simple.

## Timeouts and retries with backoff

Every network call can hang. Without a timeout, a slow service makes its callers slow, then their callers, until everything is stuck. So the first rule: **every call has a timeout**.

A failed call can be tried again, but not at once and not forever. **Exponential backoff** means waiting longer after each failure: 200 ms, 400 ms, 800 ms. **Jitter** adds randomness, so 1000 clients do not all retry in the same millisecond.

```javascript
// utils/http.js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getJson(url, { timeoutMs = 2000 } = {}) {
  // AbortSignal.timeout cancels the request after timeoutMs.
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} from ${url}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function retry(fn, opts = {}) {
  const { retries = 3, baseMs = 200, maxMs = 5000 } = opts;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Retry network errors, timeouts, 5xx and 429. Never other 4xx.
      const retryable =
        !err.status || err.status >= 500 || err.status === 429;
      if (!retryable || attempt >= retries) throw err;

      const cap = Math.min(maxMs, baseMs * 2 ** attempt);
      await sleep(Math.random() * cap);   // "full jitter"
    }
  }
}

// const course = await retry(() => getJson(`${COURSE_URL}/courses/42`));
```

:::warn
Retry only **idempotent** calls. Retrying `GET /courses/42` is safe. Retrying `POST /payments` can charge the user twice, unless the request carries an idempotency key that the other service respects.
:::

## The circuit breaker

In your house, a fuse or MCB cuts the power when something is wrong, so the wiring does not burn. A **circuit breaker** does the same for calls to another service. If the service keeps failing, the breaker "opens" and your code fails fast without calling it. This gives the sick service time to recover and keeps your own service quick.

| State | What happens |
|---|---|
| **Closed** | Normal. Calls go through. Failures are counted |
| **Open** | Calls fail at once, with no network call |
| **Half-open** | After a cool-down, one test call is allowed. Success closes the breaker, failure opens it again |

```javascript
export class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetMs = 10_000 } = {}) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetMs = resetMs;
    this.state = 'CLOSED';
    this.failures = 0;
    this.openedAt = 0;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt < this.resetMs) {
        throw new Error('Circuit is open');   // fail fast
      }
      this.state = 'HALF_OPEN';               // allow one test call
    }
    try {
      const result = await this.fn(...args);
      this.state = 'CLOSED';                  // healthy again
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures += 1;
      const tooMany = this.failures >= this.failureThreshold;
      if (this.state === 'HALF_OPEN' || tooMany) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}
```

Create one breaker per remote dependency and add a **fallback** around `breaker.call()`, for example showing the course page without reviews when the reviews service is down. This is called **graceful degradation**. In production, teams often use a tested library such as `opossum`.

:::interview How do services stay consistent without a shared transaction?
Each service owns its data and changes it in a local transaction. Changes that span services are done as a chain of steps connected by events, often called a saga. Each step publishes an event (safely, with the outbox pattern), and the next service reacts. If a later step fails, earlier steps are undone with compensating actions, for example a refund. The system is eventually consistent: correct after a short delay, not at every instant.
:::

:::revise
- Start with a modular monolith. Split only for team or scaling reasons.
- Each microservice owns its database. A shared database means a distributed monolith.
- REST and gRPC are synchronous calls. Events are asynchronous and looser.
- An API gateway is the single entry point: auth, rate limits, routing.
- Every network call needs a timeout. Retry only idempotent calls, with backoff and jitter.
- A circuit breaker fails fast when a service is down: closed, open, half-open.
:::

# File uploads and streaming

*Receiving files safely, sending large data without filling memory, and letting clients upload straight to storage.*

## Why this matters

## How an upload arrives

A JSON body cannot carry a binary file well. Browsers send files as `multipart/form-data`: a body that is cut into parts, one per form field or file. `express.json()` does not read this format. The usual middleware for it is **multer** (`npm install multer`).

```javascript
// middlewares/upload.js
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),      // file ends up in req.file.buffer
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },   // 2 MB, one file
  fileFilter(req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);                   // accept
    } else {
      cb(new AppError(415, 'BAD_FILE_TYPE', 'Only JPEG, PNG or WebP'));
    }
  },
}).single('avatar');                    // name of the form field
```

```javascript
// routes/user.routes.js
router.put('/me/avatar', requireAuth, uploadAvatar,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, 'NO_FILE', 'File is required');

    // We choose the name. Never use file.originalname in a path.
    const key = `avatars/${req.user.id}/${randomUUID()}`;
    const url = await storage.save(key, req.file.buffer);   // S3, etc.
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    res.json({ data: { avatar: url } });
  }));
```

When a file is larger than the limit, multer passes an error with the code `LIMIT_FILE_SIZE` to `next`. Map it to status `413` (Payload Too Large) in your central error handler.

:::warn
Do not trust anything the client says about a file. The file name can contain `../` to escape your folder (a **path traversal** attack), so create your own name. The `mimetype` comes from the client too, so for sensitive cases check the first bytes of the file as well. And never use memory storage for large files: twenty users uploading 200 MB each would need 4 GB of RAM.
:::

## Do not keep files on the app server

In production you run several copies of your server. A file saved on the disk of one copy is not visible to the others and is lost on the next deployment. Store files in **object storage** (Amazon S3, Cloudflare R2, Google Cloud Storage or similar), and store only the URL or key in MongoDB.

## Direct upload with a presigned URL

For big files, do not pass the bytes through your API at all. A **presigned URL** is a temporary link, signed by your backend, that lets the client upload **one** file straight to the storage. It is like a gate pass that is valid for five minutes and for one parcel.

```javascript
// services/upload.service.js
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function createUploadUrl(userId, contentType) {
  const key = `videos/${userId}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  // The link works for 300 seconds and only for this key.
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { url, key };
}
```

## Streaming a download

To send a large file, connect the file stream to the response stream. Memory use stays flat, whatever the file size.

```javascript
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

router.get('/reports/:name', requireAuth, asyncHandler(async (req, res) => {
  // basename() drops any folder part such as "../../etc".
  const file = path.join(REPORT_DIR, path.basename(req.params.name));

  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) {
    throw new AppError(404, 'NOT_FOUND', 'Report not found');
  }

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': info.size,
    'Content-Disposition': 'attachment; filename="report.pdf"',
  });
  // Sends chunk by chunk and respects backpressure.
  await pipeline(createReadStream(file), res);
}));
```

If the user cancels the download, `pipeline` rejects with a "premature close" error. That is normal. Your error handler already checks `res.headersSent`, so it will not try to send a second response. The same idea works for exports: read documents one by one with a Mongoose `.cursor()` and write each line to the response, so 500,000 rows never sit in memory.

:::interview How would you let users upload a 2 GB video?
Not through the API server. The client asks the API for a presigned URL, and the API checks the user and the file type and signs a short-lived upload link for object storage. The client uploads straight to storage, in parts if the storage supports multipart upload, so a failed part can be sent again. Then the client tells the API, or the storage sends an event, and a background job does the heavy processing. The database stores only the object key and metadata.
:::

:::revise
- Files arrive as `multipart/form-data`. Use multer with a size limit and a type filter.
- Create your own file names. Never trust the client's file name or type.
- Store files in object storage and keep only the key or URL in the database.
- For large files, give the client a presigned URL and let it upload directly.
- Stream downloads and exports with `pipeline` or a cursor, never load everything into memory.
:::

# Testing, logging and observability

*How to know that your code works before release, and how to see what it does after release.*

## Why this matters

A car has two kinds of safety. Before it leaves the factory it is tested. On the road it has a dashboard: speed, fuel and warning lights. Backends need both. **Tests** catch bugs before release. **Observability** (logs, metrics, health checks) shows you what happens in production, where you cannot attach a debugger.

## Unit tests and integration tests

| | Unit test | Integration test |
|---|---|---|
| Tests | One function alone | Several parts together: route, middleware, database |
| Speed | Milliseconds | Slower |
| Finds | Logic mistakes | Wiring mistakes: wrong route, bad query, missing middleware |
| How many | Many | Fewer, for the important flows |

Node.js has a built-in test runner, `node:test`, so you can start without any install. Jest and Vitest are popular alternatives with the same ideas: a test has a name, runs some code, and **asserts** (checks) the result.

```javascript
// test/pagination.test.js : a unit test
import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '../src/utils/pagination.js';

test('uses defaults when the query is empty', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, skip: 0 });
});

test('never allows a limit above the maximum', () => {
  const result = parsePagination({ page: '2', limit: '500' });
  assert.equal(result.limit, 100);
  assert.equal(result.skip, 100);
});
```

Run all test files with `node --test`.

For integration tests, **supertest** (`npm install --save-dev supertest`) sends real HTTP requests to your Express app without opening a port. This is why `app.js` only builds the app and `server.js` does the listening.

```javascript
// test/courses.test.js : an integration test
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('POST /courses rejects bad input with 400', async () => {
  const res = await request(app)
    .post('/api/v1/courses')
    .set('Authorization', `Bearer ${testToken('instructor')}`)
    .send({ title: 'x', price: -5 });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});
```

For the database, use a real MongoDB that is only for tests: a local Docker container or the `mongodb-memory-server` package. Clean the collections before each test, so tests do not depend on each other.

## Structured logging

`console.log('user logged in ' + id)` is fine on your laptop. In production you have millions of lines from many servers. You need to **search** them. **Structured logging** means each log line is a JSON object with fields, so a log tool can filter by `userId` or `status`.

**pino** is a fast JSON logger for Node.js (`npm install pino`).

```javascript
// utils/logger.js
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // Never write secrets to logs.
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password'],
});

// middlewares/requestLogger.js
import { randomUUID } from 'node:crypto';

export function requestLogger(req, res, next) {
  // Reuse the id from the gateway, or make a new one.
  req.id = req.get('X-Request-Id') ?? randomUUID();
  res.set('X-Request-Id', req.id);
  req.log = logger.child({ requestId: req.id });   // id on every line

  res.on('finish', () => {
    req.log.info(
      { method: req.method, path: req.originalUrl, status: res.statusCode },
      'request completed',
    );
  });
  next();
}
```

The **request id** is the key trick. Every log line of one request carries the same id. When a user reports a problem, you search for that id and see the whole story. Pass the id on to other services in the `X-Request-Id` header, so the story continues there.

:::warn
Do not log passwords, tokens, card numbers or full request bodies. Logs are copied to many systems and read by many people. A leaked log file with tokens is a security incident. Log ids and facts, not secrets.
:::

## Health checks

A load balancer or a container platform needs to ask your service "are you fine?". Give it two endpoints.

- **Liveness**: is the process alive? If not, restart it.
- **Readiness**: can it serve traffic right now? If not, stop sending requests to it, but do not kill it.

Liveness (`GET /health/live`) just returns `200`. Readiness (`GET /health/ready`) checks what the app cannot work without, for example `mongoose.connection.readyState === 1` and `await redis.ping()`, and returns `503` when a check fails.

## Metrics

Logs tell you about **one** request. **Metrics** are numbers over time for **all** requests: how many, how slow, how many failed. Alerts are built on metrics.

Four numbers describe the health of any API. They are often called the "golden signals": **traffic** (requests per second), **errors** (share of failed requests), **latency** (how long requests take) and **saturation** (how full the CPU, memory and connection pools are).

For latency, look at **percentiles**, not the average. "p95 = 300 ms" means 95 out of 100 requests were faster than 300 ms. An average hides the slow requests that annoy real users.

**Prometheus** is a common tool that collects metrics from a `/metrics` endpoint on your service, which the `prom-client` package can create. The third tool is **tracing** (for example with OpenTelemetry), which shows where one request spent its time across services.

:::interview How do you debug a slow or failing request in production?
I start from the request id and search the structured logs for it to see the path and the error. Then I look at metrics: is latency or the error rate up for one route or for all, and since when? Did a deployment happen then? I check dependencies such as slow database queries, Redis, and other services, and the saturation numbers: CPU, memory, event loop lag, connection pool. With tracing, I can see which step took the time.
:::

:::revise
- Unit tests check one function. Integration tests check the route, middleware and database together.
- Export `app` without listening, so supertest can call it.
- Log JSON with a request id on every line. Never log secrets.
- Liveness says "the process runs". Readiness says "I can take traffic now".
- Watch traffic, errors, latency (p95, p99) and saturation.
- Logs, metrics and traces are the three pillars of observability.
:::

# Deployment and scaling

*Packaging the app, running many copies of it, and releasing new versions without dropping a single request.*

## Why this matters

## Config comes from the environment

The **same code** must run on your laptop, in staging and in production. Only the configuration changes: database address, secrets, log level. Read all of it from environment variables, as shown in the `config/env.js` file of the security chapter. Never write `if (hostname === 'prod-server-1')` in code.

Also set `NODE_ENV=production` there, because Express and many libraries turn on faster and safer behaviour with it.

## Docker basics

A tiffin box carries a full meal: you can open it anywhere and eat the same food. **Docker** packs your app with its Node.js version and its packages into one **image**. A running copy of an image is a **container**. The same image runs on any machine that has Docker.

```dockerfile
# Small official image with a current LTS version of Node.js
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy the package files first. Docker caches this layer, so
# "npm ci" runs again only when the dependencies change.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now copy the source code.
COPY src ./src

# Do not run as root.
USER node

EXPOSE 3000

# Start node directly so that it receives SIGTERM.
CMD ["node", "src/server.js"]
```

`npm ci` installs the exact versions from `package-lock.json`. `--omit=dev` leaves out test tools. Secrets are passed when the container starts. They are never copied into the image.

:::warn
Do not use `CMD ["npm", "start"]` in a container. Then `npm` is the main process, and the stop signal may not reach your Node.js program in a clean way. Your graceful shutdown code never runs, and the platform kills the container after a wait. Start `node` directly.
:::

## Scaling

**Vertical scaling** means a bigger machine: more CPU, more RAM. It is simple, but it has a limit and one machine is still one point of failure. **Horizontal scaling** means more machines running the same app, behind a **load balancer** that spreads the requests.

:::flow Horizontal scaling
Clients
Load balancer | spreads requests
App 1, App 2, App 3 | same image
MongoDB + Redis | shared state
:::

Horizontal scaling works only if the app is **stateless**: no server keeps data in its own memory or disk that another request needs. Request 1 may reach server A and request 2 server B.

| Kept on one server (bad) | Shared place (good) |
|---|---|
| Sessions in a JavaScript object | Redis, or JWT |
| Uploaded files on local disk | Object storage |
| Rate limit counters in memory | Redis |
| A `setInterval` cron job in every copy | One scheduler, or a repeatable job in a queue |

One Node.js process uses one CPU core for JavaScript. On a machine with 8 cores, run 8 processes. In containers, the usual way is to run more containers. On a plain server, the `node:cluster` module or a process manager such as PM2 starts one process per core.

## Graceful shutdown

When a platform wants to stop your container, for a deployment or for scaling down, it sends the signal `SIGTERM`. Then it waits some seconds and after that it kills the process. A shop that is closing does not throw customers out. It locks the door for new people, finishes serving those inside, and then turns off the lights. This is **graceful shutdown**.

```javascript
// server.js
import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { redis } from './config/redis.js';

await mongoose.connect(env.MONGO_URI);
const server = app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;         // run only once
  shuttingDown = true;
  console.log(`${signal} received, closing`);

  // Safety net: if cleanup hangs, exit anyway after 10 seconds.
  setTimeout(() => process.exit(1), 10_000).unref();

  // 1. Stop taking new connections, wait for running requests.
  server.close(async () => {
    // 2. Close the connections to other systems.
    await mongoose.connection.close();
    await redis.quit();
    process.exit(0);                // 3. Leave with a success code
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));    // Ctrl + C
```

For an even smoother stop, make the readiness endpoint return `503` as soon as `shuttingDown` is true. The load balancer then stops sending new requests before the server closes. Queue workers need the same care: finish the current job, then exit.

## Zero-downtime deployment

With several copies and graceful shutdown, you can update without any downtime. A **rolling deployment** replaces the copies one at a time.

:::flow Rolling deployment
Start new copy | version 2
Wait until ready | readiness check passes
Send it traffic | load balancer adds it
Stop one old copy | SIGTERM, graceful
Repeat | until all are new
:::

During the rollout, version 1 and version 2 run at the same time. So every change must be **backward compatible**, above all for the database. To rename a field safely, first deploy code that reads and writes both names, then move the old data, then deploy code that uses only the new name.

:::interview How do you scale a Node.js application?
First I measure to find the real bottleneck. Inside the app: no blocking code on the event loop, indexes, caching, and queues for slow work. Then horizontally: run several stateless copies behind a load balancer, one process per CPU core, with sessions, cache and rate limit counters in Redis and files in object storage. The database scales with indexes, connection pooling, read replicas and, when really needed, sharding. Health checks and graceful shutdown let the platform add and remove copies safely.
:::

:::revise
- One codebase, config from environment variables, `NODE_ENV=production` in production.
- A Docker image packs the app with its runtime. Use `npm ci`, a non-root user and `CMD ["node", ...]`.
- Horizontal scaling needs stateless servers: shared state goes to Redis, the database or object storage.
- One Node.js process uses one core. Run one process or container per core.
- On `SIGTERM`: stop new requests, finish running ones, close connections, exit.
- Rolling deployments need readiness checks and backward compatible changes.
:::

# Interview questions and learning roadmap

*The questions that come up again and again, with model answers, and a plan for what to build next.*

## How to use this chapter

Do not learn these answers by heart. Say your own answer aloud in simple words, then compare. Interviewers like answers with this shape: a one-line definition, how it works, a trade-off, and a short example from your own project.

## Core questions

:::interview What happens when a request reaches your Express server?
The operating system accepts the connection and Node.js parses the HTTP request. Express runs the middleware in the order it was registered: security headers, CORS, body parsing, logging, rate limiting, authentication. The router matches the method and path and runs the route's own middleware, such as validation, and then the controller. The controller calls a service, which talks to the database or cache. The response is sent as JSON. If anything throws, the error middleware formats the error response.
:::

:::interview SQL or MongoDB: how do you choose?
I look at the data and the queries. If the data has many relations, needs joins across many entities and strict multi-row transactions, like accounting, a relational database such as PostgreSQL fits well. If the data is naturally a document that is read as a whole, the shape changes often, or I need easy horizontal scaling, MongoDB fits well. Both can do most jobs today. The team's experience matters too.
:::

:::interview What is the N+1 query problem?
You run one query to load a list of N items, and then one more query per item to load related data. That is N+1 queries. Example: load 50 courses, then load the instructor of each course in a loop. The fix is to load the related data in one step: collect the ids and use one `$in` query, use `populate`, which batches the lookups, or use `$lookup` in an aggregation. For data that is always read together, embedding removes the problem.
:::

:::interview How do you prevent two users from buying the last seat at the same time?
I make the check and the update one atomic database operation. In MongoDB: `findOneAndUpdate({ _id, seatsLeft: { $gt: 0 } }, { $inc: { seatsLeft: -1 } })`. Only one of the two requests matches the filter. The other gets `null` and a "sold out" answer. Reading the value first and then writing it in a second step is the bug, because both requests can read "1 seat left". If several documents are involved, I use a transaction.
:::

## Scenario questions

:::interview Design the backend for a "forgot password" feature.
The user sends an email address. The API always answers "if the account exists, we sent a mail", so nobody can test which emails are registered. If the user exists, I create a random token, store only its hash with a 15 minute expiry, and queue an email with a link that holds the token. The reset route takes the token and the new password, finds the hash, checks the expiry, saves the new bcrypt hash, deletes the token so it works once, and deletes all refresh tokens of the user so every device must log in again. Both routes are rate limited.
:::

## Learning roadmap

Follow the stages in order. Do not move on until you have **built** something with the stage, because reading alone does not stay in memory.

| Stage | Learn | Build |
|---|---|---|
| 1. Basics | HTTP, Node.js core, Express, REST | A notes API with full create, read, update, delete |
| 2. Data | MongoDB, schema design, indexes, validation | Add users, pagination, filters and clean errors |
| 3. Safety | Auth, roles, security middleware, tests | Login with refresh tokens, roles, integration tests |
| 4. Speed | Redis caching, rate limiting, queues | Cache hot routes, email jobs with retries |
| 5. Production | Docker, logging, metrics, graceful shutdown | Deploy it with health checks and a rollback plan |
| 6. Systems | Kafka, outbox, microservices, system design | Split one module into a service that talks by events |

For each project, write a README that explains your choices: why this schema, why this index, what happens when Redis is down. In an interview, that explanation is worth more than the code.

:::warn
The most common mistake while learning backend is watching tutorials without building. The second is building only the happy path. Real backend skill shows in the unhappy paths: bad input, duplicate requests, a dependency that is down, two users acting at the same moment. For every feature, ask "what if this runs twice?" and "what if this fails halfway?".
:::

:::revise
- Shape every answer: definition, how it works, trade-off, example from your project.
- For slow systems: measure first, then indexes, caching, queues and more copies.
- For correctness: atomic updates, unique indexes, idempotency keys, transactions.
- For reliability: timeouts, retries with backoff, circuit breakers, idempotent consumers, outbox.
- Build projects in stages and explain your design choices in the README.
- Always ask: what if this runs twice, and what if this fails halfway?
:::
