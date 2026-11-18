---
title: DevOps & Cloud Notes
subtitle: From "it works on my machine" to automated, observable production deployments, explained in simple language.
category: DevOps & Cloud
level: Intermediate to Pro
accent: sky
tags: docker, kubernetes, cicd, terraform, aws
highlights: Linux & Networking | Docker | GitHub Actions CI/CD | Kubernetes | AWS & Terraform | Observability
tagline: Linux • Docker • CI/CD • Kubernetes • AWS • Terraform • Observability
description: A step-by-step guide for people who can build a small web app but have never deployed or operated one. You learn Linux, networking, Git workflows, Docker, GitHub Actions, Kubernetes, AWS basics, Terraform, deployment strategies, observability, security and cost control. Every chapter has commented examples, common mistakes, interview questions with model answers and a one-minute revision box.
---

# What DevOps really is

*DevOps is a way of working where the people who write software and the people who run it share one goal: ship small changes safely and often.*

## Why this matters

You built a small web app. It runs on your laptop. Now a real user wants to open it at 2 a.m. from another city. Who starts the app? Who restarts it when it crashes? Who puts the new version live without breaking the old one?

All of that work is called **operations**. For many years, companies had two separate teams. Developers wrote the code and "threw it over the wall". The operations team had to run code they did not understand. Developers wanted change. Operations wanted stability. Both teams blamed each other.

DevOps removes that wall.

## A real-life comparison

Think of a restaurant. The cook makes the food and the waiter serves it. If the cook never talks to the waiter, the customer gets cold food and nobody knows why. In a good restaurant the kitchen and the floor work as one team, with a clear system: order slip, cooking, quality check, serving, feedback.

**DevOps** is that system for software. It is a culture plus a set of practices and tools that let one team build, test, release and run software quickly and reliably.

DevOps is not a tool. You cannot "install DevOps". Docker, Kubernetes and Terraform are only tools that help you practise it.

## The delivery loop

Every change you make travels through the same loop. The loop never ends, because feedback from production becomes the next plan.

:::flow The DevOps loop
Plan | decide a small change
Code | write and review
Build and test | automatic checks
Release | deploy safely
Operate | keep it running
Monitor | learn, then plan again
:::

## Why automation is the heart of it

A person who deploys by hand at midnight will forget a step one day. A script never forgets. Automation gives you three things:

- **Speed.** A machine runs the tests in minutes, every time.
- **Repeatability.** The same steps produce the same result on every run.
- **A record.** The script itself is the documentation of how the work is done.

Here is the smallest possible "automation": a script that replaces a list of manual steps. The example assumes a Node.js app managed by a service called `notes-api`.

```bash
#!/usr/bin/env bash
# deploy.sh: a first, very simple deploy script.
set -euo pipefail          # stop on any error or unset variable

cd /srv/notes-api
git pull --ff-only         # get the new code, fail if history diverged
npm ci --omit=dev          # install the exact locked dependencies
sudo systemctl restart notes-api   # restart the app service
curl -fsS http://localhost:3000/healthz   # fail loudly if unhealthy
echo "Deploy finished"
```

This script is not perfect, but it is already better than typing five commands from memory. The rest of these notes improve this idea step by step: containers, pipelines, Kubernetes and infrastructure written as code.

An **environment** is a place where the app runs. **Staging** is a test copy. **Production** is the live system that real users use. A **rollback** means going back to the last good version.

Compare two teams. The first releases once a month with 200 changes. Something breaks and nobody knows which change did it. The second releases a few small changes every day. If something breaks, the last change is the suspect, and a rollback takes one command. Small and frequent changes are safer than big and rare ones. This is the most important idea in the whole subject.

:::warn
Do not start by learning ten tools. A team that uses Kubernetes but deploys by hand, without tests, is not "doing DevOps". First learn the ideas: small changes, automation, fast feedback and shared ownership. Then pick the simplest tool that serves the idea.
:::

:::interview What is DevOps, in your own words?
DevOps is a way of working where development and operations share responsibility for the software, from writing it to running it in production. The goal is to deliver small changes quickly and safely. We reach that goal with automation (CI/CD pipelines, infrastructure as code), with fast feedback (monitoring and alerts), and with a culture of shared ownership instead of blame. Tools like Docker and Kubernetes support the practice, but they are not DevOps by themselves.
:::

:::revise
- DevOps is a culture and a set of practices, not a tool you install.
- The loop is plan, code, build and test, release, operate, monitor, and then again.
- Small, frequent changes are safer than big, rare releases.
- Automation gives speed, repeatability and a written record of the process.
- CI tests every change. CD makes every tested change ready to release, or releases it.
:::

# Linux and the shell for servers

*Almost every server runs Linux, so a small set of shell commands is the first real DevOps skill.*

## Why this matters

Your laptop has a screen, a mouse and windows. A server has none of these. It is a computer in a data centre, and you talk to it by typing commands. That text interface is called the **shell**. The most common shell is **Bash**.

If you can move around the file system, read logs, check a process and restart a service, you can already solve most day-to-day server problems.

## Files and folders

Think of the Linux file system as one big tree. The root of the tree is `/`. There are no drive letters like `C:`.

Configuration files live in `/etc`, logs in `/var/log`, and personal files in `/home/<user>`.

```bash
pwd                      # print the folder you are in
ls -lah                  # list files: long format, hidden, human sizes
cd /var/log              # change directory
tail -n 50 app.log       # last 50 lines
tail -f app.log          # follow the file live (Ctrl+C to stop)
grep -i "error" app.log  # find lines that contain "error"
df -h                    # free disk space per disk
```

## Users and permissions

A server is like an office building. Not everyone gets a key to every room. Linux decides who can do what with each file using **permissions**.

Every file has an owner, a group, and three sets of rights: for the owner, for the group and for everyone else. The rights are read (`r`), write (`w`) and execute (`x`).

Permissions are also written as numbers. Read is 4, write is 2, execute is 1. Add them for each of the three sets.

So `755` (owner all, others read and execute) suits scripts and folders, `644` suits normal files, and `600` (only the owner can read and write) suits private keys and `.env` files.

```bash
chmod +x deploy.sh           # make a script executable
chmod 600 ~/.ssh/id_ed25519  # a private key must be private
sudo chown -R appuser:appuser /srv/notes-api   # change the owner
```

The user `root` is the administrator. It can do anything, including deleting the whole system. You normally log in as a normal user and put `sudo` before a single command that needs admin rights.

:::warn
Never fix a "permission denied" error with `chmod 777`. That gives every user on the machine full rights on the file. Find out which user runs the program (`ps aux`), and give only that user the right it needs. Also, never run your application as `root`. If the app has a bug, the attacker gets the whole server.
:::

## Processes

A **process** is a running program. Each one has a number called a **PID** (process ID).

```bash
ps aux | grep node       # list processes, keep the lines with "node"
ss -tlnp                 # which process listens on which port
kill 4321                # politely ask process 4321 to stop (SIGTERM)
kill -9 4321             # force it to stop (SIGKILL), last option only
```

The `|` symbol is a **pipe**. It sends the output of the left command into the right command.

## systemd: keep your app running

If you start your app with `node server.js` in a terminal, it dies when you close the terminal. On a server, a manager called **systemd** starts services at boot and restarts them when they crash. You describe your service in a small **unit file**.

```text
# /etc/systemd/system/notes-api.service
[Unit]
Description=Notes API (Node.js)
After=network.target

[Service]
User=appuser
WorkingDirectory=/srv/notes-api
EnvironmentFile=/etc/notes-api.env
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload            # read the new unit file
sudo systemctl enable --now notes-api   # start now and at every boot
systemctl status notes-api              # is it running? last log lines
sudo systemctl restart notes-api        # restart after a change
journalctl -u notes-api -n 100 --no-pager   # last 100 log lines
```

## SSH: the door to the server

**SSH** (Secure Shell) is how you open a shell on a remote machine. Think of it as a locked door. A password is a weak lock. A **key pair** is a strong one: you keep the private key on your laptop, and the server only stores the public key.

```bash
ssh-keygen -t ed25519 -C "asha@laptop"   # create a key pair once
ssh-copy-id deploy@203.0.113.10          # install the public key
ssh deploy@203.0.113.10                  # log in, no password needed
```

:::interview A service on a Linux server is not responding. What do you check?
I go from outside to inside. First, is the process running: `systemctl status <service>`. Second, what did it log: `journalctl -u <service> -n 100`. Third, is it listening on the expected port: `ss -tlnp`. Fourth, can I reach it locally with `curl localhost:<port>`. Fifth, are resources finished: `df -h` for disk, `free -h` for memory, `top` for CPU. If it works locally but not from outside, I look at the firewall and the reverse proxy.
:::

:::revise
- The file system is one tree that starts at `/`. Config is in `/etc`, logs are in `/var/log`.
- Permissions are read 4, write 2, execute 1, for owner, group and others. `600` for secrets.
- Never use `chmod 777` and never run an app as `root`.
- systemd keeps services alive: `systemctl status`, `restart`, and `journalctl -u` for logs.
- Use SSH keys, not passwords. The private key never leaves your machine.
- First checks on a sick server: process, logs, port, disk, memory.
:::

# Networking essentials

*How a request finds your server: IP addresses, ports, DNS, HTTPS, reverse proxies and firewalls.*

## Why this matters

Most "the site is down" problems are network problems. The app is fine, but the request never reaches it. If you understand the path of a request, you can find the broken step quickly.

## IP addresses and ports

Think of a big apartment building. The **IP address** is the address of the building. The **port** is the flat number inside. A letter needs both to reach the right person.

- An **IP address** identifies a machine on a network, for example `203.0.113.10`.
- A **port** is a number from 1 to 65535 that identifies one program on that machine.
- A **private IP** (like `10.0.1.25` or `192.168.1.5`) works only inside a private network. A **public IP** is reachable from the internet.
- `localhost` or `127.0.0.1` means "this same machine".

| Port | Used by |
|---|---|
| 22 | SSH |
| 80 | HTTP (not encrypted) |
| 443 | HTTPS (encrypted) |
| 5432 | PostgreSQL |

A range of addresses is written in **CIDR** form, such as `10.0.1.0/24` (256 addresses). `0.0.0.0/0` means "every address on the internet".

## DNS: the phone book

People remember names. Computers need numbers. **DNS** (Domain Name System) is the phone book that turns `api.example.com` into an IP address.

An `A` record maps a name to an IPv4 address. A `CNAME` record maps a name to another name.

Each record has a **TTL** (time to live) in seconds. It tells other computers how long they may remember the answer. If you change a record, old answers can stay in caches until the TTL ends.

```bash
dig +short api.example.com        # ask DNS for the IP address
curl -I https://api.example.com   # show only the response headers
nc -zv 203.0.113.10 443           # is this port open from here?
```

## HTTP, HTTPS and TLS

**HTTP** is the language browsers and servers speak. A request has a method (`GET`, `POST`, and so on), a path and headers. A response has a status code.

| Code range | Meaning | Example |
|---|---|---|
| 2xx | Success | `200 OK`, `201 Created` |
| 3xx | Go somewhere else | `301 Moved Permanently` |
| 4xx | The client made a mistake | `401`, `403`, `404`, `429` |
| 5xx | The server failed | `500`, `502`, `503`, `504` |

Plain HTTP is like a postcard. Anyone who carries it can read it. **HTTPS** is HTTP inside a sealed envelope. The sealing is done by **TLS** (Transport Layer Security).

TLS does two jobs. It **encrypts** the traffic, and it **proves the identity** of the server with a **certificate**. A certificate is like an ID card for a domain, signed by a trusted organisation called a **certificate authority** (CA). Let's Encrypt is a well-known CA that gives free certificates.

## Reverse proxy with Nginx

Think of the reception desk in an office. Visitors do not walk directly into rooms. The receptionist receives them and sends each one to the right room.

A **reverse proxy** is that receptionist. It sits in front of your app, receives all requests from the internet and forwards them to the app. It also does TLS, compression and simple protection, so your app does not have to.

**Nginx** is a popular reverse proxy. In this example the Node.js app listens on port 3000, only on localhost. Nginx listens on 80 and 443 for the world.

```text
# /etc/nginx/conf.d/notes-api.conf
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;   # always move to HTTPS
}

server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;     # the real app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t                  # test the config before you load it
sudo systemctl reload nginx    # load it without dropping connections
```

| Error from the proxy | What it usually means |
|---|---|
| `502 Bad Gateway` | The app is down or refused the connection |
| `503 Service Unavailable` | No healthy app instance to send to |
| `504 Gateway Timeout` | The app is running but answered too slowly |

## Firewalls

A **firewall** is the security guard at the gate. It has a list of rules: which traffic may enter, on which port, from which address. Everything else is dropped. The safe way is "deny everything, then allow what you need".

```bash
# ufw is a simple firewall tool on Ubuntu servers.
sudo ufw default deny incoming    # block everything coming in
sudo ufw default allow outgoing   # the server may call out
sudo ufw allow 22/tcp             # SSH (do this BEFORE enabling)
sudo ufw allow 80/tcp             # HTTP
sudo ufw allow 443/tcp            # HTTPS
sudo ufw enable
sudo ufw status verbose
```

:::warn
Do not open your database port (5432, 3306, 27017) to `0.0.0.0/0`. Bots scan the whole internet for open databases all day. A database should accept connections only from the app servers, on a private network. The same rule applies to port 3000 of your app: only the reverse proxy needs to reach it.
:::

:::interview What happens when you type a URL in the browser and press Enter?
The browser first resolves the domain name to an IP address with DNS, using caches if it can. It opens a TCP connection to that IP on port 443 and does a TLS handshake: the server shows its certificate, the browser checks it, and both sides agree on encryption keys. The browser then sends an HTTP request. In production the request usually reaches a load balancer or reverse proxy, which forwards it to one healthy app server. The app may call a database or cache, builds a response and returns it with a status code. The browser then renders the page and requests the other assets it needs.
:::

:::revise
- IP address is the building, port is the flat. `0.0.0.0/0` means the whole internet.
- DNS turns names into IPs. Changes take time to spread because of the TTL.
- HTTPS is HTTP inside TLS. TLS encrypts and proves the server identity with a certificate.
- A reverse proxy receives all traffic, handles TLS and forwards to the app on a private port.
- 502 means the app is unreachable, 504 means the app is too slow.
- Firewalls: deny by default, allow only 22, 80 and 443 from outside, never the database.
:::

# Git workflows for teams

*How a team changes the same code every day without breaking each other's work.*

## Why this matters

You already use Git to save your own work. In a team, Git is also the starting point of every deployment. A merge to the main branch is the signal that starts the pipeline. So the way your team branches and merges decides how often and how safely you can release.

## The ideas in one picture

Think of a shared recipe book in a kitchen. Nobody writes directly in the book. A cook copies one page, improves it, asks another cook to check it, and only then the new page replaces the old one.

- A **branch** is your private copy where you make a change.
- A **commit** is one saved step, with a message that says why.
- A **pull request** (PR) is a request to merge your branch, where others review the change and automatic checks run.
- The **main branch** (`main`) is the shared book. It should always be in a working state.

:::flow A change from laptop to main
New branch | small, one purpose
Commits | clear messages
Pull request | review plus CI checks
Merge to main | pipeline starts
:::

```bash
git switch main
git pull --ff-only                    # start from the latest main
git switch -c feat/notes-search       # create a short-lived branch

# ...edit files...
git add -p                            # review each change before staging
git commit -m "Add search endpoint for notes"
git push -u origin feat/notes-search  # publish the branch
# Now open a pull request on GitHub and ask for a review.
```

## Trunk-based or long feature branches

There are two common styles.

| | Trunk-based | Long-lived feature branches |
|---|---|---|
| Branch life | Hours to a couple of days | Weeks |
| Merge size | Small | Large |
| Merge conflicts | Rare and small | Frequent and painful |
| Unfinished work | Hidden behind a feature flag | Stays on the branch |
| Good for | Teams that deploy often | Software with planned versions |

**Trunk-based development** means everyone merges small changes into `main` (the trunk) very often. It fits CI/CD well, because the pipeline always tests something close to what will be deployed. Most web teams aim for this style.

If a feature takes two weeks, you still merge every day. The unfinished part is switched off with a **feature flag**, which is a simple on/off setting in the code. You will see flags again in the chapter on deployment strategies.

While you work, `main` moves forward. Bring those changes into your branch with `git rebase origin/main` (replays your commits on top, a straight history) or `git merge origin/main` (adds a merge commit, rewrites nothing). Both are fine. Follow the rule of your team.

:::warn
Never rewrite the history of a shared branch such as `main`. `git push --force` on a shared branch can delete the commits of your teammates. On your own branch, use `--force-with-lease`. It refuses to push if someone else has pushed in the meantime. Also protect `main` in the repository settings: require a pull request, one review and passing checks before a merge.
:::

To undo a bad commit on `main`, use `git revert <commit-id>`. It adds a new commit that reverses the old one, so no history is rewritten, and the undo goes through the pipeline like any other change.

## Tags and releases

A **tag** is a name stuck on one commit, like a label on a jar. Teams use tags to mark releases. A common naming style is **semantic versioning**: `MAJOR.MINOR.PATCH`.

Increase MAJOR when you break existing users, MINOR when you add a feature, and PATCH when you fix a bug.

```bash
git tag -a v1.5.0 -m "Release 1.5.0: notes search"
git push origin v1.5.0        # a pushed tag can trigger a release build
git describe --tags           # which release is this commit based on?
```

Secrets never go into Git. List files such as `.env`, `*.pem` and `terraform.tfstate*` in a `.gitignore` file from the first day. If a password was already pushed, deleting the file is not enough, because it stays in the history. Treat it as leaked and change it at once.

:::interview What is the difference between git merge and git rebase?
Both bring changes from one branch into another. `merge` creates a merge commit that joins the two histories, so nothing is rewritten. `rebase` moves my commits and replays them on top of the target branch, which gives a straight history but creates new commit IDs. I rebase only my own, unshared branch. I never rebase a branch that other people have pulled, because it rewrites history under them.
:::

:::revise
- One branch per small change. Merge through a pull request with review and CI checks.
- Trunk-based development: short branches, small merges, `main` always releasable.
- `rebase` rewrites your own branch into a straight line. `merge` keeps history as it was.
- Never force push to a shared branch. Use `git revert` to undo on `main`.
- Tags mark releases. Semantic versioning is MAJOR.MINOR.PATCH.
- Secrets never go into Git. If one does, rotate it immediately.
:::

# Docker fundamentals

*A container packs your app together with everything it needs, so it runs the same on every machine.*

## Why this matters

"It works on my machine" is the oldest problem in software. Your laptop has Node.js version X and a certain set of system libraries. The server has version Y. The app starts on one and crashes on the other.

Docker solves this by shipping the environment together with the app.

## A real-life comparison

Think of a tiffin box. It carries the food, and the food arrives the same way at the office, in the train or at school. You do not need the kitchen where it was cooked.

A **container** is a tiffin box for software. It carries your code, the runtime (for example Node.js), the system libraries and the settings. Any machine that has Docker can open it and run it, with the same result.

## Image and container

These two words confuse many beginners.

- An **image** is the packed, read-only template. Compare it with a recipe, or a class in programming.
- A **container** is a running instance of an image. Compare it with the cooked dish, or an object created from the class.

You can start many containers from one image. When a container is removed, the image stays.

A **registry** is a store for images, such as Docker Hub or GHCR. A **tag** is a label for one version of an image, such as `:1.5.0`.

:::flow From source code to a running container
Dockerfile | the recipe
docker build | creates an image
Registry | stores and shares it
docker run | starts a container
:::

A container is not a **virtual machine** (VM). A VM is like a separate house with its own full operating system. A container is like a flat in a building: it has its own walls and door, but it shares the building, which is the **kernel** (the core) of the host operating system. So a container is much smaller and starts in about a second, but its isolation is weaker.

## Your first Dockerfile

This Dockerfile packs a Node.js API. The version tags are examples. Use the current long-term-support version when you read this.

```dockerfile
# Start from an official base image that already has Node.js.
FROM node:22-alpine

# All next commands run inside this folder in the image.
WORKDIR /app

# Copy only the dependency lists first (explained below).
COPY package*.json ./
RUN npm ci --omit=dev

# Now copy the rest of the source code.
COPY . .

ENV NODE_ENV=production
# Documentation only: the app listens on port 3000.
EXPOSE 3000

# Do not run as root. The Node image has a user named "node".
USER node
CMD ["node", "src/server.js"]
```

```bash
docker build -t notes-api:1.0.0 .    # build an image from this folder
docker images                        # list local images
docker run -d --name api -p 8080:3000 notes-api:1.0.0
# -d: run in the background   -p HOST:CONTAINER: publish the port
curl http://localhost:8080/healthz   # the app answers on the host port
docker ps                            # running containers
docker logs -f api                   # follow the logs
docker exec -it api sh               # open a shell inside the container
docker stop api && docker rm api     # stop and remove it
```

## Layers and the build cache

An image is built in **layers**, like a stack of transparent sheets. Each instruction such as `FROM`, `COPY` or `RUN` adds one sheet. Docker saves every layer. On the next build, if an instruction and its input files did not change, Docker reuses the saved layer. That is the **build cache**.

The cache works from top to bottom. When one layer changes, every layer after it is rebuilt. This is why the Dockerfile above copies `package*.json` first. Your source code changes many times a day, but your dependencies change rarely. With this order, `npm ci` is skipped on most builds.

## The .dockerignore file

`COPY . .` copies everything in the folder. You do not want your local `node_modules`, your Git history or your secrets inside the image. A `.dockerignore` file lists what to leave out.

```text
node_modules
npm-debug.log
.git
.env
.env.*
dist
coverage
Dockerfile
docker-compose.yml
```

## Volumes: data that survives

A container is disposable, like a paper plate. When you remove it, every file written inside it is gone. For data that must survive, such as a database, you attach a **volume**. A volume is storage that lives outside the container.

```bash
docker volume create pgdata
docker run -d --name db \
  -e POSTGRES_PASSWORD=devpassword \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
# Remove the container. The data stays in the volume "pgdata".
docker rm -f db
docker volume ls
```

## Networks: containers talking to each other

Inside a container, `localhost` means the container itself, not your laptop and not another container. To let containers talk, put them on the same Docker **network**. They can then reach each other by container name.

For example, an API container on the same network can use the database URL `postgres://app:secret@db:5432/notes`, where `db` is the name of the database container. Docker Compose, in the next chapter, sets up such a network for you.

:::warn
Do not put secrets in a Dockerfile with `ENV` or `ARG`, and do not `COPY` a `.env` file into the image. Anyone who can pull the image can read every layer with `docker history` or by unpacking it. Pass secrets at run time, with `-e`, an env file that stays on the server, or a secret manager.
:::

:::interview What is the difference between an image and a container?
An image is a read-only package that holds the app, its runtime and its libraries, built from a Dockerfile in layers. A container is a running instance of that image, with a thin writable layer on top and its own isolated processes and network. One image can start many containers. Removing a container does not remove the image, and data written inside a container is lost unless it is in a volume.
:::

:::revise
- A container is a tiffin box: the app plus everything it needs, the same on every machine.
- Image is the template, container is the running instance.
- Containers share the host kernel, so they are much lighter than virtual machines.
- Layers are cached top to bottom. Copy dependency files first, source code later.
- Use `.dockerignore`, run as a non-root user, and never bake secrets into an image.
- Volumes keep data. Containers on one network reach each other by name, not by `localhost`.
:::

# Production images and Docker Compose

*How to build small, safe images, and how to run a whole local stack with one command.*

## Why this matters

The Dockerfile from the last chapter works, but a production image has higher demands. It should be **small** (faster to push, pull and start), **safe** (less software inside means fewer security holes) and **fast to build** (good use of the cache).

Think of packing for a trek. You do not carry your whole cupboard. You carry only what you need on the mountain. A production image should carry only what the app needs to run, not the tools that were needed to build it.

## Multi-stage builds

To build a TypeScript or React app you need compilers and development dependencies. To run it you need only the compiled output. A **multi-stage build** uses several `FROM` lines in one Dockerfile. The first stage builds. The last stage copies only the result. Everything else is thrown away.

```dockerfile
# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies, including dev tools for the build.
RUN npm ci
COPY . .
# The build script writes compiled files to /app/dist.
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Only production dependencies go into the final image.
RUN npm ci --omit=dev && npm cache clean --force
# Take the compiled output from the first stage.
COPY --from=build /app/dist ./dist
# The official Node image already has a non-root user named "node".
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

The final image has no TypeScript compiler, no test tools and no source files. Only the last stage is shipped.

Note that a Dockerfile comment must be on its own line. You cannot put it at the end of an instruction, as you can in Bash.

## Choosing a base image

The base image is the first layer, and often the biggest one.

| Base type | Example tag | What you get |
|---|---|---|
| Full | `node:22` | A full Debian system. Big, easy to debug |
| Slim | `node:22-slim` | Debian with fewer packages. A safe default |
| Alpine | `node:22-alpine` | Very small. Uses musl instead of glibc |
| Distroless | `gcr.io/distroless/nodejs22-debian12` | Only the runtime. No shell |

**Alpine** is small, but it uses a different C library (musl), and some packages with native code behave differently on it. If you see strange errors, try the slim image. **Distroless** images contain the runtime and nothing else: no shell and no package manager. An attacker who gets in finds almost no tools, but you also cannot open a shell inside the container to debug.

:::warn
Do not deploy the tag `latest`. It is a moving label, so two servers can pull "latest" on different days and run different code, and you cannot tell which version is live. Tag every image with something that never changes, such as the Git commit ID (`notes-api:3f9c2ab`) or a release version (`notes-api:1.5.0`). A rollback is then simply "run the previous tag".
:::

## Scanning images

Your image contains packages written by other people. New security holes (called **vulnerabilities** or CVEs) are found in them all the time. An **image scanner** reads the package list inside the image and compares it with public vulnerability databases. Trivy and Grype are two open source scanners. Docker Scout is built into Docker Desktop.

```bash
# Scan a local image. Fail (exit code 1) on serious findings.
trivy image --severity HIGH,CRITICAL --exit-code 1 notes-api:1.5.0

docker history notes-api:1.5.0   # size added by each layer
```

Run the scanner in your pipeline, so a bad image never reaches production. Rebuild images regularly, because the base image receives security fixes even when your code does not change.

## Docker Compose for local stacks

A real app is rarely one container. You have an API, a database and maybe a cache. Starting each with a long `docker run` command is slow and easy to get wrong.

**Docker Compose** lets you describe the whole stack in one YAML file and start it with one command. Think of it as the conductor of a small orchestra: each musician is a container, and the conductor starts them in the right order.

```yaml
# compose.yaml
services:
  api:
    build: .                      # build from the Dockerfile here
    ports:
      - "8080:3000"               # host port 8080, container port 3000
    environment:
      DATABASE_URL: postgres://app:devpassword@db:5432/notes
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy   # wait until the db is ready
      cache:
        condition: service_started

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: devpassword   # for local development only
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d notes"]
      interval: 5s
      timeout: 3s
      retries: 10
```

The same file continues with the cache and the list of named volumes:

```yaml
  cache:
    image: redis:7-alpine

volumes:
  pgdata:                         # named volume, survives "down"
```

Compose creates one network for the stack. Each service can reach the others by service name, which is why the database host in the URL is simply `db`.

```bash
docker compose up -d --build     # build images and start everything
docker compose ps                # status of each service
docker compose logs -f api       # follow the logs of one service
docker compose exec db psql -U app -d notes   # open a database shell
docker compose down              # stop and remove containers
docker compose down -v           # also delete the volumes (data lost)
```

:::note
Without a health check, `depends_on` only waits until the database container has **started**, not until PostgreSQL is **ready**. The API then crashes with "connection refused" on the first start. The `healthcheck` plus `condition: service_healthy` fixes this. Your app should also retry the database connection a few times at startup.
:::

:::interview How do you reduce the size of a Docker image?
First, I use a multi-stage build, so compilers and dev dependencies stay in the build stage and only the output is copied to the final stage. Second, I choose a small base image such as slim, alpine or distroless. Third, I add a `.dockerignore` so the build context has no `node_modules`, Git history or test data. Fourth, I install only production dependencies and clean the package cache in the same `RUN` instruction, because files deleted in a later layer still take space in the earlier one. I check the result with `docker history`.
:::

:::revise
- Multi-stage build: build in one stage, copy only the output to a small final stage.
- Smaller base means faster pulls and fewer vulnerabilities. Distroless has no shell.
- Run as non-root, log to standard output, one process per container.
- Never deploy `latest`. Use immutable tags such as the commit ID.
- Scan images in the pipeline and rebuild them regularly.
- Compose describes a multi-container stack in one file. Services reach each other by name.
:::

# CI/CD with GitHub Actions

*A pipeline is a robot that checks, builds and ships every change in the same way, every time.*

## Why this matters

A **CI/CD pipeline** runs the steps automatically on every push. Nobody can skip the tests, and every image is built in the same clean environment.

## A real-life comparison

Think of an assembly line in a factory. Each station does one job and checks the product before it moves on. If a station finds a defect, the line stops and the bad product never reaches the customer.

- **CI (Continuous Integration)** is the first half of the line: on every change, install, lint, test and build.
- **CD (Continuous Delivery or Deployment)** is the second half: package the tested build and release it to an environment.

:::flow A typical pipeline
Push or PR | the trigger
Lint and test | fast feedback
Build image | tagged with commit ID
Push to registry | store the artifact
Deploy | staging, then production
:::

The golden rule is **build once, deploy many times**. You build one image, and the same image moves from staging to production. Only the configuration changes. If you rebuild for each environment, you are no longer testing the thing you ship.

## The vocabulary of GitHub Actions

GitHub Actions is the CI/CD system built into GitHub. A pipeline is a YAML file in the folder `.github/workflows/`.

A **workflow** is one YAML file. An **event** (a push, a pull request, a schedule) starts it. A workflow has **jobs**, and each job runs its **steps** on a fresh machine called a **runner**. A step is a shell command (`run`) or a reusable **action** (`uses`).

## A real workflow, part 1: test every change

This job runs for every pull request and every push to `main`. The action versions (such as `@v4`) are examples. Check the page of each action for its current major version.

```yaml
# .github/workflows/ci.yml
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read            # the token may only read the repository

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the code
        uses: actions/checkout@v4
      - name: Set up Node.js with npm cache
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm        # reuse downloaded packages between runs
      - name: Install exact dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm test
```

**Linting** is an automatic check of code style and simple mistakes. Put the fastest checks first, so developers get feedback early.

## Part 2: build and push the image

The second job runs only after the tests pass, and only on `main`. It builds the image and pushes it to **GHCR** (GitHub Container Registry). This job continues in the same file, under `jobs:`.

```yaml
  image:
    needs: test                       # wait for the test job
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write                 # allow pushing to GHCR
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha        # reuse layers from older runs
          cache-to: type=gha,mode=max
```

`${{ github.sha }}` is the ID of the commit. Each image gets a unique, immutable tag, and you can always trace a running container back to the exact code. Image names must be lower case, so this example assumes a lower-case repository name.

## Secrets

A pipeline needs passwords: a registry token, a cloud key, a database URL for migrations. These never go into the YAML file. You store them in the repository settings as **secrets**, and read them with `${{ secrets.NAME }}`. GitHub hides their values in the logs.

`GITHUB_TOKEN` is a special secret that GitHub creates for each run. Use the `permissions` block to give it only the rights the job needs.

:::warn
Be careful with secrets and pull requests from forks. A stranger can open a pull request that changes the workflow or the test scripts. For that reason GitHub does not pass your secrets to workflows triggered by `pull_request` from a fork. Do not work around this with `pull_request_target` plus a checkout of the pull request code. That runs untrusted code with access to your secrets.
:::

**Caching** keeps the pipeline fast. The workflow above caches downloaded npm packages (`cache: npm`) and Docker layers (`cache-from`, `cache-to`).

## Environments and approvals

An **environment** in GitHub is a named target such as `staging` or `production`. Each can have its own secrets and its own **protection rules**. A common rule is "a named reviewer must approve before a job that uses this environment starts".

```yaml
  deploy-production:
    needs: image
    runs-on: ubuntu-latest
    environment: production     # waits here for a reviewer to approve
    concurrency: production     # never run two production deploys at once
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh production "${{ github.sha }}"
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

`./scripts/deploy.sh` stands for your own deploy step. A staging job looks the same, with `environment: staging`, and runs before this one. The same commit ID travels through both environments. You do not rebuild.

:::interview Explain the stages of a CI/CD pipeline you would build for a web API.
On every pull request I run the fast checks: install with a lock file, lint, unit tests, and a build. On a merge to `main` I build a Docker image once, tag it with the commit ID, scan it and push it to a registry. Then I deploy that same image to staging and run smoke tests against it. Production needs an approval, or is automatic if the team trusts its tests. After the deploy I check health and metrics, and I keep the previous image tag ready for a rollback.
:::

:::revise
- CI checks every change automatically. CD releases the tested build.
- A workflow has events, jobs and steps. Each job runs on a fresh runner.
- Fast checks first: lint, then tests, then the image build.
- Build once, tag with the commit ID, promote the same image through the environments.
- Secrets live in the CI secret store. Give `GITHUB_TOKEN` the minimum permissions.
- Use environments with approvals for production, and caching to keep the pipeline fast.
:::

# Kubernetes core concepts

*Kubernetes runs your containers on many machines and keeps them in the state you asked for.*

## Why this matters

Docker runs a container on one machine. In production you need more. What if that machine dies at night? What if traffic doubles? How do you update ten copies of the app with no downtime?

You could write scripts for all of this. Kubernetes is the well-tested answer that the industry agreed on.

## A real-life comparison

Think of the manager of a big school. You tell the manager: "Class 8 must always have three teachers present." The manager does the rest. If a teacher is sick, a replacement is sent. You do not say **how**. You say **what you want**.

**Kubernetes** (often written K8s) is that manager for containers. You write the **desired state** in YAML files, for example "run three copies of this image". Kubernetes compares the desired state with the real state again and again, and fixes any difference. This is called **reconciliation**. Describing the result instead of the steps is called the **declarative** style.

## The parts of a cluster

A **cluster** is a group of machines that Kubernetes manages as one.

- A **node** is one machine (virtual or physical) in the cluster. Your containers run on worker nodes.
- The **control plane** is the brain. Its **API server** receives your requests, **etcd** is the database that stores the desired state, the **scheduler** picks a node for each new pod, and **controllers** do the reconciliation.
- On every node, the **kubelet** is an agent that starts and watches the containers.
- **kubectl** is the command line tool you use to talk to the API server.

## The objects you use every day

The objects you use every day are the Pod, Deployment, Service, Ingress, ConfigMap, Secret and Namespace. The next sections explain them one by one.

## Pod and Deployment

A **pod** wraps one container (sometimes a few that must work closely together). Each pod gets its own IP address. Pods are disposable. They can be killed and recreated at any time, with a new name and a new IP.

You almost never create a pod directly. You create a **Deployment** and tell it how many copies (**replicas**) you want. The image tag below is an example.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
  namespace: notes
  labels:
    app: notes-api
spec:
  replicas: 3                    # desired number of pods
  selector:
    matchLabels:
      app: notes-api             # this Deployment owns pods with this label
  template:                      # the pod template
    metadata:
      labels:
        app: notes-api           # must match the selector above
    spec:
      containers:
        - name: api
          image: ghcr.io/example/notes-api:3f9c2ab
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: notes-api-config
            - secretRef:
                name: notes-api-secret
```

**Labels** are simple key and value tags, such as `app: notes-api`. They are the glue of Kubernetes. A Deployment finds its pods by label. A Service finds its pods by label.

## Service

Pods come and go, and their IPs change. Other programs need one stable address. A **Service** is like the reception number of a company. Staff change, but the number stays the same, and the call reaches someone who is available.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notes-api
  namespace: notes
spec:
  type: ClusterIP                # reachable only inside the cluster
  selector:
    app: notes-api               # send traffic to pods with this label
  ports:
    - port: 80                   # the port of the Service
      targetPort: 3000           # the port of the container
```

Inside the cluster, other pods can now call `http://notes-api` (same namespace) or `http://notes-api.notes.svc.cluster.local` (full name). Kubernetes spreads the requests across the healthy pods.

The default type, `ClusterIP`, is reachable only inside the cluster. The type `LoadBalancer` asks the cloud for a public load balancer in front of the Service.

## Ingress

If you have ten services, ten cloud load balancers are expensive. An **Ingress** is one front door for many services. It routes HTTP requests by host name and path, and it can handle TLS.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: notes
  namespace: notes
spec:
  ingressClassName: nginx        # which ingress controller handles this
  tls:
    - hosts: [api.example.com]
      secretName: api-example-com-tls   # certificate stored as a Secret
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: notes-api
                port:
                  number: 80
```

An Ingress object is only a set of rules. It does nothing until an **ingress controller** runs in the cluster and reads those rules. The controller is the real reverse proxy. Several controllers exist, and cloud providers offer their own.

:::note
Kubernetes also has a newer set of objects called the **Gateway API**, which does the same job as Ingress with more features. Ingress is still supported and still asked in interviews. Learn Ingress first, then read about the Gateway API, and check the current documentation before you choose a controller.
:::

## ConfigMap, Secret and Namespace

The same image must run in staging and in production. So settings live outside the image. A **ConfigMap** holds normal settings. A **Secret** holds sensitive ones.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: notes-api-config
  namespace: notes
data:
  NODE_ENV: production
  LOG_LEVEL: info
---
apiVersion: v1
kind: Secret
metadata:
  name: notes-api-secret
  namespace: notes
type: Opaque
stringData:                      # plain text here, stored base64 encoded
  DATABASE_URL: postgres://app:CHANGE_ME@db.internal:5432/notes
```

The line `---` separates several objects in one file. A **namespace** is like a folder (create one with `kubectl create namespace notes`). Names must be unique inside a namespace, and you can give different teams rights on different namespaces.

:::warn
A Kubernetes Secret is **encoded** with base64, not **encrypted**. Anyone can decode base64. So a Secret YAML file with real values must never be committed to Git. Create secrets from your CI system or from a secret manager, limit who can read them with access rules (RBAC), and turn on encryption at rest for the cluster. The file above is only for learning.
:::

You send these files to the cluster with `kubectl apply -f <folder>`. The next chapter shows the `kubectl` commands you use every day.

:::interview What is the difference between a Pod, a Deployment and a Service?
A Pod is the smallest unit and runs one or more containers with a shared network. It is temporary and gets a new IP whenever it is recreated. A Deployment manages a set of identical pods: it keeps the wanted number of replicas alive and performs rolling updates and rollbacks. A Service gives those pods one stable name and virtual IP and load balances traffic across the ready ones, using label selectors. So the Deployment answers "how many and which version", and the Service answers "how do I reach them".
:::

:::revise
- Kubernetes keeps the real state equal to the desired state you wrote in YAML.
- Cluster = control plane (API server, etcd, scheduler, controllers) plus worker nodes.
- Pod runs containers. Deployment keeps N pods and updates them. Service gives a stable address.
- Ingress is one HTTP front door for many services, and it needs an ingress controller.
- ConfigMap for settings, Secret for sensitive values. Secrets are base64, not encrypted.
- Labels and selectors connect Deployments and Services to their pods.
:::

# Running apps well on Kubernetes

*Probes, resource limits, safe updates, autoscaling and the kubectl commands that find the problem.*

## Why this matters

Starting an app on Kubernetes is easy. Running it **well** means it survives bad releases, traffic peaks and slow starts without waking you up at night.

## Health probes

Think of a new employee. "Has the person arrived?" and "Is the person ready to serve customers?" are different questions. Kubernetes asks these questions about every container with **probes**.

| Probe | Question | If it fails |
|---|---|---|
| Liveness | Is the app stuck or dead? | The container is restarted |
| Readiness | Can it take traffic right now? | The pod is removed from the Service |
| Startup | Has the slow start finished? | The other probes wait |

```yaml
# Inside the container spec of the Deployment.
          readinessProbe:
            httpGet:
              path: /readyz          # checks the app AND its database
              port: 3000
            periodSeconds: 5
            failureThreshold: 3      # 3 failures in a row = not ready
          livenessProbe:
            httpGet:
              path: /healthz         # only "is the process alive"
              port: 3000
            periodSeconds: 10
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /healthz
              port: 3000
            periodSeconds: 5
            failureThreshold: 30     # allow up to 150 seconds to start
```

:::warn
Do not check the database in the **liveness** probe. If the database is slow for a minute, every pod fails its liveness check, Kubernetes restarts all of them at once, and a small problem becomes a full outage. Liveness should only say "this process is alive". Dependencies belong in the **readiness** probe, which only stops traffic and does not restart anything.
:::

## Resource requests and limits

Think of booking seats in a train. A **request** is your reserved seat: Kubernetes guarantees that much and uses it to choose a node. A **limit** is the maximum you may ever use.

- CPU is measured in **millicores**. `500m` is half a CPU core.
- Memory is measured in bytes. `256Mi` is 256 mebibytes.

```yaml
          resources:
            requests:
              cpu: 250m              # reserved, used for scheduling
              memory: 256Mi
            limits:
              memory: 512Mi          # above this the container is killed
```

A container that goes over its **memory** limit is killed, and you see the status `OOMKilled` (out of memory killed). A container that reaches a **CPU** limit is only slowed down. Many teams set a memory limit and a CPU request, and leave the CPU limit out.

Always set requests. To pick numbers, look at real usage with `kubectl top pods` over a normal day and add some room.

## Rolling updates and rollbacks

When you change the image tag, a Deployment does a **rolling update**. It starts new pods, waits until they are ready and then removes old pods, a few at a time. Users do not notice, provided your readiness probe is honest.

Two settings of the Deployment control the speed: `maxSurge` (how many extra pods may exist during the update) and `maxUnavailable` (how many may be missing). With `maxUnavailable: 0`, capacity never drops below the desired count.

```bash
# Release a new version by changing the image.
kubectl set image deploy/notes-api api=ghcr.io/example/notes-api:8a1b2c3 \
  -n notes
kubectl rollout status deploy/notes-api -n notes    # watch it finish

# Something is wrong: go back to the previous version.
kubectl rollout undo deploy/notes-api -n notes
```

When Kubernetes stops a pod, it sends the signal `SIGTERM` and waits (30 seconds by default). Your app should catch this signal, finish the requests in progress and then exit. This is called a **graceful shutdown**.

## Autoscaling with the HPA

Traffic is not the same at 3 a.m. and at 8 p.m. The **Horizontal Pod Autoscaler** (HPA) changes the number of replicas for you. "Horizontal" means more copies, not bigger copies.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notes-api
  namespace: notes
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notes-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # percent of the CPU REQUEST
```

The HPA needs two things to work. The cluster must run the **metrics server**, and the pods must have a CPU request, because the target is a percentage of that request. With an HPA, remove the fixed `replicas` line from your manifest, or each deploy resets the number the autoscaler chose.

## Debugging with kubectl

When something is wrong, read the status first. It usually tells you where to look.

| Pod status | What it usually means | First command |
|---|---|---|
| `Pending` | No node has room, or a volume is missing | `kubectl describe pod` |
| `ImagePullBackOff` | Wrong image name or tag, or no registry access | `kubectl describe pod` |
| `CrashLoopBackOff` | The app starts and crashes, again and again | `kubectl logs --previous` |
| `OOMKilled` | The memory limit was reached | `kubectl describe pod` |
| `Running`, not ready | The readiness probe fails | `kubectl describe pod` |

```bash
kubectl get pods -n notes -o wide          # status, restarts, node, IP
kubectl describe pod <pod> -n notes        # read "Events" at the bottom
kubectl logs <pod> -n notes --tail=100     # recent logs
kubectl logs <pod> -n notes --previous     # logs of the crashed container
kubectl get events -n notes --sort-by=.lastTimestamp
kubectl port-forward svc/notes-api 8080:80 -n notes   # test from laptop
kubectl top pods -n notes                  # live CPU and memory use
```

:::example Debugging a CrashLoopBackOff
A pod shows `CrashLoopBackOff` with 6 restarts. `kubectl logs <pod> --previous` prints `Error: DATABASE_URL is not set`. So the app is fine and the configuration is missing. `kubectl describe pod` shows that the pod reads the Secret `notes-api-secret`, but `kubectl get secret` lists only `notes-api-secrets`, with an extra "s". Fix the name in the YAML and apply it. The order is always the same: status, logs, describe and events, then configuration.
:::

:::interview What is the difference between a liveness probe and a readiness probe?
The liveness probe answers "is this container broken beyond repair". If it fails, the kubelet restarts the container. The readiness probe answers "can this pod serve requests now". If it fails, the pod is taken out of the Service endpoints, so it gets no traffic, but it is not restarted. Readiness may check dependencies such as the database. Liveness should not, because a shared dependency problem would then restart every pod at the same time.
:::

:::revise
- Liveness restarts a stuck container. Readiness only stops traffic. Startup protects slow starts.
- Requests reserve resources for scheduling. Over the memory limit means `OOMKilled`.
- Rolling updates replace pods step by step. `kubectl rollout undo` goes back.
- Handle `SIGTERM` in the app for a graceful shutdown.
- HPA scales replicas on metrics. It needs the metrics server and CPU requests.
- Debug order: `get pods`, `logs --previous`, `describe`, events, then config.
:::

# Cloud fundamentals with AWS

*The cloud is someone else's data centre that you rent by the hour and control through an API.*

## Why this matters

Buying your own servers is like buying a generator for your house. You pay a lot at the start, you maintain it yourself, and it is either too small or too big. Using the cloud is like taking electricity from the grid. You use what you need, and you pay for what you use.

A **cloud provider** rents computers, storage, databases and networks as services. You create them in minutes with a web console, a command line tool or code. These notes use **AWS** (Amazon Web Services) as the example. The ideas are the same on Microsoft Azure and Google Cloud.

## Regions and availability zones

- A **region** is a geographic area with a group of data centres, for example Mumbai (`ap-south-1`).
- An **availability zone** (AZ) is one or more separate data centres inside a region, with their own power and network. A region has several AZs.

Pick a region close to your users for speed, and check any rules about where data must be stored. To survive the failure of one data centre, run your app in at least two AZs.

## IAM and least privilege

**IAM** (Identity and Access Management) decides **who** can do **what** on **which** resource. Think of a hotel key card. It opens your room and the gym, not every room in the hotel.

A **user** is a long-lived identity for a person. A **role** is an identity with no password that a person or a service takes on for a short time. A **policy** is a JSON document that lists allowed actions. The **root user** owns the account and can do everything.

**Least privilege** means: give each identity only the permissions it needs for its job, and nothing more. This policy lets an app read and write objects in one bucket only.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWriteNotesUploadsOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::gopo-demo-uploads/*"
    }
  ]
}
```

The `Version` value is the fixed version of the policy language, not a date you change. An **ARN** (Amazon Resource Name) is the unique ID of a resource.

:::warn
The most common and most expensive cloud mistake is a leaked access key, for example one pushed to a public Git repository. Bots find such keys quickly and start costly servers in your account. Do not use the root user for daily work. Turn on multi-factor authentication. Prefer **roles** with short-lived credentials over long-lived access keys: an EC2 instance, a pod or a GitHub Actions job can take on a role without any stored key.
:::

## VPC, subnets and security groups

A **VPC** (Virtual Private Cloud) is your own private network inside the cloud. Think of a gated housing society. It has a wall, a main gate and inner lanes.

- A **subnet** is a part of the VPC in one AZ, with its own IP range.
- A **public subnet** has a route to the internet through an **internet gateway**. Load balancers live here.
- A **private subnet** has no direct route from the internet. App servers and databases live here. They reach the internet for updates through a **NAT gateway**.
- A **security group** is a firewall around a resource. It lists what traffic is allowed in and out.

| Security group | Allows inbound | From |
|---|---|---|
| Load balancer | 443 | Anywhere (`0.0.0.0/0`) |
| App servers | 3000 | The load balancer security group only |
| Database | 5432 | The app security group only |

Notice that the source of a rule can be another security group. The database accepts connections only from the app servers, whatever their IP addresses are.

## The core services

| Service | What it is | Plain comparison |
|---|---|---|
| EC2 | Virtual servers | A rented computer |
| S3 | Object storage | A drive with unlimited folders |
| RDS | Managed relational databases | A database with a caretaker |
| ELB / ALB | Load balancers | A traffic police officer |
| EKS | Managed Kubernetes | Kubernetes with the brain run for you |

On **EC2** you choose an instance type (how much CPU and memory) and manage the operating system yourself. **S3** stores files as objects inside buckets. It is perfect for uploads, backups and logs. Keep buckets private and share files with short-lived signed links. **RDS** handles database backups, patches and failover, but you still design the schema and tune the queries. **EKS** runs the Kubernetes control plane for you, and you use `kubectl` as usual.

```bash
# The AWS CLI. Configure it once with: aws configure sso
aws sts get-caller-identity          # who am I logged in as?
aws s3 ls                            # list my buckets
aws s3 cp backup.sql.gz s3://gopo-demo-backups/2026/backup.sql.gz
aws ec2 describe-instances \
  --query "Reservations[].Instances[].[InstanceId,State.Name]" \
  --output table
# Fetch credentials so kubectl can talk to an EKS cluster.
aws eks update-kubeconfig --name demo-cluster --region ap-south-1
```

A managed service such as RDS costs more per hour than a raw server, but it saves engineering time, which is usually more expensive. For a small team, start with managed services.

## The same ideas on other clouds

Once you know one cloud, the others are mostly new names for the same ideas.

| Idea | AWS | Azure | Google Cloud |
|---|---|---|---|
| Virtual server | EC2 | Virtual Machines | Compute Engine |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Managed SQL | RDS | Azure SQL Database | Cloud SQL |
| Private network | VPC | Virtual Network | VPC |
| Managed Kubernetes | EKS | AKS | GKE |

:::interview What is the difference between a security group and a network ACL in AWS?
A security group is attached to a resource such as an instance or a load balancer. It is **stateful**: if a request is allowed in, the response is allowed out automatically. It has only allow rules. A network ACL is attached to a subnet. It is **stateless**, so you need rules for both directions, and it supports both allow and deny rules. In daily work I use security groups for almost everything and network ACLs only for broad subnet-level blocks.
:::

:::revise
- Region is a location, AZ is a separate data centre in it. Use at least two AZs.
- IAM: who can do what on which resource. Least privilege, roles over long-lived keys, MFA on.
- VPC is your private network. Public subnets for load balancers, private ones for apps and data.
- Security groups are stateful firewalls. The database accepts only the app security group.
- EC2 servers, S3 objects, RDS databases, ALB traffic, EKS Kubernetes.
- Prefer managed services in a small team. The ideas map directly to Azure and Google Cloud.
:::

# Infrastructure as Code with Terraform

*Write your servers, networks and buckets in files, review them like code, and create them with one command.*

## Why this matters

You can create a server by clicking in the cloud console. It works once. Three months later nobody remembers which boxes were ticked, and staging is different from production in ways nobody can list.

Think of a building. Nobody builds a house from memory. There is a blueprint, and every change goes on the blueprint first. **Infrastructure as Code** (IaC) is the blueprint for your cloud. The infrastructure is described in text files, stored in Git, reviewed in pull requests and applied by a tool.

**Terraform** is the most widely used IaC tool. It is declarative, like Kubernetes: you describe the end state and Terraform works out the steps. Its language is called **HCL**. OpenTofu is an open source tool that uses the same language and workflow.

## The building blocks

| Word | Meaning |
|---|---|
| Provider | A plugin that talks to one platform, such as AWS |
| Resource | One thing to create, such as a bucket or a server |
| Variable | An input, so one config serves many environments |
| Output | A value Terraform prints after it finishes |
| State | Terraform's record of what it has created |
| Module | A reusable folder of resources |

## A small working example

This configuration creates a private, versioned S3 bucket. The version numbers are examples. Use the current ones when you start.

```hcl
# versions.tf
terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"       # any 6.x release
    }
  }
}

provider "aws" {
  region = var.region
}
```

```hcl
# variables.tf
variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Name of the environment, such as staging or prod"
}
```

```hcl
# main.tf
resource "aws_s3_bucket" "uploads" {
  bucket = "gopo-demo-uploads-${var.environment}"

  tags = {
    Project     = "notes-api"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

```hcl
resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Make sure the bucket can never become public by mistake.
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}
```

The second resource keeps old versions of every object, as a safety net. `aws_s3_bucket.uploads.id` is a **reference** to another resource. From such references Terraform learns the order: the bucket first, then its settings.

## The workflow: init, plan, apply

:::flow The Terraform workflow
Write | HCL files in Git
terraform init | download providers
terraform plan | preview the changes
Review | a person reads the plan
terraform apply | make it real
:::

```bash
terraform init                 # once per folder: providers and backend
terraform fmt -recursive       # format the files in the standard style
terraform validate             # check syntax and references
terraform plan -var="environment=staging" -out=tfplan
terraform apply tfplan         # apply exactly the plan you reviewed
terraform output bucket_name   # read an output value
```

The **plan** is the most important habit. It lists every change before anything happens: `+` means create, `~` means change in place, `-` means destroy. Read the plan every time, and stop if you see a destroy that you did not expect.

## State and remote state

Terraform must remember what it created. It writes that memory to a **state file**. Think of it as the stock register of a shop. If the register is lost, nobody knows what is on the shelves.

By default the state is a local file, `terraform.tfstate`. For a team that is dangerous: it can be lost with a laptop, and two people can apply at the same time. So teams keep the state in a shared, locked place called a **remote backend**.

```hcl
# backend.tf: store the state in S3, with locking.
terraform {
  backend "s3" {
    bucket       = "gopo-demo-tfstate"
    key          = "notes-api/staging/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true      # only one apply at a time
  }
}
```

`use_lockfile` needs a recent Terraform release. Older setups use a DynamoDB table for the lock, and you will still see that in many projects.

:::warn
The state file can contain secrets in plain text, such as a database password that Terraform created. Never commit `terraform.tfstate` to Git. Keep it in an encrypted, access-controlled backend. Also, do not change by hand in the console what Terraform manages. The real world and the code then disagree. This is called **drift**, and the next `apply` will try to undo your manual change.
:::

## Modules

When you copy the same twenty lines for staging and production, make a **module**. A module is a folder of Terraform files with inputs (variables) and outputs. It works like a function in programming.

You call it with a `module` block that has a `source` (the folder) and the input values. You can call the same module twice, once for staging and once for production, with different inputs.

In a mature team, a pipeline runs `plan` on every pull request and `apply` after the merge. Nobody applies from a laptop.

:::interview What is the Terraform state file and why is it important?
The state file maps the resources in my configuration to the real resources in the cloud, with their IDs and attributes. Terraform compares the configuration, the state and the real infrastructure to compute the plan. Without the state, Terraform would not know what it already created and would try to create everything again. In a team I store it in a remote backend with encryption and locking, so it is shared, safe and protected from two applies at the same time. It may hold secrets, so it never goes into Git.
:::

:::revise
- IaC: infrastructure is described in files, stored in Git and reviewed like code.
- Terraform is declarative. Providers talk to platforms, resources are the things you create.
- Workflow: `init`, `plan`, review, `apply`. Always read the plan.
- State is Terraform's memory. Keep it in a remote, encrypted, locked backend, never in Git.
- Variables make one configuration serve many environments. Modules remove copy and paste.
- Do not change managed resources by hand. That causes drift.
:::

# Deployment strategies and GitOps

*Different ways to put a new version live, and how Git can become the single source of truth for what runs.*

## Why this matters

Every release is a risk. A **deployment strategy** answers two questions: how many users see the new version at first, and how fast can you go back?

**Deploying** means the new code is running on the servers. **Releasing** means users can see the new behaviour. Good strategies keep these two apart.

## The common strategies

| Strategy | How it works | Rollback | Cost |
|---|---|---|---|
| Rolling | Replace pods a few at a time | Roll back step by step | Low |
| Blue-green | Two full copies, switch all traffic | Instant switch back | Double capacity |
| Canary | Send a small share of users first | Stop the canary | Low to medium |

**Blue-green** is like having two stages at a concert. The band plays on the blue stage while the crew prepares the green one. When green is ready, the lights switch. If something is wrong, they switch back. In Kubernetes, a simple version uses two Deployments and one Service whose selector points to one of them.

```bash
# Blue is live. Deploy green next to it and wait until it is ready.
kubectl apply -f deploy-green.yaml -n notes
kubectl rollout status deploy/notes-api-green -n notes

# Switch all traffic by changing the selector of the Service.
kubectl patch service notes-api -n notes --type merge \
  -p '{"spec":{"selector":{"app":"notes-api","version":"green"}}}'
# Problem? Run the same command with "blue" to switch back.
```

In a **canary** release you send a small part of the traffic to the new version and watch error rate and response time. If the numbers stay good, you increase the share step by step.

A simple canary in Kubernetes uses two Deployments, `stable` and `canary`, whose pods share the label `app: notes-api`. The Service selects only that label, so traffic is split roughly by pod count: with 9 stable pods and 1 canary pod, about one request in ten reaches the new version. Tools such as Argo Rollouts and service meshes give exact percentages and automatic rollback based on metrics.

## Feature flags

A **feature flag** is a switch in the code. The new code is deployed but stays off until you turn the switch on, for everyone or for a few users.

```javascript
// The flag comes from config or a flag service, not from a rebuild.
const flags = { newSearch: process.env.FLAG_NEW_SEARCH === "true" };

app.get("/notes/search", async (req, res) => {
  if (flags.newSearch) {
    return res.json(await searchV2(req.query.q));   // new behaviour
  }
  return res.json(await searchV1(req.query.q));     // old behaviour
});
```

Flags let you merge unfinished work to `main` safely, and they give you the fastest rollback of all: turn the flag off. Remove a flag when the feature is fully released.

:::warn
The hardest part of any strategy is the **database**. During a rolling, blue-green or canary deploy, the old and the new version of the app run at the same time against the same database. A migration that renames or drops a column breaks the old version at once. Make schema changes in backward-compatible steps: first add the new column, deploy code that writes both, move the data, and remove the old column only in a later release. This is called the **expand and contract** pattern.
:::

## GitOps

In a classic pipeline, the CI system pushes changes into the cluster with `kubectl apply`. **GitOps** turns this around. Think of a thermostat: you set the wanted temperature, and the device keeps the room there.

In GitOps, a Git repository holds the desired state of the cluster: all the YAML. An agent that runs **inside** the cluster, such as Argo CD or Flux, watches that repository. When the files change, the agent applies the change. When someone changes the cluster by hand, the agent changes it back.

:::flow A GitOps deployment
CI builds image | pushes tag 8a1b2c3
CI opens PR | new tag in the config repo
Merge | Git now says 8a1b2c3
Argo CD | sees the difference
Cluster | synced to match Git
:::

A minimal Argo CD `Application` looks like this. It says: keep the namespace `notes` equal to the folder `apps/notes-api/production` in this repository.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: notes-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/notes-deploy.git
    targetRevision: main
    path: apps/notes-api/production
  destination:
    server: https://kubernetes.default.svc   # this same cluster
    namespace: notes
  syncPolicy:
    automated:
      prune: true        # delete objects that were removed from Git
      selfHeal: true     # undo manual changes in the cluster
```

Git is now the only door. Every change has an author, a review and a history, a rollback is `git revert`, and the CI system needs no credentials for the cluster.

:::interview Compare blue-green and canary deployments.
In blue-green I run two complete environments. The new version is fully deployed and tested on the idle one, then all traffic is switched at once. Rollback is instant, but I need double capacity for a while, and every user gets the new version at the same moment. In a canary I send a small percentage of real traffic to the new version, watch error rate and latency, and increase the share gradually. A bad release hurts only a few users, but the rollout is slower and needs good metrics. In both, database changes must be backward compatible.
:::

:::revise
- Deploy means the code is running. Release means users see it. Keep them separate.
- Rolling replaces pods gradually. Blue-green switches all traffic between two copies.
- Canary sends a small share of traffic first and grows it while the metrics stay good.
- Feature flags turn features on and off without a new deploy.
- Database changes must work with the old and the new version at the same time.
- GitOps: Git holds the desired state, an agent in the cluster pulls and applies it.
:::

# Observability

*Logs, metrics and traces tell you what your system is doing, so you find problems before your users tell you.*

## Why this matters

Running production without observability is like driving at night with no dashboard and no headlights. You only learn about a problem when you hit it.

**Monitoring** tells you **that** something is wrong. **Observability** means the system gives enough information to understand **why**, even for a problem you never saw before.

## The three signals

Think of a visit to a doctor. The thermometer gives a number. Your story explains what happened. The scan shows where the problem sits.

| Signal | What it is | Answers | Example tools |
|---|---|---|---|
| Metrics | Numbers over time | Is something wrong? How much? | Prometheus |
| Logs | Text records of events | What exactly happened? | Loki, Elasticsearch |
| Traces | The path of one request | Where is it slow or failing? | Jaeger, Tempo |

## Logs

Write logs as **structured** data, usually one JSON object per line. A machine can then filter by field instead of searching in free text.

```json
{"time":"2026-03-04T10:15:02Z","level":"error","msg":"payment failed",
 "request_id":"7f3a9c","route":"/orders","status":502,"duration_ms":4120}
```

The example is split over two lines only to fit the page. Three habits make logs useful:

- Log to standard output. The platform (Docker, Kubernetes) collects the logs and ships them to one central place.
- Add a **request ID** to every line, and pass it to the services you call. You can then follow one request through the whole system.
- Use levels (`debug`, `info`, `warn`, `error`) and keep production at `info`.

:::warn
Never log passwords, tokens, card numbers or full personal data. Logs are copied to many systems and read by many people, and they are kept for a long time. A secret in a log is a leaked secret. Remove or mask sensitive fields before you log an object.
:::

## Metrics with Prometheus

**Prometheus** is a monitoring system that **pulls** metrics. Your app shows its current numbers on an HTTP endpoint, usually `/metrics`, and Prometheus reads that page every few seconds. This is called **scraping**.

| Metric type | What it is | Example |
|---|---|---|
| Counter | Only goes up | Total requests, total errors |
| Gauge | Goes up and down | Memory in use, queue length |
| Histogram | Counts values in ranges | Request duration |

In a Node.js app, a library such as `prom-client` counts requests in a counter named `http_requests_total`, with labels such as `route` and `status`, and serves the `/metrics` page.

You ask questions with a query language called **PromQL**.

```text
# Requests per second over the last 5 minutes, per route
sum by (route) (rate(http_requests_total[5m]))

# Share of requests that failed with a 5xx status
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))

# 95th percentile response time, from a histogram
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
```

**Grafana** is the dashboard tool that draws these queries as graphs. A good first dashboard for any service shows four things, often called the **golden signals**: **latency** (how slow), **traffic** (how many requests), **errors** (how many fail) and **saturation** (how full the CPU, memory or disk is).

Use **percentiles**, not averages, for response time. If 95 requests take 100 ms and 5 take 10 seconds, the average looks fine, but one user in twenty suffers. The 95th percentile (p95) shows that.

## Alerts

An **alert** is a rule that calls a person when a number crosses a line. This Prometheus rule fires when more than 5 percent of requests fail for 10 minutes.

```yaml
groups:
  - name: notes-api
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m])) > 0.05
        for: 10m                 # must stay true this long
        labels:
          severity: page
        annotations:
          summary: More than 5 percent of requests are failing
          runbook: https://wiki.example.com/runbooks/high-error-rate
```

Alert on **symptoms** that users feel (errors, slowness), not on every cause (CPU at 80 percent). Every alert that wakes a person must need a human action. Alerts that people learn to ignore are worse than no alerts. A **runbook** is a short page that says what to check when the alert fires.

## SLI, SLO and error budget

These three terms sound heavy, but the idea is simple.

- An **SLI** (Service Level Indicator) is a measurement of what users experience. Example: the share of requests that succeed.
- An **SLO** (Service Level Objective) is the target for that measurement. Example: 99.9 percent of requests succeed over 30 days.
- The **error budget** is what remains: 100 percent minus the SLO. With 99.9 percent, the budget is 0.1 percent.

:::example The error budget in numbers
30 days have 43,200 minutes. An SLO of 99.9 percent allows 0.1 percent failure, which is about 43 minutes of full downtime in the month.

If the service was down for 10 minutes this month, about 33 minutes of budget remain, and the team can keep shipping features. If the budget is used up, the team stops risky releases and works on reliability until the numbers recover. The budget turns "move fast or stay stable" from an argument into a number.
:::

:::interview What are the three pillars of observability?
Metrics, logs and traces. Metrics are numbers over time, cheap to store and good for dashboards and alerts. They tell me that something is wrong. Logs are detailed records of single events and tell me what exactly happened. Traces follow one request across services and show where the time was spent. In practice I start from an alert on a metric, use traces to find the slow or failing service, and read its logs, joined by a request or trace ID, to find the cause.
:::

:::revise
- Metrics say something is wrong, traces say where, logs say what happened.
- Structured JSON logs to standard output, with a request ID, and never with secrets.
- Prometheus scrapes `/metrics`. Counter, gauge and histogram are the main types.
- Watch the golden signals: latency, traffic, errors, saturation. Use percentiles.
- Alert on user-facing symptoms, and give every alert a runbook.
- SLI is the measurement, SLO is the target, error budget is the allowed failure.
:::

# Security and cost

*The habits that keep your system safe and your cloud bill under control.*

## Why this matters

A leaked key or a forgotten server can undo months of good work. Security and cost have the same enemy: things nobody is watching. Both are won with small daily habits, not with one big project at the end. Building security into every step of the pipeline is often called **DevSecOps**.

## Secrets management

A **secret** is any value that gives access: a password, an API key, a token, a private key. Treat secrets like house keys. You do not paint a copy on your front wall.

| Place | Good for secrets? |
|---|---|
| Source code or Git | Never |
| Dockerfile or image | Never |
| `.env` file on a laptop, in `.gitignore` | Local development only |
| CI secret store | Yes, for pipeline credentials |
| Cloud secret manager or Vault | Yes, the best home in production |

Good secret handling has three more rules. **Rotate** secrets: change them on a schedule and at once after a leak. Use a **different secret per environment**. And prefer **short-lived credentials**, which expire by themselves.

The best secret is the one that does not exist. With **OIDC** (OpenID Connect), a GitHub Actions job proves its identity to AWS and receives temporary credentials. No access key is stored anywhere. The account ID below is a placeholder.

```yaml
# In a GitHub Actions workflow.
permissions:
  id-token: write        # allow the job to request an identity token
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Get temporary AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: ap-south-1
      - run: aws sts get-caller-identity
```

## Least privilege everywhere

You met least privilege in IAM. The same rule applies at every layer: the Linux user, the container, the pod, the pipeline token and the database user. This container spec removes the rights a normal web app never needs.

```yaml
# Inside the container spec of a Deployment.
          securityContext:
            runAsNonRoot: true               # refuse to start as root
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true     # the app cannot change itself
            capabilities:
              drop: ["ALL"]                  # drop special kernel rights
```

## Supply chain basics

Most of the code in your app was written by other people: npm packages, base images, GitHub Actions. This is your **software supply chain**, and an attacker can enter through any link in it.

- Commit the **lock file** (`package-lock.json`) and install with `npm ci`, so every build uses the same versions.
- Turn on automatic dependency updates (for example Dependabot or Renovate) and run `npm audit` in CI.
- **Scan images** in the pipeline and rebuild them regularly.
- Turn on **secret scanning** in the repository, so a pushed key is detected at once.

## Backups

A backup is like a spare tyre. It is useless if it is flat on the day you need it. Follow the **3-2-1 rule**: 3 copies of the data, on 2 different kinds of storage, with 1 copy in another location.

```bash
#!/usr/bin/env bash
# backup.sh: dump a PostgreSQL database and copy it to S3.
set -euo pipefail
STAMP="$(date +%Y-%m-%d_%H%M)"
FILE="/tmp/notes_${STAMP}.dump"

pg_dump --format=custom --file="$FILE" "$DATABASE_URL"
aws s3 cp "$FILE" "s3://gopo-demo-backups/postgres/"
rm -f "$FILE"

# Restore test (run regularly, against a scratch database):
# pg_restore --clean --if-exists --dbname="$SCRATCH_DATABASE_URL" FILE
```

:::warn
A backup that was never restored is only a hope. Test the restore on a schedule and measure how long it takes. Also remember that replication is not a backup. If someone runs a wrong `DELETE`, the replica deletes the same rows a moment later. You need point-in-time backups to go back before the mistake.
:::

## Cost control habits

In the cloud, every resource has a meter that runs until someone stops it. The practice of managing cloud cost as a team is often called **FinOps**.

| Habit | Why it helps |
|---|---|
| Set a budget and billing alerts on day one | You learn about a surprise early |
| Tag every resource (project, environment, owner) | You can see who spends what |
| Right-size from real usage | Most servers are bigger than needed |
| Switch off dev and staging at night | Idle hours cost the same as busy ones |
| Add storage lifecycle rules | Old logs and backups move or expire |
| Delete what is unused | Old disks, snapshots and IPs still cost |

:::tip
When you finish a tutorial, destroy what you created. With Terraform this is one command, `terraform destroy`. Then check the billing page the next day. Many students get a bill from a forgotten load balancer, database or NAT gateway, not from the server they remember.
:::

:::interview How do you manage secrets in a CI/CD pipeline and in Kubernetes?
Secrets never go into the repository or the image. In the pipeline I use the secret store of the CI system, scoped per environment, and where possible I replace stored cloud keys with OIDC, so the job gets short-lived credentials. In Kubernetes I keep the real values in a secret manager such as AWS Secrets Manager or Vault and sync them into the cluster with a tool like External Secrets, or I commit only encrypted secrets. I restrict access with RBAC, turn on encryption at rest, rotate secrets regularly and make sure they never appear in logs.
:::

:::revise
- Secrets live in a secret manager or CI store, never in Git or images. Rotate them.
- Prefer short-lived credentials. OIDC lets a pipeline use the cloud with no stored key.
- Least privilege at every layer: non-root, no privilege escalation, drop capabilities.
- Supply chain: lock files, dependency updates, image and secret scanning.
- Backups follow 3-2-1 and must be restore-tested. Replication is not a backup.
- Cost: budgets and alerts, tags, right-sizing, and delete what you do not use.
:::

# Interview questions, troubleshooting and roadmap

*A final round of practice: questions that are asked often, a checklist for bad days and a plan for what to learn next.*

A good answer has three parts: the idea in one sentence, how it works, and a short example or trade-off from practice. For "what would you do if" questions, say the order of your checks out loud.

## Scenario questions

:::interview Users report that the website is down. Walk me through what you do.
First I confirm and measure: is it down for everyone, since when, and what do the dashboards show. Then I ask what changed, because a recent deploy or config change is the most likely cause, and if one matches the time, I roll it back first and investigate later. If nothing changed, I follow the request path from outside to inside: DNS, TLS certificate, load balancer health, pods or processes, then dependencies such as the database. At each step I look at status, logs and metrics. I keep the team informed during the incident, and afterwards I write a blameless review with the cause and the actions that prevent it next time.
:::

:::interview How do you achieve zero-downtime deployments?
I run more than one replica behind a load balancer and replace them gradually with a rolling, blue-green or canary strategy. Each instance has a readiness check, so it gets traffic only when it can serve, and it handles `SIGTERM` to finish running requests before it exits. Database migrations are backward compatible, so old and new versions can run together. I watch error rate and latency during the rollout and keep a fast rollback ready.
:::

## Quick questions

| Question | Short answer |
|---|---|
| Docker vs Kubernetes? | Docker builds and runs containers. Kubernetes manages many of them across machines |
| Horizontal vs vertical scaling? | More machines, or a bigger machine. Horizontal needs a stateless app |
| What is immutable infrastructure? | You never patch a running server. You replace it with a new image |
| What is a blameless postmortem? | An incident review that fixes the system instead of blaming a person |
| What is idempotent? | Running it many times gives the same result as running it once |
| Rollback vs roll forward? | Go back to the old version, or ship a quick fix as a new one |

## A troubleshooting checklist

When production breaks, stress makes people skip steps. Use the same order every time.

:::flow Order of an investigation
What changed? | deploys, config, traffic
Outside in | DNS, TLS, load balancer
The app | status, logs, restarts
Resources | CPU, memory, disk
Dependencies | database, cache, APIs
:::

| Symptom | Likely causes | First checks |
|---|---|---|
| Domain does not open at all | DNS, expired certificate, firewall | `dig`, `curl -v`, firewall rules |
| 502 from the proxy | App down or wrong port | Service status, app logs, `ss -tlnp` |
| 504 or very slow | Slow queries, no free connections | Latency graphs, database load |
| Works, then dies after hours | Memory leak, disk full | `free -h`, `df -h`, `OOMKilled` |
| Pod never starts | Bad image name, missing secret | `kubectl describe pod`, events |

```bash
# A one-minute health check on any Linux server.
uptime                      # load average: is the CPU overloaded?
free -h && df -h            # memory and disk space
systemctl --failed          # services that crashed
journalctl -p err -n 50 --no-pager     # recent error-level logs
curl -fsS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  http://localhost:3000/healthz        # status code and response time
```

:::warn
During an incident, restore the service first and find the root cause second. If a deploy went out ten minutes before the errors began, roll it back now. Do not debug in production while users wait. And change one thing at a time: if you change three settings together, you will not know which one helped.
:::

## A learning roadmap

Each step below builds on the one before and ends with something you can show.

| Step | Build this | You have learned it when |
|---|---|---|
| 1 | Deploy your app on one Linux server with systemd and Nginx | It survives a reboot and has HTTPS |
| 2 | Containerise it with a multi-stage Dockerfile and Compose | A friend runs it with one command |
| 3 | Add a pipeline that tests, builds and pushes an image | A merge produces a tagged image |
| 4 | Create the infrastructure with Terraform | You can destroy and recreate it |
| 5 | Run it on Kubernetes with probes and limits | A bad release rolls back cleanly |
| 6 | Add metrics, a dashboard and one alert | You see a problem before users do |

:::revise
- Answer with the idea, how it works, and a real example or trade-off.
- In an incident: confirm, ask what changed, roll back if a change matches, then go outside in.
- Zero downtime needs replicas, readiness checks, graceful shutdown and compatible migrations.
- Stateless apps scale horizontally. Idempotent steps make retries safe.
- Change one thing at a time, and write a blameless review afterwards.
- Learn in order: Linux, networking, Docker, CI/CD, cloud and Terraform, Kubernetes, observability.
:::
