# Pages

Les pages sont des **iframes pleine page** intégrées dans le panel.  
Elles apparaissent dans la **sidebar de navigation** et s'ouvrent dans la zone de contenu principale.

---

## Déclaration

```json
"pages": [
  {
    "path":         "/",
    "label":        "Mon Addon",
    "icon":         "Star",
    "showInNavbar": true,
    "adminOnly":    false
  },
  {
    "path":         "/admin",
    "label":        "addon.myapp.admin",
    "icon":         "Settings",
    "showInNavbar": true,
    "adminOnly":    true
  }
]
```

### Champs

| Champ | Type | Défaut | Description |
|---|---|---|---|
| `path` | `string` | — | **Requis.** Route relative sur votre addon (`"/"`, `"/admin"`) |
| `label` | `string` | — | **Requis.** Texte ou [clé i18n](/addons/translations) |
| `icon` | `string` | icône du manifest | Nom d'une icône [Lucide](https://lucide.dev/icons) |
| `showInNavbar` | `boolean` | `true` | Afficher dans la sidebar |
| `adminOnly` | `boolean` | `false` | Visible uniquement pour les admins |

---

## URL générée

Quand un utilisateur clique sur un item de nav, le panel ouvre :

```
<addon-baseUrl><page.path>?token=<jwt>&lang=<lang>&theme=<dark|light>&role=<ADMIN|USER>
```

Exemple :
```
http://localhost:3001/admin?token=eyJ...&lang=fr&theme=dark&role=ADMIN
```

---

## Lire les paramètres dans React

```tsx
import { useSearchParams } from 'react-router-dom';

function AdminPage() {
  const [params] = useSearchParams();

  const token = params.get('token') ?? '';
  const lang  = params.get('lang')  ?? 'fr';
  const theme = params.get('theme') ?? 'dark';
  const role  = params.get('role')  ?? 'USER';

  // Appliquer le thème
  document.documentElement.setAttribute('data-theme', theme);

  if (!token) return <div>Connexion requise</div>;
  if (role !== 'ADMIN') return <div>Accès refusé</div>;

  return <div>Page admin</div>;
}
```

---

## Bonnes pratiques

::: tip Thème
Appliquez toujours `data-theme` sur `<html>` pour correspondre au thème du panel (dark/light).
```css
:root        { --bg: #fff; --fg: #111; }
[data-theme="dark"] { --bg: hsl(20,14%,8%); --fg: hsl(0,0%,92%); }
body         { background: var(--bg); color: var(--fg); }
```
:::

::: tip Séparation pages / widgets
Gardez les routes pages (`/`, `/admin`) séparées des routes widgets (`/widget/*`) dans votre React Router.  
Les widgets ont des hauteurs fixes et ne doivent pas avoir de navigation.
:::
