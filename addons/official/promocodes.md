# Codes promo <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Codes promo **100 % personnalisables** : codes cadeau, bonus de recharge et réductions boutique.

::: warning Dépendance
Nécessite l'addon **[Wallet](./wallet)**. Pour les réductions boutique et les bonus de recharge payée en ligne, l'addon **[Orders](./orders)** doit aussi être actif.
:::

## Les trois types de codes

| Type | Où le client le saisit | Effet |
|---|---|---|
| 🎁 **Code cadeau (crédit)** | page « Mon solde » (ou page Codes promo) | ajoute un montant à son solde Wallet |
| 💳 **Bonus de recharge** | page « Mon solde », lors d'une recharge | ajoute un bonus (% et/ou montant fixe) à la recharge |
| 🛒 **Réduction boutique** | panier de la boutique | réduit le total de la commande (% et/ou montant fixe) |

## Conditions (toutes facultatives)

- **Dates** de début et de fin ;
- **utilisations totales** et **par client** (un code cadeau est limité à 1 par client par défaut) ;
- **montant minimum / maximum** du panier ou de la recharge ; **nombre minimum d'articles** ;
- **plafond** de l'avantage (ex. −20 %, max 15 €) ;
- **produits ciblés ou exclus** (liste chargée depuis la boutique) ;
- **moyens de paiement** autorisés (Wallet, carte, PayPal, crypto) ;
- **première commande uniquement** ;
- **public visé** : e-mails précis, domaines d'e-mail (`@entreprise.fr`), identifiants de comptes ;
- note interne, activation/désactivation immédiate.

## Gestion

- **Création / modification / duplication**, filtres (type, statut, recherche), statistiques (crédit offert, bonus, réductions) ;
- **Génération en lot** : jusqu'à 500 codes uniques à usage unique (cartes cadeau), export CSV ;
- **Historique des utilisations** (client, référence de commande, avantage) avec export CSV ; une commande annulée **libère** son utilisation.

## Sécurité

- Tout est contrôlé **côté serveur** (le navigateur n'envoie que le texte du code) ; les appels entre addons exigent la clé API du panel ;
- l'utilisation est **consommée à la création de la commande** et rendue si elle échoue ou est annulée : deux commandes simultanées ne peuvent pas dépasser la limite ;
- les tentatives de devinette sont limitées (10 échecs / 10 min / client).

## Activation

**Extensions → Codes promo → Activer** (déjà inclus dans l'image du panel ; Wallet doit être actif). Repo : [UHQ-Addon-PromoCodes](https://github.com/BloumeSAS/UHQ-Addon-PromoCodes).

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3105` | Port d'écoute |
| `PANEL_URL` / `PANEL_API_KEY` | — | Vérification des jetons et appels internes |
| `WALLET_URL` | — | Addon Wallet (crédit des codes cadeau) |
| `DB_PATH` | `./promocodes-data.json` | Fichier de données |
