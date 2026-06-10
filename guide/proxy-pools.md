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
  "color": "#10b981"
}
```

## Schéma Prisma

```prisma
model ProxyPool {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  @default("#6366f1")
  createdAt   DateTime @default(now())
}
```

Le champ `pool String?` est ajouté sur `BackendProxy`, `UserProxy` et `ScraperSource`. C'est une **dénormalisation intentionnelle** (le nom est stocké directement, sans FK) pour simplifier les requêtes et les filtres du moteur.
