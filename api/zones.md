# Zones disponibles

Les zones définissent **où** un widget ou slot peut être injecté dans le panel. Chaque zone correspond à une page ou un emplacement de l'interface React.

---

## Zones de widgets

Les widgets sont des micro-iframes injectées dans les pages du panel.

| Zone | Page | Description |
|---|---|---|
| `/` | Dashboard | Widget affiché sur la page d'accueil |
| `/subusers` | Sous-utilisateurs | Widget dans la liste des comptes proxy |
| `/users` | Utilisateurs panel | Widget dans la gestion des utilisateurs |
| `/pool` | Pool de proxies | Widget dans la page de monitoring du pool |
| `/reports` | Rapports | Widget dans la page de statistiques |
| `/settings` | Paramètres | Widget dans la page de configuration |
| `*` | Toutes les pages | Widget injecté sur chaque page du panel |

### Déclaration dans le manifest

```json
{
  "widgets": [
    {
      "zone": "/",
      "path": "/widget/dashboard",
      "height": 200,
      "label": "Solde wallet"
    },
    {
      "zone": "*",
      "path": "/widget/global",
      "height": 80,
      "label": "Bannière globale"
    }
  ]
}
```

### Recommandations de hauteur

| Usage | Hauteur recommandée |
|---|---|
| KPI simple (chiffres) | 100–150 px |
| Graphique compact | 200–280 px |
| Tableau ou liste | 300–420 px |
| Bannière / alerte | 60–100 px |

---

## Zones de slots

Les slots sont des éléments UI natifs (non-iframe) injectés dans des emplacements fixes du panel.

| Zone | Emplacement | Description |
|---|---|---|
| `topbar` | Barre de navigation supérieure | Lien dans le menu dropdown de l'utilisateur (à côté du nom/rôle) |

### Déclaration dans le manifest

```json
{
  "slots": [
    {
      "zone": "topbar",
      "label": "Mon Wallet",
      "icon": "Wallet",
      "pagePath": "/wallet"
    }
  ]
}
```

Quand l'utilisateur clique sur ce slot, il est redirigé vers `/addons/<id>/wallet` — la page correspondante de l'addon s'affiche dans une iframe plein-écran.

---

## Priorité d'injection

Si plusieurs addons déclarent un widget sur la même zone, ils sont affichés dans l'ordre de chargement (ordre des addons retournés par `GET /api/panel/addons`).

La zone `*` est toujours la dernière traitée — les widgets spécifiques à une page sont injectés en premier.
