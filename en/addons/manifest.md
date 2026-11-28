# Manifest reference

The `uhq-manifest.json` file is the **contract** between your add-on and UHQ Panel OS.  
It must be publicly reachable at `<your-url>/uhq-manifest.json`.

---

## Minimal manifest

```json
{
  "name": "My Add-on",
  "pages": [
    { "path": "/", "label": "My Add-on", "showInNavbar": true }
  ]
}
```

---

## Full manifest

```json
{
  "name":        "My Add-on",
  "version":     "1.2.0",
  "description": "Description shown in the panel",
  "icon":        "ShoppingBag",
  "license":     "MIT",

  "author": {
    "name":  "Your Company",
    "email": "contact@example.com",
    "url":   "https://example.com"
  },
  "homepage":   "https://docs.example.com",
  "repository": "https://github.com/you/my-addon",

  "pages": [ /* see /en/addons/pages */ ],
  "slots": [ /* see /en/addons/slots */ ],
  "widgets": [ /* see /en/addons/widgets */ ],
  "translations": { /* see /en/addons/translations */ },

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

## Field reference

### Identity

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Name shown in the panel |
| `version` | `string` | — | Semver version (`"1.0.0"`) — used to detect updates |
| `description` | `string` | — | Short description |
| `icon` | `string` | — | Name of a [Lucide React](https://lucide.dev/icons) icon |
| `license` | `string` | — | SPDX identifier (`"MIT"`, `"Apache-2.0"`) |

### Author

```json
"author": { "name": "string", "email": "string?", "url": "string?" }
// or simply:
"author": "Bloume SAS <contact@bloume.fr> (https://bloume.fr)"
```

### Authentication

```json
"auth": {
  "passJwt":      true,  // Adds ?token=<jwt> to URLs
  "passUserInfo": true   // Adds ?email=...&role=...
}
```

The JWT is the panel token — use it to call `/api/panel/me`, etc.

---

## Update detection

The panel refreshes manifests **every hour** (configurable with `ADDON_REFRESH_CRON`).  
If `version` in the manifest differs from the stored `lastVersion` → **"Update available"** badge in Extensions.

::: tip Best practice
Bump `version` on every change to your manifest (pages, widgets, slots).  
The panel only detects updates through this field.
:::

---

## Validation

The panel checks at least:
- `name` present and not empty
- `pages` present and not empty (array of at least 1 page)

Any fetch or validation error is stored in `manifestError` and shown in the panel.
