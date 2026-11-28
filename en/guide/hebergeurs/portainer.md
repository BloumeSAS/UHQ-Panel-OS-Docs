---
title: Install with Portainer
description: Deploy UHQ Panel OS as a Portainer "Stack" from the Git repository.
---

# 🐳 Install with Portainer

Portainer manages your containers but **not HTTPS**: add Caddy, Nginx Proxy Manager or Traefik in front of port 8000.

## 1. Create the stack

1. **Stacks → Add stack**.
2. **Build method: Repository**.
3. Repository URL: `https://github.com/BloumeSAS/UHQ-Panel-OS` — Reference: `refs/heads/main` — Compose path: `docker-compose.yml`.
4. Enable **Enable relative path volumes** if offered, then **Deploy the stack**.

## 2. HTTPS

With **Nginx Proxy Manager**: *Proxy Host* → domain `panel.example.com` → Forward `http://SERVER_IP:8000` → SSL tab "Request a new certificate" + **Websockets Support** enabled.

## 3. Installation token

Portainer → **Containers → app → Logs**: look for `TOKEN D'INSTALLATION` (installation token), then open `/setup`.

## 4. Update

Open the stack → **Pull and redeploy** (tick *Re-pull image and redeploy*). To automate it from the panel, enable the stack **Webhook** and paste it in *Settings → General → Automatic update*.

See also [VPS + Docker Compose](/en/guide/hebergeurs/vps) for the firewall.
