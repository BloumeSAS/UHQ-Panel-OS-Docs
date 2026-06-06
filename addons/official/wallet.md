# Wallet <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**  
> Système de solde par compte proxy.

---

## Fonctionnalités

- 💳 Solde individuel par compte proxy
- ➕ Crédit / débit par l'admin
- 📊 Widget KPIs sur le Dashboard
- 📋 Widget tableau sur la page Sous-utilisateurs
- 💰 Raccourci "Mon solde" dans le dropdown topbar
- 💾 Backup automatique inclus
- 🌍 Français et anglais

---

## Installation

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
