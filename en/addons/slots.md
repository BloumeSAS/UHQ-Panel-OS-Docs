# UI slots

Slots inject **native elements** into the panel interface — not iframes, but real navigation links.

---

## Declaration

```json
"slots": [
  {
    "zone":      "topbar",
    "label":     "My shortcut",
    "icon":      "Star",
    "page":      "/",
    "adminOnly": false
  }
]
```

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `zone` | `string` | — | **Required.** Target zone (see below) |
| `label` | `string` | — | **Required.** Text or [i18n key](/en/addons/translations) |
| `icon` | `string` | — | Name of a [Lucide](https://lucide.dev/icons) icon |
| `page` | `string` | — | **Required.** Path of the add-on page to open |
| `adminOnly` | `boolean` | `false` | Visible to admins only |

---

## Available zones

### `topbar`

The `"topbar"` slot adds an item to the **dropdown opened from the email/role area** at the top right of the panel.

```
┌────────────────────────────────────────────────────────┐
│  Dashboard  [🌐 EN] [🌙] [user@mail.com  ▾] [Logout] │
│                           ADMIN                        │
│                             ↓ click                    │
│                    ┌──────────────────────┐           │
│                    │ 🧩 EXTENSIONS         │           │
│                    │ ⭐ My add-on shortcut │           │
│                    └──────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

**Use case:** quick access to a personal page (balance, profile, add-on settings…).

::: tip Tip
Keep `topbar` slots for **user shortcuts** (e.g. "My balance").  
Admin management pages fit better in the sidebar with `pages[].showInNavbar: true`.
:::

---

## Behaviour

- Clicking a topbar slot navigates to `/addons/:id/:pagePath` in the panel
- The page opens in the main content area (not in a popup)
- The panel automatically passes `?token=`, `?lang=`, `?theme=`, `?role=` in the URL

---

## Full example — Wallet

```json
"pages": [
  { "path": "/",      "label": "addon.wallet.nav",      "showInNavbar": false },
  { "path": "/admin", "label": "addon.wallet.navAdmin",  "showInNavbar": true, "adminOnly": true }
],
"slots": [
  { "zone": "topbar", "label": "addon.wallet.nav", "icon": "Wallet", "page": "/" }
]
```

Result:
- "My balance" → reachable from the topbar dropdown (all users)
- "Balance management" → reachable from the sidebar (admins only)
