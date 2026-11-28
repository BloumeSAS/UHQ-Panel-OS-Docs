---
title: Install on Coolify
description: Deploy UHQ Panel OS on Coolify with Docker Compose (recommended method) — HTTPS, proxy port, one-click updates.
---

# 🧊 Install on Coolify

**Coolify** is the recommended platform: automatic HTTPS (Traefik), one-click redeploys, and the panel can update itself through the deploy webhook.

::: tip Docker Compose, not "Docker Image" or "Dockerfile"
**Always use the "Docker Compose" type.** The repository's `docker-compose.yml` declares **everything that is needed together**: the application, the **PostgreSQL** database, the **persistent volumes**, the **proxy port 990** and the **9000-9250** range, the open-files limit and the health check.

| Coolify type | Result |
|---|---|
| ✅ **Docker Compose** | everything is created at once, ready to use |
| ⚠️ Dockerfile / Nixpacks | the application only: you must add PostgreSQL, the volumes, port 990 and the variables by hand |
| ❌ Docker Image | same, and no automatic update when a version is released |
:::

## 1. Prepare the server

- an Ubuntu 22.04+ / Debian 12+ VPS (2 vCPU, 2 GB RAM minimum) with **Coolify installed** (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`);
- a **domain** whose `A` record points to the server IP;
- ports **22, 80, 443, 990** (and **9000-9250** for dedicated ports) open at your hosting provider.

::: warning Cloudflare
If the domain is behind Cloudflare, set it to **DNS only (grey cloud)**, or use a second grey-cloud subdomain for the proxy. See [Choose a host](/en/guide/hebergeurs/#before-choosing-the-two-things-that-break-everything).
:::

## 2. Create the application

1. **Projects → Add → New Resource → Public Repository** (or Private if you have a fork).
2. Repository: `https://github.com/BloumeSAS/UHQ-Panel-OS` — branch **main**.
3. **Build Pack: Docker Compose** — "Docker Compose Location": `/docker-compose.yml`.
4. Click **Continue**.

## 3. Domain

In the configuration, on the **app** service, enter the domain **with the internal port**:

```text
https://panel.example.com:8000
```

Coolify (Traefik) provides the HTTPS certificate by itself. Do **not** set any domain for port 990: it is TCP, published directly on the host by the compose file.

## 4. Environment variables (optional)

None is required. The most useful ones:

| Variable | Role |
|---|---|
| `SETUP_TOKEN` | set your own installation token (otherwise it is generated and shown in the logs) |
| `TZ` | time zone (default `Europe/Paris`) |
| `PROXY_PORT` | proxy port (default `990`) |

## 5. Deploy

Click **Deploy** and follow **Deployments**. On first start, open the application **Logs**, note the `TOKEN D'INSTALLATION` line (installation token), then go to `https://panel.example.com/setup`.

```bash
# Test from your computer once an account exists:
curl -x http://USERNAME:PASSWORD@panel.example.com:990 https://api.ipify.org
```

## 6. One-click updates

1. Coolify → **Keys & Tokens → API tokens** → create a token with the **deploy** permission.
2. Your application → **Webhooks** → copy the **Deploy Webhook** URL.
3. In the panel: **Settings → General → Automatic update** → platform **Coolify** → paste the URL and the token (**POST** method + **Bearer**).

See [Automatic updates](/en/guide/mise-a-jour-automatique).

::: info VPN in categories
To use OpenVPN, the compose file must give `NET_ADMIN` and `/dev/net/tun` to the service (already the case in the repository's `docker-compose.yml`). Details: [VPN in categories](/en/guide/vpn).
:::

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `504 Gateway Timeout` on the panel | the domain points to the wrong port: it must be `…:8000` |
| The proxy does not answer on 990 | port closed at the provider, or domain on an orange Cloudflare cloud |
| "Cannot connect to database" | do not remove the `db` service from the compose file; let Coolify handle the ordered start |
| Data lost after a redeploy | volumes deleted: keep the `uhq-panel-*` names from the compose file |

See also [Docker & Coolify](/en/guide/docker) for ports and volumes in detail.
