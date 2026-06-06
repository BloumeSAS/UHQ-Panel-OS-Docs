# Référence — uhq-manifest.json

Schéma complet du fichier manifest d'un addon UHQ Panel OS.

---

## Schéma JSON

```typescript
interface UhqManifest {
  // Obligatoires
  name:    string;
  pages:   AddonPage[];     // min. 1 entrée

  // Identité
  version?:     string;     // semver "1.0.0"
  description?: string;
  icon?:        string;     // nom icône Lucide
  license?:     string;     // SPDX "MIT"

  // Auteur
  author?:     AddonAuthor | string;
  homepage?:   string;      // URL docs
  repository?: string;      // URL repo

  // Injection UI
  slots?:   AddonSlot[];
  widgets?: AddonWidget[];

  // i18n
  translations?: Record<string, Record<string, string>>;

  // Auth
  auth?: {
    passJwt?:      boolean;   // défaut: false
    passUserInfo?: boolean;   // défaut: false
  };

  // Backup
  backup?: {
    exportEndpoint:  string;
    importEndpoint?: string;
    authHeader?:     string;  // défaut: "X-Panel-Key"
  };
}

interface AddonPage {
  path:          string;
  label:         string;    // texte ou clé i18n
  icon?:         string;
  showInNavbar?: boolean;   // défaut: true
  adminOnly?:    boolean;   // défaut: false
}

interface AddonSlot {
  zone:       string;       // "topbar"
  label:      string;
  icon?:      string;
  page:       string;       // path d'une page déclarée
  adminOnly?: boolean;
}

interface AddonWidget {
  zone:    string;          // pathname panel ou "*"
  path:    string;          // route sur l'addon
  height?: number;          // px, défaut: 40
  label?:  string;
}

interface AddonAuthor {
  name:   string;
  email?: string;
  url?:   string;
}
```

---

## Zones — Slots

| Valeur | Emplacement |
|---|---|
| `"topbar"` | Dropdown déclenché par la zone email/rôle en haut à droite |

---

## Zones — Widgets

| Valeur | Page panel |
|---|---|
| `"/"` | Dashboard |
| `"/subusers"` | Sous-utilisateurs |
| `"/users"` | Utilisateurs |
| `"/pool"` | Pool proxies |
| `"/reports"` | Rapports |
| `"/settings"` | Paramètres |
| `"*"` | Toutes les pages |

---

## Exemple minimal valide

```json
{
  "name": "Mon Addon",
  "pages": [{ "path": "/", "label": "Mon Addon" }]
}
```

## Exemple complet

Voir [Référence du manifest](/addons/manifest).
