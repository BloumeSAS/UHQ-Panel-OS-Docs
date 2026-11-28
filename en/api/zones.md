# Available zones

Zones define **where** a widget or slot can be injected in the panel. Each zone matches a page or a location of the React interface.

---

## Widget zones

Widgets are micro-iframes injected into panel pages.

| Zone | Page | Description |
|---|---|---|
| `/` | Dashboard | Widget shown on the home page |
| `/subusers` | Sub-users | Widget in the proxy account list |
| `/users` | Panel users | Widget in user management |
| `/pool` | Proxy pool | Widget in the pool monitoring page |
| `/reports` | Reports | Widget in the statistics page |
| `/settings` | Settings | Widget in the configuration page |
| `*` | Every page | Widget injected on every panel page |

### Manifest declaration

```json
{
  "widgets": [
    {
      "zone": "/",
      "path": "/widget/dashboard",
      "height": 200,
      "label": "Wallet balance"
    },
    {
      "zone": "*",
      "path": "/widget/global",
      "height": 80,
      "label": "Global banner"
    }
  ]
}
```

### Recommended heights

| Use | Recommended height |
|---|---|
| Simple KPI (numbers) | 100–150 px |
| Compact chart | 200–280 px |
| Table or list | 300–420 px |
| Banner / alert | 60–100 px |

---

## Slot zones

Slots are native UI elements (not iframes) injected at fixed locations of the panel.

| Zone | Location | Description |
|---|---|---|
| `topbar` | Top navigation bar | Link in the user's dropdown menu (next to name/role) |

### Manifest declaration

```json
{
  "slots": [
    {
      "zone": "topbar",
      "label": "My Wallet",
      "icon": "Wallet",
      "page": "/wallet"
    }
  ]
}
```

When the user clicks this slot, they are sent to `/addons/<id>/wallet` — the matching add-on page is shown in a full-screen iframe.

---

## Injection order

If several add-ons declare a widget on the same zone, they are shown in loading order (order of the add-ons returned by `GET /api/panel/addons`).

The `*` zone is always processed last — page-specific widgets are injected first.
