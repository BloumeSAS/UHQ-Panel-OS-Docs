# Installation

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/bF2yE-W-93s" title="Install UHQ Panel OS from A to Z" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/bF2yE-W-93s) (in French).

## Requirements

| Tool | Minimum version | Note |
|---|---|---|
| Docker | 24+ | With Docker Compose v2 |
| PostgreSQL | 14+ | Included in the provided `docker-compose.yml` |
| Domain | — | Recommended for production |

::: tip Zero configuration required
The `docker-compose.yml` includes a bundled PostgreSQL, generates the JWT secret automatically on first start and launches a setup wizard when you open `/`.
:::

---

## Option 1 — Docker Compose (recommended)

### Local or bare VPS

```bash
git clone https://github.com/BloumeSAS/UHQ-Panel-OS
cd UHQ-Panel-OS
docker compose up -d --build
```

- Panel available at **http://localhost:8000**
- TCP proxy on **localhost:990**
- A setup wizard shows up on first access

### Update

```bash
git pull
docker compose up -d --build
```

Data persists in the named volumes `uhq-panel-pgdata` and `uhq-panel-appdata`.

---

## Option 2 — Coolify

### 1. Create a Docker Compose service

In Coolify → **New Resource** → **Docker Compose** → paste the `docker-compose.yml` content or point to the GitHub repository. Step by step: [Install on Coolify](/en/guide/hebergeurs/coolify).

### 2. Configure the domain

In Coolify, enter the **FQDN** (e.g. `https://panel.example.com`). Traefik routes HTTPS traffic to port `8000` automatically thanks to the label included in the compose file.

### 3. Ports

| Port | Use | Configuration |
|---|---|---|
| `8000` | Web panel + API | Handled by Traefik (no host binding) |
| `990` | TCP proxy | Bound on the host via `ports:` |

::: warning TCP proxy and Cloudflare
If the domain is behind Cloudflare (orange cloud), port `990` will be blocked. Create a subdomain dedicated to the proxy with the **grey cloud (DNS only)**. See [Docker & Coolify → DNS](/en/guide/docker#dns-and-cloudflare).
:::

### 4. Environment variables

No variable is required — everything is auto-configured. Optional variables:

| Variable | Default | Description |
|---|---|---|
| `PROXY_PORT` | `990` | TCP proxy listening port |
| `API_PORT` | `8000` | API listening port |
| `TZ` | `Europe/Paris` | Time zone |
| `DATA_DIR` | `/app/data` | Persistent data directory |

### 5. Persistent data

Volumes are named explicitly — they survive redeploys without configuration:

| Volume | Content |
|---|---|
| `uhq-panel-pgdata` | PostgreSQL database |
| `uhq-panel-appdata` | Runtime config, local backups, JWT secret |

---

## Option 2b — Ready-to-use Docker image (Docker Hub)

The official image is published on every release, for `linux/amd64` and `linux/arm64`:

| Registry | Image |
|---|---|
| Docker Hub | [`bloumesas/uhq-panel-os`](https://hub.docker.com/r/bloumesas/uhq-panel-os) |
| GitHub Container Registry | `ghcr.io/bloumesas/uhq-panel-os` |

Tags: `latest` (latest version), `X.Y.Z` / `X.Y` (specific version), `main` (latest commit).

::: tip No .env file to write
All you need is a **PostgreSQL database**. The rest is automatic: JWT secret generated on first start, database schema applied by itself, installation token printed in the logs. The administrator account and the proxy's public host are then set in the `/setup` wizard.
:::

### With PostgreSQL included (simplest)

Create a `docker-compose.yml` file (change `change-me` in **both** places):

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: uhq
      POSTGRES_PASSWORD: change-me
      POSTGRES_DB: uhqpanel
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uhq -d uhqpanel"]
      interval: 10s
      retries: 5

  app:
    image: bloumesas/uhq-panel-os:latest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"            # panel + API (put it behind HTTPS)
      - "990:990"              # TCP proxy engine
      - "9000-9250:9000-9250"  # dedicated ports (categories / accounts)
    cap_add: [NET_ADMIN]       # only for OpenVPN exits
    devices: ["/dev/net/tun:/dev/net/tun"]
    environment:
      DATABASE_URL: postgresql://uhq:change-me@db:5432/uhqpanel
      DATA_DIR: /app/data
    volumes:
      - appdata:/app/data

volumes:
  pgdata:
  appdata:
```

```bash
docker compose up -d
docker compose logs app | grep TOKEN   # installation token
```

Open `http://<server>:8000`, paste the token, follow the wizard.

### With an existing PostgreSQL database

Run the image **without** `DATABASE_URL`: the panel still starts and the wizard shows the **Database** screen (`/setup/database`) to enter the URL `postgresql://user:password@host:5432/db`. It is saved in `/app/data`.

### Don't forget

- **Both volumes** (`pgdata` for the database, `appdata` for `/app/data`: JWT secret, database URL, add-on data). Without them, everything is lost when the image is updated.
- Put the panel behind **HTTPS** (Traefik, Caddy, Nginx…) and keep the database private.
- Host without `/dev/net/tun` (OpenVZ / LXC): remove `cap_add` and `devices`, only OpenVPN will be unavailable.

### Update

```bash
docker compose pull
docker compose up -d
```

---

## Option 3 — Local development (without Docker)

**Extra requirements:** Node.js 20+ and a PostgreSQL instance.

```bash
# Backend (api/)
cd api
npm install
# Create api/.env with DATABASE_URL=postgresql://...
npm run start:dev        # NestJS listens on :8000

# Frontend (web/) — separate terminal
cd web
npm install
npm run dev              # Vite :5173 (proxy → :8000)
```

---

## First start

On the first visit to `/`, the wizard shows up:

**Step 1 — Database**
With the provided `docker-compose.yml`, the bundled PostgreSQL database is detected automatically: click **Continue with the built-in database**. For an external database, enter the PostgreSQL URL (`postgresql://user:password@host:5432/db`); the database is created if needed and the schema applied.

**Step 2 — New install or restore**
The `/setup` screen offers two tabs:
- **New installation**: site name, public proxy host and port, then the administrator account (e-mail + password).
- **Restore a backup**: upload a panel `backup-db-….json` or a `.tar.gz` of the PostgreSQL 16 data folder. See [Backups and restore](/en/guide/sauvegardes).

This screen is protected by an **automatically generated installation token**: read the `TOKEN D'INSTALLATION` line in the container logs and enter it in the field provided (see [Going live](/en/guide/mise-en-service#protect-the-installation-automatic-token)). An already installed panel is not affected.

Once installation is finished, the panel starts its [guided tour](/en/guide/visite-guidee), and the dashboard shows the "First steps" checklist.

---

## FAQ — Where is the installation token?

The token **is not written in a `.env` file**: it is **generated automatically** on first start as long as installation is not finished, then **deleted** once the panel is installed. To read it:

| Where | How |
|---|---|
| **Coolify** | your application → **Logs** tab → `TOKEN D'INSTALLATION` line |
| **Docker Compose** | `docker compose logs app \| grep -A1 "TOKEN"` |
| **Plain Docker** | `docker logs <container> \| grep -A1 "TOKEN"` |

Prefer to choose it yourself? Set `SETUP_TOKEN=your-value` (environment variable). `SETUP_TOKEN=off` disables the protection (not recommended on the Internet). Always copy the **latest** token line from the logs.

---

## What next?

At the end of the installation, the panel starts a [guided tour](/en/guide/visite-guidee) that presents every page and setting. You can restart it at any time with the **?** icon at the top right.
