# Slots UI

Les slots permettent d'injecter des **éléments natifs** dans l'interface du panel — pas des iframes, mais de vrais liens de navigation.

---

## Déclaration

```json
"slots": [
  {
    "zone":      "topbar",
    "label":     "Mon raccourci",
    "icon":      "Star",
    "page":      "/",
    "adminOnly": false
  }
]
```

### Champs

| Champ | Type | Défaut | Description |
|---|---|---|---|
| `zone` | `string` | — | **Requis.** Zone cible (voir ci-dessous) |
| `label` | `string` | — | **Requis.** Texte ou [clé i18n](/addons/translations) |
| `icon` | `string` | — | Nom d'une icône [Lucide](https://lucide.dev/icons) |
| `page` | `string` | — | **Requis.** Chemin de la page addon à ouvrir |
| `adminOnly` | `boolean` | `false` | Visible uniquement pour les admins |

---

## Zones disponibles

### `topbar`

Le slot `"topbar"` ajoute un item dans le **dropdown déclenché par la zone email/rôle** en haut à droite du panel.

```
┌────────────────────────────────────────────────────────┐
│  Dashboard  [🌐 FR] [🌙] [user@mail.com  ▾] [Déco]   │
│                           ADMIN                        │
│                             ↓ clic                     │
│                    ┌──────────────────────┐           │
│                    │ 🧩 EXTENSIONS         │           │
│                    │ ⭐ Mon raccourci Addon│           │
│                    └──────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

**Cas d'usage :** accès rapide à une page personnelle (solde, profil, paramètres de l'addon…).

::: tip Conseil
Réservez les slots `topbar` aux **raccourcis utilisateur** (ex: "Mon solde").  
Les pages de gestion admin sont mieux placées dans la sidebar via `pages[].showInNavbar: true`.
:::

---

## Comportement

- Cliquer sur un slot topbar navigue vers `/addons/:id/:pagePath` dans le panel
- La page s'ouvre dans la zone de contenu principale (pas en popup)
- Le panel passe automatiquement `?token=`, `?lang=`, `?theme=`, `?role=` à l'URL

---

## Exemple complet — Wallet

```json
"pages": [
  { "path": "/",      "label": "addon.wallet.nav",      "showInNavbar": false },
  { "path": "/admin", "label": "addon.wallet.navAdmin",  "showInNavbar": true, "adminOnly": true }
],
"slots": [
  { "zone": "topbar", "label": "addon.wallet.nav", "icon": "Wallet", "page": "/" }
]
```

Résultat :
- "Mon solde" → accessible via le dropdown topbar (tous les utilisateurs)
- "Gestion des soldes" → accessible via la sidebar (admins uniquement)
