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

## Activation en 1 clic (depuis v2.4.42, recommandé)

Orders est **déjà build dans l'image Docker du panel UHQ Panel OS**. Depuis le panel : **Extensions → Orders → Activer** — nécessite que **Wallet soit déjà activé** (bouton grisé sinon, avec l'info-bulle correspondante). Le panel démarre Orders comme processus interne et le connecte automatiquement.

---

## Installation manuelle (auto-hébergement séparé)

Alternative si vous voulez héberger Orders sur sa propre infrastructure :

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

## Paiement par carte (Stripe) et crypto (NOWPayments) — depuis v1.2.0

En plus du solde Wallet, Orders peut accepter la carte bancaire (Stripe) et la crypto (NOWPayments). Les deux sont **optionnelles, désactivées par défaut**, à activer depuis **Gestion boutique → Passerelles de paiement** (page admin) :

| Passerelle | Champs requis | Webhook à configurer chez eux |
|---|---|---|
| Stripe | Clé publiable, clé secrète, secret webhook | `<domaine de l'addon>/api/payments/stripe/webhook` — événement `checkout.session.completed` |
| NOWPayments | Clé API, clé IPN | `<domaine de l'addon>/api/payments/nowpayments/webhook` |

Une commande payée par l'une de ces passerelles reste **`pending`** (jamais débitée, jamais livrée) tant que le webhook correspondant n'a pas confirmé le paiement — le solde Wallet, lui, continue de débiter et livrer immédiatement comme avant. Aucune donnée bancaire ne transite par l'addon : le paiement est entièrement géré par Stripe/NOWPayments, seule la confirmation (webhook signé) revient ici.

::: warning Iframe
Stripe et NOWPayments refusent tous les deux d'afficher leur page de paiement dans une iframe (protection anti-clickjacking de leur côté) — le clic sur "Payer" redirige donc **tout l'onglet du navigateur**, pas seulement l'iframe de l'addon dans le panel. L'acheteur revient sur la page de la boutique une fois le paiement terminé (ou annulé).
:::

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
