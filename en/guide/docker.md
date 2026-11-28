# Docker & Coolify

## docker-compose.yml

The `docker-compose.yml` file at the repository root is **all-in-one**: it works the same locally and on Coolify without any change.

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: uhq
      POSTGRES_PASSWORD: uhqpanel_internal
      POSTGRES_DB: uhqpanel
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uhq -d uhqpanel"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "990:990/tcp"              # TCP proxy — bound on the host
      - "9000-9999:9000-9999/tcp"  # Dedicated ports (pools / sub-users)
    expose:
      - "8000"             # HTTP — handled by Traefik over the internal network
    labels:
      - "traefik.http.services.uhq-panel-app.loadbalancer.server.port=8000"
    ulimits:
      nofile:
        soft: 1048576
        hard: 1048576
    environment:
      DATABASE_URL: postgresql://uhq:uhqpanel_internal@db:5432/uhqpanel
      DATA_DIR: /app/data
      TZ: Europe/Paris
      PROXY_PORT: "990"
      API_PORT: "8000"
      PROXY_PORT_RANGE: "9000-9999"
    volumes:
      - appdata:/app/data
      - logsdata:/app/logs

volumes:
  pgdata:
    name: uhq-panel-pgdata
  appdata:
    name: uhq-panel-appdata
  logsdata:
    name: uhq-panel-logsdata
```

---

## Port architecture

| Port | Protocol | Use | Exposure |
|---|---|---|---|
| `8000` | HTTP | Web panel + REST API | Through Traefik (internal Docker network), no host binding |
| `990` | TCP | Proxy engine (shared port, default) | Bound directly on the host (`ports:`) |
| `9000-9999` | TCP | Dedicated ports (pools / sub-users) | Range pre-published on the host (`ports:`) |

::: info Why separate the ports?
Port `990` is a raw TCP proxy (HTTP CONNECT) — Traefik cannot route it. It must be reachable directly. Port `8000` is normal HTTP that Traefik intercepts and adds HTTPS + domain to.
:::

---

## Dedicated ports

Since v2.0.14, a [pool or sub-user](/en/guide/proxy-pools) can get a dedicated TCP port in addition to the shared port `990`.

Docker can only publish ports declared when the **container starts** — new ones cannot be opened on the fly without editing `docker-compose.yml` and redeploying. The chosen strategy: **pre-publish a range once** (`9000-9999` above), then assign ports inside that range dynamically from the panel, without redeploying.

- The API refuses any port outside `9000-9999` (`PROXY_PORT_RANGE`).
- To use a different range: widen it in `docker-compose.yml` (`ports:`) **and** in `PROXY_PORT_RANGE`, then redeploy. Both must stay consistent.
- A port assigned inside the published range is active **live** (no API restart) as soon as it is saved in the panel.

::: tip Dedicated domain (DNS only)
Since v2.0.15, a pool or sub-user can also get a **domain** shown in its connection lines, on top of the port — see [Proxy pools](/en/guide/proxy-pools). Unlike the port, it needs **no Docker configuration**: the chosen domain just has to point (DNS) to the same IP as `publicProxyHost` — same logic as the [DNS and Cloudflare](#dns-and-cloudflare) section below.
:::

---

## Persistent volumes

Volumes are named with an explicit `name:`. Coolify and Docker Compose cannot prefix them — data survives every redeploy.

| Volume | Path in the container | Content |
|---|---|---|
| `uhq-panel-pgdata` | `/var/lib/postgresql/data` | PostgreSQL database |
| `uhq-panel-appdata` | `/app/data` | JWT secret, runtime config, local backups |
| `uhq-panel-logsdata` | `/app/logs` | Daily log files (`combined-*.log`, `error-*.log`, since v2.4.19) |

---

## DNS and Cloudflare

UHQ Panel OS uses two separate network channels that need two different DNS entries.

### The problem with Cloudflare (orange cloud)

Cloudflare only proxies HTTP/HTTPS ports (80, 443, 8080, 2053, 2083…). Port `990` (TCP proxy) is **not** in that list — customers' proxy connections will silently fail if the domain is behind Cloudflare.

### Recommended solution

Create **two DNS records** for your domain:

| Record | Target | Cloudflare proxy |
|---|---|---|
| `panel.example.com` | VPS IP | ✅ On (orange cloud) |
| `prx.example.com` | VPS IP | ❌ Off (grey cloud — DNS only) |

1. In Cloudflare DNS → add an `A` record → `prx.example.com` → VPS IP → **grey cloud**.
2. In the UHQ panel → **Settings → Proxy → publicProxyHost** → `prx.example.com`.

Proxy customers will connect to `prx.example.com:990` directly on your VPS.

::: tip Cloudflare Spectrum
If you really want to keep Cloudflare in front of the proxy port (DDoS protection), Cloudflare's Pro+ plans offer **Spectrum** to proxy arbitrary TCP. It is a paid option (~$20/month minimum).
:::

---

## Deploying on Coolify — detailed steps

### 1. New service

Coolify → **New Resource** → **Docker Compose** → choose:
- **GitHub repository** (point to this repository, `main` branch) — Coolify rebuilds automatically on each push
- or **Raw compose** (paste the file content)

### 2. FQDN

In the **Domains** tab, enter `https://panel.example.com`. Coolify configures Traefik + Let's Encrypt automatically.

### 3. Environment variables

None required. Optionally, in **Environment Variables**:

```
TZ=Europe/Paris
```

### 4. Deploy

Click **Deploy**. Coolify runs `docker compose build && docker compose up -d`.

The panel is reachable on the configured domain after ~2-3 minutes (image build).

### 5. Check

```bash
# From the VPS or your local machine:
curl https://panel.example.com/health
# → {"status":"ok","version":"x.y.z"}

# Test the proxy port from the VPS:
echo "" | nc -w2 <VPS_IP> 990 && echo "PORT OPEN"
```

---

## Multi-stage Dockerfile

The `Dockerfile` builds the image in 3 stages:

| Stage | Name | Content |
|---|---|---|
| 1 | `web-builder` | React panel build (Vite) |
| 2 | `builder` | NestJS API build + Prisma client generation |
| 3 | `runner` | Minimal Alpine image with the compiled artifacts |

The final image (`runner`) only exposes port `8000`. Port `990` is listened on by Node.js but not `EXPOSE`d in the Dockerfile, so that Traefik does not auto-detect it.

---

## Useful commands

```bash
# Follow logs live
docker compose logs -f app

# Open a shell in the container
docker exec -it <container_name> sh

# Check open ports inside the container
docker exec <container_name> ss -tlnp

# Force a rebuild without cache
docker compose build --no-cache && docker compose up -d

# Stop without deleting volumes
docker compose down

# Delete EVERYTHING (data included) ⚠️
docker compose down -v
```

---

## Troubleshooting

### Quick diagnostics without SSH (since v2.4.29)

`GET /api/panel/health/detailed` (admin JWT) returns open file descriptors, active Postgres connections and the 15 largest tables — what previously had to be checked by hand over SSH/psql (see below). Handy for external monitoring or a first look before connecting to the VPS.

### `EMFILE: too many open files` (500 on any page)

Two distinct causes met in production, fixed separately:

- **v2.4.23** — `PrismaService` leaked TCP sockets on each DB reconnection (it ran `$connect()` again without ever calling `$disconnect()` on the old client). A series of close DB cuts slowly exhausted descriptors.
- **v2.4.24** — even without that leak, a **burst of legitimate connections** (a single sub-account firing hundreds of requests per second — e.g. a combo-checking tool — each racing up to 5 upstreams in parallel) can on its own exhaust a 200,000-descriptor ceiling in seconds. The `ulimits.nofile` of `docker-compose.yml` was raised to `1048576` to absorb such peaks.

**Diagnosis** — check the descriptor limit actually applied in the container (find the real container name in Coolify: the application's **Logs** tab, not the label shown in the URL):

```bash
docker exec <container_name> sh -c 'ulimit -n'
# Compare with the number of descriptors actually opened by the process (PID 1 in the container):
docker exec <container_name> sh -c 'ls /proc/1/fd | wc -l'
```

If `ulimit -n` returns a low value despite the updated `docker-compose.yml`, the **host's Docker daemon** caps it lower — not Coolify itself. On the VPS:

```bash
# Max limit the Docker daemon can grant a container
systemctl show docker --property=LimitNOFILE
```

If it is low, create/edit an override and restart Docker (⚠️ this restarts **every** container on the VPS, not just this one):

```bash
mkdir -p /etc/systemd/system/docker.service.d
cat > /etc/systemd/system/docker.service.d/override.conf <<'EOF'
[Service]
LimitNOFILE=1048576
EOF
systemctl daemon-reload
systemctl restart docker
```

Then redeploy the application from Coolify (**Deploy** button) so the new container inherits both the updated `ulimits.nofile` of `docker-compose.yml` **and** the raised daemon limit — both must be consistent, the lower one always wins.

::: tip If `EMFILE` comes back despite an up-to-date version and a high ulimit
It means legitimate usage beyond what the server can absorb (mass checker on a sub-account, etc.), not a leak. Consider tightening `threadsLimit` for that account (Sub-users → Edit), or blocking it temporarily.
:::
