# Installation

## 🎬 Vidéo

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/bF2yE-W-93s" title="Installer UHQ Panel OS de A à Z" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Vidéo : installation, test et aperçu — [la regarder sur YouTube](https://youtu.be/bF2yE-W-93s).

## Prérequis

| Outil | Version minimale | Remarque |
|---|---|---|
| Docker | 24+ | Avec Docker Compose v2 |
| PostgreSQL | 14+ | Inclus dans le `docker-compose.yml` fourni |
| Domaine | — | Recommandé pour la production |

::: tip Zéro configuration requise
Le `docker-compose.yml` inclut PostgreSQL embarqué, génère le JWT secret automatiquement au premier démarrage et lance un wizard de setup à l'accès sur `/`.
:::

---

## Option 1 — Docker Compose (recommandé)

### Local ou VPS nu

```bash
git clone https://github.com/BloumeSAS/UHQ-Panel-OS
cd UHQ-Panel-OS
docker compose up -d --build
```

- Panel accessible sur **http://localhost:8000**
- Proxy TCP sur **localhost:990**
- Un wizard de configuration s'affiche au premier accès

### Mise à jour

```bash
git pull
docker compose up -d --build
```

Les données sont persistantes dans les volumes nommés `uhq-panel-pgdata` et `uhq-panel-appdata`.

---

## Option 2 — Coolify

### 1. Créer un service Docker Compose

Dans Coolify → **New Resource** → **Docker Compose** → coller le contenu de `docker-compose.yml` ou pointer sur le dépôt GitHub.

### 2. Configurer le domaine

Dans Coolify, renseigner le **FQDN** (ex. `https://panel.mondomaine.fr`). Traefik route automatiquement le trafic HTTPS vers le port `8000` grâce au label inclus dans le compose.

### 3. Ports

| Port | Usage | Configuration |
|---|---|---|
| `8000` | Panel web + API | Géré par Traefik (pas de binding hôte) |
| `990` | Proxy TCP | Bindé sur l'hôte via `ports:` |

::: warning Proxy TCP et Cloudflare
Si le domaine est derrière Cloudflare (nuage orange), le port `990` sera bloqué. Créez un sous-domaine dédié au proxy avec le **nuage gris (DNS only)**. Voir [Docker & Coolify → DNS](/guide/docker#dns-et-cloudflare).
:::

### 4. Variables d'environnement

Aucune variable n'est obligatoire — tout est auto-configuré. Variables optionnelles :

| Variable | Défaut | Description |
|---|---|---|
| `PROXY_PORT` | `990` | Port d'écoute du proxy TCP |
| `API_PORT` | `8000` | Port d'écoute de l'API |
| `TZ` | `Europe/Paris` | Fuseau horaire |
| `DATA_DIR` | `/app/data` | Répertoire de données persistantes |

### 5. Données persistantes

Les volumes sont nommés explicitement — ils survivent aux redéploiements sans configuration :

| Volume | Contenu |
|---|---|
| `uhq-panel-pgdata` | Base de données PostgreSQL |
| `uhq-panel-appdata` | Config runtime, backups locaux, JWT secret |

---

## Option 2 bis — Image Docker prête à l'emploi (Docker Hub)

L'image officielle est publiée à chaque version, pour `linux/amd64` et `linux/arm64` :

| Registre | Image |
|---|---|
| Docker Hub | [`bloumesas/uhq-panel-os`](https://hub.docker.com/r/bloumesas/uhq-panel-os) |
| GitHub Container Registry | `ghcr.io/bloumesas/uhq-panel-os` |

Tags : `latest` (dernière version), `X.Y.Z` / `X.Y` (version précise), `main` (dernier commit).

::: tip Aucun fichier .env à écrire
Il suffit d'une **base PostgreSQL**. Le reste est automatique : secret JWT généré au premier démarrage, schéma de la base appliqué tout seul, jeton d'installation affiché dans les journaux. Le compte administrateur et l'hôte public du proxy se règlent ensuite dans l'assistant `/setup`.
:::

### Avec PostgreSQL inclus (le plus simple)

Créez un fichier `docker-compose.yml` (changez `change-me` aux **deux** endroits) :

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
      - "8000:8000"            # panel + API (à mettre derrière HTTPS)
      - "990:990"              # moteur proxy TCP
      - "9000-9250:9000-9250"  # ports dédiés (catégories / comptes)
    cap_add: [NET_ADMIN]       # uniquement pour les sorties OpenVPN
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
docker compose logs app | grep TOKEN   # jeton d'installation
```

Ouvrez `http://<serveur>:8000`, collez le jeton, suivez l'assistant.

### Avec une base PostgreSQL existante

Lancez l'image **sans** `DATABASE_URL` : le panel démarre quand même et l'assistant affiche l'écran **Base de données** (`/setup/database`) pour saisir l'URL `postgresql://utilisateur:motdepasse@hôte:5432/base`. Elle est enregistrée dans `/app/data`.

### À ne pas oublier

- Les **deux volumes** (`pgdata` pour la base, `appdata` pour `/app/data` : secret JWT, URL de la base, données des addons). Sans eux, tout est perdu à la mise à jour de l'image.
- Mettre le panel derrière **HTTPS** (Traefik, Caddy, Nginx…) et garder la base privée.
- Pas d'hôte avec `/dev/net/tun` (OpenVZ / LXC) : supprimez `cap_add` et `devices`, seul OpenVPN sera indisponible.

### Mise à jour

```bash
docker compose pull
docker compose up -d
```

---

## Option 3 — Développement local (sans Docker)

**Prérequis supplémentaires :** Node.js 20+ et une instance PostgreSQL.

```bash
# Backend (api/)
cd api
npm install
# Créer api/.env avec DATABASE_URL=postgresql://...
npm run start:dev        # NestJS écoute sur :8000

# Frontend (web/) — terminal séparé
cd web
npm install
npm run dev              # Vite :5173 (proxy → :8000)
```

---

## Premier démarrage

Au premier accès sur `/`, l'assistant s'affiche :

**Étape 1 — Base de données**
Avec le `docker-compose.yml` fourni, la base PostgreSQL embarquée est détectée automatiquement : cliquez sur **Continuer avec la base intégrée**. Pour une base externe, saisissez l'URL PostgreSQL (`postgresql://utilisateur:motdepasse@hôte:5432/base`) ; la base est créée si besoin et le schéma appliqué.

**Étape 2 — Nouvelle installation ou restauration**
L'écran `/setup` propose deux onglets :
- **Nouvelle installation** : nom du site, hôte et port publics du proxy, puis le compte administrateur (e-mail + mot de passe).
- **Restaurer une sauvegarde** : envoyez un `backup-db-….json` du panel ou un `.tar.gz` du dossier de données PostgreSQL 16. Voir [Sauvegardes et restauration](/guide/sauvegardes).

Cet écran est protégé par un **jeton d'installation généré automatiquement** : relevez la ligne `TOKEN D'INSTALLATION` dans les logs du conteneur et saisissez-la dans le champ prévu (voir [Mise en service](/guide/mise-en-service#proteger-l-installation-jeton-automatique)). Un panel déjà installé n'est pas concerné.

Une fois l'installation terminée, le panel lance sa [visite guidée](/guide/visite-guidee), et le tableau de bord affiche la checklist « Premiers pas ».

---

## FAQ — Où trouver le jeton d'installation ?

Le jeton **n'est pas écrit dans un fichier `.env`** : il est **généré automatiquement** au premier démarrage tant que l'installation n'est pas terminée, puis **supprimé** une fois le panel installé. Pour le lire :

| Où | Comment |
|---|---|
| **Coolify** | votre application → onglet **Logs** → ligne `TOKEN D'INSTALLATION` |
| **Docker Compose** | `docker compose logs app \| grep -A1 "TOKEN"` |
| **Docker seul** | `docker logs <conteneur> \| grep -A1 "TOKEN"` |

Vous préférez le choisir vous-même ? Définissez `SETUP_TOKEN=votre-valeur` (variable d'environnement). `SETUP_TOKEN=off` désactive la protection (déconseillé sur Internet). Le jeton est régénéré à chaque redémarrage tant que l'installation n'est pas faite : copiez toujours la **dernière** ligne des logs.

---

## Et ensuite ?

À la fin de l'installation, le panel lance une [visite guidée](/guide/visite-guidee) qui présente chaque page et chaque réglage. Vous pouvez la relancer à tout moment avec l'icône **?** en haut à droite.
