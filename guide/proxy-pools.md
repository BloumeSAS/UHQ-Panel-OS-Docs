# Catégories de proxies (Proxy Pools)

Les **Proxy Pools** permettent de segmenter votre stock de proxies en catégories nommées (ex. Datacenter, Résidentiel, Mobile) et d'y assigner des proxies, des sources de scraping et des comptes sous-utilisateurs.

## Concept

Par défaut, le moteur proxy pioche dans **l'ensemble** des proxies actifs. Avec les pools, chaque sous-utilisateur peut être confiné à un sous-ensemble — ce qui permet de proposer des offres distinctes (datacenter vs. résidentiel) à partir d'une seule instance.

```
Pool "Datacenter"  →  BackendProxy × N  →  ScraperSource × M
                   →  UserProxy (sous-utilisateurs assignés)
                        └─ moteur proxy filtre automatiquement
```

## Créer un pool

Allez dans **Proxy Pools** (menu latéral, icône Layers), puis cliquez **Nouveau pool**.

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | Oui | Identifiant unique (ex. `Datacenter`, `Mobile`) |
| Description | Non | Note interne libre |
| Couleur | Non | Couleur de l'étiquette dans le panel (swatch ou hex) |

::: warning Nom = clé de liaison
Le nom est stocké tel quel sur les proxies, sources et sous-utilisateurs. Renommer un pool ne met **pas** à jour les éléments déjà assignés.
:::

## Assigner des proxies à un pool

### Via l'import

Dans **Pool de proxies → Importer**, le champ **Assigner au pool** permet d'étiqueter toute la liste importée en une seule fois.

### Via le scraper

Sur chaque source de scraping (page **Scraper**), le champ **Pool** indique dans quelle catégorie les proxies scrapés seront rangés. Le `DynamicProvider` applique automatiquement l'étiquette lors de l'ingestion.

### Manuellement (API)

```http
PATCH /api/panel/proxies/:id
X-Authorization: Bearer <jwt>

{ "pool": "Datacenter" }
```

## Assigner un sous-utilisateur à un pool

Dans **Sous-utilisateurs → Créer / Modifier**, sélectionnez un pool dans le champ **Pool**. Laissez vide pour donner accès à tout le stock partagé.

Dès que le sous-utilisateur est assigné :

1. Le moteur proxy filtre `proxyPoolCache` sur `pool === user.pool`.
2. Si le pool est vide ou inexistant, la connexion est rejetée (aucun upstream disponible).
3. Les listes privées (`customProxies`) **ignorent** le pool — elles sont toujours utilisées telles quelles.

## Ports dédiés

En plus du port partagé (`990` par défaut, inchangé), un **pool** ou un **sous-utilisateur** peut recevoir un port TCP dédié, personnalisable entre **9000 et 9999** (plage publiée par Docker — voir [Docker & Coolify](/guide/docker#ports-dédiés)).

### Port dédié à un pool

Dans **Proxy Pools → Créer / Modifier**, renseignez un **Port dédié**. Toute connexion authentifiée sur ce port utilise **cette pool**, même si le compte qui se connecte a une autre catégorie par défaut — un seul compte peut ainsi accéder à plusieurs catégories simplement en changeant de port (ex. `:9001` → Mobile, `:9002` → Datacenter).

### Port dédié à un sous-utilisateur

Dans **Sous-utilisateurs → Créer / Modifier**, renseignez un **Port dédié**. C'est une **voie exclusive** : toute autre identification (même valide ailleurs) est rejetée sur ce port. Le comportement est sinon strictement identique au port partagé (même résolution de pool, mêmes sessions, mêmes quotas) — l'authentification reste obligatoire, ce port ne la contourne pas.

::: warning Plage de ports
Un port hors de 9000-9999 est refusé par l'API. Si vous avez besoin d'une autre plage, élargissez-la dans `docker-compose.yml` (`ports:` + `PROXY_PORT_RANGE`) **avant** de redéployer — voir [Docker & Coolify](/guide/docker#ports-dédiés).
:::

Les ports s'activent et se désactivent **en live** dès l'enregistrement dans le panel, sans redémarrage de l'API.

## Domaine dédié

En plus du port, un **pool** ou un **sous-utilisateur** peut recevoir un **domaine** affiché dans ses listes/connexions (ex. `mobile.example.com`) — utile pour présenter une offre sous votre propre marque/domaine plutôt que l'hôte global.

C'est **purement informatif (DNS)** : contrairement au port, le domaine ne change rien au bind réseau réel du moteur — il faut juste que ce domaine pointe (DNS `A`/`CNAME`) vers la même IP que votre instance, exactement comme `publicProxyHost` aujourd'hui.

### Résolution

Pour un compte qui se connecte, le `host:port` affiché dans une liste sticky (ou via le générateur de format de **Mes Proxies**) est résolu en cascade :

1. Le domaine/port **propre au compte**, si renseigné.
2. Sinon, le domaine/port de **sa pool** (si assignée et renseigné).
3. Sinon, `publicProxyHost`/`publicProxyPort` (Settings > Proxy public).

Exemple : un compte sans domaine propre, assigné à la pool « Mobile » (domaine `mobile.example.com`, port `9114`), reçoit des listes au format `mobile.example.com:9114:user:session:pass` — sans rien configurer sur le compte lui-même.

::: tip Comme le port, mais sans contrainte de plage
Un domaine n'est pas un port : aucune unicité ni plage requise (plusieurs pools/comptes peuvent partager le même domaine s'il pointe vers la même instance).
:::

## API REST (admin)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/panel/proxy-pools` | Lister tous les pools |
| `POST` | `/api/panel/proxy-pools` | Créer un pool |
| `PATCH` | `/api/panel/proxy-pools/:id` | Modifier nom / description / couleur |
| `DELETE` | `/api/panel/proxy-pools/:id` | Supprimer un pool |

Exemple de création :

```http
POST /api/panel/proxy-pools
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Résidentiel",
  "description": "IPs résidentielles FR/DE",
  "color": "#10b981",
  "port": 9002,
  "domain": "residential.example.com"
}
```

## Schéma Prisma

```prisma
model ProxyPool {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  @default("#6366f1")
  port        Int?     @unique
  domain      String?
  createdAt   DateTime @default(now())
}
```

Le champ `pool String?` est ajouté sur `BackendProxy`, `UserProxy` et `ScraperSource`. C'est une **dénormalisation intentionnelle** (le nom est stocké directement, sans FK) pour simplifier les requêtes et les filtres du moteur.

Le champ `port Int? @unique` est ajouté sur `ProxyPool` **et** `UserProxy` (port dédié — voir [Ports dédiés](#ports-dédiés) ci-dessus). `domain String?` (sans contrainte d'unicité) y est également ajouté — voir [Domaine dédié](#domaine-dédié) ci-dessus. `null` = pas de valeur dédiée, fallback sur les settings globaux.
