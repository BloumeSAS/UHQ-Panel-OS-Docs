# Lucide icons

UHQ Panel OS uses the **[Lucide](https://lucide.dev)** library for every icon in the panel. You can use any Lucide icon in add-on manifests (pages, slots).

---

## Use in the manifest

The `icon` value must be the Lucide icon's **PascalCase name**:

```json
{
  "pages": [
    {
      "path": "/wallet",
      "label": "Wallet",
      "icon": "Wallet",
      "showInNavbar": true
    }
  ],
  "slots": [
    {
      "zone": "topbar",
      "label": "My add-on",
      "icon": "Puzzle"
    }
  ]
}
```

---

## Recommended icons for add-ons

| Name | Suggested use |
|---|---|
| `Wallet` | Payment / credits module |
| `BarChart2` | Statistics, charts |
| `ShoppingCart` | Shop, orders |
| `CreditCard` | Payments, billing |
| `Package` | Products, offers |
| `Users` | User management |
| `Settings` | Configuration |
| `Bell` | Notifications |
| `Shield` | Security, authentication |
| `Globe` | Proxy, geography |
| `Zap` | Performance, real time |
| `Database` | Database, storage |
| `Mail` | E-mails |
| `Key` | API keys, access |
| `Activity` | Monitoring, health |
| `FileText` | Reports, logs |
| `Puzzle` | Extensions, add-ons |
| `Link` | Links, connections |
| `Lock` | Security, restricted access |
| `Unlock` | Open access |

---

## Finding icons

Every available icon is listed on [lucide.dev](https://lucide.dev/icons), with search.

::: tip
The name to use in the manifest is the name shown on lucide.dev, converted to **PascalCase** without spaces or dashes. E.g. `arrow-right` → `ArrowRight`.
:::

---

## Icons used by the panel

The panel uses these icons in its navigation — for visual consistency, prefer distinct icons for your add-ons:

| Panel page | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Pool | `Database` |
| Sub-users | `Users` |
| Scraper | `Radio` |
| Checker | `Activity` |
| Reports | `BarChart2` |
| Logs | `ScrollText` |
| Settings | `Settings` |
| Add-ons | `Puzzle` |
