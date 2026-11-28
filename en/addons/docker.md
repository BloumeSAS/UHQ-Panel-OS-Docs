# Docker & Coolify

---

## Recommended Dockerfile

```dockerfile
# Build React
FROM node:20-alpine AS web-builder
WORKDIR /build/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Build NestJS
FROM node:20-alpine AS api-builder
WORKDIR /build/api
COPY api/package*.json ./
RUN npm ci
COPY api/ ./
RUN npm run build
RUN npm prune --production

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=api-builder /build/api/dist        ./api/dist
COPY --from=api-builder /build/api/node_modules ./api/node_modules
COPY --from=web-builder /build/web/dist        ./web/dist
COPY uhq-manifest.json ./

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/app/data/data.json

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3001/uhq-manifest.json | grep -q '"name"' || exit 1

CMD ["node", "api/dist/main"]
```

::: tip Only port 3001 is exposed
The Vite port (5173/5174) is only used in development.  
In production, NestJS serves both the API and the built React files.
:::

---

## docker-compose.yml (local)

```yaml
services:
  my-addon:
    build: .
    ports:
      - "3001:3001"
    environment:
      PANEL_URL:     http://host.docker.internal:8000
      PANEL_API_KEY: your-api-key
      DB_PATH:       /app/data/data.json
    volumes:
      - addon_data:/app/data

volumes:
  addon_data:
```

---

## Coolify — deployment

### docker-compose.coolify.yml

```yaml
services:
  my-addon:
    image: "${SERVICE_IMAGE}"
    # or build: .
    environment:
      PORT:          "${PORT:-3001}"
      PANEL_URL:     "${PANEL_URL}"
      PANEL_API_KEY: "${PANEL_API_KEY}"
      DB_PATH:       /app/data/data.json
      NODE_ENV:      production
    volumes:
      - addon_data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.addon.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.addon.entrypoints=https"
      - "traefik.http.routers.addon.tls.certresolver=letsencrypt"
      - "traefik.http.services.addon.loadbalancer.server.port=3001"

volumes:
  addon_data:
```

### Variables to set in Coolify

| Variable | Example | Description |
|---|---|---|
| `PANEL_URL` | `https://panel.example.com` | UHQ panel URL |
| `PANEL_API_KEY` | `abc123...` | API key (Settings → API key) |
| `DOMAIN` | `wallet.example.com` | Add-on domain |

### Persistent volume

In the Coolify interface → **Storages**:

| Type | Source | Destination |
|---|---|---|
| Volume | `addon_data` | `/app/data` |

---

## Persistent data

All your add-on's data must live in `/app/data/`.

```typescript
// store.service.ts — data file path
const DB_PATH = process.env.DB_PATH
  ?? path.resolve(__dirname, '..', '..', '..', 'data.json');
```

```env
# .env.example
DB_PATH=/app/data/data.json  # Docker production
# DB_PATH=./data.json         # local development
```

---

## Healthcheck

The panel checks the add-on's availability through the manifest.  
Your Docker healthcheck must confirm that NestJS answers:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/uhq-manifest.json \
    | grep -q '"name"' || exit 1
```
