# Automatic backup

Add-ons can plug into the **UHQ Panel OS backup system**.  
During a backup, the panel automatically calls your add-on to collect its data.

---

## Manifest declaration

```json
"backup": {
  "exportEndpoint": "/api/backup/export",
  "importEndpoint": "/api/backup/import",
  "authHeader":     "X-Panel-Key"
}
```

| Field | Description |
|---|---|
| `exportEndpoint` | `GET` — returns the data to back up |
| `importEndpoint` | `POST` — receives the data to restore |
| `authHeader` | Auth header sent by the panel (default: `X-Panel-Key`) |

---

## Implement the endpoints

### NestJS — Export

```typescript
@Get('backup/export')
export(@Headers('x-panel-key') key: string) {
  if (!safeEqual(key, process.env.PANEL_API_KEY)) { // constant-time comparison
    throw new ForbiddenException('Invalid API key');
  }
  return {
    exportedAt: new Date().toISOString(),
    // Your data...
    items: this.myService.getAll(),
  };
}
```

### NestJS — Import

```typescript
@Post('backup/import')
import(
  @Headers('x-panel-key') key: string,
  @Body() data: { items: any[] },
) {
  if (!safeEqual(key, process.env.PANEL_API_KEY)) {
    throw new ForbiddenException('Invalid API key');
  }
  this.myService.restoreAll(data.items);
  return { success: true, restored: data.items.length };
}
```

---

## Configuration

Set `PANEL_API_KEY` in your add-on's `.env`:

```env
# Panel API key — Settings → API key
PANEL_API_KEY=your-panel-api-key
```

---

## What is backed up

During a panel backup, the JSON file contains:

```json
{
  "version": "2.0.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "data": {
    "panelUser": [...],
    "userProxy":  [...],
    "addon":      [...],           // ← add-on configs
    "addonData": {
      "<addonId>": { /* data returned by exportEndpoint */ }
    }
  }
}
```

---

## Restore

During a restore:

1. The panel restores the `addon` table (add-on configs)
2. For each add-on with an `importEndpoint`, it sends the saved data
3. The add-on restores its own data

::: info Non-blocking
If your add-on is offline during a restore, the panel carries on without error.  
The add-on's data will not be restored, but the panel will be fully functional.
:::
