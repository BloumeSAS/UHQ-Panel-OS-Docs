# Installation

## Prérequis

- **Docker** 24+ et Docker Compose
- **PostgreSQL** 14+ (externe — Coolify en fournit un)
- Un domaine avec SSL (recommandé pour la production)

---

## Démarrage rapide (local)

```bash
git clone https://github.com/BloumeSAS/UHQ-Panel-OS
cd UHQ-Panel-OS

cp api/.env.example api/.env
# Éditer api/.env — renseigner DATABASE_URL et JWT_SECRET

docker compose up -d
```

Panel accessible sur **http://localhost:8000**.  
Proxy TCP sur **localhost:990**.

---

## Déploiement Coolify

### 1. Créer un nouveau service

Dans Coolify → **New Resource** → **Docker Compose**.

Coller le contenu de `docker-compose.coolify.yml`.

### 2. Variables d'environnement obligatoires

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Chaîne aléatoire longue (min. 32 chars) |
| `PROXY_HOST` | `0.0.0.0` |
| `PROXY_PORT` | `990` |

### 3. Volumes persistants

| Source | Destination | Description |
|---|---|---|
| `panel_data` | `/app/data` | Config runtime, backups locaux |
| `panel_logs` | `/app/logs` | Logs applicatifs |

### 4. Ports

N'exposer que **8000** dans Coolify — Traefik route le trafic HTTPS vers ce port.  
Le port 990 (proxy TCP) doit être exposé directement si utilisé publiquement.

::: warning Important
Ne pas exposer le port 990 dans les labels Traefik — il s'agit d'un proxy TCP brut, pas HTTP.
:::

---

## Premier lancement

Au premier accès sur `/`, le panel détecte l'absence de base configurée et affiche l'**assistant de configuration** :

1. **Base de données** — entrer l'URL PostgreSQL
2. **Compte admin** — créer le premier utilisateur
3. **Configuration** — nom du site, domaine proxy, etc.

---

## Développement local (monorepo)

```bash
# Backend (api/)
cd api
cp .env.example .env
npm install
npm run start:dev        # NestJS :8000

# Frontend (web/) — terminal séparé
cd web
npm install
npm run dev              # Vite :5173 (proxy → :8000)
```
