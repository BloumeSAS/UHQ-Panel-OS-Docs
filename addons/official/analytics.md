# Analytics <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**  
> Analyse complète du panel : comptes, catégories, pool, checker, scraper, sécurité — et **quand** vos comptes sont utilisés.

---

## Fonctionnalités

- 📊 **8 sections d'analyse** et **plus de 70 graphiques** : vue d'ensemble, activité, comptes, catégories, pool de proxies, checker, scraper, sécurité
- 📈 Comparaison avec la période précédente, trafic cumulé, **chronologie heure par heure**, répartition des comptes par volume et par quota, plus fortes hausses et baisses, concentration par domaine
- 🕒 **Heures et jours les plus actifs** : heure de pointe, jour le plus actif, fenêtre la plus calme (idéale pour une maintenance), carte de chaleur jour × heure — global, par catégorie ou par compte
- 🔎 **Constats automatiques** : tendance, pics anormaux, quotas proches, catégorie sans proxy fonctionnel, checker ou scraper bloqués, bannissements en hausse…
- 👤 **« Mon activité »** pour chaque utilisateur, limitée à ses propres comptes
- 📈 Widget de tableau de bord (trafic du jour, connexions en direct, heure de pointe)
- 📤 Export CSV des comptes
- 🌍 Français / anglais, thème clair/sombre, couleurs du panel reprises

---

## Prérequis

UHQ Panel OS **2.4.72 ou plus** : c'est le panel qui calcule les statistiques (`/api/panel/analytics/*`) et qui enregistre l'historique **horaire** de consommation ainsi que l'historique des cycles checker/scraper.

::: tip Données horaires
L'historique horaire se constitue **à partir de la mise à jour du panel**. Les heures de pointe apparaissent donc au fil de l'activité ; les jours de la semaine et la tendance journalière couvrent déjà tout l'historique. La rétention par défaut est de 90 jours (réglages `usageHourlyRetentionDays` et `jobRunRetentionDays`).
:::

---

## Activation en 1 clic (recommandé)

Analytics est **déjà build dans l'image Docker du panel**. Depuis le panel : **Extensions → Analytics → Activer**. Le panel le démarre comme un processus interne et le connecte automatiquement. **Désactiver** l'arrête proprement.

---

## Installation manuelle (auto-hébergement séparé)

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Analytics
cd UHQ-Addon-Analytics
npm run install:all
cp .env.example .env
npm run build && npm start
```

Connecter dans le panel : `http://localhost:3001`

---

## Zones injectées

| Zone | Type | Description |
|---|---|---|
| Sidebar | Page | « Mon activité » (tous les utilisateurs) |
| Sidebar | Page admin | « Analyse » (adminOnly) |
| `/` | Widget 100px | Trafic du jour, connexions en direct, heure de pointe |

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port d'écoute |
| `PANEL_URL` | `http://localhost:8000` | URL du panel |
| `CACHE_TTL_SECONDS` | `20` | Cache mémoire des réponses du panel |

---

## Sécurité

L'addon ne stocke rien : chaque appel relaie l'API du panel avec le JWT de l'utilisateur, et le panel applique les rôles. Les statistiques globales sont réservées aux rôles **ADMIN** et **SUPPORT** ; un utilisateur simple ne voit que ses propres comptes.

---

## API du panel utilisée

| Route | Rôle | Contenu |
|---|---|---|
| `GET /api/panel/analytics/overview` | ADMIN, SUPPORT | Indicateurs globaux et classements |
| `GET /api/panel/analytics/accounts` · `/:id` | ADMIN, SUPPORT | Liste filtrable et détail d'un compte |
| `GET /api/panel/analytics/activity` | ADMIN, SUPPORT | Heures, jours, carte de chaleur |
| `GET /api/panel/analytics/categories` · `/pool` · `/checker` · `/scraper` · `/security` | ADMIN, SUPPORT | Sections dédiées |
| `GET /api/panel/me/proxies/:id/activity` | propriétaire | Activité de l'un de ses comptes |

Paramètres : `days` (1-365), `tz` (fuseau IANA, ex. `Europe/Paris`).
