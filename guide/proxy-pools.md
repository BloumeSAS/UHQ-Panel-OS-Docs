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

### Où cette résolution s'applique

La cascade (compte → pool → réglages globaux) est utilisée par **tous** les endpoints qui renvoient une connexion à un compte :

- Panel : `GET /api/panel/subusers/:id/sticky-list`, `GET /api/panel/me/proxies/:id/sticky-list`, ainsi que les listes (`effective_host`/`effective_port` en plus des champs bruts `port`/`domain`).
- API legacy (`/api/v1`) : `GET /api/v1/sub-user/list`, `GET /api/v1/sub-user/get-sticky-proxies`, `GET /api/v1/me/proxies`, `GET /api/v1/me/proxies/sticky-list` — tous renvoient désormais `host`/`port` résolus, jamais juste la valeur globale brute.

Chaque liste sticky inclut aussi un format **rotatif** sans session (`rotating: "username:password@host:port"`), pratique pour les clients qui n'ont pas besoin du `host:port:user:session:pass` complet.

## Toujours en ligne

Une pool peut être marquée **Toujours en ligne** : ses `BackendProxy` ne sont alors jamais testés par le checker (donc jamais marqués KO/morts) — ils restent affichés **OK** dans le Pool de proxies. Ce réglage est **indépendant** des pays/IP en plus ci-dessous : il ne contrôle que le comportement du checker, rien côté stats.

### Comportement du checker

- Les proxies d'une pool `alwaysOnline` sont **exclus** de chaque cycle de vérification (jamais testés en masse).
- Au début de chaque cycle, tout proxy de cette pool encore marqué mort est **forcé** `isWorking = true`.
- Le bouton **Tester** (test manuel par proxy) exécute toujours le vrai test (diagnostic visible), mais le résultat persisté ne marque jamais ce proxy KO si sa pool est `alwaysOnline`.
- Le scraper, lui, ne marque déjà rien mort de son côté (seul le checker teste la connectivité réelle) — aucun changement nécessaire à ce niveau.

## Checker actif

Chaque pool a un toggle **Checker actif** (activé par défaut). Désactivé, il fait complètement ignorer les proxies de cette pool par le cycle automatique du checker :

- Aucun test n'est exécuté sur ces proxies pendant le cycle.
- Leur statut (`isWorking`) reste **figé tel quel** — contrairement à **Toujours en ligne**, ce réglage ne force **rien** : c'est un vrai "hands off", sans mentir sur le statut affiché.
- Le bouton **Tester** manuel continue de fonctionner dans tous les cas (diagnostic à la demande), quel que soit ce réglage.
- Une pool peut combiner les deux réglages (`alwaysOnline` + `checkerEnabled: false`), auquel cas elle est simplement exclue du cycle sans être re-forcée en ligne à chaque passage.

Un badge **Checker désactivé** est affiché dans la liste des catégories quand ce réglage est actif.

## Pays et nombre d'IP en plus (stats simulées)

**Indépendamment de "Toujours en ligne"** (pas besoin de l'activer), n'importe quelle pool peut déclarer des pays et un nombre d'IP **en plus** de ses vraies stats — utile pour présenter une couverture géographique élargie sans dépendre uniquement du stock réel scrapé.

Dans **Proxy Pools → Créer / Modifier** :

| Champ | Description |
|---|---|
| Pays affichés | Codes ISO 2 lettres séparés par des virgules (ex. `FR,DE,US,GB`) — **aucune limite** sur le nombre de pays |
| Pays prioritaires | Optionnel — sous-ensemble des pays ci-dessus à toujours faire tirer plus haut (voir [Pays prioritaires](#pays-prioritaires) ci-dessous) |
| Nombre d'IP | **Valeur fixe** (un nombre) ou **Aléatoire** (une plage, ex. 100 000–300 000) |
| Mode rotatif | Optionnel — intervalle en secondes (voir [Mode rotatif](#mode-rotatif) ci-dessous) |

::: tip Chaque pays a son propre nombre d'IP
Depuis la v2.0.20, la plage configurée n'est **pas** un total partagé réparti entre les pays listés : **chaque pays tire son propre nombre indépendamment** dans `[min, max]`. Ajouter un pays à la liste lui donne immédiatement son propre tirage, sans changer les chiffres déjà affichés pour les autres pays.
:::

En mode aléatoire (rotatif désactivé), le nombre de chaque pays est **tiré une seule fois** et reste stable (pas de valeur qui change à chaque requête) — il n'est re-tiré que si :
- vous modifiez la plage min/max (tous les pays sont alors re-tirés dans la nouvelle plage) ;
- le pays vient d'être ajouté à la liste (lui seul reçoit un nouveau tirage, les autres restent stables) ;
- vous cliquez sur le bouton **Régénérer les IP simulées** (dans le dialogue de modification) — il force un nouveau tirage pour **tous** les pays déjà configurés, sans toucher à la plage.

::: tip Additif, jamais un remplacement
Les pays/IP déclarés ici s'**ajoutent** aux vraies stats de la pool — une pool sans aucun vrai proxy n'affichera donc que les chiffres simulés, tandis qu'une pool avec du vrai stock affichera réel + simulé combinés (par pays).
:::

### Mode rotatif

Depuis la v2.0.21, au lieu d'un nombre stable par pays, vous pouvez activer un **mode rotatif** : renseignez un intervalle en secondes, et l'IP affichée pour chaque pays **change automatiquement** à chaque fenêtre de temps écoulée — sans tâche planifiée ni écriture en base, le nombre est recalculé à la volée à chaque appel de `category-stats` à partir de l'heure courante.

- Nécessite une plage min/max configurée (le mode rotatif tire dans cette plage, exactement comme le mode aléatoire stable).
- Le tirage est déterministe par fenêtre de temps : deux appels dans la même fenêtre de N secondes renvoient exactement le même nombre ; dès que la fenêtre suivante commence, le nombre change.
- Pendant que le mode rotatif est actif, le bouton **Régénérer les IP simulées** est masqué dans le panel (il n'aurait aucun effet visible, puisque la valeur n'est plus celle stockée en base).
- Désactiver le mode rotatif fait retomber sur la dernière valeur stable connue par pays.

### Pays prioritaires

Depuis la v2.0.22, vous pouvez désigner un sous-ensemble des pays affichés qui doit **toujours** tirer un nombre d'IP plus élevé que les pays non listés — utile pour qu'un ou deux pays "phares" (ex. votre marché principal) ressortent systématiquement en tête, sans dépendre du hasard du tirage.

Mécanique : la plage `[min, max]` est découpée en deux moitiés disjointes — les pays prioritaires tirent dans la moitié haute, tous les autres dans la moitié basse. La garantie tient **quel que soit le tirage de chacun** (même la plus basse valeur prioritaire possible reste au-dessus de la plus haute valeur non-prioritaire possible), aussi bien en mode stable qu'en mode rotatif.

::: tip Sans effet en valeur fixe
Une plage `min == max` (mode "Valeur fixe") ne laisse aucune place pour départager deux moitiés — tous les pays reçoivent alors le même nombre, prioritaires ou non. Les pays prioritaires n'ont d'effet qu'en mode "Aléatoire" (plage).
:::

Modifier la liste des pays prioritaires déclenche un nouveau tirage pour **tous** les pays déjà configurés (comme un changement de plage) — la garantie doit rester valide pour l'ensemble, pas seulement pour le pays qu'on vient de (dé)prioriser.

### Impact sur l'API legacy

`GET /api/v1/common/category-stats?pool=<nom>` renvoie, pour une pool ayant des pays/IP en plus configurés, les vraies stats **augmentées** des chiffres simulés (un total indépendant par pays, stable entre les appels) :

```json
{
  "status": "success",
  "pool": "Résidentiel Premium",
  "data": {
    "countries_count": 4,
    "ip_count": 247813,
    "proxy_count": 247813,
    "by_country": { "US": 89421, "FR": 71204, "DE": 52188, "GB": 35000 }
  }
}
```

::: warning Purement déclaratif
Ces stats n'ajoutent ni ne déplacent aucun `BackendProxy` réel — c'est uniquement ce que `category-stats` affiche. Les autres endpoints (`pool_stats`, `countries`, `proxies`) ne sont pas concernés et continuent de refléter les données réelles.
:::

## API REST (admin)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/panel/proxy-pools` | Lister tous les pools |
| `POST` | `/api/panel/proxy-pools` | Créer un pool |
| `PATCH` | `/api/panel/proxy-pools/:id` | Modifier nom / description / couleur |
| `POST` | `/api/panel/proxy-pools/:id/reroll-fake-ips` | Re-tirer l'IP simulée de chaque pays déjà configuré (plage inchangée) |
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
  "domain": "residential.example.com",
  "alwaysOnline": true,
  "fakeCountries": "FR,DE,US,GB",
  "fakeIpCountMin": 100000,
  "fakeIpCountMax": 300000
}
```

## Schéma Prisma

```prisma
model ProxyPool {
  id             String   @id @default(cuid())
  name           String   @unique
  description    String?
  color          String?  @default("#6366f1")
  port           Int?     @unique
  domain         String?
  alwaysOnline   Boolean  @default(false)
  checkerEnabled Boolean  @default(true)
  fakeCountries          String?
  fakePriorityCountries  String?
  fakeIpCountMin         Int?
  fakeIpCountMax         Int?
  fakeIpCountByCountry   Json     @default("{}")
  fakeIpRotateSeconds    Int?
  createdAt              DateTime @default(now())
}
```

Le champ `pool String?` est ajouté sur `BackendProxy`, `UserProxy` et `ScraperSource`. C'est une **dénormalisation intentionnelle** (le nom est stocké directement, sans FK) pour simplifier les requêtes et les filtres du moteur.

Le champ `port Int? @unique` est ajouté sur `ProxyPool` **et** `UserProxy` (port dédié — voir [Ports dédiés](#ports-dédiés) ci-dessus). `domain String?` (sans contrainte d'unicité) y est également ajouté — voir [Domaine dédié](#domaine-dédié) ci-dessus. `alwaysOnline`/`checkerEnabled`/`fakeCountries`/`fakePriorityCountries`/`fakeIpCountMin`/`fakeIpCountMax`/`fakeIpCountByCountry`/`fakeIpRotateSeconds` sont spécifiques à `ProxyPool` — voir [Toujours en ligne](#toujours-en-ligne), [Checker actif](#checker-actif), [Pays et nombre d'IP en plus](#pays-et-nombre-d-ip-en-plus-stats-simulées), [Mode rotatif](#mode-rotatif) et [Pays prioritaires](#pays-prioritaires) ci-dessus. `null`/`false`/`{}` = pas de valeur dédiée, fallback sur les settings globaux. `fakeIpCountByCountry` est une map `{ "FR": 12345, "DE": 8901 }` (clé = code pays, valeur = IP tirée pour CE pays) — recalculée par pays, jamais comme un total partagé ; ignorée si `fakeIpRotateSeconds` est actif (la valeur est alors calculée à la volée, pas lue en base). `fakePriorityCountries` est un sous-ensemble (mêmes codes) de `fakeCountries`.
