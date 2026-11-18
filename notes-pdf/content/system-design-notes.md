---
title: System Design Notes
subtitle: System design from first principles to interview-ready answers, in simple English, with diagrams, checked estimates and four full case studies.
category: System Design
level: All Levels
accent: rose
tags: system-design, scalability, caching, sharding, interview
highlights: Interview Framework | Estimation Math | Caching | Replication & Sharding | Queues & Reliability | 4 Case Studies
tagline: Interview Framework • Estimation • Caching & Sharding • 4 Case Studies
description: Learn how large systems are built, one building block at a time: load balancers, caches, databases, replication, sharding, queues and reliability patterns. Then use a fixed seven-step framework to design a URL shortener, a rate limiter, a news feed and a chat app the way an interviewer expects. Every chapter has interview questions with model answers and a one-minute revision box, with diagrams and tables throughout.
---

# What system design is and how to answer it

*A fixed seven-step plan that turns a vague question like "design a chat app" into a clear, organised answer.*

## Why this matters

Think about building a house. Nobody starts by laying bricks. First you ask: how many people will live here? How many floors? What is the budget? Then you draw a plan. Only then do you build.

**System design** is the same thing for software. It is the plan of a system: which parts it has, how they talk to each other, where the data lives, and what happens when the number of users grows or a machine breaks.

In a coding interview there is one correct answer. In a system design interview there is **no single correct answer**. The interviewer wants to see how you think:

- Do you ask questions before you build?
- Do you know the common building blocks (cache, queue, database, load balancer)?
- Can you explain **trade-offs**? A trade-off means you gain one thing and lose another, for example faster reads but more memory.
- Can you find the weak points of your own design?

## Two kinds of requirements

| Kind | Meaning | Example for a chat app |
|---|---|---|
| **Functional** | What the system does | Send a message, see online status |
| **Non-functional** | How well it does it | Message arrives in under 1 second, no message is lost |

Common non-functional words you must know:

| Word | Plain meaning |
|---|---|
| **Scalability** | The system keeps working when users grow 10 times |
| **Availability** | The system is up and answering when users need it |
| **Reliability** | The system does the right thing and does not lose data |
| **Latency** | How long one request takes, usually in milliseconds (ms) |
| **Throughput** | How many requests the system handles per second |
| **Consistency** | Every user sees the same, latest data |
| **Durability** | Saved data stays saved, even after a crash |

## The seven-step framework

Use the same steps for every question. The times are a guide for a 45 minute interview.

| Step | What you do | Time |
|---|---|---|
| 1. Requirements | Ask questions. List functional and non-functional needs. Say what is out of scope | 5 min |
| 2. Estimates | Rough numbers: users, requests per second, storage | 5 min |
| 3. API | The main endpoints with inputs and outputs | 5 min |
| 4. Data model | Main tables or collections, keys, SQL or NoSQL | 5 min |
| 5. High-level design | Boxes and arrows from client to database | 10 min |
| 6. Deep dives | Pick 2 or 3 hard parts and go deeper | 10 min |
| 7. Trade-offs | Bottlenecks, failures, what you would improve | 5 min |

:::flow The framework at a glance
Requirements | what and how well
Estimates | how big
API | how clients call it
Data model | what we store
High-level design | boxes and arrows
Deep dives and trade-offs | hard parts, failures
:::

### Step 1: Requirements

Never start drawing at once. Ask first. Good questions are:

- Who are the users, and how many use it each day?
- What are the two or three most important features?
- Does it read more or write more?
- How fast must it be? Is it fine if data is a few seconds old?
- Is it used in one country or worldwide?

:::example Clarifying "Design a URL shortener"
**You:** Should users be able to choose their own short link, or do we only generate it?
**Interviewer:** Only generated links for now.
**You:** Do links expire?
**Interviewer:** Assume they live for 5 years.
**You:** How many new links per month?
**Interviewer:** About 100 million.
**You:** Then I will focus on two features: create a short link, and redirect a short link to the long one. Analytics and user accounts are out of scope.

In one minute you made the problem small and clear.
:::

### Step 2: Estimates

Do simple maths to know the size of the problem. A system for 1,000 users and a system for 100 million users look very different. The next chapter teaches this fully.

### Step 3: API

Write the main calls the client makes. Keep it short.

```text
POST /api/v1/urls        body: { longUrl }      -> { shortUrl }
GET  /{shortCode}        -> 302 redirect to the long URL
```

### Step 4: Data model

List the main things you store (users, posts, messages) and their important fields. Say how you will look the data up, because the **access pattern** (how the data is read and written) decides the database and the key.

### Step 5: High-level design

Draw the path of one request from the user to the data and back. Start simple: client, load balancer, app servers, database. Then add a cache, a queue or other parts only when a requirement needs them.

### Step 6: Deep dives

The interviewer usually picks an area. If they do not, you pick the riskiest part. Examples: "How do we generate unique IDs?", "What if one database server gets too much traffic?", "What if the cache goes down?"

### Step 7: Trade-offs and wrap-up

Finish by saying what can break, what you chose and what you gave up. This shows maturity.

:::warn
The most common mistake is to jump to the solution in the first minute: "I will use Kafka and Redis and Cassandra". Tools are not a design. First say **what** the system needs, then pick each tool **because** of a requirement.
:::

:::tip
Speak while you think. Say "I am choosing X because of Y. The cost is Z." A silent candidate with a perfect diagram often scores lower than a talking candidate with a simple one.
:::

:::interview How do you approach a system design question?
I follow fixed steps. First I clarify the functional and non-functional requirements and agree on the scope. Second, I estimate the scale: requests per second and storage. Third, I define the main APIs and the data model. Then I draw a simple high-level design and walk through one read and one write request. After that I go deep into the two or three hardest parts, such as scaling the database or handling failures. I end with the trade-offs and what I would improve with more time.
:::

:::revise
- System design is a plan: parts, connections, data, growth and failure.
- Functional = what it does. Non-functional = how well (speed, uptime, scale).
- Seven steps: requirements, estimates, API, data model, high-level design, deep dives, trade-offs.
- Ask questions and fix the scope before you draw anything.
- Every choice needs a reason and a cost. That is a trade-off.
:::

# Back-of-the-envelope estimation

*Quick, rough maths that tells you how big the system is before you design it.*

## Why this matters

Before a wedding, the cook asks one question first: how many guests? For 50 guests one kitchen is enough. For 5,000 guests you need many cooks, many stoves and a plan.

**Back-of-the-envelope estimation** means rough maths you could do on the back of an envelope. You do not need exact numbers. You need the **order of magnitude**: is it 10 requests per second, or 10,000, or 10 million? Each level needs a different design.

## Numbers to remember

### Powers of two (data sizes)

| Power | Rough value | Name |
|---|---|---|
| 2^10 | 1 thousand | 1 kilobyte (KB) |
| 2^20 | 1 million | 1 megabyte (MB) |
| 2^30 | 1 billion | 1 gigabyte (GB) |
| 2^40 | 1 trillion | 1 terabyte (TB) |
| 2^50 | 1 thousand trillion | 1 petabyte (PB) |

So 1 TB is 1,000 GB and 1 PB is 1,000 TB. In estimates we round 1,024 to 1,000.

### Typical sizes (rough)

| Item | Rough size |
|---|---|
| One character (plain English) | 1 byte |
| An ID or a timestamp | 8 bytes |
| A short text post with its fields | a few hundred bytes |
| A compressed photo | a few hundred KB |
| One minute of compressed video | several MB to tens of MB |

### Time shortcuts

- 1 day = 24 x 60 x 60 = **86,400 seconds**. Round it to **100,000** (10^5) for easy maths.
- So **1 million requests per day is about 12 per second** (1,000,000 / 86,400 = 11.6).
- 1 month is about 2.5 million seconds. 1 year is about 31.5 million seconds.

### Latency numbers (orders of magnitude only)

These are **rough** numbers. Real values change with hardware and network. What matters is the big gap between the rows.

| Operation | Rough time | If a memory read took 1 second |
|---|---|---|
| Read from memory (RAM) | about 100 nanoseconds | 1 second |
| Random read from an SSD | about 100 microseconds | about 17 minutes |
| Round trip inside one data center | about 0.5 ms | about 1.4 hours |
| Seek on a spinning hard disk | about 10 ms | more than a day |
| Round trip between continents | about 150 ms | about 17 days |

What to learn from this table:

- **Memory is very fast, disk is slower, network across the world is slowest.** This is why we cache in memory.
- A call to another server in the same data center costs about a millisecond. Ten calls one after another cost ten times more. Avoid long chains of calls.
- Users far away feel slow responses. This is why we use a CDN and more than one region.

## The three formulas

**QPS** means queries per second, that is, requests per second.

```text
QPS            = daily active users x requests per user per day / 86,400
Peak QPS       = average QPS x 2   (or more; say your assumption)
Storage / day  = new items per day x size of one item
Bandwidth      = requests per second x size of one response
```

**DAU** means daily active users: the number of different people who use the app in one day.

## A fully worked example: a photo sharing app

**Assumptions** (always say them aloud):

- 50 million DAU.
- 1 user in 5 uploads one photo a day, so 0.2 uploads per user per day.
- Each user views 50 photos a day.
- Average photo size: 500 KB. Extra data per photo (owner, caption, time): 500 bytes.
- Keep data for 5 years. Keep 3 copies of every photo for safety.

**Step 1: Writes per second**

```text
Uploads per day = 50,000,000 x 0.2 = 10,000,000  (10 million)
Write QPS       = 10,000,000 / 86,400 = about 116 per second
```

**Step 2: Reads per second**

```text
Views per day = 50,000,000 x 50 = 2,500,000,000  (2.5 billion)
Read QPS      = 2,500,000,000 / 86,400 = about 29,000 per second
Peak read QPS = 29,000 x 2 = about 58,000 per second
```

Reads are about 250 times more than writes (29,000 / 116). This is a **read-heavy** system, so caching and a CDN will be very important.

**Step 3: Storage**

```text
Photos per day    = 10,000,000 x 500 KB = 5,000,000,000 KB = 5 TB
Photos per year   = 5 TB x 365 = 1,825 TB = about 1.8 PB
Photos in 5 years = 1.8 PB x 5 = about 9 PB
With 3 copies     = 9 PB x 3 = about 27 PB

Metadata per day    = 10,000,000 x 500 bytes = 5 GB
Metadata in 5 years = 5 GB x 365 x 5 = 9,125 GB = about 9 TB
```

**Step 4: Bandwidth**

```text
Upload   = 116 per second x 500 KB = 58,000 KB/s  = about 58 MB/s
Download = 29,000 per second x 500 KB = 14,500,000 KB/s = about 14.5 GB/s
```

**What the numbers tell us**

| Number | Design decision |
|---|---|
| 27 PB of photos | Photos go to object storage, never inside the database |
| 9 TB of metadata | Too big for one comfortable database server, plan to shard |
| 250 reads per write | Cache hard, use read replicas |
| 14.5 GB/s download | Serve photos from a CDN, and store small thumbnails |
| 58,000 peak QPS | Many stateless app servers behind a load balancer |

:::tip
Round hard. Use 100,000 seconds for a day. Write numbers as powers of ten: 50 million is 5 x 10^7. Then multiplying means adding the powers, and you make fewer mistakes.
:::

:::warn
Do not give false precision. Saying "we need 28,935.2 QPS" looks strange because your inputs were guesses. Say "about 30,000 QPS". Also do not forget the units: mixing KB and MB, or bits and bytes, is the top cause of wrong answers.
:::

:::interview A service gets 500 million requests per day. Each response is 2 KB. What is the QPS and the outgoing bandwidth?
QPS is 500,000,000 / 86,400, which is about 5,800 per second. I would plan for a peak of about two times that, so around 12,000 per second. Bandwidth at average load is 5,800 x 2 KB, which is about 11.6 MB per second, and about 23 MB per second at peak. These numbers are small enough for a modest group of servers, so the hard part of this system is probably not raw traffic.
:::

:::interview Why do interviewers ask for estimates at all?
Because the scale decides the design. With 10 writes per second, one database is fine. With 100,000 writes per second, I need sharding and queues. Estimates also show whether the system is read-heavy or write-heavy, how much storage to plan, and which part will become the bottleneck first.
:::

:::revise
- Goal: the order of magnitude, not an exact number.
- 1 day is about 100,000 seconds. 1 million per day is about 12 per second.
- KB, MB, GB, TB, PB: each is 1,000 times the one before.
- QPS = DAU x actions per user / 86,400. Peak is about 2 times the average.
- Memory is far faster than disk. A cross-continent call is the slowest.
- State every assumption aloud and turn each number into a design decision.
:::

# Networking basics for design

*How a request travels from a phone to a server, and how a server can push data back in real time.*

## Why this matters

Every system design diagram starts with an arrow from a client to a server. If you know what happens on that arrow, you can explain latency, real-time updates and failures with confidence.

## DNS: the phone book of the internet

You remember your friend's name, not the phone number. Your phone's contact list turns the name into a number.

**DNS** (Domain Name System) does the same for websites. It turns a name like `example.com` into an **IP address** such as `93.184.216.34`. An IP address is the number that identifies a machine on a network.

:::flow What happens when you open a website
Browser | asks: IP of example.com?
DNS resolver | answers from cache or asks DNS servers
Browser | gets the IP address
Server | browser connects and sends the request
:::

- DNS answers are **cached** (saved for reuse) by the browser, the operating system and the resolver. Each answer has a **TTL** (time to live): how many seconds it may be reused.
- DNS can return different IPs for different users. This is used to send users to the nearest region.

## TCP and UDP

Both are ways to send data between two machines.

**TCP** is like a courier with a signature. The parcel is tracked, lost pieces are sent again and everything arrives in order. **UDP** is like throwing newspapers onto doorsteps: fast, no tracking, some may be lost.

| | TCP | UDP |
|---|---|---|
| Connection | Yes, set up first (a "handshake") | No |
| Lost data | Sent again | Not sent again |
| Order | Kept | Not guaranteed |
| Speed | Slower start, more overhead | Faster, light |
| Used for | Web pages, APIs, databases, chat | Live video and voice calls, games, DNS lookups |

## HTTP and HTTPS

**HTTP** is the language that browsers and servers speak. The client sends a **request**, the server sends a **response**. It normally runs on top of TCP.

| Part of a request | Example | Meaning |
|---|---|---|
| Method | `GET`, `POST`, `PUT`, `DELETE` | Read, create, replace, remove |
| Path | `/users/42` | Which resource |
| Headers | `Authorization: Bearer ...` | Extra information |
| Body | `{ "name": "Asha" }` | The data you send |

| Status code | Meaning |
|---|---|
| 200, 201 | OK, Created |
| 301, 302 | Redirect to another URL (permanent, temporary) |
| 400, 401, 403, 404 | Bad request, not logged in, not allowed, not found |
| 429 | Too many requests (you hit a rate limit) |
| 500, 503 | Server error, service unavailable |

**HTTPS** is HTTP inside an encrypted tunnel (called **TLS**). Nobody in the middle can read or change the data. In any design, assume HTTPS between the client and your system.

HTTP is **stateless**: the server does not remember the earlier request. Each request must carry everything needed, for example a login token.

:::note
`GET`, `PUT` and `DELETE` are meant to be **idempotent**: sending the same request twice gives the same result as sending it once. `POST` usually is not. This word comes back in the reliability chapter, because retries are only safe for idempotent requests.
:::

## Getting updates from the server

Plain HTTP has one limit: only the client can start a conversation. But in a chat app the **server** has news (a new message) and must tell the client. There are four common ways.

Think of waiting for a parcel:

- **Polling:** you call the courier office every 5 minutes. "Has it come?" "No."
- **Long polling:** you call once and the office keeps you on hold until the parcel arrives.
- **SSE:** the office sends you SMS updates. You only listen.
- **WebSocket:** an open phone line. Both sides talk any time.

| Method | How it works | Good for | Weak point |
|---|---|---|---|
| Short polling | Client asks every few seconds | Simple dashboards | Many empty requests, delay |
| Long polling | Server holds the request open until it has data | Notifications, simple chat | One held request per client, reconnect after each message |
| SSE (Server-Sent Events) | One long HTTP response, server keeps writing events | Live scores, feeds, stock prices | One direction only (server to client) |
| WebSocket | One connection, both sides send any time | Chat, games, live collaboration | Long-lived connections are harder to scale |

:::flow WebSocket connection
Client | HTTP request: please upgrade
Server | agrees to switch protocol
Open connection | stays open for minutes or hours
Both sides | send small messages any time
:::

:::warn
Do not choose WebSockets for everything. They keep one open connection per user, and the server holding it must remember that user. This makes load balancing and deployment harder. If only the server sends updates, SSE is simpler. If updates are rare, polling every 30 seconds may be enough.
:::

:::interview What happens when you type a URL in the browser and press Enter?
First the browser finds the IP address of the domain using DNS, usually from a cache. Then it opens a TCP connection to that IP and does a TLS handshake for HTTPS. It sends an HTTP GET request. In a large system the request first reaches a load balancer, which forwards it to one healthy app server. The server may read from a cache or a database, builds the response and sends it back. The browser then renders the HTML and makes more requests for images, CSS and scripts, often served by a CDN.
:::

:::interview For a live cricket score page, would you use polling, SSE or WebSockets?
I would choose SSE. Data flows only one way, from server to client, and SSE works over normal HTTP with automatic reconnect in browsers. WebSockets would also work but add complexity I do not need, because the client never sends messages. Simple polling every few seconds is my fallback if the client or network does not support long-lived connections.
:::

:::revise
- DNS turns a name into an IP address. Answers are cached for a TTL.
- TCP is reliable and ordered. UDP is fast and may lose data.
- HTTP is request and response, and it is stateless. HTTPS adds encryption.
- Know the status codes: 200, 301/302, 400, 401, 404, 429, 500, 503.
- Server push options: polling, long polling, SSE (one way), WebSocket (two way).
- Pick the simplest option that meets the requirement.
:::

# Scaling, load balancers and API gateways

*How to grow from one server to many, and how traffic is shared between them.*

## Why this matters

A tea stall with one worker is fine for 20 customers an hour. When 500 customers come, you have two choices: hire a super-fast worker, or hire more workers and add someone at the door who sends each customer to a free counter.

## Vertical and horizontal scaling

**Vertical scaling** (scale up) means a bigger machine: more CPU, more memory, a bigger disk. **Horizontal scaling** (scale out) means more machines doing the same job.

| | Vertical (bigger machine) | Horizontal (more machines) |
|---|---|---|
| How | Upgrade the hardware | Add servers |
| Limit | A machine can only get so big | Almost no limit |
| Failure | One machine down means everything is down | Others keep working |
| Complexity | Simple, no code change | Needs a load balancer and stateless servers |
| Good for | Early stage, databases at first | Web and app servers at scale |

## Stateless servers

**State** is data a server remembers between requests, such as who is logged in or what is in a shopping cart.

If server A keeps your cart in its own memory, your next request **must** go to server A. If A dies, your cart is gone. This is a **stateful** server.

A **stateless** server keeps nothing between requests. All shared state lives outside, in a database or a shared cache. Then any server can handle any request.

:::flow Stateless design
Client | sends a token with each request
Load balancer | any server is fine
App server 1, 2, 3 | no local memory of users
Shared store | sessions in a cache or database
:::

Why stateless servers matter:

- You can add or remove servers at any time. This is called **autoscaling** when it happens automatically based on load.
- If a server dies, users do not notice. The next request goes to another server.
- Deploying new code is easy: replace servers one by one.

## Load balancers

A **load balancer** is like a traffic policeman at a crossing. Cars (requests) arrive on one road, and the policeman sends each car to a lane (server) that is open and not too crowded.

A load balancer gives you three things: it **spreads load**, it **hides failed servers**, and it gives clients **one address** for many servers.

### Layer 4 and Layer 7

The network is described in layers. Layer 4 is the transport layer (TCP and UDP). Layer 7 is the application layer (HTTP).

| | Layer 4 load balancer | Layer 7 load balancer |
|---|---|---|
| Looks at | IP address and port only | Full HTTP request: path, headers, cookies |
| Speed | Very fast, little work | A bit more work per request |
| Routing | Cannot route by URL | `/api` to one group, `/images` to another |
| Extra features | Few | TLS termination, redirects, compression |
| Use when | Raw TCP traffic, extreme throughput | Normal web and API traffic |

**TLS termination** means the load balancer does the HTTPS decryption, so the app servers behind it do less work.

### Load balancing algorithms

| Algorithm | How it picks a server | When to use |
|---|---|---|
| Round robin | Next server in turn: 1, 2, 3, 1, 2, 3 | Servers are equal and requests are similar |
| Weighted round robin | Bigger servers get more turns | Servers of different sizes |
| Least connections | The server with the fewest open requests | Requests take different amounts of time |
| IP hash | Hash of the client IP decides the server | The same client should reach the same server |
| Random (pick two) | Pick two at random, use the less busy one | Very large server groups |

A **hash** is a function that turns any input into a number that looks random but is always the same for the same input.

### Health checks

How does the policeman know a lane is closed? He looks. A load balancer sends a small request (for example `GET /health`) to every server every few seconds. If a server fails a few checks in a row, it is removed from the list. When it passes again, it comes back.

:::flow Health check removes a bad server
Load balancer | GET /health every 5 seconds
Server 2 | fails 3 times in a row
Marked unhealthy | no new traffic sent
Server 2 recovers | passes checks, added back
:::

### Is the load balancer a single point of failure?

A **single point of failure** (SPOF) is one part whose failure stops the whole system. One load balancer alone is a SPOF. The usual answer is two or more load balancers: one **active** and one **standby** that takes over, or several active ones behind DNS.

:::warn
"Sticky sessions" (always sending a user to the same server) look like an easy fix for stateful servers. But when that server dies, its users lose their session, and load becomes uneven. Prefer stateless servers with sessions in a shared store.
:::

## API gateways

A big hotel has one reception desk. Guests do not walk into the kitchen or the laundry. Reception checks who you are and sends your request to the right department.

An **API gateway** is one entry point in front of many backend services. **Microservices** are small services that each do one job (users, orders, payments). The gateway does the common work so each service does not repeat it.

| Job of the gateway | Meaning |
|---|---|
| Routing | `/orders` goes to the order service, `/users` to the user service |
| Authentication | Check the login token once, at the door |
| Rate limiting | Stop one client from sending too many requests |
| TLS termination | Handle HTTPS in one place |
| Logging and metrics | Record every request in one place |
| Response shaping | Combine or trim responses for mobile clients |

:::flow A typical entry path
Client | mobile or web
DNS and CDN | static files served here
Load balancer | spreads traffic
API gateway | auth, rate limit, routing
Services | users, orders, payments
:::

In practice a Layer 7 load balancer and an API gateway overlap a lot. The load balancer is mostly about **spreading traffic**. The gateway is mostly about **API rules** such as auth, limits and routing by path.

:::interview Your single web server is at 90 percent CPU. What do you do?
First I check what is using the CPU, because a slow query or a missing cache may be the real cause. If the load is real, I make the server stateless by moving sessions to a shared cache. Then I put two or more copies behind a load balancer with health checks. This gives me more capacity and removes the single point of failure. The database stays on its own machine, and I add a cache or read replicas if the database becomes the next bottleneck.
:::

:::revise
- Vertical = bigger machine. Horizontal = more machines behind a load balancer.
- Stateless servers keep no user data locally, so any server can serve any request.
- Load balancer: spreads load, hides failed servers (health checks), gives one address.
- L4 looks at IP and port. L7 reads HTTP and can route by path.
- API gateway: one door for many services, with auth, rate limits and routing.
:::

# Caching

*Keep a copy of popular data in a fast place so you do not fetch it the slow way every time.*

## Why this matters

You keep salt on the kitchen shelf, not in the shop. Going to the shop each time you cook would be silly. The shelf is small, so you keep only what you use often.

A **cache** is a small, fast store that holds copies of data that is slow to get. Reading from memory is far faster than a database query that touches the disk. In read-heavy systems a cache often removes most of the load from the database.

Two words to know: a **cache hit** means the data was found in the cache. A **cache miss** means it was not, so you must go to the slow source.

## Where to cache

:::flow Caches on the path of a request
Browser cache | images, CSS, scripts
CDN | static files near the user
App cache (Redis-like) | query results, sessions
Database | its own internal buffer
:::

| Layer | What it stores | Who controls it |
|---|---|---|
| Browser | Static files, some API responses | HTTP headers such as `Cache-Control` |
| CDN | Images, video, scripts, sometimes whole pages | You, with TTL and purge rules |
| Application cache | Results of database queries, computed values, sessions | Your code |

### CDN

A **CDN** (content delivery network) is a group of servers placed in many cities. They keep copies of your static files. A user in Mumbai gets the image from a server near Mumbai, not from a data center on another continent.

:::flow How a CDN serves an image
User | asks for photo.jpg
CDN edge server | has it? send at once
Origin server | on a miss, CDN fetches it once
CDN edge server | keeps a copy for the TTL
:::

## Caching patterns

### Cache-aside (lazy loading)

The most common pattern. The application looks in the cache first. On a miss it reads the database and puts the result into the cache.

```python
def get_user(user_id):
    key = f"user:{user_id}"
    user = cache.get(key)            # 1. try the cache first
    if user is None:                 # 2. miss: go to the database
        user = db_read(key)
        if user is not None:
            cache.set(key, user, ttl=300)   # 3. save for 5 minutes
    return user

def update_user(user_id, data):
    key = f"user:{user_id}"
    db_write(key, data)              # 1. the database is the truth
    cache.delete(key)                # 2. remove the old cached copy
```

### All three write patterns

| Pattern | How a write works | Good | Bad |
|---|---|---|---|
| Cache-aside | Write DB, then delete the cache key | Simple, only used data is cached | First read after a change is a miss |
| Write-through | Write the cache and the DB together, every time | Cache is always fresh | Slower writes, caches data nobody reads |
| Write-behind (write-back) | Write the cache now, write the DB later in batches | Very fast writes | Data is lost if the cache dies before saving |

## Eviction: what to remove when the cache is full

A cache has limited memory. **Eviction** means removing an item to make space.

| Policy | Removes | Idea |
|---|---|---|
| LRU (least recently used) | The item not touched for the longest time | Recently used data will be used again |
| LFU (least frequently used) | The item used the fewest times | Popular data stays |
| TTL (time to live) | Any item past its expiry time | Old data should not live forever |

LRU is the usual default. Here is a small working LRU cache.

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()       # remembers the order of use

    def get(self, key):
        if key not in self.items:
            return None                  # cache miss
        self.items.move_to_end(key)      # mark as most recently used
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)   # evict the oldest one

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
cache.get("a")           # "a" is now the most recently used
cache.put("c", 3)        # cache is full, so "b" is evicted
print(cache.get("b"))    # None
print(cache.get("a"))    # 1
```

Both `get` and `put` are `O(1)`. In interviews the same idea is often built by hand with a hash map plus a doubly linked list.

## Invalidation: keeping the cache correct

**Invalidation** means removing or updating cached data when the real data changes. A cached copy that no longer matches the database is called **stale** data.

| Method | How | Trade-off |
|---|---|---|
| TTL | Every key expires after N seconds | Simple, data can be stale for up to N seconds |
| Delete on write | When the DB changes, delete the key | Fresh, but every writer must remember to do it |

## Three classic cache problems

| Problem | What happens | Fix |
|---|---|---|
| **Cache stampede** | A popular key expires. Thousands of requests miss together and all hit the database | Let only one request rebuild the key (a lock), or refresh before expiry |
| **Cache avalanche** | Many keys expire at the same moment, or the cache server dies | Add random extra seconds to each TTL, run the cache as a cluster |
| **Cache penetration** | Requests for keys that do not exist always miss and always hit the DB | Cache the "not found" answer for a short time |

:::warn
A cache is not a database. Never keep the only copy of important data in a cache, because it can be evicted or lost on restart. Design so that if the whole cache is emptied, the system is slow but still correct.
:::

:::interview How do you keep the cache and the database consistent?
I treat the database as the source of truth and use cache-aside. On a write I update the database first and then delete the cache key, so the next read loads fresh data. I also set a TTL on every key as a safety net, so even if a delete is missed, stale data disappears after a short time. Perfect consistency between two stores is not possible without heavy cost, so I ask how much staleness the product allows. For data like a bank balance I would read from the database directly.
:::

:::revise
- Cache = small fast copy of slow data. Hit is found, miss is not found.
- Cache-aside: read cache, on miss read DB and fill. On write, update DB then delete the key.
- Write-through keeps the cache fresh. Write-behind is fast but can lose data.
- Eviction: LRU is the default. Always add a TTL.
- Problems: stampede (lock), avalanche (random TTL), penetration (cache "not found").
:::

# Databases: SQL, NoSQL and indexes

*How to choose where the data lives, and how an index makes a query fast.*

## Why this matters

Almost every design question ends with "and where do you store this?" A wrong choice here is the hardest thing to change later, because data is heavy and moving it is slow.

## SQL databases

A **SQL** (relational) database stores data in tables with fixed columns, like a well-kept register in a bank. Rows in different tables are linked by keys, and you can combine tables with a **join**.

SQL databases give **ACID transactions**. A **transaction** is a group of changes that count as one.

| Letter | Word | Plain meaning |
|---|---|---|
| A | Atomicity | All the changes happen, or none of them |
| C | Consistency | Rules (such as "balance cannot be negative") are never broken |
| I | Isolation | Two transactions at the same time do not corrupt each other |
| D | Durability | Once saved, it stays saved after a crash |

:::example Why transactions matter
Asha sends 500 rupees to Ravi. Two changes are needed: minus 500 from Asha, plus 500 to Ravi. If the server crashes after the first change, 500 rupees vanish. With a transaction, either both changes are saved or neither is.
:::

## NoSQL databases

**NoSQL** is a family of databases that give up some SQL features (joins, strict structure, sometimes transactions across many rows) to gain easy horizontal scaling or flexible data shapes.

| Type | Looks like | Good for | Typical examples |
|---|---|---|---|
| Key-value | A giant dictionary | Sessions, caches, counters | Redis, DynamoDB |
| Document | JSON objects | Profiles, catalogs, content | MongoDB |
| Wide-column | Rows with a partition key, sorted inside | Huge write volume, time series, messages | Cassandra, HBase |
| Graph | Nodes and edges | Friend networks, recommendations | Neo4j |

## How to choose

| Question | Leans SQL | Leans NoSQL |
|---|---|---|
| Is the data strongly related, with joins? | Yes | No, mostly lookups by key |
| Do you need multi-row transactions? | Yes (money, orders, bookings) | No |
| Is the structure fixed? | Yes | It changes often or differs per item |
| How large is the write volume? | Fits one strong machine plus replicas | Needs many machines from the start |
| What are the queries? | Many kinds, not all known yet | Few, known in advance |

:::tip
A safe interview line: "I will start with a relational database because the data is structured and I need transactions. If a single table grows beyond one machine, I will shard it or move that one table to a NoSQL store." Then name which table that would be.
:::

:::warn
"NoSQL is faster" and "SQL does not scale" are both wrong as general statements. SQL databases scale very far with indexes, replicas and sharding. NoSQL is not automatically fast if you query it in a way it was not designed for. Choose from the access pattern, not from fashion.
:::

## Indexes

A book has an index at the back. To find "caching" you do not read all 500 pages. You look up the word, get the page number and jump there.

A database **index** is a sorted structure that maps a column value to the place of the row. Without an index the database reads every row. This is called a **full table scan**.

```sql
-- Without an index: checks every row of a 50 million row table
SELECT * FROM users WHERE email = 'asha@example.com';

-- Create an index on the column you search by
CREATE INDEX idx_users_email ON users (email);

-- Composite index: column order matters (left to right)
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at);
```

Most SQL indexes are a **B-tree**: a wide, shallow tree that stays sorted. Finding a value needs only a few steps even among millions of rows, and it also supports range queries such as "orders from the last 7 days".

| | Without index | With index |
|---|---|---|
| Find one row | Reads all rows, `O(n)` | A few tree steps, `O(log n)` |
| Insert a row | Fast | Slightly slower: the index must be updated too |
| Disk space | Less | More |

So indexes are a trade-off: **faster reads, slower writes, more storage**. Index the columns that appear in `WHERE`, `JOIN` and `ORDER BY` of your frequent queries, and no more.

:::note
A composite index on `(user_id, created_at)` helps queries that filter by `user_id`, or by `user_id` and `created_at`. It does not help a query that filters only by `created_at`. Think of a phone book sorted by surname, then first name: it is useless if you only know the first name.
:::

## Normalization and denormalization

**Normalization** means each fact is stored once. The user's name lives only in the `users` table, and other tables hold `user_id`. Writes are simple and data never disagrees.

**Denormalization** means you copy some data to avoid joins at read time, for example storing `author_name` inside each post. Reads become faster, but one change must now be written in many places.

At large scale, read-heavy systems often denormalize on purpose. Say it as a trade-off.

:::interview Would you use SQL or NoSQL for a chat application's messages?
Messages are a huge, append-only stream. The query is almost always the same: "give me the latest messages of chat X". There are no joins and no multi-row transactions. So I would choose a wide-column or key-value store, with the chat ID as the partition key and the message ID as the sort key. It scales writes across many machines easily. I would still keep users and account data in a relational database, because that data is small, related and needs transactions.
:::

:::interview A query is slow. How do you investigate?
I look at the query plan using `EXPLAIN` to see if it does a full table scan. If yes, I check whether there is an index on the columns in the `WHERE` and `ORDER BY` clauses, and add or fix a composite index. I also check that the query does not fetch more rows or columns than it needs, and whether the same query runs many times in a loop (the N+1 problem). If the query is already good and still heavy, I cache its result or move it to a read replica.
:::

:::revise
- SQL: tables, joins, ACID transactions. Default choice for structured, related data.
- NoSQL types: key-value, document, wide-column, graph. Chosen for scale or flexible shape.
- Choose by access pattern: relations and transactions lean SQL, simple key lookups at huge scale lean NoSQL.
- An index turns a full scan into a few steps, but slows writes and uses space.
- Composite index order matters, left to right.
- Denormalize to make reads fast, and accept harder writes.
:::

# Replication and sharding

*Copy the data to survive failures and serve more reads. Split the data to store more and serve more writes.*

## Why this matters

One database server has two limits. If it dies, everything stops. And it can only hold so much data and handle so many queries. **Replication** solves the first problem. **Sharding** solves the second. Large systems use both.

## Replication

Keep a photocopy of important documents in another house. If one house burns, you still have the papers.

**Replication** means keeping the same data on several machines. Each copy is called a **replica**.

### Leader and followers

The most common setup: one **leader** (also called primary) accepts all writes. It sends every change to the **followers** (also called replicas or secondaries). Reads can go to any of them.

:::flow Leader-follower replication
App server | writes go to the leader
Leader | saves, then ships the change
Followers | apply the same change
App server | reads can use followers
:::

| Benefit | How |
|---|---|
| High availability | If the leader dies, a follower takes over |
| More read capacity | Spread reads over many followers (read replicas) |
| Lower latency | Put a follower near users in another region |
| Safe backups | Take backups from a follower, not from the busy leader |

### Synchronous and asynchronous

| | Synchronous | Asynchronous |
|---|---|---|
| Leader waits for the follower? | Yes, before saying "saved" | No, it replies at once |
| Speed of writes | Slower | Faster |
| Data loss if the leader dies | None on that follower | Recent writes may be lost |
| If a follower is slow | Writes become slow or stop | No effect on writes |

Many systems use a mix: one follower is synchronous and the rest are asynchronous.

### Replication lag

With asynchronous replication, a follower is always a little behind the leader. This delay is **replication lag**. It is usually small, but it creates surprises.

:::example The "my comment vanished" bug
You post a comment. The write goes to the leader. The page reloads and reads from a follower that has not received the change yet. Your comment is missing. A second later it appears.

Fix: **read-your-own-writes**. For a short time after a user writes, send that user's reads to the leader. Other users can keep reading from followers.
:::

### Failover

**Failover** means promoting a follower to be the new leader when the old leader dies.

:::flow Failover steps
Leader stops | no heartbeat for some seconds
Detect | the others agree it is dead
Promote | the most up-to-date follower becomes leader
Redirect | clients send writes to the new leader
:::

A **heartbeat** is a small "I am alive" message sent every few seconds.

:::warn
Failover is risky. If the old leader was not really dead, only slow, you may get two leaders that both accept writes. This is called **split brain** and it corrupts data. Real systems prevent it by letting a majority of nodes vote for exactly one leader. Also, writes that had not reached the new leader are lost with asynchronous replication.
:::

## Partitioning and sharding

A library with a million books does not use one shelf. It splits books across many shelves by a rule, for example by the first letter of the title.

**Sharding** (or partitioning) means splitting one big dataset across many machines. Each machine holds one part, called a **shard**. The column used to decide the shard is the **shard key** (or partition key).

| Method | Rule | Good | Bad |
|---|---|---|---|
| Range | Keys A to F on shard 1, G to M on shard 2 | Range queries are easy | Uneven load: some ranges are much busier |
| Hash | `hash(key) % N` picks the shard | Even spread | Range queries hit every shard. Changing N moves almost all keys |
| Directory | A lookup table says which key lives where | Full control | The lookup table is one more thing to scale and protect |

### The problem with `hash(key) % N`

With 3 servers, a key goes to server `hash(key) % 3`. Now add a 4th server. The rule becomes `hash(key) % 4`, and the answer changes for most keys. In a test with 10,000 keys, about 75 percent of them moved to a different server. For a cache this means almost everything is a miss at once. For a database it means moving most of the data.

### Consistent hashing, step by step

**Consistent hashing** is a way to place keys on servers so that adding or removing one server moves only a small share of the keys.

1. Imagine a ring (a circle) of numbers from 0 to about 4 billion (2^32).
2. Hash each **server name** to get its position on the ring.
3. Hash each **key** to get its position on the same ring.
4. A key belongs to the first server you meet when you walk **clockwise** from the key.
5. Add a server: it takes only the keys between it and the server before it. All other keys stay.
6. Remove a server: only its keys move, to the next server clockwise.

:::flow Finding the server for a key
Key "user42" | hash gives position 1,800
Walk clockwise | from 1,800 on the ring
First server point | server B at 2,100
Result | user42 lives on server B
:::

One problem remains. With only one point per server, the pieces of the ring are very uneven, so one server gets much more data than another. The fix is **virtual nodes**: each server is placed on the ring many times (for example 100 points with different names such as `A#0`, `A#1`). Many small pieces average out to an even share.

```python
import bisect, hashlib

def h(key):
    # A stable hash: the same key gives the same number everywhere.
    digest = hashlib.md5(key.encode()).hexdigest()
    return int(digest, 16) % (2 ** 32)

class Ring:
    def __init__(self, vnodes=100):
        self.vnodes = vnodes       # virtual points per server
        self.points = []           # sorted positions on the ring
        self.owner = {}            # position -> server name

    def add(self, server):
        for i in range(self.vnodes):
            p = h(f"{server}#{i}")
            bisect.insort(self.points, p)
            self.owner[p] = server

    def get(self, key):
        # First point clockwise from the key's position.
        i = bisect.bisect_right(self.points, h(key))
        if i == len(self.points):
            i = 0                  # past the end: wrap to the start
        return self.owner[self.points[i]]
```

Now test what happens when a 4th server joins.

```python
ring = Ring()
for s in ["A", "B", "C"]:
    ring.add(s)

keys = [f"user{i}" for i in range(10000)]
before = {k: ring.get(k) for k in keys}

ring.add("D")
moved = sum(1 for k in keys if ring.get(k) != before[k])
print(moved / len(keys))   # about 0.27 in our run
```

Only about a quarter of the keys moved, which is the fair share of the new server (1 out of 4). With plain modulo, about three quarters moved.

| | `hash % N` | Consistent hashing |
|---|---|---|
| Keys moved when going from 3 to 4 servers | About 75 percent | About 25 percent |
| Keys moved when one server dies | Most of them | Only that server's keys |
| Even spread | Yes | Yes, with virtual nodes |

### Hot keys

A **hot key** is one key that gets far more traffic than the others, for example a celebrity's profile. Hashing spreads keys evenly, but it cannot split one key. Common fixes:

- Cache the hot key in front of the database.
- Split the key by adding a suffix (`celebrity:1` to `celebrity:10`) and merge the parts when reading.
- Give very large customers or users their own shard.

### What sharding costs

| Cost | Why |
|---|---|
| Cross-shard queries | A query without the shard key must ask every shard and merge the answers |
| No easy joins or transactions across shards | The data lives on different machines |
| Operational work | More machines, backups per shard, and **rebalancing** (moving data when shards are added or uneven) |

:::tip
Sharding is the last step, not the first. The usual order is: add indexes, add a cache, add read replicas, scale up the machine, and only then shard.
:::

:::interview How do you choose a shard key?
I look for a key with three properties. It has many different values, so data spreads evenly. It is present in most queries, so each query goes to one shard only. And no single value is so popular that it creates a hot shard. For a chat system I would shard messages by chat ID, because every read asks for one chat. For an order system I would shard by user ID. I avoid keys like country or creation date alone, because they put too much data and traffic in one place.
:::

:::revise
- Replication = same data on many machines. Leader takes writes, followers copy.
- Asynchronous replication is fast but has lag. Read your own writes from the leader.
- Sharding = different data on different machines, chosen by a shard key.
- `hash % N` moves most keys when N changes. Consistent hashing moves only about 1/N.
- Virtual nodes make the ring even. Hot keys need caching or splitting.
:::

# CAP theorem, consistency and quorum

*What you must give up when machines cannot talk to each other, explained in plain words.*

## Why this matters

When data lives on many machines, they will sometimes disagree. Interviewers use CAP to check whether you understand that you cannot have everything, and whether you can pick the right side for a given product.

## The CAP theorem

Two bank clerks in two cities share one account book over the phone. One day the phone line is cut. A customer walks in and wants to withdraw money. The clerk has two choices:

- **Refuse**, because he cannot check the other city. The book stays correct, but the customer is not served.
- **Serve**, using his own copy. The customer is happy, but the two books may now disagree.

That is CAP.

| Letter | Word | Plain meaning |
|---|---|---|
| C | Consistency | Every read gets the latest write, from any machine |
| A | Availability | Every request gets a (non-error) answer |
| P | Partition tolerance | The system keeps working when the network between machines is cut |

A **network partition** is a break in the network that splits machines into groups that cannot reach each other.

The theorem says: **when a partition happens, you must choose between consistency and availability.** You cannot keep both.

Partitions do happen in any real network, so P is not a choice. The real choice is: **during a partition, do I prefer C or A?**

| Choice | Behaviour during a partition | Good for |
|---|---|---|
| CP | Some requests fail or wait, but data is never wrong | Payments, bookings, inventory, leader election |
| AP | Always answers, but may return old data. Fixes it later | Feeds, likes, carts, view counts, presence |

:::warn
Do not say "this database is CA". On more than one machine you cannot choose to skip partitions. Also do not label a whole product as CP or AP. Different features of one product choose differently: a shopping site may be AP for the product catalog and CP for payment.
:::

:::note
CAP only talks about the time of a partition. When the network is healthy there is another trade-off: **latency against consistency**. Waiting for all replicas to confirm makes data consistent but slower. This longer form is sometimes called PACELC.
:::

## Consistency models

| Model | What the user sees | Example |
|---|---|---|
| Strong consistency | After a write, every read sees it | Bank balance |
| Eventual consistency | Reads may be old for a short time. If writes stop, all copies become the same | Like counts |
| Read-your-own-writes | You always see your own changes. Others may see them a bit later | Editing your profile |

**Eventual consistency** is not "wrong data forever". It means "correct soon". The useful interview question is: how soon, and is that acceptable for this feature?

## Quorum

Three friends decide where to eat. They do not wait for everyone. If two of the three agree, the decision is made. That majority is a **quorum**.

In a replicated database:

- **N** = number of replicas that hold each piece of data.
- **W** = how many replicas must confirm a write before it counts as successful.
- **R** = how many replicas you ask on a read.

The rule: if **W + R > N**, the group you read from always overlaps with the group you wrote to by at least one replica. So at least one replica in every read has the latest value.

:::example N = 3, W = 2, R = 2
A write is confirmed by replicas 1 and 2. Replica 3 is behind.
A read asks any 2 replicas: (1,2), (1,3) or (2,3). Every pair includes replica 1 or 2, so the read sees the new value. The reader picks the value with the newest version number.
Here W + R = 4, which is greater than N = 3.
:::

| Setting (N = 3) | Behaviour |
|---|---|
| W = 3, R = 1 | Fast reads, slow writes. A write fails if any replica is down |
| W = 1, R = 3 | Fast writes, slow reads |
| W = 2, R = 2 | Balanced. Survives one replica being down for both reads and writes |
| W = 1, R = 1 | Fastest, but a read may miss the latest write (W + R is not more than N) |

Quorum is a dial between consistency and speed. It is one of the clearest ways to show an interviewer that you understand tunable trade-offs.

:::interview Explain the CAP theorem with an example.
CAP says that when a network partition splits the replicas, a system must choose between consistency and availability. Take a seat booking system with replicas in two data centers. If the link between them breaks, I have two options. I can refuse bookings on the side that cannot reach a majority, which keeps the data consistent but makes that side unavailable. Or I can accept bookings on both sides, which keeps the system available but may sell the same seat twice. For bookings I choose consistency. For a "likes" counter I would choose availability, because a slightly old number hurts nobody.
:::

:::revise
- CAP: during a network partition, choose consistency or availability.
- Partitions always happen, so the real choice is CP or AP, per feature.
- CP: refuse rather than be wrong (money, bookings). AP: answer with possibly old data (feeds, likes).
- Quorum: W + R > N means reads and writes overlap, so reads see the latest write.
- N = 3, W = 2, R = 2 is the classic balanced setting.
:::

# Message queues and event-driven design

*Let services leave work for each other instead of waiting on each other.*

## Why this matters

In a restaurant the waiter does not stand in the kitchen until your food is cooked. He puts the order slip on a rail and goes to the next table. The cooks take slips when they are free. If 20 orders come at once, the slips wait in line and nothing is lost.

A **message queue** is that rail. One service (the **producer**) puts a message in the queue. Another service (the **consumer**) takes it out later and does the work. This is **asynchronous** work: the sender does not wait for the result.

:::flow Order placed, work done later
Order service | saves order, replies to user
Queue | holds "order placed" message
Email worker | sends the receipt
Other workers | invoice, analytics
:::

| Benefit | Meaning |
|---|---|
| Decoupling | The producer does not know or care who consumes |
| Smoothing spikes | A sudden burst waits in the queue instead of crashing the workers |
| Fast responses | The user gets a reply before the slow work is done |
| Retry | If a worker fails, the message can be given to another worker |
| Independent scaling | Add more consumers when the queue grows |

## Queue or log?

There are two main styles.

| | Classic queue (RabbitMQ or SQS style) | Log (Kafka style) |
|---|---|---|
| Picture | A to-do list: done tasks are removed | A diary: entries are only added and kept for days |
| After a message is read | Deleted once acknowledged | Stays. Each consumer remembers its position (**offset**) |
| Many different consumers | Each message goes to one worker | Every consumer group reads all messages |
| Replay old messages | Not possible | Yes, move the offset back |
| Order | Usually not guaranteed with many workers | Guaranteed inside one partition |
| Best for | Background jobs: emails, image resizing | Event streams: activity, logs, feeding many systems |

In a log system a **topic** is a named stream. It is split into **partitions** for scale. Messages with the same key (for example the same user ID) go to the same partition, so they stay in order. A **consumer group** is a set of workers that share the partitions between them.

**Publish-subscribe** (pub/sub) means one event is delivered to every interested subscriber. "Order placed" may be read by the email service, the inventory service and the analytics service, each separately.

## Delivery guarantees

A worker takes a message and crashes. Was the work done? Nobody knows. The system must choose a rule.

| Guarantee | Meaning | Risk |
|---|---|---|
| At-most-once | Deliver once, never retry | Messages can be lost |
| At-least-once | Retry until the consumer confirms (**acknowledges**, or "acks") | Messages can arrive twice |
| Exactly-once | Each message has its effect one time | Very hard. In practice built from at-least-once plus idempotent consumers |

Most real systems use **at-least-once**. That means **duplicates will happen**, and the consumer must handle them.

## Idempotency

Pressing a lift button five times still calls the lift once. An operation is **idempotent** if doing it many times has the same effect as doing it once.

- "Set the order status to PAID" is idempotent.
- "Add 500 rupees to the balance" is not. Twice means 1,000.

To make a consumer idempotent, give each message a unique ID and remember which IDs you have already handled.

```python
processed = set()     # in real life: a database table or cache

def handle(message):
    if message["id"] in processed:
        return                     # duplicate: skip it safely
    send_receipt(message["order_id"])
    processed.add(message["id"])   # remember that we did it
```

## Dead letter queues

Some messages can never succeed, for example because the data inside is broken. If the worker retries forever, this "poison" message blocks everything behind it.

A **dead letter queue** (DLQ) is a side queue for messages that failed too many times. Engineers look at it, fix the cause and send the messages again.

:::flow Retry, then dead letter queue
Main queue | message delivered
Consumer | fails to process
Retry | up to 3 times, with a delay
Dead letter queue | parked for a human to check
:::

## Backpressure

If producers are faster than consumers for a long time, the queue grows without end. **Backpressure** means telling the producers to slow down, or rejecting new work, when the system is full. Always watch the queue length and the age of the oldest message.

:::warn
A queue does not make work disappear. It only moves it later. Do not put a queue in front of something the user is waiting for on screen, such as a login check. Use queues for work that can finish a few seconds or minutes later.
:::

:::interview When would you add a message queue to a design?
When work does not need to finish before the user gets a response, when traffic comes in bursts, or when one event must reach several services. A good example is video upload: the API saves the file and returns at once, then a queue feeds workers that compress the video and create thumbnails. The cost is more moving parts and eventual consistency, so the user needs a status such as "processing".
:::

:::interview How do you make sure a message is processed exactly once?
True exactly-once delivery is not practical across a network, because the sender cannot know whether a lost reply means the work was done. So I use at-least-once delivery and make the consumer idempotent. Each message carries a unique ID. The consumer records the ID in the same database transaction as the work itself, and skips any ID it has seen before. The result is that every message has its effect exactly once, even if it is delivered many times.
:::

:::revise
- A queue lets the producer continue while the consumer works later.
- Benefits: decoupling, smoothing spikes, fast replies, retries.
- Queue = tasks removed after processing. Log = events kept, consumers track an offset and can replay.
- At-least-once is the normal guarantee, so duplicates happen.
- Idempotent consumers make duplicates harmless.
- Failed messages go to a dead letter queue after a few retries.
:::

# Reliability patterns

*Small habits that keep one failure from turning into a full outage.*

## Why this matters

In a large system something is always broken: a disk, a network cable, a slow server. A reliable system is not one where nothing fails. It is one that **keeps working when parts fail**.

## Availability and the "nines"

**Availability** is the share of time a system is up. It is written as a percentage, and people count the nines.

| Availability | Name | Downtime per year | Downtime per month (30 days) |
|---|---|---|---|
| 99% | Two nines | 3.65 days | 7.2 hours |
| 99.9% | Three nines | 8.76 hours | 43.2 minutes |
| 99.99% | Four nines | 52.6 minutes | 4.3 minutes |
| 99.999% | Five nines | 5.3 minutes | 26 seconds |

The maths: a year has 365 x 24 = 8,760 hours. At 99.9 percent, the allowed downtime is 0.1 percent of 8,760, which is 8.76 hours.

### Parts in a chain and parts side by side

- **In a chain** (a request needs A **and** B): multiply. Two parts of 99.9 percent give 0.999 x 0.999 = 0.998, so **99.8 percent**. Every extra dependency makes availability worse.
- **Side by side** (A **or** B is enough): multiply the failure chances. Two copies of 99 percent fail together 0.01 x 0.01 = 0.0001 of the time, so the pair gives **99.99 percent** (if the failures are independent).

This is why **redundancy** (having spare copies) is the base of reliability: more than one server, more than one replica, more than one data center.

## Timeouts

If you call a friend and nobody answers, you hang up after some rings. You do not hold the phone all day.

A **timeout** is the longest time you wait for a reply. Without one, a slow service makes every caller wait, their threads and connections fill up, and the slowness spreads to the whole system. Every network call needs a timeout.

## Retries with backoff and jitter

Many failures last only a moment. Trying again often works. But retrying badly makes things worse.

- **Exponential backoff:** wait longer after each failure: 0.1 s, 0.2 s, 0.4 s, 0.8 s.
- **Jitter:** add randomness to the wait. Without it, a thousand clients that failed together retry together, again and again. This crowd is called a **thundering herd**.

```python
import random, time

def call_with_retry(call, attempts=4, base=0.1, cap=2.0):
    for attempt in range(attempts):
        try:
            return call()
        except TimeoutError:
            if attempt == attempts - 1:
                raise                        # out of tries: give up
            limit = min(cap, base * 2 ** attempt)   # 0.1, 0.2, 0.4
            time.sleep(random.uniform(0, limit))    # full jitter
```

:::warn
Retry only when it is safe and useful. Retry timeouts and 503 errors. Do not retry a 400 "bad request", because it will fail again. And never retry a non-idempotent call such as "charge the card" unless you send an idempotency key. Otherwise the customer pays twice.
:::

## Idempotency keys

The client creates a unique key for each real action and sends it with the request. If the request is retried, the key is the same. The server stores the key with the result and returns the saved result for a repeat.

## Circuit breaker

The fuse box at home cuts the power when there is a fault, so the wires do not burn. A **circuit breaker** in software stops calling a service that keeps failing, so callers fail fast instead of waiting and the sick service gets time to recover.

| State | What happens |
|---|---|
| Closed | Normal. Calls pass through. Failures are counted |
| Open | Too many failures. Calls fail at once without touching the service |
| Half-open | After a wait, a few test calls are allowed. Success closes the circuit, failure opens it again |

:::flow Circuit breaker states
Closed | calls pass, count failures
Open | fail fast for 30 seconds
Half-open | allow a test call
Closed again | if the test call works
:::

When the circuit is open, return a **fallback**: a cached value, a default answer or a clear error. Showing a product page without recommendations is better than showing no page. This is called **graceful degradation**.

## Rate limiting

A rate limiter allows only a fixed number of requests per user in a time window. It protects the system from abuse, bugs and sudden spikes. When the limit is hit, the server answers `429 Too Many Requests`.

| Algorithm | Idea | Good | Bad |
|---|---|---|---|
| Token bucket | Tokens drip into a bucket. Each request takes one | Allows short bursts, little memory | Two settings to tune |
| Leaky bucket | Requests wait in a queue and leave at a fixed speed | Very smooth output | Bursts must wait or are dropped |
| Fixed window | Count per calendar minute | Simplest | Double traffic at the edge of two windows |
| Sliding window log | Store the time of every request | Exact | Uses a lot of memory |
| Sliding window counter | Weighted mix of this window and the last one | Accurate enough, little memory | An approximation |

The **token bucket** is the most common. A bucket holds up to `capacity` tokens. Tokens are added at a steady rate. A request needs one token. If the bucket is empty, the request is rejected.

```python
import time

class TokenBucket:
    def __init__(self, capacity, refill_per_sec):
        self.capacity = capacity         # the largest burst allowed
        self.rate = refill_per_sec       # tokens added every second
        self.tokens = capacity           # start with a full bucket
        self.last = time.monotonic()

    def allow(self):
        now = time.monotonic()
        gained = (now - self.last) * self.rate
        self.tokens = min(self.capacity, self.tokens + gained)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1             # spend one token
            return True
        return False                     # empty bucket: reject

bucket = TokenBucket(capacity=5, refill_per_sec=1)
print([bucket.allow() for _ in range(7)])
# [True, True, True, True, True, False, False]
```

Five requests pass at once (the burst). After that the user gets one request per second.

:::interview A downstream service becomes slow. How do you stop your service from going down with it?
First, every call has a timeout, so my threads are not held forever. Second, I retry only a small number of times, with exponential backoff and jitter, so I do not add load to a struggling service. Third, I wrap the call in a circuit breaker. After repeated failures it opens and I return a fallback, such as cached data or a simpler response. I also keep a separate connection pool for that dependency, so its slowness cannot use up the resources needed by other features.
:::

:::revise
- 99.9% is about 8.76 hours down per year. 99.99% is about 52 minutes.
- Chain of parts: multiply availabilities (worse). Redundant copies: multiply failure chances (better).
- Every network call needs a timeout.
- Retry with exponential backoff and jitter, and only for safe errors.
- Idempotency keys make retries of payments and orders safe.
- Circuit breaker: closed, open, half-open. Fail fast and use a fallback.
- Token bucket is the default rate limiting algorithm.
:::

# Storage, search and unique IDs

*Three building blocks that appear in almost every design: where files go, how search works, and how to create IDs on many machines.*

## Block, file and object storage

| Type | Picture | Access | Used for |
|---|---|---|---|
| Block storage | A raw hard disk attached to one server | Read and write fixed-size blocks | Database disks, virtual machine disks |
| File storage | A shared folder with directories | Paths such as `/reports/may.pdf` | Shared files between a few servers |
| Object storage | A giant cloakroom: hand over an item, get a token | HTTP `PUT` and `GET` by key | Photos, videos, backups, logs |

**Object storage** (Amazon S3 is a well-known example) stores each file as an **object**: the bytes, some metadata and a unique key. It is cheap, almost unlimited in size and keeps several copies for durability. But you normally replace a whole object, you do not edit a few bytes in the middle.

:::warn
Do not store large files inside your main database. They make the database huge, backups slow and queries heavy. Store the file in object storage and keep only its key or URL plus metadata (owner, size, type) in the database.
:::

### The usual upload pattern

:::flow Upload with a pre-signed URL
Client | asks API for an upload link
API server | returns a short-lived signed URL
Client | uploads the file straight to object storage
API server | saves metadata and file key in the DB
CDN | serves the file to readers
:::

A **pre-signed URL** is a temporary link that allows one upload or download without sharing your storage password. The big file never passes through your app servers, so they stay free for API work.

## Full-text search and the inverted index

To find every page that mentions "tiger" in a book, you do not read the book. You use the index at the back: word, then page numbers.

A normal database index is good for exact matches (`email = ...`). It is bad at "find all products whose description contains red shoes". Search engines (Elasticsearch is a common example) solve this with an **inverted index**: a map from each **word** to the list of **documents** that contain it.

```python
docs = {
    1: "cheap red shoes",
    2: "red running shoes",
    3: "cheap phone cover",
}
index = {}
for doc_id, text in docs.items():
    for word in text.split():
        index.setdefault(word, set()).add(doc_id)

def search(query):
    sets = [index.get(w, set()) for w in query.split()]
    return sorted(set.intersection(*sets))   # docs that have all words

print(index["red"])            # {1, 2}
print(search("red shoes"))     # [1, 2]
print(search("cheap shoes"))   # [1]
```

A real search engine adds more steps: it turns text into lowercase, removes very common words, reduces words to a base form ("running" to "run"), and **ranks** the results so that the best match comes first.

The database stays the source of truth. The search index is a copy that is a few seconds behind, which is fine for search.

## Unique IDs across many machines

On one database you can use an auto-increment number: 1, 2, 3. With many shards this breaks, because two shards would both create ID 5.

| Method | How | Good | Bad |
|---|---|---|---|
| Auto-increment | The database counts up | Small, sorted | Works only with one writer |
| UUID | A random 128-bit value | No coordination at all | Large, not sorted by time, less friendly to indexes |
| Ticket server | One service hands out ranges of numbers | Short numeric IDs | The service must be made highly available |
| Snowflake-style | Time + machine number + counter in 64 bits | Small, roughly sorted by time, no coordination per ID | Depends on the machine clocks |

### Snowflake-style IDs

A token at a bank counter can show the date, the counter number and a running number. No two counters ever print the same token, and they never need to talk to each other.

A Snowflake-style ID packs three parts into one 64-bit number:

| Part | Bits | Meaning |
|---|---|---|
| Timestamp | 41 | Milliseconds since a chosen start date. Lasts about 69 years |
| Machine ID | 10 | Up to 1,024 machines |
| Sequence | 12 | Up to 4,096 IDs per millisecond on each machine |

```python
import time

EPOCH_MS = 1704067200000     # custom start: 1 Jan 2024 (UTC)

class IdGenerator:
    def __init__(self, machine_id):
        self.machine_id = machine_id     # 0 to 1023 (10 bits)
        self.last_ms = -1
        self.seq = 0                     # 0 to 4095 (12 bits)

    def next_id(self):
        now = int(time.time() * 1000)
        if now < self.last_ms:
            raise RuntimeError("clock moved backwards")
        if now == self.last_ms:
            self.seq = (self.seq + 1) & 4095
            if self.seq == 0:            # 4096 IDs used in this ms
                while now <= self.last_ms:
                    now = int(time.time() * 1000)   # wait for next ms
        else:
            self.seq = 0
        self.last_ms = now
        t = now - EPOCH_MS
        return (t << 22) | (self.machine_id << 12) | self.seq

gen = IdGenerator(machine_id=7)
a, b = gen.next_id(), gen.next_id()
print(a < b)     # True: later IDs are larger
```

Because the time is in the highest bits, sorting by ID is almost the same as sorting by creation time. That is very useful for feeds and chat messages.

:::interview How would you generate unique IDs in a system with many database shards?
I would use Snowflake-style 64-bit IDs. Each app server or ID service instance has its own machine ID. An ID is the current time in milliseconds, then the machine ID, then a counter that resets every millisecond. No coordination is needed for each ID, the IDs fit in a normal 64-bit column, and they sort roughly by time. The risks are clock problems, so machines must sync their clocks and the generator must refuse to issue IDs if the clock moves backwards.
:::

:::revise
- Files go to object storage. The database keeps only metadata and the file key.
- Pre-signed URLs let clients upload directly to storage.
- Full-text search uses an inverted index: word to list of documents.
- Snowflake-style ID = time + machine + sequence in 64 bits. Unique and roughly sorted by time.
:::

# Case study: URL shortener

*Turn a long link into a short one and redirect quickly. The classic first design question.*

## 1. Requirements

**Functional:** given a long URL, return a short URL. Opening the short URL redirects to the long one. Links live for 5 years.

**Non-functional:** redirects must be fast (they sit in front of every click), the service must be highly available, and short codes should not be guessable in order.

**Out of scope:** user accounts, custom codes, click analytics.

## 2. Estimates

```text
New URLs    = 100 million per month
Write QPS   = 100,000,000 / (30 x 86,400) = about 40 per second
Read QPS    = 100 x writes (assumed)      = about 4,000 per second
URLs stored = 100 million x 12 x 5 years  = 6 billion
Storage     = 6 billion x 500 bytes       = 3 TB
Cache       = 20% of daily reads x 500 bytes
            = 0.2 x 333 million x 500 bytes = about 33 GB
```

Reads per day are 100 million x 100 / 30, about 333 million. The system is small in writes, read-heavy, and the hot data fits in the memory of a few cache servers.

## 3. API

```text
POST /api/v1/urls     body: { "longUrl": "https://..." }
                      -> 201 { "shortUrl": "https://sho.rt/2blNmw" }

GET  /{code}          -> 302 redirect, header "Location: <long URL>"
                      -> 404 if the code does not exist
```

A `301` (permanent) redirect lets browsers cache the answer, which lowers load. A `302` (temporary) redirect makes every click reach our servers, which is needed if we count clicks later.

## 4. Data model

| Column | Type | Note |
|---|---|---|
| `code` | string, primary key | The short code, for example `2blNmw` |
| `long_url` | string | The original URL |
| `created_at` | timestamp | |
| `expires_at` | timestamp | For cleanup |

The only query is "get the row for this code". There are no joins. A key-value store fits well. A SQL table sharded by `code` also works.

## 5. High-level design

:::flow Redirect path (read)
Client | GET /2blNmw
Load balancer | picks an app server
App server | looks up the code
Cache | hit: return the long URL
Database | on a miss, read and fill the cache
Client | receives 302 redirect
:::

:::flow Create path (write)
Client | POST long URL
App server | gets a new unique number
Base62 encoder | number becomes a short code
Database | saves code and long URL
:::

## 6. Deep dive: how to create the short code

How long must the code be? With 62 characters (0 to 9, a to z, A to Z):

```text
62^6 = about 56.8 billion codes
62^7 = about 3.5 trillion codes
```

We need 6 billion. Seven characters give plenty of room.

| Option | How | Problem |
|---|---|---|
| Hash the long URL and keep 7 characters | Simple | Two URLs can get the same code (a **collision**). Needs a check and retry |
| Random 7 characters | Simple, not guessable | Must check the database for a collision on every write |
| Unique counter, then Base62 | No collisions ever | Codes are guessable in order, and you need a distributed counter |

A typical design uses the third option. Each app server takes a **range** of numbers (for example one million at a time) from a small coordinator service, so servers never hand out the same number. Then the number is written in Base62.

```python
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode(n):
    if n == 0:
        return ALPHABET[0]
    out = []
    while n > 0:
        n, rem = divmod(n, 62)       # peel off one base-62 digit
        out.append(ALPHABET[rem])
    return "".join(reversed(out))

print(encode(125))            # 21
print(encode(2_000_000_000))  # 2blNmw
```

To make codes hard to guess, shuffle the number first with a reversible mix, or use Snowflake-style IDs.

## 7. Trade-offs and failure cases

| Question | Answer |
|---|---|
| Cache is down? | Reads fall back to the database. Slower but correct |
| Database too big? | Shard by `code` with consistent hashing, replicate each shard |
| Same long URL twice? | Simplest: give a new code each time. Deduplication needs an extra index on `long_url` |
| Expired links? | A background job deletes them. Also check `expires_at` on read |
| Abuse? | Rate limit creation per IP or API key |

:::warn
Do not use a plain auto-increment column from one database as the counter at scale. It makes that database a single point of failure and a bottleneck for all writes. Hand out ranges of numbers instead.
:::

:::interview How do you avoid two long URLs getting the same short code?
I avoid collisions by design instead of detecting them. Each new URL gets a globally unique number, and the short code is that number written in Base62. Unique number in means unique code out. App servers fetch ranges of numbers from a coordinator, so there is no shared counter on the hot path. If I used hashing or random codes instead, I would make the code the primary key and insert with "only if it does not exist", then retry with a new code when the insert fails.
:::

:::revise
- Two features: create a short code, redirect a code to the long URL.
- About 40 writes and 4,000 reads per second, 3 TB in 5 years: read-heavy, cache it.
- 7 Base62 characters give about 3.5 trillion codes.
- Unique number plus Base62 means no collisions. Give servers ranges of numbers.
- 301 lets browsers cache. 302 lets you count every click.
- Data model is one key-value lookup: code to long URL.
:::

# Case study: rate limiter

*Stop any one client from sending too many requests, across many servers, with almost no added delay.*

## 1. Requirements

**Functional:** limit each client (user ID, API key or IP address) to N requests per time window, with different rules per API. When the limit is passed, reject with `429` and tell the client when to retry.

**Non-functional:** very low added latency (it runs on every request), correct across many servers, and it must not take the whole product down if it fails.

## 2. Estimates

```text
Requests       = 10 million DAU x 200 requests a day = 2 billion a day
Average QPS    = 2,000,000,000 / 86,400 = about 23,000 per second
Counter memory = 1 million active clients x 100 bytes = 100 MB
```

Every request needs one counter check, so the store must handle tens of thousands of small operations per second. The data is tiny. A shared in-memory store is the natural fit.

## 3. Where it lives and its API

A typical design puts the limiter in the **API gateway**, so all services are protected by one piece of code. Internally it has one call:

```text
allow(clientId, rule) -> { allowed, remaining, retryAfterSeconds }

HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
```

## 4. Data model

| Data | Where | Example |
|---|---|---|
| Rules | Config file or database, cached in memory | `POST /login`: 5 per minute per IP |
| Counters | In-memory store with expiry (Redis-like) | key `rl:user42:28931245` with value `57` |

## 5. High-level design

:::flow Request path with a rate limiter
Client | sends request
API gateway | finds the rule for this API
Counter store | read and update the counter
Allowed | forward to the service
Over the limit | return 429 with Retry-After
:::

## 6. Deep dive: the algorithm

The algorithms were compared in the reliability chapter. Token bucket is a common choice. Here we look at the **sliding window counter**, because it shows the window edge problem clearly.

**The problem with fixed windows:** the limit is 100 per minute. A client sends 100 requests at 10:00:59 and 100 more at 10:01:01. Both windows are within the limit, but the server got 200 requests in two seconds.

**The fix:** keep the count of the previous window too, and count only the part of it that still overlaps the last 60 seconds.

```python
def allow(counts, user, now, limit, window=60):
    cur = int(now // window)                 # number of this window
    prev_count = counts.get((user, cur - 1), 0)
    cur_count = counts.get((user, cur), 0)
    passed = (now % window) / window         # 0.0 to 1.0
    # Count only the part of the old window that still overlaps.
    estimate = prev_count * (1 - passed) + cur_count
    if estimate >= limit:
        return False
    counts[(user, cur)] = cur_count + 1
    return True
```

:::example Dry run with limit = 100
The previous window had 80 requests. We are 15 seconds (25 percent) into the current window.
- Current count 30: estimate = 80 x 0.75 + 30 = 90. Below 100, so **allowed**.
- Current count 50: estimate = 80 x 0.75 + 50 = 110. Not below 100, so **rejected**.
:::

## 7. Deep dive: many servers

| Problem | What goes wrong | Typical fix |
|---|---|---|
| Local counters | Each of 10 gateways counts alone, so a client gets 10 times the limit | One shared counter store |
| Race condition | Two servers read 99, both allow, both write 100 | Make "read, check, add" one **atomic** step (an atomic increment or a small script inside the store) |
| Store is down | Nothing can be checked | Decide: **fail open** (allow all) or **fail closed** (block all) |

:::warn
"Read the counter, check it, then write it back" as three separate steps is a bug when many servers do it at once. The step must be **atomic**: it happens fully or not at all, and nobody can slip in between.
:::

## Trade-offs

- **Fail open or closed?** For a public API, a typical choice is fail open: a broken limiter should not become a full outage. For login or payment endpoints, fail closed is safer.
- **Exact or approximate?** Exact counting (a log of every request) costs memory. An approximation such as the sliding window counter is usually good enough.

:::interview How would you design a rate limiter for a distributed API?
I place it in the API gateway so every service is covered. Rules such as "100 requests per minute per user" are loaded from configuration. For each request the gateway builds a key from the client ID and the rule, and updates a counter in a shared in-memory store using an atomic operation, so that many gateway servers cannot overrun the limit together. I would use token bucket or sliding window counter, because both need only a couple of numbers per client. If the request is over the limit, I return 429 with a Retry-After header. If the counter store is unavailable, I fail open for normal APIs and fail closed for sensitive ones.
:::

:::revise
- Put the limiter at the gateway. Counters live in a shared in-memory store with expiry.
- Fixed windows allow double traffic at the edge. Sliding window counter fixes it with a weighted previous count.
- The check-and-increment must be atomic, or servers race.
- Reject with 429 and Retry-After. Decide fail open or fail closed per endpoint.
:::

# Case study: news feed

*Show each user a fresh list of posts from the people they follow, and load it in a blink.*

## 1. Requirements

**Functional:** a user can create a post, follow other users, and open a home feed with recent posts from followed accounts, newest first, loaded page by page.

**Non-functional:** the feed must load fast, the system is read-heavy, and a new post may take a few seconds to reach followers (eventual consistency is fine).

**Out of scope:** ranking by machine learning, ads, comments, media processing.

## 2. Estimates

```text
DAU            = 100 million
Posts per day  = 100 million x 0.5      = 50 million  (about 580 / s)
Feed opens     = 100 million x 10 a day = 1 billion   (about 11,600 / s)
Followers      = 200 on average
Feed entries   = 50 million x 200       = 10 billion  (about 116,000 / s)
Feed cache     = 500 post IDs x 8 bytes = 4 KB per user
               = 4 KB x 100 million users = 400 GB
```

Reads are about 20 times more than post writes. But if we copy every post to every follower, the hidden write load is 116,000 small writes per second. That number drives the whole design.

## 3. API

```text
POST /api/v1/posts                  body: { text, mediaKeys }
GET  /api/v1/feed?cursor=<lastId>&limit=20
POST /api/v1/users/{id}/follow
```

The `cursor` is the ID of the last post the client already has. "Give me 20 posts older than this ID" stays correct while new posts arrive at the top. Page numbers do not.

## 4. Data model

| Store | Key | Holds |
|---|---|---|
| Posts (sharded by `post_id`) | `post_id` (time-sorted ID) | author, text, media keys, time |
| Follows | `(follower_id, followee_id)`, indexed both ways | who follows whom |
| Feed cache | `user_id` | a list of about 500 recent post IDs |

The feed cache stores only **IDs**. The post content is fetched from a post cache when the feed is read. This keeps the feed small and means an edited post is updated in one place.

## 5. The key decision: fan-out on write or on read

**Fan-out** means delivering one post to many followers.

| | Fan-out on write (push) | Fan-out on read (pull) |
|---|---|---|
| Idea | When you post, copy the post ID into every follower's feed list | When you open the feed, collect recent posts from everyone you follow and merge |
| Feed read | Very fast: read one ready list | Slow: many queries plus a merge |
| Post write | Heavy: one write per follower | Cheap: one write |
| Weak spot | A user with 50 million followers | A user who follows thousands of accounts |

### The hybrid approach

A typical design mixes both:

- **Normal users:** fan-out on write. Their posts are pushed to the follower feeds by background workers.
- **Celebrities** (very many followers): no push. Their posts are pulled when a follower opens the feed, then merged with the ready list.
- **Inactive users:** skip them during fan-out. Build their feed when they come back.

## 6. High-level design

:::flow Write path: creating a post
Client | POST /posts
Post service | saves the post, replies at once
Queue | "new post" event
Fan-out workers | add post ID to each follower's feed list
:::

:::flow Read path: opening the feed
Client | GET /feed
Feed service | reads the ID list from the feed cache
Merge | add recent celebrity posts
Post cache | turn IDs into posts, return 20
:::

The user who posts gets a response at once. Fan-out happens in the background, and a traffic spike only makes the queue longer for a moment.

## 7. Trade-offs and failure cases

| Question | Answer |
|---|---|
| Feed cache lost? | Rebuild it with the pull method from the posts store. Slow once, then fast again |
| A post is deleted? | Feeds hold only IDs. Skip IDs whose post is missing when reading |

:::warn
Do not say "fan-out on write for everyone". The interviewer will ask what happens when an account with tens of millions of followers posts. One post would create tens of millions of writes. Always bring up the celebrity case yourself and offer the hybrid.
:::

:::interview Would you build the feed at write time or at read time?
Feeds are read much more often than posts are written, so I prefer to do the work at write time: when a user posts, background workers push the post ID into each follower's cached feed, and a feed read becomes one fast lookup. The exception is accounts with a very large number of followers, where a single post would trigger millions of writes. For those I pull their recent posts at read time and merge them with the ready list.
:::

:::revise
- The feed is read-heavy: do the heavy work when a post is written.
- Fan-out on write: fast reads, heavy writes. Fan-out on read: the opposite.
- Hybrid: push for normal users, pull for celebrities, skip inactive users.
- Fan-out runs in queue-fed workers. Feeds store post IDs only. Use cursor pagination.
:::

# Case study: chat application

*Deliver messages in real time, in order, and never lose one, even when the receiver is offline.*

## 1. Requirements

**Functional:** one-to-one chat, small group chat, delivery status (sent, delivered, read), online status, message history across devices, and delivery later if the receiver is offline.

**Non-functional:** low latency (a message should feel instant), no lost messages, correct order inside a chat, and many millions of open connections.

**Out of scope:** voice and video calls, end-to-end encryption details, very large broadcast groups.

## 2. Estimates

```text
DAU               = 50 million
Messages per day  = 50 million x 40 = 2 billion  (about 23,000 per second)
Storage per day   = 2 billion x 100 bytes = 200 GB
Storage per year  = 200 GB x 365 = 73,000 GB = 73 TB
Open connections  = 10 million at peak (assumed)
Chat servers      = 10 million / 50,000 per server (assumed) = 200
```

Two things stand out: a huge, append-only stream of small writes, and millions of long-lived connections.

## 3. API

Chat needs the server to push data, so the main channel is a **WebSocket**. Normal HTTP is used for everything that is not real time.

```text
WebSocket events (both directions)
  send_message   { chatId, clientMsgId, text }
  new_message    { chatId, messageId, senderId, text, sentAt }
  ack            { messageId, status: "delivered" | "read" }

HTTP
  GET  /api/v1/chats/{chatId}/messages?before=<messageId>&limit=50
  POST /api/v1/media/upload-url
```

`clientMsgId` is created by the phone. It works as an idempotency key: if the phone retries after a bad network, the server does not store the message twice.

## 4. Data model

| Store | Key | Why |
|---|---|---|
| Messages (wide-column or key-value) | partition key `chat_id`, sort key `message_id` | "Latest 50 messages of this chat" reads one partition, already sorted |
| Chats and members | `chat_id`, and an index by `user_id` | Who is in which chat |
| Sessions | `user_id` to chat server | Which server holds this user's connection (in-memory store) |
| Presence | `user_id` to last-seen time | Online status |

## 5. High-level design

:::flow Sending a message from A to B
User A | sends over WebSocket
Chat server 1 | checks, asks message service
Message store | saved first, gets a message ID
Session lookup | B is on chat server 7
Chat server 7 | pushes to B's connection
User B | receives and sends an ack
:::

Chat servers are **stateful**: each one holds open connections. So a small, fast session store maps every online user to the server that holds their connection. The servers pass messages to each other through a queue or a pub/sub channel.

### If B is offline

B has no active session, so the message stays saved as "not delivered" and a **push notification** is sent through the phone platform. When B opens the app, it reconnects and asks: "give me all messages after my last ID".

## 6. Deep dives

### Never lose a message

The server **stores first, then delivers**. A message is confirmed to the sender only after it is saved. Delivery is at-least-once: the server keeps a message as "not delivered" until the receiver's device acks it, and sends it again on reconnect. Duplicates are removed on the device using the message ID.

### Ordering

Phone clocks cannot be trusted. The server gives each message an ID that increases inside one chat: a per-chat sequence number or a time-sorted Snowflake-style ID. Clients sort by this ID.

In a small **group chat**, the server delivers a copy to each online member (fan-out on write). Very large groups need the pull approach, as in the news feed.

### Presence (online status)

Each client sends a heartbeat every few seconds. The server stores "last seen" with a short expiry. If heartbeats stop, the user shows as offline after the expiry. Presence can be eventually consistent, and changes are sent only to users who have that chat open.

## 7. Trade-offs and failure cases

- **A chat server dies:** its clients reconnect through the load balancer to another server and sync missed messages by last ID.
- **Media:** uploaded to object storage with a pre-signed URL. The message carries only the media key.

:::warn
Do not treat chat servers like stateless web servers. A WebSocket lives on one specific server. You need the session lookup to find it, and a clear plan for reconnect and sync when that server restarts or is deployed.
:::

:::interview How do you guarantee that messages are delivered and shown in the right order?
For delivery, the server saves the message before it confirms to the sender, and it keeps the message pending until the receiver's device sends an ack. If the receiver is offline or the connection drops, the device asks for all messages after its last known ID when it reconnects. For order, I do not trust device clocks. The server assigns an increasing ID per chat, and every client sorts by that ID, so all members see the same order.
:::

:::revise
- WebSocket for real time. Chat servers are stateful, so a session store maps user to server.
- Store first, then deliver. Ack from the device, resend on reconnect.
- Partition messages by chat ID. Order by a server-assigned ID, not by phone clocks.
- Offline users get a push notification and sync by last message ID.
:::

# Cheat sheet and revision

*Everything on a few pages: which block solves which problem, mistakes to avoid and a final checklist.*

## Which building block for which problem

| Problem you hear | Building block | Remember |
|---|---|---|
| One server is not enough | Horizontal scaling + load balancer | Make servers stateless first |
| Reads are slow or too many | Cache, read replicas, CDN | Plan invalidation and TTL |
| Writes are too many for one database | Sharding | Choose the shard key with care |
| Database must survive a crash | Replication + failover | Async replication can lose the newest writes |
| Slow work blocks the user | Message queue + workers | The work becomes eventually consistent |
| One event, many receivers | Pub/sub or a log (Kafka style) | Consumers must be idempotent |
| Traffic spikes or abuse | Rate limiter, queue as buffer | Return 429 with Retry-After |
| A dependency is slow or down | Timeout, retry with backoff, circuit breaker | Have a fallback |
| Duplicate requests or messages | Idempotency keys | Store the key with the result |
| Large files | Object storage + CDN | Only metadata goes in the database |
| Text search | Search engine with an inverted index | It is a delayed copy of the database |
| IDs across many machines | Snowflake-style IDs or UUID | Time-sorted IDs help feeds and chat |
| Real-time updates | WebSocket, or SSE for one-way | Connections are stateful |
| Users are far away | CDN, more regions | Cross-region data is harder to keep consistent |
| Money, bookings, stock | SQL transactions, strong consistency | Prefer correct over available |

## Common mistakes in interviews

| Mistake | Do this instead |
|---|---|
| Starting to draw at once | Spend the first five minutes on requirements and scope |
| Skipping estimates | Do quick maths and use it to justify choices |
| Naming tools without a reason | Say the requirement first, then the tool |
| Designing for a billion users on day one | Start simple, then scale the part that breaks first |
| Ignoring failures | For each box ask: what if this dies? |
| No trade-offs | For each choice say what you gain and what you pay |
| Silent thinking | Think aloud and check in with the interviewer |
| One giant database for everything | Pick storage by access pattern |
| Forgetting the single point of failure | Every box needs a spare |
| Fighting the interviewer's hints | A hint shows where they want to go. Follow it |

:::warn
The biggest mistake is to memorise one "perfect" design and recite it. Interviewers change the requirements on purpose ("now make it work in three regions"). If you understand the building blocks and their trade-offs, you can adapt. If you memorised a picture, you cannot.
:::

## Useful sentences for trade-offs

- "I am choosing X because the system is read-heavy. The cost is that data can be stale for a few seconds, which is fine for this feature."
- "This is the simplest thing that works at the current scale. If traffic grows 10 times, the first thing to break is the database, and I would add replicas and then shard by user ID."
- "For this feature I prefer availability. For payments I would prefer consistency."

:::interview You have five minutes left. How do you close a system design interview?
I give a short summary of the design by walking through one read and one write. Then I name the main bottlenecks and single points of failure that remain and how I would remove them. I mention what I would monitor: latency, error rate, queue length and cache hit rate. Last, I list what I would add with more time, such as multi-region support, analytics or better abuse protection. This shows that I know the design is not perfect and that I know where its limits are.
:::

## The numbers to keep in your head

| Fact | Value |
|---|---|
| Seconds in a day | 86,400, round to 100,000 |
| 1 million requests per day | about 12 per second |
| 99.9% availability | about 8.76 hours down per year |
| 99.99% availability | about 52 minutes down per year |
| 7 Base62 characters | about 3.5 trillion values |
| Quorum rule | W + R > N |
| Snowflake-style ID | 41 bits time, 10 bits machine, 12 bits sequence |

## Final revision checklist

Before an interview, check that you can explain each line to a friend in two minutes:

- The seven steps, in order, without notes.
- QPS, storage and bandwidth for any app. Long polling, SSE and WebSocket.
- Stateless servers, L4 against L7 load balancing, and three algorithms.
- Cache-aside, TTL, LRU and the stampede problem.
- SQL against NoSQL with a reason, and what an index costs. Replication lag and failover. Consistent hashing with virtual nodes.
- CAP with a real example, and the quorum rule.
- At-least-once delivery plus idempotency. Timeout, backoff with jitter, circuit breaker, token bucket.
- The four case studies: URL shortener, rate limiter, news feed, chat.

:::revise
- Always follow the seven steps: requirements, estimates, API, data model, design, deep dives, trade-offs.
- Match the building block to the problem. Never pick a tool without a reason.
- For every box in the diagram ask: what if it is slow, and what if it dies?
- Say the trade-off aloud: what you gain and what you pay.
- Start simple, find the bottleneck, then scale that part.
:::
