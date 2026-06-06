# Backup automatique

Les addons peuvent s'intégrer dans le **système de backup d'UHQ Panel OS**.  
Lors d'une sauvegarde, le panel appelle automatiquement votre addon pour récupérer ses données.

---

## Déclaration dans le manifest

```json
"backup": {
  "exportEndpoint": "/api/backup/export",
  "importEndpoint": "/api/backup/import",
  "authHeader":     "X-Panel-Key"
}
```

| Champ | Description |
|---|---|
| `exportEndpoint` | `GET` — retourne vos données à sauvegarder |
| `importEndpoint` | `POST` — reçoit les données pour restauration |
| `authHeader` | Header d'auth envoyé par le panel (défaut : `X-Panel-Key`) |

---

## Implémenter les endpoints

### NestJS — Export

```typescript
@Get('backup/export')
export(@Headers('x-panel-key') key: string) {
  if (key !== process.env.PANEL_API_KEY) {
    throw new ForbiddenException('Clé API invalide');
  }
  return {
    exportedAt: new Date().toISOString(),
    // Vos données...
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
  if (key !== process.env.PANEL_API_KEY) {
    throw new ForbiddenException('Clé API invalide');
  }
  this.myService.restoreAll(data.items);
  return { success: true, restored: data.items.length };
}
```

---

## Configuration

Définir `PANEL_API_KEY` dans le `.env` de votre addon :

```env
# Clé API du panel — Paramètres → Clé API
PANEL_API_KEY=votre-cle-api-panel
```

---

## Ce qui est sauvegardé

Lors d'un backup panel, le fichier JSON contient :

```json
{
  "version": "2.0.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "data": {
    "panelUser": [...],
    "userProxy":  [...],
    "addon":      [...],           // ← configs des addons
    "addonData": {
      "<addonId>": { /* données retournées par exportEndpoint */ }
    }
  }
}
```

---

## Restauration

Lors d'une restauration :

1. Le panel restaure la table `addon` (configs des addons)
2. Pour chaque addon ayant un `importEndpoint`, il envoie les données sauvegardées
3. L'addon restaure ses propres données

::: info Non-bloquant
Si votre addon est hors ligne lors d'une restauration, le panel continue sans erreur.  
Les données de l'addon ne seront pas restaurées, mais le panel sera entièrement fonctionnel.
:::
