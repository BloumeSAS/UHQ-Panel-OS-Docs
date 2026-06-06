# Widgets

Les widgets sont des **micro-iframes** injectées automatiquement dans les pages du panel.  
Ils s'affichent en bas de la page cible, sans modifier son code.

---

## Déclaration

```json
"widgets": [
  {
    "zone":   "/",
    "path":   "/widget/dashboard",
    "height": 120,
    "label":  "Mes statistiques"
  },
  {
    "zone":   "/subusers",
    "path":   "/widget/table",
    "height": 300,
    "label":  "addon.myapp.table"
  }
]
```

### Champs

| Champ | Type | Défaut | Description |
|---|---|---|---|
| `zone` | `string` | — | **Requis.** Pathname exact de la page panel cible |
| `path` | `string` | — | **Requis.** Route relative sur votre addon |
| `height` | `number` | `40` | Hauteur de l'iframe en pixels |
| `label` | `string` | — | Titre affiché au-dessus du widget |

---

## Zones disponibles

| Zone | Page panel |
|---|---|
| `"/"` | Dashboard |
| `"/subusers"` | Sous-utilisateurs |
| `"/users"` | Utilisateurs panel |
| `"/pool"` | Pool de proxies |
| `"/reports"` | Rapports |
| `"/settings"` | Paramètres |
| `"*"` | Toutes les pages |

---

## URL générée

```
<addon-baseUrl><widget.path>?token=<jwt>&lang=<lang>&theme=<dark|light>&role=<ADMIN|USER>
```

---

## React — Widget compact

Un widget doit être **ultra léger** — pas de navigation, pas de scroll si possible.

```tsx
// web/src/widgets/DashboardWidget.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function DashboardWidget() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const lang  = params.get('lang')  ?? 'fr';
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats);
  }, [token]);

  // body et html doivent être transparent pour s'intégrer au panel
  useEffect(() => {
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
  }, []);

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem' }}>
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Actifs" value={stats.active} />
    </div>
  );
}
```

---

## Hauteurs recommandées

| Type de widget | Hauteur |
|---|---|
| KPIs (3 cartes) | `100` – `120` px |
| Tableau court (5 lignes) | `260` – `300` px |
| Tableau moyen (10 lignes) | `380` – `420` px |
| Formulaire | `200` – `280` px |

::: warning Scroll
Évitez le scroll dans les widgets — l'utilisateur ne s'y attend pas.  
Si votre contenu est variable, utilisez `height: auto` et communiquez la hauteur réelle via `postMessage` (voir documentation avancée).
:::
