# Variables d'environnement

Variables standard pour tout addon UHQ Panel OS.

---

## Référence complète

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port d'écoute du serveur NestJS |
| `PANEL_URL` | `http://localhost:8000` | URL du panel UHQ (pour les appels API) |
| `DB_PATH` | `./data.json` | Chemin du fichier de données (JSON) |
| `PANEL_API_KEY` | *(vide)* | Clé API du panel — nécessaire pour le backup |
| `NODE_ENV` | `development` | `development` ou `production` |
| `ADDON_REFRESH_CRON` | — | *(Côté panel)* Intervalle de refresh des manifests |

---

## `.env.example` recommandé

```env
# ─── Mon Addon — Variables d'environnement ────────────────────────────────
# Copier en .env et renseigner.

# Port du microservice
PORT=3001

# URL du panel UHQ auquel cet addon est connecté
PANEL_URL=http://localhost:8000

# Fichier de données persistantes
# Docker/Coolify : /app/data/data.json (volume monté)
# Local : ./data.json
DB_PATH=./data.json

# Clé API du panel (Paramètres → Clé API)
# Nécessaire pour les appels de backup automatique
PANEL_API_KEY=

# Environnement
NODE_ENV=development
```

---

## En production (Docker)

```dockerfile
ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/app/data/data.json
```

Les autres variables (`PANEL_URL`, `PANEL_API_KEY`) sont injectées par Coolify / docker-compose.
