# Add-on updates

UHQ Panel OS automatically detects and notifies new versions of your add-ons.

---

## How it works

```
Cron every hour (configurable)
  → Fetch GET /uhq-manifest.json for each add-on
  → Compare manifest.version with lastVersion in the database
  → If different → hasUpdate = true → badge in the panel
```

---

## Add-on side — bump the version

The only thing to do is **bump `version`** in your manifest:

```json
{
  "name": "My Add-on",
  "version": "1.1.0",  // ← change here
  ...
}
```

On the next refresh (1 h max), the panel shows:

```
┌──────────────────────────────────────────────────┐
│ ↑ Update available   v1.0.0 → v1.1.0  [Update]  │
└──────────────────────────────────────────────────┘
```

---

## Force an immediate refresh

In the panel → **Extensions** → click **↺** (refresh) on the add-on card.

---

## Configure the cron interval

Default: every hour. Change it with the panel environment variable:

```env
# api/.env — UHQ Panel OS
ADDON_REFRESH_CRON=0 * * * *      # Every hour (default)
ADDON_REFRESH_CRON=*/30 * * * *   # Every 30 minutes
ADDON_REFRESH_CRON=0 9 * * *      # Once a day at 9 am
```

---

## Apply an update

"Applying" an update in the panel:
1. Saves `lastVersion = manifest.version`
2. Resets `hasUpdate = false`
3. The badge disappears

::: info
"Apply" downloads nothing — the manifest is already refreshed.  
The action simply confirms that the admin has seen the new version.
:::

---

## Versioning best practices

Follow [Semantic Versioning](https://semver.org/):

| Change | Example |
|---|---|
| Bug fix | `1.0.0` → `1.0.1` |
| New feature | `1.0.0` → `1.1.0` |
| Breaking change | `1.0.0` → `2.0.0` |
| New page / widget | `1.0.0` → `1.1.0` |

Always bump the version when you change:
- The user interface
- Declared pages or widgets
- Slots or translations
- The API exposed to users
