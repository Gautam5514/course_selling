---
title: Production Backend & Microservices Architecture
subtitle: A step-by-step playbook for designing, building and running backend services with PostgreSQL, Redis, Kafka and gRPC.
category: Backend
level: Intermediate to Advanced
accent: indigo
tags: backend, microservices, kafka, redis, postgresql, grpc
highlights: Service Boundaries & DDD | REST & gRPC | PostgreSQL in Production | Redis & Kafka | Outbox & Sagas | Resilience & Observability
tagline: Service Boundaries • REST & gRPC • PostgreSQL • Redis • Kafka • Sagas • Resilience
description: Learn how real backend systems are split into services, how those services talk, and how they keep data correct when things fail. Every topic is explained in plain language with commented Node.js, TypeScript and SQL code, dry runs, common mistakes and interview questions with model answers. This handbook assumes you can already build a simple API, and the last chapter is a cheat sheet with a study plan.
---

# Monolith, modular monolith and microservices

*Three ways to organise a backend, what each one costs, and how to know when you should not split.*

## Why it matters

Think of a joint family living in one big house. There is one kitchen, one electricity bill and one front door. Life is simple. If someone wants to change the kitchen, the whole family is affected, but everyone is close and talking is easy.

Now think of the same family in ten separate flats of a housing society. Every flat has its own kitchen and its own bill. One flat can renovate without disturbing the others. But now you need an intercom, a society office, rules for shared water, and a plan for what happens when one flat does not answer the door.

Backend architecture is the same choice. "Microservices" is a popular word, and many beginners think it means "professional". It does not. It is a trade: you get independence, and you pay with complexity. This chapter teaches you to make that trade with open eyes.

## The three styles

- A **monolith** is one application. All features live in one codebase, run in one process, and are deployed (released to the servers) together. They usually share one database.
- A **modular monolith** is still one application and one deployment. But inside, the code is cut into clear **modules** (orders, payments, inventory). Each module has a small public interface, and other modules may use only that interface.
- **Microservices** are many small applications. Each one owns one business area, has its own database, and is deployed on its own. They talk to each other over the network.

| Point | Monolith | Modular monolith | Microservices |
|---|---|---|---|
| Deployments | One | One | One per service |
| Call between features | Function call | Function call through an interface | Network call or event |
| Database | Shared | Shared server, separate tables per module | One per service |
| Transactions | Easy | Easy | Hard (sagas) |
| Team independence | Low | Medium | High |

## What a network call really costs

Inside a monolith, `payments.charge(order)` is a function call. It takes a few nanoseconds and it either returns or throws. Across services, the same line becomes a network call. That changes everything:

1. **It can be slow.** A call may take 5 milliseconds today and 5 seconds tomorrow.
2. **It can fail halfway.** The payment service may charge the card and then crash before it answers. The caller sees an error, but the money is gone. This is called a **partial failure**.
3. **There is no shared transaction.** You cannot roll back another service's database.
4. **Debugging crosses machines.** One user request may touch six services. You need special tools to follow it.
5. **You run more things.** Each service needs its own build, deployment, monitoring and on-call plan.

:::note The price list
Every later chapter of this handbook is a tool for paying one of these costs: gRPC and gateways for communication, the outbox and sagas for missing transactions, timeouts and circuit breakers for failures, tracing for debugging. If you do not need microservices, you do not need to pay most of this bill.
:::

## The modular monolith in code

A modular monolith gives you clean boundaries without the network. The trick is discipline: a module exposes a small **public interface** and hides everything else.

```text
src/
  modules/
    orders/
      index.ts          <- the ONLY file other modules may import
      order.service.ts  <- private
      order.repo.ts     <- private (SQL for the orders tables)
    payments/
      index.ts
      payment.service.ts
      payment.repo.ts
    inventory/
      index.ts
      ...
  app.ts                <- wires the modules to HTTP routes
```

```typescript
// modules/payments/index.ts  -- the public interface of the module
export interface ChargeRequest {
  orderId: string;
  userId: string;
  amountPaise: number;        // money as an integer, never a float
}

export interface ChargeResult {
  paymentId: string;
  status: 'SUCCEEDED' | 'FAILED';
}

// Other modules can call this function and nothing else.
export { charge } from './payment.service';
```

```typescript
// modules/orders/order.service.ts
import { charge } from '../payments';             // allowed: public door
// import { insertPayment } from '../payments/payment.repo';   // NOT allowed

export async function placeOrder(order: NewOrder) {
  // ... save the order ...
  const result = await charge({
    orderId: order.id,
    userId: order.userId,
    amountPaise: order.totalPaise,
  });
  return result.status === 'SUCCEEDED' ? 'CONFIRMED' : 'CANCELLED';
}
```

Three rules keep the modules honest:

- **Import only from `index.ts`** of another module. A lint rule (an automatic code check) can enforce this.
- **Each module owns its tables.** The orders module never writes SQL against payments tables. It may not even `JOIN` them.
- **No shared "utils" that contain business rules.** Shared code is for generic helpers only, such as logging.

If you follow these rules, cutting a module out into a real service later is a mechanical job: replace the function call with a network call. If you do not follow them, no amount of Kubernetes will save you.

## When to split, and when not to

Microservices solve **organisation and scaling** problems. They do not solve "our code is messy". Messy code split into services becomes messy code with network errors.

| Signal | What it suggests |
|---|---|
| One small team, product still changing fast | Stay with a (modular) monolith |
| Many teams block each other on every release | Consider splitting along team lines |
| One part needs very different scaling (for example video encoding) | Split that one part |
| One part needs a different technology or strict isolation (payments, security rules) | Split that one part |
| "It looks modern on a resume" | Do not split |

:::warn The distributed monolith
The worst result is a system that is split into services but still behaves as one unit. The warning signs: services share one database, you must deploy several services together for one feature, or one service being down breaks all the others. You now pay the network cost and get no independence. Before you split, check that each service can be changed, deployed and run alone.
:::

Good reasons **not** to split yet:

- You do not know the domain well. Wrong boundaries are very expensive to fix once they are network boundaries.
- You have no automated deployment, no central logs and no monitoring. Fix these first.
- Your scaling problem is one slow SQL query. Add an index, not a service.

## How to split safely

When a split is really needed, do not rewrite everything. Use the **strangler fig** approach, named after a plant that slowly grows around a tree. You put a router in front of the monolith and move one feature at a time.

:::flow Moving one module out of a monolith
Clean module | clear interface inside the monolith
Own tables | no joins from other modules
New service | same interface, now over the network
Router switch | send a small share of traffic first
Delete old code | when the new path is stable
:::

:::example A decision, worked through
A team of five builds an online store. Orders, payments and catalogue live in one Node.js app with one PostgreSQL database. Releases happen daily without trouble. Image resizing for product photos sometimes uses all the CPU and slows down checkout.

- Splitting everything into 8 services: no. One team, no release conflicts, no gain.
- Moving image resizing into a separate worker that reads jobs from a queue: yes. It has different scaling needs, it has no shared tables, and failure there should not hurt checkout.

Result: a modular monolith plus one worker. This is a very common and very healthy shape.
:::

:::interview When would you choose a monolith over microservices?
"I would start with a modular monolith when the team is small, the domain is still changing, or we do not yet have strong deployment and monitoring. A monolith gives function calls instead of network calls and real database transactions, so it is faster to build and easier to debug. I would keep clear module boundaries and separate tables per module, so we can extract a service later. I would split only when there is a concrete reason: teams blocking each other on releases, a part with very different scaling or security needs, or a part that must stay up when others fail. I would also mention the risk of a distributed monolith, where services share a database and must deploy together."
:::

:::revise
- A monolith is one deployable app. A modular monolith adds strict module boundaries inside it. Microservices are separately deployed apps with separate databases.
- A network call can be slow, can fail halfway, and cannot join a database transaction.
- Microservices fix team and scaling problems, not messy code.
- In a modular monolith, import only a module's public interface and never touch its tables.
- A distributed monolith (shared database, joint deployments) has the costs of both styles.
- Split one part at a time behind a router: the strangler fig approach.
:::

# Service boundaries and domain-driven design

*How to decide what belongs in one service, using the language of the business instead of the tables of the database.*

## Why it matters

In a hospital, the word "patient" means different things at different desks. At reception, a patient is a name, a phone number and an appointment time. In the lab, a patient is a sample number and a list of tests. In billing, a patient is an invoice. Nobody tries to keep one giant register with every detail for every desk. Each desk keeps what it needs.

Most bad microservice designs come from ignoring this. Teams create one "User service", one "Product service" and one "Order service" because those are the tables they see. Then every feature needs changes in all three. **Domain-driven design** (DDD) is a set of ideas for finding better lines. You do not need the whole book of DDD. You need five ideas.

## Idea 1: ubiquitous language

The **domain** is the business area your software serves, for example online shopping. **Ubiquitous language** means developers and business people use the same words, and the code uses those words too. If the warehouse team says "reserve stock", the function is called `reserveStock`, not `updateInventoryFlag`.

This sounds small. It is not. When the words in code match the words in meetings, misunderstandings become visible early.

## Idea 2: bounded context

A **bounded context** is an area where one word has exactly one meaning and one model. Outside that area, the same word may mean something else, and that is fine.

Take the word "product" in an online store:

| Context | What "product" means there | Data it keeps |
|---|---|---|
| Catalogue | Something to show and search | Title, photos, description, price |
| Inventory | Something to count | SKU, warehouse, quantity on hand |
| Shipping | Something to pack | Weight, size, fragile or not |
| Reviews | Something to rate | Stars, comments |

**SKU** means "stock keeping unit": the code a warehouse uses for one exact item, such as a blue T-shirt in size M.

One giant `products` table with 60 columns would force all four teams to change the same thing. Four small models, each inside its own context, let each team move alone. They share only the product ID.

A bounded context is the best first guess for a service boundary. One service per bounded context is a good starting rule. One service per database table is a bad one.

## Idea 3: entities, value objects and aggregates

Inside one context, DDD gives names to three kinds of building blocks.

- An **entity** has an identity that stays the same while its data changes. An order is an entity: order `A17` is still order `A17` after its status changes.
- A **value object** has no identity. It is defined only by its values. Money (`499 INR`) and an address are value objects. Two `499 INR` values are equal and interchangeable.
- An **aggregate** is a small group of entities and value objects that must always be consistent together. One entity is the **aggregate root**, the only door to the group. An order with its order lines is an aggregate. The order is the root.

The aggregate matters because it sets the size of a transaction: **one transaction changes one aggregate**. Rules that must hold at every moment are called **invariants**. They live inside the aggregate.

```typescript
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface OrderLine { sku: string; quantity: number; pricePaise: number }

export class Order {
  private lines: OrderLine[] = [];
  private status: OrderStatus = 'PENDING';

  constructor(readonly id: string, readonly userId: string) {}

  addLine(line: OrderLine) {
    // Invariant: only a pending order can change.
    if (this.status !== 'PENDING') throw new Error('Order is closed');
    // Invariant: quantity is a positive whole number.
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    this.lines.push(line);
  }

  get totalPaise(): number {
    return this.lines.reduce((sum, l) => sum + l.quantity * l.pricePaise, 0);
  }

  confirm() {
    if (this.lines.length === 0) throw new Error('Order has no items');
    if (this.status !== 'PENDING') throw new Error('Order is closed');
    this.status = 'CONFIRMED';
  }
}
```

Nobody outside can push into `lines` or set `status` directly. Every change goes through a method that checks the rules. This is the whole point of an aggregate root.

:::tip
Refer to other aggregates by ID, not by object. An order stores `userId`, not a `User` object. This keeps aggregates small and makes it easy to move them to different services later.
:::

## Idea 4: domain events

A **domain event** is a fact that already happened in the business, written in past tense: `OrderPlaced`, `PaymentFailed`, `StockReserved`. Events are how one context tells others what happened without knowing who listens. We build a full event system in the Kafka and outbox chapters. For now, remember the naming rule: an event is a fact in the past, not an instruction.

## Idea 5: the context map and the anti-corruption layer

A **context map** is a simple drawing of your contexts and who depends on whom. If orders needs data from catalogue, then catalogue is **upstream** (it provides) and orders is **downstream** (it consumes).

When you depend on a model you do not control, such as a payment provider or an old legacy system, do not let its strange field names spread through your code. Put a small translator at the border. DDD calls this an **anti-corruption layer**.

```typescript
// What the outside provider sends us (we do not control this shape).
interface ProviderPayment {
  txn_ref: string;
  amt: string;               // "499.00" as a string, in rupees
  st: 'S' | 'F' | 'P';       // success, failed, pending
}

// Our own clean model.
interface Payment {
  providerRef: string;
  amountPaise: number;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
}

const STATUS = { S: 'SUCCEEDED', F: 'FAILED', P: 'PENDING' } as const;

// The anti-corruption layer: the only place that knows both shapes.
export function toPayment(p: ProviderPayment): Payment {
  return {
    providerRef: p.txn_ref,
    amountPaise: Math.round(Number(p.amt) * 100),
    status: STATUS[p.st],
  };
}
```

If the provider changes its format, you change one function. The rest of your service never knew.

## How to find boundaries in practice

You do not find boundaries by staring at tables. You find them by walking through the business.

1. **List the events** in the order they happen: cart checked out, order placed, stock reserved, payment taken, parcel packed, parcel shipped. A workshop that does this with sticky notes is called **event storming**.
2. **Group events** that use the same words and are handled by the same people. Each group is a candidate context.
3. **Check the language.** Where a word changes meaning ("product" for the catalogue team and for the warehouse team), there is a boundary.
4. **Check the data rules.** Things that must change together in one transaction belong together.

:::flow From business flow to services
Events | list what happens, in order
Groups | same words, same people
Contexts | one meaning per word
Services | one per context, each with its own data
:::

Then test each candidate boundary with these questions:

| Question | Good sign | Bad sign |
|---|---|---|
| Can it do its main job if the others are down for a minute? | Yes, mostly | No, it calls three services for every request |
| Does a typical feature change one service? | Yes | It changes four |
| Does it own its data? | Only it writes its tables | Others write its tables |
| Could one team own it fully? | Yes | Ownership is unclear |

The two words to remember are **cohesion** and **coupling**. Cohesion means the things inside a service belong together. Coupling means how much one service must know about another. You want high cohesion inside and low coupling between.

:::warn Entity services and layer services
Two classic wrong cuts. The first is one service per noun: "User service", "Product service", "Order service" that are just thin wrappers around tables. Every business feature then needs many calls between them. The second is one service per technical layer: a "database service", a "validation service", a "notification-formatting service". Cut by business capability instead: checkout, payments, inventory, delivery.
:::

:::example Splitting an online store
Events found in a workshop: `ProductListed`, `PriceChanged`, `CartCheckedOut`, `OrderPlaced`, `StockReserved`, `PaymentCaptured`, `PaymentFailed`, `OrderConfirmed`, `ParcelShipped`, `EmailSent`.

| Context | Events it owns | Data it owns |
|---|---|---|
| Catalogue | `ProductListed`, `PriceChanged` | Titles, photos, prices |
| Ordering | `CartCheckedOut`, `OrderPlaced`, `OrderConfirmed` | Orders and order lines |
| Inventory | `StockReserved` | Stock per SKU |
| Payments | `PaymentCaptured`, `PaymentFailed` | Payment attempts |
| Notifications | `EmailSent` | Message templates, send log |

Notice that the order stores the **price at the time of purchase** in its own lines. It does not look up the catalogue price later. If the price changes tomorrow, yesterday's order must not change. Copying a value across a boundary on purpose is normal and healthy.
:::

:::interview How do you decide the boundaries of a microservice?
"I start from business capabilities, not from tables. I walk through the main flows and list the domain events, then group them by the language and the people who handle them. Each group is a bounded context, which is my first candidate for a service. Then I test the boundary: does the service own its data, can a typical feature be built by changing only this service, and can it keep working for a short time if its neighbours are down? Things that must be consistent in one transaction stay in one service. I avoid entity services that only wrap a table, because they create chatty calls and joint deployments. If I am unsure, I keep the code together as modules in one deployable and split later, because merging services is harder than splitting modules."
:::

:::revise
- Use the business's own words in code: that is ubiquitous language.
- A bounded context is an area where each word has one meaning. It is the best first guess for a service.
- An aggregate is a group that must stay consistent. One transaction changes one aggregate, through its root.
- Refer to other aggregates and other services by ID, and copy values on purpose when history must not change.
- Put an anti-corruption layer at the border of any model you do not control.
- Aim for high cohesion inside a service and low coupling between services. Avoid one service per table.
:::

# REST API design for production

*The rules that make an HTTP API predictable: resources, status codes, pagination, versioning, idempotency and one error format.*

## Why it matters

Think of electrical sockets. You can plug any charger into any socket in your house because both follow one standard. Nobody reads a manual for each socket. A good API feels the same. A developer who has used one endpoint can guess how the others work.

This chapter assumes you already know what `GET` and `POST` are. We focus on the decisions that hurt in production if you get them wrong: retries that create duplicate orders, lists that become slow at page 5,000, and error responses that every client must parse differently.

## Resources and methods

**REST** is a style where the API exposes **resources** (things, named by nouns) and clients act on them with the standard HTTP methods.

- URLs name things: `/orders`, `/orders/A17`, `/orders/A17/items`. Use plural nouns and no verbs.
- The method says what to do. Two properties of methods matter a lot:
  - **Safe** means the call does not change anything on the server.
  - **Idempotent** means doing the same call many times has the same effect as doing it once.

| Method | Use | Safe | Idempotent |
|---|---|---|---|
| `GET` | Read | Yes | Yes |
| `PUT` | Replace a resource fully | No | Yes |
| `PATCH` | Change some fields | No | Not guaranteed |
| `DELETE` | Remove | No | Yes |
| `POST` | Create, or run an action | No | No |

Idempotency decides what is safe to retry. If a `GET` times out, the client can simply try again. If a `POST /orders` times out, the client does not know if the order was created. We solve this later in the chapter.

Some actions do not fit "create, read, update, delete", for example cancelling an order. Two clean options: model the action as a sub-resource (`POST /orders/A17/cancellation`), or use a clear action path (`POST /orders/A17/cancel`). Pick one style and keep it everywhere.

## Status codes that mean something

The status code is the first thing a client, a gateway and a monitoring tool look at. Use it honestly.

| Code | Meaning | Typical use |
|---|---|---|
| `200 OK` | Success with a body | `GET`, `PATCH` |
| `201 Created` | A resource was created | `POST`, with a `Location` header |
| `202 Accepted` | Accepted, work continues in the background | Long jobs |
| `204 No Content` | Success, no body | `DELETE` |
| `400 Bad Request` | The request is malformed | Broken JSON, missing field |
| `401 Unauthorized` | We do not know who you are | Missing or invalid token |
| `403 Forbidden` | We know you, and you may not do this | Wrong role or owner |
| `404 Not Found` | No such resource | Unknown ID |
| `409 Conflict` | The request clashes with the current state | Out of stock, duplicate |
| `412 Precondition Failed` | A condition header such as `If-Match` did not hold | Stale update |
| `422 Unprocessable Content` | Well-formed, but breaks a business rule | Quantity is 0 |
| `429 Too Many Requests` | Rate limit hit | With `Retry-After` |
| `500` | Bug or unexpected failure on our side | Never on purpose |
| `503 Service Unavailable` | Temporarily cannot serve | Overload, dependency down |

:::warn 200 with an error inside
Never return `200 OK` with a body like `{ "success": false }`. Gateways, retries, caches and dashboards all trust the status code. Also keep the meaning of 4xx and 5xx clean: 4xx means "the client must change the request", 5xx means "the server failed and trying again later may work". Clients use this difference to decide about retries.
:::

## Pagination: offset or cursor

A list endpoint must never return "all rows". There are two ways to cut a list into pages.

**Offset pagination** uses `?page=3&limit=20`, which becomes `OFFSET 40 LIMIT 20` in SQL. It is simple and lets users jump to any page. But the database must walk past all the skipped rows, so page 5,000 is slow. And if a new row is inserted while the user is reading, rows shift and the user sees a duplicate or misses one.

**Cursor pagination** (also called keyset pagination) says "give me 20 rows after this exact position". The position is the sort key of the last row the client saw.

```sql
-- First page
SELECT id, status, total_paise, created_at
FROM orders
WHERE user_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 21;                            -- one extra row: is there a next page?

-- Next pages: continue strictly after the last row the client saw
SELECT id, status, total_paise, created_at
FROM orders
WHERE user_id = $1
  AND (created_at, id) < ($2, $3)    -- the cursor
ORDER BY created_at DESC, id DESC
LIMIT 21;
```

Two details make this correct. First, the sort includes `id` as a tie-breaker, because two orders can have the same `created_at`. Second, `(created_at, id) < ($2, $3)` is a **row comparison**: PostgreSQL compares the first values and uses the second only when the first are equal. With an index on `(user_id, created_at, id)`, the database jumps straight to the position. Page 5,000 costs the same as page 1.

```javascript
// Turn the last row into an opaque cursor string, and back.
const encode = (row) =>
  Buffer.from(JSON.stringify([row.created_at, row.id])).toString('base64url');
const decode = (cursor) =>
  JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));

export async function listOrders(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);  // hard cap
  const params = [req.user.id];
  let where = 'user_id = $1';
  if (req.query.cursor) {
    params.push(...decode(req.query.cursor));
    where += ' AND (created_at, id) < ($2, $3)';
  }
  params.push(limit + 1);
  const { rows } = await pool.query(
    `SELECT id, status, total_paise, created_at FROM orders
     WHERE ${where}
     ORDER BY created_at DESC, id DESC LIMIT $${params.length}`,
    params,
  );
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);
  res.json({
    data,
    nextCursor: hasMore ? encode(data[data.length - 1]) : null,
  });
}
```

Only fixed text is placed into the SQL string. Every user value goes through `$1`, `$2` parameters, so there is no SQL injection. A real handler should also wrap `decode` in a `try` and answer `400` for a broken cursor. One more detail: PostgreSQL timestamps have microseconds, but a JavaScript `Date` keeps only milliseconds. If your timestamps can carry microseconds, select the cursor column as text (`created_at::text`) so the cursor stays exact.

| Point | Offset | Cursor |
|---|---|---|
| Jump to page N | Yes | No, only next |
| Speed on deep pages | Gets slower | Stays the same |
| Stable when rows are added | No | Yes |
| Best for | Small admin tables | Feeds, long lists, public APIs |

## Versioning

Once other people use your API, you cannot change it freely. A **breaking change** is anything that can break an existing client: removing a field, renaming it, changing its type, or making an optional input required. Adding a new optional field is not breaking, if clients ignore fields they do not know.

| Way | Example | Remark |
|---|---|---|
| In the path | `/v1/orders` | Most common, easy to see and route |
| In a header | `Accept: application/vnd.shop.v2+json` | Clean URLs, harder to test by hand |
| In a query | `/orders?version=2` | Simple, easy to forget |

Path versioning is the usual choice. The more important rule is: **avoid needing a new version**. Add fields instead of changing them. When you must remove something, announce it, keep both versions for a fixed time, and measure who still calls the old one.

## One error format

If every endpoint invents its own error shape, every client needs special code. Use one format everywhere. A public standard exists for this: **Problem Details for HTTP APIs** (RFC 9457). The response uses the content type `application/problem+json`.

```json
{
  "type": "https://api.example.com/problems/out-of-stock",
  "title": "Item is out of stock",
  "status": 409,
  "detail": "Only 2 units of SKU TSHIRT-M are left.",
  "instance": "/v1/orders",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

`type` is a stable identifier that programs can check. `title` is a short human text for that type. `detail` explains this one case. You may add your own fields, such as `traceId` (to find the request in your logs) or a list of field errors for validation.

```javascript
export class Problem extends Error {
  constructor(status, slug, title, detail) {
    super(title);
    Object.assign(this, { status, slug, detail });
  }
}

// Express error handler: register it after all routes.
export function problemHandler(err, req, res, next) {
  const known = err instanceof Problem;
  const status = known ? err.status : 500;
  if (!known) req.log?.error({ err }, 'unhandled error');
  res.status(status).type('application/problem+json').json({
    type: `https://api.example.com/problems/${known ? err.slug : 'internal'}`,
    title: known ? err.message : 'Internal server error',
    status,
    detail: known ? err.detail : undefined,   // never leak stack traces
    instance: req.originalUrl,
  });
}
```

## Idempotency keys: safe retries for POST

Here is the most important production problem in this chapter. A phone sends `POST /v1/orders`. The server creates the order. The reply is lost because the train entered a tunnel. The app shows "Something went wrong" and the user taps "Pay" again. Now there are two orders.

The fix is an **idempotency key**. The client creates a random ID (a UUID) once per user action and sends it in a header. If the same key arrives again, the server does not do the work again. It returns the stored answer.

```sql
CREATE TABLE idempotency_keys (
  user_id      bigint      NOT NULL,
  key          text        NOT NULL,
  request_hash text        NOT NULL,   -- to detect a reused key
  status_code  int,
  response     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
```

We need one small helper first. It runs a function inside a database transaction (we study transactions in detail in the PostgreSQL chapters). We reuse this `withTx` helper in the whole handbook.

```javascript
// db.js
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Runs fn inside one transaction: commit on success, rollback on error.
export async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();          // always give the connection back
  }
}
```

Now the handler. The key claim, the order and the stored response are written in **one transaction**, so they succeed or fail together.

```javascript
import { createHash } from 'node:crypto';

export async function createOrder(req, res) {
  const key = req.get('Idempotency-Key');
  if (!key) throw new Problem(400, 'missing-key', 'Idempotency-Key required');
  const hash = createHash('sha256')
    .update(JSON.stringify(req.body)).digest('hex');

  const out = await withTx(async (db) => {
    const claim = await db.query(
      `INSERT INTO idempotency_keys (user_id, key, request_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, key) DO NOTHING`,
      [req.user.id, key, hash],
    );
    if (claim.rowCount === 0) return replay(db, req.user.id, key, hash);

    const order = await insertOrder(db, req.user.id, req.body);
    await db.query(
      `UPDATE idempotency_keys SET status_code = 201, response = $3
       WHERE user_id = $1 AND key = $2`,
      [req.user.id, key, JSON.stringify(order)],
    );
    return { status: 201, body: order };
  });
  res.status(out.status).json(out.body);
}
```

```javascript
// The key already exists: return the stored answer.
async function replay(db, userId, key, hash) {
  const { rows } = await db.query(
    `SELECT request_hash, status_code, response FROM idempotency_keys
     WHERE user_id = $1 AND key = $2`,
    [userId, key],
  );
  const saved = rows[0];
  if (saved.request_hash !== hash) {
    // Same key, different body: a client bug. Refuse loudly.
    throw new Problem(422, 'key-reused', 'Key was used for another request');
  }
  return { status: saved.status_code, body: saved.response };
}
```

The handlers in this handbook are `async` functions that throw on errors. Express 5 passes such errors to the error handler by itself. In Express 4 you must catch them and call `next(err)`.

Why does this work even when two copies of the request arrive at the same moment? The primary key allows only one row per `(user_id, key)`. The second `INSERT` waits until the first transaction finishes. If the first one commits, the second sees a conflict, inserts nothing, and replays the saved response. If the first one rolls back, its key row disappears too, and the second request does the work.

:::example Dry run: the reply that got lost
| Step | What happens | Orders in the database |
|---|---|---|
| 1 | App sends `POST /v1/orders` with key `k-91` | 0 |
| 2 | Server claims `k-91`, inserts order `A17`, stores the response, commits | 1 |
| 3 | The `201` reply is lost in the network | 1 |
| 4 | App retries with the same key `k-91` | 1 |
| 5 | Server: key exists, hash matches, returns the stored `201` with order `A17` | 1 |

The user tapped twice. There is one order.
:::

:::note
This simple design works when all the work is inside your own database. If the handler also calls an outside system, such as a payment provider, pass an idempotency key to that system as well, so the outside call is safe to retry too. Delete old keys with a scheduled job, for example after 24 hours.
:::

## Safe updates with ETag

Two admins open the same product page. Both change the price and press save. The second save silently overwrites the first. This is a **lost update**. HTTP has a built-in tool for it. The server sends a version of the resource in the `ETag` header. The client sends that value back in `If-Match` when it updates. If the resource changed in between, the server answers `412 Precondition Failed`, and the client reloads.

```sql
-- The version column is the ETag. The update works only if it still matches.
UPDATE products
SET price_paise = $1, version = version + 1
WHERE id = $2 AND version = $3;
-- 0 rows updated  ->  someone else changed it  ->  respond 412
```

:::interview How do you make POST /orders safe to retry?
"`POST` is not idempotent, so a retry after a timeout can create a duplicate. I ask the client to send an `Idempotency-Key` header with a UUID created once per user action. On the server I store the key with a unique constraint, scoped to the user, in the same database transaction that creates the order and saves the response. If the same key arrives again, the insert conflicts and I return the stored response instead of doing the work again. I also store a hash of the request body, so a key reused with a different body is rejected. Concurrent duplicates are handled by the unique constraint, because the second insert waits for the first transaction. Old keys are cleaned up after a fixed time."
:::

:::revise
- URLs are plural nouns. The method tells the action. `GET`, `PUT` and `DELETE` are idempotent, `POST` is not.
- 4xx means the client must change the request. 5xx means the server failed and a retry may help.
- Cursor pagination with a tie-breaker stays fast on deep pages. Always cap `limit`.
- Prefer adding fields over new versions. Removing or renaming a field is a breaking change.
- Return every error in one format, such as Problem Details (`application/problem+json`).
- An idempotency key plus a unique constraint, stored in the same transaction as the work, makes `POST` safe to retry.
:::

# gRPC and Protocol Buffers

*A faster, strictly typed way for services to call each other, and how to choose between gRPC and REST.*

## Why it matters

Imagine two offices that exchange hundreds of requests a day. With handwritten letters, each letter is easy to read, but the receiver must guess the format, and long letters are slow to write. With a printed form that has numbered boxes, both sides know exactly what goes where. It is quicker to fill, quicker to read, and mistakes are caught at once.

REST with JSON is the handwritten letter: flexible and readable by humans. **gRPC** is the printed form: both sides agree on the exact shape first, and tools generate the code. Inside a system with many services calling each other all day, the printed form often wins.

## The idea

**RPC** means "remote procedure call": calling a function that runs on another machine. **gRPC** is an open-source RPC framework. It stands on two things:

- **HTTP/2** as the transport. HTTP/2 can send many requests at the same time over one connection, and it supports streams in both directions.
- **Protocol Buffers** (short: **protobuf**) as the message format. Protobuf is a compact binary format. You describe your messages and services in a `.proto` file. This file is the **contract** between the two sides.

From one `.proto` file, tools generate a **client stub** and a server skeleton for many languages. A stub is an object that looks like a local object with methods, but each method sends a network request. A Go service and a Node.js service can talk with no hand-written parsing code.

## A .proto file

```text
syntax = "proto3";

package shop.orders.v1;

service OrderService {
  // Unary: one request, one response.
  rpc GetOrder (GetOrderRequest) returns (Order);
  // Server streaming: one request, many responses over time.
  rpc WatchOrder (GetOrderRequest) returns (stream OrderStatusUpdate);
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;   // the first enum value must be 0
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_CANCELLED = 3;
}

message GetOrderRequest {
  string order_id = 1;
}

message OrderItem {
  string sku = 1;
  int32 quantity = 2;
  int64 price_paise = 3;
}
```

```text
message Order {
  string order_id = 1;
  string user_id = 2;
  OrderStatus status = 3;
  repeated OrderItem items = 4;    // "repeated" means a list
  int64 total_paise = 5;
}

message OrderStatusUpdate {
  string order_id = 1;
  OrderStatus status = 2;
}
```

The numbers (`= 1`, `= 2`) are **field numbers**. They are the heart of protobuf. On the wire, a message does not contain the field names. It contains the field number and the value. This is why protobuf is small, and why the numbers must never change their meaning.

## Changing a contract without breaking anyone

Services are deployed at different times. For a while, a new server talks to old clients, or the other way round. Protobuf is designed for this, if you follow the rules.

| Change | Safe? | Why |
|---|---|---|
| Add a new field with a new number | Yes | Old code skips numbers it does not know |
| Stop using a field | Yes, if you reserve its number | Old senders may still send it |
| Rename a field (same number, same type) | Yes on the wire | Names are not sent in binary. Generated code and JSON output do change |
| Change the type of a field | No | Old data is read wrongly |
| Reuse an old field number for a new meaning | Never | Old messages get the wrong meaning silently |

```text
message Order {
  reserved 6;                  // was: string coupon_code = 6;
  reserved "coupon_code";      // nobody can reuse the number or the name
  string order_id = 1;
  // ...
}
```

In proto3, a missing field is read as its default value: `0` for numbers, an empty string for strings, the `0` entry for enums. This is why the first enum value should be an "unspecified" entry. Then "the sender did not set it" is different from a real status.

## The four kinds of calls

| Kind | Shape | Example |
|---|---|---|
| Unary | One request, one response | Get an order |
| Server streaming | One request, a stream of responses | Follow the status of an order |
| Client streaming | A stream of requests, one response | Upload many readings, get one summary |
| Bidirectional streaming | Both sides stream | Chat, live location of a delivery rider |

Unary calls are by far the most common. Use streaming only when the data really arrives over time.

## A server in Node.js

Install `@grpc/grpc-js` and `@grpc/proto-loader`. The loader reads the `.proto` file at startup, so there is no build step. Larger projects usually generate typed code instead.

```javascript
// server.js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { findOrder } from './orders.repo.js';

const def = protoLoader.loadSync('proto/orders.proto', {
  keepCase: true,      // keep order_id, do not convert to orderId
  longs: String,       // int64 as string: safe beyond 2^53
  enums: String,       // enum values as their names
  defaults: true,
});
const { OrderService } = grpc.loadPackageDefinition(def).shop.orders.v1;

async function getOrder(call, callback) {
  try {
    const order = await findOrder(call.request.order_id);
    if (!order) {
      // Errors use gRPC status codes, not HTTP codes.
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'order not found',
      });
    }
    callback(null, order);                 // (error, response)
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: 'internal error' });
  }
}
```

```javascript
// server.js (continued): a server-streaming handler and the startup
function watchOrder(call) {
  const orderId = call.request.order_id;
  const send = (status) => call.write({ order_id: orderId, status });

  send('ORDER_STATUS_PENDING');
  // A real service would subscribe to status changes here.
  const timer = setTimeout(() => {
    send('ORDER_STATUS_CONFIRMED');
    call.end();                            // close the stream
  }, 2000);
  call.on('cancelled', () => clearTimeout(timer));   // client went away
}

const server = new grpc.Server();
server.addService(OrderService.service, {
  GetOrder: getOrder,
  WatchOrder: watchOrder,
});
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),  // use TLS outside local dev
  (err, port) => {
    if (err) throw err;
    console.log(`gRPC server listening on ${port}`);
  },
);
```

## A client with a deadline

```javascript
// client.js
const client = new OrderService(
  'localhost:50051',
  grpc.credentials.createInsecure(),
);

// Unary call. The deadline is the latest moment we are willing to wait.
const metadata = new grpc.Metadata();
metadata.set('x-request-id', 'req-7f3a');    // like an HTTP header
client.GetOrder(
  { order_id: 'A17' },
  metadata,
  { deadline: Date.now() + 800 },            // 800 ms from now
  (err, order) => {
    if (err) return console.error(err.code, err.details);
    console.log(order.status, order.total_paise);
  },
);

// Server streaming: we receive many messages.
const stream = client.WatchOrder({ order_id: 'A17' });
stream.on('data', (update) => console.log('status:', update.status));
stream.on('end', () => console.log('stream closed'));
stream.on('error', (err) => console.error(err.code));
```

**Metadata** is a set of key and value pairs that travel with the call, like HTTP headers. It carries things such as tokens and request IDs.

A **deadline** is a point in time, not a duration. gRPC sends it along with the call. If service A gives B 800 ms, B can see how much time is left and pass the smaller remaining time on to C. Nobody keeps working on an answer that the first caller has already given up on.

:::warn No deadline means "wait forever"
By default a gRPC call has no deadline. If the server hangs, the client call hangs too, and holds memory and a slot until the process dies. Set a deadline on every call. On the server, stop work when the call is cancelled.
:::

## Status codes

gRPC has its own small list of status codes. The ones you meet most often:

| gRPC code | Meaning | Close HTTP idea |
|---|---|---|
| `OK` | Success | 200 |
| `INVALID_ARGUMENT` | Bad input | 400 |
| `UNAUTHENTICATED` | No valid identity | 401 |
| `PERMISSION_DENIED` | Not allowed | 403 |
| `NOT_FOUND` | No such thing | 404 |
| `ALREADY_EXISTS` | Duplicate | 409 |
| `RESOURCE_EXHAUSTED` | Rate limit or quota hit | 429 |
| `DEADLINE_EXCEEDED` | Too slow | 504 |
| `UNAVAILABLE` | Server not reachable right now | 503 |
| `INTERNAL` | Bug on the server | 500 |

`UNAVAILABLE` is the classic "safe to retry" code. `DEADLINE_EXCEEDED` is tricky: the server may have finished the work. Retry it only if the call is idempotent.

## gRPC or REST?

| Point | REST + JSON | gRPC + protobuf |
|---|---|---|
| Contract | Optional (OpenAPI) | Required (`.proto`) |
| Message size and speed | Text, larger | Binary, smaller and faster to parse |
| Streaming | Limited | Built in, both directions |
| Browser support | Native | Needs a proxy (gRPC-Web) |
| Debug by hand | Easy with `curl` | Needs tools such as `grpcurl` |

A simple rule that works for most teams:

- **Public APIs and browser clients:** REST. Everyone can call it and read it.
- **Internal service-to-service calls:** gRPC, when you want strict contracts, generated clients and good performance.
- **"Tell others that something happened":** neither. Use events (the Kafka chapters).

:::flow A common mixed setup
Mobile or web app | REST + JSON
API gateway | checks the token
Orders service | gRPC to its neighbours
Payments service | answers in protobuf
:::

:::example What actually travels on the wire
For `GetOrderRequest { order_id: "A17" }`, JSON sends the text `{"order_id":"A17"}`, which is 18 bytes. Protobuf sends 5 bytes: one byte that says "field number 1, a length-prefixed value", one byte for the length 3, and the three letters `A17`. The field name is not sent at all. Both sides know from the `.proto` file that number 1 is `order_id`. This is also why you cannot read a protobuf message without its contract.
:::

:::interview When would you use gRPC instead of REST?
"I use gRPC for internal calls between services. The `.proto` file is a strict contract, client and server code is generated, messages are small binary protobuf, and HTTP/2 gives multiplexing and streaming. Deadlines are built in and are passed down the call chain. I keep REST for public APIs and browsers, because it works everywhere, is easy to debug with simple tools, and benefits from HTTP caching. The costs of gRPC are that browsers need a proxy, messages are not human readable, and the team must manage `.proto` files carefully: never reuse field numbers, only add fields. If the caller does not need an answer, I would use neither and publish an event instead."
:::

:::revise
- gRPC is RPC over HTTP/2 with protobuf messages. The `.proto` file is the contract and code is generated from it.
- Field numbers identify fields on the wire. Add new numbers freely. Never reuse or retype an old one, and reserve removed numbers.
- Four call kinds: unary, server streaming, client streaming, bidirectional streaming.
- Always set a deadline. It travels with the call so services down the chain can stop early.
- gRPC has its own status codes. `UNAVAILABLE` is safe to retry, `DEADLINE_EXCEEDED` only for idempotent calls.
- REST for public and browser clients, gRPC for internal calls, events when no answer is needed.
:::

# API gateway, BFF and service discovery

*One front door for clients, a helper backend for each kind of app, and a way for services to find each other.*

## Why it matters

At a big railway station, you do not walk to the control room to ask about a train, then to the accounts office to pay, then to the catering office for food. You go to one enquiry and booking counter. The staff behind it know which office handles what. And the station can move an office to another building without telling any passenger.

With ten services, a mobile app has the same problem. It should not know ten addresses, log in ten times, or break when a service moves. Three patterns solve this: the **API gateway**, the **backend for frontend**, and **service discovery**.

## The API gateway

An **API gateway** is a server that sits between the outside clients and your services. Every outside request enters through it.

:::flow Path of an outside request
Client | mobile or web app
API gateway | TLS, token check, rate limit, routing
Service | orders, payments, catalogue
Database | owned by that service
:::

The gateway handles the work that is the same for every service. These are called **cross-cutting concerns**.

| Job | What it means |
|---|---|
| Routing | `/v1/orders/*` goes to the orders service, `/v1/catalogue/*` to catalogue |
| TLS termination | HTTPS ends here. TLS is the encryption behind HTTPS |
| Authentication | Check the token once, reject bad requests early |
| Rate limiting | Stop one client from flooding the system |
| Request IDs | Give every request an ID so logs can be joined later |
| Protocol translation | Accept REST from outside, call gRPC inside |

In practice you rarely write a gateway yourself. Teams use ready products: NGINX, Envoy, Kong, Traefik, or the managed gateway of their cloud. You write configuration, not code.

:::warn The gateway that became a monolith
Do not put business rules in the gateway. "If the cart total is above 500, add free shipping" does not belong there. Once business logic lives in the gateway, every team must change the gateway for every feature, and you have rebuilt a monolith in the worst place. Keep it to routing and generic checks. Also remember that the gateway is in the path of every request: run several copies of it behind a load balancer, so it is not a single point of failure.
:::

## Trust inside: what the gateway passes on

After the gateway has checked the user's token, the services still need to know who the user is. There are two common ways.

- **Pass the token on.** The gateway forwards the original token, and every service verifies it again. This is the safer default, because a service does not blindly trust the network.
- **Pass verified headers.** The gateway removes any incoming `X-User-Id` header from the outside, then adds its own after checking the token. This is only safe if services can be reached **only** through the gateway.

Either way, a service must still check **permissions** itself. The gateway can say "this is user 42". Only the orders service knows whether user 42 owns order `A17`.

## Backend for frontend (BFF)

A mobile home screen needs the user's name, the last three orders and some recommendations. On a slow mobile network, three separate calls are expensive. A web dashboard for admins needs very different data on its first screen.

A **backend for frontend** (BFF) is a small backend built for one kind of client. The mobile app has its BFF, the web app has its own. The BFF calls the services, joins the answers, and returns exactly what that screen needs.

```javascript
// mobile-bff/home.js
const TIMEOUT_MS = 800;

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),    // never wait forever
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

export async function homeScreen(req, res) {
  const token = req.get('authorization')?.replace('Bearer ', '');
  // Call the three services at the same time, not one after another.
  const [profile, orders, picks] = await Promise.allSettled([
    getJson('http://users/v1/me', token),
    getJson('http://orders/v1/orders?limit=3', token),
    getJson('http://recommendations/v1/picks', token),
  ]);

  // The profile is required. The other two are "nice to have".
  if (profile.status === 'rejected') {
    return res.status(503).json({ title: 'Profile is unavailable' });
  }
  res.json({
    name: profile.value.name,
    recentOrders: orders.status === 'fulfilled' ? orders.value.data : [],
    picks: picks.status === 'fulfilled' ? picks.value.items : [],
  });
}
```

`Promise.allSettled` waits for all calls and never throws. Each result says `fulfilled` or `rejected`. So when recommendations are down, the home screen still loads, just without that row. This is called **graceful degradation**: a smaller answer instead of an error.

| Point | One shared gateway API | A BFF per client |
|---|---|---|
| Response shape | Generic, same for all | Made for one screen or app |
| Number of client calls | Often many | Often one |
| Who owns it | Platform team | The frontend team of that client |
| Risk | Slow to change for one client | Duplicate logic across BFFs |

A BFF contains **presentation logic** (join, trim, rename), never business rules. If two BFFs need the same rule, the rule belongs in a service.

## Service discovery

In the BFF code above, we called `http://orders/...`. But where is "orders"? In a modern setup, service instances start and stop all the time. Their IP addresses change with every deployment and every scale-up. Hard-coding addresses is impossible.

**Service discovery** is how a caller finds a healthy instance of a service by name. Think of the contact list in your phone: you tap "Mummy", not a ten-digit number. If she changes her number, you update one entry and keep tapping the same name.

There are two parts:

1. A **service registry**: a live list of which instances exist for each service, and whether they are healthy.
2. A way to **use** the registry when making a call.

| Style | How it works | Example |
|---|---|---|
| Server-side discovery | The caller uses one stable name. A load balancer or the platform picks an instance | Kubernetes Service, cloud load balancers |
| Client-side discovery | The caller asks the registry for the list and picks an instance itself | Consul or Eureka with a client library |

In Kubernetes, this is built in. You create a **Service** object. It gets a stable DNS name, and Kubernetes keeps the list of healthy pods behind it. A **pod** is one running copy of your container.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: orders            # other services call http://orders
  namespace: shop
spec:
  selector:
    app: orders           # send traffic to pods with this label
  ports:
    - name: http
      port: 80            # the port callers use
      targetPort: 3000    # the port the container listens on
```

Inside the same namespace, other pods can call `http://orders`. The full name is `orders.shop.svc.cluster.local`. Pods that fail their **readiness check** are removed from the list automatically. We write that check in the deployment chapter.

:::note gRPC and long-lived connections
gRPC keeps one HTTP/2 connection open and sends all calls over it. A simple connection-level load balancer then sends every call to the same pod. Common fixes are client-side load balancing in the gRPC client, or a proxy that balances per request.
:::

## The service mesh, in one paragraph

A **service mesh** (for example Istio or Linkerd) places a small proxy next to every service instance. This proxy is called a **sidecar**. All traffic between services passes through these proxies. The mesh can then add encryption between services, retries, timeouts and metrics without changes in your code. It is powerful, and it is one more complex system to run. Small teams usually do not need it.

:::example One request, start to end
1. The mobile app calls `GET https://api.example.com/mobile/home` with a token.
2. The gateway ends TLS, checks the token signature, applies the rate limit, adds a request ID, and routes `/mobile/*` to the mobile BFF.
3. The BFF calls `http://users`, `http://orders` and `http://recommendations` at the same time. Each name is resolved by service discovery to a healthy pod.
4. Recommendations times out after 800 ms. The BFF returns the name and the recent orders with an empty `picks` list.
5. The app shows the home screen. The user never sees an error.
:::

:::interview What is the difference between an API gateway and a BFF?
"An API gateway is the single entry point for all outside traffic. It does generic work: TLS, authentication, rate limiting, routing and request IDs. It knows nothing about screens. A backend for frontend is a small backend made for one kind of client, such as the mobile app. It calls several services, joins and trims the data, and returns what one screen needs in one round trip. They are often used together: the request passes through the gateway and then reaches the BFF. In both, I keep business rules out. Those stay in the services. The gateway must also be highly available, because every request passes through it."
:::

:::revise
- An API gateway is the single front door: routing, TLS, token checks, rate limits, request IDs.
- Never put business rules in the gateway, and run more than one copy of it.
- Services still check permissions themselves. The gateway only knows who the caller is.
- A BFF is a backend for one kind of client. It joins service answers into one response for a screen.
- Use `Promise.allSettled` with timeouts so optional data can fail without breaking the page.
- Service discovery lets callers use a stable name. The registry tracks healthy instances behind it.
:::

# Authentication and authorisation

*Who are you, what may you do, and how do many services agree on the answer.*

## Why it matters

At an airport you show your ID and ticket at the entry gate. That step proves who you are. Later, your boarding pass decides which gate and which seat you may use. Having a valid ID does not let you board any plane you like.

These are two different questions:

- **Authentication** (short: authn): who are you?
- **Authorisation** (short: authz): what are you allowed to do?

In a monolith, both happen in one place. In microservices, a request passes through many services, and each must answer both questions without asking the user to log in again.

## Sessions and tokens

After login, the server must remember that this browser is user 42. There are two classic ways.

With a **session**, the server creates a random session ID, stores `sessionId -> user 42` in a store such as Redis, and sends the ID in a cookie. On every request the server looks the ID up.

With a **JWT** (JSON Web Token), the server writes the user's identity into a token and **signs** it. Any service that knows the right key can verify the signature without a lookup. The token carries its own proof.

| Point | Server session | JWT access token |
|---|---|---|
| Where the state lives | In a server-side store | Inside the token |
| Check on each request | Lookup in the store | Verify a signature, no lookup |
| Log out or ban right now | Easy: delete the session | Hard: the token stays valid until it expires |
| Fits many services | Each needs the store, or must call an auth service | Each needs only the public key |

Neither is "better". Sessions are simple and easy to revoke, and are a fine choice for one web app. JWTs fit systems with many services, because verification needs no network call.

## What is inside a JWT

A JWT has three parts separated by dots: `header.payload.signature`. Each part is Base64URL text.

- The **header** names the signing algorithm, for example `RS256`.
- The **payload** holds **claims**: statements about the user and the token.
- The **signature** proves that the first two parts were not changed.

| Claim | Meaning |
|---|---|
| `sub` | Subject: the user ID |
| `iss` | Issuer: who created the token |
| `aud` | Audience: which API the token is meant for |
| `exp` | Expiry time |
| `iat` | Issued-at time |

:::warn A JWT is signed, not secret
Anyone who holds a JWT can decode the payload and read it. The signature only stops changes. Never put passwords, card numbers or other secrets in a token. And never write your own verification code: use a well-known library, and tell it exactly which algorithm, issuer and audience you accept.
:::

Two families of signing algorithms exist. With **HS256**, one shared secret both signs and verifies. Every service that can verify can also create tokens, which is risky with many services. With **RS256** or **ES256**, a **private key** signs and a **public key** verifies. Only the auth service holds the private key. Everyone else gets the public key, usually from a URL that serves a **JWKS** (a JSON list of public keys).

```javascript
// auth-service/tokens.js  (uses the "jose" library)
import { SignJWT } from 'jose';

export function signAccessToken(user, privateKey) {
  return new SignJWT({ role: user.role })          // our own claim
    .setProtectedHeader({ alg: 'RS256', kid: 'key-2026-01' })
    .setSubject(String(user.id))                   // sub
    .setIssuer('https://auth.example.com')         // iss
    .setAudience('shop-api')                       // aud
    .setIssuedAt()                                 // iat
    .setExpirationTime('15m')                      // exp: short life
    .sign(privateKey);
}
```

```javascript
// any-service/auth.js: verify with the public keys of the auth service
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Fetches the public keys and caches them. Picks the key by "kid".
const JWKS = createRemoteJWKSet(
  new URL('https://auth.example.com/.well-known/jwks.json'),
);

export async function requireUser(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return res.status(401).json({ title: 'Missing token' });
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'https://auth.example.com',
      audience: 'shop-api',
      algorithms: ['RS256'],             // accept only what we expect
    });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ title: 'Invalid or expired token' });
  }
}
```

The `kid` (key ID) in the header tells the verifier which public key to use. This lets you **rotate keys**: publish a new key, start signing with it, and remove the old one after all old tokens have expired.

## Access tokens and refresh tokens

A JWT cannot easily be cancelled. So we keep its life short, for example 15 minutes. But nobody wants to log in every 15 minutes. The answer is two tokens.

- The **access token** is the short-lived JWT. It is sent with every API call.
- The **refresh token** is a long random string that lives for days or weeks. It is sent only to the auth service, to get a new access token. It is stored on the server, so it can be revoked.

:::flow Life of the two tokens
Login | password or Google sign-in
Tokens issued | access 15 min, refresh 30 days
API calls | send the access token
Access expires | API answers 401
Refresh call | get a new pair
:::

## Refresh token rotation

A stolen refresh token would give an attacker weeks of access. **Rotation** limits this. Every time a refresh token is used, it is retired and a new one is issued. A refresh token works **once**.

This also gives us a theft alarm. If a retired token shows up again, two parties hold the same token: the real user and a thief. We cannot know which is which, so we cancel the whole **family** (all tokens that came from that login). Both must log in again. This is called **reuse detection**.

```sql
CREATE TABLE refresh_tokens (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint      NOT NULL,
  family_id  uuid        NOT NULL,     -- one family per login
  token_hash text        NOT NULL UNIQUE,   -- never store the raw token
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,              -- set when it is rotated
  revoked_at timestamptz
);
```

```javascript
import { createHash, randomBytes } from 'node:crypto';
import { withTx } from './db.js';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function rotate(rawToken) {
  return withTx(async (db) => {
    // FOR UPDATE: two refresh calls with one token cannot both pass.
    const { rows } = await db.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE`,
      [sha256(rawToken)],
    );
    const t = rows[0];
    if (!t || t.revoked_at || t.expires_at < new Date()) {
      return { ok: false };
    }
    if (t.used_at) {
      // Reuse detected: cancel every token of this login.
      await db.query(
        `UPDATE refresh_tokens SET revoked_at = now()
         WHERE family_id = $1 AND revoked_at IS NULL`,
        [t.family_id],
      );
      return { ok: false, reuse: true };
    }
    return issueNext(db, t);
  });
}
```

```javascript
async function issueNext(db, old) {
  await db.query(
    `UPDATE refresh_tokens SET used_at = now() WHERE id = $1`,
    [old.id],
  );
  const next = randomBytes(32).toString('base64url');   // 256 random bits
  await db.query(
    `INSERT INTO refresh_tokens
       (user_id, family_id, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + interval '30 days')`,
    [old.user_id, old.family_id, sha256(next)],
  );
  return { ok: true, userId: old.user_id, refreshToken: next };
}
```

Notice that `rotate` **returns** `{ ok: false, reuse: true }` instead of throwing. If it threw an error, `withTx` would roll back, and the family would not be revoked. The route handler turns `ok: false` into a `401` after the transaction has committed.

:::example Dry run: a stolen refresh token
| Step | Who | Action | Result |
|---|---|---|---|
| 1 | User | Logs in | Gets refresh token `R1` (family `F`) |
| 2 | Thief | Copies `R1` from the user's device | Holds `R1` |
| 3 | Thief | Calls refresh with `R1` | `R1` marked used, thief gets `R2` |
| 4 | User | App calls refresh with `R1` | `R1` is already used: reuse detected |
| 5 | Server | Revokes all of family `F` | `R2` is dead too |
| 6 | Both | Next refresh call | `401`. The real user logs in again, the thief cannot |
:::

:::tip Where a browser should keep tokens
Keep the refresh token in a cookie marked `HttpOnly` (JavaScript cannot read it), `Secure` (HTTPS only) and `SameSite` (not sent from other sites). Then a script injected into your page cannot steal it. Keep the access token in memory. Tokens stored in `localStorage` can be read by any script that runs on the page.
:::

## OAuth 2.0 and OpenID Connect, in words

"Sign in with Google" uses two standards. **OAuth 2.0** is about **delegated access**: letting an app do something for you without giving it your password. **OpenID Connect** (OIDC) is a layer on top of OAuth 2.0 that adds login: it tells the app who the user is.

The recommended flow is the **authorisation code flow with PKCE** (say "pixy"). In words:

1. The app creates a random secret called the **code verifier** and keeps it. It sends a hash of it, the **code challenge**, along with the user to the provider's login page.
2. The user logs in at the provider (for example Google) and agrees to share basic profile data. The app never sees the password.
3. The provider sends the browser back to the app's **redirect URI** with a short-lived, one-time **authorisation code**.
4. The app sends the code **and the original code verifier** directly to the provider's token endpoint.
5. The provider hashes the verifier and compares it with the challenge from step 1. If they match, it returns tokens: an **access token** for calling APIs, and with OIDC an **ID token**, a JWT that says who the user is.

Why the extra dance? The code travels through the browser's address bar, where it could be seen. But the code alone is useless without the verifier, and the verifier never left the app.

:::flow Authorisation code flow with PKCE
App | makes verifier, sends challenge
Provider login | user signs in and agrees
Redirect | one-time code returns to the app
Token call | code plus verifier
Tokens | access token and ID token
:::

| Token | Who reads it | Purpose |
|---|---|---|
| ID token | Your app | Proof of who logged in |
| Access token | The API | Permission to call the API |
| Refresh token | The provider's token endpoint | Get new access tokens |

After a social login, most backends create their own user record and issue their **own** access and refresh tokens, exactly as described above. The provider's tokens are used only during login.

## Authorisation: roles, ownership and where to check

The two common models:

- **RBAC** (role-based access control): permissions belong to roles such as `admin` or `support`, and users have roles.
- **ABAC** (attribute-based access control): rules use attributes of the user and the resource. "A user may read an order if `order.user_id` equals their own ID" is such a rule.

Real systems mix both: a role check for admin features, and an ownership check for personal data.

```javascript
// Ownership is part of the query, so there is no window for mistakes.
export async function getOrder(req, res) {
  const isStaff = req.user.role === 'admin' || req.user.role === 'support';
  const { rows } = await pool.query(
    `SELECT id, status, total_paise FROM orders
     WHERE id = $1 AND (user_id = $2 OR $3)`,
    [req.params.id, req.user.id, isStaff],
  );
  // 404, not 403: do not reveal that someone else's order exists.
  if (rows.length === 0) return res.status(404).json({ title: 'Not found' });
  res.json(rows[0]);
}
```

:::warn Checking only at the gateway
A very common security bug: the gateway verifies the token, and the service returns `/orders/A18` to anyone with a valid token, without checking the owner. The attacker simply changes the ID in the URL. Every service must check that **this** user may touch **this** resource.
:::

## Service-to-service authentication

When the orders service calls the payments service, payments must know that the caller is really orders, and not some other program that reached the internal network. "It comes from inside our network" is not proof. The idea of trusting nothing only because of where it comes from is called **zero trust**.

| Method | How it works | Remark |
|---|---|---|
| mTLS | Both sides show a certificate | Strong identity plus encryption, often done by a service mesh |
| Service tokens | The caller gets a JWT for itself (OAuth client credentials) and sends it | Works without a mesh, needs token handling in code |
| Shared API key | A static secret in a header | Simple, weak: hard to rotate, easy to leak |

In normal **TLS** (the encryption behind HTTPS), only the server shows a certificate, and the client checks it. In **mTLS** (mutual TLS), the client shows a certificate too. A **certificate** is a signed document that says "this key belongs to the orders service". Both certificates are signed by a **certificate authority** (CA) that your company runs. So each side knows exactly who is on the other end, and all traffic is encrypted. The certificates should be short-lived and renewed automatically.

There are two identities to carry in an internal call: the **service** that calls (proved by mTLS or a service token) and the **user** on whose behalf it calls (usually the user's access token, passed along). Payments can then check both: "orders may call me" and "this user owns this payment".

:::interview How do access and refresh tokens work together, and why rotate refresh tokens?
"The access token is a short-lived signed JWT, for example 15 minutes. Services verify it locally with the public key, so there is no lookup on each request. Because a JWT is hard to revoke, I keep it short. The refresh token is a long-lived random value stored hashed in the database. The client sends it only to the auth service to get a new access token. With rotation, every refresh retires the old refresh token and issues a new one, so each one works once. If a retired token is presented again, it means it was copied, so I revoke the whole token family and force a new login. In browsers I keep the refresh token in an HttpOnly, Secure, SameSite cookie. For logout I revoke the refresh token, and the access token dies within minutes."
:::

:::revise
- Authentication asks who you are. Authorisation asks what you may do. Check both in every service.
- A JWT is signed, not encrypted. Verify it with a library and pin the algorithm, issuer and audience.
- Use asymmetric signing (`RS256` or `ES256`): only the auth service can create tokens, everyone can verify them.
- Short access token plus a server-stored refresh token. Rotate the refresh token on every use and revoke the family on reuse.
- OAuth 2.0 gives delegated access. OIDC adds login with an ID token. Use the authorisation code flow with PKCE.
- Between services, prove the caller's identity with mTLS or service tokens, and pass the user's identity along.
:::

# PostgreSQL: transactions, isolation and locking

*How the database keeps money and stock correct when many requests run at the same moment.*

## Why it matters

You send 500 rupees to a friend with UPI. Two things must happen: your balance goes down by 500, and your friend's balance goes up by 500. If the system crashes between the two, money disappears. If two transfers read your balance at the same moment, you may spend the same 500 twice.

A backend under real traffic runs hundreds of such operations at the same time. **Concurrency** means several things happening at once. Most serious data bugs are concurrency bugs. They do not appear on your laptop with one user. They appear in production on a busy day. This chapter gives you the tools to prevent them.

## Transactions and ACID

A **transaction** is a group of statements that the database treats as one unit. It starts with `BEGIN` and ends with `COMMIT` (keep everything) or `ROLLBACK` (undo everything).

```sql
BEGIN;
UPDATE accounts SET balance_paise = balance_paise - 50000 WHERE id = 1;
UPDATE accounts SET balance_paise = balance_paise + 50000 WHERE id = 2;
COMMIT;      -- both changes become visible together
```

A transaction gives four promises, known as **ACID**:

| Letter | Promise | In the transfer example |
|---|---|---|
| **A**tomicity | All statements happen, or none | Never "debited but not credited" |
| **C**onsistency | The rules of the database hold before and after | A `CHECK (balance_paise >= 0)` is never broken |
| **I**solation | Transactions running together do not corrupt each other | Two transfers do not spend the same money |
| **D**urability | After `COMMIT`, the data survives a crash | A power cut does not lose the transfer |

Let the database guard your rules with **constraints**. They are checked on every write, whatever code runs.

```sql
CREATE TABLE accounts (
  id            bigint PRIMARY KEY,
  balance_paise bigint NOT NULL CHECK (balance_paise >= 0)
);
```

## How PostgreSQL lets readers and writers work together

PostgreSQL uses **MVCC** (multi-version concurrency control). When a row is updated, the old version is not overwritten at once. A new version is written beside it. Each transaction sees a **snapshot**: the versions that were committed at a certain moment.

The practical result is very pleasant: **readers do not block writers, and writers do not block readers**. A long report does not stop checkout. Only two writers on the same row must wait for each other.

## Isolation levels

Isolation is the hardest promise to keep, so databases offer levels. A higher level prevents more problems, called **anomalies**, but more transactions may have to wait or retry.

| Anomaly | What goes wrong |
|---|---|
| Dirty read | You read data that another transaction has not committed yet |
| Non-repeatable read | You read the same row twice and get different values |
| Phantom read | You run the same query twice and new rows appear |
| Lost update | Two transactions read a value, both write, one write is lost |
| Write skew | Two transactions read the same data, then write different rows, and together break a rule |

| Level in PostgreSQL | What you see | Still possible |
|---|---|---|
| Read Committed (default) | Each statement sees data committed before that statement started | Non-repeatable read, phantom, lost update, write skew |
| Repeatable Read | The whole transaction sees one snapshot from its start | Write skew |
| Serializable | The result is as if transactions ran one after another | Nothing, but you must retry on errors |

Two PostgreSQL facts that interviewers like. First, PostgreSQL never allows dirty reads: if you ask for Read Uncommitted, you get Read Committed. Second, Repeatable Read in PostgreSQL also prevents phantom reads, which is stricter than the SQL standard requires.

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- ... statements ...
COMMIT;
```

### Anomaly 1: non-repeatable read

A report reads the same number twice inside one Read Committed transaction.

| Step | Session A (report) | Session B (checkout) |
|---|---|---|
| 1 | `BEGIN;` | |
| 2 | `SELECT stock FROM items WHERE id = 7;` returns 10 | |
| 3 | | `UPDATE items SET stock = 9 WHERE id = 7; COMMIT;` |
| 4 | `SELECT stock FROM items WHERE id = 7;` returns 9 | |

The two reads disagree. For a report that adds several numbers, this gives totals that never existed at any moment. Under Repeatable Read, step 4 still returns 10.

### Anomaly 2: lost update

Two requests buy the last items. The code reads the stock, calculates in JavaScript, and writes the result back.

| Step | Session A | Session B |
|---|---|---|
| 1 | `SELECT stock` returns 5 | |
| 2 | | `SELECT stock` returns 5 |
| 3 | `UPDATE items SET stock = 4` | |
| 4 | | `UPDATE items SET stock = 4` |

Two items were sold, but the stock went down by one. This **read-modify-write** pattern is the most common concurrency bug in backend code. We fix it in three ways in the next section.

### Anomaly 3: write skew

Rule: at least one delivery rider must be on duty. Two riders, Asha and Bilal, are on duty. Both tap "go off duty" at the same moment.

| Step | Session A (Asha) | Session B (Bilal) |
|---|---|---|
| 1 | `SELECT count(*) FROM riders WHERE on_duty` returns 2 | |
| 2 | | Same query returns 2 |
| 3 | "2 is more than 1, I may leave": `UPDATE riders SET on_duty = false WHERE name = 'Asha'` | |
| 4 | | Same thought: `UPDATE ... WHERE name = 'Bilal'` |
| 5 | `COMMIT` | `COMMIT` |

Nobody is on duty. Each transaction was correct alone. They updated **different rows**, so no row lock helped, and even Repeatable Read allows this. Only Serializable catches it: one of the two transactions fails and must be retried. Another fix is to lock the rows you based your decision on, which we see next.

## Fixing the lost update

**Fix 1: let the database do the maths in one statement.** This is the simplest and the best when it fits.

```sql
UPDATE items
SET stock = stock - 1
WHERE id = 7 AND stock >= 1;     -- the check and the change are one step
-- 1 row updated -> sold.   0 rows updated -> out of stock.
```

An `UPDATE` locks the row while it works. A second `UPDATE` on the same row waits, then re-checks `stock >= 1` against the new value. No update is lost and the stock never goes below zero.

**Fix 2: lock the row first with `SELECT ... FOR UPDATE`.** Use this when the decision needs application logic between the read and the write.

```javascript
export function transfer(fromId, toId, amountPaise) {
  return withTx(async (db) => {
    // Lock both rows. ORDER BY id: every transfer locks in the same order.
    const { rows } = await db.query(
      `SELECT id, balance_paise FROM accounts
       WHERE id IN ($1, $2) ORDER BY id FOR UPDATE`,
      [fromId, toId],
    );
    if (rows.length !== 2) throw new Error('Account not found');
    const from = rows.find((r) => String(r.id) === String(fromId));
    // pg returns bigint columns as strings, so convert before comparing.
    if (BigInt(from.balance_paise) < BigInt(amountPaise)) {
      throw new Error('Insufficient balance');
    }
    await db.query(
      `UPDATE accounts SET balance_paise = balance_paise - $1 WHERE id = $2`,
      [amountPaise, fromId],
    );
    await db.query(
      `UPDATE accounts SET balance_paise = balance_paise + $1 WHERE id = $2`,
      [amountPaise, toId],
    );
  });
}
```

`FOR UPDATE` takes a **row lock**. Another transaction that wants to update or lock the same row must wait until we commit or roll back. A plain `SELECT` by someone else is not blocked: it reads the last committed version.

:::example Dry run: two withdrawals with FOR UPDATE
Account 1 has 1,000 rupees. Two requests each try to send 800 rupees at the same moment.

| Step | Request A | Request B | Balance |
|---|---|---|---|
| 1 | `SELECT ... FOR UPDATE`: gets the lock, reads 1,000 | | 1,000 |
| 2 | | `SELECT ... FOR UPDATE`: must wait | 1,000 |
| 3 | 1,000 is at least 800: debit 800, `COMMIT` | still waiting | 200 |
| 4 | | Lock granted, reads the new value 200 | 200 |
| 5 | | 200 is less than 800: error, `ROLLBACK` | 200 |

Without the lock, both would read 1,000 and both would send 800.
:::

Two useful variants:

| Clause | Behaviour when the row is already locked |
|---|---|
| `FOR UPDATE` | Wait |
| `FOR UPDATE NOWAIT` | Fail at once with an error |
| `FOR UPDATE SKIP LOCKED` | Skip that row and take the next free one |

`SKIP LOCKED` is perfect for job queues: ten workers each pick different rows without waiting. We use it in the outbox chapter.

**Fix 3: optimistic locking with a version column.** Do not lock. Instead, detect that someone else changed the row. This is good when conflicts are rare, and across HTTP requests where you cannot hold a lock (the `ETag` idea from the REST chapter).

```sql
UPDATE products
SET price_paise = $1, version = version + 1
WHERE id = $2 AND version = $3;    -- the version we read earlier
-- 0 rows updated -> someone else was faster: reload and try again
```

| Approach | Good when | Cost |
|---|---|---|
| One atomic `UPDATE` | The change is simple arithmetic | None |
| `SELECT ... FOR UPDATE` (pessimistic) | Conflicts are common, logic sits between read and write | Others wait |
| Version column (optimistic) | Conflicts are rare, or the edit spans several requests | Retry on conflict |

## Deadlocks

Transaction A locks row 1 and wants row 2. Transaction B locks row 2 and wants row 1. Both wait forever. This is a **deadlock**. PostgreSQL detects it after a short wait and cancels one transaction with the error code `40P01`.

The cure is simple: **always lock rows in the same order**. That is why the transfer code above uses `ORDER BY id`. If every transaction locks the smaller ID first, a cycle cannot form.

## Retrying safely

Under Repeatable Read and Serializable, PostgreSQL may cancel a transaction with the code `40001` (serialization failure). This is not a bug. It means "this could not run safely together with another transaction, please run it again". Your code must retry the **whole** transaction.

```javascript
const RETRYABLE = new Set(['40001', '40P01']);  // serialization, deadlock
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(work, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await work();           // work() runs one full transaction
    } catch (err) {
      if (!RETRYABLE.has(err.code) || i >= attempts) throw err;
      await sleep(Math.random() * 50 * i);       // small random pause
    }
  }
}

// const result = await withRetry(() => transfer(1, 2, 80000));
```

:::warn Slow work inside a transaction
Never call another service, send an email or wait for a user while a transaction is open. The transaction holds row locks and a database connection for that whole time. A slow payment provider would then freeze every request that touches the same rows and empty your connection pool. Read what you need, close the transaction, make the outside call, then open a new short transaction to save the result. The outbox chapter shows how to do this without losing data.
:::

:::tip
Keep transactions short and touch rows in a fixed order. Set a statement timeout and an "idle in transaction" timeout on the database, so a forgotten transaction cannot hold locks for hours.
:::

:::interview Two users buy the last item at the same time. How do you prevent overselling?
"The bug is a lost update: both requests read `stock = 1` and both write `0`. The simplest fix is one atomic statement, `UPDATE items SET stock = stock - 1 WHERE id = $1 AND stock >= 1`, and I check the affected row count. The row lock makes the second update wait and re-check the condition, so it updates zero rows and I return 'out of stock'. If I need logic between the read and the write, I use a transaction with `SELECT ... FOR UPDATE` to lock the row first. If conflicts are rare, I can use optimistic locking with a version column and retry. I would also add a `CHECK (stock >= 0)` constraint as a last line of defence, and lock rows in a consistent order to avoid deadlocks."
:::

:::revise
- A transaction is all-or-nothing. ACID: atomicity, consistency, isolation, durability.
- PostgreSQL uses MVCC: readers and writers do not block each other. Only writers of the same row wait.
- Read Committed is the default. Repeatable Read gives one snapshot. Serializable prevents write skew but needs retries.
- Read-modify-write in application code causes lost updates. Use one atomic `UPDATE`, `SELECT ... FOR UPDATE`, or a version column.
- Lock rows in a fixed order to avoid deadlocks. Retry the whole transaction on `40001` and `40P01`.
- Keep transactions short. No network calls while a transaction is open.
:::

# PostgreSQL: indexes, EXPLAIN, pooling and migrations

*How to keep queries fast, connections under control, and schema changes safe while the app is running.*

## Why it matters

A library with one lakh books and no catalogue is useless: to find one book you would walk past every shelf. With a catalogue sorted by title, you find the shelf in seconds. A database table is the same. With ten rows, everything is fast. With ten million rows, a missing index turns a 2 millisecond query into a 2 second query, and under load that takes the whole service down.

This chapter covers four production skills: choosing indexes, reading query plans, managing connections, and changing the schema without downtime.

## Indexes

An **index** is a separate, sorted structure that lets the database find rows without reading the whole table. The default kind in PostgreSQL is the **B-tree**. Think of it as a sorted list with shortcuts: it finds one value among millions in a handful of steps, and it can also return rows in sorted order.

A primary key and a `UNIQUE` constraint create an index automatically. Everything else you must add yourself.

```sql
-- Composite index: more than one column. The order of columns matters.
CREATE INDEX orders_user_created_idx
  ON orders (user_id, created_at DESC);

-- Partial index: only the rows that match a condition. Small and fast.
CREATE INDEX orders_pending_idx
  ON orders (created_at) WHERE status = 'PENDING';

-- Expression index: index the result of a function.
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Covering index: extra columns stored in the index itself.
CREATE INDEX orders_user_cover_idx
  ON orders (user_id, created_at DESC) INCLUDE (status, total_paise);
```

**The leftmost rule.** A composite index on `(user_id, created_at)` is like a phone book sorted by surname, then first name. It helps you find all "Sharma", and "Sharma, Anil". It does not help you find everyone called "Anil". So this index serves `WHERE user_id = 42` and `WHERE user_id = 42 ORDER BY created_at DESC`, but not `WHERE created_at > '2026-01-01'` alone.

A good rule for the column order: columns compared with `=` first, then the column used for sorting or for a range.

| Query pattern | Helpful index |
|---|---|
| `WHERE user_id = ?` | `(user_id)` |
| `WHERE user_id = ? ORDER BY created_at DESC` | `(user_id, created_at DESC)` |
| `WHERE status = 'PENDING'` where few rows are pending | Partial index `WHERE status = 'PENDING'` |
| `WHERE lower(email) = ?` | Expression index on `lower(email)` |

Indexes are not free. Every `INSERT`, `UPDATE` and `DELETE` must also update each index, and indexes use disk space and memory. Add an index for a real, measured query, not "just in case".

:::warn Queries that cannot use your index
An index on `email` is not used by `WHERE lower(email) = 'a@b.com'`, because the query asks about the result of a function, not the stored value. An index is also not used for `LIKE '%sharma'` (the start of the text is unknown). And PostgreSQL will skip an index on purpose when a condition matches a large part of the table, because reading the table directly is then cheaper. Do not guess. Ask the database with `EXPLAIN`.
:::

## Reading a query plan with EXPLAIN

`EXPLAIN` shows the **query plan**: the steps the database will take. `EXPLAIN ANALYZE` also **runs** the query and shows real times. Be careful with `EXPLAIN ANALYZE` on `UPDATE` or `DELETE`: it really changes data, so wrap it in a transaction and roll back.

```sql
EXPLAIN ANALYZE
SELECT id, status, total_paise
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;
```

Before the index exists, the output looks like this. The output is shortened and the numbers are only an illustration. Yours will differ.

```text
Limit  (actual time=182.41..182.43 rows=20 loops=1)
  ->  Sort  (actual time=182.40..182.41 rows=20 loops=1)
        Sort Key: created_at DESC
        Sort Method: top-N heapsort
        ->  Seq Scan on orders  (actual time=0.02..181.90 rows=120 loops=1)
              Filter: (user_id = 42)
              Rows Removed by Filter: 1999880
Execution Time: 182.47 ms
```

Read a plan from the inside out (the most indented line runs first):

1. `Seq Scan on orders`: a **sequential scan**. The database read every row of the table.
2. `Rows Removed by Filter: 1999880`: it threw away almost two million rows to keep 120. This line is the smoking gun.
3. `Sort`: it then sorted the 120 rows by date.
4. `Limit`: it kept 20.

After `CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC)`:

```text
Limit  (actual time=0.03..0.06 rows=20 loops=1)
  ->  Index Scan using orders_user_created_idx on orders
        (actual time=0.03..0.05 rows=20 loops=1)
        Index Cond: (user_id = 42)
Execution Time: 0.09 ms
```

Now the database jumps to user 42 inside the index. The entries are already in date order, so there is no `Sort` step, and it stops after 20 rows.

| Plan node | Meaning | Usually |
|---|---|---|
| `Seq Scan` | Read the whole table | Fine for small tables, bad for big ones with a selective filter |
| `Index Scan` | Find rows through the index, then fetch them from the table | Good |
| `Index Only Scan` | Answer from the index alone | Best, needs a covering index |
| `Bitmap Heap Scan` | Collect many matches from an index, then fetch them in bulk | Good for medium-sized results |
| `Sort` | Sort rows in memory or on disk | Avoidable with a matching index |

:::tip Three things to look for
In `EXPLAIN ANALYZE` output, look for: a `Seq Scan` on a large table with a big "Rows Removed by Filter", a large gap between the estimated `rows=` and the actual rows (the table statistics are stale: run `ANALYZE tablename`), and a `Sort` that a better index could remove.
:::

## Connection pooling

Opening a database connection is slow: a network handshake, authentication, and PostgreSQL starts a separate operating system process for every connection. A server can only hold a limited number of them, set by `max_connections`.

A **connection pool** keeps a small set of connections open and lends them out. A request borrows one, runs its queries, and gives it back.

```javascript
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                          // connections per app instance
  idleTimeoutMillis: 30_000,        // close connections idle for 30 s
  connectionTimeoutMillis: 2_000,   // fail fast if none is free in 2 s
  statement_timeout: 5_000,         // cancel any query slower than 5 s
});

// A broken idle connection must not crash the process.
pool.on('error', (err) => console.error('idle pg client error', err));
```

`pool.query(...)` borrows and returns a connection for you. For a transaction you need the **same** connection for all statements, so you call `pool.connect()` and must call `client.release()` in a `finally` block, as our `withTx` helper does.

:::warn Pool size multiplies
The pool is per process. With `max: 10` and 30 app instances, you can open 300 connections. If the database allows 200, new connections are refused during your next scale-up, exactly when traffic is highest. Always check: instances times pool size, plus workers and admin tools, must stay below `max_connections`. A bigger pool is rarely faster. The database has a fixed number of CPU cores, and hundreds of active connections only fight over them.
:::

When many instances are needed, put a pooler such as **PgBouncer** between the apps and the database. Thousands of app connections then share a small number of real ones.

| PgBouncer mode | A real connection is held for | Remark |
|---|---|---|
| Session | The whole client session | Safest, least sharing |
| Transaction | One transaction | Most common. Session-level features need care |
| Statement | One statement | Multi-statement transactions do not work |

In transaction mode, things that belong to a session, such as `SET` commands, session advisory locks and `LISTEN`, do not behave as you expect, because your next transaction may run on a different real connection.

## Migrations without downtime

A **migration** is a versioned script that changes the database schema. Tools such as `node-pg-migrate`, Flyway, or the migration feature of your ORM run them in order and remember which ones were applied.

Two facts make migrations dangerous on a live system:

1. Many `ALTER TABLE` commands take a strong lock on the table. While it is held, every query on that table waits.
2. During a deployment, **old and new code run at the same time**. The schema must work for both.

| Change | Risk | Safe way |
|---|---|---|
| Add a nullable column | Low | Just add it |
| Add a column with a constant default | Low (PostgreSQL 11 and later) | Just add it |
| Create an index | Blocks writes to the table | `CREATE INDEX CONCURRENTLY` |
| Add `NOT NULL` to an existing column | Scans the table under a strong lock | Add a `CHECK ... NOT VALID`, validate, then set `NOT NULL` |
| Add a foreign key | Scans the table while blocking writes | Add it `NOT VALID`, then `VALIDATE CONSTRAINT` |
| Rename or drop a column | Breaks the old code that is still running | Expand and contract (below) |
| Change a column type | Often rewrites the whole table | New column, backfill, switch |

```sql
-- Give up quickly instead of making everyone queue behind our lock.
SET lock_timeout = '3s';

-- Build the index without blocking writes.
-- Note: this cannot run inside a transaction block.
CREATE INDEX CONCURRENTLY orders_status_idx ON orders (status);

-- NOT NULL without a long lock (PostgreSQL 12 and later):
ALTER TABLE orders ADD CONSTRAINT orders_currency_nn
  CHECK (currency IS NOT NULL) NOT VALID;        -- instant, no scan
ALTER TABLE orders VALIDATE CONSTRAINT orders_currency_nn;
                                                 -- scans, light lock
ALTER TABLE orders ALTER COLUMN currency SET NOT NULL;
                                                 -- uses the proven check
ALTER TABLE orders DROP CONSTRAINT orders_currency_nn;
```

If `CREATE INDEX CONCURRENTLY` fails halfway, it leaves an index marked `INVALID`. Drop it and run the command again.

### Expand and contract

To rename `users.fullname` to `users.display_name` without downtime, never do it in one step. Old code still reads `fullname` while the new version is rolling out. Split the change into small, safe steps.

:::flow Expand and contract
Expand | add the new column
Dual write | new code writes both columns
Backfill | copy old rows in batches
Switch reads | code reads the new column
Contract | drop the old column later
:::

```sql
-- Step 1 (expand): old code is not affected by an extra column.
ALTER TABLE users ADD COLUMN display_name text;

-- Step 3 (backfill): small batches, so no long locks. Repeat until 0 rows.
UPDATE users SET display_name = fullname
WHERE id IN (
  SELECT id FROM users
  WHERE display_name IS NULL AND fullname IS NOT NULL
  LIMIT 5000
);

-- Step 5 (contract): only after no running code uses the old column.
ALTER TABLE users DROP COLUMN fullname;
```

Each step is deployed on its own and can be rolled back alone. It feels slow. It is how schema changes are made on systems that cannot stop.

:::example A migration that looked harmless
A developer runs `ALTER TABLE orders ADD COLUMN note text` at peak time. This statement is normally instant. But a long report has an open transaction that reads `orders`. The `ALTER TABLE` needs a strong lock, so it waits for the report. Now every new query on `orders` queues behind the waiting `ALTER TABLE`. Checkout freezes, although the migration has not even started.

With `SET lock_timeout = '3s'`, the migration would have failed after three seconds, and the queue would have cleared. The developer could then retry at a quieter moment.
:::

:::interview How do you add an index or change a column on a large, busy table without downtime?
"For an index I use `CREATE INDEX CONCURRENTLY`, which does not block writes. It cannot run inside a transaction, and if it fails I drop the invalid index and retry. For schema changes I follow expand and contract, because old and new code run together during a deployment: first add the new column as nullable, deploy code that writes both, backfill old rows in small batches, switch reads, and drop the old column in a later release. For `NOT NULL` or a foreign key I add the constraint as `NOT VALID` and validate it separately, so the table scan does not hold a strong lock. I set a `lock_timeout` on every migration, so a migration that cannot get its lock fails fast instead of making all queries wait behind it."
:::

:::revise
- A B-tree index finds rows without scanning the table. In a composite index, column order matters: equality columns first.
- Indexes slow down writes. Add them for measured queries, and check with `EXPLAIN ANALYZE`.
- In a plan, look for `Seq Scan` with many removed rows, wrong row estimates, and avoidable sorts.
- A pool lends out a few connections. Instances times pool size must stay below `max_connections`.
- Use `CREATE INDEX CONCURRENTLY`, `NOT VALID` constraints and `lock_timeout` on live tables.
- Old and new code run together during a deployment: change schemas with expand and contract.
:::

# Redis: caching, locks and rate limiting

*Using a fast in-memory store to save work, and knowing exactly where its promises end.*

## Why it matters

A tea stall owner who gets asked "how much for a cutting chai?" a hundred times a day does not open the account book each time. The price is in his head. He looks at the book only when the price changes.

A **cache** is that memory: a fast place to keep answers that are expensive to compute and are asked for again and again. **Redis** is the most common tool for it. Redis is an in-memory data store. It keeps data in RAM, so reads and writes take well under a millisecond on a normal network. It runs commands one at a time, so every single command is **atomic**: nothing can happen in the middle of it.

In this chapter we use Redis for three jobs: caching, distributed locks and rate limiting. For each one we also look at the limits, because Redis is often trusted with more than it promises.

## Cache-aside: the standard pattern

In **cache-aside**, the application talks to both the cache and the database.

:::flow Reading with cache-aside
Request | get product 42
Redis GET | hit: return at once
PostgreSQL | on a miss, read the row
Redis SET | store with a TTL
Response | return the data
:::

A **cache hit** means the data was found in the cache. A **cache miss** means it was not. A **TTL** (time to live) is the number of seconds after which Redis deletes the key by itself.

```javascript
// cache.js
import Redis from 'ioredis';
import { pool } from './db.js';

export const redis = new Redis(process.env.REDIS_URL);
redis.on('error', (err) => console.error('redis error', err.message));

const BASE_TTL = 300;                              // 5 minutes

export async function getProduct(id) {
  const key = `product:v1:${id}`;
  const cached = await redis.get(key).catch(() => null);  // cache down?
  if (cached !== null) return JSON.parse(cached);         // hit

  const { rows } = await pool.query(
    'SELECT id, title, price_paise FROM products WHERE id = $1', [id]);
  const product = rows[0] ?? null;

  // Jitter: a random extra, so keys do not all expire together.
  // "Not found" is cached too, but only for a short time.
  const ttl = product ? BASE_TTL + Math.floor(Math.random() * 60) : 30;
  await redis
    .set(key, JSON.stringify(product), 'EX', ttl)
    .catch(() => {});                        // a cache error is not fatal
  return product;
}
```

Four production details are hidden in this small function:

- **The cache is optional.** If Redis is down, `.catch` turns the failure into a miss, and we fall back to the database. A cache problem must make the app slower, not broken.
- **Jitter on the TTL.** If a thousand keys are written in the same second with the same TTL, they also expire in the same second, and the database gets a sudden wave of queries.
- **Negative caching.** A product that does not exist is cached as `null` for 30 seconds. Otherwise, requests for missing IDs would hit the database every single time.
- **A version in the key** (`v1`). When the shape of the cached object changes, switch to `v2`. Old and new code then never read each other's format.

| Pattern | How it works | Use it when |
|---|---|---|
| Cache-aside | App reads the cache, falls back to the database, fills the cache | The default choice |
| Write-through | Every write updates the database and the cache together | Reads must be fresh right after a write |
| Write-behind | Write to the cache first, save to the database later | Very high write rates where losing a few writes is acceptable |

## Invalidation: the hard part

**Invalidation** means removing or updating cached data when the real data changes. The rule that causes the fewest bugs:

**After the database commit, delete the key. Do not write the new value into the cache.**

```javascript
export async function updatePrice(id, pricePaise) {
  await pool.query(
    'UPDATE products SET price_paise = $1 WHERE id = $2', [pricePaise, id]);
  // After the write is committed: remove the old cached copy.
  await redis.del(`product:v1:${id}`);
}
```

Why delete and not set? If two updates run at the same moment, their two "set" calls can reach Redis in the opposite order to their database commits. The cache then keeps the older value. A delete has no such problem: the next reader simply loads the fresh row.

:::warn Even "delete after write" can leave stale data
A reader can load the old row from the database, then a writer updates the row and deletes the key, and then the slow reader stores its old copy in the cache. Also, the delete call itself can fail. So every cache entry needs a TTL as a safety net: wrong data then repairs itself after a few minutes. And never read from the cache for a decision that must be exact, such as "is there enough balance?". Read that from the database, inside a transaction.
:::

## Cache stampede

A very popular key expires. In the same instant, 500 requests miss the cache and all run the same slow query. This is a **cache stampede**. A simple defence inside one process is **single flight**: the first caller does the work, and the others wait for the same promise.

```javascript
const inFlight = new Map();          // key -> promise of the result

export function singleFlight(key, loader) {
  const running = inFlight.get(key);
  if (running) return running;       // someone is already loading it

  const promise = loader().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

// Usage: 500 callers at the same time -> one database query.
// const product = await singleFlight(`product:${id}`, () => getProduct(id));
```

This protects one app instance. With 20 instances you still get at most 20 queries instead of 500, which is usually enough.

## Distributed locks

Sometimes only one worker in the whole system should do a job: for example, generating a daily report at midnight when five instances all wake up. A lock in one process's memory cannot help, because the other processes cannot see it. A **distributed lock** is a lock that all processes share, kept in a common store such as Redis.

The lock is one Redis command: `SET key value NX PX 30000`.

- `NX` means "set only if the key does not exist". Only one caller can win.
- `PX 30000` gives the key a TTL of 30 seconds. If the winner crashes, the lock frees itself.
- The value is a random token that only the winner knows.

```javascript
import { randomUUID } from 'node:crypto';

// Delete the lock only if it is still OURS. Lua runs atomically in Redis.
const RELEASE = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0`;

export async function withLock(name, ttlMs, fn) {
  const key = `lock:${name}`;
  const token = randomUUID();
  const ok = await redis.set(key, token, 'PX', ttlMs, 'NX');
  if (ok !== 'OK') return { acquired: false };     // someone else has it

  try {
    return { acquired: true, value: await fn() };
  } finally {
    await redis.eval(RELEASE, 1, key, token);
  }
}

// await withLock('daily-report:2026-11-18', 60_000, buildReport);
```

Why the token and the small **Lua** script? (Lua is a scripting language that Redis can run on the server as one atomic step.) Suppose our lock expired while we were still working, and another worker took it. A plain `DEL` would now delete **their** lock. The script deletes the key only if it still holds our token.

### The limits of a Redis lock

:::example Dry run: the lock that expired during work
| Time | Worker A | Worker B |
|---|---|---|
| 0 s | Gets the lock, TTL 30 s | |
| 1 s | Starts a long pause (slow disk, frozen container, heavy garbage collection) | |
| 30 s | Still paused. Redis expires the lock | |
| 31 s | | Gets the lock, starts the job |
| 35 s | Wakes up, still believes it has the lock, writes its result | Also writing |

Both workers were "inside the lock" at the same time. No code in worker A can prevent this, because A did not know it was paused.
:::

So a Redis lock is good for **efficiency**: avoiding duplicate work that would be wasteful but harmless. It is not enough for **correctness**: cases where two workers at once would corrupt data or charge money twice. Also, if a Redis primary fails just after granting a lock and before copying it to its replica, the new primary does not know about the lock.

For correctness, let the system that stores the data protect itself:

- A **unique constraint** or an idempotency key, so the second write fails.
- A **row lock** (`SELECT ... FOR UPDATE`) inside the database that holds the data.
- A **fencing token**: a number that grows with every lock grant. The storage accepts a write only if its token is higher than the last one it saw, so a late write from an old lock holder is rejected.

```sql
-- Fencing: worker A (token 33) is rejected after worker B (token 34) wrote.
UPDATE reports
SET body = $1, fence = $2
WHERE id = $3 AND fence < $2;     -- 0 rows updated -> we lost the lock
```

## Rate limiting with a token bucket

A **rate limiter** restricts how many requests one client may send in a period. It protects you from abuse and from one buggy client using all your capacity. With several app instances, the counters must live in a shared place, and Redis fits well.

The **token bucket** is a simple and fair algorithm. Imagine a bucket that holds up to 10 tokens. Every request takes one token. Tokens are refilled at a steady rate, say 5 per second. An empty bucket means "rejected". A client can send a short burst of 10, but over time it cannot go faster than 5 per second.

The check and the update must be one atomic step, or two instances could both spend the last token. So we do it in a Lua script.

```text
-- token_bucket.lua     KEYS[1] = bucket key
-- ARGV[1] = capacity   ARGV[2] = tokens added per second
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])

local t   = redis.call('TIME')              -- Redis clock: one clock for all
local now = t[1] * 1000 + math.floor(t[2] / 1000)      -- in milliseconds

local saved  = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(saved[1]) or capacity   -- new client: full bucket
local ts     = tonumber(saved[2]) or now

-- Refill for the time that has passed, up to the capacity.
tokens = math.min(capacity, tokens + (now - ts) / 1000 * rate)

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
-- Forget idle clients: after this time the bucket would be full anyway.
redis.call('PEXPIRE', KEYS[1], math.ceil(capacity / rate * 1000) + 1000)
return allowed
```

```javascript
import { readFileSync } from 'node:fs';
import { redis } from './cache.js';

const SCRIPT = readFileSync('./token_bucket.lua', 'utf8');

export function rateLimit({ capacity = 10, perSecond = 5 } = {}) {
  return async (req, res, next) => {
    const who = req.user?.id ?? req.ip;        // per user, else per IP
    try {
      const allowed = await redis.eval(
        SCRIPT, 1, `rl:${who}`, capacity, perSecond);
      if (allowed === 1) return next();
      res.set('Retry-After', '1');             // seconds
      res.status(429).json({ title: 'Too many requests', status: 429 });
    } catch (err) {
      next();      // Redis is down: we choose to let the request pass
    }
  };
}
```

:::example Dry run: capacity 3, refill 1 token per second
| Time | Event | Tokens before | Result | Tokens after |
|---|---|---|---|---|
| 0.0 s | Request 1 | 3 (new bucket) | Allowed | 2 |
| 0.1 s | Request 2 | 2.1 | Allowed | 1.1 |
| 0.2 s | Request 3 | 1.2 | Allowed | 0.2 |
| 0.3 s | Request 4 | 0.3 | Rejected (429) | 0.3 |
| 1.2 s | Request 5 | 0.3 + 0.9 = 1.2 | Allowed | 0.2 |
:::

| Algorithm | Idea | Remark |
|---|---|---|
| Fixed window | Count requests per clock minute | Simplest. A client can send a double burst at the edge of two windows |
| Sliding window | Count requests in the last 60 seconds | Fair, needs more memory |
| Token bucket | Tokens refill at a steady rate | Allows short bursts, cheap to store |

:::note Fail open or fail closed?
When Redis is unreachable, the limiter must decide. **Fail open** lets requests pass: the site stays up but is unprotected for a while. **Fail closed** rejects them: safe, but a Redis problem becomes a full outage. For general API limits, fail open is common. For sensitive actions, such as login attempts or sending OTP messages, fail closed is usually better.
:::

:::interview How would you implement a distributed lock with Redis, and when is it not safe?
"I take the lock with `SET key token NX PX ttl`. `NX` lets only one client win, the TTL frees the lock if the holder crashes, and the token is a random value. I release it with a Lua script that deletes the key only if the value is still my token, so I never delete someone else's lock. The limit is that the lock can expire while the holder is paused or slow, and then two workers run at once. A failover to a replica can also lose the lock. So I use a Redis lock for efficiency, like avoiding duplicate cron runs. For correctness, such as payments, I rely on the database: a unique constraint, a row lock, or a fencing token that the storage checks on every write."
:::

:::revise
- Cache-aside: read the cache, on a miss read the database and store the result with a TTL.
- On writes, delete the key after the commit. Always keep a TTL as a safety net against stale data.
- Add jitter to TTLs, cache "not found" briefly, and use single flight against stampedes.
- A cache failure must make the app slower, not broken. Never use cached data for exact decisions.
- `SET key token NX PX ttl` plus a compare-and-delete script gives a lock for efficiency, not for correctness.
- Rate limits across instances need shared, atomic counters: a token bucket in a Lua script.
:::

# Kafka fundamentals

*A shared log that services write to and read from, so they can work together without calling each other.*

## Why it matters

In a housing society, the secretary does not phone every flat about a water cut. He writes a notice in the register at the gate. Every resident reads the register when they pass, and each one remembers up to which page they have read. The secretary does not know or care who reads it. New residents can read the old pages too.

**Apache Kafka** is that register for software. A service writes "order A17 was placed" once. Inventory, payments, email and analytics each read it at their own speed. If the email service is down for an hour, nothing is lost: it continues from its bookmark when it returns.

## The idea: an append-only log

Kafka is a **distributed event streaming platform**. In simple words: a set of servers that store streams of messages on disk, in order, and let many programs read them. Here are the words you need.

| Word | Meaning |
|---|---|
| **Event** (or message, record) | One entry: a key, a value, optional headers and a timestamp |
| **Topic** | A named stream of events, such as `orders.events` |
| **Partition** | A topic is split into partitions. Each partition is one ordered, append-only log |
| **Offset** | The position number of an event inside its partition: 0, 1, 2 and so on |
| **Broker** | One Kafka server. A group of brokers is a cluster |
| **Producer** | A program that writes events |
| **Consumer** | A program that reads events |

**Append-only** means new events are only added at the end. Nothing is changed or removed in the middle. Reading does not delete an event. Events stay until the **retention** period ends (for example seven days), whether or not anyone has read them.

:::flow From producer to consumer
Producer | orders service
Topic | orders.events
Partition | chosen by the key
Consumer group | inventory service
Offset commit | "I am done up to here"
:::

## Partitions and keys

Why split a topic into partitions? One log on one machine has a speed limit. With several partitions on different brokers, many producers and consumers work in parallel. This is how Kafka scales.

The producer decides the partition. If an event has a **key**, Kafka hashes the key and uses the result to pick the partition. The same key always lands in the same partition.

**Ordering is guaranteed only inside one partition.** So choose the key so that events which must stay in order share it. For order events, use the order ID. Then `order.placed`, `order.paid` and `order.shipped` for order `A17` are always read in that order. Events of two different orders may be read in any order, and that is fine.

:::example Dry run: where do events go?
Topic `orders.events` has 3 partitions. Suppose the hash sends key `A17` to partition 2 and key `B40` to partition 0. (The real partition numbers depend on the hash function. This is an illustration.)

| Event | Key | Partition | Offset |
|---|---|---|---|
| `order.placed` for A17 | `A17` | 2 | 0 |
| `order.placed` for B40 | `B40` | 0 | 0 |
| `order.paid` for A17 | `A17` | 2 | 1 |
| `order.cancelled` for B40 | `B40` | 0 | 1 |
| `order.shipped` for A17 | `A17` | 2 | 2 |

Partition 2 holds the full story of A17 in order. Partition 0 holds the story of B40. An offset is a position inside one partition, so both partitions start at 0.
:::

:::warn Adding partitions changes where keys go
The partition is picked from the hash of the key and the **number of partitions**. If you increase the partition count later, the same key can start landing in a different partition, and for a while old and new events of one order sit in different partitions. Order between them is then not guaranteed. Choose a sensible partition count at the start, and plan carefully before changing it.
:::

## Consumer groups

A **consumer group** is a set of consumers that share one job and one group ID. Kafka gives each partition to exactly **one** consumer in the group. This gives two behaviours with one mechanism:

- **Scaling:** three copies of the inventory service, all in the group `inventory-service`, split the partitions between them. Each event is handled by one of them.
- **Broadcast:** the payments service uses a different group ID. It gets its own copy of every event, with its own bookmarks.

| Setup (topic with 3 partitions) | What happens |
|---|---|
| 1 consumer in the group | It reads all 3 partitions |
| 3 consumers in the group | Each reads 1 partition |
| 5 consumers in the group | 3 read one partition each, 2 sit idle |
| 2 different groups | Each group receives every event |

So the number of partitions is the upper limit for parallel consumers in one group. When a consumer joins, leaves or crashes, Kafka reassigns the partitions. This is called a **rebalance**.

## Offsets and delivery guarantees

A consumer group stores its bookmark for each partition: the **committed offset**. After a restart or a rebalance, reading continues from there. *When* you commit decides what happens if a consumer crashes.

| Guarantee | Order of steps | After a crash |
|---|---|---|
| At most once | Commit the offset, then process | An event can be lost |
| At least once | Process, then commit the offset | An event can be processed twice |
| Exactly once | Needs extra machinery | See below |

**At least once** is the normal choice. Losing a payment event is worse than seeing it twice, and duplicates can be handled, as the next chapter shows.

"Exactly once" needs care as a phrase. Kafka offers an **idempotent producer** (retries of a send do not create duplicates in the log) and **transactions** (read from one topic, write to another topic, and commit the offsets, all as one unit). This gives exactly-once results **inside Kafka**. But when your consumer writes to PostgreSQL or calls an email API, Kafka cannot include that in its transaction. There, the practical recipe is: **at-least-once delivery plus an idempotent consumer**. The effect is as if each event was processed once.

## Durability: replicas and acks

Each partition is copied to several brokers. The number of copies is the **replication factor**, often 3. One copy is the **leader**. Producers write to the leader, and the **followers** copy from it. If the leader's broker dies, a follower that is fully up to date takes over.

The producer chooses how sure it wants to be before a write counts as done, with the `acks` setting.

| `acks` | The producer waits for | Risk |
|---|---|---|
| `0` | Nothing | Events can be lost without any error |
| `1` | The leader only | Lost if the leader dies before followers copy it |
| `all` | All in-sync replicas | Safest. Use it for business events |

## A producer and a consumer in Node.js

We use the `kafkajs` client here. Other Node.js clients exist, and the ideas are the same.

```javascript
// kafka.js
import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'orders-service',
  brokers: ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],
});

// producer.js
export const producer = kafka.producer();
await producer.connect();

export async function publishOrderPlaced(order) {
  await producer.send({
    topic: 'orders.events',
    acks: -1,                           // -1 means "all in-sync replicas"
    messages: [{
      key: String(order.id),            // same order -> same partition
      value: JSON.stringify({
        id: order.eventId,              // unique ID of this event
        type: 'order.placed',
        occurredAt: new Date().toISOString(),
        data: { orderId: order.id, totalPaise: order.totalPaise },
      }),
    }],
  });
}
```

```javascript
// inventory-service/consumer.js
const consumer = kafka.consumer({ groupId: 'inventory-service' });

await consumer.connect();
await consumer.subscribe({ topic: 'orders.events', fromBeginning: true });

await consumer.run({
  // Called for one message at a time, in order, per partition.
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    console.log(`${topic}[${partition}] offset ${message.offset}`);

    if (event.type === 'order.placed') {
      await reserveStock(event);        // must be safe to run twice
    }
    // If this function returns, the offset can be committed.
    // If it throws, the message is delivered again: at least once.
  },
});
```

`fromBeginning: true` matters only the first time a group reads a topic: it starts from the oldest stored event instead of only new ones. After that, the group continues from its committed offsets.

## Lag, retention and compaction

**Consumer lag** is the distance between the newest offset in a partition and the group's committed offset. It tells you how far behind a consumer is. Growing lag is the most important Kafka number to watch: it means consumers are slower than producers, or stuck.

By default, Kafka deletes events when they are older than the retention time. A **compacted** topic works differently: Kafka keeps at least the **latest** event for every key and removes older ones. This is useful for "current state" topics, such as the latest price of each product.

## Kafka or a classic message queue?

| Point | Kafka (a log) | Classic queue such as RabbitMQ |
|---|---|---|
| After a message is read | It stays until retention ends | It is removed once acknowledged |
| Read old messages again | Yes, by moving the offset back | No |
| Ordering | Per partition | Per queue, weaker with several consumers |
| Several independent readers | Built in, through consumer groups | Needs one queue per reader |
| Typical use | Event streams, many consumers, high volume | Task queues, per-message routing and retries |

For a simple "send this email later" job queue, a queue is easier. Kafka is strong when many services need the same stream of facts, in order, and may need to re-read history.

:::interview How does Kafka guarantee ordering, and how do you scale consumers?
"Kafka guarantees order only within one partition. The producer picks the partition by hashing the message key, so I choose a key such as the order ID to keep all events of one order in one partition and in order. There is no global order across partitions. To scale reading, I run several consumers with the same group ID. Kafka assigns each partition to exactly one consumer in the group, so the partition count is the maximum useful number of consumers. Consumers commit offsets as bookmarks. If I process first and commit after, I get at-least-once delivery, so my handlers must be idempotent. I monitor consumer lag to see whether consumers keep up."
:::

:::revise
- A topic is split into partitions. Each partition is an ordered, append-only log, and an offset is a position in it.
- The key decides the partition. Order is guaranteed only inside one partition, so key by the thing that must stay in order.
- In a consumer group, each partition is read by one consumer. Different groups each get every event.
- Process, then commit: at-least-once delivery. Duplicates are possible, so consumers must be idempotent.
- Use `acks=all` and a replication factor of 3 for business events.
- Watch consumer lag. Reading does not delete events. Retention or compaction does.
:::

# Event-driven design: outbox, idempotent consumers and dead letters

*How to publish events without losing them, handle duplicates safely, and park messages that cannot be processed.*

## Why it matters

When you send a parcel by courier, you get a receipt at the counter. The parcel then travels on its own. You do not stand at the counter until it is delivered. And the courier company has rules for trouble: a parcel that arrives twice by mistake, and a parcel that cannot be delivered and goes to a "return" shelf for someone to look at.

Event-driven systems need the same three things. A safe handover, so that no event is lost. A way to live with duplicates. And a shelf for the messages that keep failing. These are the **outbox pattern**, the **idempotent consumer** and the **dead-letter queue**.

## Events, commands and why to use them

In **event-driven design**, services tell each other what happened by publishing events, instead of calling each other directly.

| | Command | Event |
|---|---|---|
| Meaning | "Do this" | "This happened" |
| Name | Imperative: `ChargePayment` | Past tense: `OrderPlaced` |
| Receivers | Exactly one | Zero, one or many |
| Sender knows the receiver | Yes | No |

The gain is **loose coupling**. The orders service does not know that an email service exists. You can add a loyalty-points service next month without touching orders at all. And if the email service is down, orders still works. The price is that the flow is harder to see in the code, and data becomes consistent a little later instead of at once.

Give every event the same outer shape, called an **envelope**:

```json
{
  "id": "0b6f6c1e-3a52-4c0e-9d53-7f1b2a9c8e11",
  "type": "order.placed",
  "version": 1,
  "occurredAt": "2026-11-18T09:30:00.000Z",
  "data": {
    "orderId": "A17",
    "userId": "42",
    "totalPaise": 149900,
    "items": [{ "sku": "TSHIRT-M", "quantity": 2 }]
  }
}
```

The `id` is unique for the event and is the basis of duplicate detection. The `version` lets consumers handle a changed shape. Evolve events like protobuf messages: add optional fields, and never rename or remove fields that consumers already read.

## The dual-write problem

Placing an order needs two writes: save the order in PostgreSQL, and publish `order.placed` to Kafka. These are two different systems. There is no transaction that covers both. Whichever order you choose, a crash in between causes damage.

| Order of steps | Crash between the two steps | Result |
|---|---|---|
| Save to the database, then publish | Order saved, event never sent | Stock is never reserved. A customer waits forever |
| Publish, then save to the database | Event sent, order missing | Other services act on an order that does not exist |

This is the **dual-write problem**. A `try/catch` cannot fix it, because the process can die at any line.

:::warn Publishing inside the transaction does not help
Calling `producer.send()` between `BEGIN` and `COMMIT` looks safe, but it is not. If the send succeeds and the `COMMIT` then fails, the event is out and the order is not saved. If the send is slow, the transaction holds locks and a connection for the whole wait. A database transaction can only protect writes to that database.
:::

## The transactional outbox

The solution is to make it **one write**. In the same database transaction that saves the order, we also insert the event into a table called `outbox`. Both rows commit together or not at all. A separate small worker, the **relay**, reads the outbox table and publishes to Kafka.

:::flow The outbox pattern
Request | place order
One transaction | insert order + insert outbox row
Relay worker | reads unpublished rows
Kafka | event is published
Mark as sent | set published_at
:::

```sql
CREATE TABLE outbox (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id     uuid        NOT NULL DEFAULT gen_random_uuid(),
  topic        text        NOT NULL,
  key          text        NOT NULL,      -- the Kafka message key
  type         text        NOT NULL,
  payload      jsonb       NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz                -- NULL means "not sent yet"
);

-- A small index that contains only the rows still waiting.
CREATE INDEX outbox_pending_idx ON outbox (id)
  WHERE published_at IS NULL;
```

```javascript
// orders-service/placeOrder.js
import { withTx } from './db.js';

export function placeOrder(userId, items) {
  return withTx(async (db) => {
    const totalPaise = items.reduce(
      (sum, i) => sum + i.quantity * i.pricePaise, 0);

    const { rows } = await db.query(
      `INSERT INTO orders (user_id, status, total_paise)
       VALUES ($1, 'PENDING', $2) RETURNING id`,
      [userId, totalPaise],
    );
    const orderId = rows[0].id;
    // (inserting the order_items rows is left out to keep this short)

    // Same transaction: the event is saved if and only if the order is.
    await db.query(
      `INSERT INTO outbox (topic, key, type, payload)
       VALUES ($1, $2, $3, $4)`,
      ['orders.events', String(orderId), 'order.placed',
        JSON.stringify({ orderId, userId, items, totalPaise })],
    );
    return orderId;
  });
}
```

Now the relay. It picks a batch of waiting rows, publishes them, and marks them as sent.

```javascript
// orders-service/relay.js
import { withTx } from './db.js';
import { producer } from './producer.js';

// Wrap an outbox row in the standard event envelope.
const toEnvelope = (row) => JSON.stringify({
  id: row.event_id,
  type: row.type,
  version: 1,
  occurredAt: row.created_at,
  data: row.payload,
});
```

```javascript
async function relayBatch() {
  return withTx(async (db) => {
    const { rows } = await db.query(
      `SELECT id, event_id, topic, key, type, payload, created_at
       FROM outbox
       WHERE published_at IS NULL
       ORDER BY id
       LIMIT 100
       FOR UPDATE SKIP LOCKED`,       // two relays never take the same rows
    );
    for (const row of rows) {
      await producer.send({
        topic: row.topic,
        acks: -1,
        messages: [{ key: row.key, value: toEnvelope(row) }],
      });
    }
    await db.query(
      `UPDATE outbox SET published_at = now()
       WHERE id = ANY($1::bigint[])`,
      [rows.map((r) => r.id)],
    );
    return rows.length;
  });
}
```

```javascript
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs until the AbortSignal fires (on shutdown).
export async function runRelay(signal) {
  while (!signal.aborted) {
    try {
      const sent = await relayBatch();
      if (sent === 0) await sleep(500);     // nothing to do: short nap
    } catch (err) {
      console.error('outbox relay failed', err);
      await sleep(2000);                    // Kafka or database trouble
    }
  }
}
```

In the PostgreSQL chapter we said: no network calls inside a transaction. The relay is a deliberate, limited exception. The locked rows are outbox rows that only relays touch, other relays skip them, and the batch is small. If Kafka is down, the send throws, the transaction rolls back, and the rows wait for the next round.

:::example Dry run: every crash point
| Crash happens | State after the crash | What the relay does next |
|---|---|---|
| Before the order transaction commits | No order, no outbox row | Nothing. The client gets an error and can retry |
| After the commit, before the relay runs | Order and outbox row are saved | Finds the row and publishes it |
| After sending to Kafka, before marking as sent | Event is in Kafka, row still looks unsent | Sends it **again**: a duplicate |
| After marking as sent | All done | Nothing |

No case loses an event. One case sends it twice. So the outbox gives **at-least-once** publishing, and the consumer must cope with duplicates.
:::

:::note Details that matter in production
- **Order.** With one relay, events leave roughly in `id` order. Two transactions can commit in a different order than their IDs, and several relays can overtake each other. If strict order per key is required, run a single relay and make consumers tolerant, for example by ignoring an event that is older than what they already applied.
- **Cleanup.** Delete published rows after a few days, or the table grows forever.
- **Change data capture (CDC).** Instead of polling, a tool such as Debezium can read the database's own change log and publish outbox rows to Kafka. The table and the idea stay the same.
:::

## Idempotent consumers

A consumer is **idempotent** if processing the same event twice has the same effect as processing it once. Duplicates will arrive: from the relay as shown above, from a consumer that crashed before committing its offset, or from a rebalance.

The most general method is a table of processed event IDs, often called an **inbox**. The trick is to insert the ID **in the same transaction** as the business change.

```sql
CREATE TABLE processed_events (
  consumer     text        NOT NULL,     -- which service or handler
  event_id     uuid        NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer, event_id)
);
```

```javascript
// inventory-service/handlers.js
export function onOrderPlaced(event) {
  return withTx(async (db) => {
    const seen = await db.query(
      `INSERT INTO processed_events (consumer, event_id)
       VALUES ('inventory', $1)
       ON CONFLICT DO NOTHING`,
      [event.id],
    );
    if (seen.rowCount === 0) return;          // duplicate: do nothing

    for (const item of event.data.items) {
      const r = await db.query(
        `UPDATE stock SET available = available - $1
         WHERE sku = $2 AND available >= $1`,
        [item.quantity, item.sku],
      );
      if (r.rowCount === 0) throw new OutOfStock(item.sku);
    }
    // ... insert a "stock.reserved" row into this service's own outbox ...
  });
}
```

`OutOfStock` is a small error class of our own with `permanent = true`, which the retry code below uses. In the saga chapter, inventory answers such a case with a `stock.rejected` event instead of only failing.

If the handler fails halfway, the transaction rolls back and the `processed_events` row disappears with it. The redelivered event is then processed normally. If the handler succeeded and the event comes again, the insert conflicts and we skip the work.

Some operations are idempotent by nature, and need no inbox:

| Operation | Idempotent? | Why |
|---|---|---|
| `UPDATE orders SET status = 'PAID' WHERE id = 7` | Yes | Setting the same value twice changes nothing |
| `INSERT ... ON CONFLICT DO NOTHING` with a natural unique key | Yes | The second insert is ignored |
| `UPDATE stock SET available = available - 2` | No | Each run subtracts again |
| Sending an email or charging a card | No | Needs an inbox or the provider's idempotency key |

## Retries and the dead-letter queue

Some events fail every time: broken JSON, an unknown product, a bug in the handler. Such an event is called a **poison message**. If the consumer keeps retrying it forever, the whole partition is stuck behind it, because Kafka reads a partition in order.

A **dead-letter queue** (DLQ) is a separate topic where we park messages that failed after a few tries. The main flow continues. A human or a tool looks at the DLQ later.

```javascript
const MAX_ATTEMPTS = 4;

export async function eachMessage({ topic, partition, message }) {
  for (let attempt = 1; ; attempt++) {
    try {
      const event = JSON.parse(message.value.toString());
      await onOrderPlaced(event);
      return;                                       // success
    } catch (err) {
      const hopeless = err instanceof SyntaxError || err.permanent === true;
      if (!hopeless && attempt < MAX_ATTEMPTS) {
        await sleep(200 * 2 ** attempt);            // 400, 800, 1600 ms
        continue;                                   // try again
      }
      await producer.send({
        topic: `${topic}.dlq`,                      // park the message
        messages: [{
          key: message.key,
          value: message.value,                     // the original bytes
          headers: {
            'x-error': String(err.message).slice(0, 500),
            'x-source': `${topic}/${partition}/${message.offset}`,
          },
        }],
      });
      return;         // returning lets the offset move past this message
    }
  }
}
```

The code separates two kinds of failure. A **transient** failure may pass on its own: a database timeout, a short network problem. It is worth a few retries with growing pauses. A **permanent** failure will never pass: invalid data. It goes straight to the DLQ. Mark your own business errors with `permanent = true` where a retry cannot help.

:::warn A DLQ is not a dustbin
A message in the DLQ is a customer whose order was not processed. Put an alert on the DLQ size, store enough detail in the headers to understand the failure, and build a way to **replay** messages after the bug is fixed. Replaying is safe only because your consumers are idempotent. Also note that parking a message breaks strict order for that key: later events for the same order will be processed before the parked one is replayed.
:::

:::interview What is the transactional outbox pattern, and what problem does it solve?
"It solves the dual-write problem: a service must change its database and publish an event, but no transaction covers both. If it crashes between the two writes, either the event is lost or an event exists for data that was never saved. With the outbox, I insert the event into an `outbox` table in the same database transaction as the business change, so both commit or neither does. A relay process then reads unpublished rows, using `FOR UPDATE SKIP LOCKED`, publishes them to Kafka and marks them as sent. If the relay crashes after publishing but before marking, it publishes again, so delivery is at least once. That is why consumers must be idempotent, for example with a `processed_events` table that is written in the same transaction as their own change."
:::

:::revise
- An event is a past fact for many listeners. A command is a request to one receiver.
- Writing to the database and to Kafka separately is a dual write. A crash in between loses or invents events.
- Outbox: insert the event row in the same transaction as the data, and let a relay publish it later.
- The outbox gives at-least-once delivery. Duplicates are normal, not rare.
- Make consumers idempotent: record the event ID in the same transaction as the business change.
- After a few retries, park a failing message in a dead-letter topic, alert on it, and replay it after the fix.
:::

# Database per service, consistency and sagas

*Why services must not share tables, and how to complete a business operation that spans several databases.*

## Why it matters

When you book a holiday through a travel agent, three separate companies are involved: an airline, a hotel and a cab service. There is no single button that books all three at once. The agent books the flight, then the hotel, then the cab. If the hotel is full, the agent cancels the flight and returns your money. Each company keeps its own books. The agent's job is to make sure the whole trip is either fully booked or fully undone.

Microservices work the same way. Each service has its own database, and no transaction covers all of them. The pattern that plays the travel agent is called a **saga**.

## Database per service

The rule is simple: **each service owns its data, and no other service touches it directly.** Other services go through the owner's API or listen to its events.

Why so strict? Suppose the orders and inventory services both read and write the same `stock` table.

- Inventory cannot rename a column without breaking orders. The teams must release together.
- A slow report in one service locks rows that the other needs.
- Nobody can say which service's rules protect the data.

A shared table is a hidden, undocumented API. It ties the services together more tightly than any network call. This is the main cause of the distributed monolith from the first chapter.

"Own database" does not always mean a separate server. It can be a separate schema with its own database user, on a shared PostgreSQL server. What matters is that the access rules make cross-service queries impossible.

| You gain | You lose |
|---|---|
| Free schema changes inside a service | `JOIN` across services |
| Independent scaling and tuning | One ACID transaction across services |
| A failure stays inside one service | Instant consistency everywhere |

## Reading data that lives in another service

Without joins, how does the "my orders" page show product titles?

| Way | How | Trade-off |
|---|---|---|
| Copy at write time | The order line stores the title and price when the order is placed | Simple and correct for history. The copy never updates |
| API composition | The caller (often a BFF) fetches orders, then asks catalogue for the titles in one batch call | Always fresh. Slower, and depends on both services being up |
| Local read copy | The service listens to `product.updated` events and keeps its own small table of what it needs | Fast and independent. Slightly behind, and more code |

Keeping a separate copy of data shaped for reading, updated from events, is the simple core of an idea called **CQRS** (command query responsibility segregation): the model you write to and the model you read from do not have to be the same.

## Why not one big distributed transaction?

A protocol called **two-phase commit** (2PC) can make several databases commit together. A coordinator first asks every participant "can you commit?" (the prepare phase), and if all say yes, it tells them all to commit.

It is rarely used between microservices, for practical reasons. While participants wait for the final decision, they hold locks. If the coordinator crashes at the wrong moment, they stay blocked. Every participant must be up for anything to commit, so the availability of the whole operation is worse than that of each part. And many systems you depend on, such as Kafka or an outside payment provider, cannot take part at all.

So we accept **eventual consistency**: the system may be inconsistent for a short time, and becomes consistent once all steps have finished. The order is `PENDING` for two seconds before it becomes `CONFIRMED`. The design question changes from "how do I avoid inconsistency?" to "what does the user see during those two seconds, and what happens if a step fails?".

## Sagas

A **saga** is a sequence of local transactions, one per service. Each step commits on its own and then triggers the next step. If a step fails, the saga runs **compensating transactions** that undo the earlier steps, in reverse order.

A compensation is not a database rollback. The earlier step is already committed and may have been seen by others. A compensation is a new action that reverses the business effect: release the reserved stock, refund the payment.

Our worked example: placing an order needs three services.

| Step | Service | Local transaction | Compensation |
|---|---|---|---|
| 1 | Orders | Create the order as `PENDING` | Mark the order `CANCELLED` |
| 2 | Inventory | Reserve the stock | Release the stock |
| 3 | Payments | Charge the customer | Refund the payment |
| 4 | Orders | Mark the order `CONFIRMED` | (nothing after this) |

There are two ways to coordinate the steps.

### Choreography: everyone reacts to events

In **choreography** there is no boss. Each service listens to events and publishes its own. It is like dancers who each know their own steps and watch each other.

:::flow Choreography, happy path
Orders | publishes order.placed
Inventory | reserves, publishes stock.reserved
Payments | charges, publishes payment.succeeded
Orders | marks the order CONFIRMED
:::

For the failure path: if the charge fails, payments publishes `payment.failed`. Inventory listens to it and releases the stock. Orders listens to it and cancels the order.

### Orchestration: one service directs

In **orchestration**, one component, the **orchestrator**, knows the whole flow. It sends a command to each service, waits for the reply, and decides the next step. It is like the travel agent. Here, the orders service is the orchestrator.

:::flow Orchestration, happy path
Orchestrator | sends stock.reserve
Inventory | replies stock.reserved
Orchestrator | sends payment.charge
Payments | replies payment.succeeded
Orchestrator | order CONFIRMED
:::

| Point | Choreography | Orchestration |
|---|---|---|
| Who knows the full flow | Nobody. It is spread across services | The orchestrator |
| Coupling | Services know only events | Orchestrator knows every participant |
| Easy to follow and debug | Hard with many steps | Easier: one place holds the state |
| Risk | Event chains that nobody understands | A "god" orchestrator full of business logic |
| Good for | 2 or 3 simple steps | Longer flows, timeouts, complex compensations |

## An orchestrator in code

The orchestrator keeps the progress of every saga in a table. This makes it restartable: after a crash, the state is still there.

```sql
CREATE TABLE order_sagas (
  order_id   bigint PRIMARY KEY,
  state      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- States: RESERVING_STOCK -> CHARGING_PAYMENT -> COMPLETED
--   failure paths:  RESERVING_STOCK -> CANCELLED
--                   CHARGING_PAYMENT -> RELEASING_STOCK -> CANCELLED
```

The saga starts inside the `placeOrder` transaction from the previous chapter: we insert a row into `order_sagas` with the state `RESERVING_STOCK`, and an outbox row with the command `stock.reserve`. After that, the saga moves only when a reply arrives. The whole flow fits into one table of transitions.

```javascript
// "current state : reply type"  ->  next state and the command to send
const STEPS = {
  'RESERVING_STOCK:stock.reserved':
    { next: 'CHARGING_PAYMENT', command: 'payment.charge' },
  'RESERVING_STOCK:stock.rejected':
    { next: 'CANCELLED' },
  'CHARGING_PAYMENT:payment.succeeded':
    { next: 'COMPLETED' },
  'CHARGING_PAYMENT:payment.failed':
    { next: 'RELEASING_STOCK', command: 'stock.release' },  // compensate
  'RELEASING_STOCK:stock.released':
    { next: 'CANCELLED' },
};

const FINAL_STATUS = { COMPLETED: 'CONFIRMED', CANCELLED: 'CANCELLED' };
```

```javascript
// Called by the Kafka consumer for every reply event.
export function onSagaReply(event) {
  const orderId = event.data.orderId;
  return withTx(async (db) => {
    const { rows } = await db.query(
      `SELECT state FROM order_sagas WHERE order_id = $1 FOR UPDATE`,
      [orderId],
    );
    const step = rows[0] && STEPS[`${rows[0].state}:${event.type}`];
    if (!step) return;       // duplicate or late reply: nothing to do

    await db.query(
      `UPDATE order_sagas SET state = $2, updated_at = now()
       WHERE order_id = $1`,
      [orderId, step.next],
    );
    if (FINAL_STATUS[step.next]) {
      await db.query(`UPDATE orders SET status = $2 WHERE id = $1`,
        [orderId, FINAL_STATUS[step.next]]);
    }
    if (step.command) {      // the next command leaves through the outbox
      await db.query(
        `INSERT INTO outbox (topic, key, type, payload)
         VALUES ('saga.commands', $1, $2, $3)`,
        [String(orderId), step.command, JSON.stringify({ orderId })],
      );
    }
  });
}
```

Three chapters meet in this function. The row lock (`FOR UPDATE`) stops two replies for the same order from racing. The state change and the next command are saved together through the outbox. And the state machine itself makes the handler idempotent: if `stock.reserved` arrives a second time, the saga is already in `CHARGING_PAYMENT`, no transition matches, and the duplicate is ignored.

A participant is simple. It handles a command idempotently and replies with an event through its own outbox.

```javascript
// payments-service: handles the "payment.charge" command
export function onChargeCommand(cmd) {
  return withTx(async (db) => {
    // UNIQUE (order_id) on payments: a repeated command inserts nothing.
    const { rows } = await db.query(
      `INSERT INTO payments (order_id, status) VALUES ($1, 'PENDING')
       ON CONFLICT (order_id) DO NOTHING RETURNING id`,
      [cmd.data.orderId],
    );
    if (rows.length === 0) return;      // already handled this order
    // A worker then calls the payment provider, passing the payment id
    // as the idempotency key, and writes the reply event
    // (payment.succeeded or payment.failed) to this service's outbox.
  });
}
```

:::example Dry run: the payment fails
A customer orders 2 T-shirts for 1,499 rupees. The card is declined.

| # | What happens | Saga state | Stock (available) | Order status |
|---|---|---|---|---|
| 1 | Order created, command `stock.reserve` sent | `RESERVING_STOCK` | 10 | `PENDING` |
| 2 | Inventory reserves 2, replies `stock.reserved` | `CHARGING_PAYMENT` | 8 | `PENDING` |
| 3 | Payments tries the card: declined, replies `payment.failed` | `RELEASING_STOCK` | 8 | `PENDING` |
| 4 | Orchestrator sends the compensation `stock.release` | `RELEASING_STOCK` | 8 | `PENDING` |
| 5 | Inventory releases 2, replies `stock.released` | `CANCELLED` | 10 | `CANCELLED` |

Between steps 2 and 5, another customer saw only 8 T-shirts available, although the order was never completed. That is the price of eventual consistency. The stock is correct again at the end.
:::

## Designing a saga well

- **Order the steps so that the hard-to-undo step comes last.** Releasing stock is easy. A refund costs money, takes days and annoys the customer. An email cannot be undone at all. So: reserve stock first, charge later, send the email only after the saga has completed. The step after which the saga can only go forward is called the **pivot**.
- **Compensations must be idempotent and must not fail for business reasons.** "Release stock" may arrive twice. And it must always be possible, or the saga is stuck halfway.
- **A saga has no isolation.** Other requests can see the half-finished state. Use a status as a **semantic lock**: an order in `PENDING` cannot be edited or shipped, and the screen shows "Confirming your order".
- **Plan for silence.** A reply may never come. A scheduled job should look for sagas whose `updated_at` is too old, then send the command again or start compensation.

:::warn Compensation is not rollback
A database rollback makes it look as if nothing happened. A compensation cannot do that. The customer may already have received an SMS, another buyer may have seen "out of stock" for a moment, and a refund appears as a second line on the bank statement. Design the business flow with this in mind. Do not assume you can "just undo it".
:::

:::interview How do you keep data consistent across microservices without a distributed transaction?
"Each service owns its database and commits local transactions only. For an operation across services, I use a saga: a sequence of local transactions connected by messages, with a compensating action for each step that may need to be undone. For a short flow I might use choreography, where services react to each other's events. For longer flows I prefer orchestration, where one service keeps the saga state in a table and sends commands, because the flow is visible in one place and timeouts are easier to handle. Messages are published with the outbox pattern, and all handlers and compensations are idempotent, because delivery is at least once. The system is eventually consistent, so I model in-between states such as `PENDING`, and I put steps that are hard to undo, like charging money, as late as possible."
:::

:::revise
- Each service owns its data. A shared table is a hidden API and leads to a distributed monolith.
- Without joins, read across services by copying at write time, composing API calls, or keeping a local read copy from events.
- Two-phase commit blocks and reduces availability. Microservices accept eventual consistency instead.
- A saga is a chain of local transactions with compensating actions for failures.
- Choreography: services react to events. Orchestration: one coordinator keeps the state and sends commands.
- Put steps that are hard to undo last, make every step and compensation idempotent, and watch for stuck sagas.
:::

# Resilience: timeouts, retries, circuit breakers and bulkheads

*How to stop one slow or broken service from pulling down everything that depends on it.*

## Why it matters

On a highway, one stalled truck in one lane can create a jam that reaches back for kilometres. Cars that are not even going that way get stuck. Nothing is "broken" for them. They are simply waiting behind something that waits.

Distributed systems fail the same way. The recommendations service becomes slow. The BFF waits for it. Its request slots fill up with waiting requests. Now the BFF cannot serve even the pages that do not need recommendations. The gateway waits for the BFF. This spread is called a **cascading failure**.

**Resilience** means the system keeps doing useful work when parts of it fail. Four patterns do most of the job: **timeouts**, **retries**, **circuit breakers** and **bulkheads**. Remember one surprising fact: a **slow** dependency is more dangerous than a **dead** one. A dead service fails in a millisecond. A slow one holds your resources hostage.

## Timeouts

A **timeout** is the longest time you are willing to wait for an answer. Without one, a call can hang for minutes and hold memory, a socket and maybe a database connection the whole time.

```typescript
export class HttpError extends Error {
  constructor(readonly status: number, readonly url: string) {
    super(`HTTP ${status} from ${url}`);
  }
}

export async function callJson<T>(
  url: string,
  timeoutMs: number,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),   // abort after timeoutMs
  });
  if (!res.ok) throw new HttpError(res.status, url);
  return (await res.json()) as T;
}
```

How long should a timeout be? Look at how fast the dependency normally answers, and set the timeout a little above its slow-but-healthy responses. If a call usually takes 40 ms and almost never more than 300 ms, a timeout of 500 ms is reasonable. Thirty seconds is not.

**Timeouts must shrink along the call chain.** If the gateway gives up after 3 seconds, there is no point in the BFF waiting 5 seconds for a service. The work would continue for a caller who has already left. A clean way is to pass a **deadline** (a fixed end time) with the request, as gRPC does, and let each service use the time that remains.

| Layer | Example timeout |
|---|---|
| Client app to gateway | 5 s |
| Gateway to BFF | 3 s |
| BFF to a service | 800 ms |
| Service to its database (per query) | 500 ms |

## Retries with backoff and jitter

Many failures are **transient**: they go away by themselves, like a dropped connection or a pod that is restarting. A retry often succeeds. But careless retries cause harm, so follow four rules.

1. **Retry only what is safe.** Idempotent calls, or calls with an idempotency key.
2. **Retry only what can succeed.** A timeout or a `503` may pass. A `400` or `404` will fail the same way every time.
3. **Wait longer each time.** This is **exponential backoff**: about 100 ms, then 200 ms, then 400 ms.
4. **Add randomness.** This is **jitter**. Without it, a thousand clients that failed together also retry together, and hit the recovering service in waves.

```typescript
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isRetryable(err: unknown): boolean {
  if (err instanceof HttpError) {
    return [429, 502, 503, 504].includes(err.status);
  }
  const name = (err as Error)?.name;
  // fetch: TypeError = network failure, TimeoutError = our timeout fired
  return name === 'TypeError' || name === 'TimeoutError';
}

export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseMs = 100, capMs = 2_000, budgetMs = 3_000 } = {},
): Promise<T> {
  const giveUpAt = Date.now() + budgetMs;      // total time we may spend
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const backoff = Math.min(capMs, baseMs * 2 ** (attempt - 1));
      const wait = Math.random() * backoff;    // full jitter: 0..backoff
      const outOfTime = Date.now() + wait > giveUpAt;
      if (!isRetryable(err) || attempt >= attempts || outOfTime) throw err;
      await sleep(wait);
    }
  }
}
```

The `budgetMs` value is a **retry budget** in time: however many attempts are allowed, the function never spends more than this in total. This keeps the retries inside the caller's own timeout.

:::example Dry run: three attempts
`attempts = 3`, `baseMs = 100`. The service answers `503` twice, then `200`.

| Attempt | Result | Backoff limit | Random wait (example) |
|---|---|---|---|
| 1 | `503` | 100 ms | 62 ms |
| 2 | `503` | 200 ms | 141 ms |
| 3 | `200` | | returned to the caller |

If attempt 3 had failed too, the error would be thrown, because `attempt >= attempts`.
:::

:::warn Retries multiply across layers
Suppose the gateway, the BFF and the orders service each retry a failed call 3 times. When the database is slow, one user request becomes 3 x 3 x 3 = 27 database calls. The retries meant to help now keep the database down. This is called a **retry storm**. Retry at **one** layer only, usually the one closest to the failure, and let the other layers fail fast.
:::

## The circuit breaker

When a dependency has been failing for a while, calling it again and again helps nobody. You wait for a timeout each time, and you add load to a service that is trying to recover. A **circuit breaker** watches the calls. After too many failures it stops calling for a while and fails at once instead.

| State | Behaviour | Moves to |
|---|---|---|
| **Closed** | Calls pass through. Failures are counted | Open, after too many failures in a row |
| **Open** | Calls are rejected at once, with no network call | Half-open, after a cool-down time |
| **Half-open** | One trial call is allowed | Closed if it succeeds, open again if it fails |

:::flow States of a circuit breaker
Closed | normal traffic
Too many failures | counter reaches the limit
Open | fail fast, no calls
Cool-down over | allow one trial call
Closed or open | decided by the trial
:::

```typescript
export class CircuitOpenError extends Error {}
type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export class CircuitBreaker {
  private state: State = 'CLOSED';
  private failures = 0;
  private openedAt = 0;
  constructor(private maxFailures = 5, private coolDownMs = 10_000) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    let isTrial = false;
    if (this.state !== 'CLOSED') {
      const cooling = Date.now() - this.openedAt < this.coolDownMs;
      if (cooling || this.state === 'HALF_OPEN') throw new CircuitOpenError();
      this.state = 'HALF_OPEN';       // cool-down over: we are the trial
      isTrial = true;
    }
    try {
      const result = await fn();
      this.state = 'CLOSED';          // healthy again
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures += 1;
      if (isTrial || this.failures >= this.maxFailures) {
        this.state = 'OPEN';          // fail fast from now on
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}
```

While the state is `HALF_OPEN`, a trial call is already running, so other calls are rejected: only one trial at a time. Use one breaker **per dependency**, not one for the whole app. Count only failures that say "the dependency is unhealthy": timeouts, connection errors and 5xx answers. A `404` is a correct answer and must not open the breaker. This small class teaches the idea. In a real project, prefer a tested library (`opossum` is a well-known one for Node.js), which also measures failure rates over a time window.

## The bulkhead

A ship is divided into sealed sections called bulkheads. If one section is flooded, the others stay dry and the ship floats. In software, a **bulkhead** limits how much of your capacity one dependency may use. Even if recommendations hangs completely, it can hold at most, say, 10 of your concurrent calls. The rest of your capacity stays free for checkout.

```typescript
export class BulkheadFullError extends Error {}

export class Bulkhead {
  private active = 0;
  private waiting: Array<() => void> = [];

  constructor(private maxActive: number, private maxWaiting: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active < this.maxActive) {
      this.active += 1;                        // a slot is free: take it
    } else if (this.waiting.length < this.maxWaiting) {
      // Wait in line. Whoever finishes hands the slot directly to us.
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    } else {
      throw new BulkheadFullError();           // shed load: fail at once
    }
    try {
      return await task();
    } finally {
      const next = this.waiting.shift();
      if (next) next();                        // pass our slot on
      else this.active -= 1;                   // or free it
    }
  }
}
```

Rejecting a request at once when the line is full is called **load shedding**. A fast "sorry, try again" is better than a slow timeout for everyone.

## Putting it together, with a fallback

A **fallback** is what you return when the real answer is not available: an empty list, a cached older value, or a default.

```typescript
const picksBreaker = new CircuitBreaker(5, 10_000);
const picksBulkhead = new Bulkhead(10, 20);
type Picks = { items: string[] };

export async function getPicks(userId: string): Promise<Picks> {
  const url = `http://recommendations/v1/picks?user=${userId}`;
  try {
    return await picksBulkhead.run(() =>          // at most 10 at once
      picksBreaker.run(() =>                      // skip if it is down
        retry(() => callJson<Picks>(url, 400),    // 400 ms per attempt
          { attempts: 2, budgetMs: 900 })));
  } catch {
    return { items: [] };       // fallback: the page works without picks
  }
}
```

Read it from the inside out. Each attempt has a timeout. A failed attempt is retried once with backoff. The breaker sees the final result of the retries. The bulkhead limits how many of these can run together. And the caller always gets an answer.

| Pattern | Protects against | One-line rule |
|---|---|---|
| Timeout | Waiting forever | Every network call has one |
| Retry with backoff and jitter | Short, transient failures | Only safe calls, few attempts, one layer |
| Circuit breaker | A dependency that stays down | Fail fast and give it time to recover |
| Bulkhead | One dependency using all capacity | Limit concurrent calls per dependency |
| Fallback | A missing optional answer | Return less, not an error |

:::tip
Fallbacks are for optional data. Do not invent a fallback for something that must be correct. If the payment service is down, do not pretend the payment worked. Tell the user honestly, and keep the order in a state from which it can continue.
:::

:::interview A downstream service becomes slow and your service starts failing too. What do you do?
"A slow dependency is worse than a dead one, because my requests pile up waiting and use up connections and memory. First, every outgoing call gets a timeout that is shorter than my own caller's timeout. Second, I retry only idempotent calls, a small number of times, with exponential backoff and jitter, and only at one layer to avoid a retry storm. Third, I put a circuit breaker around the dependency: after repeated failures it opens and fails fast, then allows a trial call after a cool-down. Fourth, a bulkhead limits concurrent calls to that dependency, so it cannot use all my capacity. Finally, I return a fallback where the data is optional. I would also add metrics and alerts for timeouts and breaker state."
:::

:::revise
- A slow dependency is more dangerous than a dead one. Every network call needs a timeout.
- Timeouts shrink down the call chain. Pass a deadline where you can.
- Retry only safe, transient failures, with exponential backoff, jitter, few attempts and a time budget.
- Retries at several layers multiply. Retry at one layer only.
- A circuit breaker fails fast when a dependency stays down: closed, open, half-open.
- A bulkhead limits concurrent calls per dependency. A fallback returns less instead of an error.
:::

# Observability: logs, metrics and traces

*How to see what your system is doing in production, and find the cause when something goes wrong.*

## Why it matters

A doctor does not guess. She checks your temperature and blood pressure (numbers over time), reads your case history (a record of events), and may order a scan that follows a dye through your body (the path of one thing through the whole system).

With one server, you could log in and read a file. With twenty services and many copies of each, the question "why was checkout slow for this user at 9:30?" has no single file to read. **Observability** means you can answer such questions from the outside, using the data the system emits. That data comes in three kinds, often called the three pillars.

| Pillar | What it is | The question it answers |
|---|---|---|
| **Logs** | Records of single events, with details | What exactly happened in this request? |
| **Metrics** | Numbers measured over time | Is the system healthy? Is it getting worse? |
| **Traces** | The path of one request through all services | Where did the time go? Which service failed? |

## Structured logs

A log line such as `Order failed for user 42!!` is easy to write and hard to use. You cannot filter it reliably or count it. A **structured log** is a JSON object with fixed field names. Machines can search, filter and group it.

```json
{
  "level": "error",
  "time": "2026-11-18T09:30:02.114Z",
  "service": "orders",
  "requestId": "req-7f3a",
  "userId": "42",
  "orderId": "A17",
  "msg": "payment charge failed",
  "err": { "type": "HttpError", "message": "HTTP 503 from payments" }
}
```

Now you can ask the log system: all `error` lines of service `orders` with `orderId = A17`. In Node.js, `pino` is a popular and fast JSON logger.

### Correlation IDs

A **correlation ID** (or request ID) is one ID that follows a request through every service. Every log line of that request carries it. One search by that ID then shows the full story.

The problem in Node.js: one process handles many requests at the same time, so a global variable cannot hold "the current request ID". Passing it by hand through every function is painful. `AsyncLocalStorage` solves this. It gives each request its own small store that stays available through all the `await` calls of that request.

```javascript
// logger.js
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import pino from 'pino';

const requestContext = new AsyncLocalStorage();

export const log = pino({
  base: { service: 'orders' },
  // mixin runs for every log line and adds the current request's fields.
  mixin: () => requestContext.getStore() ?? {},
  // Never write secrets into logs.
  redact: ['req.headers.authorization', 'password', 'card.number'],
});

export function requestContextMiddleware(req, res, next) {
  // Reuse the ID from the gateway if there is one, else create it.
  const requestId = req.get('x-request-id') ?? randomUUID();
  res.set('x-request-id', requestId);
  // Everything that runs inside this callback sees the store.
  requestContext.run({ requestId }, next);
}

export const currentRequestId = () => requestContext.getStore()?.requestId;
```

```javascript
// Anywhere deep in the code: no need to pass the ID around.
import { log, currentRequestId } from './logger.js';

export async function chargeOrder(order) {
  log.info({ orderId: order.id }, 'charging order');
  // -> {"level":30,"service":"orders","requestId":"req-7f3a",
  //     "orderId":"A17","msg":"charging order", ...}

  // Pass the ID on, so the next service logs the same ID.
  const res = await fetch('http://payments/v1/charges', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': currentRequestId(),
    },
    body: JSON.stringify({ orderId: order.id }),
    signal: AbortSignal.timeout(800),
  });
  return res.ok;
}
```

`pino` writes the level as a number by default: 30 is `info`, 40 is `warn`, 50 is `error`. Write logs to standard output and let the platform collect them. A service should not manage log files itself.

| Level | Use it for |
|---|---|
| `error` | Something failed and a person may need to act |
| `warn` | Unusual, but handled: a retry, a fallback used |
| `info` | Important business steps: order placed, payment taken |
| `debug` | Details for developers, normally off in production |

:::warn What must never be in a log
Passwords, tokens, full card numbers, OTPs and private personal data. Logs are copied to many systems and read by many people. Use the logger's redaction feature, and log IDs instead of whole objects. Also do not log every line of a loop: a flood of logs is slow, costs money, and hides the one line you need.
:::

## Metrics

A **metric** is a number measured again and again over time, such as requests per second. Metrics are cheap to store, because they are sums, not one record per event. That makes them ideal for dashboards and alerts.

| Type | Meaning | Example |
|---|---|---|
| **Counter** | Only goes up | Total requests, total errors |
| **Gauge** | Goes up and down | Connections in use, queue length |
| **Histogram** | Counts values into ranges (buckets) | Request duration |

For every service, start with the three **RED** metrics: **R**ate (requests per second), **E**rrors (failed requests per second) and **D**uration (how long requests take).

For duration, do not trust the average. If 99 requests take 50 ms and one takes 5 seconds, the average is about 100 ms and looks fine, while one user in a hundred is suffering. Use **percentiles**. The 99th percentile (**p99**) is the value that 99 percent of requests are faster than. A histogram lets the monitoring system estimate percentiles.

```javascript
// metrics.js  (prom-client exposes metrics in the Prometheus format)
import client from 'prom-client';

client.collectDefaultMetrics();           // memory, CPU, event loop lag

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export function metricsMiddleware(req, res, next) {
  const stop = httpDuration.startTimer();
  res.on('finish', () => {
    stop({
      method: req.method,
      // The route pattern (/orders/:id), never the real URL.
      route: req.route?.path ?? 'unmatched',
      status: res.statusCode,
    });
  });
  next();
}

// Prometheus fetches this endpoint every few seconds.
export async function metricsHandler(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}
```

A **label** splits a metric into separate series: one series for each combination of method, route and status.

:::warn Labels with too many values
Every different label value creates a new time series. A label such as `userId`, `orderId` or the raw URL creates millions of series and can bring down the monitoring system. This problem is called **high cardinality**. Labels must come from a small, fixed set: method, route pattern, status code. Put IDs into logs and traces, never into metric labels.
:::

## Distributed tracing

Metrics tell you that checkout is slow. Logs tell you what each service did. A **trace** shows the whole journey of one request as a timeline, so you can see at a glance where the time went.

- A **trace** is the full story of one request. It has a **trace ID**.
- A **span** is one timed step inside it: an HTTP call, a database query, a Kafka publish. A span has a name, a start time, a duration, attributes, and the ID of its parent span.
- **Context propagation** means sending the trace ID and the current span ID along with every outgoing call, so the next service can attach its spans to the same trace.

```text
Trace 4bf92f35...  POST /v1/orders                         total 870 ms
|- orders: POST /v1/orders                    [==================] 870
   |- orders: pg INSERT orders                [=]                   12
   |- orders: HTTP POST inventory/reserve       [==]                95
   |  |- inventory: pg UPDATE stock              [=]                 8
   |- orders: HTTP POST payments/charges           [=============] 740
      |- payments: HTTP POST card provider          [============] 715
```

One look tells you: the time is spent at the outside card provider, not in our database. Without a trace, finding this could take an hour of reading logs from four services.

The standard header that carries the trace context between services is the W3C `traceparent` header:

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             |  |                                |                |
        version  trace ID (32 hex chars)         parent span ID   flags
                                                 (16 hex chars)   01 = sampled
```

### OpenTelemetry

**OpenTelemetry** (short: OTel) is an open standard and a set of libraries for creating traces, metrics and logs. It is not tied to one vendor: you instrument your code once and can send the data to many different backends.

| Part | Role |
|---|---|
| API and SDK | Libraries in your service that create spans and metrics |
| Auto-instrumentation | Ready-made hooks for HTTP, Express, `pg`, Kafka clients and more, with no code changes |
| OTLP | The protocol for sending the data out |
| Collector | A separate process that receives, filters and forwards the data |
| Backend | Where traces are stored and viewed, for example Jaeger or Grafana Tempo |

:::flow Where trace data flows
Your service | SDK creates spans
OTLP export | sent in batches
Collector | filters and forwards
Tracing backend | stores and shows traces
:::

```javascript
// tracing.js -- must load before the rest of the app:
//   node --import ./tracing.js server.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  getNodeAutoInstrumentations,
} from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'orders',
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  }),
  // Creates spans for HTTP, Express, pg and others automatically,
  // and adds the traceparent header to outgoing calls.
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

process.on('SIGTERM', () => sdk.shutdown());   // send the last spans
```

Auto-instrumentation covers the network edges. For an important business step, add your own span.

```javascript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('orders');

export function priceCart(cart) {
  return tracer.startActiveSpan('price-cart', async (span) => {
    try {
      span.setAttribute('cart.items', cart.items.length);
      return await calculateTotals(cart);
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();              // a span that is never ended is lost
    }
  });
}
```

Storing every trace of a busy system is expensive. **Sampling** means keeping only a share of them, for example one in ten, plus all traces with errors. The sampled flag travels in `traceparent`, so all services make the same decision for one request.

:::tip Connect the three pillars
Put the trace ID into every log line (the OpenTelemetry instrumentation for `pino` can do this for you). Then you can move from an alert on a metric, to an example trace, to the exact log lines of that request. This path is the real value of observability.
:::

## Alerts

Alert on **symptoms that users feel**, not on every internal cause. "The error rate of checkout is above 2 percent for 5 minutes" deserves to wake someone up. "CPU is at 85 percent" usually does not, because users may be perfectly fine.

A simple way to set targets: an **SLI** (service level indicator) is a measured number, such as the share of successful requests. An **SLO** (service level objective) is the target for it, such as "99.9 percent of checkout requests succeed over 30 days". The SLO tells the team when reliability work is more important than new features.

:::example Finding a slow checkout
1. An alert fires: p99 duration of `POST /v1/orders` went from 300 ms to 4 s.
2. The RED dashboard shows that the rate is normal and errors are low. Only duration is bad. So this is not a traffic spike.
3. You open a slow trace. The span `orders: pg SELECT coupons` takes 3.6 s.
4. The logs for that trace ID show the SQL text. `EXPLAIN ANALYZE` shows a `Seq Scan` on `coupons`.
5. A recent release added a filter on `coupons.code` without an index. You add it with `CREATE INDEX CONCURRENTLY`. The p99 returns to normal.

Metrics said that something was wrong. The trace said where. Logs and the query plan said why.
:::

:::interview How would you debug a slow request that passes through several microservices?
"I start from the metrics to see the scope: which endpoint, since when, and whether rate, errors or duration changed. Then I open a distributed trace of a slow request. The trace shows every span across services with its duration, so I can see which service or query takes the time. This works because every service passes on the trace context in the `traceparent` header, which OpenTelemetry instrumentation does automatically. With the trace ID I search the structured logs to read the details of that one request. Typical causes are a missing index, many small queries in a loop, a slow outside API, or retries. To make this possible, I set up correlation IDs, JSON logs, RED metrics with percentiles, and tracing before the incident, not during it."
:::

:::revise
- Logs record single events, metrics are numbers over time, traces follow one request across services.
- Write structured JSON logs with a correlation ID. `AsyncLocalStorage` carries the ID through async code.
- Never log secrets. Never use IDs or raw URLs as metric labels.
- Track rate, errors and duration for every service. Use percentiles such as p99, not the average.
- A trace is a tree of spans. Context travels in the `traceparent` header. OpenTelemetry is the vendor-neutral standard.
- Alert on what users feel, and link metrics, traces and logs through the trace ID.
:::

# Testing and deployment

*How to gain confidence in a change before release, and how to release it without users noticing.*

## Why it matters

A car factory tests each part alone, then tests the assembled engine, then drives a few finished cars on a track. Nobody tests only by driving the finished car, because finding a loose bolt that way is slow and expensive. And nobody sends a new model to all showrooms on the first day without a trial.

For a backend, the first half is the **testing strategy**: which kind of test catches which kind of bug. The second half is **deployment**: getting new code onto servers safely, and getting it back off when it misbehaves.

## Which test for which bug

| Kind | What it checks | Speed | How many |
|---|---|---|---|
| Unit test | One function or class, no network and no database | Milliseconds | Many |
| Integration test | Your code with a **real** database, Redis or Kafka | Seconds | A good number |
| Contract test | That two services agree on the shape of their API | Seconds | One set per pair of services |
| End-to-end test | A whole user flow through all deployed services | Minutes | Very few |

This shape, many fast tests at the bottom and few slow ones at the top, is called the **test pyramid**. End-to-end tests are valuable but slow and often **flaky** (they fail randomly, for example because of timing). Keep them for a handful of critical flows such as checkout.

## Unit tests

Pure business rules are the best target for unit tests. Remember the `Order` aggregate from the domain-driven design chapter. Node.js has a built-in test runner, so no extra library is needed.

```javascript
// order.test.js      run with:  node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './order.js';

test('total is the sum of quantity times price', () => {
  const order = new Order('A17', 'user-42');
  order.addLine({ sku: 'TSHIRT-M', quantity: 2, pricePaise: 49900 });
  order.addLine({ sku: 'CAP', quantity: 1, pricePaise: 19900 });
  assert.equal(order.totalPaise, 119700);
});

test('an empty order cannot be confirmed', () => {
  const order = new Order('A18', 'user-42');
  assert.throws(() => order.confirm(), /no items/);
});

test('a confirmed order cannot be changed', () => {
  const order = new Order('A19', 'user-42');
  order.addLine({ sku: 'CAP', quantity: 1, pricePaise: 19900 });
  order.confirm();
  assert.throws(
    () => order.addLine({ sku: 'CAP', quantity: 1, pricePaise: 19900 }),
    /closed/,
  );
});
```

## Integration tests with a real database

Much of a backend's logic lives in SQL: constraints, `ON CONFLICT`, locks, transactions. If you replace the database with a **mock** (a fake object that returns prepared answers), none of that is tested. The test passes and production fails.

So test against a real PostgreSQL. The **Testcontainers** library starts a throwaway database in Docker for the test run and removes it afterwards.

```javascript
// stock.integration.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container;
let pool;

before(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  pool = new pg.Pool({ connectionString: container.getConnectionUri() });
  // In a real project: run your migration files here instead.
  await pool.query(`
    CREATE TABLE stock (
      sku       text PRIMARY KEY,
      available int  NOT NULL CHECK (available >= 0)
    )`);
});

after(async () => {
  await pool.end();
  await container.stop();
});
```

```javascript
const reserveOne = (sku) => pool.query(
  `UPDATE stock SET available = available - 1
   WHERE sku = $1 AND available >= 1`, [sku]);

test('20 parallel buyers cannot oversell 5 items', async () => {
  await pool.query(`INSERT INTO stock VALUES ('CAP', 5)`);

  // Fire 20 reservations at the same time.
  const results = await Promise.all(
    Array.from({ length: 20 }, () => reserveOne('CAP')));

  const sold = results.filter((r) => r.rowCount === 1).length;
  assert.equal(sold, 5);                       // exactly 5 succeed

  const { rows } = await pool.query(
    `SELECT available FROM stock WHERE sku = 'CAP'`);
  assert.equal(rows[0].available, 0);          // never below zero
});
```

This test proves something a unit test never could: that the atomic `UPDATE` from the PostgreSQL chapter is safe under real concurrency. Write such tests for every place where you rely on a constraint, a lock or an idempotency key.

:::warn Mocking the thing you want to test
A test that mocks the database and then checks that "the query function was called" tests nothing useful. It keeps passing when the SQL is wrong, when the migration is missing, and when two requests race. Mock what you do not own and cannot run, such as an outside payment API. Use the real thing for what you do own.
:::

## Contract tests

The orders service calls `GET /v1/products/42` on the catalogue service and reads the field `pricePaise`. One day the catalogue team renames it to `price`. All catalogue tests pass, all orders tests pass (they use a fake catalogue), and production breaks.

A **contract test** catches this. In the consumer-driven style:

1. The **consumer** (orders) writes down what it needs: "when I call `GET /v1/products/42`, I expect status 200 and a body with a numeric `pricePaise`". This written expectation is the **contract**.
2. The contract is shared with the **provider** (catalogue).
3. The provider's build replays every consumer contract against the real provider code. If a change breaks a contract, the provider's build fails **before** the release.

```json
{
  "consumer": "orders",
  "provider": "catalogue",
  "interactions": [{
    "description": "get an existing product",
    "request": { "method": "GET", "path": "/v1/products/42" },
    "response": {
      "status": 200,
      "body": { "id": "42", "pricePaise": 49900 },
      "match": { "id": "string", "pricePaise": "integer" }
    }
  }]
}
```

This JSON is a simplified picture of a contract. Tools such as Pact define a full format, and generate the fake provider for the consumer's tests from the same file. Note that the contract lists only the fields the consumer really uses. The provider stays free to add or change everything else. For gRPC, the `.proto` file plays a similar role, and tools can check it for breaking changes automatically.

## Containers

A **container** packs your app together with its runtime and libraries into one **image**. The same image runs on a laptop, in the test pipeline and in production. "It works on my machine" stops being an argument.

```dockerfile
# ---- Stage 1: build (has the compiler and dev dependencies) ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build                  # TypeScript -> JavaScript in dist/

# ---- Stage 2: run (small, only what production needs) ----
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node                          # do not run as root
EXPOSE 3000
# Start node directly, so it receives the SIGTERM signal on shutdown.
CMD ["node", "dist/server.js"]
```

This is a **multi-stage build**. The first stage has the tools to compile. The final image copies only the result, so it is smaller and holds fewer things that could have security problems.

## Configuration and secrets

The same image must run in every environment. Everything that differs between environments, such as database URLs, feature switches and keys, comes from outside, usually as **environment variables**.

```javascript
// config.js: read and check all settings once, at startup
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const config = Object.freeze({
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  kafkaBrokers: required('KAFKA_BROKERS').split(','),
  logLevel: process.env.LOG_LEVEL ?? 'info',
});
```

If a setting is missing, the service crashes at startup with a clear message. That is much better than failing at 2 a.m. when the first request needs the setting.

A **secret** is configuration that must stay private: passwords, API keys, signing keys. Rules: never commit secrets to Git, never bake them into an image, never print them in logs. Store them in a secret manager (your cloud's secret service, HashiCorp Vault, or Kubernetes Secrets with encryption switched on) and let the platform hand them to the container at start. Plan how to **rotate** them, which means replacing them regularly without downtime.

## Health checks

The platform needs to know two different things about each instance.

| Check | Question | If it fails |
|---|---|---|
| **Liveness** | Is the process stuck beyond repair? | The platform restarts the container |
| **Readiness** | Can this instance take traffic right now? | It gets no traffic until it passes again |

```javascript
let shuttingDown = false;
export const beginShutdown = () => { shuttingDown = true; };

// Liveness: only "the process responds". No dependency checks here.
app.get('/livez', (req, res) => res.status(200).send('ok'));

// Readiness: can we really serve a request?
app.get('/readyz', async (req, res) => {
  if (shuttingDown) return res.status(503).send('shutting down');
  try {
    await pool.query('SELECT 1');             // is the database reachable?
    res.status(200).send('ready');
  } catch {
    res.status(503).send('database unreachable');
  }
});
```

:::warn Dependency checks in the liveness probe
If the liveness check asks the database and the database has a short problem, the platform restarts **all** your instances at once. Restarting does not fix the database, and now you also have a cold start storm. Liveness answers only "is this process alive?". Dependencies belong in readiness.
:::

```yaml
# Part of a Kubernetes Deployment
spec:
  replicas: 3
  template:
    spec:
      terminationGracePeriodSeconds: 30    # time between SIGTERM and kill
      containers:
        - name: orders
          image: registry.example.com/orders:1.8.2
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: orders-secrets       # becomes environment variables
          readinessProbe:
            httpGet: { path: /readyz, port: 3000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /livez, port: 3000 }
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { memory: 512Mi }
```

## Graceful shutdown

During every deployment and every scale-down, the platform stops old instances. It sends the signal `SIGTERM`, waits for a grace period, and then kills the process with `SIGKILL`. If your process simply exits on `SIGTERM`, the requests it was handling are cut off, and users see errors on every release.

A **graceful shutdown** finishes the work in progress first.

:::flow Graceful shutdown
SIGTERM | platform asks us to stop
Not ready | readiness returns 503
Finish | running requests complete
Close | consumers, producer, database pool
Exit | process ends with code 0
:::

```javascript
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const relayAbort = new AbortController();    // runRelay(relayAbort.signal)

async function shutdown(signal) {
  if (shuttingDown) return;                  // handle the signal once
  log.info({ signal }, 'shutdown started');
  beginShutdown();                           // /readyz now answers 503

  // Safety net: never hang longer than the platform's grace period.
  setTimeout(() => process.exit(1), 25_000).unref();

  await sleep(5_000);        // let the load balancer stop sending traffic
  await new Promise((resolve) => server.close(resolve));  // finish requests
  relayAbort.abort();                        // stop the outbox relay loop
  await consumer.disconnect();               // stop taking Kafka messages
  await producer.disconnect();
  await pool.end();                          // close database connections
  log.info('shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C in development
```

The order matters: first stop **receiving** new work, then finish the current work, then close the connections that the work needed. The short sleep at the start covers the moment in which the load balancer still sends requests to an instance that has already been told to stop.

## Release strategies

| Strategy | How it works | Good | Watch out |
|---|---|---|---|
| Rolling update | Replace instances a few at a time | Simple, the default in Kubernetes | Old and new versions run together |
| Blue-green | Run the new version (green) beside the old (blue), then switch all traffic | Instant switch and instant rollback | Needs double capacity for a while |
| Canary | Send a small share of traffic (say 5 percent) to the new version, watch, then increase | Problems hit few users | Needs good metrics and traffic splitting |

The word "canary" comes from coal miners, who took a small bird into the mine to warn them early of bad air.

In all three strategies, old and new code run side by side for some time. That has two consequences you already know. Database changes must follow **expand and contract** from the PostgreSQL chapter. And API and event changes must be **backward compatible**: add fields, do not rename or remove them.

:::tip Separate deploy from release
A **feature flag** is a switch in configuration that turns a feature on or off without a new deployment. You can deploy the code switched off, turn it on for staff, then for 5 percent of users, and turn it off in seconds if something looks wrong. Deploying code and releasing a feature become two separate, calmer steps.
:::

:::example A safe release, start to end
1. A developer opens a pull request. Unit, integration and contract tests run automatically.
2. After merge, the pipeline builds one image, tagged with the version `1.8.3`.
3. The migration step adds a new nullable column (expand). Old code is not affected.
4. A canary starts: 5 percent of traffic goes to `1.8.3`. Dashboards compare its error rate and p99 with the old version for ten minutes.
5. The numbers look the same, so the rollout continues instance by instance. Each old pod receives `SIGTERM`, turns unready, finishes its requests and exits.
6. A week later, when no running code reads the old column, a second migration drops it (contract).

If step 4 had shown more errors, the canary would be removed, and 95 percent of users would never have seen the new version.
:::

:::interview What is the difference between a liveness and a readiness probe, and how do you shut a service down gracefully?
"Liveness asks whether the process is stuck and should be restarted. It must be cheap and must not check dependencies, or a database problem would restart every instance. Readiness asks whether this instance can serve traffic now. It can check the database, and when it fails the instance is taken out of load balancing without a restart. For graceful shutdown I handle `SIGTERM`: I mark the instance as not ready, wait briefly so the load balancer stops sending traffic, stop accepting new connections and let running requests finish, stop Kafka consumers and background loops, close the database pool and exit. I add a timer that forces the exit before the platform's grace period ends. This makes rolling deployments invisible to users."
:::

:::revise
- Test pyramid: many unit tests, a good number of integration tests, few end-to-end tests.
- Test SQL, constraints and locks against a real database. Mock only what you do not own.
- Contract tests catch breaking API changes between services before the release.
- One image for all environments. Configuration and secrets come from outside and are checked at startup.
- Liveness means "restart me". Readiness means "do not send me traffic". Dependencies belong only in readiness.
- On `SIGTERM`: turn unready, finish running requests, close connections, exit. Release with rolling, blue-green or canary.
:::

# Cheat sheet, interview questions and study plan

*The whole handbook on a few pages, the questions you should be able to answer, and a plan to learn by building.*

## Pick the pattern

Most backend design answers begin with naming the right pattern for the problem. Use this table as a map of the handbook.

| Problem | Pattern | Chapter |
|---|---|---|
| A retry creates a duplicate order | Idempotency key with a unique constraint | 3 |
| A list is slow on deep pages | Cursor (keyset) pagination | 3 |
| Fast, typed calls between services | gRPC with protobuf and deadlines | 4 |
| Clients need one entry point | API gateway, and a BFF per client type | 5 |
| A stolen refresh token | Rotation with reuse detection | 6 |
| Two requests sell the last item | Atomic `UPDATE` or `SELECT ... FOR UPDATE` | 7 |
| A query scans the whole table | The right index, checked with `EXPLAIN ANALYZE` | 8 |
| A schema change on a live table | Expand and contract, `CONCURRENTLY`, `NOT VALID` | 8 |
| The same slow read again and again | Cache-aside with TTL and delete-on-write | 9 |
| One client floods the API | Token bucket rate limiter in Redis | 9 |
| Save data and publish an event safely | Transactional outbox | 11 |
| The same event arrives twice | Idempotent consumer with a processed-events table | 11 |
| A message fails every time | Dead-letter topic with alerts and replay | 11 |
| One business operation across services | Saga with compensations | 12 |
| A dependency is slow or down | Timeout, retry with jitter, circuit breaker, bulkhead | 13 |
| "Where did the time go?" | Distributed tracing with a correlation ID | 14 |
| Releases cut off user requests | Readiness probe and graceful shutdown | 15 |

## Quick reference

### HTTP status codes

| Situation | Code |
|---|---|
| Created a resource | `201` with a `Location` header |
| Accepted for background work | `202` |
| Not logged in, or bad token | `401` |
| Logged in, but not allowed | `403` |
| Clashes with the current state | `409` |
| Stale `If-Match` version | `412` |
| Valid shape, breaks a business rule | `422` |
| Rate limited | `429` with `Retry-After` |
| Dependency down or overloaded | `503` |

### PostgreSQL

| Need | Tool |
|---|---|
| All-or-nothing changes | `BEGIN` ... `COMMIT` |
| Safe counter or stock change | `UPDATE ... SET x = x - 1 WHERE x >= 1` |
| Lock a row before deciding | `SELECT ... FOR UPDATE` |
| Many workers taking jobs | `FOR UPDATE SKIP LOCKED` |
| Detect a concurrent edit | Version column in the `WHERE` clause |
| A rule across several rows | Serializable isolation with retry on `40001` |
| Insert once only | Unique constraint with `ON CONFLICT DO NOTHING` |
| See why a query is slow | `EXPLAIN ANALYZE` |
| Index on a live table | `CREATE INDEX CONCURRENTLY` |

### Kafka

| Question | Answer |
|---|---|
| Where is order guaranteed? | Inside one partition only |
| What decides the partition? | The hash of the message key |
| How many consumers can share the work? | At most the number of partitions, per group |
| What is the default guarantee to design for? | At least once: duplicates are possible |
| What should you monitor first? | Consumer lag and the size of the dead-letter topic |

### Sync or async?

| Use a synchronous call (REST, gRPC) when | Use an event when |
|---|---|
| The caller needs the answer to continue | The caller only announces a fact |
| The user is waiting for this result | The work can finish a little later |
| There is exactly one receiver | Several services may be interested |
| Failure must be shown to the user now | The receiver may be down and catch up later |

## Design checklist for a new service

Before you call a service "production ready", walk through these questions.

- **Boundary:** Does it own a clear business capability and its own data?
- **API:** Are errors in one format? Are lists paginated with a hard limit? Is every `POST` that creates something safe to retry?
- **Data:** Are the important rules protected by constraints? Does every frequent query have an index? Is the pool size checked against `max_connections`?
- **Messaging:** Do events leave through an outbox? Is every consumer idempotent? Is there a dead-letter topic with an alert?
- **Failure:** Does every outgoing call have a timeout? Is there one clear retry layer? What does the user see when each dependency is down?
- **Security:** Is every request authenticated, and is ownership checked inside the service? Are secrets outside the code and the image?
- **Operations:** Are there JSON logs with a request ID, RED metrics and tracing? Are liveness, readiness and graceful shutdown in place? Can a release be rolled back in minutes?

:::warn The two questions that find most bugs
For every step in a design, ask: "What happens if this runs twice?" and "What happens if the process dies right after this line?". Duplicate delivery and partial failure are the daily reality of distributed systems. A design that has a clear answer to both questions at every step is almost always a good design.
:::

## Interview questions with model answers

Say each answer aloud in your own words before you read the model answer. A good answer has four parts: a one-line definition, how it works, a trade-off, and a short example.

:::interview What is the difference between a modular monolith and microservices?
Both have clear business modules with their own data. In a modular monolith the modules live in one deployable application and call each other through in-process interfaces, so calls are fast and one database transaction can cover several modules. In microservices each module is a separately deployed service with its own database, and they talk over the network. This gives independent deployment and scaling, and costs partial failures, eventual consistency and more operational work. I would start modular and extract a service only for a concrete team or scaling reason.
:::

:::interview Explain the isolation levels in PostgreSQL.
Read Committed is the default: every statement sees data committed before that statement began, so two reads in one transaction can differ, and read-modify-write code can lose updates. Repeatable Read gives the whole transaction one snapshot. In PostgreSQL it also prevents phantom reads, and a conflicting update fails with a serialization error instead of being lost. It still allows write skew. Serializable makes the result equal to some one-after-another order. It can cancel transactions with error `40001`, so the application must retry. PostgreSQL has no dirty reads at any level.
:::

:::interview Why can Kafka not give you exactly-once processing for a consumer that writes to a database?
Kafka's exactly-once features cover work inside Kafka: an idempotent producer, and transactions that combine reading, writing to other topics and committing offsets. A write to PostgreSQL or a call to an email API is outside that transaction. The consumer can crash after the database commit and before the offset commit, and the message is then delivered again. So I design for at-least-once delivery and make the consumer idempotent, for example by storing the event ID in a `processed_events` table in the same database transaction as the business change. The effect is exactly once, even though delivery is not.
:::

:::interview Choreography or orchestration for a saga?
In choreography, each service reacts to events and publishes its own. There is no central coordinator, coupling is low, and it suits short flows of two or three steps. With more steps, the flow becomes hard to see and to change. In orchestration, one service stores the saga state and sends commands to the participants. The flow, the timeouts and the compensations sit in one place, which makes longer flows easier to understand and monitor. The risk is that the orchestrator collects business logic that belongs in the participants. For an order flow with stock, payment and shipping, I would choose orchestration.
:::

:::interview How do you invalidate a cache correctly?
I use cache-aside with a TTL on every key. On a write, I update the database first and then delete the cache key. I do not write the new value into the cache, because two concurrent writers could leave the older value there. A reader can still put an old value back just after the delete, and the delete can fail, so the TTL is the safety net that limits how long stale data lives. For data that must be exact, such as a balance or stock for a purchase decision, I do not read from the cache at all. I add jitter to TTLs and use single flight to avoid a stampede on hot keys.
:::

:::interview Design the checkout of an online store. Walk through the failure cases.
The client sends `POST /v1/orders` with an idempotency key. The orders service saves the order as `PENDING`, the saga state and an outbox row in one transaction, and answers `202` or `201` with the order ID. A relay publishes the command to reserve stock. Inventory reserves with an atomic update and replies. Then payments charges, using the order ID as the idempotency key towards the provider. On success the order becomes `CONFIRMED`. If the payment fails, the orchestrator sends a compensation to release the stock and cancels the order. Failure cases: a client retry is absorbed by the idempotency key. A crash after the commit is covered by the outbox. Duplicate events are ignored by idempotent handlers and the saga state machine. A missing reply is found by a timeout job. A slow payment provider is contained by timeouts and a circuit breaker, and the user sees "payment pending" instead of an error.
:::

### More questions to practise

Try these without notes. Each one is answered inside the chapter named in brackets.

1. What is a bounded context, and why is "one service per table" a bad idea? (Chapter 2)
2. Why is cursor pagination faster than offset pagination on deep pages? (Chapter 3)
3. Why must protobuf field numbers never be reused? (Chapter 4)
4. What should an API gateway never contain? (Chapter 5)
5. Why is a JWT hard to revoke, and how do refresh tokens help? (Chapter 6)
6. What is write skew? Give an example. (Chapter 7)
7. Why can a harmless `ALTER TABLE` freeze a busy table? (Chapter 8)
8. Why is a Redis lock not enough to protect a payment? (Chapter 9)
9. What happens when a consumer group has more consumers than partitions? (Chapter 10)
10. What is the dual-write problem? (Chapter 11)
11. Why is a compensation not the same as a rollback? (Chapter 12)
12. What is a retry storm, and how do you prevent it? (Chapter 13)
13. Why should a metric label never contain a user ID? (Chapter 14)
14. Why must a liveness probe not check the database? (Chapter 15)

## A six-week study plan

Reading alone does not stay. Build one small system and grow it week by week. A good project is a tiny online store with three parts: orders, inventory and payments (with a fake payment provider that fails randomly).

| Week | Read | Build |
|---|---|---|
| 1 | Chapters 1 to 3 | A modular monolith with orders and inventory modules, a REST API with cursor pagination, Problem Details errors and idempotency keys |
| 2 | Chapters 7 and 8 | Stock reservation that survives a concurrency test. Read three query plans. Do one expand-and-contract migration |
| 3 | Chapters 4 to 6 | Move inventory into its own service behind gRPC. Add JWT access tokens and rotating refresh tokens |
| 4 | Chapters 9 and 10 | Cache product reads in Redis, add a token bucket limiter, run Kafka locally and publish order events |
| 5 | Chapters 11 and 12 | Add the outbox and its relay, an idempotent consumer, a dead-letter topic, and an orchestrated order saga with compensation |
| 6 | Chapters 13 to 15 | Add timeouts, retries and a circuit breaker. Add JSON logs, metrics and tracing. Add health checks, graceful shutdown and a Dockerfile |

For each week, break your own system on purpose. Kill a service in the middle of a saga. Send the same request twice. Stop Redis. Make the fake payment provider sleep for ten seconds. Then check that the system ends in a correct state. This is how the ideas in this handbook turn into skill.

:::tip Write down your decisions
Keep a short `DECISIONS.md` in the project: why this boundary, why this key for the Kafka topic, what happens when each dependency is down. In an interview, explaining these choices clearly is worth more than the code itself.
:::

:::revise
- Start with a modular monolith. Split along bounded contexts, and only for a concrete reason.
- Inside one service, trust PostgreSQL: transactions, constraints, row locks and the right indexes.
- Between services there are no transactions: use the outbox, idempotent consumers and sagas.
- Every network call can be slow, fail, or happen twice. Use timeouts, careful retries, breakers and idempotency keys.
- You cannot fix what you cannot see: structured logs, RED metrics and traces linked by one ID.
- Ask at every step: what if this runs twice, and what if the process dies right here?
:::
