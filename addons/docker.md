# Docker & Coolify

---

## Dockerfile recommandé

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

::: tip Seul le port 3001 est exposé
Le port Vite (5173/5174) n'est utilisé qu'en développement.  
En production, NestJS sert à la fois l'API et les fichiers React compilés.
:::

---

## docker-compose.yml (local)

```yaml
services:
  mon-addon:
    build: .
    ports:
      - "3001:3001"
    environment:
      PANEL_URL:     http://host.docker.internal:8000
      PANEL_API_KEY: votre-cle-api
      DB_PATH:       /app/data/data.json
    volumes:
      - addon_data:/app/data

volumes:
  addon_data:
```

---

## Coolify — déploiement

### docker-compose.coolify.yml

```yaml
services:
  mon-addon:
    image: "${SERVICE_IMAGE}"
    # ou build: .
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

### Variables à configurer dans Coolify

| Variable | Exemple | Description |
|---|---|---|
| `PANEL_URL` | `https://panel.domaine.com` | URL du panel UHQ |
| `PANEL_API_KEY` | `abc123...` | Clé API (Paramètres → Clé API) |
| `DOMAIN` | `wallet.domaine.com` | Domaine de l'addon |

### Volume persistant

Dans l'interface Coolify → **Storages** :

| Type | Source | Destination |
|---|---|---|
| Volume | `addon_data` | `/app/data` |

---

## Données persistantes

Toutes les données de votre addon doivent être dans `/app/data/`.

```typescript
// store.service.ts — chemin du fichier de données
const DB_PATH = process.env.DB_PATH
  ?? path.resolve(__dirname, '..', '..', '..', 'data.json');
```

```env
# .env.example
DB_PATH=/app/data/data.json  # production Docker
# DB_PATH=./data.json         # développement local
```

---

## Healthcheck

Le panel vérifie la disponibilité de l'addon via le manifest.  
Votre healthcheck Docker doit valider que NestJS répond :

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/uhq-manifest.json \
    | grep -q '"name"' || exit 1
```
