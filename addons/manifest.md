# Référence du manifest

Le fichier `uhq-manifest.json` est le **contrat** entre votre addon et UHQ Panel OS.  
Il doit être accessible publiquement à `<votre-url>/uhq-manifest.json`.

---

## Manifest minimal

```json
{
  "name": "Mon Addon",
  "pages": [
    { "path": "/", "label": "Mon Addon", "showInNavbar": true }
  ]
}
```

---

## Manifest complet

```json
{
  "name":        "Mon Addon",
  "version":     "1.2.0",
  "description": "Description affichée dans le panel",
  "icon":        "ShoppingBag",
  "license":     "MIT",

  "author": {
    "name":  "Votre Société",
    "email": "contact@exemple.com",
    "url":   "https://exemple.com"
  },
  "homepage":   "https://docs.exemple.com",
  "repository": "https://github.com/vous/mon-addon",

  "pages": [ /* voir /addons/pages */ ],
  "slots": [ /* voir /addons/slots */ ],
  "widgets": [ /* voir /addons/widgets */ ],
  "translations": { /* voir /addons/translations */ },

  "auth": {
    "passJwt":      true,
    "passUserInfo": true
  },

  "backup": {
    "exportEndpoint": "/api/backup/export",
    "importEndpoint": "/api/backup/import",
    "authHeader":     "X-Panel-Key"
  }
}
```

---

## Référence des champs

### Identité

| Champ | Type | Requis | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Nom affiché dans le panel |
| `version` | `string` | — | Version semver (`"1.0.0"`) — utilisée pour détecter les mises à jour |
| `description` | `string` | — | Description courte |
| `icon` | `string` | — | Nom d'une icône [Lucide React](https://lucide.dev/icons) |
| `license` | `string` | — | Identifiant SPDX (`"MIT"`, `"Apache-2.0"`) |

### Auteur

```json
"author": { "name": "string", "email": "string?", "url": "string?" }
// ou simplement :
"author": "Bloume SAS <contact@bloume.fr> (https://bloume.fr)"
```

### Authentification

```json
"auth": {
  "passJwt":      true,  // Ajoute ?token=<jwt> aux URLs
  "passUserInfo": true   // Ajoute ?email=...&role=...
}
```

Le JWT est le token du panel — utilisez-le pour appeler `/api/panel/me`, etc.

---

## Détection des mises à jour

Le panel rafraîchit les manifests **toutes les heures** (configurable via `ADDON_REFRESH_CRON`).  
Si `version` dans le manifest est différente de `lastVersion` enregistré → badge **"Mise à jour disponible"** dans les Extensions.

::: tip Bonnes pratiques
Incrémentez `version` à chaque changement de votre manifest (pages, widgets, slots).  
Le panel ne détecte les mises à jour que via ce champ.
:::

---

## Validation

Le panel vérifie au minimum :
- `name` présent et non vide
- `pages` présent et non vide (tableau d'au moins 1 page)

Toute erreur de fetch ou de validation est enregistrée dans `manifestError` et affichée dans le panel.
