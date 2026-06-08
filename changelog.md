# Changelog

## v2.0.x

### v2.0.5
- Checker : incrémentation du `failCount` à chaque vérification échouée, reset à 0 si le proxy repasse actif
- Scraper : les proxies définitivement morts (`failCount ≥ maxRetries`) ne sont plus réactivés lors du re-scraping
- Pool : colonne `Échecs`, filtre par statut (actifs / morts / définitifs), bouton de réactivation individuelle et en masse
- Settings : nouveaux paramètres `skipDeadProxies` et `deadProxyMaxRetries`
- Docker : port proxy hardcodé `990:990/tcp` (plus de variable d'expansion fragile), `PROXY_PORT` et `API_PORT` injectés explicitement
- Docs : pages `configuration`, `docker`, `api/zones`, `api/icons` créées ; `installation` mise à jour

### v2.0.4
- Fix : déplacement de la dépendance Prisma dans `dependencies` (évite le pruning en production)

### v2.0.3
- Génération automatique du JWT secret au 1er boot
- Gestion améliorée de l'environnement dans le processus de build

### v2.0.2
- Fix import `randomBytes` depuis `crypto` pour une meilleure sécurité

### v2.0.0 — Refonte majeure
- Migration complète vers NestJS 10 + React 18 + Vite
- Moteur proxy TCP intégré (remplacement de l'ancienne architecture Python)
- Système d'addons modulaires
- Panel React moderne (Tailwind + shadcn)
- Authentification JWT + clé API legacy `/api/v1/*`
- Wizard de setup au premier démarrage
- Support SMTP complet (notifications, rapports, reset mot de passe)
- Captcha (hCaptcha, reCAPTCHA, Turnstile, CAP)
- Webhooks Discord et Slack
- Sauvegardes automatiques (local + S3)
- Checker de santé des proxies avec résolution géographique réelle
- i18n panel et API (fr, en)

---

## v1.x (legacy)

Les versions 1.x utilisaient une architecture Python (FastAPI) + panel React minimal. La migration vers la v2 est une réécriture complète — les données PostgreSQL existantes sont compatibles via Prisma.
