# Docker & Coolify

## docker-compose.yml

Le fichier `docker-compose.yml` à la racine du dépôt est **tout-en-un** : il fonctionne identiquement en local et sur Coolify sans rien modifier.

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
      - "990:990/tcp"      # Proxy TCP — bindé sur l'hôte
    expose:
      - "8000"             # HTTP — géré par Traefik via le réseau interne
    labels:
      - "traefik.http.services.uhq-panel-app.loadbalancer.server.port=8000"
    ulimits:
      nofile:
        soft: 200000
        hard: 200000
    environment:
      DATABASE_URL: postgresql://uhq:uhqpanel_internal@db:5432/uhqpanel
      DATA_DIR: /app/data
      TZ: Europe/Paris
      PROXY_PORT: "990"
      API_PORT: "8000"
    volumes:
      - appdata:/app/data

volumes:
  pgdata:
    name: uhq-panel-pgdata
  appdata:
    name: uhq-panel-appdata
```

---

## Architecture des ports

| Port | Protocole | Usage | Exposition |
|---|---|---|---|
| `8000` | HTTP | Panel web + API REST | Via Traefik (réseau Docker interne), pas de binding hôte |
| `990` | TCP | Moteur proxy | Bindé directement sur l'hôte (`ports:`) |

::: info Pourquoi séparer les ports ?
Le port `990` est un proxy TCP brut (HTTP CONNECT) — Traefik ne sait pas le router. Il doit être accessible directement. Le port `8000` est du HTTP normal que Traefik intercepte et auquel il ajoute HTTPS + domaine.
:::

---

## Volumes persistants

Les volumes sont nommés avec `name:` explicite. Coolify et Docker Compose ne peuvent pas les préfixer — les données survivent à chaque redéploiement.

| Volume | Chemin dans le conteneur | Contenu |
|---|---|---|
| `uhq-panel-pgdata` | `/var/lib/postgresql/data` | Base PostgreSQL |
| `uhq-panel-appdata` | `/app/data` | JWT secret, config runtime, backups locaux |

---

## DNS et Cloudflare

UHQ Panel OS utilise deux canaux réseau distincts qui nécessitent deux entrées DNS différentes.

### Problème avec Cloudflare (nuage orange)

Cloudflare proxifie uniquement les ports HTTP/HTTPS (80, 443, 8080, 2053, 2083…). Le port `990` (proxy TCP) n'est **pas** dans cette liste — les connexions proxy des clients échoueront silencieusement si le domaine est derrière Cloudflare.

### Solution recommandée

Créez **deux enregistrements DNS** pour votre domaine :

| Enregistrement | Destination | Proxy Cloudflare |
|---|---|---|
| `panel.mondomaine.fr` | IP du VPS | ✅ Activé (nuage orange) |
| `prx.mondomaine.fr` | IP du VPS | ❌ Désactivé (nuage gris — DNS only) |

1. Dans Cloudflare DNS → Ajouter un enregistrement `A` → `prx.mondomaine.fr` → IP du VPS → **nuage gris**.
2. Dans le panel UHQ → **Settings → Proxy → publicProxyHost** → `prx.mondomaine.fr`.

Les clients proxy se connecteront à `prx.mondomaine.fr:990` directement sur votre VPS.

::: tip Cloudflare Spectrum
Si vous souhaitez absolument garder Cloudflare devant le port proxy (protection DDoS), le plan Pro+ de Cloudflare propose **Spectrum** pour proxifier du TCP arbitraire. C'est une option payante (~$20/mois minimum).
:::

---

## Déploiement sur Coolify — Étapes détaillées

### 1. Nouveau service

Coolify → **New Resource** → **Docker Compose** → choisir :
- **GitHub repository** (pointer sur ce dépôt, branche `main`) — Coolify rebuild automatiquement à chaque push
- ou **Raw compose** (coller le contenu du fichier)

### 2. FQDN

Dans l'onglet **Domains**, saisir `https://panel.mondomaine.fr`. Coolify configure automatiquement Traefik + Let's Encrypt.

### 3. Variables d'environnement

Aucune obligatoire. Optionnellement, dans **Environment Variables** :

```
TZ=Europe/Paris
```

### 4. Déployer

Cliquer sur **Deploy**. Coolify lance `docker compose build && docker compose up -d`.

Le panel est accessible sur le domaine configuré après ~2-3 minutes (build de l'image).

### 5. Vérification

```bash
# Depuis le VPS ou votre machine locale :
curl https://panel.mondomaine.fr/health
# → {"status":"ok","version":"x.y.z"}

# Test du port proxy depuis le VPS :
echo "" | nc -w2 <IP_DU_VPS> 990 && echo "PORT OPEN"
```

---

## Dockerfile multi-stage

Le `Dockerfile` construit l'image en 3 étapes :

| Stage | Nom | Contenu |
|---|---|---|
| 1 | `web-builder` | Build du panel React (Vite) |
| 2 | `builder` | Build de l'API NestJS + génération client Prisma |
| 3 | `runner` | Image Alpine minimale avec les artefacts compilés |

L'image finale (`runner`) expose uniquement le port `8000`. Le port `990` est écouté par Node.js mais non `EXPOSE`-é dans le Dockerfile pour que Traefik ne l'auto-détecte pas.

---

## Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f app

# Entrer dans le conteneur
docker exec -it <nom_conteneur> sh

# Vérifier les ports ouverts dans le conteneur
docker exec <nom_conteneur> ss -tlnp

# Forcer un rebuild sans cache
docker compose build --no-cache && docker compose up -d

# Arrêter sans supprimer les volumes
docker compose down

# Supprimer TOUT (y compris les données) ⚠️
docker compose down -v
```
