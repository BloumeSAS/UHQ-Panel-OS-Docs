---
title: VPS + Docker Compose
description: Install UHQ Panel OS by hand on any VPS with Docker Compose and Caddy (automatic HTTPS).
---

# 🖥️ VPS + Docker Compose (manual)

The most **transparent** method: no intermediate platform, everything fits in 3 commands.

## 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # then sign in again
```

## 2. Get and start the panel

```bash
git clone https://github.com/BloumeSAS/UHQ-Panel-OS.git
cd UHQ-Panel-OS
docker compose up -d --build
docker compose logs -f app      # note the "TOKEN D'INSTALLATION" line (installation token)
```

The panel listens on `http://SERVER_IP:8000` and the proxy on port **990**.

::: tip Prebuilt image
Prefer not to build? Use the official image `bloumesas/uhq-panel-os` (Docker Hub) — see [Installation](/en/guide/installation).
:::

## 3. HTTPS with Caddy (recommended)

Install Caddy (`sudo apt install caddy`) then edit `/etc/caddy/Caddyfile`:

```text
panel.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

```bash
sudo systemctl reload caddy
```

Caddy gets and renews the certificate by itself. **Nginx** alternative: `proxy_pass http://127.0.0.1:8000;` with the `Host`, `X-Forwarded-For` and `X-Forwarded-Proto` headers, plus the `Upgrade`/`Connection` headers for the WebSocket (`/api/panel/ws`).

::: info VPN in categories
To use OpenVPN, the compose file must give `NET_ADMIN` and `/dev/net/tun` to the service (already the case in the repository's `docker-compose.yml`). Details: [VPN in categories](/en/guide/vpn).
:::

## 4. Firewall

```bash
sudo ufw allow 22,80,443,990/tcp
sudo ufw allow 9000:9250/tcp
sudo ufw enable
```

Also remember your provider's firewall (OVH, Hetzner, AWS, Oracle…).

## 5. Update

```bash
cd UHQ-Panel-OS
git pull
docker compose up -d --build
```

Data lives in the `uhq-panel-*` volumes: it survives updates.

## 6. Back up

Use **Settings → Backups** in the panel, or `docker compose exec db pg_dump -U postgres uhq > backup.sql`.
