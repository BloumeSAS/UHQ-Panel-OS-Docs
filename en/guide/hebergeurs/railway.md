---
title: Install on Railway
description: UHQ Panel OS on Railway — possible through the TCP Proxy, with significant limits.
---

# 🚂 Install on Railway

::: warning Know this before you start
Railway publishes TCP through a **"TCP Proxy"**: the public address looks like `xxx.proxy.rlwy.net:RANDOM_PORT`. Consequences:

- the proxy will **not** be reachable on port 990 of your domain;
- **only one** TCP port per service: no dedicated ports 9000-9250;
- the cost follows usage (RAM/CPU/egress) — a proxy relaying a lot of traffic gets expensive.

For production, prefer a VPS ([Coolify](/en/guide/hebergeurs/coolify), [Docker VPS](/en/guide/hebergeurs/vps)).
:::

## 1. Deploy

1. **New Project → Deploy from GitHub repo** → `BloumeSAS/UHQ-Panel-OS` (Railway detects the `Dockerfile`).
2. **New → Database → PostgreSQL**.
3. On the panel service, variables: `DATABASE_URL` = <span v-pre>`${{Postgres.DATABASE_URL}}`</span>.
4. **Settings → Networking**:
   - *Generate Domain* (or custom domain) → port **8000** (HTTPS).
   - *TCP Proxy* → internal port **990**.
5. **Settings → Volumes**: mount a volume on `/app/data`.

## 2. Set the proxy's public host

In the panel: **Settings → Proxy**, enter the **public host** and **public port** given by Railway (`xxx.proxy.rlwy.net` and the port shown), so that the generated connection credentials are correct.

## 3. Update

Railway redeploys on every push to the tracked branch. Disable it if you prefer to choose your versions (*Settings → Source → Auto-deploy*).
