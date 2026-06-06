# Mises à jour des addons

UHQ Panel OS détecte et notifie automatiquement les nouvelles versions de vos addons.

---

## Fonctionnement

```
Cron toutes les heures (configurable)
  → Fetch GET /uhq-manifest.json pour chaque addon
  → Compare manifest.version avec lastVersion en base
  → Si différent → hasUpdate = true → badge dans le panel
```

---

## Côté addon — incrémenter la version

La seule chose à faire est d'**incrémenter `version`** dans votre manifest :

```json
{
  "name": "Mon Addon",
  "version": "1.1.0",  // ← changer ici
  ...
}
```

Lors du prochain refresh (max 1h), le panel affichera :

```
┌──────────────────────────────────────────────────┐
│ ↑ Mise à jour disponible   v1.0.0 → v1.1.0  [Mettre à jour] │
└──────────────────────────────────────────────────┘
```

---

## Forcer un refresh immédiat

Dans le panel → **Extensions** → cliquer sur **↺** (rafraîchir) sur la card de l'addon.

---

## Configurer l'intervalle du cron

Par défaut : toutes les heures. Modifiable via la variable d'environnement du panel :

```env
# api/.env — UHQ Panel OS
ADDON_REFRESH_CRON=0 * * * *      # Toutes les heures (défaut)
ADDON_REFRESH_CRON=*/30 * * * *   # Toutes les 30 minutes
ADDON_REFRESH_CRON=0 9 * * *      # Une fois par jour à 9h
```

---

## Appliquer une mise à jour

"Appliquer" une mise à jour dans le panel :
1. Enregistre `lastVersion = manifest.version`
2. Réinitialise `hasUpdate = false`
3. Le badge disparaît

::: info
"Appliquer" ne télécharge rien — le manifest est déjà rafraîchi.  
L'action confirme simplement que l'admin a pris connaissance de la nouvelle version.
:::

---

## Bonnes pratiques de versioning

Suivre le [Semantic Versioning](https://semver.org/) :

| Changement | Exemple |
|---|---|
| Correction de bug | `1.0.0` → `1.0.1` |
| Nouvelle fonctionnalité | `1.0.0` → `1.1.0` |
| Rupture de compatibilité | `1.0.0` → `2.0.0` |
| Nouvelle page / widget | `1.0.0` → `1.1.0` |

Toujours incrémenter la version quand vous modifiez :
- L'interface utilisateur
- Les pages ou widgets déclarés
- Les slots ou traductions
- L'API exposée aux utilisateurs
