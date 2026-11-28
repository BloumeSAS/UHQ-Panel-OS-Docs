# Widgets

Widgets are **micro-iframes** injected automatically into panel pages.  
They appear at the bottom of the target page, without changing its code.

---

## Declaration

```json
"widgets": [
  {
    "zone":   "/",
    "path":   "/widget/dashboard",
    "height": 120,
    "label":  "My statistics"
  },
  {
    "zone":   "/subusers",
    "path":   "/widget/table",
    "height": 300,
    "label":  "addon.myapp.table"
  }
]
```

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `zone` | `string` | — | **Required.** Exact pathname of the target panel page |
| `path` | `string` | — | **Required.** Relative route on your add-on |
| `height` | `number` | `40` | Iframe height in pixels |
| `label` | `string` | — | Title shown above the widget |

---

## Available zones

| Zone | Panel page |
|---|---|
| `"/"` | Dashboard |
| `"/subusers"` | Sub-users |
| `"/users"` | Panel users |
| `"/pool"` | Proxy pool |
| `"/reports"` | Reports |
| `"/settings"` | Settings |
| `"*"` | Every page |

---

## Generated URL

```
<addon-baseUrl><widget.path>?token=<jwt>&lang=<lang>&theme=<dark|light>&role=<ADMIN|USER>
```

---

## React — compact widget

A widget must be **very light** — no navigation, no scrolling if possible.

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

  // body and html must be transparent to blend into the panel
  useEffect(() => {
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
  }, []);

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem' }}>
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Active" value={stats.active} />
    </div>
  );
}
```

---

## Recommended heights

| Widget type | Height |
|---|---|
| KPIs (3 cards) | `100` – `120` px |
| Short table (5 rows) | `260` – `300` px |
| Medium table (10 rows) | `380` – `420` px |
| Form | `200` – `280` px |

::: warning Scrolling
Avoid scrolling inside widgets — users do not expect it.  
If your content varies, use `height: auto` and report the real height with `postMessage`.
:::
