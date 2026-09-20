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
      - "990:990/tcp"              # Proxy TCP — bindé sur l'hôte
      - "9000-9999:9000-9999/tcp"  # Ports dédiés (pools / sous-utilisateurs)
    expose:
      - "8000"             # HTTP — géré par Traefik via le réseau interne
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

## Architecture des ports

| Port | Protocole | Usage | Exposition |
|---|---|---|---|
| `8000` | HTTP | Panel web + API REST | Via Traefik (réseau Docker interne), pas de binding hôte |
| `990` | TCP | Moteur proxy (port partagé, défaut) | Bindé directement sur l'hôte (`ports:`) |
| `9000-9999` | TCP | Ports dédiés (pools / sous-utilisateurs) | Plage pré-publiée sur l'hôte (`ports:`) |

::: info Pourquoi séparer les ports ?
Le port `990` est un proxy TCP brut (HTTP CONNECT) — Traefik ne sait pas le router. Il doit être accessible directement. Le port `8000` est du HTTP normal que Traefik intercepte et auquel il ajoute HTTPS + domaine.
:::

---

## Ports dédiés

Depuis la v2.0.14, un [pool ou un sous-utilisateur](/guide/proxy-pools#ports-dédiés) peut recevoir un port TCP dédié en plus du port partagé `990`.

Docker ne peut publier que des ports déclarés au **démarrage du conteneur** — il est impossible d'en ouvrir de nouveaux à la volée sans modifier `docker-compose.yml` et redéployer. La stratégie retenue : **pré-publier une plage une fois** (`9000-9999` ci-dessus), puis assigner dynamiquement des ports à l'intérieur de cette plage depuis le panel, sans redéploiement.

- L'API refuse tout port hors de `9000-9999` (`PROXY_PORT_RANGE`).
- Pour utiliser une plage différente : élargissez-la dans `docker-compose.yml` (`ports:`) **et** dans `PROXY_PORT_RANGE`, puis redéployez. Les deux doivent rester cohérents.
- Un port assigné dans la plage publiée est actif **en live** (sans redémarrage de l'API) dès l'enregistrement dans le panel.

::: tip Domaine dédié (DNS uniquement)
Depuis la v2.0.15, un pool ou un sous-utilisateur peut aussi recevoir un **domaine** affiché dans ses connexions, en plus du port — voir [Domaine dédié](/guide/proxy-pools#domaine-dédié). Contrairement au port, ça ne nécessite **aucune configuration Docker** : il suffit que le domaine choisi pointe (DNS) vers la même IP que `publicProxyHost` aujourd'hui — même logique que la section [DNS et Cloudflare](#dns-et-cloudflare) ci-dessous.
:::

---

## Volumes persistants

Les volumes sont nommés avec `name:` explicite. Coolify et Docker Compose ne peuvent pas les préfixer — les données survivent à chaque redéploiement.

| Volume | Chemin dans le conteneur | Contenu |
|---|---|---|
| `uhq-panel-pgdata` | `/var/lib/postgresql/data` | Base PostgreSQL |
| `uhq-panel-appdata` | `/app/data` | JWT secret, config runtime, backups locaux |
| `uhq-panel-logsdata` | `/app/logs` | Fichiers de logs journaliers (`combined-*.log`, `error-*.log`, depuis v2.4.19) |

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

---

## Dépannage

### `EMFILE: too many open files` (500 sur n'importe quelle page) {#dépannage-emfile-too-many-open-files}

Deux causes distinctes rencontrées en prod, corrigées séparément :

- **v2.4.23** — `PrismaService` laissait fuir des sockets TCP à chaque reconnexion DB (refaisait `$connect()` sans jamais `$disconnect()` l'ancien client). Une série de coupures DB rapprochées épuisait progressivement les descripteurs.
- **v2.4.24** — même en excluant la fuite ci-dessus, un **burst de connexions légitimes** (un seul sous-compte lançant des centaines de requêtes/seconde — ex. un outil de check de combos IPTV — chacune faisant courir jusqu'à 5 upstreams en parallèle) peut à lui seul épuiser un plafond de 200 000 descripteurs en quelques secondes. Le `ulimits.nofile` du `docker-compose.yml` a été relevé à `1048576` pour absorber ce genre de pic.

**Diagnostic** — vérifier la limite de descripteurs réellement appliquée dans le conteneur (trouver le nom réel du conteneur dans Coolify : onglet **Logs** de l'application, pas le libellé affiché dans l'URL) :

```bash
docker exec <nom_conteneur> sh -c 'ulimit -n'
# Compare au nombre de descripteurs réellement ouverts par le process (PID 1 dans le conteneur) :
docker exec <nom_conteneur> sh -c 'ls /proc/1/fd | wc -l'
```

Si `ulimit -n` renvoie une valeur basse malgré le `docker-compose.yml` à jour, c'est le **daemon Docker de l'hôte** qui plafonne en dessous — pas Coolify lui-même. Sur le VPS :

```bash
# Limite max que le daemon Docker peut accorder à un conteneur
systemctl show docker --property=LimitNOFILE
```

Si c'est bas, créer/éditer un override et relancer Docker (⚠️ ça redémarre **tous** les conteneurs du VPS, pas juste celui-ci) :

```bash
mkdir -p /etc/systemd/system/docker.service.d
cat > /etc/systemd/system/docker.service.d/override.conf <<'EOF'
[Service]
LimitNOFILE=1048576
EOF
systemctl daemon-reload
systemctl restart docker
```

Puis redéployer l'application depuis Coolify (bouton **Deploy**) pour que le nouveau conteneur hérite du `ulimits.nofile` à jour du `docker-compose.yml` **et** de la limite relevée côté daemon — les deux doivent être cohérents, le plus bas des deux l'emporte toujours.

::: tip Si `EMFILE` revient malgré une version à jour et un ulimit élevé
C'est le signe d'un usage légitime au-delà de ce que le serveur peut absorber (checker de masse sur un sous-compte, etc.), pas d'une fuite. Envisager de resserrer `threadsLimit` pour ce compte (Sous-utilisateurs → Modifier), ou de le bloquer temporairement.
:::
