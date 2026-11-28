---
title: Choose a host
description: Where to install UHQ Panel OS? Compatibility of Coolify, Dokploy, CapRover, Portainer, Docker VPS, Railway, Vercel, Render, Heroku…
---

# 🌍 Choose a host

UHQ Panel OS is not just a website: it is **a web panel + a TCP proxy engine + a PostgreSQL database**. To run, the platform must therefore:

| Requirement | Why |
|---|---|
| ✅ **Run a Docker container continuously** | the proxy engine is a long-running process (not a "serverless" function) |
| ✅ **Publish a TCP port** (990 by default, + 9000-9250 for dedicated ports) | customers connect to this port as an HTTP/CONNECT proxy, not over HTTPS |
| ✅ **A PostgreSQL 14+ database** | accounts, traffic, logs (provided by `docker-compose.yml`) |
| ✅ **Persistent volumes** | backups, configuration, logs |

## Compatibility

| Platform | Web panel | TCP proxy | Verdict | Guide |
|---|:---:|:---:|---|---|
| **Coolify** | ✅ | ✅ | ⭐ **Recommended** — Docker Compose, automatic HTTPS, one-click updates | [Coolify](/en/guide/hebergeurs/coolify) |
| **Dokploy** | ✅ | ✅ | ✅ Very good — same idea as Coolify | [Dokploy](/en/guide/hebergeurs/dokploy) |
| **VPS + Docker Compose** | ✅ | ✅ | ✅ The simplest and most transparent | [Docker VPS](/en/guide/hebergeurs/vps) |
| **Portainer** | ✅ | ✅ | ✅ Good (add an HTTPS reverse proxy) | [Portainer](/en/guide/hebergeurs/portainer) |
| **CapRover** | ✅ | ⚠️ | ⚠️ Possible, more manual (one app = one container) | [CapRover](/en/guide/hebergeurs/caprover) |
| **Railway** | ✅ | ⚠️ | ⚠️ Possible through "TCP Proxy" (random public port, a single port) | [Railway](/en/guide/hebergeurs/railway) |
| **Fly.io** | ✅ | ⚠️ | ⚠️ TCP possible with a dedicated IPv4 (paid) — not documented in detail | — |
| **Vercel / Netlify** | ❌ | ❌ | ❌ **Impossible** (serverless, no TCP, no long-running process) | [Why not?](/en/guide/hebergeurs/serverless) |
| **Render / Heroku** | ⚠️ | ❌ | ❌ No public inbound TCP port: the proxy would not be reachable | [Why not?](/en/guide/hebergeurs/serverless) |
| **Cloudflare Pages / Workers** | ❌ | ❌ | ❌ Impossible | [Why not?](/en/guide/hebergeurs/serverless) |

::: tip In short
Want the simplest option? A **€5/month VPS** + **Coolify** (compose) = panel over HTTPS, proxy on port 990, one-click updates from the panel.
:::

::: info Legend
✅ tested and documented · ⚠️ possible but with limits explained in the guide · ❌ cannot work for technical reasons (not a configuration issue).
:::

## Before choosing: the two things that break everything

1. **Cloudflare (orange cloud) in front of the proxy domain**: TCP traffic is not forwarded. Use a domain or subdomain set to **DNS only** (grey cloud) for the proxy. The web panel itself can perfectly sit behind Cloudflare (real IP detection included).
2. **Provider firewall / security group** (OVH, Hetzner, AWS, Oracle…): open **80, 443, 990 and 9000-9250** (in addition to the OS firewall if you have one).

## Want a guided installation?

The **[Start the installation](/en/guide/commencer)** wizard walks you through it step by step (automatic with Coolify, manual with Docker Compose, or local test).
