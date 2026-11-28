---
title: Install on CapRover
description: UHQ Panel OS on CapRover — possible, but manual (separate PostgreSQL and a TCP port to publish).
---

# 🧢 Install on CapRover

::: warning More manual
CapRover deploys **one app = one container**: it does not read `docker-compose.yml`. You must create the PostgreSQL database separately and publish the TCP port yourself. Prefer [Coolify](/en/guide/hebergeurs/coolify) or [Dokploy](/en/guide/hebergeurs/dokploy) if you have the choice.
:::

## 1. The PostgreSQL database

**Apps → One-Click Apps → PostgreSQL** (version 16): note the name `srv-captain--postgres`, the user and the password.

## 2. The application

1. **Apps → Create New App**: `uhq-panel`, tick *Has Persistent Data*.
2. **Deployment → Method 3: Deploy from Github/Bitbucket/Gitlab**: repository `BloumeSAS/UHQ-Panel-OS`, branch `main` (CapRover uses the `Dockerfile`).
3. **App Configs**:
   - *Container HTTP Port*: `8000`
   - *Persistent Directories*: `/app/data`, `/app/logs`
   - *Environment Variables*: `DATABASE_URL=postgresql://USER:PASSWORD@srv-captain--postgres:5432/uhq`
4. **HTTP Settings**: domain + *Enable HTTPS* + *Websocket Support*.

## 3. Publish proxy port 990

CapRover does not expose arbitrary TCP ports through its interface. In **App Configs → Port Mapping**, add `990` (server) → `990` (container), and open the port at your provider. Dedicated ports 9000-9250 are mapped the same way, one by one.

## 4. First steps

Application logs → `TOKEN D'INSTALLATION` (installation token) → `https://panel.example.com/setup`.

## 5. Update

Enable the **Webhook** (Deployment → *Enable App Token* / *Webhook*) and paste it in *Settings → General → Automatic update*.
