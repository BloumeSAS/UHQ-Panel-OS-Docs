# Pages

Pages are **full-page iframes** embedded in the panel.  
They appear in the **navigation sidebar** and open in the main content area.

---

## Declaration

```json
"pages": [
  {
    "path":         "/",
    "label":        "My Add-on",
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

### Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `path` | `string` | — | **Required.** Relative route on your add-on (`"/"`, `"/admin"`) |
| `label` | `string` | — | **Required.** Text or [i18n key](/en/addons/translations) |
| `icon` | `string` | manifest icon | Name of a [Lucide](https://lucide.dev/icons) icon |
| `showInNavbar` | `boolean` | `true` | Show in the sidebar |
| `adminOnly` | `boolean` | `false` | Visible to admins only |

---

## Generated URL

When a user clicks a nav item, the panel opens:

```
<addon-baseUrl><page.path>?token=<jwt>&lang=<lang>&theme=<dark|light>&role=<ADMIN|USER>
```

Example:
```
http://localhost:3001/admin?token=eyJ...&lang=en&theme=dark&role=ADMIN
```

---

## Read the parameters in React

```tsx
import { useSearchParams } from 'react-router-dom';

function AdminPage() {
  const [params] = useSearchParams();

  const token = params.get('token') ?? '';
  const lang  = params.get('lang')  ?? 'fr';
  const theme = params.get('theme') ?? 'dark';
  const role  = params.get('role')  ?? 'USER';

  // Apply the theme
  document.documentElement.setAttribute('data-theme', theme);

  if (!token) return <div>Sign-in required</div>;
  if (role !== 'ADMIN') return <div>Access denied</div>; // display only: verify the role server side

  return <div>Admin page</div>;
}
```

---

## Best practices

::: tip Theme
Always set `data-theme` on `<html>` to match the panel theme (dark/light).
```css
:root        { --bg: #fff; --fg: #111; }
[data-theme="dark"] { --bg: hsl(20,14%,8%); --fg: hsl(0,0%,92%); }
body         { background: var(--bg); color: var(--fg); }
```
:::

::: tip Separate pages and widgets
Keep page routes (`/`, `/admin`) separate from widget routes (`/widget/*`) in your React Router.  
Widgets have fixed heights and must not have navigation.
:::
