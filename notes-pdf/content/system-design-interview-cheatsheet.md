---
title: High-Scale System Design & Architecture Cheatsheet
subtitle: The interview framework, the numbers, the formulas and five fully worked designs, in one handbook you can revise the night before.
category: System Design
level: Intermediate to Advanced
accent: indigo
tags: system-design, distributed-systems, caching, kafka, postgresql
highlights: 7-Step Interview Framework | Estimation with Worked Maths | Caching & Sharding | Quorum & Consistency | Kafka, Outbox & Sagas | 5 Worked Designs
tagline: Framework • Estimation • Caching • Sharding • Quorum • Queues • Worked Designs
description: A practical cheat sheet for system design interviews. It gives you a timed step-by-step framework, estimation formulas with every calculation shown, decision tables for caches, databases, queues and consistency, and five designs worked from requirements to trade-offs. All numbers in it are rough teaching values that you should state as assumptions, not facts about any real company.
---

# The interview framework

*Seven steps and a time budget, so that you always know what to say next.*

## Why you need a framework

Think of a tailor. A good tailor does not cut the cloth the moment you walk in. First they ask: shirt or kurta, which occasion, what budget. Then they take measurements. Only then they cut. If they cut first, the cloth is wasted.

A system design interview is the same. The question is short on purpose: "Design a chat app." The interviewer wants to see whether you ask, measure and then build. A **framework** is a fixed order of steps. It saves you from the two most common failures: drawing boxes too early, and running out of time before the interesting part.

## The seven steps

| # | Step | What you produce |
|---|---|---|
| 1 | Requirements | A short list of features and quality targets |
| 2 | Estimation | Requests per second, storage, bandwidth |
| 3 | API | 3 to 6 endpoints with inputs and outputs |
| 4 | Data model | Tables or collections, keys, main queries |
| 5 | High-level design | A diagram of boxes and arrows |
| 6 | Deep dives | 2 or 3 hard parts explained in detail |
| 7 | Trade-offs | What you chose, what you paid, what breaks first |

:::flow The order never changes
Requirements | what and how well
Estimation | how big
API | the contract
Data model | what we store
High-level design | boxes and arrows
Deep dives | the hard parts
Trade-offs | gains and costs
:::

## The time budget

Most interviews give you 45 minutes of real working time. Split it before you start. The numbers below are a guide, not a rule. If the interviewer pulls you somewhere, follow them.

| Step | 45-minute round | 60-minute round |
|---|---|---|
| Requirements | 5 min | 7 min |
| Estimation | 5 min | 6 min |
| API | 4 min | 5 min |
| Data model | 5 min | 7 min |
| High-level design | 10 min | 12 min |
| Deep dives | 12 min | 17 min |
| Trade-offs and wrap-up | 4 min | 6 min |

Check the sums: 5 + 5 + 4 + 5 + 10 + 12 + 4 = 45, and 7 + 6 + 5 + 7 + 12 + 17 + 6 = 60.

:::tip
Look at the clock at two points: after the data model (you should be near minute 19) and when the high-level diagram is complete (near minute 29). If you are late, cut the estimation detail, never the deep dives. Deep dives are where senior-level signal comes from.
:::

## Step 1: Requirements

There are two kinds of requirements.

- **Functional requirements** say what the system does. Example: "A user can send a message to another user."
- **Non-functional requirements** say how well it does it. Example: "A message is delivered in under one second, and no message is ever lost."

Ask questions until you can write three to five functional requirements and three or four non-functional ones. Then say clearly what is **out of scope** (what you will not design today).

| Ask about | Example question | Why it changes the design |
|---|---|---|
| Users and scale | How many daily active users? | Decides one server or hundreds |
| Read or write heavy | Do people read more than they write? | Cache and replicas, or queues and shards |
| Latency | How fast must a response be? | In-memory data, CDN, fewer hops |
| Consistency | Is slightly old data acceptable? | Strong or eventual consistency |
| Availability | What if a data center fails? | Replication, more regions |
| Durability | Can we ever lose data? | Synchronous writes, backups |

**Latency** is the time one request takes. **Availability** is the share of time the system answers correctly. **Durability** means data that was saved stays saved. **Consistency** means every reader sees the same, latest data.

## Step 2: Estimation

Turn the scale into three numbers: **QPS** (queries per second, which means requests per second), storage per year, and bandwidth. The next chapter shows the formulas. The goal is not a perfect number. The goal is to learn whether the system is read-heavy or write-heavy, and whether the data fits on one machine.

## Step 3: API

The **API** (application programming interface) is the contract between clients and your system. Write a few endpoints. Keep them boring and clear.

```text
POST /v1/messages
  body: { chat_id, client_msg_id, text }
  201:  { message_id, created_at }

GET /v1/chats/{chat_id}/messages?before=<message_id>&limit=50
  200:  { messages: [...], next_before: <message_id or null> }
```

Three habits make an API look professional:

1. Paginate every list. **Pagination** means returning results in small pages instead of all at once.
2. Add an **idempotency key** (a unique ID chosen by the client, here `client_msg_id`) to every write that must not happen twice.
3. Say who the caller is. The user ID comes from the login token, never from the request body.

## Step 4: Data model

List the main things you store (the **entities**), their keys, and the queries that hit them. Choose the database after the queries, not before.

```sql
-- One row per message. The main query is:
-- "latest 50 messages of one chat", so we index (chat_id, id).
CREATE TABLE messages (
    id          BIGINT PRIMARY KEY,       -- time-sorted unique ID
    chat_id     BIGINT NOT NULL,
    sender_id   BIGINT NOT NULL,
    body        TEXT   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_chat ON messages (chat_id, id DESC);
```

## Step 5: High-level design

Draw the path of one write and one read. Start with the simplest picture that works: client, load balancer, service, database. Then add a box only when a requirement or a number from step 2 forces you to.

:::flow A first diagram that fits almost any question
Client | web or mobile
Load balancer | spreads requests
App service | stateless
Cache | hot reads
Database | source of truth
:::

A **stateless** service keeps no user data in its own memory between requests. Any copy of the service can answer any request, so you can add more copies freely.

## Step 6: Deep dives

Pick the two or three parts that are hard for **this** system. Examples: "How do we stop two people booking the same seat?" or "How does a post reach ten million followers?" Offer a choice: "I can go deeper on the feed fan-out or on the storage layer. Which one is more useful?"

## Step 7: Trade-offs

A **trade-off** means you gain one thing and pay with another. For each big choice, say both sides. Then name the first thing that breaks if traffic grows ten times, and what you would do about it.

:::example The first five minutes for "Design a food delivery order tracker"
**You ask:** Who uses it? Customers watch the rider on a map. How many? Assume 2 million orders a day. How fresh must the location be? A few seconds old is fine. Do we design payments or search? No, out of scope.

**You write:**

- Functional: rider app sends location; customer sees rider position and order status; customer gets status notifications.
- Non-functional: location is at most 5 seconds old; status updates are never lost; the system stays available at dinner peak.
- Out of scope: payments, restaurant search, rider assignment.

**You say:** "Location is write-heavy and can be slightly stale, so I will keep it in memory. Order status is small but must be correct, so it goes to a SQL database." You have set up the whole interview in five minutes.
:::

## What interviewers usually listen for

| Signal | How you show it |
|---|---|
| Structure | You announce the step you are on |
| Numbers | You estimate and then use the result |
| Reasons | You say the requirement first, then the tool |
| Trade-offs | You say what each choice costs |
| Failure thinking | For every box you ask "what if it dies?" |

:::warn Drawing before asking
The most common mistake is to start with "we will use Kafka and Redis" in the first minute. You do not yet know what the system must do. Name a tool only after you have stated the requirement that needs it. A simple design with clear reasons scores higher than a complex one without reasons.
:::

:::interview You get a question you have never seen before, for example "Design a parking lot system for a mall". What do you do?
"I follow the same seven steps. First I ask what it must do: track free slots, issue tickets, take payment? How many slots and how many gates? Then I estimate. A mall has maybe a few thousand slots and a few cars per second at peak, so this is a small system and correctness matters more than scale. The hard part is that two gates must never give out the same last slot, so I will use one SQL database with a transaction for assigning a slot. I would spend my deep dive there, and on what happens when a gate loses its network." The point is that an unknown question is only a new input to a known process.
:::

:::revise
- Seven steps: requirements, estimation, API, data model, high-level design, deep dives, trade-offs.
- In 45 minutes: about 19 minutes for the first four steps, 10 for the diagram, 12 for deep dives, 4 to close.
- Functional requirements say what the system does; non-functional say how well.
- Say the requirement first, then the tool that solves it.
- Start with the simplest design and add a box only when a number forces you to.
- For every choice say the gain and the cost.
:::

# Back-of-the-envelope estimation

*Quick maths that tells you how big the system is, with every calculation shown.*

## Why estimate at all

Before a wedding, the caterer asks one question: how many guests? For 50 guests, one cook is enough. For 5,000 guests, you need many cooks, a bigger kitchen and trucks. Nobody needs the exact count. The rough size decides everything.

**Back-of-the-envelope estimation** means rough maths that could fit on the back of an envelope. In an interview it answers three questions: how many requests per second, how much storage, how much network traffic.

## Powers of two and ten

Computers count in powers of two. People count in powers of ten. For estimates we treat them as the same.

| Power of two | Exact value | Round to | Unit |
|---|---|---|---|
| 2^10 | 1,024 | 10^3 (thousand) | KB |
| 2^20 | 1,048,576 | 10^6 (million) | MB |
| 2^30 | 1,073,741,824 | 10^9 (billion) | GB |
| 2^40 | about 1.1 trillion | 10^12 (trillion) | TB |
| 2^50 | about 1.13 x 10^15 | 10^15 | PB |

Two more powers are worth knowing. A 32-bit number holds about 4.3 billion values (2^32 = 4,294,967,296). A 64-bit number holds about 1.8 x 10^19 values, which is more than enough for any ID.

**The multiplying trick.** Write numbers as powers of ten and add the exponents.

```text
1 million x 1 KB  = 10^6 x 10^3 = 10^9 bytes  = 1 GB
1 million x 1 MB  = 10^6 x 10^6 = 10^12 bytes = 1 TB
1 billion x 1 KB  = 10^9 x 10^3 = 10^12 bytes = 1 TB
1 billion x 100 B = 10^9 x 10^2 = 10^11 bytes = 100 GB
```

## Time numbers

| Period | Seconds | Round to |
|---|---|---|
| 1 day | 86,400 | 10^5 for quick maths |
| 30 days | 2,592,000 | 2.6 million |
| 1 year | 31,536,000 | 31.5 million |

Two shortcuts follow from this:

```text
1 million per day = 1,000,000 / 86,400     = 11.6  -> about 12 per second
1 billion per day = 1,000,000,000 / 86,400 = 11,574 -> about 11,600 per second
```

## The formulas

**DAU** means daily active users: the number of different people who use the app in one day.

```text
Average QPS  = DAU x actions per user per day / 86,400
Peak QPS     = Average QPS x peak factor        (assume 2 to 3)

Storage/day  = writes per day x size of one item
Storage      = Storage/day x 365 x years x number of copies

Bandwidth    = QPS x size of one request or response
               (bytes per second; multiply by 8 for bits per second)

Servers      = Peak QPS / QPS one server can handle  (+ spare capacity)
Cache memory = number of hot items x size of one item
```

**Bandwidth** is the amount of data that moves over the network each second. **Ingress** is data coming in (uploads). **Egress** is data going out (downloads).

## Typical sizes to assume

These are assumptions for teaching. Always say "I will assume" in the interview.

| Item | Assumed size |
|---|---|
| An ID, a number, a timestamp | 8 bytes |
| A short text message with its fields | 100 to 300 bytes |
| A user profile row | about 1 KB |
| A compressed phone photo | 200 KB to 2 MB |
| One minute of compressed video | a few MB to tens of MB |

## A fully worked example: a short-post app

**Assumptions**

- 30 million DAU.
- Each user writes 2 posts a day and opens the feed 10 times a day.
- A post row is 300 bytes. 20% of posts have one image of 200 KB.
- One feed page shows 20 posts.
- Keep data 5 years, with 3 copies of the database.

**Step 1: requests per second**

```text
Posts per day = 30,000,000 x 2  = 60,000,000
Write QPS     = 60,000,000 / 86,400 = 694   -> about 700 per second

Feed opens    = 30,000,000 x 10 = 300,000,000
Read QPS      = 300,000,000 / 86,400 = 3,472 -> about 3,500 per second
Peak read QPS = 3,500 x 3 = 10,500 per second

Read : write  = 3,500 : 700 = 5 : 1
```

**Step 2: storage**

```text
Text per day     = 60,000,000 x 300 bytes = 18,000,000,000 B = 18 GB
Text per year    = 18 GB x 365 = 6,570 GB  -> about 6.6 TB
Text in 5 years  = 6,570 GB x 5 = 32,850 GB -> about 33 TB
With 3 copies    = 33 TB x 3 = 99 TB        -> about 100 TB

Images per day   = 60,000,000 x 0.20 = 12,000,000 images
Image bytes/day  = 12,000,000 x 200 KB = 2,400,000,000 KB = 2.4 TB
Images per year  = 2.4 TB x 365 = 876 TB    -> about 0.9 PB
Images in 5 yrs  = 876 TB x 5 = 4,380 TB    -> about 4.4 PB
```

**Step 3: bandwidth**

```text
Upload (ingress) = 2.4 TB per day / 86,400 s
                 = 2,400,000 MB / 86,400 = 27.8 MB/s -> about 222 Mbps

Feed text out    = 3,500 QPS x 20 posts x 300 B
                 = 3,500 x 6,000 B = 21,000,000 B/s = 21 MB/s

Images out       = 20 posts x 20% = 4 images per feed page
                 = 4 x 200 KB = 800 KB per feed page
                 = 3,500 x 800 KB = 2,800,000 KB/s = 2.8 GB/s
                 = 2.8 x 8 = 22.4 Gbps
```

**Step 4: servers and cache**

```text
App servers = 10,500 peak QPS / 500 QPS per server (assumed) = 21
            + about 40% spare = 21 x 1.4 = 29.4 -> about 30 servers

Cache       = posts of the last day x 20% hot x 300 B
            = 60,000,000 x 0.2 x 300 B = 3,600,000,000 B = 3.6 GB
```

**What the numbers tell us**

- Text is small: 100 TB in five years. Images are huge: 4.4 PB. So images go to blob storage, not into the database.
- Image egress is about 22 Gbps. Our own servers should not carry that. A CDN must.
- 700 writes per second is modest. 10,500 peak reads per second needs caching.
- The hot cache is only 3.6 GB. It fits in the memory of one machine, plus a spare.

## Let code check your arithmetic

```python
SECONDS_PER_DAY = 86_400

def qps(per_day):
    return per_day / SECONDS_PER_DAY

def human(n_bytes):
    # print a byte count with a readable unit (1 KB = 1000 B here)
    for unit in ["B", "KB", "MB", "GB", "TB", "PB"]:
        if n_bytes < 1000:
            return f"{n_bytes:.1f} {unit}"
        n_bytes /= 1000
    return f"{n_bytes:.1f} EB"

posts = 30_000_000 * 2                    # posts per day
print(round(qps(posts)))                  # 694
print(round(qps(30_000_000 * 10)))        # 3472
print(human(posts * 300))                 # 18.0 GB
print(human(posts * 0.2 * 200_000))       # 2.4 TB
print(human(posts * 0.2 * 200_000 * 365)) # 876.0 TB
```

## Latency numbers to know

**Latency** is how long one operation takes. The values below are rough orders of magnitude. They change with hardware, network and load. Do not quote them as exact facts. What matters is how far apart the rows are.

| Operation | Rough order of magnitude |
|---|---|
| Read a value already in the CPU cache | around a nanosecond |
| Read from main memory (RAM) | around 100 nanoseconds |
| Random read from an SSD | tens to hundreds of microseconds |
| Network round trip inside one data center | under a millisecond |
| Get a key from an in-memory cache over the network | around a millisecond |
| Simple database query that uses an index | a few milliseconds |
| Seek on a spinning hard disk | around 10 milliseconds |
| Network round trip between continents | 100 milliseconds or more |

Units: 1 second = 1,000 milliseconds (ms) = 1,000,000 microseconds = 1,000,000,000 nanoseconds.

Three lessons from the table:

1. Memory is thousands of times faster than disk, so we cache hot data in memory.
2. Inside one data center a network call costs about as much as a cache lookup. Twenty calls in a row add up, so make calls in parallel or avoid them.
3. Distance costs time that no code can remove. Put data near users with a CDN or more regions.

:::example Build a latency budget
Target: the feed API answers in 200 ms for a user in the same country. Assumed costs: 40 ms network to the user and back, 1 ms load balancer, 2 ms cache lookup, 15 ms database query on a cache miss, 10 ms to build the response.

Cache hit: 40 + 1 + 2 + 10 = 53 ms. Cache miss: 40 + 1 + 2 + 15 + 10 = 68 ms. Both are far below 200 ms, so we have room for one more service call. If the design needed five database queries one after another (75 ms), we would run them in parallel or store the data together.
:::

:::warn Do not chase exact numbers
Candidates lose minutes multiplying 86,400 by hand and then never use the result. Round hard: 86,400 becomes 100,000, and 3,472 becomes 3,500. Then say one sentence about what the number means for the design. An estimate that does not change a decision is wasted time.
:::

:::interview How many servers do you need for 5 billion requests a day?
"Average QPS is 5 billion divided by 86,400, which is about 58,000 per second. With a peak factor of 2, that is about 116,000 per second. If I assume one server handles 2,000 requests per second for this kind of work, I need 116,000 / 2,000 = 58 servers. I would add about 30% spare for failures and deployments, so around 75. The per-server number is my assumption. In real life I would measure it with a load test, because it depends on how heavy each request is."
:::

:::revise
- 2^10 is about a thousand, 2^20 a million, 2^30 a billion, 2^40 a trillion.
- One day has 86,400 seconds; 1 million per day is about 12 per second.
- QPS = DAU x actions per day / 86,400; peak is 2 to 3 times the average.
- Storage = writes per day x item size x 365 x years x copies.
- Bandwidth = QPS x payload size; multiply bytes by 8 to get bits.
- Latency numbers are rough: memory is far faster than disk, and distance costs the most.
:::

# Load balancing, CDN and blob storage

*How requests are shared across servers, and how big files are kept away from them.*

## Why it matters

Think of a big railway station with ten ticket counters. If everyone joins counter 1, the line is very long while other counters sit empty. So a staff member stands at the entrance and points each person to a counter. If a counter closes, they stop sending people there.

A **load balancer** (LB) is that staff member. It sits in front of your servers, receives every request and forwards it to one healthy server. It gives you two things: more capacity (many servers share the work) and higher availability (a dead server gets no traffic).

## Layer 4 and layer 7

Networks are described in layers. **Layer 4** is the transport layer (TCP and UDP: addresses and ports). **Layer 7** is the application layer (HTTP: URLs, headers, cookies).

| | Layer 4 load balancer | Layer 7 load balancer |
|---|---|---|
| Looks at | IP address and port | URL, headers, cookies |
| Speed | Very fast, little work | Slower, reads the request |
| Routing by path | No | Yes, for example `/api` and `/images` |
| Ends TLS (HTTPS) | Usually no | Yes |
| Typical use | Raw TCP, very high volume | Web and API traffic |

**TLS termination** means the load balancer decrypts HTTPS, so the servers behind it do less work.

## Balancing algorithms

| Algorithm | How it picks | Good when |
|---|---|---|
| Round robin | Next server in the list | Servers and requests are similar |
| Weighted round robin | Bigger servers get more turns | Servers differ in size |
| Least connections | Server with fewest open requests | Requests differ a lot in duration |
| Two random choices | Pick 2 at random, use the less busy | Many balancers, cheap and fair |
| Hash of a key | Same key goes to the same server | Caches, sticky data |

```python
import random

class LoadBalancer:
    def __init__(self, servers):
        self.servers = list(servers)
        self.active = {s: 0 for s in servers}   # open requests per server
        self.healthy = set(servers)
        self.turn = 0

    def pool(self):
        return [s for s in self.servers if s in self.healthy]

    def round_robin(self):
        pool = self.pool()
        server = pool[self.turn % len(pool)]    # walk around the list
        self.turn += 1
        return server

    def least_connections(self):
        return min(self.pool(), key=lambda s: self.active[s])

    def two_choices(self):
        a, b = random.sample(self.pool(), 2)    # look at only two servers
        return a if self.active[a] <= self.active[b] else b
```

:::example Dry run of least connections
Three servers with open requests: `A = 4`, `B = 1`, `C = 3`.

| Request | Open requests before | Picked | Open requests after |
|---|---|---|---|
| 1 | A 4, B 1, C 3 | B | A 4, B 2, C 3 |
| 2 | A 4, B 2, C 3 | B | A 4, B 3, C 3 |
| 3 | A 4, B 3, C 3 | B (first of the tie) | A 4, B 4, C 3 |
| 4 | A 4, B 4, C 3 | C | A 4, B 4, C 4 |

The busy server A gets nothing until the others catch up. Round robin would have sent request 1 to A and made it worse.
:::

## Health checks

A **health check** is a small request that the load balancer sends to each server every few seconds, for example `GET /healthz`. If a server fails a few checks in a row, it is removed from the pool. When it passes again, it is added back.

:::tip
Keep the health endpoint light. It should confirm that the process is alive and can accept work. If it also checks the database and the database has a short hiccup, every server fails the check at once and the load balancer has nowhere to send traffic.
:::

## Sticky sessions and stateless servers

A **sticky session** means the load balancer always sends one user to the same server, because that server holds the user's session in memory. It works, but it is fragile: if that server dies, the user is logged out, and you cannot spread load evenly.

The better way is to make servers stateless. Keep the session in a shared store (such as Redis) or in a signed token that the client sends with every request. Then any server can serve any user.

## Who balances the load balancer?

If you have one load balancer, it is a **single point of failure** (one part whose failure stops everything). Run at least two. A common setup is **active-passive**: one handles traffic, and the second takes over its address if the first stops answering. At very large scale, DNS returns several load balancer addresses.

:::flow Request path with redundancy
Client | looks up DNS
LB pair | active and standby
App servers | stateless, many
Data layer | cache and database
:::

## CDN: files close to the user

An online shop that ships every parcel from one city is slow for far-away buyers. So it keeps popular items in a warehouse in each region. A **CDN** (content delivery network) does this for files. It has servers in many cities, called **edge servers**. A user downloads images, video, CSS and JavaScript from the nearest edge instead of from your servers. Your own servers are called the **origin**.

| | Pull CDN | Push CDN |
|---|---|---|
| How files arrive | Edge fetches from origin on first request | You upload files to the CDN yourself |
| First request | Slow (a miss) | Fast |
| Effort | Low | Higher |
| Good for | Most websites | Large files released on a schedule |

The origin tells the CDN how long to keep a file with a response header. **TTL** (time to live) is the time after which a cached copy expires.

```text
Cache-Control: public, max-age=31536000, immutable
  -> any cache may store it for one year; it will never change

File name: app.3f9a1c.js
  -> the hash in the name changes when the content changes
```

This is the cleanest way to update files: never change a file, publish a new name. Old copies simply stop being requested. Removing a file from all edges on demand is called a **purge**. It works, but it takes time to reach every edge.

## Blob storage: where big files live

A **blob** (binary large object) is a file such as a photo, a video or a PDF. Databases are built for small rows and queries, not for gigabyte files. So we split the job:

- The **bytes** go to an **object store** (blob storage). It stores each file under a key, keeps several copies, and is cheap per GB.
- The **metadata** (owner, size, type, key) goes to the database.

```sql
CREATE TABLE files (
    id          BIGINT PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    object_key  TEXT   NOT NULL UNIQUE,    -- path inside the object store
    size_bytes  BIGINT NOT NULL,
    mime_type   TEXT   NOT NULL,           -- for example image/jpeg
    status      TEXT   NOT NULL DEFAULT 'pending',  -- pending, ready
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Upload with a pre-signed URL

A **pre-signed URL** is a temporary link, signed by your server, that lets a client upload or download one specific object for a few minutes. The file bytes never pass through your app servers.

:::flow Direct upload
Client | asks to upload
App server | creates row, signs URL
Client | uploads to object store
Object store | sends "upload done" event
App server | marks file ready
:::

For large files, use **multipart upload**: the client cuts the file into parts (for example 8 MB each), uploads parts in parallel, and retries only the part that failed.

:::warn Sending uploads through the app servers
If a 1 GB video flows through your app server, that server holds a connection and memory for minutes. A few hundred uploads can freeze the whole API. Let clients upload straight to blob storage with pre-signed URLs, and serve downloads through the CDN.
:::

:::interview A user uploads a 2 GB video on a weak mobile network. How do you make it reliable?
"I would use a resumable multipart upload. The client asks my API to start an upload and gets an upload ID. It splits the file into parts of a few megabytes and uploads each part directly to object storage with pre-signed URLs, several in parallel. Each part has a checksum, so a damaged part is detected. If the network drops, the client asks which parts are already stored and sends only the missing ones. When all parts are in, the client calls 'complete', the store joins the parts, and an event tells my service to mark the file ready and start processing. Parts of uploads that were never completed are deleted by a cleanup rule after a few days."
:::

:::revise
- A load balancer spreads requests and removes unhealthy servers using health checks.
- Layer 4 routes by address and port; layer 7 reads HTTP and can route by path.
- Least connections suits uneven requests; hashing a key keeps the same key on the same server.
- Stateless servers beat sticky sessions; keep sessions in a shared store or a token.
- A CDN serves files from an edge near the user; use versioned file names and long TTLs.
- Store file bytes in blob storage, metadata in the database, and upload with pre-signed URLs.
:::

# Caching

*Keep the answer close so you do not compute it again: patterns, eviction, invalidation and Redis Cluster basics.*

## Why it matters

A chai stall owner does not make each cup from zero. In the morning they boil a big kettle. Each customer gets a cup in seconds. When the kettle is empty, they make more. The kettle is a cache.

A **cache** is a small, fast store that keeps copies of data that is slow to get. It is usually in memory. The slow place (usually the database) is the **source of truth**: if the two disagree, the database is right.

Two words you need: a **hit** means the data was in the cache. A **miss** means it was not, so we had to go to the database.

## Is it worth it? The hit-ratio formula

```text
Average latency = hit ratio  x cache time
                + miss ratio x (cache time + database time)

Example: hit ratio 95%, cache 1 ms, database 20 ms
  = 0.95 x 1 + 0.05 x (1 + 20)
  = 0.95 + 1.05
  = 2.0 ms          (without a cache: 20 ms)

Database load: only 5% of reads reach it. 10,000 reads per second
become 500 per second at the database.
```

## Pattern 1: cache-aside

In **cache-aside** (also called lazy loading) the application talks to both the cache and the database. It is the default choice.

:::flow Cache-aside read
App | asks the cache
Cache miss | nothing found
Database | app reads the row
Cache | app stores a copy with TTL
App | returns the data
:::

```python
import json

def get_product(product_id, cache, db, ttl=300):
    key = f"product:{product_id}"
    cached = cache.get(key)
    if cached is not None:                  # hit: no database work
        return json.loads(cached)
    row = db.find_product(product_id)       # miss: go to the database
    if row is None:
        # remember "does not exist" for a short time (negative caching)
        cache.set(key, json.dumps(None), ex=30)
        return None
    cache.set(key, json.dumps(row), ex=ttl) # keep it for 5 minutes
    return row

def update_price(product_id, price, cache, db):
    db.update_price(product_id, price)      # 1. database first
    cache.delete(f"product:{product_id}")   # 2. then remove the old copy
```

`cache` here is any client with `get`, `set` and `delete`, such as a Redis client. `ex` is the TTL in seconds.

## Pattern 2: write-through

In **write-through** every write goes to the cache and the database together, before the user gets a reply. The cache is always fresh, so reads after a write are fast and correct. The cost: every write is slower, and you cache data that nobody may read.

## Pattern 3: write-behind

In **write-behind** (also called write-back) the write goes to the cache only, and the user gets a reply at once. A background worker saves the changes to the database later, often in batches. Writes are very fast. The risk: if the cache machine dies before the save, those writes are lost.

| Pattern | Read path | Write path | Main risk |
|---|---|---|---|
| Cache-aside | App fills cache on a miss | Database, then delete key | First read is slow; short stale window |
| Write-through | Always from cache | Cache and database together | Slower writes |
| Write-behind | Always from cache | Cache now, database later | Data loss if the cache dies |

:::tip
Say this in interviews: "Cache-aside for most read-heavy data. Write-through when a read must see the write at once. Write-behind only for data I can afford to lose, such as view counters."
:::

## Eviction: what to remove when memory is full

**Eviction** means removing items to make room. The rule that decides which item goes is the **eviction policy**.

| Policy | Removes | Good for |
|---|---|---|
| LRU (least recently used) | The item not touched for the longest time | General use, the usual default |
| LFU (least frequently used) | The item used the fewest times | A stable set of popular items |
| FIFO (first in, first out) | The oldest item | Simple cases |
| TTL only | Items whose time ran out | Data with a natural lifetime |

An LRU cache needs two operations in `O(1)`: find a key, and move it to the "most recent" end. Python's `OrderedDict` gives both.

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()          # oldest first, newest last

    def get(self, key):
        if key not in self.items:
            return None
        self.items.move_to_end(key)         # mark as recently used
        return self.items[key]

    def put(self, key, value):
        if key in self.items:
            self.items.move_to_end(key)
        self.items[key] = value
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)  # evict the least recent
```

:::example Dry run of LRUCache with capacity 2
| Call | Items after (oldest to newest) | Returns |
|---|---|---|
| `put("a", 1)` | a | |
| `put("b", 2)` | a, b | |
| `get("a")` | b, a | 1 |
| `put("c", 3)` | a, c | (b is evicted) |
| `get("b")` | a, c | None |

`get("a")` made `a` the newest, so `b` became the oldest and was removed.
:::

## Invalidation: keeping the cache correct

**Invalidation** means removing or updating a cached copy when the real data changes. There are three tools.

1. **TTL.** Every key expires after some time. This limits how long any mistake can live. Always set one.
2. **Delete on write.** After updating the database, delete the key. The next read loads fresh data.
3. **Events.** The database change is published as an event, and a small worker deletes or updates the keys. This helps when many services cache the same data.

:::warn Update the database first, then delete the key
If you delete the cache first, another request can read the old row from the database and put it back in the cache before your write finishes. Now the cache is stale until the TTL ends. Write to the database first, then delete. Also prefer **delete** over **update** of the cache: two writers racing to update can leave the older value in the cache.
:::

## Stampede protection

A **cache stampede** happens when a popular key expires and thousands of requests miss at the same moment. All of them run the same heavy query, and the database falls over.

| Defence | Idea |
|---|---|
| Lock (single flight) | Only one request rebuilds the key; the others wait |
| TTL jitter | Add a random extra time so keys do not expire together |
| Stale-while-revalidate | Serve the old value while one worker refreshes it |
| Early refresh | Refresh hot keys a little before they expire |

```python
import json, random, time

def get_with_lock(key, load, cache, ttl=300):
    for _ in range(50):                        # wait at most ~2.5 seconds
        cached = cache.get(key)
        if cached is not None:
            return json.loads(cached)
        # nx=True: set the lock only if nobody else holds it
        if cache.set(f"lock:{key}", "1", nx=True, ex=10):
            try:
                value = load()                 # only one caller hits the DB
                jitter = random.randint(0, ttl // 10)
                cache.set(key, json.dumps(value), ex=ttl + jitter)
                return value
            finally:
                cache.delete(f"lock:{key}")
        time.sleep(0.05)                       # others wait, then look again
    return load()                              # waited too long: load anyway
```

The lock has its own TTL of 10 seconds, so a crashed worker cannot block the key for ever.

Two related problems have their own names. **Cache penetration** is many requests for keys that do not exist, so every one reaches the database. Negative caching (shown in `get_product`) fixes it. A **hot key** is one key that gets a huge share of traffic. Keep a short-lived local copy of it inside each app server.

## Redis Cluster basics

One cache machine has limited memory. **Redis Cluster** is the built-in way to spread Redis data over many machines. The facts to remember:

- The key space is cut into **16,384 hash slots**. A key's slot is `CRC16(key) mod 16384`. CRC16 is a simple checksum function.
- Each **master** node owns a range of slots. With three masters, each owns about a third.
- Each master has one or more **replicas** (copies). If a master dies, a replica is promoted.
- A client that asks the wrong node gets a `MOVED` reply with the right node, and remembers it.
- A command that touches several keys works only if all keys are in the same slot.
- A **hash tag** forces keys into one slot: only the text inside `{ }` is hashed. So `{user:42}:cart` and `{user:42}:profile` always live together.

```python
from binascii import crc_hqx     # the CRC16 variant that Redis uses

def key_slot(key):
    start = key.find("{")
    if start != -1:
        end = key.find("}", start + 1)
        if end > start + 1:                 # some text between { and }
            key = key[start + 1:end]        # hash only the tag
    return crc_hqx(key.encode(), 0) % 16384

print(key_slot("foo"))                      # 12182
print(key_slot("{user:42}:cart") == key_slot("{user:42}:profile"))  # True
```

:::note
Replication in Redis Cluster is asynchronous: the master replies to the client before the replica has the write. If the master dies at that moment, a write that was confirmed can be lost. Treat a cache as data you can rebuild, not as the only copy of something important.
:::

:::interview Your cache hit ratio dropped from 95% to 60% after a release. How do you investigate?
"First I check what changed in the release. Common causes are: a new key format, so old keys are never read; a new field in the key, such as a timestamp or a random ID, that makes every key unique; or a shorter TTL. Next I look at cache memory and the eviction count. If evictions jumped, the data no longer fits, maybe because values got bigger. I also check whether one endpoint has most of the misses. While I investigate, I watch database load, because at 60% the database gets 8 times more reads than at 95%: misses went from 5% to 40%. If the database is in danger I roll back first and investigate after."
:::

:::revise
- Average latency = hit ratio x cache time + miss ratio x (cache time + database time).
- Cache-aside is the default: read cache, on a miss read the database and fill the cache.
- On a write: update the database first, then delete the key, and always keep a TTL.
- Write-through keeps the cache fresh; write-behind is fastest but can lose data.
- Stop stampedes with a lock, TTL jitter or serving stale data during refresh.
- Redis Cluster: 16,384 slots, slot = CRC16(key) mod 16384, hash tags keep keys together.
:::

# Choosing a database, indexes and search

*A decision table for SQL against NoSQL, how indexes make queries fast, and when you need a search engine.*

## Why it matters

You choose a vehicle by the trip. A scooter for the market, a car for the family, a truck for moving house. None of them is "the best vehicle". Databases are the same. The right one depends on the shape of your data and on the questions you will ask it.

Interviewers do not want to hear a brand name. They want to hear the reason: "I need transactions across two tables, so I pick a relational database."

## The two families

A **SQL** (relational) database stores rows in tables with fixed columns. Tables are linked by keys, and one query can combine them with a **join**. It supports **transactions**: a group of changes that either all happen or none happen. PostgreSQL and MySQL are examples.

Transactions give four promises, known as **ACID**:

| Letter | Promise | Plain meaning |
|---|---|---|
| A, atomicity | All or nothing | Money never leaves one account without reaching the other |
| C, consistency | Rules always hold | A balance can never break a constraint you declared |
| I, isolation | No interference | Two transactions at the same time do not corrupt each other |
| D, durability | Saved means saved | After "committed", a crash does not lose the data |

A **NoSQL** database is any database that drops the table-and-join model to gain something else, usually easy scaling over many machines or a flexible data shape. There are four common kinds.

| Kind | Data looks like | Strong at | Example products |
|---|---|---|---|
| Key-value | key and value | Very fast lookups by key | Redis, DynamoDB |
| Document | JSON-like documents | Flexible, nested records | MongoDB |
| Wide-column | rows grouped by a partition key | Huge write volume, time-ordered data | Cassandra, HBase |
| Graph | nodes and edges | Relationship queries | Neo4j |

## The decision table

| Question | Leans SQL | Leans NoSQL |
|---|---|---|
| Do changes span several records and need all-or-nothing? | Yes | No |
| Will you ask many different questions of the data? | Yes, joins and ad-hoc queries | No, a few known lookups |
| Does the shape of a record change often? | No, stable columns | Yes, flexible fields |
| Does the data fit on one strong machine plus replicas? | Yes | No, far too large |
| Is the write volume extreme (tens of thousands per second)? | Not usually | Yes |

A practical rule: **start with SQL**. Move one part of the data to NoSQL when you can name the exact limit you are hitting.

| Data | Reasonable choice | Reason |
|---|---|---|
| Orders, payments, bookings | SQL | Transactions and constraints |
| User profiles and settings | SQL or document | Small, read by ID |
| Chat messages, activity logs, sensor data | Wide-column | Endless appends, read by one key and time |
| Sessions, counters, rate limits | Key-value in memory | Tiny, very frequent |
| Product catalogue with varied attributes | Document | Each category has different fields |
| Friends-of-friends, recommendations | Graph | Many-hop relationship queries |

:::warn "NoSQL scales, SQL does not"
This sentence is a red flag in interviews. A single SQL server with a good schema, indexes, a cache and read replicas handles a very large amount of traffic, and SQL databases can be sharded too. The honest statement is: NoSQL stores make horizontal scaling easier because they give up joins and cross-record transactions. If you still need those features, you will have to rebuild them in your application.
:::

## Indexes

To find "photosynthesis" in a textbook, you do not read every page. You open the index at the back, find the word, and jump to the page. A database **index** is the same: a separate, sorted structure that points to the rows.

Without an index, the database checks every row. This is a **full table scan**, and its cost grows with the table. With a **B-tree** index (a balanced tree kept in sorted order), finding a row takes only a few steps even in a table with hundreds of millions of rows.

```sql
-- Query we need: "latest orders of one user".
SELECT id, total, status
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;

-- A composite index: sorted by user_id, then by created_at.
CREATE INDEX idx_orders_user_time
    ON orders (user_id, created_at DESC);

-- Ask PostgreSQL how it runs the query.
EXPLAIN ANALYZE
SELECT id, total, status FROM orders
WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
```

In the output of `EXPLAIN ANALYZE`, "Seq Scan" means the whole table was read. "Index Scan" means the index was used.

### The leftmost rule

A **composite index** covers several columns in a fixed order. It is sorted by the first column, then the second inside each first value, like a phone book sorted by surname and then by first name. You cannot use a phone book to find everyone whose first name is "Asha".

:::example Which queries can use the index (user_id, created_at)?
| Query filter | Uses the index? | Why |
|---|---|---|
| `user_id = 42` | Yes | Leftmost column |
| `user_id = 42 AND created_at > '2026-01-01'` | Yes | Both columns, in order |
| `created_at > '2026-01-01'` | No | Skips the leftmost column |
| `user_id = 42 ORDER BY created_at DESC` | Yes | Rows are already in that order |
| `status = 'paid'` | No | Column is not in the index |
:::

### What an index costs

- Every insert, update and delete must also change each index. More indexes mean slower writes.
- Indexes use disk and memory.

A **covering index** contains every column the query needs, so the database never touches the table. In PostgreSQL you can add extra columns with `INCLUDE`:

```sql
CREATE INDEX idx_orders_cover
    ON orders (user_id, created_at DESC) INCLUDE (total, status);
```

### Pagination that stays fast

`OFFSET 100000 LIMIT 20` makes the database walk over 100,000 rows and throw them away. **Keyset pagination** (also called cursor pagination) remembers the last row seen and continues after it.

```sql
-- First page
SELECT id, total, created_at FROM orders
WHERE user_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page: continue after the last row of the previous page
SELECT id, total, created_at FROM orders
WHERE user_id = 42
  AND (created_at, id) < ('2026-03-01 10:15:00+05:30', 88123)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The `id` is part of the comparison so that two rows with the same time are never skipped or repeated.

:::note
B-tree engines change data in place and are strong for reads. Many NoSQL stores use an **LSM tree** (log-structured merge tree) instead: writes are appended to memory and flushed to sorted files that are merged later. That makes writes very cheap and reads a little more work. This is one reason wide-column stores are chosen for write-heavy data.
:::

## Normalize or denormalize

**Normalization** means storing each fact once and joining tables when reading. Writes are simple and data cannot disagree with itself. **Denormalization** means copying data into the place where it is read, to avoid joins. Reads are faster, but every copy must be updated on a write.

Rule for interviews: normalize the source of truth, and denormalize into caches and read-only views that can be rebuilt.

## Search

A B-tree index finds rows where a column equals or starts with a value. It cannot answer "which products mention *wireless* and *headphones* anywhere in the description?" For that you need an **inverted index**: a map from each word to the list of documents that contain it. The index at the back of a book is an inverted index.

```python
from collections import defaultdict

def tokenize(text):
    return [w.strip(".,!?").lower() for w in text.split()]

class SearchIndex:
    def __init__(self):
        self.postings = defaultdict(set)    # word -> set of document IDs

    def add(self, doc_id, text):
        for word in tokenize(text):
            if word:
                self.postings[word].add(doc_id)

    def search(self, query):
        words = tokenize(query)
        if not words:
            return set()
        result = set(self.postings.get(words[0], set()))
        for w in words[1:]:
            result &= self.postings.get(w, set())   # must contain all
        return result

idx = SearchIndex()
idx.add(1, "Cheap flights to Delhi")
idx.add(2, "Delhi street food guide")
idx.add(3, "Cheap street food in Mumbai")
print(idx.search("street food"))        # {2, 3}
print(idx.search("cheap delhi"))        # {1}
```

A real search engine adds three things: **stemming** (so "running" matches "run"), **ranking** (the best match first), and **sharding** of the index over many machines.

| Need | Reasonable choice |
|---|---|
| Search inside one modest table | Full-text search built into PostgreSQL |
| Typo tolerance, ranking, filters, large data | A search engine such as Elasticsearch or OpenSearch |
| Suggestions while typing | A prefix structure or the engine's suggester |

The search index is a **copy** of the data, not the source of truth. Keep it updated by reading the stream of changes from the database. This technique is called **CDC** (change data capture).

:::flow Keeping search in sync
App | writes a product
Database | source of truth
Change stream | CDC events
Indexer | builds documents
Search engine | answers queries
:::

The copy is a little behind. A product saved now may appear in search a second later. Say this aloud: search is **eventually consistent** with the database.

:::interview A query on a table with 200 million rows takes 8 seconds. How do you fix it?
"First I run `EXPLAIN ANALYZE` to see the plan. If it shows a sequential scan, the filter has no usable index, so I add a composite index that matches the `WHERE` columns first and the `ORDER BY` column next. If an index exists but is not used, I check for the usual reasons: the query skips the leftmost column, wraps the column in a function, or compares different types. Then I check how many rows are returned. If it selects a large share of the table, an index will not help and I need to change the query, add pagination, or pre-compute the result. I also replace deep `OFFSET` with keyset pagination. Only after that would I think about a read replica, a cache or partitioning the table by date."
:::

:::revise
- Start with SQL; move a part to NoSQL only when you can name the limit you hit.
- SQL gives joins and ACID transactions; NoSQL gives easier horizontal scaling and flexible shapes.
- A composite index works left to right: `(a, b)` helps filters on `a` or on `a` and `b`, not on `b` alone.
- Every index speeds reads and slows writes.
- Use keyset pagination instead of deep `OFFSET`.
- Search uses an inverted index kept in sync by CDC; it is an eventually consistent copy.
:::

# Replication, sharding and consistent hashing

*Copies for safety and reads, splits for size and writes, and a ring that keeps moves small.*

## Why it matters

A school keeps a copy of every mark sheet in a second office. If one office floods, the records survive. That is **replication**: the same data on several machines.

The same school has 600 students in class 10. One teacher cannot teach them all, so they are split into sections A to L. That is **sharding**: different data on different machines.

Replication answers "what if a machine dies?" and "how do I serve more reads?". Sharding answers "the data or the writes no longer fit on one machine".

## Replication

The most common setup is **leader-follower** (also called primary-replica). All writes go to one node, the **leader**. It sends every change to the **followers**, which serve reads.

:::flow Leader-follower replication
Client write | goes to the leader
Leader | saves, then ships the change
Followers | apply the change
Client reads | from any follower
:::

How long does the leader wait before it tells the client "saved"?

| Mode | Leader waits for | Gain | Cost |
|---|---|---|---|
| Synchronous | Follower to confirm | No loss if the leader dies | Slower writes; a slow follower blocks them |
| Asynchronous | Nobody | Fast writes | Newest writes can be lost on failover |
| Semi-synchronous | One follower out of several | A middle path | Slightly slower writes |

### Replication lag

With asynchronous replication, a follower is a little behind the leader. This delay is **replication lag**. The classic symptom: a user edits their profile, the page reloads from a follower, and the old name is shown.

| Problem | Fix |
|---|---|
| I do not see my own write | Read your own data from the leader for a short time after you write |
| Data goes backwards between page loads | Keep one user on the same follower |
| A follower is very far behind | Remove it from the read pool until it catches up |

### Failover and split brain

**Failover** means promoting a follower to leader when the leader dies. The steps are: detect the failure (missed heartbeats), choose the most up-to-date follower, point clients to it.

The danger is **split brain**: the old leader was only slow, not dead. Now two nodes accept writes and the data diverges. The defence is a rule that a leader must be confirmed by a **majority** of nodes, plus **fencing**: the old leader is blocked from writing once a new one is chosen.

### Other topologies

| Topology | Who accepts writes | Used when | Hard part |
|---|---|---|---|
| Single leader | One node | Most systems | Leader is a write bottleneck |
| Multi-leader | One leader per region | Writes from several regions | Two leaders change the same row |
| Leaderless | Any node | Always-on key-value data | Needs quorums and conflict repair |

## Sharding

A **shard** is one piece of the data, living on its own database server (which usually has its own replicas). The **shard key** is the column that decides which shard a row belongs to.

How many shards? A quick estimate: if the data is 100 TB and you want at most 2 TB per shard, you need 100 / 2 = 50 shards.

| Strategy | Rule | Strong point | Weak point |
|---|---|---|---|
| Range | Keys A to F on shard 1, G to M on shard 2 | Range queries are easy | Hot ranges, uneven sizes |
| Hash | `hash(key) mod N` | Even spread | Range queries hit every shard |
| Directory | A lookup table maps key to shard | Full control, easy moves | The table is one more system to keep alive |
| Geographic | By country or region | Data stays near users | Regions differ a lot in size |

### Picking a shard key

A good shard key has three properties:

1. **Many different values**, so data spreads out. `user_id` is good. `country` is poor.
2. **Even traffic.** No single value should take a large share of requests.
3. **It appears in most queries**, so a query goes to one shard, not to all.

What gets harder after sharding:

- **Cross-shard queries.** "Top 10 sellers overall" must ask every shard and merge. This is called **scatter-gather**.
- **Cross-shard transactions.** Moving money between users on two shards is no longer one local transaction.
- **Unique IDs.** Auto-increment per shard gives duplicates, so you need a global ID generator.
- **Rebalancing.** Adding shards means moving data while the system is live.

:::warn Sharding too early
Sharding is a one-way door. It takes away joins and simple transactions and adds operational work for ever. Before you shard, use the cheaper steps in order: indexes, caching, read replicas, a bigger machine, moving old data to an archive. In an interview say: "I would shard only when the write load or the data size is more than one leader can take."
:::

## The problem with hash mod N

`hash(key) mod N` spreads keys evenly. But see what happens when N changes.

:::example Going from 3 shards to 4
Take keys 0 to 11 and use the key itself as the hash.

```text
key    :  0  1  2  3  4  5  6  7  8  9 10 11
mod 3  :  0  1  2  0  1  2  0  1  2  0  1  2
mod 4  :  0  1  2  3  0  1  2  3  0  1  2  3
same?  :  y  y  y  -  -  -  -  -  -  -  -  -
```

Only keys 0, 1 and 2 stay on the same shard. 9 of 12 keys (75%) must move. For a cache this means almost every key misses at once. For a database it means copying most of the data.
:::

## Consistent hashing

**Consistent hashing** fixes this. Picture a round clock face. Both servers and keys are placed on the circle using the same hash function. A key belongs to the first server you meet when you walk clockwise from the key.

- Add a server: it takes over only the keys between itself and the previous server on the circle.
- Remove a server: only its keys move, to the next server.

With N servers, adding one moves about `1 / (N + 1)` of the keys instead of nearly all.

One server per point gives uneven slices. So each server is placed at many points, called **virtual nodes**. Many small slices average out to a fair share.

```python
import bisect, hashlib

def h(text):
    return int(hashlib.md5(text.encode()).hexdigest(), 16)

class HashRing:
    def __init__(self, nodes=(), vnodes=100):
        self.vnodes = vnodes
        self.points = []             # sorted positions on the ring
        self.owner = {}              # position -> node name
        for node in nodes:
            self.add(node)

    def add(self, node):
        for i in range(self.vnodes):         # many points per node
            p = h(f"{node}#{i}")
            bisect.insort(self.points, p)
            self.owner[p] = node

    def remove(self, node):
        for i in range(self.vnodes):
            p = h(f"{node}#{i}")
            self.points.remove(p)
            del self.owner[p]

    def get(self, key):
        # first point clockwise from the key; wrap around at the end
        i = bisect.bisect_right(self.points, h(key)) % len(self.points)
        return self.owner[self.points[i]]
```

Now measure how many keys move when a fifth node joins.

```python
keys = [f"user:{i}" for i in range(10_000)]

ring = HashRing(["db1", "db2", "db3", "db4"])
before = {k: ring.get(k) for k in keys}
ring.add("db5")
moved = sum(1 for k in keys if ring.get(k) != before[k])
print(moved / len(keys))          # 0.199 (ideal is 1/5 = 0.20)

# The same change with hash mod N
moved_mod = sum(1 for k in keys if h(k) % 4 != h(k) % 5)
print(moved_mod / len(keys))      # 0.796 (about 4/5 = 0.80)
```

Every key that moved on the ring moved **to** the new node. Nothing was shuffled between the old nodes.

:::tip
Where consistent hashing is used: spreading keys over cache servers, partitioning data in leaderless databases, and sending a user to the same chat or session server. To also replicate, store each key on the next 2 or 3 **different** servers clockwise.
:::

:::interview How would you choose a shard key for an orders table in a shopping app?
"I look at the queries first. The most common ones are 'orders of this customer' and 'this order by ID'. If I shard by `customer_id`, all orders of one customer are on one shard, so the main page needs a single shard and a customer's data can use a local transaction. Customer IDs have many values and no single customer dominates, so the spread is even. To find an order by ID alone, I can put the shard number inside the order ID, or keep a small lookup table. Sharding by `order_date` would be a mistake: all new writes would land on the newest shard and make it hot. Seller reports need all customers, so I would feed those from a separate analytics store instead of scatter-gather queries on the shards."
:::

:::revise
- Replication copies the same data for safety and reads; sharding splits data for size and writes.
- Asynchronous replication is fast but can lose the newest writes and shows stale reads.
- Fix "I cannot see my own write" by reading your own data from the leader for a short time.
- A good shard key has many values, even traffic, and appears in most queries.
- `hash mod N` moves almost every key when N changes; consistent hashing moves about `1/(N+1)`.
- Virtual nodes make the shares on the ring even.
:::

# CAP, PACELC, consistency and quorum

*What you must give up when machines cannot talk, and the R + W > N rule with worked numbers.*

## Why it matters

A bank has two branches that share one account book over a phone line. One day the line is cut. A customer walks into branch B and asks to withdraw 5,000 rupees. Branch B has two choices:

- **Refuse**, because it cannot check what happened at branch A. The data stays correct, but the customer is not served.
- **Pay**, and sort it out later. The customer is served, but the two books may disagree.

There is no third choice while the line is down. This is the heart of the CAP theorem.

## The CAP theorem

A **distributed system** is one that stores data on several machines connected by a network.

| Letter | Name | Meaning |
|---|---|---|
| C | Consistency | Every read sees the latest successful write |
| A | Availability | Every request to a working node gets a non-error answer |
| P | Partition tolerance | The system keeps working when the network between nodes breaks |

A **network partition** is a break that splits the nodes into groups that cannot reach each other. Partitions do happen, so P is not optional. The real statement of CAP is:

**When a partition happens, you must choose between consistency and availability.**

| Choice | During a partition | Suits |
|---|---|---|
| CP | The cut-off side refuses requests | Payments, bookings, stock, locks |
| AP | Every side keeps answering, data may differ for a while | Feeds, likes, carts, presence |

:::warn "Pick two out of three"
CAP is often taught as "pick any two of C, A, P". That is misleading. You cannot give up P, because you do not control the network. And when there is no partition, a system can be both consistent and available. CAP only describes the choice **during** a partition. Also, it is not one choice for a whole company: the same app can be CP for payments and AP for the news feed.
:::

## PACELC: the other half

CAP says nothing about normal days, when there is no partition. **PACELC** adds that part:

If there is a **P**artition, choose **A**vailability or **C**onsistency. **E**lse, choose **L**atency or **C**onsistency.

Even on a healthy network, staying strongly consistent costs time, because a write must reach several nodes before it is confirmed. So there is always a trade-off.

| Class | During a partition | On a normal day | Typical setup |
|---|---|---|---|
| PC/EC | Consistency | Consistency | Single leader with synchronous replication |
| PA/EL | Availability | Low latency | Leaderless store with small quorums |
| PA/EC | Availability | Consistency | Consistent normally, relaxes when cut off |
| PC/EL | Consistency | Low latency | Fast stale reads normally, strict when cut off |

Many databases let you move between these classes with settings, per query. So describe the setting you would choose, not only the product.

## Consistency models

"Consistent" is not one thing. It is a ladder. Higher steps are easier for programmers and cost more latency.

| Model | Promise | Example of use |
|---|---|---|
| Strong (linearizable) | Acts like one copy; a read always sees the latest write | Seat booking, account balance |
| Causal | Related events are seen in order (a reply never appears before its question) | Comment threads |
| Read-your-writes | You always see your own changes | Editing your profile |
| Monotonic reads | You never see data go backwards in time | Refreshing a timeline |
| Eventual | If writes stop, all copies become equal after some time | Like counts, view counts |

**Eventual consistency** does not mean "wrong". It means "right, a little later". Always say how much later is acceptable: a second, a minute.

## Quorum

In a leaderless system, a write is sent to several replicas and a read asks several replicas. A **quorum** is the minimum number of replicas that must answer for the operation to count as successful.

- `N` = number of replicas that hold each piece of data.
- `W` = replicas that must confirm a write.
- `R` = replicas that must answer a read.

**The rule:** if `R + W > N`, every read overlaps with the latest write in at least one replica. So the read can find the newest value.

Why? A write touched `W` replicas. A read asks `R` replicas. If `R + W` is more than `N`, the two groups cannot be completely separate. There are not enough replicas for that.

:::flow A quorum write with N = 3, W = 2
Client | sends write v8
Coordinator | forwards to 3 replicas
Replica A | ok
Replica B | ok
Replica C | slow, no reply yet
Client | success after 2 oks
:::

### Worked examples

| N, W, R | R + W > N ? | Write survives | Read survives | Character |
|---|---|---|---|---|
| 3, 2, 2 | 4 > 3, yes | 1 node down | 1 node down | Balanced, a common default |
| 3, 3, 1 | 4 > 3, yes | 0 nodes down | 2 nodes down | Fast reads, fragile writes |
| 3, 1, 3 | 4 > 3, yes | 2 nodes down | 0 nodes down | Fast writes, fragile reads |
| 3, 1, 1 | 2 > 3, no | 2 nodes down | 2 nodes down | Fastest, may read stale data |
| 5, 3, 3 | 6 > 5, yes | 2 nodes down | 2 nodes down | Balanced, more safety |

A write can lose `N - W` nodes and still succeed. A read can lose `N - R` nodes.

:::example Tracing N = 3, W = 2, R = 2
Replicas A, B, C all hold version 7 of a user's status, "busy".

1. A write of version 8, "free", reaches A and B. C is slow. Two confirmations are enough, so the client is told "saved". Now A = v8, B = v8, C = v7.
2. A read asks two replicas. The possible pairs are (A, B), (A, C) and (B, C). Every pair contains A or B, so every pair contains v8.
3. Say the read got B = v8 and C = v7. It returns the higher version, "free".
4. The coordinator notices that C is old and sends it v8. This fix during a read is called **read repair**.

With `W = 1, R = 1` the write might reach only A, and a read might ask only C. It would return the old value "busy".
:::

```python
def quorum(n, w, r):
    return {
        "overlap": r + w > n,          # each read meets the latest write
        "one_winner": w > n / 2,       # two rival writes cannot both win
        "write_can_lose": n - w,       # nodes that may be down for a write
        "read_can_lose": n - r,        # nodes that may be down for a read
    }

def read_latest(replies):
    # replies: (version, value) pairs from the R replicas that answered
    return max(replies, key=lambda reply: reply[0])

print(quorum(3, 2, 2)["overlap"])               # True
print(quorum(3, 1, 1)["overlap"])               # False
print(quorum(5, 3, 3)["write_can_lose"])        # 2
print(read_latest([(7, "busy"), (8, "free")]))  # (8, 'free')
```

### Majorities and odd numbers

For choosing a leader, systems use a **majority**: more than half of the nodes. Algorithms that do this safely are called **consensus algorithms** (Raft and Paxos are the well-known ones).

| Nodes | Majority | Failures tolerated |
|---|---|---|
| 3 | 2 | 1 |
| 4 | 3 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

Going from 3 to 4 nodes adds cost but no extra safety. That is why clusters use odd sizes.

:::note
`R + W > N` promises that a read **can see** the latest confirmed write. It is not the same as full strong consistency. Two clients can still write at the same moment, and the system needs a rule to pick the winner, such as version numbers or "last write wins" by timestamp. Last write wins quietly throws away one of the two writes, so do not use it for data like account balances.
:::

:::interview You run a key-value store with N = 3. Product wants both very fast reads and no stale reads. What do you set, and what is the cost?
"No stale reads means I need `R + W > N`. For the fastest reads I choose `R = 1`, which forces `W = 3`. Now a read asks one replica and is always fresh, but every write must reach all three replicas. So writes are as slow as the slowest replica, and if a single replica is down, writes fail completely. If the product cannot accept that, the balanced choice is `W = 2, R = 2`: reads ask two replicas, which is a little slower, but both reads and writes survive one failed node. I would present both and let the availability requirement decide."
:::

:::revise
- CAP: during a network partition you choose consistency (refuse) or availability (answer, maybe stale).
- PACELC adds: even without a partition you trade latency against consistency.
- Consistency is a ladder: strong, causal, read-your-writes, monotonic reads, eventual.
- Quorum rule: `R + W > N` makes every read overlap the latest write.
- Writes survive `N - W` failures, reads survive `N - R`.
- Use odd cluster sizes: 3 tolerates 1 failure, 5 tolerates 2.
:::

# Queues, streams and fan-out

*Kafka against RabbitMQ, delivery guarantees, idempotency keys, the outbox pattern and sagas.*

## Why it matters

In a busy restaurant the waiter does not stand in the kitchen until your food is cooked. The waiter clips the order slip to a rail and goes back to the tables. The cooks take slips from the rail when they are free. If twenty orders arrive together, the rail holds them. Nothing is lost and nobody is blocked.

A **message queue** is that rail. One service (the **producer**) puts a message on it. Another service (the **consumer**) takes it later. The software that holds the messages is the **broker**.

This gives you three things:

- **Decoupling.** The producer does not need the consumer to be up right now.
- **Buffering.** A spike of traffic waits in the queue instead of crashing the consumer.
- **Speed for the user.** Slow work (email, video processing) happens after the reply is sent.

The price: the work is **asynchronous**. It finishes later, so the user may not see the result at once.

## Queue or stream

There are two families of brokers. RabbitMQ is a well-known **queue**. Apache Kafka is a well-known **stream** (also called a log).

| | Queue (RabbitMQ style) | Stream (Kafka style) |
|---|---|---|
| Model | Broker pushes each message to one worker | Consumers read from an append-only log |
| After processing | Message is removed once acknowledged | Message stays until retention time ends |
| Replay old messages | Not the normal use | Yes, move the offset back |
| Order | Per queue; weaker with many workers | Strict inside one partition |
| Routing | Rich rules through exchanges | By topic and key |
| Typical use | Task queues, per-message retries | Event streams, many readers, high volume |

An **acknowledgement** (ack) is the consumer telling the broker "I finished this message".

### Kafka words in one minute

- A **topic** is a named stream of messages, such as `order-events`.
- A topic is split into **partitions**. Each partition is an ordered log. Order is promised only inside one partition.
- A message has a **key**. Messages with the same key go to the same partition. Use `order_id` as the key and all events of one order stay in order.
- An **offset** is the position of a message in its partition. A consumer remembers the offset it has reached.
- A **consumer group** is a set of consumers that share the work. Each partition is read by one consumer of the group. So the number of partitions is the limit of parallel work.
- **Retention** is how long messages are kept, for example 7 days, even after they were read.

```text
How many partitions?   (all numbers are assumptions)
  Peak load          = 50,000 messages per second
  One consumer does  = 5,000 messages per second
  Minimum partitions = 50,000 / 5,000 = 10
  Room to grow 2x    = 20 partitions
```

## Fan-out

**Fan-out** means one event is delivered to many receivers. "Order placed" may interest billing, the warehouse, notifications and analytics. With **publish-subscribe** (pub/sub), the producer publishes once and every subscribed service gets its own copy. The producer does not know who listens.

:::flow One event, many consumers
Order service | publishes order_placed
Topic | order-events
Billing group | makes the invoice
Stock group | reserves the items
Notify group | sends the message
:::

In Kafka, each service uses its own consumer group, and every group reads the full stream. In RabbitMQ, a fan-out exchange copies the message into one queue per service.

## Delivery guarantees

| Guarantee | Meaning | How it happens | Risk |
|---|---|---|---|
| At-most-once | 0 or 1 times | Ack before processing | Message lost if the worker crashes |
| At-least-once | 1 or more times | Ack after processing | Duplicates after a crash or timeout |
| Exactly-once | The effect happens once | At-least-once plus idempotent processing | More design work |

:::warn "Exactly-once delivery"
Do not promise that a message will be **delivered** exactly once over a network. The consumer can finish the work and crash before its ack arrives, and the broker will send the message again. What you can build is exactly-once **effect**: deliver at least once, and make the consumer safe against repeats. Some brokers offer transactions that give exactly-once inside the broker itself. The moment you call an outside system, such as a payment API or an email provider, you need idempotency again.
:::

## Idempotency keys

An operation is **idempotent** if doing it twice has the same result as doing it once. "Set status to paid" is idempotent. "Subtract 200 rupees" is not.

An **idempotency key** is a unique ID attached to a request or message. The receiver stores the key together with the change, in the same transaction. If the key shows up again, the receiver skips the work.

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE payments (idem_key TEXT PRIMARY KEY, "
           "user_id INT, amount INT)")
db.execute("CREATE TABLE wallet (user_id INT PRIMARY KEY, balance INT)")
db.execute("INSERT INTO wallet VALUES (1, 1000)")

def pay(idem_key, user_id, amount):
    try:
        with db:                               # one transaction
            db.execute("INSERT INTO payments VALUES (?, ?, ?)",
                       (idem_key, user_id, amount))
            db.execute("UPDATE wallet SET balance = balance - ? "
                       "WHERE user_id = ?", (amount, user_id))
        return "charged"
    except sqlite3.IntegrityError:             # the key was already used
        return "duplicate, ignored"

print(pay("order-77", 1, 200))    # charged
print(pay("order-77", 1, 200))    # duplicate, ignored
print(db.execute("SELECT balance FROM wallet").fetchone())   # (800,)
```

The primary key on `idem_key` does the real work. The second insert fails, the transaction is rolled back, and the wallet is not touched again.

## The outbox pattern

A service often has to do two things: save to its database **and** publish an event. Doing both directly is called a **dual write**, and it is unsafe.

| Order of steps | Crash in between | Result |
|---|---|---|
| Save to database, then publish | After the save | Order exists, but no event. Nobody ships it |
| Publish, then save | After the publish | Event exists, but no order. Others act on a ghost |

The **outbox pattern** removes the gap. The service writes the event into an `outbox` table **in the same database transaction** as the business data. A separate **relay** process reads the outbox and publishes to the broker.

```sql
CREATE TABLE outbox (
    id          UUID PRIMARY KEY,
    topic       TEXT NOT NULL,
    msg_key     TEXT NOT NULL,
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at     TIMESTAMPTZ                -- NULL means not published yet
);

BEGIN;
INSERT INTO orders (id, user_id, total, status)
VALUES (9001, 42, 1499, 'placed');

INSERT INTO outbox (id, topic, msg_key, payload)
VALUES (gen_random_uuid(), 'order-events', '9001',
        '{"type": "order_placed", "order_id": 9001}');
COMMIT;                                    -- both rows, or neither
```

```sql
-- The relay runs this in a loop inside a transaction.
SELECT id, topic, msg_key, payload
FROM outbox
WHERE sent_at IS NULL
ORDER BY created_at
LIMIT 100
FOR UPDATE SKIP LOCKED;                    -- lets several relays share work

-- After the broker confirms a message:
UPDATE outbox SET sent_at = now() WHERE id = $1;
```

:::flow Outbox pattern
Service | one transaction
Orders + outbox | saved together
Relay | reads unsent rows
Broker | receives the event
Consumers | dedupe by event ID
:::

If the relay crashes after publishing but before setting `sent_at`, it publishes the same event again. So the outbox gives at-least-once delivery, and consumers must be idempotent. The outbox row's `id` is a ready-made idempotency key.

## Sagas

One database transaction cannot cover three services with three databases. A **saga** is a chain of local transactions, one per service. If a step fails, the saga runs **compensating actions**: steps that undo the earlier work, such as "refund the payment".

| Style | How steps are triggered | Good | Bad |
|---|---|---|---|
| Choreography | Each service reacts to the previous service's event | No central part, loose coupling | Hard to see the whole flow |
| Orchestration | One coordinator calls each step and tracks state | Flow is visible in one place | The coordinator is one more service |

```python
def run_saga(steps):
    done = []                                  # steps that succeeded
    for name, action, undo in steps:
        try:
            action()
            done.append((name, undo))
        except Exception as err:
            print(f"{name} failed: {err}")
            for prev, prev_undo in reversed(done):
                prev_undo()                    # compensate, newest first
                print(f"undone: {prev}")
            return "cancelled"
    return "completed"

def fail(msg):
    raise RuntimeError(msg)

steps = [
    ("reserve stock", lambda: None, lambda: None),
    ("charge card", lambda: None, lambda: None),
    ("book courier", lambda: fail("no courier"), lambda: None),
]
print(run_saga(steps))
```

:::example Output of the saga above
```text
book courier failed: no courier
undone: charge card
undone: reserve stock
cancelled
```

The third step failed, so the two finished steps were undone in reverse order. In a real system each `action` and `undo` is a call to another service, the saga state is saved in a database after every step, and every call carries an idempotency key so that a retry is safe.
:::

A saga is not a real transaction. Between steps, other users can see the half-finished state, for example stock reserved for an order that will be cancelled. Design the states to be honest: "pending", "confirmed", "cancelled".

## Dead letter queues and backpressure

A message that fails again and again is called a **poison message**. After a few retries, move it to a **dead letter queue** (DLQ): a separate queue for failed messages, so the main queue keeps flowing. Put an alert on the DLQ size.

**Backpressure** is what you do when producers are faster than consumers for a long time. Watch the **consumer lag** (how far consumers are behind). Then add consumers, slow down producers, or drop low-priority work.

:::interview An order service must save the order and tell the warehouse. How do you make sure the warehouse always hears about it, exactly once?
"I avoid the dual write. The order service writes the order row and an outbox row in one local transaction, so either both exist or neither. A relay reads unsent outbox rows and publishes them to the broker with the order ID as the key, which keeps events of one order in sequence. The relay marks a row as sent only after the broker confirms, so a crash causes a repeat, never a loss. That is at-least-once. On the warehouse side, the consumer stores the event ID in a table with a unique constraint in the same transaction as its own change. A repeated event hits the constraint and is skipped. Together this gives an exactly-once effect. Events that still fail after several retries go to a dead letter queue with an alert."
:::

:::revise
- A queue decouples services, buffers spikes and moves slow work out of the request.
- Queue: message removed after ack. Stream: an ordered log kept for a retention time and replayable.
- Kafka orders messages only inside a partition; the key chooses the partition.
- At-least-once delivery plus an idempotent consumer gives an exactly-once effect.
- Outbox: write the event in the same transaction as the data; a relay publishes it.
- Saga: a chain of local transactions with compensating actions to undo on failure.
:::

# Rate limiters and unique IDs

*Two small building blocks that appear in almost every design: how to say "slow down", and how to name things across many machines.*

## Why rate limiting matters

A metro station gate lets only so many people through per minute. When the platform is full, the gate slows down. People wait outside, but the platform stays safe.

A **rate limiter** does this for an API. It allows each client a fixed number of requests in a period and rejects the rest. It protects you from abuse, from buggy clients stuck in a loop, and from one heavy customer starving the others.

When a request is rejected, the server answers with HTTP status `429 Too Many Requests` and a `Retry-After` header that says how many seconds to wait.

## The algorithms

| Algorithm | Idea | Memory per client | Weak point |
|---|---|---|---|
| Fixed window | Count requests per calendar minute | 1 counter | Double burst at the window edge |
| Sliding window log | Keep the time of every request | 1 entry per request | Heavy for high limits |
| Sliding window counter | Blend this window and the last one | 2 counters | A close estimate, not exact |
| Token bucket | Spend tokens that refill steadily | 2 numbers | Needs two settings tuned |
| Leaky bucket | Queue requests, release at a fixed rate | A queue | Bursts must wait |

:::example The edge problem of a fixed window
Limit: 100 requests per minute. A client sends 100 requests at 10:00:59 and 100 more at 10:01:01. Each calendar minute saw only 100, so all 200 pass. But 200 requests arrived within 2 seconds. The sliding window methods and the token bucket fix this.
:::

## Token bucket

Picture a bucket that holds at most `capacity` tokens. Tokens drip in at a steady rate. Each request takes one token. If the bucket is empty, the request is rejected. A full bucket allows a short **burst** (many requests at once), while the drip rate sets the long-term average.

```python
import time

class TokenBucket:
    def __init__(self, capacity, refill_per_sec, now=time.monotonic):
        self.capacity = capacity
        self.rate = refill_per_sec
        self.now = now
        self.tokens = capacity              # start with a full bucket
        self.last = now()

    def allow(self, cost=1):
        t = self.now()
        # add the tokens earned since the last call, up to capacity
        self.tokens = min(self.capacity,
                          self.tokens + (t - self.last) * self.rate)
        self.last = t
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False
```

We do not run a timer that adds tokens. We compute how many tokens were earned since the last request. This is called lazy refill, and it needs only two stored numbers per client: `tokens` and `last`.

:::example Dry run: capacity 3, refill 1 token per second
| Time (s) | Tokens after refill | Request | Tokens left |
|---|---|---|---|
| 0.0 | 3.0 | allowed | 2.0 |
| 0.0 | 2.0 | allowed | 1.0 |
| 0.0 | 1.0 | allowed | 0.0 |
| 0.0 | 0.0 | rejected | 0.0 |
| 1.5 | 1.5 | allowed | 0.5 |
| 2.0 | 1.0 | allowed | 0.0 |
| 2.2 | 0.2 | rejected | 0.2 |

A burst of 3 passes at once. After that the client gets about one request per second.
:::

## Sliding window log

Keep the timestamp of every allowed request. To decide, drop the timestamps older than the window and count the rest. It is exact, but it stores one entry per request.

```python
from collections import deque

class SlidingWindowLog:
    def __init__(self, limit, window_sec):
        self.limit = limit
        self.window = window_sec
        self.times = deque()            # times of allowed requests

    def allow(self, now):
        while self.times and self.times[0] <= now - self.window:
            self.times.popleft()        # forget requests that are too old
        if len(self.times) < self.limit:
            self.times.append(now)
            return True
        return False
```

## Sliding window counter

This keeps only two counters: the current window and the previous one. It assumes requests in the previous window were spread evenly, and counts the part of it that is still inside the sliding view.

```python
class SlidingWindowCounter:
    def __init__(self, limit, window_sec):
        self.limit = limit
        self.window = window_sec
        self.counts = {}                # window number -> count

    def allow(self, now):
        cur = int(now // self.window)
        elapsed = (now % self.window) / self.window   # 0.0 to 1.0
        prev_count = self.counts.get(cur - 1, 0)
        cur_count = self.counts.get(cur, 0)
        # weight the previous window by the share still in view
        estimate = prev_count * (1 - elapsed) + cur_count
        if estimate < self.limit:
            self.counts[cur] = cur_count + 1
            return True
        return False
```

```text
Limit 100 per minute. Previous minute: 80 requests.
We are 15 seconds into the current minute, which has 30 requests.

elapsed  = 15 / 60 = 0.25
estimate = 80 x (1 - 0.25) + 30 = 60 + 30 = 90
90 < 100  -> allowed
```

A real version deletes old window counters, for example by giving each key a TTL.

## Rate limiting with many servers

If each app server counts on its own, a client can get the limit multiplied by the number of servers. The counters must live in one shared place, usually an in-memory store such as Redis.

```python
import time

def allow_fixed_window(r, user_id, limit=100, window=60):
    # r is a Redis client. One key per user per window.
    key = f"rl:{user_id}:{int(time.time() // window)}"
    count = r.incr(key)                 # atomic: safe with many servers
    if count == 1:
        r.expire(key, window * 2)       # old windows clean themselves up
    return count <= limit
```

`INCR` is **atomic**: it reads, adds and writes as one step, so two servers cannot both read "99" and both allow. A token bucket needs several steps (read, compute, write), so it is sent to Redis as one small script that runs without interruption.

:::flow Where the limiter sits
Client | sends request
API gateway | asks the limiter
Shared counters | in-memory store
Allowed | forward to service
Rejected | 429 + Retry-After
:::

| Decision | Options | Usual choice |
|---|---|---|
| What to limit by | User ID, API key, IP address | User or API key; IP for logged-out traffic |
| Where | Client, gateway, each service | Gateway, plus limits inside critical services |
| If the counter store is down | Allow all (fail open) or block all (fail closed) | Fail open for normal APIs, closed for costly ones |

:::warn Read, then write, without atomicity
The tempting code is: `count = get(key)`, then `if count < limit: set(key, count + 1)`. Under load, many requests read the same count before any of them writes. All of them pass. This is a **race condition**. Use one atomic operation (`INCR`) or a script that the store runs as a single step.
:::

## Why unique IDs are a design topic

On one database, `id` is simple: the database counts 1, 2, 3. With many shards or many services, two machines would both hand out "1001". You need IDs that are unique everywhere without asking a central place every time.

| Method | Size | Sorted by time | Needs coordination | Note |
|---|---|---|---|---|
| Database auto-increment | 64 bits | Yes | Yes, one database | Simple; one writer is the limit |
| Blocks from a counter service | 64 bits | Roughly | Once per block | Short IDs, good for short links |
| UUID version 4 | 128 bits | No | No | Random; scatters index inserts |
| UUID version 7 | 128 bits | Yes | No | Starts with a timestamp |
| Snowflake-style | 64 bits | Yes | Only a machine ID | Compact and time-sorted |

A **UUID** (universally unique identifier) is a 128-bit value, usually written as 36 characters. Version 4 uses 122 random bits, so two machines will practically never produce the same one.

## Snowflake-style IDs

A **Snowflake-style ID** packs three things into one 64-bit number:

```text
| 1 bit  | 41 bits              | 10 bits    | 12 bits  |
| unused | milliseconds since   | machine ID | sequence |
|        | a chosen start date  |            |          |

41 bits of time : 2^41 ms = 2,199,023,255,552 ms
                = about 2,199,023,255 seconds
                = 2,199,023,255 / 31,536,000 = about 69.7 years
10 bits         : 2^10 = 1,024 machines
12 bits         : 2^12 = 4,096 IDs per millisecond per machine
                = 4,096,000 IDs per second per machine
```

Because the time is in the highest bits, sorting by ID is sorting by creation time. That is very useful for feeds and chat.

```python
import threading, time

EPOCH_MS = 1_735_689_600_000        # 2025-01-01 00:00 UTC, our start date

class SnowflakeId:
    def __init__(self, machine_id):
        assert 0 <= machine_id < 1024       # must fit in 10 bits
        self.machine_id = machine_id
        self.last_ms = -1
        self.seq = 0
        self.lock = threading.Lock()

    def next_id(self):
        with self.lock:
            now = int(time.time() * 1000)
            if now < self.last_ms:
                raise RuntimeError("clock moved backwards")
            if now == self.last_ms:
                self.seq = (self.seq + 1) & 4095    # 12 bits: 0 to 4095
                if self.seq == 0:                   # all 4,096 used
                    while now <= self.last_ms:      # wait for next ms
                        now = int(time.time() * 1000)
            else:
                self.seq = 0
            self.last_ms = now
            return ((now - EPOCH_MS) << 22) \
                | (self.machine_id << 12) | self.seq
```

```python
def split_id(snowflake):
    ms = (snowflake >> 22) + EPOCH_MS       # top bits: time
    machine = (snowflake >> 12) & 1023      # next 10 bits
    seq = snowflake & 4095                  # last 12 bits
    return ms, machine, seq

gen = SnowflakeId(machine_id=7)
a, b = gen.next_id(), gen.next_id()
print(a < b)                    # True: later IDs are larger
print(split_id(a)[1])           # 7
```

:::tip
The two classic problems of this scheme: every machine needs a different machine ID (assign it at start-up from a small coordination service or from configuration), and the clock can jump backwards after a time sync. The safe reaction to a backwards clock is to refuse to issue IDs until time catches up, as the code does.
:::

:::interview Design a rate limiter that allows each API key 1,000 requests per minute across 50 gateway servers.
"The count must be shared, so I keep it in an in-memory store that all gateways call. I would use a token bucket per API key with capacity 1,000 and a refill of about 16.7 tokens per second, because it allows short bursts and stores only two numbers per key. The refill-and-take logic runs as one atomic script in the store to avoid races. Keys expire when idle, so memory holds only active clients. A rejected request gets 429 with `Retry-After`. If the store is unreachable I fail open for ordinary endpoints so that a limiter outage does not become a full outage, and I alert on it. To save a network call on every request, a gateway can also keep a small local allowance per key and sync with the store every few hundred milliseconds. That is faster but slightly less exact."
:::

:::revise
- Fixed window is simple but allows a double burst at the edge of two windows.
- Token bucket: capacity sets the burst, refill rate sets the average; store only tokens and last time.
- Sliding window counter: previous count x remaining share + current count.
- With many servers, keep counters in a shared store and update them atomically.
- Reject with 429 and `Retry-After`; decide fail open or fail closed.
- Snowflake-style ID: 41 bits time, 10 bits machine, 12 bits sequence; sortable by time.
:::

# Reliability and availability maths

*Timeouts, retries with backoff and jitter, circuit breakers, and how to calculate the nines.*

## Why it matters

In a system of a hundred machines, something is always broken: a disk, a network cable, a slow neighbour. You cannot prevent failure. You can only decide what happens next. A **reliable** system keeps doing the right thing when parts of it fail.

Think of the wiring in a house. One faulty iron should not burn the whole house. So there is a safety switch (an MCB) that trips and cuts that circuit. The other rooms keep their lights. Reliability patterns are the safety switches of software.

## Timeouts

A **timeout** is the longest time you are willing to wait for a reply. Without one, a single slow service makes its callers wait for ever. Their threads and connections fill up, then their callers wait too. A slow service is often worse than a dead one, because a dead one fails fast.

Rules:

- Every network call has a timeout. No exceptions.
- Set it a little above the normal slow case. If 99 out of 100 calls finish in 200 ms, a timeout of 300 to 500 ms is reasonable.
- An outer call must have a longer timeout than the inner calls it waits for.

## Retries with backoff and jitter

Many failures are short: a dropped packet, a server restarting. Trying again often works. But naive retries are dangerous. If a service is overloaded and every client retries at once, the load doubles and the service never recovers. This is called a **retry storm**.

Two fixes:

- **Exponential backoff:** wait longer after each failure: 0.1 s, 0.2 s, 0.4 s, 0.8 s.
- **Jitter:** add randomness to the wait, so thousands of clients do not all retry at the same instant.

```python
import random, time

def call_with_retry(fn, attempts=4, base=0.1, cap=5.0, sleep=time.sleep):
    for attempt in range(attempts):
        try:
            return fn()
        except TimeoutError:
            if attempt == attempts - 1:
                raise                               # no attempts left
            limit = min(cap, base * 2 ** attempt)   # 0.1, 0.2, 0.4, ...
            sleep(random.uniform(0, limit))         # full jitter
```

"Full jitter" means the wait is a random time between zero and the backoff limit.

:::example How retries multiply across layers
The gateway calls service A, A calls service B, B calls the database. Each layer makes up to 3 attempts. If the database is down:

```text
B tries the database 3 times for each call it receives.
A calls B 3 times        -> 3 x 3     = 9 database attempts
Gateway calls A 3 times  -> 3 x 3 x 3 = 27 database attempts
```

One user request became 27 attempts against a database that is already in trouble. Retry at one layer only, usually the one closest to the user, or limit retries to a small share of all traffic (a **retry budget**).
:::

:::warn Retrying a request that is not idempotent
A timeout does not mean the request failed. It means you do not know. The payment may have gone through and only the reply was lost. If you retry "charge 500 rupees", the customer may pay twice. Retry only idempotent operations, or send an idempotency key so that the server can recognise the repeat.
:::

## Circuit breaker

A **circuit breaker** watches the calls to one dependency. When too many fail, it "opens" and stops sending calls for a while. Callers get an instant fallback instead of waiting for a timeout. This protects the caller and gives the sick service time to recover.

| State | Behaviour | Moves to |
|---|---|---|
| Closed | Calls pass through; failures are counted | Open, when failures reach the limit |
| Open | Calls fail at once with a fallback | Half-open, after a waiting time |
| Half-open | One trial call is allowed | Closed if it succeeds, open if it fails |

:::flow Circuit breaker states
Closed | normal traffic
Too many failures | trip
Open | fail fast, use fallback
Wait | for example 30 s
Half-open | one trial call
:::

```python
import time

class CircuitBreaker:
    def __init__(self, max_failures=5, reset_after=30, now=time.monotonic):
        self.max_failures = max_failures
        self.reset_after = reset_after      # seconds to stay open
        self.now = now
        self.failures = 0
        self.opened_at = None               # None means closed

    def call(self, fn, fallback):
        if self.opened_at is not None:
            if self.now() - self.opened_at < self.reset_after:
                return fallback()           # open: fail fast
            # half-open: the wait is over, this call is the trial
        try:
            result = fn()
        except Exception:
            self.failures += 1
            trial_failed = self.opened_at is not None
            if trial_failed or self.failures >= self.max_failures:
                self.opened_at = self.now() # open, or open again
            return fallback()
        self.failures = 0                   # success: close the circuit
        self.opened_at = None
        return result
```

A **fallback** is the second-best answer: a cached value, a default list, or a clear "try again later" message.

## More safety switches

| Pattern | Idea | Example |
|---|---|---|
| Bulkhead | Separate resource pools so one failure cannot use everything | A separate connection pool for each dependency |
| Load shedding | Reject extra work early when overloaded | Return 503 quickly instead of timing out slowly |
| Graceful degradation | Turn off optional features, keep the core | Show the product page without recommendations |
| Redundancy | Run more than one of everything | Two load balancers, three replicas |
| Health checks | Detect dead parts and route around them | Remove a server after failed checks |

## Availability and the nines

**Availability** is the share of time the system works. It is written as a percentage, and people count the nines.

```text
Minutes in a year  = 365 x 24 x 60 = 525,600
Minutes in 30 days = 30 x 24 x 60  = 43,200

Allowed downtime = (1 - availability) x period
```

| Availability | Name | Downtime per year | Downtime per 30 days |
|---|---|---|---|
| 99% | two nines | 5,256 min = 3.65 days | 432 min = 7.2 hours |
| 99.9% | three nines | 525.6 min = 8.76 hours | 43.2 min |
| 99.99% | four nines | 52.56 min | 4.32 min |
| 99.999% | five nines | 5.26 min | about 26 seconds |

Each extra nine cuts the downtime by ten, and usually costs far more than the previous one.

Three words that come up with this topic:

- **SLI** (service level indicator): a measured number, such as "share of requests answered correctly within 300 ms".
- **SLO** (service level objective): the target for that number, such as 99.9%.
- **SLA** (service level agreement): a promise to customers, with a penalty if it is broken.

The downtime an SLO allows is called the **error budget**. With a 99.9% monthly SLO you may be down 43.2 minutes a month.

## Series and parallel

**In series** means a request needs every part to work. Multiply the availabilities. The result is always worse than the weakest part.

```text
A_series = A1 x A2 x A3

Three services, each 99.9%:
  0.999 x 0.999 x 0.999 = 0.997003  -> about 99.70%
  Downtime = 0.002997 x 525,600 = 1,575 min = about 26 hours a year
  (one service alone: 8.76 hours)
```

**In parallel** means the copies back each other up. The group fails only if all copies fail at the same time.

```text
A_parallel = 1 - (1 - A)^n

Two servers, each 99%:
  1 - (0.01 x 0.01) = 1 - 0.0001 = 0.9999  -> 99.99%

Three servers, each 99%:
  1 - 0.01^3 = 1 - 0.000001 = 0.999999     -> 99.9999%
```

:::example A full path
A request passes through a load balancer (99.99%), then two app servers in parallel (each 99%), then a database (99.95%).

```text
App tier  = 1 - 0.01 x 0.01            = 0.9999
System    = 0.9999 x 0.9999 x 0.9995
          = 0.99980001 x 0.9995
          = 0.99930011                  -> about 99.93%
Downtime  = (1 - 0.99930011) x 525,600
          = 0.00069989 x 525,600       = about 368 minutes a year
                                        = about 6.1 hours
```

The database is the weakest part. Making the app tier even better would not help. To improve the system, add a standby database.
:::

```python
def series(*parts):
    total = 1.0
    for a in parts:
        total *= a                  # every part must work
    return total

def parallel(a, copies):
    return 1 - (1 - a) ** copies    # fails only if all copies fail

def downtime_min_per_year(a):
    return (1 - a) * 365 * 24 * 60

app = parallel(0.99, 2)
system = series(0.9999, app, 0.9995)
print(round(system, 6))                       # 0.9993
print(round(downtime_min_per_year(system)))   # 368
```

:::note
The parallel formula assumes the copies fail **independently**. Two servers in the same rack share the same power and network. Two copies running the same buggy release fail together. Real availability is lower than the formula says, which is why copies are placed in different zones and releases are rolled out gradually.
:::

:::interview Your service calls a recommendation service that sometimes becomes very slow. How do you protect your own service?
"First, a strict timeout on that call, a little above its normal slow case, so my threads are never stuck. Second, a circuit breaker: after repeated failures or timeouts it opens, and for the next 30 seconds I skip the call and use a fallback, for example a cached list of popular items. After that one trial call decides whether to close the circuit again. Third, a bulkhead: the recommendation client has its own small connection pool, so even at its worst it cannot use up the connections needed for checkout. I would retry at most once, with jitter, because retries add load to a service that is already slow. And I would put the timeout rate and the breaker state on a dashboard, so we notice when we are serving fallbacks."
:::

:::revise
- Every network call needs a timeout; a slow dependency is worse than a dead one.
- Retry with exponential backoff and jitter, at one layer only, and only idempotent operations.
- Circuit breaker: closed, open (fail fast), half-open (one trial call).
- 99.9% is 8.76 hours of downtime a year; 99.99% is 52.56 minutes.
- Series: multiply availabilities. Parallel: `1 - (1 - A)^n`.
- The parallel formula assumes independent failures, so spread copies across zones.
:::

# Worked design: URL shortener

*A read-heavy key-value system: turn a long link into seven characters and redirect quickly.*

## Why this question

A courier company gives each parcel a short tracking number. You do not write the full address every time you ask about it. The number is enough, and the company looks up the rest.

A URL shortener does the same for web links. `https://example.com/a/very/long/path?with=many&things=1` becomes `https://sho.rt/Ab3xK9q`. The question is popular because it is small enough to finish, and still covers ID generation, caching, storage size and redirects.

## 1. Requirements

**Functional**

- Create a short link for a long URL. Optional custom alias and expiry date.
- Opening the short link redirects to the long URL.
- Count clicks per link (basic analytics).

**Non-functional**

- Redirects are fast (tens of milliseconds on our side) and highly available.
- A code, once created, always points to the same URL.
- Codes are not easy to guess in sequence.

**Out of scope:** user accounts and billing, a full analytics dashboard.

## 2. Estimates

All inputs are assumptions.

```text
New links        = 20,000,000 per day
Write QPS        = 20,000,000 / 86,400 = 231    -> about 230 per second

Redirects        = 50 per link created (assumed read : write = 50 : 1)
                 = 20,000,000 x 50 = 1,000,000,000 per day
Read QPS         = 1,000,000,000 / 86,400 = 11,574 -> about 11,600 / s
Peak read QPS    = 11,600 x 3 = 34,800             -> about 35,000 / s

Links in 10 yrs  = 20,000,000 x 365 x 10 = 73,000,000,000  (73 billion)
Row size         = 300 bytes (200 for the URL, 100 for the rest)
Storage          = 73 billion x 300 B = 21.9 trillion B -> about 22 TB
With 3 copies    = 22 TB x 3 = 66 TB

Hot cache        = 100,000,000 hottest links x 300 B = 30 GB
Redirect egress  = 11,600 x 500 B per response = 5.8 MB/s
```

**How long must the code be?** We use 62 characters: 0 to 9, a to z, A to Z.

```text
62^6 = 56,800,235,584        (56.8 billion)  -> less than 73 billion
62^7 = 3,521,614,606,208     (3.5 trillion)  -> 73 billion is about 2%
```

Six characters are not enough. Seven give plenty of room.

**What the numbers say:** writes are small, reads are large and repeat the same hot links, and 22 TB is too much for one comfortable database node. So the plan is: cache hard, and shard a simple key-value table.

## 3. API

```text
POST /v1/links
  body: { long_url, custom_alias?, expires_at? }
  201:  { code: "Ab3xK9q", short_url: "https://sho.rt/Ab3xK9q" }
  409:  alias already taken

GET /{code}
  302:  Location: <long_url>
  404:  unknown or expired code

GET /v1/links/{code}/stats
  200:  { clicks: 18234 }
```

## 4. Data model

The only hot query is "give me the long URL for this code". That is a key lookup.

```sql
CREATE TABLE links (
    code        VARCHAR(16) PRIMARY KEY,     -- generated or custom alias
    long_url    TEXT        NOT NULL,
    owner_id    BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ                  -- NULL means never
);

-- Hands out blocks of numbers to the app servers.
CREATE TABLE counters (
    name        TEXT PRIMARY KEY,
    next_value  BIGINT NOT NULL
);
```

Because we never join and always look up by `code`, this table shards cleanly by a hash of `code`. A key-value store would also be a fine choice.

## 5. High-level design

:::flow Create a short link
Client | POST long URL
Link service | takes next number
Encoder | number to 7 characters
Database | insert code and URL
Client | gets the short URL
:::

:::flow Redirect
Browser | GET /Ab3xK9q
Link service | looks in the cache
Database | only on a cache miss
Browser | 302 to the long URL
Click queue | counted later
:::

## 6. Deep dives

### Making the code

| Option | How | Problem |
|---|---|---|
| Hash the URL, keep 7 characters | No counter needed | Different URLs can collide; needs check and retry |
| Random 7 characters | Hard to guess | A database check on every create |
| Counter, written in base 62 | Never collides | Needs a shared counter; codes come in sequence |

We take the counter, and solve its two problems.

**Problem 1: a shared counter is a bottleneck.** Each app server asks the database for a **block** of numbers and then uses them from memory. With blocks of 10,000 the counter table is touched only once per 10,000 links.

```sql
-- One atomic statement: reserve 10,000 numbers and learn where they start.
UPDATE counters
SET next_value = next_value + 10000
WHERE name = 'links'
RETURNING next_value - 10000 AS block_start;
```

```python
import threading

class RangeAllocator:
    """Each app server takes a block of numbers and uses it locally."""
    def __init__(self, fetch_block, block_size=10_000):
        self.fetch_block = fetch_block  # returns the start of a new block
        self.block_size = block_size
        self.next = self.end = 0
        self.lock = threading.Lock()

    def next_id(self):
        with self.lock:
            if self.next == self.end:           # block is used up
                self.next = self.fetch_block(self.block_size)
                self.end = self.next + self.block_size
            value = self.next
            self.next += 1
            return value
```

If a server crashes, the rest of its block is never used. That only wastes numbers, and we have 3.5 trillion.

**Problem 2: codes in sequence are guessable.** We scramble the number before encoding it. Multiplying by a fixed number and taking the remainder is reversible when the multiplier shares no factor with the size of the space. Here the space is `62^7`, whose only prime factors are 2 and 31.

```python
ALPHABET = ("0123456789abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
SPACE = 62 ** 7                    # 3,521,614,606,208 possible codes
MULT = 2_246_822_519_383           # odd and not a multiple of 31
MULT_INV = pow(MULT, -1, SPACE)    # the number that undoes MULT

def to_base62(n, width=7):
    chars = []
    for _ in range(width):
        n, rem = divmod(n, 62)     # peel off one base-62 digit
        chars.append(ALPHABET[rem])
    return "".join(reversed(chars))

def from_base62(code):
    n = 0
    for ch in code:
        n = n * 62 + ALPHABET.index(ch)
    return n

def make_code(counter):
    return to_base62(counter * MULT % SPACE)    # scramble, then encode

def read_counter(code):
    return from_base62(code) * MULT_INV % SPACE

print(make_code(1), make_code(2))               # DyvsjHh h70UDoy
print(read_counter(make_code(123_456_789)))     # 123456789
```

:::example Encoding a small number by hand
Write 125 in base 62 with our alphabet. `125 / 62 = 2` remainder `1`. Then `2 / 62 = 0` remainder `2`. Reading the remainders from last to first gives the digits `2, 1`, so the text is `21`. Padded to seven characters it is `0000021`. Check: `2 x 62 + 1 = 125`.
:::

The scramble hides the order from casual visitors. It is not encryption. Anyone who learns the multiplier can undo it, so never treat a short code as a secret.

### Fast redirects

- **Cache-aside** with an in-memory cache. The value is tiny, and a link never changes after creation, so a long TTL is safe.
- **Negative caching.** Unknown codes are cached as "not found" for a short time, so random guessing does not hammer the database.
- **Click counting must not slow the redirect.** The service puts a click event on a queue and replies at once. A worker adds up the events in batches.

### 301 or 302?

| Status | Meaning | Effect |
|---|---|---|
| 301 | Moved permanently | Browsers may remember it and skip us next time. Less load, but we miss clicks |
| 302 | Found (temporary) | Every click comes to us. More load, full click counts, link can be disabled |

We choose 302 because click counts are a requirement.

:::warn Checking for a collision and then inserting
With hashed or random codes, the tempting flow is "SELECT to see if the code exists, then INSERT". Two requests can both see "free" and both insert. Let the database decide: make `code` the primary key, try the insert, and on a unique-key error generate a new code. The same rule protects custom aliases.
:::

## 7. Trade-offs and failure cases

| Decision | Gain | Cost |
|---|---|---|
| Counter with blocks | No collisions, no check on write | A counter table to protect; unused numbers after crashes |
| Scrambled codes | Not guessable in order | Not real security |
| 302 redirect | Accurate click counts | Every click reaches our servers |
| Click counts through a queue | Fast redirects | Counts are a few seconds behind |
| Sharding by hash of code | Even spread, simple lookups | Listing "all links of one user" needs a second index |

- **Cache down:** redirects fall back to the database. With 35,000 reads per second at peak that is heavy, so the cache runs as a cluster with replicas.
- **Counter database down:** servers keep creating links from the blocks they already hold. New blocks need the counter back.
- **Expired links:** check `expires_at` at read time, and delete old rows with a background job.
- **Abuse:** rate limit link creation per user, and check new URLs against a blocklist of harmful sites.

:::interview The same long URL is submitted twice. Should it get the same short code?
"It depends on the product. Returning the same code saves storage, but it needs a lookup by long URL on every create, which means a second index on a long text column, or on its hash. It also mixes the click counts of different users who shared the same page. I would give each request a new code by default, because storage is cheap here: 73 billion rows fit in about 22 TB. If the interviewer wants de-duplication per user, I would store a hash of the URL and add a unique index on `(owner_id, url_hash)`, so that one user sending the same URL twice gets the code they already have."
:::

:::revise
- Read-heavy key lookup: cache-aside in front of a table sharded by code.
- 62^7 is about 3.5 trillion codes; check the code length against total links.
- Counter in blocks gives collision-free codes without a database check per write.
- Scramble the counter to hide the sequence, but do not call it security.
- 302 keeps click counts accurate; 301 lowers load but hides repeat clicks.
- Count clicks through a queue so that redirects stay fast.
:::

# Worked design: news feed

*Showing each user recent posts from the people they follow, and deciding who pays: the writer or the reader.*

## Why this question

A newspaper has two ways to reach readers. It can **deliver** a copy to every subscriber's door each morning. Reading is instant, but printing and delivery are a lot of work. Or it can leave copies at the shop, and each reader **walks** there. Nothing is delivered, but every reader spends time.

A news feed has the same choice. Build each user's feed when a post is written (deliver), or when the feed is opened (walk). This question tests fan-out, caching and how you deal with very uneven users.

## 1. Requirements

**Functional**

- A user can publish a post (text, optional image).
- A user can follow and unfollow other users.
- A user sees a feed of recent posts from the accounts they follow, newest first, with infinite scroll.

**Non-functional**

- Opening the feed is fast (target under 200 ms on our side).
- A new post may take a few seconds to appear in followers' feeds. Eventual consistency is acceptable.
- The feed stays available even when a part of the system is down.

**Out of scope:** ads, a recommendation algorithm, comments and likes.

## 2. Estimates

```text
DAU              = 200,000,000
Posts per day    = 200,000,000 x 0.2 = 40,000,000
Post write QPS   = 40,000,000 / 86,400 = 463      -> about 460 per second

Feed opens       = 200,000,000 x 8 = 1,600,000,000 per day
Feed read QPS    = 1,600,000,000 / 86,400 = 18,519 -> about 18,500 / s

Avg followers    = 150 (assumed)
Feed inserts     = 40,000,000 x 150 = 6,000,000,000 per day
Insert rate      = 6,000,000,000 / 86,400 = 69,444 -> about 69,000 / s

Feed entry       = 16 bytes (8 for the post ID, 8 for the sort score)
Feed per user    = 300 entries x 16 B = 4,800 B   = 4.8 KB
Feed cache       = 4.8 KB x 200,000,000 = 960 GB  -> about 1 TB of memory
```

**What the numbers say:** only 460 posts per second are written, but delivering them means about 69,000 small writes per second. Feeds are read 40 times more often than posts are written (18,500 / 460). So we should make reads cheap and do the heavy work on the write side, in the background.

## 3. API

```text
POST /v1/posts
  body: { text, image_key?, client_post_id }
  201:  { post_id }

GET /v1/feed?cursor=<post_id>&limit=20
  200:  { posts: [...], next_cursor: <post_id or null> }

PUT    /v1/follows/{user_id}     -> 204   (follow)
DELETE /v1/follows/{user_id}     -> 204   (unfollow)
```

The cursor is the ID of the last post the client has. Post IDs are time-sorted, so "posts with an ID smaller than the cursor" means "older posts". This is keyset pagination, and it stays correct while new posts arrive at the top.

## 4. Data model

```sql
CREATE TABLE posts (
    id          BIGINT PRIMARY KEY,          -- Snowflake-style, time-sorted
    author_id   BIGINT NOT NULL,
    body        TEXT   NOT NULL,
    image_key   TEXT,                        -- object in blob storage
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_author ON posts (author_id, id DESC);

CREATE TABLE follows (
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    PRIMARY KEY (follower_id, followee_id)   -- "whom do I follow?"
);
-- "who follows me?" is needed for fan-out
CREATE INDEX idx_follows_followee ON follows (followee_id, follower_id);
```

The feed itself is not a table. It is a cached list of post IDs per user, kept in an in-memory store as a sorted set (a set ordered by a score, here the post ID).

## 5. The key decision: push or pull

| | Fan-out on write (push) | Fan-out on read (pull) |
|---|---|---|
| When work happens | When a post is created | When a feed is opened |
| Feed read | One cache lookup, very fast | Query many authors and merge, slow |
| Post write | One insert per follower | One insert in total |
| Wasted work | Feeds of users who never open the app | None |
| Breaks when | An author has millions of followers | A reader follows thousands of accounts |

Neither works alone. The **hybrid** approach:

- **Normal authors: push.** Their posts are copied into followers' cached feeds by background workers.
- **Authors with a huge following: pull.** Their posts are not fanned out. At read time, the feed service fetches their recent posts and merges them in.

```python
def publish(post, followers_of, feed_cache, big_limit=10_000):
    followers = followers_of(post["author_id"])
    if len(followers) > big_limit:
        return "pull"                    # huge author: no fan-out
    for uid in followers:
        feed = feed_cache.setdefault(uid, [])
        feed.insert(0, post["id"])       # newest first
        del feed[300:]                   # keep only 300 IDs
    return "pushed"

def read_feed(uid, feed_cache, big_followed, recent_posts_of, n=20):
    ids = list(feed_cache.get(uid, []))
    for author in big_followed(uid):
        ids.extend(recent_posts_of(author))     # pull at read time
    # IDs are time-sorted, so the largest ID is the newest post
    return sorted(set(ids), reverse=True)[:n]
```

Here `feed_cache` is a plain dict to show the logic. In production it is a sorted set per user, and the trimming to 300 entries is one command.

:::example Dry run of the hybrid feed
Riya follows Aman (120 followers) and a cricket star (8 million followers).

1. Aman publishes post 5001. He is under the limit, so 5001 is pushed into the cached feeds of his 120 followers. Riya's feed is now `[5001, 4990, 4871]`.
2. The star publishes post 5003. Nothing is fanned out. The post is only saved, and added to the star's own short "recent posts" list.
3. Riya opens the app. The service reads her cached feed `[5001, 4990, 4871]`, sees that she follows one big account, pulls its recent posts `[5003, 4700]`, merges and sorts: `[5003, 5001, 4990, 4871, 4700]`.

One cache read plus one small extra read gave a complete feed. Without the hybrid rule, step 2 would have meant 8 million cache writes for one post.
:::

## 6. High-level design

:::flow Publishing a post
Client | POST /v1/posts
Post service | saves post + outbox row
Stream | post_created event
Fan-out workers | read the follower list
Feed cache | add ID to each feed
:::

:::flow Reading the feed
Client | GET /v1/feed
Feed service | reads cached IDs
Merge | adds big authors' posts
Post cache | IDs to full posts
Client | gets 20 posts
:::

Turning IDs into full posts is called **hydration**. The feed stores only IDs. The post content, author name and image URL come from a post cache with a database behind it. Images are served by a CDN.

## 7. Deep dives

**Fan-out throughput.** The average is about 69,000 feed inserts per second, and peaks are higher. Fan-out is done by a pool of workers that read `post_created` events from a stream. If a burst arrives, the stream buffers it and feeds are a few seconds late, which the requirements allow. One job per author is split into batches of, say, 1,000 followers, so that a failed batch can be retried alone.

**Do not build feeds for people who are away.** Skip followers who have not opened the app in the last 30 days. When such a user returns, build their feed once by the pull method and cache it. This cuts both the insert rate and the 1 TB of cache memory.

**Losing the feed cache.** The cache is not the source of truth. Posts and follows are in the database, so any feed can be rebuilt by pulling. A cold cache makes feeds slow for a while, not wrong.

**Deleted posts and unfollows.** Removing an ID from millions of cached feeds is expensive. Instead, filter at read time: during hydration, drop posts that no longer exist and posts by authors the reader has unfollowed.

**Ranking.** If the feed is ranked rather than purely by time, fetch a few hundred candidate IDs, score them with a ranking service, and return the top 20. The candidates still come from the same push and pull machinery.

:::warn Storing whole posts in every feed
If each feed entry holds the full post (text, author name, like count), an edit or a new like must be copied to millions of feeds, and memory use explodes. Store only post IDs in feeds. Keep one copy of each post in the post cache and join at read time.
:::

## 8. Trade-offs and failure cases

| Decision | Gain | Cost |
|---|---|---|
| Push for normal authors | Feed read is one cache lookup | Many background writes; memory for feeds |
| Pull for huge authors | No write storms | Slightly slower reads for their followers |
| Only IDs in feeds | Small entries, edits are cheap | An extra hydration step |
| Asynchronous fan-out | Posting is instant | A new post appears a few seconds late |
| Skipping inactive users | Less work and memory | First feed after a long break is slower |

- **Fan-out workers behind:** watch consumer lag and add workers. Posts are late but not lost, because the stream keeps them.
- **Feed cache node down:** replicas take over. For feeds that are missing, fall back to pull.
- **Post service down:** feeds still load from the caches. Publishing fails with a clear error, and the client retries with the same `client_post_id`, so no duplicates are created.

:::interview A user with 50 million followers publishes a post. Walk me through what happens.
"The post is saved once in the posts table, and an event goes to the stream through the outbox. The fan-out worker sees that this author is above the big-account limit, so it does not write to 50 million feeds. It only updates a small cached list of this author's recent posts. When any follower opens the feed, the feed service reads their cached feed, sees that they follow big accounts, fetches those short lists in parallel, merges by post ID and returns the top 20. That short list is one extremely hot key, read by millions of users. So I replicate it, and also keep a copy for a few seconds in each feed server's local memory. The cost of this design is a slightly slower read for followers of big accounts. What we avoid is 50 million writes that would delay everybody else's fan-out."
:::

:::revise
- Push (fan-out on write) makes reads cheap; pull (fan-out on read) makes writes cheap.
- Hybrid: push for normal authors, pull and merge for authors with huge followings.
- Feeds hold only post IDs; hydrate them from a post cache at read time.
- Fan-out is asynchronous through a stream, so posts arrive a few seconds late.
- The feed cache can be rebuilt from posts and follows; it is not the source of truth.
- Skip inactive users and filter deleted posts at read time.
:::

# Worked design: chat system

*Millions of open connections, messages that must arrive once and in order, and users who go offline.*

## Why this question

Normal web traffic is like sending letters. You post a request and wait for the reply. Chat is like a phone call: the line stays open and either side can speak at any moment.

That one difference changes the design. Servers now hold long-lived connections, which makes them stateful. A message must find the exact server that holds the receiver's connection. And phones lose network all the time, so "sent" and "received" are two different things.

## 1. Requirements

**Functional**

- One-to-one chat and group chat (assume up to 500 members).
- Delivery status: sent, delivered, read.
- Offline users get their messages when they come back, and a push notification meanwhile.
- Chat history is available on a new device.
- Online and last-seen status.

**Non-functional**

- A message reaches an online receiver in well under a second.
- No accepted message is lost. No message is shown twice.
- Messages inside one chat appear in the same order for everyone.

**Out of scope:** voice and video calls, end-to-end encryption, media processing.

## 2. Estimates

```text
DAU               = 100,000,000
Messages per day  = 100,000,000 x 30 = 3,000,000,000
Message QPS       = 3,000,000,000 / 86,400 = 34,722 -> about 35,000 / s
Peak (x 2)        = about 70,000 per second

Message size      = 200 bytes (text plus IDs and times)
Storage per day   = 3,000,000,000 x 200 B = 600,000,000,000 B = 600 GB
Storage per year  = 600 GB x 365 = 219,000 GB = 219 TB

Online at peak    = 25% of DAU (assumed) = 25,000,000 connections
Per gateway       = 100,000 connections (assumed)
Gateways          = 25,000,000 / 100,000 = 250
Memory            = 100,000 x 10 KB per connection (assumed) = 1 GB each
```

**What the numbers say:** storage is a huge, append-only stream (219 TB a year) that is read by chat and by time. That fits a wide-column store. The other challenge is 25 million open connections spread over about 250 gateway servers.

## 3. API

Real-time traffic uses a **WebSocket**: one connection that stays open, on which both client and server can send at any time. The frames below are small JSON messages on that connection.

```text
Client -> server
  { type: "send", chat_id, client_msg_id, text }
  { type: "ack_delivered", chat_id, seq }
  { type: "ack_read", chat_id, seq }
  { type: "ping" }                         every 30 seconds

Server -> client
  { type: "sent", client_msg_id, seq }     the server stored it
  { type: "message", chat_id, seq, sender_id, text, sent_at }
  { type: "receipt", chat_id, seq, status }

History and sync use plain HTTP:
GET /v1/chats/{chat_id}/messages?after_seq=1200&limit=100
```

`client_msg_id` is an idempotency key made by the sender's device. `seq` is a sequence number given by the server: 1, 2, 3 and so on inside each chat.

## 4. Data model

Messages go to a wide-column store. The table below is written in the CQL style that such stores use. All messages of one chat live together, sorted by `seq`.

```sql
CREATE TABLE messages (
    chat_id        bigint,
    seq            bigint,          -- order inside the chat
    sender_id      bigint,
    client_msg_id  uuid,
    body           text,
    sent_at        timestamp,
    PRIMARY KEY ((chat_id), seq)    -- partition by chat, sort by seq
) WITH CLUSTERING ORDER BY (seq DESC);
```

Membership and read positions are small and relational, so they stay in SQL.

```sql
CREATE TABLE chat_members (
    chat_id        BIGINT NOT NULL,
    user_id        BIGINT NOT NULL,
    last_read_seq  BIGINT NOT NULL DEFAULT 0,   -- for unread counts
    joined_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (chat_id, user_id)
);
CREATE INDEX idx_members_user ON chat_members (user_id);  -- "my chats"
```

The unread count of a chat is simply `latest seq - last_read_seq`.

## 5. High-level design

:::flow Sending a message to an online user
Sender | WebSocket frame
Gateway A | forwards to chat service
Chat service | gives seq, stores it
Session registry | finds receiver's gateway
Gateway B | pushes to the receiver
:::

:::flow When the receiver is offline
Chat service | no session found
Message store | message is safe
Notification service | sends a push
Receiver | opens app, reconnects
Sync | fetch after last seq
:::

The parts:

- **Gateways** hold the WebSocket connections. They do no business logic.
- The **chat service** is stateless. It validates, assigns `seq`, stores the message and routes it.
- The **session registry** is an in-memory store that maps `user_id` to the gateway holding that user's connection.
- The **message store** is the source of truth.

## 6. Deep dives

### Finding the receiver

Each gateway writes its users into the session registry, with a TTL that is refreshed by the client's ping. If a phone silently loses network, the pings stop and the entry expires on its own.

```python
def heartbeat(r, user_id, gateway_id):
    # called on every ping (every 30 s); the key expires after 70 s
    r.set(f"session:{user_id}", gateway_id, ex=70)

def find_gateway(r, user_id):
    return r.get(f"session:{user_id}")      # None means offline
```

The same key answers "is this user online?". Last seen is the time of the final heartbeat.

### Order and no duplicates

Device clocks are often wrong, so ordering by the sender's time is unsafe. The server gives every message the next sequence number of its chat. To keep that safe with many chat servers, all messages of one chat are handled by one owner at a time, for example by routing on a hash of `chat_id`.

```python
class ChatService:
    def __init__(self):
        self.last_seq = {}      # chat_id -> last sequence number used
        self.seen = {}          # (sender, client_msg_id) -> seq
        self.log = {}           # chat_id -> list of (seq, sender, text)

    def send(self, chat_id, sender, client_msg_id, text):
        key = (sender, client_msg_id)
        if key in self.seen:                 # a retry of the same message
            return self.seen[key]            # same answer, nothing stored
        seq = self.last_seq.get(chat_id, 0) + 1
        self.last_seq[chat_id] = seq
        self.log.setdefault(chat_id, []).append((seq, sender, text))
        self.seen[key] = seq
        return seq

    def sync(self, chat_id, after_seq):
        # what a client asks for when it reconnects
        return [m for m in self.log.get(chat_id, []) if m[0] > after_seq]
```

:::example Dry run: a lost reply and a reconnect
```python
chat = ChatService()
print(chat.send(9, "asha", "m-1", "Hi"))            # 1
print(chat.send(9, "ravi", "k-1", "Hello"))         # 2
# Asha's phone did not get the reply for "m-2", so it sends it twice.
print(chat.send(9, "asha", "m-2", "Lunch?"))        # 3
print(chat.send(9, "asha", "m-2", "Lunch?"))        # 3 again, no copy
# Ravi was offline after seq 1. On reconnect he asks for the rest.
print(chat.sync(9, after_seq=1))
# [(2, 'ravi', 'Hello'), (3, 'asha', 'Lunch?')]
```

The retry got the same `seq` back and created no second message. Ravi's sync returned exactly what he missed, in order.
:::

### The delivery rules

1. The sender keeps a message as "pending" and resends it until the server replies `sent`. Duplicates are harmless because of `client_msg_id`.
2. The server stores the message **before** it replies `sent`. So "one tick" means the message is safe.
3. The receiver's app answers `ack_delivered`. The server passes a `receipt` to the sender (two ticks). `ack_read` works the same way.
4. On every reconnect, the client sends its last known `seq` per chat and pulls what it missed. This sync is the safety net. Real-time push is only the fast path.

### Group messages

For a group of up to 500, the message is stored **once** under the group's `chat_id`. Then the chat service looks up the members and pushes to those who are online. Offline members catch up through sync. Storing one copy per member would multiply the 219 TB a year by the average group size.

:::warn Treating "pushed to the socket" as "delivered"
Writing to a WebSocket does not prove the phone received anything. The connection may already be dead. If the server marks a message delivered as soon as it writes to the socket, messages vanish in tunnels and lifts. Mark it delivered only when the receiving app sends its own ack, and always let the client pull missed messages by `seq` after it reconnects.
:::

## 7. Trade-offs and failure cases

| Decision | Gain | Cost |
|---|---|---|
| WebSocket gateways | Instant two-way delivery | Stateful servers; a deploy must drain connections |
| Server-side `seq` per chat | One clear order for everyone | Each chat needs a single owner at a time |
| Store first, then push | No accepted message is lost | A little extra latency on send |
| At-least-once plus `client_msg_id` | Simple and safe retries | A de-duplication record to keep |
| One stored copy per group message | Small storage | A member lookup on every send |

- **Gateway crash:** its 100,000 clients reconnect to other gateways and sync. Clients wait a random short time first, so that they do not all arrive in the same second.
- **Session registry stale:** the push goes to a gateway that no longer has the user. The gateway reports failure, and the message waits for sync or a push notification.
- **Message store slow:** the chat service cannot confirm writes, so senders see "pending" and retry. Nothing is acknowledged that is not stored.

:::interview A user sends a message in the metro, the network drops, and the app retries. How do you make sure the message is neither lost nor shown twice?
"The app creates a `client_msg_id` when the user presses send and keeps the message in a local pending list. It resends until it gets a `sent` reply. On the server, the chat service checks whether that sender and `client_msg_id` were already stored. If so, it returns the same `seq` and stores nothing new. So retries cannot create a second copy. The server replies `sent` only after the write to the message store succeeds, so a confirmed message is never lost. For the receiver, the server pushes the message if they are online, but the guarantee comes from sync: whenever the receiver reconnects, it asks for everything after its last `seq`. The receiver's app also ignores any `seq` it already has, in case a push and a sync bring the same message."
:::

:::revise
- Chat needs long-lived WebSocket connections held by stateful gateway servers.
- A session registry with TTL maps each online user to a gateway.
- The server assigns a per-chat sequence number; never order by device clocks.
- Store first, then confirm; the sender retries with a `client_msg_id` so repeats are harmless.
- Push is the fast path; sync by `seq` on reconnect is the guarantee.
- Store a group message once and fan out only the delivery.
:::

# Worked design: notification service

*One service that sends push, SMS and email for every team, without duplicates and without delaying urgent messages.*

## Why this question

A school office sends many kinds of notices: exam results, fee reminders, a picnic invitation. Some parents want SMS and some want email. Nobody wants the same reminder three times. Nobody wants a picnic message at midnight. And an urgent "school closed tomorrow" notice must not wait behind 5,000 picnic invitations.

A notification service has the same duties. It looks simple ("just call the SMS API"), but it tests queues, priorities, idempotency, rate limits, retries and third-party failures all at once.

## 1. Requirements

**Functional**

- Other services ask us to notify a user by push, SMS or email.
- Users have preferences: which channels, which categories, quiet hours.
- Messages are built from templates ("Your order {{order_id}} is on the way").
- Two priorities: **high** (login codes, payment alerts) and **normal** (offers, reminders).
- Senders can ask for the status of a notification.

**Non-functional**

- A high-priority message leaves our system within a few seconds.
- No duplicates for the same event. No message silently dropped.
- A campaign to millions of users must not hurt urgent messages.
- A failing provider must not stop the other channels.

**Out of scope:** writing campaign content, choosing which users to target.

A **provider** is the outside company or gateway that actually delivers the message: a push service for phones, an SMS gateway, an email service.

## 2. Estimates

```text
DAU                 = 50,000,000
Per user per day    = 6 notifications (assumed)
Total per day       = 50,000,000 x 6 = 300,000,000
Average rate        = 300,000,000 / 86,400 = 3,472 -> about 3,500 / s

Campaign burst      = 20,000,000 users in 10 minutes
                    = 20,000,000 / 600 s = 33,333 -> about 33,000 / s
                    (almost 10 times the average)

Log row             = 500 bytes
Log per day         = 300,000,000 x 500 B = 150,000,000,000 B = 150 GB
Kept 90 days        = 150 GB x 90 = 13,500 GB = 13.5 TB

One worker sends    = 200 per second (assumed; it mostly waits on network)
Workers for burst   = 33,333 / 200 = 167
Workers for average = 3,472 / 200 = 17.4 -> about 18
```

**What the numbers say:** the average is easy, and the bursts are ten times larger. We should not run 167 workers all day. A queue absorbs the burst, and the worker pool grows when the queue is long. Urgent traffic needs its own lane so that it never waits in that queue.

## 3. API

```text
POST /v1/notifications
  body: {
    idempotency_key: "order-9001-shipped",
    user_id: 42,
    template: "order_shipped",
    data: { order_id: 9001 },
    category: "orders",
    priority: "normal"
  }
  202:  { notification_id, status: "queued" }

GET /v1/notifications/{notification_id}
  200:  { status: "sent", channel: "push", attempts: 1 }

PUT /v1/users/{user_id}/preferences
  body: { category: "offers", push: false, sms: false, email: true,
          quiet_start: 22, quiet_end: 7 }
```

`202 Accepted` means "we saved your request and will work on it". The caller does not wait for the SMS to be sent.

## 4. Data model

```sql
CREATE TABLE notifications (
    id          BIGINT PRIMARY KEY,
    idem_key    TEXT   NOT NULL UNIQUE,      -- stops duplicates
    user_id     BIGINT NOT NULL,
    template    TEXT   NOT NULL,
    category    TEXT   NOT NULL,
    priority    TEXT   NOT NULL,             -- high or normal
    channel     TEXT,                        -- chosen later by a worker
    status      TEXT   NOT NULL DEFAULT 'queued',
    attempts    INT    NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at     TIMESTAMPTZ
);

CREATE TABLE preferences (
    user_id     BIGINT NOT NULL,
    category    TEXT   NOT NULL,
    push_on     BOOLEAN NOT NULL DEFAULT true,
    sms_on      BOOLEAN NOT NULL DEFAULT true,
    email_on    BOOLEAN NOT NULL DEFAULT true,
    quiet_start INT,                         -- hour of day, 0 to 23
    quiet_end   INT,
    PRIMARY KEY (user_id, category)
);

CREATE TABLE device_tokens (
    token       TEXT PRIMARY KEY,            -- address of one phone
    user_id     BIGINT NOT NULL,
    platform    TEXT   NOT NULL,             -- android or ios
    last_seen   TIMESTAMPTZ NOT NULL
);
```

A **device token** is the address that a push provider gives to one installed app on one phone. One user can have several.

## 5. High-level design

:::flow From request to phone
Order service | POST notification
Notification API | dedupe, save, enqueue
Priority queues | high and normal lanes
Channel workers | preferences, template, limits
Provider | push, SMS or email
:::

:::flow What happens after sending
Provider reply | ok, retry or invalid
Status update | saved in the log
Retry queue | backoff with jitter
Dead letter queue | after 5 attempts
:::

## 6. Deep dives

### No duplicates

Duplicates can enter at two places: the caller retries its request, and our own queue delivers a message twice. One key protects both.

```sql
-- Accepting a request: the unique key makes the second insert do nothing.
INSERT INTO notifications
    (id, idem_key, user_id, template, category, priority)
VALUES
    (7001, 'order-9001-shipped', 42, 'order_shipped', 'orders', 'normal')
ON CONFLICT (idem_key) DO NOTHING
RETURNING id;        -- no row returned means: we already have it

-- A worker claims the job. Only one worker can win this update.
UPDATE notifications
SET status = 'sending', attempts = attempts + 1
WHERE id = 7001 AND status IN ('queued', 'retry')
RETURNING id;
```

The row and the queue message are written with the outbox pattern, so a saved request is always queued.

### Urgent messages never wait

One shared queue is the classic failure: a campaign puts 20 million messages in it and a login code waits behind them for ten minutes. So we use separate queues and separate worker pools per priority, and also per channel.

| Lane | Example | Workers | Rule |
|---|---|---|---|
| High | Login code, payment alert | Always running, with spare capacity | Skips quiet hours and marketing caps |
| Normal | Order update, reminder | Grows with queue length | Respects preferences |
| Bulk | Campaigns | Limited rate on purpose | Sent slowly; can be paused |

Separate queues per channel mean that a slow SMS provider fills only the SMS queue. Push and email keep flowing. This is the bulkhead idea from the reliability chapter.

### Preferences, quiet hours and caps

Before sending, a worker checks three things: has the user turned this off, is it quiet time for them, and have they already received too many messages today? The last check is a per-user rate limiter.

```python
def in_quiet_hours(hour, start=22, end=7):
    # quiet from 22:00 to 07:00: the window crosses midnight
    if start <= end:
        return start <= hour < end
    return hour >= start or hour < end

def decide(msg, pref, hour, sent_today, daily_cap=5):
    if msg["priority"] == "high":
        return "send"                       # urgent: always goes out
    if not pref.get(msg["channel"], True):
        return "skip"                       # the user turned it off
    if in_quiet_hours(hour, pref["quiet_start"], pref["quiet_end"]):
        return "delay"                      # hold until quiet time ends
    if sent_today >= daily_cap:
        return "drop"                       # too many today
    return "send"
```

:::example Dry run of decide
Preferences: `{"push": True, "sms": False, "quiet_start": 22, "quiet_end": 7}`.

| Message | Hour | Sent today | Result | Why |
|---|---|---|---|---|
| normal, push | 15 | 2 | send | Allowed, daytime, under the cap |
| normal, sms | 15 | 2 | skip | SMS is turned off |
| normal, push | 23 | 2 | delay | 23 is inside 22 to 7 |
| normal, push | 15 | 5 | drop | The daily cap is reached |
| high, sms | 23 | 9 | send | Urgent messages skip the checks |
:::

### When a provider fails

| Provider answer | Meaning | Action |
|---|---|---|
| Success | Accepted for delivery | Mark `sent` |
| Timeout or server error | Unknown or temporary | Retry with backoff and jitter, up to 5 times |
| Rate limited | We are too fast | Slow this channel's workers |
| Invalid token or address | Will never work | Mark `failed`, delete the token |
| Many failures in a row | Provider is down | Circuit breaker opens; switch to a backup provider or channel |

:::warn A timeout is not a failure
If the SMS provider times out, the message may still have been sent. Retrying can deliver the same login code twice. That is acceptable for a login code and annoying for a payment alert. Where the provider supports it, pass your own reference ID with each send so that the provider can drop repeats. Where it does not, keep retries few for messages in which a duplicate is worse than a small delay, and say this trade-off aloud.
:::

### Campaigns

A campaign for 20 million users is not sent as 20 million API calls. A campaign job walks the user list in batches of a few thousand and puts messages in the bulk lane at a controlled rate. The rate is set by what the providers allow and what our own systems can take when users tap the notification and open the app.

## 7. Trade-offs and failure cases

| Decision | Gain | Cost |
|---|---|---|
| Accept with 202 and a queue | Callers are fast and decoupled | Delivery is asynchronous; status must be polled |
| Unique idempotency key | No duplicate events | Callers must build stable keys |
| Queues per priority and channel | Urgent traffic is isolated | More queues and worker pools to run |
| At-least-once with retries | Nothing dropped silently | Rare duplicates at the provider edge |
| Daily cap per user | Fewer annoyed users | Some normal messages are never sent |

- **Queue backlog:** alert on the age of the oldest message in each lane, not only on the length.
- **Stale device tokens:** remove tokens the provider reports as invalid, and tokens not seen for many months.
- **Database slow:** the API cannot accept new requests safely, so it returns an error and callers retry with the same key. Nothing is lost and nothing is doubled.

:::interview A campaign to 20 million users starts at 6 pm. How do you make sure login codes still arrive in seconds?
"Isolation at every step. Login codes go to a high-priority queue with its own workers that always have spare capacity. The campaign goes to a bulk queue with a rate limit, so it is spread over many minutes instead of hitting at once. Channels are also separate, so even if the campaign fills the push pipeline, the SMS workers for codes are untouched. At the provider edge I keep separate rate budgets, so that the campaign cannot use up the sending quota that codes need. I would also add a pause switch for the campaign, and an alert on the age of the oldest high-priority message. If that age goes above a few seconds, the bulk lane is slowed down automatically."
:::

:::revise
- Accept requests quickly with 202, save them, and do the sending from queues.
- A unique idempotency key stops duplicates from caller retries and queue redelivery.
- Separate lanes per priority and per channel keep urgent messages fast and isolate slow providers.
- Workers check preferences, quiet hours and a per-user cap before sending.
- Retry temporary provider errors with backoff; delete invalid tokens; use a dead letter queue.
- A provider timeout means "unknown", so duplicates at that edge are a trade-off to state.
:::

# Worked design: ride matching

*Finding the nearest free driver from a stream of moving locations, and never giving one driver two rides.*

## Why this question

At an auto stand, matching is easy. You walk up, and the first free auto takes you. Now imagine that the autos are spread over a whole city and moving, thousands of people ask at the same moment, and nobody can see anybody.

A ride-matching system must answer "who is near this point right now?" from data that changes every few seconds. It must also make sure that two riders are never promised the same driver. The first part is a location problem. The second is a consistency problem.

## 1. Requirements

**Functional**

- Drivers who are online send their location every few seconds.
- A rider requests a ride from a pickup point to a drop point.
- The system offers the ride to a nearby free driver, who has 15 seconds to accept. If they decline or do not answer, the next driver is asked.
- Rider and driver both see the trip status: requested, matched, arriving, in trip, completed, cancelled.

**Non-functional**

- A match is found within a few seconds when drivers are nearby.
- Driver locations used for matching are at most about 5 seconds old.
- A driver never has two active rides. A ride never has two drivers.
- A problem in one city does not affect other cities.

**Out of scope:** pricing, payments, route planning and maps, ratings.

## 2. Estimates

```text
Drivers online at peak = 1,000,000
Location interval      = one update every 4 seconds
Location updates       = 1,000,000 / 4 = 250,000 per second
Update size            = 50 bytes
Ingress                = 250,000 x 50 B = 12,500,000 B/s = 12.5 MB/s

Latest location memory = 1,000,000 drivers x 100 B = 100 MB

Rides per day          = 10,000,000
Average request rate   = 10,000,000 / 86,400 = 116 per second
Peak (x 5, rush hour)  = 580 per second

Ride row               = 1 KB
Ride storage per day   = 10,000,000 x 1 KB = 10 GB
Ride storage per year  = 10 GB x 365 = 3,650 GB = 3.65 TB

If every location ping were stored at the peak rate all day:
  250,000 x 86,400 = 21,600,000,000 pings per day
  21,600,000,000 x 50 B = 1,080,000,000,000 B = about 1.08 TB per day
```

**What the numbers say:** there are two very different workloads. Locations are a flood of 250,000 writes per second, but only the latest value matters, and that is just 100 MB. This belongs in memory. Rides are only a few hundred per second but must be exactly right. This belongs in a SQL database with transactions.

## 3. API

```text
Driver app (over a WebSocket)
  { type: "location", lat, lng, ts }             every 4 seconds
  { type: "offer_reply", ride_id, accept: true }

Rider app
  POST /v1/rides
    body: { idempotency_key, pickup: {lat, lng}, drop: {lat, lng} }
    202:  { ride_id, status: "requested" }

  GET  /v1/rides/{ride_id}
    200:  { status: "matched", driver: {...}, driver_location: {...} }

  POST /v1/rides/{ride_id}/cancel
```

## 4. Data model

```sql
CREATE TABLE rides (
    id            BIGINT PRIMARY KEY,
    idem_key      TEXT   NOT NULL UNIQUE,
    rider_id      BIGINT NOT NULL,
    driver_id     BIGINT,                    -- NULL until matched
    status        TEXT   NOT NULL DEFAULT 'requested',
    pickup_lat    DOUBLE PRECISION NOT NULL,
    pickup_lng    DOUBLE PRECISION NOT NULL,
    drop_lat      DOUBLE PRECISION NOT NULL,
    drop_lng      DOUBLE PRECISION NOT NULL,
    requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    matched_at    TIMESTAMPTZ
);

-- The database itself refuses a second active ride for one driver.
CREATE UNIQUE INDEX one_active_ride_per_driver
    ON rides (driver_id)
    WHERE status IN ('matched', 'arriving', 'in_trip');
```

The last statement is a **partial unique index**: a uniqueness rule that applies only to rows that match the `WHERE` condition. A driver can have many completed rides, but only one active ride.

Driver locations are not in this database. They live in an in-memory location index, with a TTL so that a driver who stops sending updates disappears.

## 5. High-level design

:::flow Location path
Driver app | location every 4 s
Gateway | holds the connection
Location service | updates the index
Location index | in memory, per city
Stream | history for analytics
:::

:::flow Matching path
Rider app | POST /v1/rides
Ride service | saves the ride
Matcher | asks for nearby drivers
Driver app | gets a 15 s offer
Ride service | confirms in SQL
:::

## 6. Deep dives

### Finding nearby drivers

Checking the distance to one million drivers for every request is far too slow. The standard idea is to cut the map into **cells**, like the squares of a chessboard, and remember which drivers are in each cell. A search then looks only at the rider's cell and the cells around it.

```python
import math
from collections import defaultdict

CELL = 0.01                     # degrees; about 1.1 km of latitude

def cell_of(lat, lng):
    return (math.floor(lat / CELL), math.floor(lng / CELL))

def distance_km(lat1, lng1, lat2, lng2):
    # haversine formula: distance between two points on the Earth
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lng2 - lng1)
    a = math.sin((p2 - p1) / 2) ** 2 \
        + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(a))
```

```python
class DriverIndex:
    def __init__(self):
        self.cells = defaultdict(set)   # cell -> IDs of free drivers
        self.where = {}                 # driver ID -> (lat, lng)

    def update(self, driver_id, lat, lng):
        old = self.where.get(driver_id)
        if old:                         # leave the old cell first
            self.cells[cell_of(*old)].discard(driver_id)
        self.where[driver_id] = (lat, lng)
        self.cells[cell_of(lat, lng)].add(driver_id)

    def nearby(self, lat, lng, k=3):
        cx, cy = cell_of(lat, lng)
        found = []
        for dx in (-1, 0, 1):           # the cell and its 8 neighbours
            for dy in (-1, 0, 1):
                for d in self.cells.get((cx + dx, cy + dy), ()):
                    dist = distance_km(lat, lng, *self.where[d])
                    found.append((round(dist, 2), d))
        return sorted(found)[:k]        # nearest first
```

:::example Dry run near Connaught Place, Delhi
```python
index = DriverIndex()
index.update("d1", 28.6315, 77.2167)
index.update("d2", 28.6400, 77.2200)
index.update("d3", 28.7000, 77.1000)      # far away
print(index.nearby(28.6320, 77.2170))
# [(0.06, 'd1'), (0.94, 'd2')]
```

The rider's cell is `(2863, 7721)`. Driver `d1` is in the same cell and `d2` is in a neighbouring cell, so both are found. Driver `d3` is many cells away and is never even looked at. That is the whole point: the search cost depends on how many drivers are nearby, not on how many exist.
:::

One degree of latitude is about 111 km, so a cell of 0.01 degrees is about 1.1 km from north to south. A degree of longitude gets shorter as you move away from the equator, so these cells are not perfect squares. Real systems use a ready-made scheme: a **geohash** (a short string that names a cell, where nearby places usually share a prefix), a **quadtree** (cells that split into four when they get crowded), or the geo commands of an in-memory store. If the first ring of cells has no drivers, widen the search ring by ring.

### Never double-book a driver

Two riders can request at the same instant with the same driver nearest to both. We use two layers of protection.

**Layer 1: a short lock while offering.** Before sending an offer, the matcher takes a lock on the driver in the in-memory store with "set if not exists" and a 20-second TTL. If the lock is taken, the matcher moves to the next driver. If the driver ignores the offer, the lock expires on its own.

```python
def match(ride, index, try_lock, offer):
    candidates = index.nearby(ride["lat"], ride["lng"], k=5)
    for dist, driver_id in candidates:
        if not try_lock(driver_id, ride["id"]):   # busy with an offer
            continue
        if offer(driver_id, ride):                # True if accepted in time
            return driver_id
        # declined or timed out: the lock expires; try the next driver
    return None
```

**Layer 2: the database decides.** When a driver accepts, the ride service runs one statement. It succeeds only if the ride is still waiting. And the partial unique index rejects it if this driver already has an active ride.

```sql
UPDATE rides
SET driver_id = 501, status = 'matched', matched_at = now()
WHERE id = 9001 AND status = 'requested';
-- 1 row updated: the match is confirmed.
-- 0 rows updated: the ride was cancelled or already matched.
-- Unique index error: driver 501 already has an active ride.
```

The lock is for speed and a good experience. The database constraint is the guarantee. Even if the lock store loses data, the wrong result cannot be saved.

### The trip as a state machine

A **state machine** is a fixed list of states and the allowed moves between them. Every update names the state it expects, as in the SQL above, so a late or repeated message cannot move a ride backwards.

| From | Allowed next states |
|---|---|
| requested | matched, cancelled |
| matched | arriving, cancelled |
| arriving | in_trip, cancelled |
| in_trip | completed |

### Splitting by city

A rider in Pune never needs a driver in Jaipur. So the location index and the matcher are partitioned by city or region. Each region is small enough to fit in memory, and a failure stays local. Rides near a border between two cells or regions are handled by searching the neighbours as well.

:::warn Writing every location ping to the main database
250,000 updates per second into a SQL table would bury it, and nobody ever reads a driver's position from 3 minutes ago to make a match. Keep only the latest position in memory with a TTL. If history is needed for analytics or disputes, send the pings to a stream and let a separate pipeline store them in cheap storage, often sampled.
:::

## 7. Trade-offs and failure cases

| Decision | Gain | Cost |
|---|---|---|
| Locations in memory only | Handles 250,000 updates per second | Index is lost on a crash and refills within seconds |
| Fixed grid cells | Simple and fast | Crowded cells in city centres, empty ones outside |
| Offer to one driver at a time | No wasted acceptances | Slower when drivers decline |
| Lock plus database constraint | Fast path and a hard guarantee | Two mechanisms to maintain |
| Partition by city | Small indexes, local failures | Extra care at region borders |

- **Location service restarts:** the index is empty, but every driver sends a new location within 4 seconds, so it rebuilds itself.
- **Driver's phone goes silent:** the TTL removes the driver from the index, so no offers are sent to a dead phone.
- **Rider retries the request:** the `idem_key` returns the existing ride instead of creating a second one.
- **No driver accepts:** widen the search, then tell the rider honestly that no driver is available.

:::interview Two riders request a ride at the same moment and the same driver is the nearest for both. What happens?
"Both matchers find the same driver and try to take a short lock on that driver in the in-memory store, using set-if-not-exists. Only one succeeds. That matcher sends the offer. The other matcher sees the lock and moves to its next nearest driver, so the second rider loses almost no time. When the driver accepts, the ride service runs an update that sets the driver on the ride only if the ride is still in the requested state. A partial unique index allows only one active ride per driver. So even if the lock expired early or the lock store failed, the second assignment would be rejected by the database, and that matcher would continue with another driver. The lock gives speed. The constraint gives correctness."
:::

:::revise
- Two workloads: a flood of locations (memory, latest value only) and a few exact rides (SQL).
- Cut the map into cells and search only the rider's cell and its neighbours.
- A TTL on each location removes drivers who stop sending updates.
- Use a short lock per driver while an offer is open, so two matchers do not ask the same driver.
- A partial unique index allows only one active ride per driver: the database is the final guard.
- Model the trip as a state machine and check the expected state in every update.
:::

# One-page cheat sheet, questions and study plan

*Everything worth remembering on a few pages, a set of practice questions, and a four-week plan.*

## How to use this chapter

A pilot does not start an aircraft from memory. There is a short checklist, and the pilot reads it every single time. It prevents the simple mistakes that happen under stress. This chapter is your checklist. Read it the evening before an interview, and again one hour before.

## The framework

```text
1. Requirements   5 min   functional, non-functional, out of scope
2. Estimation     5 min   QPS, storage, bandwidth, read : write
3. API            4 min   3 to 6 endpoints, pagination, idempotency key
4. Data model     5 min   entities, keys, main queries, database choice
5. High level    10 min   one write path, one read path
6. Deep dives    12 min   2 or 3 hard parts, chosen with the interviewer
7. Trade-offs     4 min   gains, costs, what breaks first at 10x
```

## Formulas

```text
Average QPS    = DAU x actions per user per day / 86,400
Peak QPS       = average x 2 to 3
Storage        = writes per day x item size x 365 x years x copies
Bandwidth      = QPS x payload size          (x 8 for bits)
Servers        = peak QPS / QPS per server   (+ 30 to 40% spare)
Cache latency  = hit x cache + miss x (cache + database)
Quorum         = R + W > N
Series         = A1 x A2 x A3
Parallel       = 1 - (1 - A)^n
Downtime       = (1 - A) x 525,600 minutes per year
Shards         = total data / data per shard
Partitions     = peak messages per second / rate of one consumer
```

## Numbers

| Fact | Value |
|---|---|
| Seconds in a day | 86,400 (round to 10^5) |
| Seconds in a year | about 31.5 million |
| 1 million per day | about 12 per second |
| 1 billion per day | about 11,600 per second |
| 1 million x 1 KB | 1 GB |
| 1 billion x 1 KB | 1 TB |
| 2^32 | about 4.3 billion |
| 62^7 | about 3.5 trillion |
| 99.9% | 8.76 hours down per year, 43.2 minutes per 30 days |
| 99.99% | 52.56 minutes down per year |
| Snowflake-style ID | 41 bits time (about 69.7 years), 10 machine, 12 sequence |
| Redis Cluster | 16,384 hash slots |

```python
def estimate(dau, actions_per_day, item_bytes, years=5, copies=3):
    per_day = dau * actions_per_day
    return {
        "avg_qps": round(per_day / 86_400),
        "peak_qps": round(per_day / 86_400 * 3),
        "gb_per_day": per_day * item_bytes / 1e9,
        "tb_total": per_day * item_bytes * 365 * years * copies / 1e12,
    }

print(estimate(10_000_000, 5, 1_000))
# {'avg_qps': 579, 'peak_qps': 1736, 'gb_per_day': 50.0,
#  'tb_total': 273.75}
```

Check by hand: 10 million x 5 = 50 million a day. 50,000,000 / 86,400 = 579 per second. 50 million x 1 KB = 50 GB a day. 50 GB x 365 x 5 x 3 = 273,750 GB = 273.75 TB.

## From requirement to decision

| When you hear | Reach for | Say the cost |
|---|---|---|
| "Read-heavy" | Cache-aside, read replicas, CDN | Stale data for a short time |
| "Write-heavy" | Queue in front, sharding, LSM-based store | Asynchronous results, harder queries |
| "Must not lose money or seats" | SQL transaction, unique constraint | Lower availability during failures |
| "Must always respond" | Replicas, eventual consistency, fallbacks | Readers may see old data |
| "Spiky traffic" | Queue as buffer, autoscaling, rate limits | Work finishes later |
| "Global users" | CDN, regional deployments | Cross-region consistency is hard |
| "Real-time" | WebSocket gateways, pub/sub | Stateful servers |
| "Large files" | Blob storage, pre-signed URLs, CDN | A two-step upload flow |
| "Find by text" | Inverted index in a search engine | A delayed copy of the data |
| "Find by location" | Grid cells, geohash or quadtree | Edge cases at cell borders |
| "Exactly once" | At-least-once plus idempotency key | A de-duplication record |
| "Two services must agree" | Outbox, then saga with compensation | Half-finished states are visible |

## Which option, quickly

| Choice | Pick the first when | Pick the second when |
|---|---|---|
| SQL or NoSQL | Transactions, joins, flexible queries | Huge volume with simple key access |
| Push or pull fan-out | Normal follower counts, read-heavy | Huge follower counts |
| Queue or stream | Tasks, per-message retry | Many readers, replay, ordering by key |
| Token bucket or sliding window | Bursts are acceptable | A strict count per window |
| Sync or async replication | No data loss allowed | Speed matters more |
| Range or hash sharding | Range scans are needed | An even spread is needed |
| 301 or 302 | Lowest load | Accurate click tracking |

## Sentences that show trade-off thinking

- "I am assuming X. If that is wrong, the part that changes is Y."
- "This is the simplest design that meets the numbers. At ten times the load, the first thing to break is the database write path, and I would shard by user ID."
- "For the feed I accept data that is a few seconds old. For payments I do not."
- "This cache is an optimisation, not the source of truth. If it is lost, we are slower, not wrong."
- "A timeout means unknown, not failed, so this call carries an idempotency key."

:::warn Reciting a memorised design
Interviewers change one requirement on purpose: "now messages must be deleted after 24 hours", "now it must work in three regions". A candidate who memorised a diagram gets stuck. A candidate who knows why each box is there changes one box and moves on. For every part of every worked design in this book, practise completing this sentence: "This box is here because of the requirement that ..."
:::

## Practice questions with short answers

Cover the right column and answer aloud. Then compare.

| Question | Short answer |
|---|---|
| Why make servers stateless? | Any server can take any request, so scaling and failover are easy |
| Cache-aside write order? | Update the database, then delete the cache key |
| What causes a cache stampede? | A hot key expires and many requests rebuild it together |
| Why not `hash mod N` for cache servers? | Changing N moves almost every key |
| What do virtual nodes fix? | Uneven shares on the hash ring |
| What does `R + W > N` give? | Every read overlaps the latest confirmed write |
| CAP in one line? | In a partition, choose between consistency and availability |
| What does PACELC add? | Without a partition, you trade latency against consistency |
| Why are Kafka partitions important? | Order is kept per partition, and they limit parallel consumers |

Now the second half: messaging, reliability and data.

| Question | Short answer |
|---|---|
| How to get an exactly-once effect? | At-least-once delivery with an idempotent consumer |
| What problem does the outbox solve? | Saving data and publishing an event without a dual write |
| What is a compensating action? | A step that undoes an earlier saga step |
| Why add jitter to retries? | So that clients do not all retry at the same instant |
| What does an open circuit breaker do? | Fails fast with a fallback instead of calling a sick service |
| Three services at 99.9% in series? | About 99.7% |
| Two servers at 99% in parallel? | 99.99%, if they fail independently |
| Why are time-sorted IDs useful? | Sorting by ID is sorting by time; index inserts stay together |
| Why keyset pagination? | Deep `OFFSET` scans and throws away rows |
| Where do uploaded files go? | Blob storage, through a pre-signed URL; metadata in the database |
| How to stop double booking? | One atomic update guarded by a unique constraint |

:::example Closing an interview in 60 seconds
"To summarise: writes go through the API to the SQL database, and an outbox event feeds the stream. Workers fan out to the cache, and reads are served from the cache with the database as fallback. The main trade-off is that feeds are a few seconds behind in exchange for fast reads. The weakest point today is the single database leader. I would add a synchronous standby first, then shard by user ID when writes grow. With more time I would detail monitoring: latency, error rate, cache hit ratio and consumer lag."

Four sentences: the path, the trade-off, the weakest point, the next step. Practise this ending for every design.
:::

:::interview What would you monitor in the system you just designed?
"I start with what users feel. Request rate, error rate and latency at the 50th and 99th percentile for each endpoint. Then the health of each building block: cache hit ratio and evictions, database replication lag and slow queries, queue length and the age of the oldest message, consumer lag on streams, and the dead letter queue size. For reliability: the count of timeouts and retries, and the state of each circuit breaker. Finally capacity: CPU, memory, disk and connection counts, with alerts well before the limit. I would alert on symptoms that users notice, like the error rate, and keep the rest on dashboards for finding the cause."
:::

:::interview Your design works for one region. The interviewer asks for three regions. What changes?
"First I ask what the goal is: lower latency for far-away users, or surviving the loss of a region? For latency, the cheap step is a CDN, plus read replicas and caches in each region, with writes still going to one primary region. Reads become local and slightly stale. Writes from far away stay slow. If writes must also be local, or the system must survive losing the primary, I need more than one writing region. Then I must decide what happens when two regions change the same record. Where possible I avoid the conflict by giving each user a home region that owns their data. Strongly consistent data such as payments stays in a single-leader setup with a synchronous standby in another region, and I accept the extra write latency. Throughout, I state the PACELC trade-off: every step toward local writes costs some consistency."
:::

## A four-week study plan

One to one and a half hours a day is enough. Speaking aloud matters more than reading.

| Week | Read | Practise |
|---|---|---|
| 1 | Chapters 1 to 4: framework, estimation, load balancing, caching | Each day, estimate one app you use: QPS, storage, bandwidth. Write the arithmetic out |
| 2 | Chapters 5 to 7: databases, sharding, consistency and quorum | Type the hash ring and the quorum code. Explain CAP to a friend with your own example |
| 3 | Chapters 8 to 10: queues, rate limiters, IDs, reliability | Write the token bucket and circuit breaker from memory. Work out three availability sums |
| 4 | Chapters 11 to 15: the five worked designs | One design a day, 45 minutes on a timer, on paper, speaking aloud. Then compare with the chapter |

In the last three days, do not learn anything new. Repeat two designs on a timer, and read only the revision boxes and this chapter.

**The day before**

- Recite the seven steps and the time budget.
- Redo one estimation by hand.
- Draw one design from memory and say one trade-off for each box.
- Sleep. A fresh mind handles a surprise requirement far better than a tired one.

:::tip
Record yourself answering one design question on your phone and listen to it. You will notice long silences, missing reasons and skipped steps that you cannot notice while speaking. Two recordings improve your structure more than ten more hours of reading.
:::

:::revise
- Follow the seven steps with a time budget, and announce each step.
- Do the maths, then say what the number means for the design.
- For each requirement, name the building block and its cost.
- At-least-once plus idempotency, outbox instead of dual writes, constraints as the final guard.
- For every box ask: what if it is slow, and what if it dies?
- Close with the path, the main trade-off, the weakest point and the next step.
:::
