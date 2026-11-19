---
title: Production Cloud & Kubernetes DevOps Playbook
subtitle: A hands-on runbook for building hardened images, running apps on Kubernetes and EKS, and fixing them when they break.
category: DevOps & Cloud
level: Intermediate to Advanced
accent: sky
tags: kubernetes, docker, terraform, aws-eks, argocd
highlights: Hardened Docker Images | Kubernetes Operations | Terraform & EKS | GitOps with Argo CD | Prometheus & Alerts | Troubleshooting Runbook
tagline: Hardened Images • Kubernetes Operations • Terraform & EKS • Argo CD • Runbooks
description: This playbook is for people who know basic Docker and kubectl and now want to run real workloads safely. It explains how containers and Kubernetes work inside, then walks through hardened images, zero-downtime releases, autoscaling, storage, Helm, Terraform for a multi-AZ EKS cluster, GitOps with Argo CD, monitoring and security, all with commented manifests. It does not replace practice on a real cluster, so every chapter gives commands you should run yourself, and the book ends with a troubleshooting runbook, a cheat sheet, interview questions and a study plan.
---

# Containers from the inside

*A container is not a small virtual machine. It is a normal Linux process with three clever restrictions.*

## Why this matters

Most people learn Docker as a list of commands. That works until something breaks in production. Then you need to know what a container really is. Why can it not see other processes? Why was it killed when memory was full? Why are its files gone after a restart? All three answers come from the same small set of Linux features.

## A real-life comparison

Think of a paying-guest (PG) building. Every tenant has a room with a lock. Each tenant sees only their own room. But the building has one water tank, one electricity connection and one main gate, and the owner decides how much each room may use.

A **virtual machine** (VM) is like a separate house for every tenant: own tank, own meter, own gate. It is strongly separated, but it is heavy and slow to build.

A **container** is a room in the PG. It shares the building (the Linux **kernel**, the core part of the operating system that talks to the hardware) but it gets a private view and a usage limit.

| | Virtual machine | Container |
|---|---|---|
| What it carries | A full operating system | Only the app and its files |
| Kernel | Its own | Shared with the host |
| Start time | Tens of seconds or more | Usually under a second or two |
| Isolation | Strong (hardware level) | Weaker (process level) |
| Typical size | Gigabytes | Megabytes |

## The three building blocks

A container is made from three Linux features. Docker did not invent them. Docker only made them easy to use.

1. **Namespaces** decide what the process can **see**.
2. **Cgroups** decide how much the process can **use**.
3. A **layered filesystem** decides which **files** the process gets.

### Namespaces: a private view

A **namespace** wraps one kind of system resource and gives the process its own copy of the view. The process thinks it is alone on the machine.

| Namespace | What becomes private | Effect you notice |
|---|---|---|
| `pid` | Process numbers | Your app is process 1 inside the container |
| `net` | Network cards, IPs, ports | Each container can listen on port 80 |
| `mnt` | Mounted filesystems | The container sees only its own files |
| `uts` | Hostname | The container has its own hostname |
| `ipc` | Shared memory between processes | Containers cannot read each other's memory |
| `user` | User and group IDs | Root inside can be a normal user outside |

### Cgroups: a usage limit

**Cgroups** (control groups) are the electricity meter with a fuse. They count how much CPU and memory a group of processes uses, and they enforce a limit. If the group uses more memory than allowed, the kernel kills a process in the group. This is the famous `OOMKilled` status (OOM means "out of memory"). If the group wants more CPU than allowed, it is not killed. It is only slowed down. This is called **throttling**.

### See it yourself

Run these commands on a Linux machine with Docker. They prove that a container is only a process. (On macOS and Windows, Docker Desktop runs your containers inside a small hidden Linux virtual machine, so the host-side commands only work inside that VM.)

```bash
# Start a small web server with limits: 256 MB memory, half a CPU core.
docker run -d --name web --memory=256m --cpus=0.5 nginx:1.27-alpine

# Inside the container, the process list is tiny. nginx is PID 1.
docker exec web ps

# On the host, the same nginx is a normal process with a big PID.
docker inspect --format '{{.State.Pid}}' web     # for example 48211
ps -o pid,user,cmd -p 48211

# Each line here is one namespace this process lives in.
sudo ls -l /proc/48211/ns

# The cgroup limits, read from inside the container (cgroup v2).
docker exec web cat /sys/fs/cgroup/memory.max    # 268435456 bytes
docker exec web cat /sys/fs/cgroup/cpu.max       # 50000 100000
```

The last line means: this group may use 50,000 microseconds of CPU in every 100,000 microseconds. That is exactly half a core.

### Layers: files stacked like transparent sheets

An **image** is a read-only template that holds your app and everything it needs. It is built from **layers**. Each instruction in a Dockerfile that changes files adds one layer on top of the earlier ones.

Think of transparent plastic sheets on an overhead projector. Each sheet adds some drawing. When you look from the top, you see one combined picture. The Linux feature that does this stacking is called a **union filesystem** (Docker normally uses one named `overlay2`).

When a container starts, Docker adds one thin **writable layer** on top. If the container changes a file from the image, the file is first copied up into the writable layer and changed there. This is called **copy-on-write**. The image below stays untouched, so one image can serve a hundred containers.

```bash
# Show the layers of an image and the instruction that made each one.
docker history nginx:1.27-alpine

# Write a file, then delete the container. The file is gone with it.
docker exec web sh -c 'echo hello > /tmp/note.txt'
docker rm -f web
```

:::warn The writable layer is not storage
Everything a container writes into its own filesystem disappears when the container is removed. On Kubernetes, containers are replaced all the time. Never keep uploads, database files or important logs in the container filesystem. Use a volume (chapter 9) or an outside service such as object storage.
:::

## Who actually starts the container

Several small programs work together. You rarely touch the lower ones, but their names appear in error messages, so it helps to know the chain.

:::flow From command to running process
docker CLI | you type a command
dockerd | Docker's background service
containerd | pulls images, manages containers
runc | creates namespaces and cgroups
Your process | running, isolated
:::

Kubernetes does not need Docker on its nodes. The node agent (the **kubelet**) talks straight to `containerd` through a standard called the **CRI** (Container Runtime Interface). Images built with Docker still run fine, because image and runtime formats are open standards from the **OCI** (Open Container Initiative).

:::example Dry run: what happens when you type docker run
You type `docker run -d -p 8080:80 nginx:1.27-alpine`.

1. The CLI sends the request to `dockerd`.
2. The image is not on the machine, so its layers are downloaded from the **registry** (the image store, here Docker Hub). Layers that already exist locally are skipped.
3. The layers are stacked and one empty writable layer is added on top.
4. `runc` creates new namespaces (own process list, own network, own hostname) and a cgroup for the limits.
5. A virtual network cable is attached, and a rule forwards host port 8080 to container port 80.
6. The command stored in the image (`nginx`) starts as PID 1 inside these namespaces.

Nothing was "booted". A process was started with a private view. That is why it takes about a second.
:::

## What this means for security

The shared kernel is the big difference from a VM. A process that runs as user `root` inside a container is, by default, the same `root` user (user ID 0) for the host kernel. The namespaces hide things from it, but if it finds a way out through a kernel bug or a careless setting, it is root on the node.

:::warn Root in the container is a real risk
Do not run your app as root "because it is only a container". Run it as a normal user, drop extra powers and never use `--privileged` for an app. Chapter 2 shows how to bake a non-root user into the image, and chapter 14 shows how Kubernetes can refuse pods that run as root.
:::

:::interview What is the difference between a container and a virtual machine?
A virtual machine runs a full guest operating system with its own kernel on top of virtual hardware, so isolation is strong but it is heavy and slow to start. A container is only a process on the host. It shares the host kernel. Namespaces give it a private view of processes, network and files, and cgroups limit its CPU and memory. So containers are light and start fast, but the isolation is weaker because one kernel is shared. That is why we still harden containers: non-root user, no extra capabilities, and sometimes VMs underneath for separation between teams or customers.
:::

:::revise
- A container is a normal Linux process, not a small VM. It shares the host kernel.
- Namespaces control what it sees: processes, network, files, hostname.
- Cgroups control what it uses. Too much memory means killed, too much CPU means slowed down.
- An image is a stack of read-only layers. A container adds one thin writable layer that is lost on removal.
- The chain is `dockerd` or kubelet, then `containerd`, then `runc`. Formats are OCI standards.
- Root inside a container is root for the kernel, so always run as non-root.
:::

# Hardened images and multi-stage Dockerfiles

*Build images that are small, repeatable, scanned and run as a normal user.*

## Why this matters

The image is the thing you ship. If it is 1.5 GB, every deploy and every scale-up is slow. If it contains a compiler, a shell and a package manager, an attacker who gets in has a full toolbox waiting. If it runs as root, one bug can become a node takeover. A good image is the cheapest security and speed improvement you can make.

## A real-life comparison

When you pack a tiffin for the office, you pack the cooked food. You do not pack the gas stove, the knife and the vegetable peels. Cooking needs the kitchen. Eating needs only the food.

Building software is the same. To **build** you need compilers, dev dependencies and tools. To **run** you need only the result. A **multi-stage build** uses one stage as the kitchen and a second, clean stage as the tiffin box.

## A weak Dockerfile

Many first Dockerfiles look like this. It works, and that is the problem: nothing tells you it is bad.

```dockerfile
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
ENV DB_PASSWORD=supersecret
CMD npm start
```

| Line | What is wrong |
|---|---|
| `node:latest` | Changes without warning. Two builds can give two different images. |
| `COPY . .` first | Any code change throws away the cached `npm install` layer. |
| `npm install` | May pick newer versions than the lock file. Dev tools stay inside. |
| `ENV DB_PASSWORD` | The secret is stored in the image forever. Anyone can read it. |
| No `USER` | The app runs as root. |
| `CMD npm start` | Shell form. Your app is not PID 1 and may miss the stop signal. |

## A hardened multi-stage Dockerfile

This example is for a Node.js API named `orders-api`. We use this app in the whole playbook. The ideas are the same for any language.

```dockerfile
# syntax=docker/dockerfile:1

# ---------- Stage 1: the kitchen (build) ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Copy ONLY the dependency lists first. This layer is reused from the
# cache as long as these two files do not change.
COPY package.json package-lock.json ./

# npm ci installs exactly what the lock file says.
# The cache mount keeps downloaded packages between builds.
RUN --mount=type=cache,target=/root/.npm npm ci

# Now the source code. A code change only rebuilds from here.
COPY . .
RUN npm run build && npm prune --omit=dev   # drop dev dependencies

# ---------- Stage 2: the tiffin box (runtime) ----------
FROM gcr.io/distroless/nodejs22-debian12:nonroot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER 65532:65532             # the image's "nonroot" user, as a number
EXPOSE 8080                  # documentation: the app listens on 8080
CMD ["dist/server.js"]       # the image already starts "node" for us
```

The final image contains Node.js, your compiled code and production packages. It has no shell, no `npm`, no `apt`, and no build tools. Everything from stage 1 that was not copied is thrown away.

## Choosing the base image

The **base image** is the image named in the `FROM` line. Your image inherits all of its files, and all of its security holes.

| Base | What is inside | Good for | Watch out |
|---|---|---|---|
| Full (`node:22`) | Full Debian plus build tools | Build stages | Large, many packages to patch |
| Slim (`node:22-bookworm-slim`) | Small Debian, has a shell | Build or runtime | Still has a package manager |
| Alpine (`node:22-alpine`) | Tiny Linux with `musl` | Small runtime images | `musl` differs from the usual `glibc` library |
| Distroless | App runtime only, no shell | Production runtime | Harder to debug by hand |
| `scratch` | Nothing at all | Static binaries | You add certificates and users yourself |

**Distroless** means "without a Linux distribution's tools". There is no shell and no package manager, so there is less to attack and less to patch. You can still debug a running pod with an ephemeral debug container (chapter 15).

## Layer caching: order matters

Docker reuses a layer from its cache when the instruction and its input files are the same as last time. The moment one layer changes, **every layer after it** is rebuilt. So put the things that change rarely at the top and the things that change often at the bottom.

:::example Dry run: one changed line of code
You change one line in `src/routes.js` and build again.

| Step | Input changed? | Result |
|---|---|---|
| `FROM node:22-bookworm-slim` | No | Cached |
| `COPY package.json package-lock.json` | No | Cached |
| `RUN npm ci` | No (the layer above is the same) | Cached, saves minutes |
| `COPY . .` | Yes | Rebuilt |
| `RUN npm run build` | Yes (the layer above changed) | Rebuilt |

With the weak Dockerfile, `COPY . .` came first, so the slow `npm install` would run on every single commit.
:::

### The .dockerignore file

Before a build starts, Docker sends your folder (the **build context**) to the builder. A `.dockerignore` file keeps junk and secrets out of it. Without it, `COPY . .` can copy your local `.env` file straight into a layer.

```text
.git
node_modules
dist
.env
.env.*
*.log
coverage
Dockerfile
.dockerignore
```

## Run as a normal user

Distroless images ship a ready user called `nonroot` (user ID 65532). The official Node images ship a user called `node`. If your base image has no such user, create one with `useradd` in the Dockerfile. Write the user as a number in `USER`, because Kubernetes can only check "is this non-root?" when it sees a numeric ID.

A non-root user cannot listen on ports below 1024 on older setups, so make the app listen on a high port such as 8080. The Service in Kubernetes can still show it to the world as port 80.

## Tags and digests

A **tag** is a label on an image, such as `1.4.2`. A tag can be moved to a different image later. A **digest** is a fingerprint of the exact image content, such as `sha256:4f2a...`. A digest can never point to something else.

- Tag your own images with the Git commit, for example `orders-api:8a1b2c3`. Then every running pod tells you exactly which code it runs.
- Never deploy `latest`. You cannot roll back to "the previous latest".
- For the strictest setups, pin the base image by digest too.

## Scan the image

A **vulnerability** is a known security hole in a piece of software. Public lists give each one an ID that starts with **CVE**. An **image scanner** reads the packages inside your image and compares them with those lists. Trivy and Grype are two common open-source scanners.

```bash
IMAGE=ghcr.io/example/orders-api:8a1b2c3

# Fail (exit code 1) if a HIGH or CRITICAL hole with a fix exists.
trivy image --severity HIGH,CRITICAL --ignore-unfixed \
  --exit-code 1 "$IMAGE"

```

A scan is a photo of one moment. New holes are found every week in old packages. So scan in the pipeline on every build, and also rebuild and rescan images on a schedule, even when your code did not change.

:::warn Secrets in layers never go away
If you `COPY` a key file or set a password with `ENV` or `ARG`, it is stored in a layer. Deleting the file in a later instruction does not remove it, because the earlier layer still holds it. Anyone who can pull the image can read it with `docker history` or by unpacking the layers. Give secrets to the container at run time (chapter 5). If a build step needs a token, use a build secret: `RUN --mount=type=secret,id=npmrc ...`, which is not saved in the image.
:::

:::interview How do you reduce the size and the risk of a Docker image?
I use a multi-stage build. The first stage has the compilers and dev dependencies and produces the build output. The final stage starts from a slim or distroless base and copies only the output and production dependencies. I order the instructions so that dependency installation is cached, and I add a `.dockerignore`. For risk, I pin the base image version, run as a non-root user with a numeric ID, keep secrets out of the image, and scan the image in CI so that the build fails on serious fixable vulnerabilities. I tag images with the Git commit, not `latest`, so deployments are traceable and rollbacks are exact.
:::

:::revise
- Multi-stage: build in a full image, run in a slim or distroless image with only the output.
- Order layers from stable to changing: base, dependency lists, install, source, build.
- Always add `.dockerignore`, a non-root `USER` with a numeric ID, and exec-form `CMD`.
- Pin base versions and tag your images with the Git commit, never `latest`.
- A secret copied into any layer stays in the image forever.
- Scan every build and rebuild on a schedule, because new CVEs appear in old packages.
:::

# Kubernetes architecture and core workloads

*How the cluster thinks: you write the wanted state, and control loops work until reality matches it.*

## Why this matters

Docker runs containers on one machine. Production needs many machines, and machines fail. Somebody must decide where each container runs, restart it when it dies, and move it when a machine goes down. **Kubernetes** (often written **K8s**) is that somebody. If you understand its one central idea, the reconcile loop, every object in the later chapters becomes easy.

## A real-life comparison

Think of the thermostat of an air conditioner. You do not tell it "run the compressor for 12 minutes". You set **24 degrees**. The thermostat measures the room, compares it with 24, and switches the compressor on or off. It repeats this forever. If someone opens a window, you do nothing. The thermostat notices and corrects.

Kubernetes works the same way.

- **Desired state**: what you want, written in a YAML file. "3 copies of orders-api, version 1.4.2."
- **Actual state**: what is really running now.
- **Reconcile loop**: a program that compares the two again and again and acts to remove the difference.

This style is called **declarative**: you declare the result, not the steps. The opposite is **imperative**: you give step-by-step orders.

:::flow The reconcile loop
Observe | read actual state
Compare | with desired state
Act | create, delete or update
Repeat | forever
:::

## The parts of a cluster

A **cluster** is a group of machines managed by Kubernetes. Each machine is a **node**. The cluster has two sides: the **control plane** (the brain) and the **worker nodes** (the hands). On a managed service such as Amazon EKS, Google GKE or Azure AKS, the cloud runs the control plane for you and you manage only the worker nodes and your workloads.

| Part | Where | Job in one line |
|---|---|---|
| API server | Control plane | The only front door. Everything talks to it. |
| etcd | Control plane | The database that stores all objects |
| Scheduler | Control plane | Picks a node for each new pod |
| Controller manager | Control plane | Runs the reconcile loops |
| Cloud controller | Control plane | Creates cloud things such as load balancers |
| kubelet | Every node | Starts and watches containers on its node |
| kube-proxy | Every node | Programs network rules for Services |
| Container runtime | Every node | Runs the containers (`containerd`) |

Important detail: the parts do not call each other. The scheduler does not phone the kubelet. Every part only **watches the API server** and writes back to it. This keeps the system simple and lets each part restart safely.

## The Pod: the smallest unit

Kubernetes does not run containers directly. It runs **Pods**. A Pod is a wrapper around one or more containers that must live together. Containers in the same Pod share one network identity (one IP address) and can share folders.

Most Pods have exactly one main container. Extra containers in the same Pod are helpers, for example a log shipper. They are called **sidecars**.

Three facts about Pods that you must remember:

1. A Pod is **disposable**. When it dies, it is not repaired. A new Pod with a new name and a new IP replaces it.
2. A Pod is tied to one node for its whole life.
3. You almost never create Pods by hand. A controller creates them for you.

Every Kubernetes manifest has the same four top parts: `apiVersion` and `kind` say what type of object it is, `metadata` gives its name and labels, and `spec` is the desired state. Kubernetes adds a fifth part, `status`, which is the actual state.

A **namespace** (this playbook uses one named `shop`) is a folder inside the cluster that groups objects of one team or one app. Create it once with `kubectl create namespace shop`. Do not confuse it with the Linux namespaces from chapter 1.

## ReplicaSet: keep N copies alive

A **ReplicaSet** has one job: make sure a given number of matching Pods exist. It finds "its" Pods with a **label selector**, which is a filter such as `app=orders-api`. If it counts too few, it creates Pods from a template. If it counts too many, it deletes some.

You will rarely write a ReplicaSet yourself. A Deployment writes it for you.

## Deployment: versions and safe updates

A **Deployment** manages ReplicaSets. It is the normal choice for **stateless** apps: apps that keep no important data inside themselves, so any copy can be deleted at any time. Each time you change the Pod template (for example a new image), the Deployment creates a **new** ReplicaSet and moves Pods from the old one to the new one step by step. The old ReplicaSet is kept with zero Pods, which is what makes a rollback possible.

:::flow Who creates what
Deployment | you write this
ReplicaSet | one per version
Pods | N copies
Containers | started by kubelet
:::

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
  namespace: shop
spec:
  replicas: 3                      # desired number of pods
  selector:
    matchLabels:
      app: orders-api              # "my pods are the ones with this label"
  template:                        # the pod template (a stamp)
    metadata:
      labels:
        app: orders-api            # must match the selector above
    spec:
      containers:
        - name: api
          image: ghcr.io/example/orders-api:1.4.2
          ports:
            - name: http
              containerPort: 8080
```

```bash
kubectl apply -f deployment.yaml              # send the desired state
kubectl get deploy,rs,pods -n shop            # see all three levels
kubectl get pods -n shop --show-labels        # see how they are linked
kubectl get deploy orders-api -n shop -o yaml # full object with status
kubectl explain deployment.spec.strategy      # built-in documentation
```

Pod names look like `orders-api-7c9d8b6f5d-x2kqp`. The first part is the Deployment name. The middle part is a hash of the Pod template, so it is the same for all Pods of one version. The last part is random.

## Dry run: from kubectl apply to a running pod

:::example What happens after kubectl apply
You run `kubectl apply -f deployment.yaml` on an empty namespace.

| Step | Who acts | What happens |
|---|---|---|
| 1 | `kubectl` | Sends the YAML to the API server |
| 2 | API server | Checks who you are and whether the YAML is valid, then saves it in etcd |
| 3 | Deployment controller | Sees a Deployment with no ReplicaSet, creates one with `replicas: 3` |
| 4 | ReplicaSet controller | Sees 0 pods but wants 3, creates 3 Pod objects (no node yet) |
| 5 | Scheduler | Sees pods without a node, picks a node for each and writes it down |
| 6 | kubelet on each node | Sees a pod assigned to its node, pulls the image, starts the container |
| 7 | kubelet | Reports status `Running` back to the API server |

Nobody gave an order to anybody. Each part noticed a gap between desired and actual state and closed its own small piece of it.
:::

:::warn Editing the cluster by hand
`kubectl scale`, `kubectl edit` and `kubectl set image` are useful in an emergency, but they change the cluster without changing your YAML files. The next `kubectl apply` or the next GitOps sync silently puts the old values back. In normal work, change the file in Git and let the pipeline apply it. Chapter 12 explains this flow.
:::

:::interview What happens when you run kubectl apply on a Deployment?
`kubectl` sends the manifest to the API server. The API server authenticates me, checks my permissions, validates the object and stores it in etcd. The Deployment controller is watching Deployments. It sees there is no ReplicaSet for this template and creates one. The ReplicaSet controller sees that fewer Pods exist than desired and creates Pod objects. The scheduler sees Pods with no node and assigns each one to a node that has enough free resources. The kubelet on that node sees the assignment, asks the container runtime to pull the image and start the containers, and reports the status back. All parts communicate only through the API server.
:::

:::revise
- Kubernetes is declarative: you store the desired state and controllers reconcile reality to it.
- Control plane: API server, etcd, scheduler, controller manager. Nodes: kubelet, kube-proxy, runtime.
- All parts talk only to the API server and watch it for changes.
- A Pod is disposable: new name and new IP every time it is replaced.
- Deployment creates ReplicaSets (one per version), and a ReplicaSet keeps N Pods alive.
- Labels and selectors link objects. Keep selectors small and stable.
:::

# Services, Ingress and DNS

*How traffic finds the right pods when pod addresses keep changing.*

## Why this matters

Every Pod gets its own IP address. But Pods are replaced on every deploy, every crash and every scale-up, and the new Pod has a new IP. If another app saved the old IP, it now calls a dead address. You need one stable name and address that always points to the healthy Pods of the moment.

## A real-life comparison

When you call a bank's customer care number, you do not know which agent will answer. Agents join and leave shifts all day. The number never changes. The phone system keeps a list of agents who are free right now and connects you to one of them.

A **Service** is that customer care number. The Pods are the agents.

## The Service

A Service has a fixed virtual IP (the **ClusterIP**) and a fixed DNS name. It finds its Pods with a label selector and spreads connections over those that are **ready**.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: orders-api
  namespace: shop
spec:
  type: ClusterIP              # the default: reachable inside the cluster
  selector:
    app: orders-api            # send traffic to pods with this label
  ports:
    - name: http
      port: 80                 # the port of the Service
      targetPort: http         # the NAMED port of the pod (8080)
```

`port` is what callers use. `targetPort` is where the container listens. Using the port **name** (`http`) is safer than the number, because you can later change the container port in one place.

### How it works under the hood

For every Service, Kubernetes keeps a list of the IPs of matching ready Pods. This list is stored in objects called **EndpointSlices**. `kube-proxy` on every node watches these lists and writes network rules into the kernel. When any Pod connects to the Service IP, the kernel rewrites the destination to one of the Pod IPs. There is no extra proxy server in the middle of each request.

### Service types

| Type | Reachable from | Typical use |
|---|---|---|
| `ClusterIP` | Inside the cluster only | Almost every internal service |
| `NodePort` | A fixed port on every node's IP | Simple tests, on-premise setups |
| `LoadBalancer` | The internet or your network, through a cloud load balancer | Exposing one service directly |
| Headless (`clusterIP: None`) | Inside, returns pod IPs directly | StatefulSets, databases |
| `ExternalName` | Inside, as an alias for an outside DNS name | Pointing to an external database |

Each type builds on the previous one: a `LoadBalancer` Service also has a NodePort and a ClusterIP.

## DNS inside the cluster

**DNS** is the system that turns names into IP addresses. Every cluster runs its own DNS server, usually **CoreDNS**. Each Service automatically gets a name.

| Name used by the caller | Works from |
|---|---|
| `orders-api` | Pods in the same namespace |
| `orders-api.shop` | Pods in any namespace |
| `orders-api.shop.svc.cluster.local` | Anywhere in the cluster (the full name) |

So another app in the `shop` namespace simply calls `http://orders-api/`. No IP addresses appear in any config file.

```bash
# Start a throwaway pod, test DNS and HTTP, and delete it on exit.
kubectl run tmp --rm -it --restart=Never -n shop \
  --image=busybox:1.36 -- sh

# Inside that pod:
nslookup orders-api
wget -qO- http://orders-api/healthz
cat /etc/resolv.conf        # shows the cluster DNS server and search list
```

:::example Dry run: pod A calls http://orders-api/orders
1. The app in pod A asks DNS for `orders-api`.
2. The search list in `/etc/resolv.conf` expands it to `orders-api.shop.svc.cluster.local`.
3. CoreDNS answers with the ClusterIP, for example `10.100.37.12`.
4. Pod A opens a connection to `10.100.37.12:80`.
5. Kernel rules written by kube-proxy pick one ready pod, for example `10.0.21.44:8080`, and rewrite the destination.
6. The request arrives at the container on port 8080.

If the chosen pod dies later, it is removed from the EndpointSlice, the rules are updated, and new connections go to the remaining pods.
:::

## Ingress: one front door for HTTP

A `LoadBalancer` Service gives one cloud load balancer per service. With twenty services that means twenty load balancers and twenty bills. It also knows nothing about HTTP paths or host names.

Think of the reception desk of an office building. There is one entrance. The receptionist reads who you want to meet and sends you to the right floor. An **Ingress** is this receptionist for HTTP traffic. It routes by **host name** and **path** to different Services, and it can handle HTTPS certificates in one place.

An Ingress object is only a set of rules. Something must read the rules and do the work. That program is the **Ingress controller**. A cluster has no Ingress controller until you install one. On EKS, the common choice is the **AWS Load Balancer Controller**, which creates an Application Load Balancer (ALB) from your Ingress.

```yaml
# ingress.yaml (for the AWS Load Balancer Controller)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  namespace: shop
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip    # send straight to pods
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
spec:
  ingressClassName: alb          # which controller handles this Ingress
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: orders-api
                port:
                  name: http
          - path: /
            pathType: Prefix
            backend:
              service:
                name: storefront
                port:
                  name: http
```

Annotations are controller-specific settings. They are different for every Ingress controller, so always read the documentation of the one you installed. With this controller, the HTTPS certificate is taken from AWS Certificate Manager by matching the host name.

:::flow A request from the internet
Browser | shop.example.com/orders
Public DNS | name to load balancer
Load balancer | HTTPS ends here
Service | orders-api
Pod | port 8080
:::

:::note Gateway API: the newer way
The Kubernetes project now recommends the **Gateway API** for new setups. It splits the work into a `Gateway` (the load balancer, owned by the platform team) and `HTTPRoute` objects (the routing rules, owned by app teams). The idea is the same as Ingress: host and path rules that point to Services. Ingress is still supported and still common, so you must know both names. Before choosing a controller, check that it is actively maintained, because some older community controllers have been retired.
:::

:::warn The empty endpoints trap
If the Service selector says `app: orders-api` but the pods are labelled `app: order-api`, nothing complains. The Service is created, it has an IP and a DNS name, and every request fails with "connection refused" or a timeout. Always check the EndpointSlices. An empty list means the selector matches no ready pod: either the labels are wrong or the pods are failing their readiness probe.
:::

:::interview Explain ClusterIP, NodePort and LoadBalancer.
`ClusterIP` gives the Service a virtual IP that works only inside the cluster. It is the default and is used for service-to-service calls. `NodePort` also opens the same port, from a high range, on every node, so traffic to any node IP on that port reaches the Service. `LoadBalancer` also asks the cloud provider for an external load balancer that forwards to the Service. Each type includes the previous one. For many HTTP services I would not create many LoadBalancer Services. I would use ClusterIP Services behind one Ingress or Gateway, which routes by host and path and ends TLS in one place.
:::

:::revise
- Pod IPs change. A Service gives one stable IP and DNS name in front of ready pods.
- A Service finds pods by label selector. Empty EndpointSlices mean a label or readiness problem.
- `port` is the Service port, `targetPort` is the container port. Prefer named ports.
- DNS name: `service.namespace.svc.cluster.local`. The short name works in the same namespace.
- Ingress routes HTTP by host and path, and needs an Ingress controller to do anything.
- Gateway API is the newer model: `Gateway` plus `HTTPRoute`.
:::

# ConfigMaps and Secrets

*Keep settings outside the image, and know exactly how safe a Kubernetes Secret really is.*

## Why this matters

You build one image and run it in three places: development, staging and production. The code is the same. The database address, the log level and the passwords are different. If these values are baked into the image, you need three images, and the one you tested is not the one you ship. So configuration must live **outside** the image and be attached when the container starts.

## A real-life comparison

Two people buy the same phone model. The phone is identical. What makes it "yours" is the SIM card and the settings you put in after buying. The image is the phone. The **ConfigMap** is the settings. The **Secret** is the SIM card and the screen lock PIN: also a setting, but one you guard.

| Object | Holds | Examples |
|---|---|---|
| ConfigMap | Non-sensitive settings | Log level, feature switches, URLs of other services |
| Secret | Sensitive values | Passwords, API keys, TLS certificates |

## ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: orders-api-config
  namespace: shop
data:
  LOG_LEVEL: info                       # simple key and value
  PAYMENT_URL: http://payments.shop     # another Service, by DNS name
  app.properties: |                     # a whole file as one value
    orders.pageSize=50
    orders.maxItems=200
```

There are two ways to give this data to a container.

```yaml
# Fragment of the Deployment: spec.template.spec
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.4.2
    envFrom:
      - configMapRef:
          name: orders-api-config      # every key becomes an env variable
    volumeMounts:
      - name: config
        mountPath: /etc/orders         # each key becomes a file here
        readOnly: true
volumes:
  - name: config
    configMap:
      name: orders-api-config
      items:
        - key: app.properties          # mount only this one key
          path: app.properties
```

An **environment variable** is a named value that the operating system hands to a process when it starts. The app reads it with something like `process.env.LOG_LEVEL`.

| | Environment variables | Mounted files |
|---|---|---|
| Good for | Short single values | Whole config files, certificates |
| Change in ConfigMap reaches a running pod? | No, only after restart | Yes, after a short delay |
| App must do what? | Nothing special | Re-read the file to notice changes |

## Rolling out a config change

This surprises almost everyone: **changing a ConfigMap does not restart your pods.** Pods that read it as environment variables keep the old values until they are replaced.

```bash
kubectl apply -f configmap.yaml                  # 1. change the data
kubectl rollout restart deploy/orders-api -n shop  # 2. replace the pods
kubectl rollout status deploy/orders-api -n shop   # 3. wait until done
```

`rollout restart` does a normal rolling update with the same image, so there is no downtime if your probes are correct (chapter 6).

:::example Dry run: a config change that "did nothing"
You change `LOG_LEVEL` from `info` to `debug` and apply the ConfigMap.

| Time | What you check | What you see |
|---|---|---|
| 10:00 | `kubectl get cm orders-api-config -o yaml` | `LOG_LEVEL: debug` |
| 10:01 | `kubectl exec deploy/orders-api -- env` | `LOG_LEVEL=info` (old) |
| 10:02 | You run `kubectl rollout restart` | New pods start one by one |
| 10:04 | `kubectl exec deploy/orders-api -- env` | `LOG_LEVEL=debug` |

The pod read its environment once, at start. Tools such as Helm solve this by putting a hash of the config into the pod template, so every config change automatically triggers a rollout (chapter 10). The `exec ... env` check needs an image that contains the `env` program, so it does not work on distroless images.
:::

## Secret

A Secret looks almost the same as a ConfigMap. The values under `data` are written in **base64**, which is a way to write any bytes using only letters and digits. With `stringData` you may write plain text and Kubernetes converts it for you.

```bash
# Create a Secret without writing the password into any file.
kubectl create secret generic orders-api-secret -n shop \
  --from-literal=DB_PASSWORD='S3cure-example-only' \
  --from-literal=PAYMENT_API_KEY='pk_example_123'
```

```yaml
# Fragment of the Deployment: use single keys from the Secret.
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.4.2
    env:
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef:
            name: orders-api-secret
            key: DB_PASSWORD
    volumeMounts:
      - name: tls
        mountPath: /etc/tls              # files, kept in memory only
        readOnly: true
volumes:
  - name: tls
    secret:
      secretName: orders-api-tls
```

## The limits of Secrets

The name "Secret" promises more than the object delivers. Be clear about what it does and does not do.

```bash
# Anyone who may read the Secret gets the plain value in one line.
kubectl get secret orders-api-secret -n shop \
  -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

| Limit | What it means for you |
|---|---|
| base64 is not encryption | It only changes the spelling. Anyone can decode it. |
| Stored in etcd | Protected only if encryption at rest is switched on for the cluster |
| Readable through RBAC | Whoever may `get` Secrets in the namespace can read them all |
| Readable through pods | Whoever may create a pod in the namespace can mount any Secret there |
| Environment variables leak | They can show up in crash reports, debug pages and child processes |
| No rotation | Kubernetes does not change passwords for you |
| Size limit of about 1 MiB | It is for keys and small files, not for data |
| Not safe in Git | A plain Secret manifest in a repository is a leaked password |

What a Secret does give you: the value is kept apart from the image and from the pod spec, it is sent only to nodes that run a pod using it, mounted Secret files live in memory and not on the node's disk, and you can give tighter permissions to Secrets than to ConfigMaps.

:::warn Never commit a Secret manifest
A file with `kind: Secret` and base64 values looks scrambled, so people push it to Git "just this once". Base64 is not a lock. Once it is in the Git history, treat the password as leaked and change it. For real projects, keep the true value in a secret manager and let a tool copy it into the cluster. Chapter 14 shows this with the External Secrets Operator.
:::

If a pod refers to a ConfigMap or Secret that does not exist, the container cannot start. The pod stays in the state `CreateContainerConfigError`, and `kubectl describe pod` names the missing object.

:::interview Are Kubernetes Secrets secure?
Only partly. The values are base64 encoded, which is not encryption. By default they are protected by the access rules of the API and, if enabled, by encryption at rest in etcd. Anyone with permission to read Secrets, or to create pods in the same namespace, can get the values. So I treat a Secret as a delivery mechanism, not as a vault. I enable encryption at rest, restrict RBAC on Secrets, avoid committing them to Git, and keep the source of truth in a secret manager such as AWS Secrets Manager or Vault, synced into the cluster by a tool like External Secrets. For cloud APIs I avoid static keys completely and give the pod an IAM role.
:::

:::interview You changed a ConfigMap but the app still uses the old value. Why?
If the app reads the value as an environment variable, it was copied into the process when the container started, so a running pod never sees the change. I must restart the pods, for example with `kubectl rollout restart`. If the ConfigMap is mounted as a volume, the files do get updated after a delay, but the app must re-read them, and mounts that use `subPath` are not updated at all. To make this automatic, I add a checksum of the config to the pod template annotations or use a new ConfigMap name for each version, so that a config change triggers a rollout.
:::

:::revise
- Configuration lives outside the image: ConfigMap for normal settings, Secret for sensitive ones.
- Inject as environment variables (simple) or as mounted files (whole files, can update live).
- Changing a ConfigMap does not restart pods. Use `kubectl rollout restart` or a checksum annotation.
- base64 is encoding, not encryption. Anyone with read access can decode a Secret.
- Never commit Secret manifests. Keep the real values in a secret manager.
- A missing ConfigMap or Secret gives `CreateContainerConfigError`.
:::

# Requests, limits, QoS and probes

*Tell Kubernetes how much your app needs and how to check its health, or it will guess wrongly.*

## Why this matters

Kubernetes makes two kinds of decisions about your pod all day. Where should it run, and is it healthy? By default it knows nothing: it assumes the pod needs zero resources and that a running process is a healthy app. Both guesses are wrong in production. Requests, limits and probes are how you give it the facts.

## Part 1: requests and limits

### A real-life comparison

You book a table for four at a restaurant. The restaurant now **reserves** four seats for you, even if only two friends come. That reservation is the **request**. The restaurant also has a rule: at most six people at this table, never more. That cap is the **limit**.

- **Request**: the amount the scheduler reserves for the container on a node. It is a promise to your pod.
- **Limit**: the most the container is ever allowed to use. It is a wall.

### Units

CPU is measured in **millicores**: `1000m` is one core and `250m` is a quarter of a core. Memory is measured in bytes with suffixes: `256Mi` is 256 mebibytes and `1Gi` is 1 gibibyte.

```yaml
# Fragment of the Deployment: one container
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.4.2
    resources:
      requests:
        cpu: 250m              # reserved: used by the scheduler
        memory: 256Mi
      limits:
        memory: 512Mi          # above this, the container is killed
```

### What each number really does

| | Request | Limit |
|---|---|---|
| Used by | Scheduler, to pick a node | Kernel cgroup, while running |
| CPU over the number | Allowed if the node has spare CPU | Throttled (slowed down) |
| Memory over the number | Allowed, but first to be evicted | Killed with `OOMKilled` |

Two facts cause most confusion.

**The scheduler looks at requests, not at real usage.** A node with 4 cores is "full" when the requests on it add up to about 4 cores, even if the pods are idle. And a node with pods that request nothing looks empty even when it is on fire.

**CPU and memory behave differently.** CPU can be shared by slowing things down, so going over a CPU limit only makes the app slower. Memory cannot be taken back, so going over a memory limit means the kernel kills the container.

:::example Dry run: will the pod fit?
A node has 2000m of CPU that pods may use. Three pods already run on it with requests of 500m, 500m and 700m. Their real usage is only 100m each.

| Question | Calculation | Answer |
|---|---|---|
| CPU already requested | 500 + 500 + 700 | 1700m |
| CPU still free for scheduling | 2000 - 1700 | 300m |
| New pod requests 250m | 250 <= 300 | Fits on this node |
| New pod requests 400m | 400 > 300 | Does not fit, stays `Pending` |

Real usage (300m in total) never entered the calculation. If every node looks like this, the cluster reports "Insufficient cpu" while the machines are almost idle. That is the price of requests that are too high.
:::

### How to choose the numbers

Do not guess for long. Deploy with a first estimate, run realistic traffic, and watch `kubectl top pods` or your dashboards for a few days. Set the memory request near the normal peak and the memory limit somewhat above it. Set the CPU request near the usual busy-hour usage.

Many teams set a memory limit but **no CPU limit**. Their reasoning: the CPU request already guarantees a fair share, and a CPU limit only throttles the app while spare CPU sits unused. Other teams keep CPU limits for predictable behaviour. Both are valid choices. Know which one your team uses and why.

### QoS classes: who is removed first

When a node runs out of memory, the kubelet must remove pods to save the node. This is called **eviction**. It chooses by **QoS class** (Quality of Service). You do not set the class. Kubernetes derives it from your requests and limits.

| QoS class | Rule | Evicted |
|---|---|---|
| `Guaranteed` | Every container has CPU and memory limits, and requests equal limits | Last |
| `Burstable` | At least one request or limit is set, but not the Guaranteed rule | In the middle |
| `BestEffort` | No requests and no limits at all | First |

```bash
kubectl get pod <pod> -n shop -o jsonpath='{.status.qosClass}'
```

Use `Guaranteed` for things that must not be disturbed, such as databases. `Burstable` is normal for web apps. Never run production pods as `BestEffort`.

## Part 2: probes

### A real-life comparison

A new cashier joins a shop. The manager asks three different questions on different days. In the first week: "Have you finished training?" Every morning: "Is your counter open for customers?" And during the day: "Are you still awake, or do I need to replace you?"

Kubernetes asks the same three questions about every container. A **probe** is a small health check that the kubelet runs again and again.

| Probe | Question | When it fails |
|---|---|---|
| Startup | Has the app finished starting? | Keeps waiting. After too many failures, restarts the container. |
| Readiness | Can it serve requests right now? | Pod is taken out of the Service. No restart. |
| Liveness | Is it stuck beyond repair? | Container is restarted. |

While the startup probe has not passed, the other two probes do not run. This protects slow-starting apps from being killed by the liveness probe.

### Ways to probe and the timing fields

A probe can make an HTTP request (`httpGet`, success is a status from 200 to 399), open a TCP port (`tcpSocket`), run a command in the container (`exec`, success is exit code 0), or call a gRPC health service (`grpc`).

| Field | Meaning | Default |
|---|---|---|
| `initialDelaySeconds` | Wait before the first check | 0 |
| `periodSeconds` | Time between checks | 10 |
| `timeoutSeconds` | How long one check may take | 1 |
| `failureThreshold` | Failures in a row before acting | 3 |
| `successThreshold` | Successes in a row to count as healthy | 1 |

```yaml
# Fragment of the Deployment: one container
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.4.2
    startupProbe:
      httpGet: { path: /healthz, port: http }
      periodSeconds: 5
      failureThreshold: 24         # up to 5 x 24 = 120 s to start
    readinessProbe:
      httpGet: { path: /readyz, port: http }
      periodSeconds: 5
      timeoutSeconds: 2
      failureThreshold: 3          # 15 s of failures: stop sending traffic
    livenessProbe:
      httpGet: { path: /healthz, port: http }
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3          # 30 s of failures: restart
```

:::example Dry run: a pod that needs 40 seconds to start
Settings: startup probe every 5 s with threshold 24, readiness every 5 s, liveness every 10 s.

| Time | What happens |
|---|---|
| 0 s | Container starts. Only the startup probe runs. |
| 5 s to 35 s | Startup probe fails 7 times. Allowed, the threshold is 24. Pod shows `0/1`. |
| 40 s | Startup probe passes. Liveness and readiness probes begin. |
| 45 s | Readiness passes. Pod shows `1/1` and is added to the Service. |
| later | The database is unreachable for 20 s. Readiness fails 3 times, pod is removed from the Service. Liveness still passes, so there is no restart. |
| later | The database is back. Readiness passes, traffic returns. |

Without the startup probe, a liveness probe with a 30-second budget would have restarted this container at 30 s, again and again, and it would never have started.
:::

:::warn Liveness probes can cause outages
A liveness probe that checks the database turns a small database hiccup into a full outage: every pod fails at once, every pod is restarted at once, and all of them then reconnect at once. Keep liveness simple and local. Also remember that the default timeout is 1 second. An app that answers the health check in 1.5 seconds under load will be restarted exactly when it is busiest. If you are not sure you need a liveness probe, a wrong one is worse than none.
:::

:::interview What is the difference between requests and limits?
A request is the amount of CPU or memory that the scheduler reserves for the container. The scheduler places a pod only on a node whose unreserved capacity covers the pod's requests, and it never looks at live usage. A limit is the maximum the container may use at run time, enforced by cgroups. Above a CPU limit the container is throttled. Above a memory limit it is killed with `OOMKilled`. Requests and limits together also decide the QoS class: `Guaranteed` when they are equal for both resources, `Burstable` when they are partly set, `BestEffort` when nothing is set. Under node memory pressure, `BestEffort` pods are evicted first.
:::

:::revise
- Request is the reserved amount used for scheduling. Limit is the hard cap at run time.
- Over a CPU limit means throttled. Over a memory limit means `OOMKilled`.
- The scheduler uses requests only. Oversized requests fill nodes that are actually idle.
- QoS: `Guaranteed`, `Burstable`, `BestEffort`. `BestEffort` pods are evicted first.
- Readiness removes the pod from traffic. Liveness restarts it. Startup protects slow starts.
- Keep liveness simple and local. Never check shared dependencies in it.
:::

# Rolling updates, rollbacks and zero downtime

*Release a new version while users keep working, and go back quickly when it is bad.*

## Why this matters

A team that is afraid to deploy ships rarely, and big rare releases break more. The goal is boring releases: many per day, nobody notices, and a bad one is undone in a minute. Kubernetes gives you the mechanics, but zero downtime only happens when several small settings are all correct together. This chapter puts them in one place.

## A real-life comparison

A highway toll plaza has four booths and must change the staff at shift end. If all four leave at once, the highway stops. Instead, a fifth booth opens first with a new person. When that person is really ready, one old booth closes, but only after finishing the car that is already there. Then the next one. Traffic never stops.

A **rolling update** does exactly this with pods.

## maxSurge and maxUnavailable

The default strategy of a Deployment is `RollingUpdate`. The other one, `Recreate`, deletes all old pods before it starts new ones. It causes downtime and is only for apps where two versions must never run together.

Two numbers control the speed and the safety of a rolling update.

- **`maxSurge`**: how many pods **above** the desired count may exist during the update. This is the extra toll booth.
- **`maxUnavailable`**: how many pods **below** the desired count may be missing during the update.

Both can be a number or a percentage. Both default to 25%. Percentages are rounded up for `maxSurge` and rounded down for `maxUnavailable`.

| Setting (4 replicas) | Pods during update | Effect |
|---|---|---|
| surge 1, unavailable 0 | 4 to 5, never below 4 ready | Safest, needs room for one extra pod |
| surge 25%, unavailable 25% | 3 to 5 | Default, faster, capacity dips a little |
| surge 0, unavailable 1 | 3 to 4 | No extra room needed, less capacity |
| surge 100%, unavailable 0 | 4 to 8 | Very fast, needs double the room |

```yaml
# Fragment of the Deployment: only the fields that matter for releases.
spec:
  replicas: 4
  revisionHistoryLimit: 5          # keep 5 old ReplicaSets for rollback
  progressDeadlineSeconds: 300     # mark the rollout failed after 5 min
  minReadySeconds: 10              # a pod must stay ready 10 s to count
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

:::example Dry run: 4 replicas, maxSurge 1, maxUnavailable 0
Old version is v1, new version is v2. "Ready" means the readiness probe passes.

| Step | Action | v1 ready | v2 ready | Total ready |
|---|---|---|---|---|
| 0 | Start | 4 | 0 | 4 |
| 1 | Create one v2 pod, wait until ready | 4 | 1 | 5 |
| 2 | Remove one v1 pod | 3 | 1 | 4 |
| 3 | Create one v2 pod, wait until ready | 3 | 2 | 5 |
| 4 | Remove one v1 pod | 2 | 2 | 4 |
| ... | Repeat | ... | ... | 4 or 5 |
| 8 | Remove the last v1 pod | 0 | 4 | 4 |

The number of ready pods never drops below 4. If the first v2 pod never becomes ready, the rollout simply stops at step 1 and all four v1 pods keep serving users. A bad release with a correct readiness probe hurts nobody.
:::

## Watching and undoing a rollout

```bash
# Start a rollout the proper way: change the image in Git and apply.
kubectl apply -f deployment.yaml
kubectl rollout status deploy/orders-api -n shop --timeout=5m

# See the versions Kubernetes remembers.
kubectl rollout history deploy/orders-api -n shop
kubectl rollout history deploy/orders-api -n shop --revision=3

# Go back to the previous version, or to a chosen one.
kubectl rollout undo deploy/orders-api -n shop
kubectl rollout undo deploy/orders-api -n shop --to-revision=3
```

A rollback is fast because the old ReplicaSet still exists. Kubernetes only scales it up again and scales the new one down, using the same rolling rules.

:::warn A rollback does not undo everything
`kubectl rollout undo` brings back the old pod template: image, environment, probes. It does not bring back a changed ConfigMap, a changed Secret or a changed database structure. Also, if you use GitOps (chapter 12), the tool will see that the cluster no longer matches Git and may roll forward again. In a GitOps setup the correct rollback is `git revert`.
:::

## The last 30 seconds of a pod

Most errors during a deploy come from old pods dying badly, not from new pods starting. When Kubernetes removes a pod, **two things begin at the same moment**:

- The pod is marked as terminating and is removed from the Service endpoints. This news must travel to every node and to the load balancer, which takes a moment.
- The kubelet sends the signal `SIGTERM` to the container, which means "please stop".

If the app exits immediately on `SIGTERM`, some nodes still send new requests to it for a second or two. Those requests fail. The fix is a short pause before the app starts shutting down, and then a clean shutdown.

:::flow Stopping a pod without dropping requests
Pod marked terminating | endpoints update begins
preStop pause | new traffic stops arriving
SIGTERM | app stops accepting
Finish open requests | then exit
SIGKILL | only if too slow
:::

```yaml
# Fragment of the Deployment: spec.template.spec
terminationGracePeriodSeconds: 45    # total time allowed to stop
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.5.0
    lifecycle:
      preStop:
        sleep:
          seconds: 10                # wait while traffic drains away
```

The built-in `sleep` action needs a fairly recent Kubernetes version. On older clusters people write `exec: { command: ["sleep", "10"] }` instead, but that needs a `sleep` program inside the image, which distroless images do not have. In that case, do the waiting in the app code. In every case the app must catch `SIGTERM`, stop accepting new connections, let the open requests finish, close its database connections and then exit.

The time for `preStop` plus the app's own shutdown must be shorter than `terminationGracePeriodSeconds`. When that period ends, the container is killed with `SIGKILL`, which cannot be caught.

## PodDisruptionBudget

Rolling updates are not the only reason pods disappear. Nodes are also emptied on purpose: for a Kubernetes upgrade, for a node replacement, or when the cluster autoscaler removes an underused node. Emptying a node is called a **drain**. These planned removals are **voluntary disruptions**.

A **PodDisruptionBudget** (PDB) tells Kubernetes how many pods of an app must stay up during voluntary disruptions. A drain that would break the budget waits.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: orders-api
  namespace: shop
spec:
  maxUnavailable: 1            # at most one pod down on purpose at a time
  selector:
    matchLabels:
      app: orders-api
```

```bash
kubectl get pdb -n shop                    # see "ALLOWED DISRUPTIONS"
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
kubectl uncordon <node-name>               # allow pods on the node again
```

:::warn A PDB that blocks every drain
A PDB with `minAvailable: 1` on an app with one replica allows zero disruptions. Node upgrades then hang, because the only pod may never be evicted. The same happens with `maxUnavailable: 0`. For anything that needs a PDB, run at least two replicas and prefer `maxUnavailable: 1`. Also note that a PDB does not protect against crashes or sudden node failures. Only more replicas do.
:::

## Spread the pods

Three replicas on one node die together when that node dies. Ask the scheduler to spread them over nodes and over **availability zones** (separate data centres of the cloud in one region, often shortened to AZ). You do this with `topologySpreadConstraints` in the pod spec. With `topologyKey: topology.kubernetes.io/zone` and `maxSkew: 1`, the number of pods in any two zones may differ by at most one.

## Two versions run at the same time

During every rolling update, v1 and v2 serve users together for a while. So v2 must be able to live next to v1. The usual trouble is the database. Never rename or drop a column in the same release that stops using it. Split it:

1. **Expand**: add the new column. Old code ignores it.
2. Deploy code that writes both and reads the new one.
3. **Contract**: in a later release, remove the old column.

Run database changes as a separate Job before the rollout, not inside every pod's start-up.

## Zero-downtime checklist

| # | Item | Why |
|---|---|---|
| 1 | At least 2 replicas, spread over nodes and zones | One pod can always serve |
| 2 | Honest readiness probe | New pods get traffic only when able |
| 3 | `maxUnavailable: 0` and `maxSurge: 1` or more | Capacity never drops |
| 4 | `preStop` pause and `SIGTERM` handling | Old pods finish their requests |
| 5 | Grace period longer than the slowest request | No hard kills |
| 6 | PodDisruptionBudget | Node maintenance cannot take all pods |
| 7 | Requests set, and room for the surge pod | The new pod can be scheduled |
| 8 | Backward-compatible database changes | v1 and v2 can run together |
| 9 | Image tag is a commit, not `latest` | Rollback is exact |
| 10 | Rollout watched by the pipeline | A stuck release fails loudly |

:::interview Users see a few 502 errors on every deploy. How do you find and fix the cause?
I check two moments. First, new pods: is there a readiness probe, and does it pass only when the app can really serve? Without it, traffic reaches pods that are still starting. Second, old pods: when a pod is terminated, endpoint removal and `SIGTERM` happen in parallel, so the load balancer may still send requests to a pod that has already stopped listening. I add a short `preStop` pause, make the app handle `SIGTERM` by finishing open requests, and make sure `terminationGracePeriodSeconds` is longer than the pause plus the slowest request. With an external load balancer I also check that its deregistration delay fits these timings. Then I set `maxUnavailable: 0` so capacity does not dip.
:::

:::revise
- Rolling update: new pods in, old pods out, step by step. `maxSurge` is extra, `maxUnavailable` is missing.
- `maxSurge: 1` with `maxUnavailable: 0` keeps full capacity during a release.
- A failing readiness probe stops a bad rollout before users are hurt.
- `kubectl rollout undo` is fast because the old ReplicaSet is kept. It does not undo config or database changes.
- Pod stop: endpoint removal and `SIGTERM` start together, so add a `preStop` pause and handle `SIGTERM`.
- A PDB protects against planned node drains, not against crashes. It needs 2 or more replicas.
:::

# Autoscaling and cost basics

*Match the number of pods and nodes to the real load, because every idle core is money.*

## Why this matters

Traffic is not flat. A food-ordering app is quiet at 4 in the morning and very busy at lunch and dinner. If you run enough pods for the dinner peak all day, you pay for empty machines most of the time. If you run enough for the quiet hours, the app falls over at dinner. **Autoscaling** changes the size automatically. And because size is what the cloud bills you for, autoscaling and cost are one topic.

## A real-life comparison

Look at a supermarket. When queues get long, the manager opens more billing counters. When the shop is empty, counters close. If all counters are open and the queue is still long, the shop itself needs to be made bigger.

| Supermarket | Kubernetes | Tool |
|---|---|---|
| Open more counters | More pods | Horizontal Pod Autoscaler (HPA) |
| Give a counter a faster machine | Bigger pods | Vertical Pod Autoscaler (VPA) |
| Extend the building | More nodes | Cluster Autoscaler or Karpenter |

"Horizontal" means more copies. "Vertical" means bigger copies.

## Horizontal Pod Autoscaler

The HPA is a control loop. Every 15 seconds or so it reads a metric, compares it with your target, and changes `replicas` on a Deployment.

It needs two things. The cluster must run the **metrics server**, a small add-on that collects CPU and memory usage from the nodes. And the containers must have **requests**, because a CPU target is a percentage of the request.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orders-api
  namespace: shop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders-api
  minReplicas: 3                   # never fewer, even at night
  maxReplicas: 12                  # never more, protects the bill
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60   # percent of the CPU request
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # wait 5 min before shrinking
      policies:
        - type: Pods
          value: 1                 # remove at most 1 pod per minute
          periodSeconds: 60
```

### The formula

The HPA uses one simple formula.

```text
desiredReplicas = ceil( currentReplicas x currentValue / targetValue )
```

`ceil` means "round up to the next whole number".

:::example Dry run: the dinner rush
Each pod requests 250m CPU. The target is 60%, so the HPA wants each pod to use about 150m on average.

| Time | Replicas | Average CPU | Calculation | New replicas |
|---|---|---|---|---|
| 18:00 | 3 | 55% | 3 x 55 / 60 = 2.75, ceil is 3 | 3 (no change) |
| 19:30 | 3 | 96% | 3 x 96 / 60 = 4.8, ceil is 5 | 5 |
| 19:35 | 5 | 72% | 5 x 72 / 60 = 6.0 | 6 |
| 19:40 | 6 | 61% | 6 x 61 / 60 = 6.1, inside tolerance | 6 (no change) |
| 23:00 | 6 | 20% | 6 x 20 / 60 = 2, below the minimum | 3, slowly |

Two details from the table. The HPA ignores small differences (about 10% around the target by default), so it does not flap. And it scales down slowly on purpose: it waits for the stabilization window and then removes pods at the rate you allowed.
:::

```bash
kubectl get hpa -n shop                  # TARGETS shows current/target
kubectl describe hpa orders-api -n shop  # events explain each decision
kubectl top pods -n shop                 # the numbers the HPA sees
```

:::warn Remove replicas from the manifest
If the Deployment YAML says `replicas: 3` and the HPA has scaled to 9, the next `kubectl apply` sets it back to 3 in the middle of the rush. When an HPA manages a Deployment, delete the `replicas` line from the manifest. With Argo CD, also tell it to ignore differences in that field.
:::

:::warn CPU is not always the right signal
A service that mostly waits for a database or another API can be overloaded while its CPU is low. Then a CPU-based HPA never scales. Scale such apps on a metric that follows the load, such as requests per second or queue length. That needs an adapter that feeds custom metrics to the HPA. **KEDA** is a popular add-on that scales on queue length and many other sources, and it can scale to zero.
:::

### Autoscaling is not instant

A new pod must be scheduled, pull its image and pass its readiness probe. If no node has room, a new node must start first, which takes minutes. So keep some headroom: choose a target such as 60%, not 95%, and keep `minReplicas` high enough to survive the time until help arrives. Small images (chapter 2) and fast start-up make autoscaling work much better.

## Node autoscaling

The HPA adds pods. Pods need nodes. When a pod cannot be placed because no node has enough unreserved CPU or memory, it stays `Pending`. A node autoscaler reacts to exactly this.

:::flow From load to new machines
More traffic | CPU rises
HPA | adds pods
Pods Pending | no room on nodes
Node autoscaler | adds a node
Pods Running | load is shared
:::

Two tools do this job. The **Cluster Autoscaler** grows the node groups you defined and works on all big clouds. **Karpenter**, which started on AWS, picks and starts a fitting machine type directly. Both also remove nodes that are mostly empty by moving their pods elsewhere. That is a voluntary disruption, so your PodDisruptionBudgets (chapter 7) are respected. An app with one replica and no PDB will have short outages whenever its node is removed.

## Cost basics

### What you pay for

Exact prices change and differ by region, so always read the provider's pricing page. The **list of things** that cost money is stable. For an EKS cluster:

| Item | Charged for | Typical surprise |
|---|---|---|
| Control plane | Every hour the cluster exists | Many tiny clusters add up |
| Worker nodes | Every hour each machine runs | Paid by size, not by usage |
| Disks (EBS volumes) | Size per month | Volumes left behind by deleted apps |
| Load balancers | Per hour, plus traffic | One per `LoadBalancer` Service |
| NAT gateways | Per hour, plus every GB through them | Image pulls and logs going out |
| Data transfer | GB between zones and to the internet | Chatty services in different zones |
| Logs and metrics | GB stored and scanned | Debug logs left on in production |

### Requests are the bill

You do not pay for what pods use. You pay for nodes, and the number of nodes is decided by the sum of **requests**.

:::example Dry run: the cost of a careless request
A team runs 20 pods. Each requests 1 CPU "to be safe". Real usage is about 0.2 CPU each.

| | Requested | Actually used |
|---|---|---|
| Per pod | 1000m | 200m |
| All 20 pods | 20 cores | 4 cores |
| 4-core nodes needed | About 6 | About 2 with headroom |

The cluster runs roughly three times more machines than the work needs. Setting the request to 300m (usage plus headroom) and letting an HPA add pods under load fixes most of it. No discount programme beats simply not reserving what you do not use.
:::

### Cost habits

- **Right-size requests** from real usage every few months. This is the biggest lever.
- **Autoscale** pods and nodes so nights and weekends are cheaper.
- **Use Spot capacity** for stateless apps. Spot machines are spare cloud capacity sold cheaper, and the cloud can take them back at short notice. They are fine when you have several replicas, PDBs and graceful shutdown.
- **Share one load balancer** through an Ingress or Gateway instead of one per service.
- **Scale test environments to zero** outside working hours.
- **Clean up** unused volumes, old snapshots, forgotten load balancers and old images.
- **Label everything** with team and app, so the bill can be split and someone owns each part.
- **Keep log volume sane.** Log at `info` in production and keep only what you need.

Open-source tools such as OpenCost can show cost per namespace and per app by combining requests, usage and cloud prices.

:::interview How does the HPA decide the number of replicas?
It runs a loop, about every 15 seconds. It reads the current metric value for the pods of the target, for example average CPU use as a percentage of the CPU request. Then it computes desired replicas as the current replicas times the current value divided by the target value, rounded up. It skips changes inside a small tolerance band and keeps the result between `minReplicas` and `maxReplicas`. For scaling down it uses a stabilization window, five minutes by default, and takes the highest recommendation in that window, so short dips do not remove pods. It needs the metrics server and requests on the containers.
:::

:::interview Your Kubernetes bill is too high. Where do you look first?
First I compare requests with real usage, because nodes are provisioned for requests. Oversized requests are the most common waste, so I right-size them and use VPA recommendations as input. Second, I check autoscaling: is there an HPA with sensible minimums, and does the node autoscaler actually remove empty nodes, or is something blocking it? Third, I look at the items outside the pods: load balancers per service, NAT gateway data, cross-zone traffic, unused volumes and log volume. Then I consider cheaper capacity such as Spot for stateless workloads and turning off non-production at night. I also add labels and a cost tool so each team sees its own share.
:::

:::revise
- HPA adds pods, VPA resizes pods, the node autoscaler adds nodes when pods are `Pending`.
- HPA formula: `ceil(current replicas x current value / target value)`, within min and max.
- HPA needs the metrics server and CPU requests. Remove `replicas` from the manifest.
- Scaling takes time, so keep headroom and a sensible `minReplicas`.
- You pay for nodes, and nodes follow requests. Right-sizing requests is the biggest saving.
- Hidden costs: load balancers, NAT gateways, cross-zone traffic, unused volumes, logs.
:::

# StatefulSets and storage

*Pods are disposable, data is not. Learn how Kubernetes attaches disks that outlive pods.*

## Why this matters

Chapter 1 said that a container's own filesystem is lost when the container is removed. For a web API that is fine. For a database, a message queue or a search index it is a disaster. These apps need a disk that stays when the pod goes, and they often need a stable name too, because the other members of the group must know who is who.

## A real-life comparison

Think of a bank locker.

- The **locker** itself is a metal box in the vault. It exists whether you visit or not.
- Your **locker agreement** says "this customer may use one medium locker". You show it, and the bank takes you to your box.
- The bank's **rule book** says how a new locker is prepared when a customer asks for one.

| Bank | Kubernetes | Meaning |
|---|---|---|
| The locker | PersistentVolume (PV) | A real piece of storage, for example a cloud disk |
| The agreement | PersistentVolumeClaim (PVC) | A request: "I need 20 GB of this kind" |
| The rule book | StorageClass | How to create a new disk on demand |
| The locksmith | CSI driver | The plugin that talks to the storage system |

**CSI** means Container Storage Interface. It is the standard that lets Kubernetes use any storage system through a plugin. On EKS, the plugin for normal disks is the **EBS CSI driver** (EBS is Amazon's block storage service).

## Dynamic provisioning

In the cloud nobody creates disks by hand. You write a PVC, and the disk appears. This is called **dynamic provisioning**.

:::flow From claim to mounted disk
PVC created | "20Gi, class gp3"
StorageClass | chooses the driver
CSI driver | creates a cloud disk
PV created | bound to the PVC
Pod starts | disk is mounted
:::

```yaml
# storageclass.yaml (EKS with the EBS CSI driver installed)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3                              # a general purpose SSD type
  encrypted: "true"
reclaimPolicy: Delete                    # delete the disk with the PVC
allowVolumeExpansion: true               # PVCs may be made bigger later
volumeBindingMode: WaitForFirstConsumer  # create the disk in the pod's zone
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: reports-data
  namespace: shop
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 20Gi
```

`WaitForFirstConsumer` matters in a multi-zone cluster. A cloud disk lives in one availability zone and can only be attached to a node in the same zone. With this setting, Kubernetes first decides where the pod will run and only then creates the disk in that zone.

### Access modes

| Mode | Short | Meaning |
|---|---|---|
| `ReadWriteOnce` | RWO | Mounted read-write by one node at a time. Normal for cloud disks. |
| `ReadOnlyMany` | ROX | Mounted read-only by many nodes |
| `ReadWriteMany` | RWX | Mounted read-write by many nodes. Needs a shared file system such as NFS or EFS. |
| `ReadWriteOncePod` | RWOP | Mounted by exactly one pod in the whole cluster |

## StatefulSet

A Deployment treats its pods like identical cashiers. Any one can be replaced by any other. Some apps are more like a cricket team: each player has a fixed jersey number and a fixed role, and you cannot swap the wicketkeeper with a bowler without anyone noticing.

A **StatefulSet** gives each pod three stable things:

1. **A stable name** with a number: `orders-db-0`, `orders-db-1`, `orders-db-2`.
2. **A stable DNS name**, through a headless Service: `orders-db-0.orders-db.shop.svc.cluster.local`.
3. **Its own disk**, created from a template. Pod `orders-db-0` always gets PVC `data-orders-db-0`, even after it is recreated on another node.

It also starts pods **in order** (0, then 1, then 2) and stops them in reverse order.

```yaml
# A headless Service gives each pod its own DNS name.
apiVersion: v1
kind: Service
metadata:
  name: orders-db
  namespace: shop
spec:
  clusterIP: None                # this makes it "headless"
  selector:
    app: orders-db
  ports:
    - name: postgres
      port: 5432
```

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: orders-db
  namespace: shop
spec:
  serviceName: orders-db           # the headless Service above
  replicas: 1
  selector:
    matchLabels: { app: orders-db }
  template:
    metadata:
      labels: { app: orders-db }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports: [{ name: postgres, containerPort: 5432 }]
          env:
            - name: PGDATA         # keep data in a sub-folder of the disk
              value: /var/lib/postgresql/data/pgdata
          envFrom:
            - secretRef: { name: orders-db-secret }  # POSTGRES_PASSWORD
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:            # one PVC per pod, made automatically
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: gp3
        resources: { requests: { storage: 20Gi } }
```

:::example Dry run: the database pod is deleted
The StatefulSet above is running. The pod `orders-db-0` uses the PVC `data-orders-db-0`.

| Step | What happens |
|---|---|
| 1 | You run `kubectl delete pod orders-db-0 -n shop`, or its node fails. |
| 2 | The StatefulSet controller sees that pod number 0 is missing. |
| 3 | It creates a new pod with the **same name**, `orders-db-0`. |
| 4 | The scheduler must choose a node in the **same zone** as the disk. |
| 5 | The old disk is detached from the old node and attached to the new one. |
| 6 | PostgreSQL starts and finds its data files exactly as it left them. |

The data survived because it was never in the pod. The pod is only the process that uses the disk. Note that between steps 1 and 6 the database was down. One replica gives you durable data, not high availability.
:::

:::warn A StatefulSet does not make your database clustered
Setting `replicas: 3` on the PostgreSQL example gives you three **separate, empty** databases, not one replicated database. A StatefulSet only provides stable names and disks. Replication, leader election, failover and backups must come from the database software, usually through an **operator** (a controller written for one specific product). For many teams the better answer is a managed database service such as Amazon RDS, with only stateless apps in the cluster.
:::

:::warn Things that silently destroy or block data
Scaling a StatefulSet down does not delete its PVCs, which is safe but keeps costing money. Deleting a PVC whose class has `reclaimPolicy: Delete` deletes the cloud disk for good. And a Deployment that mounts one `ReadWriteOnce` PVC can get stuck during a rolling update: the new pod lands on another node and waits forever for a disk that is still attached to the old pod. Use a StatefulSet or the `Recreate` strategy for such apps. Above all, a volume is not a backup. Take scheduled snapshots or database dumps and test restoring them.
:::

:::interview What is the difference between a Deployment and a StatefulSet?
A Deployment manages interchangeable pods. They have random names, start in any order and normally have no storage of their own. A StatefulSet manages pods with identity. Each pod has a fixed ordinal name, a stable DNS name through a headless Service, and its own PersistentVolumeClaim created from `volumeClaimTemplates`. When a pod is replaced, the new pod gets the same name and the same volume. Pods are created and removed in order. I use a Deployment for stateless services and a StatefulSet for databases, queues and other systems where members must be told apart.
:::

:::revise
- Container filesystems are temporary. Real data goes on a PersistentVolume through a PVC.
- StorageClass plus CSI driver create disks on demand (dynamic provisioning).
- Cloud disks are usually `ReadWriteOnce` and tied to one zone. Use `WaitForFirstConsumer`.
- StatefulSet gives stable pod names, stable DNS names and one PVC per pod, in order.
- A StatefulSet does not replicate data. Use an operator or a managed database.
- `reclaimPolicy: Delete` removes the disk with the PVC. Volumes are not backups.
:::

# Helm charts and values

*Package your manifests once and install them many times with different settings.*

## Why this matters

By now `orders-api` needs a Deployment, a Service, an Ingress, a ConfigMap, an HPA and a PDB. That is six files. You need them for dev, staging and production, with small differences: replica count, host name, image tag, resource sizes. Copying six files three times gives eighteen files that slowly drift apart. Someone fixes a probe in production and forgets staging. You need one set of templates and a small file of differences per environment.

## A real-life comparison

A wedding card printer keeps one design with blanks: names, date, venue. For each family, the printer fills the blanks and prints a set. The design is fixed. Only the filled-in values change.

**Helm** does this for Kubernetes manifests. It is also a **package manager** for the cluster, in the way `apt` is for Ubuntu or `npm` is for Node.js: you can install software that other people have packaged, with one command.

| Word | Meaning |
|---|---|
| Chart | The package: templates plus default values |
| Values | The settings that fill the blanks |
| Template | A manifest with blanks written as `{{ ... }}` |
| Release | One installed copy of a chart in a cluster, with a name |
| Revision | A numbered version of a release. Each upgrade adds one. |
| Repository | A place where charts are published |

## The layout of a chart

```text
orders-api/
  Chart.yaml              # name and version of the chart
  values.yaml             # default values
  values-prod.yaml        # only what differs in production
  templates/
    deployment.yaml
    service.yaml
    configmap.yaml
    hpa.yaml
```

```yaml
# values.yaml: the defaults
replicaCount: 2
image:
  repository: ghcr.io/example/orders-api
  tag: "1.5.0"
service:
  port: 80
  targetPort: 8080
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits: { memory: 512Mi }
autoscaling:
  enabled: false
  minReplicas: 3
  maxReplicas: 12
config:
  LOG_LEVEL: info
```

```yaml
# values-prod.yaml: only the differences
image:
  tag: "8a1b2c3"
autoscaling:
  enabled: true
config:
  LOG_LEVEL: warn
```

## Templates

Templates use the Go template language. A dot path such as `.Values.image.tag` reads from the values. `.Release.Name` is the name you gave at install time. The `|` sign sends a value through a function, like a pipe in the shell.

```yaml
# templates/deployment.yaml (shortened)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
      annotations:
        # A new hash when the config changes, so pods are replaced.
        checksum/config: {{ toYaml .Values.config | sha256sum }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          envFrom:
            - configMapRef:
                name: {{ .Release.Name }}-config
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

Three things to notice.

- The `if` block leaves out `replicas` when autoscaling is on. That is the HPA rule from chapter 8, solved once for every environment.
- The `checksum/config` annotation changes whenever the config values change. A changed pod template triggers a rolling update. This solves the "ConfigMap changed but pods did not restart" problem from chapter 5.
- `nindent 12` means "start a new line and indent by 12 spaces". YAML depends on correct indentation, so this small function matters a lot. The dash in `{{-` removes the empty space before the tag.

## The daily commands

```bash
helm lint ./orders-api                    # check the chart for mistakes

# Print the final YAML without touching the cluster. Always read this.
helm template orders-api ./orders-api -f orders-api/values-prod.yaml

# Install, or upgrade if it already exists. Wait until pods are ready.
helm upgrade --install orders-api ./orders-api -n shop \
  -f orders-api/values-prod.yaml --wait --timeout 5m

helm list -n shop                         # releases in the namespace
helm history orders-api -n shop           # revisions of one release
helm get values orders-api -n shop        # values of the current one
helm rollback orders-api 4 -n shop        # go back to revision 4
helm uninstall orders-api -n shop
```

Helm can also undo a failed upgrade on its own. In Helm 3 the flag is `--atomic`. Newer Helm versions call it `--rollback-on-failure`. Run `helm upgrade --help` to see which one your version has.

:::example Dry run: which value wins?
Values come from several places. Later sources override earlier ones.

| Order | Source | `image.tag` | `config.LOG_LEVEL` |
|---|---|---|---|
| 1 | `values.yaml` in the chart | `1.5.0` | `info` |
| 2 | `-f values-prod.yaml` | `8a1b2c3` | `warn` |
| 3 | `--set image.tag=9f8e7d6` | `9f8e7d6` | (not set here) |
| | **Final result** | `9f8e7d6` | `warn` |

Values are merged key by key, so `values-prod.yaml` does not need to repeat `image.repository`. It only lists what is different. `helm template` with the same flags shows you the exact result before anything is applied.
:::

## Using charts from other people

Most cluster add-ons (Ingress controllers, Prometheus, Argo CD) are installed with their official Helm charts. `helm repo add` registers a chart repository, `helm show values` prints the settings a chart offers, and `helm upgrade --install` with `--version` installs a pinned chart version with your own values file. Always pin the chart version, for the same reason you pin image tags.

:::warn Helm mistakes that reach production
First, **secrets in values files**. A `values-prod.yaml` with a database password is a secret in Git. Keep secrets out of values and bring them in through a secret manager (chapter 14). Second, **installing a chart blind**. A third-party chart can create cluster-wide permissions. Run `helm template` and read what it will create. Third, **changing things by hand** with `kubectl edit` after a Helm install. Helm does not know about your edit, and the next upgrade may overwrite it or behave in a confusing way.
:::

## Helm or Kustomize

**Kustomize** is the other common tool. It is built into `kubectl` (`kubectl apply -k`). It has no templates. You keep plain base manifests and write small **patches** per environment that are laid over the base.

Both work well with Argo CD. Many teams use Helm for add-ons and either tool for their own apps.

:::interview What is a Helm chart, and what happens when you run helm upgrade?
A chart is a package of Kubernetes manifest templates with default values. A release is one installation of a chart with a name. On `helm upgrade`, Helm merges the default values with my value files and `--set` flags, renders the templates into plain manifests, and compares them with the manifests of the last revision and the live objects. It sends the needed changes to the API server and stores the new manifests as a new revision, in a Secret inside the release namespace. With `--wait` it waits until the resources are ready. Because every revision is stored, `helm rollback` can re-apply an older one.
:::

:::revise
- A chart is templates plus default values. A release is one installed copy with numbered revisions.
- Values merge in order: chart defaults, then `-f` files, then `--set`. The last one wins.
- Always run `helm template` (and `helm lint`) before an upgrade to see the real YAML.
- `helm upgrade --install` works for first install and every later change.
- A checksum annotation on the pod template restarts pods when config changes.
- No secrets in values files, and pin chart versions.
:::

# Terraform for a multi-AZ VPC and EKS

*Describe your cloud network and cluster in code, so you can review it, repeat it and rebuild it.*

## Why this matters

A Kubernetes cluster does not float in the air. It sits on a network, machines, permissions and load balancers. If you create these by clicking in the cloud console, nobody knows later what was clicked, the staging setup differs from production in unknown ways, and rebuilding after a disaster means guessing. **Infrastructure as Code** (IaC) means you write the infrastructure in files, keep them in Git and let a tool create the real thing. **Terraform** is the most widely used tool for this. (OpenTofu is an open-source fork that uses the same language.)

## A real-life comparison

A building is not made by telling masons "put a brick here, now another one there". An architect draws a **blueprint**. The contractor compares the blueprint with what already stands on the site and builds only what is missing.

The contractor also keeps a **site register**: a book that lists everything already built and where. Without that book, the contractor would not know whether the wall on the left is part of this project or the neighbour's.

- The blueprint is your `.tf` files, written in a language called **HCL**.
- The contractor is the `terraform` program.
- The site register is the **state file**.

Two more words appear everywhere. A **provider** is the plugin that lets Terraform talk to one platform, such as AWS. A **resource** is one real thing that Terraform creates, such as a subnet or a cluster.

## The workflow

:::flow Every change goes the same way
Write | edit .tf files
terraform init | get providers, modules
terraform plan | show the difference
Review | a human reads the plan
terraform apply | make it real
:::

```bash
terraform fmt -recursive      # format the files
terraform init                # download providers and modules, set backend
terraform validate            # check syntax and references
terraform plan -out=tfplan    # compute and save the planned changes
terraform apply tfplan        # apply exactly the saved plan
```

### Reading a plan

| Symbol | Meaning | How careful to be |
|---|---|---|
| `+` | Create | Normal |
| `~` | Change in place | Check what changes |
| `-` | Destroy | Stop and think |
| `-/+` | Destroy and create again (replace) | Dangerous for databases and disks |

## State, and why it must be remote

The state file maps each resource in your code to the real object in the cloud, with its ID and attributes. Terraform needs it to know what already exists.

Three rules about state:

1. **Do not keep it on a laptop.** If the laptop is lost, Terraform forgets everything it built. Keep it in a **remote backend** such as an S3 bucket.
2. **Lock it.** If two people apply at the same time, the state gets corrupted. A backend with **locking** lets only one run at a time.
3. **Protect it.** The state can contain passwords and keys in plain text. Encrypt the bucket, restrict access, and never commit state to Git.

```hcl
# versions.tf
terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"          # any 5.x, never a surprise 6.0
    }
  }

  backend "s3" {
    bucket       = "example-tfstate-prod"       # created once, by hand
    key          = "platform/eks/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true           # state locking with a lock file in S3
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = { Project = "shop", ManagedBy = "terraform" }
  }
}
```

Older Terraform versions do the locking with a DynamoDB table (`dynamodb_table = "..."`) instead of `use_lockfile`. You will see that in many existing projects. The values `var.region` and `var.kubernetes_version` used in this chapter are input variables, declared in a file `variables.tf`.

## The network: a multi-AZ VPC

A **VPC** (Virtual Private Cloud) is your own private network inside AWS. A **subnet** is a slice of that network that lives in one availability zone. For a production cluster we want:

- **Three zones**, so that the loss of one data centre does not stop the app.
- **Public subnets** for things that must be reachable from the internet: only the load balancers.
- **Private subnets** for the worker nodes. They have no public address.
- **NAT gateways**, which let private machines start connections **out** to the internet (to pull images, for example) without letting anyone connect **in**.

Writing every subnet, route table and gateway by hand takes hundreds of lines. The community VPC module wraps them.

```hcl
# network.tf
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "shop-prod"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.name
  cidr = "10.0.0.0/16"            # 65,536 addresses for the whole VPC
  azs  = local.azs

  public_subnets  = ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.64.0/19", "10.0.96.0/19", "10.0.128.0/19"]

  enable_nat_gateway     = true
  one_nat_gateway_per_az = true   # one zone down, others still get out
  enable_dns_hostnames   = true

  # These tags tell Kubernetes where it may place load balancers.
  public_subnet_tags  = { "kubernetes.io/role/elb" = 1 }
  private_subnet_tags = { "kubernetes.io/role/internal-elb" = 1 }
}
```

The private subnets are large (`/19` is about 8,000 addresses each) on purpose. With the default EKS networking, **every pod takes a real IP address from the subnet**. Small subnets run out of addresses long before the nodes run out of CPU.

## The cluster: EKS

```hcl
# eks.tf
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.name
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets      # nodes in private subnets

  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns                = {}
    kube-proxy             = {}
    vpc-cni                = {}               # pod networking
    eks-pod-identity-agent = {}               # IAM roles for pods
  }

  eks_managed_node_groups = {
    general = {
      instance_types = ["m6i.large"]
      min_size       = 3                      # one per zone at least
      max_size       = 9
      desired_size   = 3
    }
  }
}
```

```bash
# After apply: write the kubeconfig entry and test.
aws eks update-kubeconfig --region ap-south-1 --name shop-prod
kubectl get nodes -o wide
kubectl get nodes -L topology.kubernetes.io/zone   # one column per zone
```

:::note This is an outline, not a finished platform
The two modules create dozens of resources: subnets, route tables, NAT gateways, the control plane, IAM roles, security groups and a node group. A real setup adds more: the EBS CSI driver, the AWS Load Balancer Controller, a node autoscaler, private API access, log settings. Module inputs also change between major versions (newer major versions of the EKS module renamed some of them), so pin the version and read the module's documentation and upgrade notes for the version you use.
:::

:::example Dry run: reading a plan before apply
You change `max_size` from 9 to 12 and also, by mistake, edit the VPC `cidr`. The plan ends with:

```text
  # module.eks...aws_eks_node_group.this[0] will be updated in-place
  ~ scaling_config { ~ max_size = 9 -> 12 }

  # module.vpc.aws_vpc.this[0] must be replaced
-/+ resource "aws_vpc" "this" { ~ cidr_block = "10.0.0.0/16" -> ... }

Plan: 31 to add, 1 to change, 31 to destroy.
```

The first block is what you wanted: one in-place change. The second block and the last line are the alarm: "31 to destroy" means the whole network, and everything in it, would be rebuilt. You stop, undo the CIDR edit and plan again until it says `0 to add, 1 to change, 0 to destroy`. The exact wording of a plan differs by version, but the habit is the same: read the summary line first, then every `-` and `-/+`.
:::

## Modules and environments

A **module** is a folder of `.tf` files that you call with inputs, like a function. You have just used two public ones. You can write your own to keep environments the same. A common layout is one shared module (for example `modules/platform`, with VPC, EKS and add-ons together) and one small folder per environment (`envs/staging`, `envs/prod`) that calls it with different sizes.

Each environment has its **own state**. A mistake in staging then cannot touch production, and the plans stay small and readable.

:::warn Changes made by hand cause drift
If someone edits a security group in the AWS console, reality no longer matches the code. This is called **drift**. The next `terraform apply` will quietly undo the manual change, or fail in a confusing way. Make the rule simple: what Terraform created is changed only through Terraform. Run `terraform plan` on a schedule in CI to detect drift early.
:::

:::warn Cost and danger in this outline
One NAT gateway per zone is the resilient choice, and each one is billed per hour and per GB. For a learning cluster, set `single_nat_gateway = true` instead, and run `terraform destroy` when you finish, because an idle EKS cluster with nodes and NAT gateways still costs money every hour. And never run `terraform destroy` or approve a plan with unexpected destroys against production without a second person reading it.
:::

:::tip Terraform for the platform, GitOps for the apps
Use Terraform for things that change rarely and belong to the cloud: network, cluster, node groups, IAM roles, databases. Do not deploy your application manifests with Terraform as well. Apps change many times a day and are handled much better by the GitOps flow in the next chapter.
:::

:::interview What is Terraform state and why do we store it remotely?
State is Terraform's record of the real resources it manages: for each resource in the code, the ID and attributes of the matching object in the cloud. Terraform compares code, state and reality to compute a plan. If the state is lost, Terraform no longer knows the resources are its own and would try to create them again. So the state is kept in a remote backend such as S3, where the team shares one copy, with locking so that two applies cannot run together, and with encryption and tight access because the state can contain secrets. I never edit it by hand. I use commands like `terraform state mv` or `terraform import` when I must change it.
:::

:::revise
- Terraform: write HCL, `init`, `plan`, review, `apply`. The plan is the safety step.
- Read the plan summary and every `-` and `-/+` line before approving.
- State maps code to real resources. Keep it remote, locked, encrypted, and out of Git.
- Production network: 3 zones, public subnets for load balancers, private subnets for nodes, NAT for outbound.
- On EKS each pod takes a VPC IP, so make private subnets large.
- Pin module and provider versions. Never change Terraform-managed resources by hand.
:::

# CI/CD with GitHub Actions and GitOps with Argo CD

*From a Git commit to running pods, with no human typing kubectl and no cluster password in the pipeline.*

## Why this matters

You now have a hardened image, good manifests and a cluster. The last gap is the path between a developer's commit and production. If that path is "someone runs commands from a laptop", releases depend on one person's memory, and nobody can say for sure what is running. A pipeline makes the path the same every time, and GitOps makes Git the one place that says what should be running.

## Two halves with different jobs

- **CI** (Continuous Integration) answers: "Is this commit good, and can I make an image from it?" It tests, builds, scans and pushes the image.
- **CD** (Continuous Delivery) answers: "Which image should run where?" It changes the cluster.

There are two ways to do the CD half.

| | Push model | Pull model (GitOps) |
|---|---|---|
| Who changes the cluster | The CI pipeline runs `kubectl` or `helm` | An agent inside the cluster |
| Cluster credentials live | In the CI system | Nowhere outside the cluster |
| Source of truth | Whatever the last pipeline did | A Git repository |
| Manual changes in the cluster | Stay until someone notices | Detected, and can be auto-corrected |

## A real-life comparison

In the **push** model you give the courier a key to your house, and the courier walks in and puts the parcel on the shelf. It works, but now a delivery company holds your house key.

In the **pull** model a trusted housekeeper lives in the house. Each morning the housekeeper reads the list on the notice board at the gate and arranges the house to match it. To change the house, you change the list. Nobody outside has a key. In GitOps, the list is a Git repository and the housekeeper is **Argo CD**.

:::flow The complete path
Commit | app repository
CI | test, build, scan
Registry | image with commit tag
Config repo | tag is updated
Argo CD | syncs the cluster
:::

## Part 1: the CI pipeline

**GitHub Actions** runs **workflows**: YAML files in `.github/workflows/`. A workflow has **jobs**, a job has **steps**, and a step either runs a shell command or **uses** a ready-made action.

This pipeline logs in to AWS with **OIDC**. That is a method where GitHub proves "this run belongs to repository X" with a short-lived token, and AWS gives back temporary credentials for one role. No long-lived AWS key is stored in GitHub at all.

```yaml
# .github/workflows/release.yml (part 1: the header)
name: release
on:
  push:
    branches: [main]

permissions:
  contents: read
  id-token: write            # needed for the OIDC login to AWS

env:
  AWS_REGION: ap-south-1

```

A first job named `test` installs dependencies and runs the tests (not shown here, it is a normal `npm ci` and `npm test`). The job below builds the image, scans it and pushes it only if the scan passes. The registry is **Amazon ECR**, the image registry of AWS.

```yaml
# part 2: the image job, under "jobs:"
  image:
    needs: test                # runs only if the tests passed
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.vars.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_CI_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      - id: ecr
        uses: aws-actions/amazon-ecr-login@v2
      - id: vars               # tag = first 7 characters of the commit
        env:
          REGISTRY: ${{ steps.ecr.outputs.registry }}
        run: |
          TAG="${GITHUB_SHA::7}"
          echo "tag=$TAG" >> "$GITHUB_OUTPUT"
          echo "image=$REGISTRY/orders-api:$TAG" >> "$GITHUB_OUTPUT"
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: .
          load: true           # keep the image on the runner for now
          tags: ${{ steps.vars.outputs.image }}
          cache-from: type=gha       # reuse layers from earlier runs
          cache-to: type=gha,mode=max
      - uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: ${{ steps.vars.outputs.image }}
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: "1"       # a finding fails the job, nothing is pushed
      - run: docker push "${{ steps.vars.outputs.image }}"
```

:::tip Pin the actions you use
An action is someone else's code running with your credentials. Version tags such as `@v4` can be moved by the action's owner. For third-party actions, many teams pin to a full commit hash and let a bot propose updates. The version numbers in this chapter are examples. Check each action's release page for the current one.
:::

## Part 2: hand over to GitOps

The CI pipeline does **not** talk to the cluster. Its last job only edits one line in a second repository, the **config repository**, which holds the Helm chart and the values for each environment.

```yaml
# part 3: the hand-over job, under "jobs:"
  bump:
    needs: image
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: example/shop-config
          token: ${{ secrets.CONFIG_REPO_TOKEN }}
      - name: Write the new image tag
        env:
          TAG: ${{ needs.image.outputs.tag }}
        run: |
          yq -i '.image.tag = strenv(TAG)' \
            apps/orders-api/values-prod.yaml
      - name: Commit and push
        env:
          TAG: ${{ needs.image.outputs.tag }}
        run: |
          git config user.name "release-bot"
          git config user.email "release-bot@example.com"
          git commit -am "orders-api: deploy $TAG"
          git push
```

For production, many teams let this job open a **pull request** instead of pushing directly. A human approves it, and the merge is the release.

Why a second repository? The app repository holds code, the Dockerfile and tests. The config repository holds charts, values and Argo CD Applications. Keeping them apart gives a clean release history (`git log` of the config repository shows what was deployed, when and by whom) and avoids a loop where the pipeline's own commit triggers the pipeline again.

## Part 3: Argo CD

**Argo CD** is a controller that runs inside the cluster. It is a reconcile loop like the ones in chapter 3, but its desired state comes from Git.

1. It reads a path in a Git repository and renders it (plain YAML, Helm or Kustomize).
2. It compares the result with the live objects in the cluster.
3. If they differ, it reports the app as `OutOfSync`, and, if you allow it, applies the difference.

You describe each app with an **Application** object.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: orders-api-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/shop-config.git
    targetRevision: main             # branch, tag or commit to follow
    path: apps/orders-api            # the Helm chart lives here
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc   # this same cluster
    namespace: shop
  syncPolicy:
    automated:
      prune: true                    # delete what was removed from Git
      selfHeal: true                 # undo manual changes in the cluster
    syncOptions:
      - CreateNamespace=true
  ignoreDifferences:                 # the HPA owns the replica count
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

### Two statuses to read

| Status | Values | Question it answers |
|---|---|---|
| Sync status | `Synced`, `OutOfSync` | Does the cluster match Git? |
| Health status | `Healthy`, `Progressing`, `Degraded`, `Missing` | Do the resources actually work? |

An app can be `Synced` and `Degraded` at once: Argo CD applied exactly what Git says, and what Git says is broken (for example an image tag that does not exist). Always read both.

```bash
kubectl get applications -n argocd        # works without the argocd CLI

argocd app list
argocd app get orders-api-prod            # status, health, resources
argocd app diff orders-api-prod           # Git compared with the cluster
argocd app sync orders-api-prod           # sync now (manual policy)
argocd app history orders-api-prod        # what was deployed and when
```

### Drift

**Drift** means the cluster no longer matches Git, because somebody changed the cluster directly.

:::example Dry run: a manual hotfix at 2 a.m.
The Application has `selfHeal: true`. Git says the memory limit is `512Mi`.

| Time | Event | Sync status |
|---|---|---|
| 02:00 | An engineer runs `kubectl edit deploy orders-api` and sets `1Gi` | `Synced` |
| 02:00 | Argo CD notices the live object differs from Git | `OutOfSync` |
| 02:01 | Self-heal applies the Git version again: limit is `512Mi` | `Synced` |
| 02:02 | The engineer is confused: "my fix disappeared" | `Synced` |
| 02:10 | The engineer changes `values-prod.yaml` in Git and merges | `OutOfSync` |
| 02:12 | Argo CD syncs: limit is `1Gi`, and the change is recorded in Git | `Synced` |

The tool is not being difficult. It is doing its job: Git is the truth. The fix that went through Git is still there next week, and everyone can see who made it and why.
:::

### Rollback in GitOps

The rollback is a Git operation: `git revert` the commit that changed the image tag, push, and Argo CD syncs the previous version. This keeps Git and the cluster in agreement and leaves a record. Argo CD also has `argocd app rollback`, but it only works with automated sync switched off, and the app stays out of sync with Git until you fix Git as well.

:::warn Automated sync needs respect
`prune: true` deletes every resource that disappears from Git. If you rename a folder or move a file carelessly, Argo CD may delete a running app. `selfHeal: true` undoes emergency changes made with `kubectl`. Both settings are what you want in a mature setup, but start a new app with manual sync, look at `argocd app diff` for a while, and switch on automation when you trust the repository. Protect the main branch of the config repo with reviews, because a merge there is a production change.
:::

:::interview What is GitOps and how is it different from a pipeline that runs kubectl apply?
GitOps means the desired state of the cluster is stored in Git, and an agent inside the cluster keeps pulling that state and reconciling the cluster to it. With a push pipeline, the CI system holds cluster credentials and applies changes once, when it runs. Nothing notices if someone later changes the cluster by hand. With GitOps the cluster credentials never leave the cluster, every change is a reviewed Git commit, drift is detected continuously and can be corrected automatically, and a rollback is a `git revert`. The CI pipeline's job ends with pushing the image and updating the tag in the config repository.
:::

:::revise
- CI tests, builds, scans and pushes an image tagged with the commit. It does not touch the cluster.
- Use OIDC for cloud login from CI. No long-lived keys in secrets.
- GitOps: Git holds the desired state, an in-cluster agent pulls and reconciles it.
- Argo CD `Application` = source (repo, revision, path) + destination (cluster, namespace) + sync policy.
- Sync status says "matches Git", health status says "works". Read both.
- `selfHeal` undoes manual changes, `prune` deletes removed objects, and rollback is `git revert`.
:::

# Observability with Prometheus, Grafana and logs

*See what your system is doing, get woken up only for real problems, and find the cause quickly.*

## Why this matters

Kubernetes hides failures very well. A pod crashes and is restarted in seconds. A node dies and its pods move. That is good for users, but it also means your app can be half broken for days and nobody notices: restarting every ten minutes, slow for one in twenty users, one zone silently failing. **Observability** means you can answer "what is happening inside, and why?" from the outside, using the signals the system gives off.

## A real-life comparison

In a hospital, a patient monitor next to the bed shows a few numbers all the time: pulse, blood pressure, oxygen, temperature. If one crosses a line, an alarm rings at the nurses' station. The patient's file holds the detailed notes: what happened, when, and what was given.

- The numbers on the monitor are **metrics**: cheap, always on, good for trends and alarms.
- The alarm is an **alert**.
- The file is the **logs**: detailed text about single events, read when you investigate.

A third signal, **traces**, follows one request through many services. It is very useful in large systems, and it builds on the same habits, so this chapter focuses on metrics and logs.

## The four golden signals

You could measure a thousand things. If you may pick only four for a service that answers requests, pick these. They are called the **four golden signals**.

| Signal | Question | Example metric |
|---|---|---|
| Latency | How long do requests take? | 95th percentile response time |
| Traffic | How much demand is there? | Requests per second |
| Errors | How many requests fail? | Share of responses with status 5xx |
| Saturation | How full is the service? | Memory used compared with the limit |

The **95th percentile** (written p95) is the time within which 95 out of 100 requests finish. It is better than the average, because an average hides the slow requests that annoy users.

## How Prometheus works

**Prometheus** is the standard metrics system for Kubernetes. Its main idea is **pull**: your app does not send metrics anywhere. It only shows its current numbers on an HTTP page, usually `/metrics`. Prometheus visits that page every few seconds (this visit is called a **scrape**) and stores the numbers with a timestamp.

:::flow The metrics path
App | exposes /metrics
Prometheus | scrapes and stores
Alert rules | checked every minute
Alertmanager | groups and routes
Phone or chat | a human is told
:::

```text
# What an app's /metrics page looks like (shortened).
http_requests_total{method="GET",route="/orders",status="200"} 18234
http_requests_total{method="GET",route="/orders",status="500"} 12
http_request_duration_seconds_bucket{route="/orders",le="0.1"} 15890
http_request_duration_seconds_bucket{route="/orders",le="0.5"} 18101
http_request_duration_seconds_bucket{route="/orders",le="+Inf"} 18246
process_resident_memory_bytes 143200256
```

The words in curly brackets are **labels**. They let you slice one metric by route, status and so on.

There are three main metric types. A **counter** only goes up, like total requests, and is queried with `rate()`. A **gauge** goes up and down, like memory in use. A **histogram** counts values in buckets, like request durations, and is queried with `histogram_quantile()`.

### What you get on a cluster

The usual way to install everything is the `kube-prometheus-stack` Helm chart from chapter 10. It brings Prometheus, Alertmanager and Grafana, plus helpers that report on the nodes (node-exporter), on Kubernetes objects such as replica counts and restarts (kube-state-metrics) and on the CPU and memory of every container (cAdvisor, inside the kubelet).

With this stack, you tell Prometheus to scrape your app by creating a **ServiceMonitor**. It is a small custom object that says "scrape the pods behind Services with these labels", and it names the Service port and the path (`/metrics`).

For this to work, the Service itself needs the label `app: orders-api`, not only its pods.

## The golden signals in PromQL

**PromQL** is the query language of Prometheus. `rate(x[5m])` means "how fast did counter `x` grow per second, averaged over the last 5 minutes". Metric and label names depend on your app's library, so adjust them.

```text
# TRAFFIC: requests per second
sum(rate(http_requests_total{job="orders-api"}[5m]))

# ERRORS: share of requests that failed (0.02 means 2%)
sum(rate(http_requests_total{job="orders-api",status=~"5.."}[5m]))
/
sum(rate(http_requests_total{job="orders-api"}[5m]))

# LATENCY: p95 response time in seconds
histogram_quantile(0.95, sum by (le) (
  rate(http_request_duration_seconds_bucket{job="orders-api"}[5m])))

# SATURATION: memory used as a share of the limit, per pod
sum by (pod) (
  container_memory_working_set_bytes{namespace="shop",container="api"})
/
sum by (pod) (kube_pod_container_resource_limits{
  namespace="shop",container="api",resource="memory"})
```

## Alert rules

An alert rule is a PromQL expression plus a waiting time. If the expression stays true for the whole `for` period, the alert **fires**.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: orders-api-alerts
  namespace: shop
  labels:
    release: monitoring
spec:
  groups:
    - name: orders-api
      rules:
        - alert: OrdersApiHighErrorRate
          expr: |
            sum(rate(http_requests_total{job="orders-api",status=~"5.."}[5m]))
              /
            sum(rate(http_requests_total{job="orders-api"}[5m])) > 0.05
          for: 5m                      # must stay true for 5 minutes
          labels:
            severity: page             # wake someone up
          annotations:
            summary: More than 5% of orders-api requests are failing
            runbook: https://example.com/runbooks/orders-api-errors
```

:::example Dry run: the life of one alert
The rule is "error share above 5% for 5 minutes".

| Time | Error share | Alert state | What happens |
|---|---|---|---|
| 14:00 | 0.4% | Inactive | Nothing |
| 14:03 | 9% | Pending | The condition is true. The 5-minute clock starts. |
| 14:05 | 2% | Inactive | It recovered by itself. The clock resets. Nobody was disturbed. |
| 14:20 | 12% | Pending | The clock starts again |
| 14:25 | 14% | Firing | Sent to Alertmanager, which pages the on-call person |
| 14:40 | 0.5% | Resolved | A "resolved" message is sent |

The `for` field is what separates a short blip from a real problem. Too short, and people are woken for nothing. Too long, and users suffer before anyone knows.
:::

**Alertmanager** receives firing alerts and decides who is told. It **groups** related alerts into one message, **routes** them by labels (for example `severity: page` goes to the phone, `severity: ticket` goes to a chat channel), and lets you **silence** alerts during planned work.

:::warn Alert fatigue is a real outage risk
If the team gets fifty alerts a day, they stop reading them, and the one that matters is missed. Page a human only for symptoms that need action now. Send everything else to a ticket or a dashboard. After every noisy week, delete or fix the alerts that nobody acted on. An alert that is always ignored is worse than no alert.
:::

## Grafana dashboards

**Grafana** draws graphs from Prometheus data. A dashboard that helps during an incident is simple and ordered from "is there a problem?" to "where is it?": the four golden signals in the top row, then per-pod graphs (restarts, CPU against request, memory against limit), then the dependencies such as database latency.

Mark deployments on the graphs (as annotations). The most common cause of a problem is a change, and a line at "deploy 14:02" next to a jump in errors saves a lot of time. Keep dashboards as JSON files in Git, so they are reviewed and can be restored.

## Logs

In a container, the rule is simple: **write logs to standard output, one event per line**. Do not write log files inside the container. The container runtime captures standard output, and `kubectl logs` reads it from the node.

But those captured logs are deleted when the pod is deleted and are rotated when they grow. So a small agent runs on every node as a DaemonSet (Fluent Bit, Vector and Grafana Alloy are common choices), reads the log files of all containers, adds the pod name, namespace and labels, and ships everything to a central store such as Loki, OpenSearch or CloudWatch Logs.

Write logs as **JSON** with the same fields every time. Then the store can filter by field instead of searching text. (The example below is one log line, wrapped here to fit the page.)

```json
{"time":"2026-03-04T09:15:02Z","level":"error","msg":"payment failed",
 "request_id":"b7c1e9","route":"/orders","status":502,"duration_ms":840}
```

A **request ID** that is created at the edge and passed to every service lets you collect all log lines of one user request across services.

```bash
kubectl logs deploy/orders-api -n shop --tail=100       # one pod of it
kubectl logs -l app=orders-api -n shop --tail=50 \
  --prefix --max-log-requests=10                         # all pods
kubectl logs <pod> -n shop -f                            # follow live
kubectl logs <pod> -n shop --previous                    # before restart
kubectl logs <pod> -n shop -c api --since=15m            # one container
kubectl logs -l app=orders-api -n shop --since=1h | grep '"level":"error"'
```

:::warn Labels with too many values break Prometheus
Every distinct combination of label values is stored as its own time series. If you put a user ID, an order ID or a full URL into a metric label, you create millions of series, and Prometheus runs out of memory. Labels must have a small, fixed set of values: route template, method, status code. Details about a single request belong in logs, not in metric labels. The same care applies to logs: never log passwords, tokens or card numbers.
:::

:::interview What are the four golden signals?
Latency, traffic, errors and saturation. Latency is how long requests take, measured as percentiles such as p95 and not only as an average. Traffic is the demand, such as requests per second. Errors is the share of requests that fail. Saturation is how full the service is, such as memory compared with its limit, CPU throttling or queue length. Together they show whether users are affected and whether the service is close to its capacity. I put these four at the top of each service dashboard and base paging alerts mainly on errors and latency, because those are symptoms that users feel.
:::

:::revise
- Metrics are numbers over time for trends and alerts. Logs are detailed events for investigation.
- Four golden signals: latency, traffic, errors, saturation.
- Prometheus pulls: apps expose `/metrics`, Prometheus scrapes on an interval.
- Counter with `rate()`, gauge directly, histogram with `histogram_quantile()`.
- An alert is an expression plus a `for` time. Page on user symptoms and link a runbook.
- Log JSON to stdout, ship with a node agent, and keep label values few.
:::

# Security: RBAC, NetworkPolicy and Pod Security

*Assume one part will be broken into, and make sure the damage stops there.*

## Why this matters

A fresh cluster is very trusting. Every pod can talk to every other pod. A container may run as root. A login that works for one thing often works for everything. This is convenient on day one and dangerous on day one hundred, when the cluster runs many apps and one of them has a bug. Security work in Kubernetes is mostly about **limiting the blast radius**: when one thing is compromised, how far can the attacker go?

## A real-life comparison

Think of a large office building with many companies.

- The **ID card** opens only the floors you work on. That is **RBAC**: who may do what through the API.
- **Doors between departments** stay locked, even for people already inside the building. That is **NetworkPolicy**: which pods may talk to which.
- **Building rules** say what any tenant may do inside their office: no gas cylinders, no breaking walls. That is **Pod Security**: what a container may do on its node.
- Valuables are kept in a **bank locker**, not in a desk drawer. That is **secrets management**.

No single layer is perfect. Using several layers together is called **defence in depth**.

## RBAC: who may do what

**RBAC** means Role-Based Access Control. Every request to the API server is checked in two steps. **Authentication**: who are you? **Authorization**: are you allowed to do this? RBAC is the authorization part. A rule is always three things:

- a **subject**: a user, a group or a ServiceAccount
- a **verb**: `get`, `list`, `watch`, `create`, `update`, `patch`, `delete`
- a **resource**: pods, deployments, secrets and so on

A **ServiceAccount** is an identity for a program, not for a person. Every pod runs as one, and an app that calls the Kubernetes API uses it.

| Object | Scope | Purpose |
|---|---|---|
| Role | One namespace | A list of allowed verbs on resources |
| ClusterRole | Whole cluster | The same, for all namespaces or cluster-wide resources such as nodes |
| RoleBinding | One namespace | Gives a Role (or ClusterRole) to subjects in that namespace |
| ClusterRoleBinding | Whole cluster | Gives a ClusterRole to subjects everywhere |

```yaml
# A role for developers: look and debug in "shop", change nothing.
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-viewer
  namespace: shop
rules:
  - apiGroups: ["", "apps"]
    resources: ["pods", "services", "configmaps", "deployments"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log"]          # allow kubectl logs
    verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-viewer-developers
  namespace: shop
subjects:
  - kind: Group
    name: shop-developers            # a group from your login system
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: app-viewer
  apiGroup: rbac.authorization.k8s.io
```

Notice that `secrets` is not in the list. RBAC has no "deny" rules. Everything is forbidden until a rule allows it.

:::example Dry run: testing permissions with kubectl auth can-i
You can ask the API server "would this be allowed?" without doing it. The `--as` flags let an admin test as someone else.

| Command (all with `-n shop --as=dev1 --as-group=shop-developers`) | Answer |
|---|---|
| `kubectl auth can-i list pods` | yes |
| `kubectl auth can-i get pods --subresource=log` | yes |
| `kubectl auth can-i delete pods` | no |
| `kubectl auth can-i get secrets` | no |
| `kubectl auth can-i list pods -n payments` | no (other namespace) |

`kubectl auth can-i --list -n shop` prints everything the current user may do in the namespace. Run it for your own account. Many people are surprised by how much they are allowed.
:::

Give each app its own ServiceAccount and set `serviceAccountName` in the pod spec. If you set nothing, the pod uses the `default` ServiceAccount of the namespace, which every other careless pod shares. If the app never calls the Kubernetes API, also set `automountServiceAccountToken: false`, so that the pod carries no API token at all.

:::warn Permissions that are bigger than they look
Do not bind `cluster-admin` to people or pipelines for convenience, and avoid `*` in verbs and resources. Three permissions are much stronger than they sound. `get` on Secrets reads every password in the namespace. `create` on Pods lets someone start a pod that mounts any Secret or ServiceAccount of that namespace. And permission to create RoleBindings can be used to give oneself more rights. Treat all three as admin-level access.
:::

## NetworkPolicy: which pods may talk

By default the cluster network is flat: any pod can open a connection to any other pod in any namespace. If an attacker gets into one forgotten test app, they can reach your database directly.

A **NetworkPolicy** is a firewall rule written with labels. Two facts to remember:

1. A pod with **no** policy selecting it accepts everything. As soon as **one** policy selects it, everything not explicitly allowed is blocked for that direction.
2. Policies only **add** permissions. There is no "deny" rule. You start with a policy that allows nothing and then add small allow rules.

**Ingress** here means traffic coming into a pod, and **egress** means traffic going out of a pod. (This is unrelated to the Ingress object from chapter 4.)

```yaml
# 1. Default deny: select every pod in the namespace, allow nothing.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: shop
spec:
  podSelector: {}                  # empty selector = all pods
  policyTypes: [Ingress, Egress]
```

```yaml
# 2. orders-api: accept calls from storefront, call the database and DNS.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: orders-api
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: orders-api
  policyTypes: [Ingress, Egress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: storefront
      ports:
        - { protocol: TCP, port: 8080 }
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: orders-db
      ports:
        - { protocol: TCP, port: 5432 }
    - to:                          # DNS lookups: port 53 only
        - namespaceSelector: {}    # (any pod in any namespace)
      ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
```

:::warn A NetworkPolicy may do nothing at all
The API server accepts NetworkPolicy objects on every cluster, but they are enforced by the **network plugin** (the CNI plugin), and not every plugin or default setup enforces them. If yours does not, your policies are stored and silently ignored. On EKS, enforcement must be switched on in the VPC CNI add-on, or you install a plugin such as Calico or Cilium. Always prove it: start a throwaway pod without the allowed labels and check that its connection to the app times out. Two more traps: forgetting the DNS rule (everything breaks with "could not resolve host"), and forgetting traffic that does not come from a pod. A load balancer that sends straight to pod IPs, and the kubelet's probes on some setups, need their own allow rule, for example an `ipBlock` for the load balancer subnets.
:::

## Pod Security: what a container may do

Chapter 1 explained that root inside a container is root for the kernel. Pod Security is about removing powers that an app never needs.

### The securityContext

```yaml
# Fragment of the Deployment: spec.template.spec
serviceAccountName: orders-api
securityContext:                     # for the whole pod
  runAsNonRoot: true                 # refuse to start as user 0
  runAsUser: 65532
  runAsGroup: 65532
  seccompProfile:
    type: RuntimeDefault             # block rarely used system calls
containers:
  - name: api
    image: ghcr.io/example/orders-api:1.5.0
    securityContext:                 # for this container
      allowPrivilegeEscalation: false   # cannot gain more rights later
      readOnlyRootFilesystem: true      # cannot change its own files
      capabilities:
        drop: ["ALL"]                   # give up all special root powers
    volumeMounts:
      - name: tmp
        mountPath: /tmp              # the only writable place
volumes:
  - name: tmp
    emptyDir: {}
```

**Capabilities** are pieces of root's power, such as "change network settings" or "load kernel modules". A web app needs none of them. A **read-only root filesystem** means an attacker cannot download and save tools into the container, and it also catches apps that write files where they should not.

### Enforcing it for a whole namespace

Kubernetes defines three **Pod Security Standards**. `privileged` has no restrictions and is only for system add-ons that truly need node access. `baseline` blocks the well-known dangerous settings and is the minimum for everything else. `restricted` requires the hardened settings shown above and is the right level for your own applications.

A built-in checker, **Pod Security Admission**, applies a level to a namespace when you add labels. **Admission** means the check that happens when an object is created, before it is stored.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: shop
  labels:
    pod-security.kubernetes.io/enforce: restricted   # reject bad pods
    pod-security.kubernetes.io/warn: restricted      # warn in kubectl
    pod-security.kubernetes.io/audit: restricted     # write to audit log
```

Roll this out gently. Start with only the `warn` and `audit` labels, fix what the warnings list, and add `enforce` last. For rules beyond these three levels (for example "images must come from our registry"), teams add a policy engine such as Kyverno or OPA Gatekeeper.

## Secrets management

Chapter 5 showed the limits of the Secret object. The production answer has two parts.

### Part 1: no static cloud keys

If a pod needs to read an S3 bucket, do not put an AWS access key into a Secret. Give the pod's ServiceAccount an **IAM role**. On EKS this is done with EKS Pod Identity or with the older method called IRSA. The pod then receives short-lived credentials automatically, they rotate on their own, and there is no key that could leak.

### Part 2: real secrets live in a secret manager

For passwords that must exist (a database password, a payment API key), keep the true value in a secret manager and let a tool bring it into the cluster. The **External Secrets Operator** copies values from the secret manager into Kubernetes Secrets, so Git holds only a pointer. The Secrets Store CSI Driver mounts them as files instead. **Sealed Secrets** and **SOPS** take another road: they encrypt the value, so that the encrypted form can be committed safely.

```yaml
# The pointer that is safe to commit. The operator creates and
# refreshes the real Secret "orders-api-secret" from AWS Secrets Manager.
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: orders-api-secret
  namespace: shop
spec:
  refreshInterval: 1h                # pick up rotated values
  secretStoreRef:
    kind: ClusterSecretStore
    name: aws-secrets-manager        # set up once by the platform team
  target:
    name: orders-api-secret          # the Kubernetes Secret to create
  data:
    - secretKey: DB_PASSWORD         # key inside the Kubernetes Secret
      remoteRef:
        key: prod/shop/orders-api    # name in AWS Secrets Manager
        property: db_password        # field inside that secret
```

Older installations of the operator use `apiVersion: external-secrets.io/v1beta1`. Check with `kubectl api-resources | grep externalsecret`.

:::interview How do you handle secrets in a GitOps setup?
Plain Secrets cannot go into Git, because base64 is not encryption. I keep the real values in a secret manager such as AWS Secrets Manager and commit only an ExternalSecret object that points to them. The External Secrets Operator in the cluster reads the value using an IAM role and creates the Kubernetes Secret, and it refreshes it when the value is rotated. An alternative is to commit encrypted values with Sealed Secrets or SOPS. For access to cloud services I do not use secrets at all. I bind an IAM role to the pod's ServiceAccount, so the credentials are short-lived and automatic.
:::

:::revise
- Security goal: limit the blast radius with several layers (defence in depth).
- RBAC: subject + verb + resource. Role is per namespace, ClusterRole is cluster-wide, bindings grant them.
- Reading Secrets and creating Pods are admin-level permissions. Test with `kubectl auth can-i`.
- NetworkPolicy: default deny, then allow DNS and exact peers. The network plugin must enforce it.
- Pod Security `restricted`: non-root, no privilege escalation, drop all capabilities, seccomp default.
- Use IAM roles for pods instead of static keys, and a secret manager for real secrets.
:::

# Troubleshooting runbook

*A fixed order of commands for the four most common pod failures, so you do not have to think at 3 a.m.*

## Why this matters

When production is down, people panic and start changing things: restart this, delete that, raise a limit. Sometimes it helps by accident, and the evidence is destroyed either way. A **runbook** is a written procedure for a known kind of problem. It replaces panic with steps. Kubernetes problems are well suited to runbooks, because the cluster almost always tells you what is wrong, if you ask in the right place.

## A real-life comparison

A good doctor does not prescribe medicine the moment you walk in. The order is fixed: listen to the symptoms, check the vital signs, order a test if needed, name the problem, and only then treat. A doctor who gives antibiotics to everyone will sometimes be right and never know why.

## The universal first five minutes

:::flow Always in this order
get | what is the status?
describe | read the events
logs | what did the app say?
events | what happened around it?
debug | look inside
:::

```bash
NS=shop

# 1. STATUS: which pods, what state, how many restarts, which node?
kubectl get pods -n $NS -o wide

# 2. DESCRIBE: read "State", "Last State" and "Events" at the bottom.
kubectl describe pod <pod> -n $NS

# 3. LOGS: the current container and the one that crashed before it.
kubectl logs <pod> -n $NS --tail=100
kubectl logs <pod> -n $NS --previous

# 4. EVENTS: everything in the namespace, newest last.
kubectl get events -n $NS --sort-by=.lastTimestamp | tail -n 30

# 5. WHAT CHANGED: most incidents start with a change.
kubectl rollout history deploy/orders-api -n $NS
```

The `STATUS` column of `kubectl get pods` points you to the right runbook.

| Status you see | Where the problem is | Go to |
|---|---|---|
| `Pending` | Scheduling: no node accepted the pod | Runbook 1 |
| `ErrImagePull`, `ImagePullBackOff` | The image cannot be downloaded | Runbook 2 |
| `CrashLoopBackOff`, `Error` | The app starts and then exits | Runbook 3 |
| `OOMKilled` | The container went over its memory limit | Runbook 4 |
| `CreateContainerConfigError` | A ConfigMap or Secret is missing | Chapter 5 |
| `Running` but `0/1` ready | The readiness probe fails | Chapter 6 |

## Runbook 1: Pending

**Meaning:** the pod exists in the API, but the scheduler found no node for it. No container has started, so there are no logs. Everything you need is in the events.

```bash
kubectl describe pod <pod> -n shop        # read the last lines
kubectl get nodes                         # are nodes Ready?
kubectl describe node <node> | grep -A 8 "Allocated resources"
kubectl get pvc -n shop                   # is a claim still Pending?
kubectl get resourcequota -n shop
```

A typical event looks like this:

```text
Warning  FailedScheduling  default-scheduler
  0/3 nodes are available: 1 node(s) had untolerated taint
  {dedicated: batch}, 2 Insufficient cpu.
```

Read it as a count: of 3 nodes, 1 refuses the pod because of a taint and 2 do not have enough unreserved CPU.

| Message contains | Cause | Fix |
|---|---|---|
| `Insufficient cpu` or `memory` | Requests do not fit on any node | Lower the requests, or add nodes (check the node autoscaler) |
| `untolerated taint` | The node is reserved or not ready | Add a toleration, or use other nodes |
| `didn't match Pod's node affinity/selector` | The pod asks for a node label that no node has | Fix the selector or label the nodes |
| `unbound immediate PersistentVolumeClaims` | The disk could not be created | `kubectl describe pvc`, check the StorageClass |
| `volume node affinity conflict` | The disk is in another zone than the free nodes | Add capacity in the disk's zone |
| `exceeded quota` (on the ReplicaSet) | The namespace quota is used up | Raise the quota or free resources |

A **taint** is a mark on a node that says "do not put pods here unless they explicitly accept this mark". The acceptance on the pod is a **toleration**.

## Runbook 2: ImagePullBackOff

**Meaning:** the pod was scheduled, but the node cannot download the image. `ErrImagePull` is the first failure. `ImagePullBackOff` means Kubernetes is waiting before the next try, with a growing delay.

```bash
kubectl describe pod <pod> -n shop        # the event shows the reason

# Which image exactly is the pod asking for?
kubectl get pod <pod> -n shop \
  -o jsonpath='{.spec.containers[*].image}{"\n"}'
```

| Event text contains | Cause | Fix |
|---|---|---|
| `manifest unknown`, `not found` | Wrong name or a tag that was never pushed | Fix the tag. Check that CI really pushed it. |
| `unauthorized`, `denied`, `no basic auth credentials` | The node may not read this private registry | Add an image pull secret, or fix the node's IAM role for ECR |
| `i/o timeout`, `no such host` | The node cannot reach the registry | Check NAT gateway, DNS and firewall rules |
| `toomanyrequests` | The registry's rate limit was hit | Log in to the registry, or mirror the image into your own |
| `no matching manifest for linux/arm64` | The image was built for a different CPU type | Build a multi-platform image |

## Runbook 3: CrashLoopBackOff

**Meaning:** the container starts, exits, is restarted, and exits again. `BackOff` means the kubelet waits longer before each new try: 10 seconds, 20, 40, and so on up to 5 minutes. So the pod is not "restarting quickly". Most of the time it is waiting.

The image is fine and the node is fine. The question is: **why does the process exit?**

```bash
# The logs of the container that just died are the best evidence.
kubectl logs <pod> -n shop --previous --tail=50

# Exit code and reason of the last crash.
kubectl get pod <pod> -n shop -o \
  jsonpath='{.status.containerStatuses[0].lastState.terminated}{"\n"}'

# Did a probe kill it? Look for "Liveness probe failed" in the events.
kubectl describe pod <pod> -n shop | tail -n 20
```

| Exit code | Meaning | Usual cause |
|---|---|---|
| 0 | Exited without error | The process finished. It is a one-time script, not a server. |
| 1 (or other small numbers) | The app reported an error | Missing config, cannot reach the database, bug at start |
| 126, 127 | Command cannot run, or was not found | Wrong `command`, missing file, wrong CPU type |
| 137 | Killed with `SIGKILL` (128 + 9) | Over the memory limit, or not stopped in time |
| 139 | Segmentation fault (128 + 11) | Crash in native code |
| 143 | Stopped with `SIGTERM` (128 + 15) | Asked to stop, often by a failed liveness probe |

If the logs are empty, the process died before it could print anything. Then look inside with a debug container. **Ephemeral containers** let you attach a temporary container with tools to a running pod, even when the app image is distroless.

```bash
# Attach a toolbox container to a RUNNING pod (shares its processes).
kubectl debug -it <pod> -n shop --image=busybox:1.36 --target=api
```

:::example Dry run: a real CrashLoopBackOff investigation
After a deploy, `kubectl get pods` shows two new pods in `CrashLoopBackOff` with 4 restarts. The old pods still serve users, because the rollout stopped (chapter 7).

| Step | Command | Finding |
|---|---|---|
| 1 | `kubectl logs <pod> --previous` | `Error: connect ECONNREFUSED 10.100.8.20:5432` |
| 2 | Think | The app cannot reach the database at start and exits |
| 3 | `kubectl get endpointslices -n shop` | `orders-db` has an address, so the database is up |
| 4 | `kubectl get networkpolicy -n shop` | A new policy `orders-api` was added in this release |
| 5 | `kubectl describe networkpolicy orders-api` | Egress allows pods with `app: order-db`, a typo |
| 6 | Fix the label in Git, merge, sync | New pods start, the rollout completes |

Nothing was deleted or restarted by hand. The logs gave the symptom, and "what changed in this release?" gave the cause.
:::

## Runbook 4: OOMKilled

**Meaning:** the container used more memory than its limit, and the kernel killed it (chapter 1). The pod usually goes on into `CrashLoopBackOff`, so always check the last state.

```bash
kubectl describe pod <pod> -n shop
#   Last State:  Terminated
#     Reason:    OOMKilled
#     Exit Code: 137

kubectl top pod <pod> -n shop --containers      # usage right now
kubectl get pod <pod> -n shop -o \
  jsonpath='{.spec.containers[*].resources}{"\n"}'
```

Now answer one question with your memory graph from chapter 13: **what shape does memory have before the kill?**

| Shape of the graph | Diagnosis | Fix |
|---|---|---|
| Flat, close to the limit, killed under load | The limit is simply too low | Raise the request and limit to the real need plus headroom |
| Climbs steadily for hours, then killed, again and again | Memory leak | Fix the leak in the app. A higher limit only delays it. |
| Sudden spike on certain requests | One operation loads too much data | Process in pages or streams, limit request size |
| Killed right at start | The runtime's heap is set above the limit | Set the heap size below the container limit |

Do not confuse `OOMKilled` with `Evicted`. `OOMKilled` is the kernel killing one container that passed its own **limit**. `Evicted` is the kubelet removing whole pods because the **node** ran low on memory or disk. It removes pods that use more than their request, `BestEffort` first. The fix for evictions is honest requests and more node capacity.

## Habits during an incident

1. **Stop the bleeding first.** If a release caused it, roll back (or `git revert`) before you understand everything. Users first, curiosity second.
2. **Change one thing at a time**, and write down what you did and when.
3. **Keep the evidence.** Save `describe` output and logs before pods are replaced.
4. **Tell people.** One line in the team channel every few minutes is better than silence.
5. **Afterwards, write it up without blame.** What happened, how it was noticed, what fixed it, and what will prevent it. Then add the missing alert or the missing runbook step.

:::warn Three reflexes that make things worse
**Deleting the pod first.** It destroys the `--previous` logs and the events, and the new pod usually fails the same way. **Force deleting** with `--force --grace-period=0`. It only removes the object from the API. The container may still run on the node, which is dangerous for anything with a disk. **Raising limits or adding replicas blindly.** It hides a leak or a bad query for a while and raises the bill. Look first, then act.
:::

:::interview A pod is in CrashLoopBackOff. How do you debug it?
CrashLoopBackOff means the container starts and exits repeatedly, and the kubelet waits longer between restarts. I first run `kubectl logs --previous` to read the output of the crashed container, because the current one may have nothing yet. Then `kubectl describe pod` for the exit code, the reason and the events. Exit code 1 with an error message usually means configuration or a dependency: a missing environment variable, a wrong Secret name, a database that cannot be reached. Exit code 137 with reason OOMKilled means the memory limit. Events with "Liveness probe failed" mean Kubernetes itself is killing a slow-starting app, which needs a startup probe. If there are no logs, I check the command and use `kubectl debug` to look inside. I also ask what changed in the last release, and roll back if users are affected.
:::

:::revise
- Order: `get`, `describe`, `logs --previous`, events, then debug. Do not delete first.
- `Pending`: a scheduling problem. Read the `FailedScheduling` event.
- `ImagePullBackOff`: wrong name or tag, missing registry access, or no network to the registry.
- `CrashLoopBackOff`: the process exits. Logs of the previous container and the exit code tell why.
- `OOMKilled` (exit 137): over the container's memory limit. Decide between "limit too low" and "leak".
- In an incident: mitigate first, change one thing at a time, keep evidence, write it up.
:::

# Cheat sheet, interview questions and study plan

*Everything from the playbook on a few pages, plus a plan to make it stick.*

## How to use this chapter

This chapter is for revision, not for first reading. Keep the command blocks open while you practise. Use the question tables the evening before an interview. And follow the study plan with a real cluster, because nobody learns Kubernetes only by reading.

## kubectl: look

```bash
kubectl config get-contexts                  # which cluster am I on?
kubectl config set-context --current --namespace=shop
kubectl get pods -o wide                     # node and IP columns
kubectl get pods -A                          # all namespaces
kubectl get pods -l app=orders-api --show-labels
kubectl get deploy,rs,pods,svc,ingress -n shop
kubectl get pod <pod> -o yaml                # full object with status
kubectl describe pod <pod>                   # events at the bottom
kubectl get events --sort-by=.lastTimestamp
kubectl top pods ; kubectl top nodes         # live usage
kubectl explain deployment.spec.strategy     # built-in field docs
kubectl api-resources                        # every kind on the cluster
```

## kubectl: change and release

```bash
kubectl apply -f manifest.yaml               # create or update
kubectl diff -f manifest.yaml                # preview what would change
kubectl apply -f manifest.yaml --dry-run=server   # validate, save nothing
kubectl delete -f manifest.yaml

kubectl rollout status deploy/orders-api
kubectl rollout history deploy/orders-api
kubectl rollout undo deploy/orders-api [--to-revision=N]
kubectl rollout restart deploy/orders-api    # new pods, same image

kubectl scale deploy/orders-api --replicas=5 # emergency only
kubectl cordon <node>                        # no new pods on the node
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
kubectl uncordon <node>
```

## kubectl: debug

```bash
kubectl logs <pod> --tail=100 -f             # follow
kubectl logs <pod> --previous                # the crashed container
kubectl logs -l app=orders-api --prefix --since=10m
kubectl exec -it <pod> -- sh                 # needs a shell in the image
kubectl debug -it <pod> --image=busybox:1.36 --target=api
kubectl port-forward svc/orders-api 8080:80  # reach it from the laptop
kubectl run tmp --rm -it --restart=Never --image=busybox:1.36 -- sh
kubectl get endpointslices -l kubernetes.io/service-name=orders-api
kubectl auth can-i --list                    # what am I allowed to do?
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

## Docker, Helm, Terraform, Argo CD

```bash
# Docker
docker build -t orders-api:dev .             # build from the Dockerfile
docker run --rm -p 8080:8080 orders-api:dev  # run and remove on exit
docker history orders-api:dev                # layers and their sizes
docker image ls ; docker system df           # what uses the disk
trivy image --severity HIGH,CRITICAL orders-api:dev

# Helm
helm lint ./chart ; helm template rel ./chart -f values-prod.yaml
helm upgrade --install rel ./chart -n shop -f values-prod.yaml --wait
helm history rel -n shop ; helm rollback rel <revision> -n shop

# Terraform
terraform fmt -recursive ; terraform validate
terraform plan -out=tfplan ; terraform apply tfplan
terraform state list ; terraform output

# Argo CD
argocd app get <app> ; argocd app diff <app> ; argocd app sync <app>
```

## Rapid-fire interview questions

Cover the right column and answer aloud. One or two sentences are enough for each.

| Question | Short answer |
|---|---|
| What is a container? | A normal process, isolated by namespaces and limited by cgroups, with files from image layers. |
| Why multi-stage builds? | Build tools stay in the first stage, so the final image is small and has less to attack. |
| Why not the `latest` tag? | It moves. You cannot tell what runs or roll back to an exact version. |
| What is the reconcile loop? | A controller compares desired and actual state and acts to close the gap, forever. |
| What is a headless Service? | A Service with `clusterIP: None`. DNS returns the pod IPs directly. |
| Is base64 encryption? | No. It is only an encoding that anyone can reverse. |
| Request versus limit? | Request is reserved for scheduling. Limit is the hard cap at run time. |
| Liveness versus readiness? | Liveness failure restarts the container. Readiness failure only removes it from traffic. |
| What is a PDB? | A rule that limits how many pods of an app may be down during planned disruptions. |
| Why is Terraform state remote? | So the team shares it, with locking and encryption, and it is not lost with a laptop. |
| Push or pull deployment? | Push: CI applies to the cluster. Pull: an in-cluster agent syncs from Git. |
| The four golden signals? | Latency, traffic, errors, saturation. |
| Exit code 137? | Killed with `SIGKILL`, very often `OOMKilled`. |

## Scenario questions

:::interview Design a zero-downtime deployment for a web API on Kubernetes.
I run at least three replicas spread across zones with topology spread constraints. The Deployment uses a rolling update with `maxUnavailable: 0` and `maxSurge: 1`, so capacity never drops. Each pod has a readiness probe that passes only when the app can serve, and a startup probe if it starts slowly. For shutdown, the pod has a short `preStop` pause, the app handles `SIGTERM` by finishing open requests, and the grace period is longer than the slowest request. A PodDisruptionBudget protects against node drains. Database changes are backward compatible, because old and new versions run together during the rollout. Images are tagged by commit, the release goes through Git and Argo CD, and the rollout is watched, so a failing version stops at the first pod and is reverted with a `git revert`.
:::

:::interview The site is slow after today's release. Walk me through your first ten minutes.
First I confirm the symptom on the dashboard: which of latency, errors, traffic and saturation changed, and did it start at the deploy marker? If users are clearly hurt and the timing matches, I roll back first and investigate after. Then I look at the pods: restarts, `CrashLoopBackOff`, `OOMKilled`, readiness failures, CPU throttling. I read logs of the new version for errors and timeouts, and I check dependencies such as database latency. I compare what changed in the release: code, config, resource settings, network policies. I keep notes of each step with times, tell the team what I am doing, and after recovery I write a short blameless review with the fix and one prevention action.
:::

:::warn What interviewers notice quickly
Reciting definitions without a single "I ran this and saw that" is easy to spot. So are these: saying a Secret is encrypted, mixing up liveness and readiness, claiming a StatefulSet replicates data, and saying "I would restart the pod" as the first step for every problem. It is fine to say "I have not used that in production, but here is how I would approach it". An honest, structured answer beats a memorised one.
:::

## A six-week study plan

Plan for about one hour on weekdays and a longer session at the weekend. For local practice, use a small cluster on your laptop with a tool such as `kind` or `minikube`. Use a cloud cluster only in the weeks that need it, and destroy it afterwards.

| Week | Chapters | Build this |
|---|---|---|
| 1 | 1 to 2 | A multi-stage, non-root image of a small API. Compare sizes before and after. Scan it. |
| 2 | 3 to 5 | Deployment, Service, ConfigMap and Secret on a local cluster. Delete pods and watch them return. |
| 3 | 6 to 8 | Add requests, limits, three probes, a PDB and an HPA. Do a rolling update under load and a rollback. |
| 4 | 9 to 10 | A StatefulSet with a volume. Package the API as a Helm chart with dev and prod values. |
| 5 | 11 to 12 | Terraform a small VPC and cluster, or use local Argo CD. Build the CI pipeline and a GitOps sync. |
| 6 | 13 to 16 | Install the Prometheus stack, one dashboard, one alert. Add NetworkPolicies. Practise the runbooks. |

### Break it on purpose

The fastest way to learn the runbook is to cause each failure yourself in a test namespace and then fix it using only `kubectl`.

| Break it like this | You should see |
|---|---|
| Use an image tag that does not exist | `ImagePullBackOff` |
| Set the memory limit to `20Mi` | `OOMKilled`, then `CrashLoopBackOff` |
| Request `cpu: "64"` | `Pending` with `Insufficient cpu` |
| Refer to a Secret that does not exist | `CreateContainerConfigError` |
| Point the readiness probe at a wrong path | `Running`, `0/1`, and a rollout that waits |
| Change the Service selector by one letter | Empty EndpointSlices |
| Edit a Deployment by hand under Argo CD self-heal | `OutOfSync`, then your change is undone |

:::revise
- Debug order: `get`, `describe`, `logs --previous`, events, then `debug`.
- Zero downtime: readiness probe, `maxUnavailable: 0`, graceful shutdown, PDB, compatible database changes.
- Requests drive scheduling and cost. Limits protect the node. Memory over the limit means `OOMKilled`.
- Git is the source of truth: Terraform for the platform, Argo CD for the apps, rollback by `git revert`.
- Watch the four golden signals and page only on user-facing symptoms.
- Learn by breaking things on a test cluster, one failure at a time.
:::
