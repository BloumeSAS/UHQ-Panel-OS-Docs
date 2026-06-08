# Icônes Lucide

UHQ Panel OS utilise la bibliothèque **[Lucide](https://lucide.dev)** pour toutes les icônes du panel. Vous pouvez utiliser n'importe quelle icône Lucide dans les manifests d'addons (pages, slots).

---

## Usage dans le manifest

La valeur de `icon` doit être le **nom PascalCase** de l'icône Lucide :

```json
{
  "pages": [
    {
      "path": "/wallet",
      "label": "Wallet",
      "icon": "Wallet",
      "showInNavbar": true
    }
  ],
  "slots": [
    {
      "zone": "topbar",
      "label": "Mon addon",
      "icon": "Puzzle"
    }
  ]
}
```

---

## Icônes recommandées pour les addons

| Nom | Usage suggéré |
|---|---|
| `Wallet` | Module de paiement / crédits |
| `BarChart2` | Statistiques, graphiques |
| `ShoppingCart` | Boutique, commandes |
| `CreditCard` | Paiements, facturation |
| `Package` | Produits, offres |
| `Users` | Gestion d'utilisateurs |
| `Settings` | Configuration |
| `Bell` | Notifications |
| `Shield` | Sécurité, authentification |
| `Globe` | Proxy, géographie |
| `Zap` | Performance, temps réel |
| `Database` | Base de données, stockage |
| `Mail` | E-mails |
| `Key` | Clés API, accès |
| `Activity` | Monitoring, santé |
| `FileText` | Rapports, logs |
| `Puzzle` | Extensions, addons |
| `Link` | Liens, connexions |
| `Lock` | Sécurité, accès restreint |
| `Unlock` | Accès ouvert |

---

## Recherche d'icônes

Toutes les icônes disponibles sont listées sur [lucide.dev](https://lucide.dev/icons). La recherche est disponible sur le site.

::: tip
Le nom à utiliser dans le manifest est le nom affiché sur lucide.dev, converti en **PascalCase** sans espaces ni tirets. Ex : `arrow-right` → `ArrowRight`.
:::

---

## Icônes utilisées dans le panel

Le panel utilise ces icônes dans sa navigation — pour cohérence visuelle, préférez des icônes distinctes pour vos addons :

| Page panel | Icône |
|---|---|
| Dashboard | `LayoutDashboard` |
| Pool | `Database` |
| Sous-utilisateurs | `Users` |
| Scraper | `Radio` |
| Checker | `Activity` |
| Rapports | `BarChart2` |
| Logs | `ScrollText` |
| Settings | `Settings` |
| Addons | `Puzzle` |
