# Reference — uhq-manifest.json

Full schema of a UHQ Panel OS add-on manifest file.

---

## JSON schema

```typescript
interface UhqManifest {
  // Required
  name:    string;
  pages:   AddonPage[];     // at least 1 entry

  // Identity
  version?:     string;     // semver "1.0.0"
  description?: string;
  icon?:        string;     // Lucide icon name
  license?:     string;     // SPDX "MIT"

  // Author
  author?:     AddonAuthor | string;
  homepage?:   string;      // docs URL
  repository?: string;      // repo URL

  // UI injection
  slots?:   AddonSlot[];
  widgets?: AddonWidget[];

  // i18n
  translations?: Record<string, Record<string, string>>;

  // Auth
  auth?: {
    passJwt?:      boolean;   // default: false
    passUserInfo?: boolean;   // default: false
  };

  // Backup
  backup?: {
    exportEndpoint:  string;
    importEndpoint?: string;
    authHeader?:     string;  // default: "X-Panel-Key"
  };
}

interface AddonPage {
  path:          string;
  label:         string;    // text or i18n key
  icon?:         string;
  showInNavbar?: boolean;   // default: true
  adminOnly?:    boolean;   // default: false
}

interface AddonSlot {
  zone:       string;       // "topbar"
  label:      string;
  icon?:      string;
  page:       string;       // path of a declared page
  adminOnly?: boolean;
}

interface AddonWidget {
  zone:    string;          // panel pathname or "*"
  path:    string;          // route on the add-on
  height?: number;          // px, default: 40
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

| Value | Location |
|---|---|
| `"topbar"` | Dropdown opened from the email/role area at the top right |

---

## Zones — Widgets

| Value | Panel page |
|---|---|
| `"/"` | Dashboard |
| `"/subusers"` | Sub-users |
| `"/users"` | Users |
| `"/pool"` | Proxy pool |
| `"/reports"` | Reports |
| `"/settings"` | Settings |
| `"*"` | Every page |

---

## Minimal valid example

```json
{
  "name": "My Add-on",
  "pages": [{ "path": "/", "label": "My Add-on" }]
}
```

## Full example

See [Manifest reference](/en/addons/manifest).
