# Orders <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**  
> Boutique interne : les utilisateurs passent commande avec leur solde [Wallet](./wallet).

::: warning Dépendance requise
L'addon **Orders** nécessite l'addon **[Wallet](./wallet)** installé et joignable.  
Tant que le Wallet est indisponible, la boutique affiche un avertissement et le paiement est désactivé.
:::

---

## Fonctionnalités

- 🛍️ Catalogue de produits (CRUD admin : nom, description, prix, stock, actif/inactif)
- 💳 Paiement avec le solde Wallet (débit automatique à la commande)
- 📦 Gestion du stock (décrémenté à la commande, illimité si non renseigné)
- 🧾 Suivi des commandes (payée / honorée / annulée) — l'annulation rembourse automatiquement
- 📊 Widget KPIs sur le Dashboard
- 🛒 Raccourci « Boutique » dans le dropdown topbar
- 💾 Backup automatique inclus (produits + commandes)
- 🌍 Français et anglais

---

## Installation

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Orders
cd UHQ-Addon-Orders
npm run install:all
cp .env.example .env   # renseigner WALLET_URL (et PANEL_API_KEY)
npm run build && npm start
```

Connecter dans le panel : **Extensions → `http://localhost:3002`**

---

## Intégration Wallet — zero-config

Les deux addons s'authentifient mutuellement via `PANEL_API_KEY` — la même clé déjà utilisée pour le backup. **Aucun token admin à configurer.**

```
[Orders]  POST /api/wallet/internal/add
          Header: X-Panel-Key: <PANEL_API_KEY>
                                    ↓
                             [Wallet] vérifie la clé
                             et débite / crédite le wallet
```

Il suffit que les deux addons partagent le même `PANEL_API_KEY`.

---

## Docker (Coolify)

1. Nouveau service Docker Compose → coller `docker-compose.coolify.yml`
2. Variables : `PANEL_URL`, `PANEL_API_KEY`, `WALLET_URL`, `DOMAIN`
3. Volume : `orders_data` → `/app/data`
4. Connecter dans le panel : `https://orders.domaine.com`

---

## Zones injectées

| Zone | Type | Description |
|---|---|---|
| `topbar` | Slot | « Boutique » dans le dropdown |
| `/` | Widget 100px | 3 KPIs : commandes, chiffre d'affaires, produits actifs |
| `/` | Page | Boutique utilisateur (catalogue + mes commandes) |
| Sidebar | Page admin | « Gestion boutique » (adminOnly) — produits + commandes |

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3002` | Port d'écoute |
| `PANEL_URL` | `http://localhost:8000` | URL du panel |
| `DB_PATH` | `./orders-data.json` | Fichier de données |
| `PANEL_API_KEY` | *(vide)* | Clé API du panel (backup + auth inter-addon Wallet) |
| `WALLET_URL` | `http://localhost:3001` | URL de l'addon Wallet |

---

## Licence

MIT — [GitHub](https://github.com/BloumeSAS/UHQ-Addon-Orders) — © 2026 Bloume SAS
