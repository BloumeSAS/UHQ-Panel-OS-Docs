# Système d'addons

Le système d'addons permet d'**étendre UHQ Panel OS** sans modifier son code source.  
Un addon est un **microservice indépendant** qui se connecte au panel via une simple URL.

---

## Principe

```
Panel UHQ                              Addon (externe)
─────────────────────────────────      ────────────────────────────────
GET <addon-url>/uhq-manifest.json  →   Retourne la déclaration JSON
                                   ←
Panel injecte automatiquement :
  • Pages dans la sidebar nav
  • Widgets dans les pages panel
  • Items dans le dropdown topbar
  • Traductions dans le système i18n
```

**Zéro code à toucher côté panel.** Connecter une URL suffit.

---

## Ce qu'un addon peut faire

| Capacité | Description |
|---|---|
| **Pages** | Ajouter des pages pleine fenêtre dans la sidebar |
| **Widgets** | Injecter des iframes sur n'importe quelle page panel |
| **Slots topbar** | Ajouter des items dans le dropdown email/rôle en haut à droite |
| **Traductions** | Fournir ses propres clés i18n (fr, en, et plus) |
| **Backup** | Inclure ses données dans les sauvegardes du panel |
| **Mises à jour** | Notifier automatiquement quand une nouvelle version est disponible |

---

## Stack obligatoire

::: info Requis
Tout addon UHQ Panel OS **doit** être développé avec :
- **Backend** : NestJS 10+
- **Frontend** : React 18+ (Vite recommandé)
:::

Cette contrainte garantit une architecture cohérente et facilite le support.

---

## Flux complet

```
Admin entre : http://localhost:3001
           ↓
Panel fetch GET /uhq-manifest.json
           ↓
Stocke le manifest en cache (DB)
           ↓
┌─────────────────────────────────────────────┐
│  Automatiquement, sans code :               │
│                                             │
│  ✓ Items de nav générés                     │
│  ✓ Traductions fusionnées                   │
│  ✓ Widgets injectés sur les bonnes pages    │
│  ✓ Items topbar dropdown                    │
│  ✓ Inclus dans les backups                  │
└─────────────────────────────────────────────┘
```

---

## Addons officiels

| Addon | Description | Licence |
|---|---|---|
| [Wallet](/addons/official/wallet) | Système de solde par compte proxy | <span class="badge-free">✓ Gratuit</span> |
| [Orders](/addons/official/orders) | Boutique interne — commandes payées avec le solde Wallet | <span class="badge-free">✓ Gratuit</span> |

---

## Prochaine étape

→ [Démarrage rapide](/addons/getting-started) — créer votre premier addon en 10 minutes.
