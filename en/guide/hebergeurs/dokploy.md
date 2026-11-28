---
title: Install on Dokploy
description: Deploy UHQ Panel OS on Dokploy with Docker Compose — automatic HTTPS and TCP proxy port.
---

# 🚢 Install on Dokploy

**Dokploy** works like Coolify: it reads the repository's `docker-compose.yml` directly and handles HTTPS with Traefik.

## 1. Requirements

- a Linux VPS with Dokploy installed (`curl -sSL https://dokploy.com/install.sh | sh`);
- a domain (`A` → server IP);
- ports **80, 443, 990** and **9000-9250** open.

## 2. Create the service

1. **Projects → Create Project → Create Service → Compose**.
2. **Provider: Git** (or GitHub) — repository `https://github.com/BloumeSAS/UHQ-Panel-OS`, branch `main`.
3. **Compose Type: Docker Compose**, **Compose Path**: `./docker-compose.yml`.
4. Save.

## 3. Domain

**Domains → Add Domain** tab:

| Field | Value |
|---|---|
| Service Name | `app` |
| Host | `panel.example.com` |
| Container Port | `8000` |
| HTTPS | enabled (Let's Encrypt) |

Port **990** is published directly by the compose file: do not create any domain for it.

## 4. Deploy

Click **Deploy**. Note the `TOKEN D'INSTALLATION` (installation token) in the **Logs** tab, then open `https://panel.example.com/setup`.

## 5. Automatic updates

**Deployments** tab → copy the **Webhook** URL. In the panel: **Settings → General → Automatic update** → paste the URL (**POST** method, no token).

::: warning Cloudflare
Proxy domain set to **DNS only (grey cloud)**. See [Choose a host](/en/guide/hebergeurs/).
:::
