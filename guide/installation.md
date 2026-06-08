# Installation

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

Au premier accès sur `/`, le wizard de configuration s'affiche :

**Étape 1 — Base de données**
Si vous utilisez le `docker-compose.yml` fourni, la base PostgreSQL embarquée est détectée automatiquement — cliquer simplement sur **Continuer avec la base intégrée**. Pour une base externe, saisir l'URL PostgreSQL.

**Étape 2 — Compte administrateur**
Définir le mot de passe du compte `admin`.

**Étape 3 — Paramètres publics**
Configurer `publicProxyHost` (domaine ou IP du serveur proxy) et `publicProxyPort` (port affiché aux clients).

Après le wizard, le panel est pleinement opérationnel.
