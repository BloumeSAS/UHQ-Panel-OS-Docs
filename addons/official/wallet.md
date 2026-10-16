# Wallet <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**  
> Système de solde par compte proxy.

---

## Fonctionnalités

- 💳 **Page client « Mon portefeuille »** : solde en grand, cumuls crédité/dépensé, **courbe d'évolution interactive** (7 j / 30 j / 90 j / tout), historique **filtrable** (entrées/sorties), recherche, pagination, origine de chaque opération (administrateur, achat boutique, remboursement), solde après chaque opération, **export CSV**
- ➕ **Gestion admin** : indicateurs (total, comptes approvisionnés, solde moyen, comptes à zéro), classement, recherche + filtre + tri + pagination, **fenêtre de crédit/débit** (montants rapides, motifs, aperçu du nouveau solde), historique par compte (filtres, suppression, export), export CSV des comptes
- 📊 Widget Dashboard (admin : totaux ; utilisateur : son solde)
- 💰 Raccourci « Mon solde » dans le dropdown topbar
- 💾 Backup automatique inclus
- 🌍 Français et anglais

::: warning Sécurité — mettez à jour vers la v1.3.0
Avant la 1.3.0, l'addon se contentait de **décoder** le jeton de connexion sans le vérifier : un jeton falsifié « administrateur » permettait de créditer n'importe quel wallet. Depuis la 1.3.0, **chaque appel est vérifié par le panel**, le jeton n'est lu que dans l'en-tête `Authorization`, la clé `X-Panel-Key` (appels internes, sauvegarde) est **obligatoire** et comparée à temps constant, et le fichier de données illisible n'est jamais écrasé (conservé en `*.corrupt-<date>`).
:::

---

## Activation en 1 clic (depuis v2.4.42, recommandé)

Wallet est **déjà build dans l'image Docker du panel UHQ Panel OS** (rien à déployer séparément). Depuis le panel : **Extensions → Wallet → Activer**. Le panel démarre Wallet comme un simple processus interne (pas de nouveau conteneur, pas de VPS) et le connecte automatiquement en quelques secondes. **Désactiver** l'arrête proprement.

---

## Installation manuelle (auto-hébergement séparé)

Alternative si vous voulez héberger Wallet sur sa propre infrastructure (VPS dédié, scaling indépendant du panel...) :

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Wallet
cd UHQ-Addon-Wallet
npm run install:all
cp .env.example .env
npm run build && npm start
```

Connecter dans le panel : `http://localhost:3001`

---

## Docker (Coolify)

1. Nouveau service Docker Compose → coller `docker-compose.coolify.yml`
2. Variables : `PANEL_URL`, `PANEL_API_KEY`, `DOMAIN`
3. Volume : `wallet_data` → `/app/data`
4. Connecter dans le panel : `https://wallet.domaine.com`

---

## Zones injectées

| Zone | Type | Description |
|---|---|---|
| `topbar` | Slot | "Mon solde" dans le dropdown email |
| `/` | Widget 100px | 3 KPIs : total, comptes actifs, moyenne |
| `/subusers` | Widget 340px | Tableau de tous les soldes avec actions |
| Sidebar | Page admin | "Gestion des soldes" (adminOnly) |

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port d'écoute |
| `PANEL_URL` | `http://localhost:8000` | URL du panel |
| `DB_PATH` | `./wallet-data.json` | Fichier de données |
| `PANEL_API_KEY` | *(vide)* | Clé API pour le backup |

---

## Licence

MIT — [GitHub](https://github.com/BloumeSAS/UHQ-Addon-Wallet) — © 2026 Bloume SAS
