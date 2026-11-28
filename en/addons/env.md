# Environment variables

Standard variables for any UHQ Panel OS add-on.

---

## Full reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Listening port of the NestJS server |
| `PANEL_URL` | `http://localhost:8000` | URL of the UHQ panel (for API calls) |
| `DB_PATH` | `./data.json` | Path of the data file (JSON) |
| `PANEL_API_KEY` | *(empty)* | Panel API key — needed for backups |
| `NODE_ENV` | `development` | `development` or `production` |
| `ADDON_REFRESH_CRON` | — | *(Panel side)* Manifest refresh interval |

---

## Recommended `.env.example`

```env
# ─── My Add-on — Environment variables ────────────────────────────────────
# Copy to .env and fill in.

# Microservice port
PORT=3001

# URL of the UHQ panel this add-on is connected to
PANEL_URL=http://localhost:8000

# Persistent data file
# Docker/Coolify: /app/data/data.json (mounted volume)
# Local: ./data.json
DB_PATH=./data.json

# Panel API key (Settings → API key)
# Needed for automatic backup calls
PANEL_API_KEY=

# Environment
NODE_ENV=development
```

---

## In production (Docker)

```dockerfile
ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/app/data/data.json
```

The other variables (`PANEL_URL`, `PANEL_API_KEY`) are injected by Coolify / docker-compose.
