# Orders <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**  
> Boutique interne : les utilisateurs passent commande avec leur solde [Wallet](./wallet).

::: warning Dépendance requise
L'addon **Orders** nécessite l'addon **[Wallet](./wallet)** installé et joignable.  
Tant que le Wallet est indisponible, la boutique affiche un avertissement et le paiement est désactivé.
:::

---

## Fonctionnalités

- 🛍️ **Boutique cliente** : catalogue avec recherche/tri et indicateurs de stock, **panier** avec solde après commande et montant manquant, choix du moyen de paiement (Wallet, carte, crypto), **confirmation avant paiement**, accès livrés (mot de passe masqué, copie, téléchargement .txt), suivi des commandes avec frise, rafraîchissement automatique des paiements en attente, états vides explicatifs
- 🧰 **Gestion admin** : indicateurs (chiffre d'affaires, commandes à traiter, stock faible), produits (**formulaire guidé avec validation et aperçu client**, duplication, activation en un clic, stock illimité ou limité), commandes (recherche, filtres, pagination, détail, **annulation/remboursement avec explication**), état des moyens de paiement, export CSV
- ⚡ Livraison automatique d'un compte proxy du panel (catégorie, limites, expiration…), via Wallet
- 💳 Paiement par carte (Stripe), crypto (NOWPayments) et **PayPal Amis & Famille** (v1.4.0)
- 📦 **Vente au Go** (v1.5.0) : le client choisit la quantité de Go ; prix = prix du Go × quantité, avec **minimum**, **maximum** et **pas** de sélection
- 🎟️ **Codes promo** (v1.5.0, addon Codes promo) : réductions saisies dans le panier, contrôlées côté serveur
- 💳 **Recharges du solde** (v1.5.0) : l'addon Wallet s'appuie sur les passerelles d'Orders pour les recharges en ligne
- 📊 **Caractéristiques en boutique** (v1.4.0) : chaque produit livré affiche bande passante, threads, débit, validité et pays — `0` = « Illimité »
- ✅ **Validation par un admin** (v1.4.0) : option par produit
- 🔁 **Renouvellement automatique** sur solde Wallet (v1.4.0)
- 🧾 **Factures et reçus PDF** (v1.4.0)

::: warning Sécurité — mettez à jour vers la v1.3.0 (avec le Wallet)
- Les jetons sont **vérifiés par le panel** (avant : simplement décodés, donc falsifiables).
- Les clients **ne voient plus** la configuration de livraison (listes de proxies privés).
- Stock **réservé immédiatement** (plus de survente simultanée) ; annulation d'une commande payée **refusée si le Wallet est injoignable** ; transitions de statut contrôlées ; livraison partielle → comptes bloqués puis remboursement.
- Correction : la création d'un produit avec une **catégorie** échouait (`delivery.account.property pool should not exist`).
:::

---

## Vente au Go (v1.5.0)

Dans le formulaire produit, **Mode de vente → Vente au Go** (livraison « compte proxy » requise) :

- le **prix** du produit devient le **prix d'un Go** (ex. 1 Go = 1 €) ;
- **Minimum de Go**, **Maximum de Go** (vide = pas de plafond) et **pas de sélection** (1 = de Go en Go, 0,5 = par demi-Go) ;
- le client règle la quantité avec un champ, des boutons − / + et un curseur ; le prix se met à jour en direct ;
- le compte livré reçoit **exactement** la quantité commandée (et un renouvellement ajoute cette même quantité).

## Codes promo dans le panier (v1.5.0)

Avec l'addon **Codes promo**, un champ « Code promo » apparaît dans le panier. Le total remisé est recalculé **côté serveur** ; la réduction figure sur la commande et la facture. Si la commande échoue ou est annulée, l'utilisation du code est rendue. Les renouvellements se font au prix d'origine (hors code promo).

## Livraison après validation d'un admin (v1.4.0)

Dans le formulaire produit, **Livraison après paiement → Après validation admin**. Le client paie (le paiement est encaissé), la commande passe au statut **À valider** et **aucun compte proxy n'est créé** tant qu'un admin n'a pas cliqué sur **Valider et livrer** (Gestion boutique → Commandes). Annuler une commande « à valider » rembourse le Wallet.

Dans **Mes proxies** du panel, le client voit une carte « en attente de validation » (produits et quantités) **sans aucune information d'accès** — il n'y en a pas encore.

## Renouvellement automatique (v1.4.0)

1. L'admin coche **Renouvellement automatique possible** sur le produit (il faut une livraison « compte proxy » avec une **durée de validité**, en jours, mois ou années).
2. Le client l'active à l'achat ou, par compte, dans **Mes commandes** (désactivé par défaut).
3. À l'échéance, l'addon débite le **solde Wallet** (uniquement) au **prix payé à l'achat**, ajoute au compte **le nombre de Go acheté au premier paiement** et repousse l'expiration d'une période.

La configuration et le prix sont **figés à l'achat** : si le produit change ensuite, le renouvellement utilise l'ancienne configuration. Solde insuffisant : nouvelle tentative automatique pendant **72 h**, puis abandon (le client peut le réactiver). Si le panel refuse la mise à jour, le montant est recrédité immédiatement. Chaque renouvellement crée son propre encaissement (et sa facture).

## PayPal « Amis & Famille » (v1.4.0)

Dans **Paramètres → Extensions → Boutique** : activez PayPal, renseignez l'**e-mail PayPal** qui reçoit les paiements et le **délai de paiement** (24 h par défaut ; une commande non payée est annulée et son stock rendu).

1. Dans votre compte PayPal, activez les **IPN** (Paramètres → Notifications → Notifications instantanées de paiement) avec l'URL affichée dans le panel : `https://<votre-panel>/addon-proxy/orders/api/payments/paypal/ipn`.
2. Le client choisit PayPal : l'écran lui indique l'e-mail, le **montant exact** et une **note unique** (`UHQ-XXXXXXXXXX`) à coller dans le message.
3. À réception, PayPal notifie l'IPN. Chaque notification est **renvoyée à PayPal pour vérification** avant d'être prise en compte. La commande est confirmée seulement si : paiement terminé, bon destinataire, bonne devise, montant ≥ au total, **sans protection vendeur** (donc Amis & Famille, pas « Biens et services »), transaction jamais vue et note connue.

Un paiement refusé, arrivé après annulation, remboursé ou contesté est signalé sur la commande (bandeau rouge) : l'addon ne décide jamais seul.

## Factures et reçus PDF (v1.4.0)

**Paramètres → Extensions → Factures et reçus PDF** : activation, identité de l'entreprise (nom, forme juridique, SIRET, TVA, adresse, contact), logo (PNG/JPEG ≤ 280 Ko), couleur, titre, pied de page, conditions de paiement, **numérotation** (préfixe, année, chiffres, prochain numéro — attribuée au paiement, sans trou ni réutilisation), **TVA** (taux, prix TTC ou HT, mention d'exonération à 0 %) et aperçu du reçu / de la facture.

Les clients ayant payé téléchargent dans **Mes commandes** un **reçu** (toujours) et une **facture** (si activée), un par achat et par renouvellement ; ils peuvent saisir leurs **coordonnées de facturation** (facultatif). Le total est toujours celui réellement encaissé.

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
| `PAYPAL_IPN_URL` | *(PayPal)* | Tests uniquement : faux serveur de vérification IPN |

---

## Licence

MIT — [GitHub](https://github.com/BloumeSAS/UHQ-Addon-Orders) — © 2026 Bloume SAS
