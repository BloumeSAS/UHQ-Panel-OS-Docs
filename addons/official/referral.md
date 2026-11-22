# Parrainage <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Vos clients **parrainent** leurs amis et gagnent du **solde** à chaque commande de leurs filleuls.

::: warning Dépendances
Nécessite les addons **[Wallet](./wallet)** (versement des gains) et **[Orders](./orders)** (suivi des commandes). La version **Orders 1.6** (ou plus récente) est requise.
:::

## 🎬 Vidéo

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/15SLX4HXQwE" title="Addon Parrainage — installation, test et aperçu" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Vidéo : installation, test et aperçu — [la regarder sur YouTube](https://youtu.be/15SLX4HXQwE).

## Comment ça marche

1. Chaque client a un **code** et un **lien** de parrainage personnels (page **Parrainage**).
2. Un ami suit le lien (`…/addon-proxy/referral/r/CODE`), crée son compte ; le code est **appliqué automatiquement** à sa première visite de la page Parrainage. Il peut aussi **saisir un code à la main**.
3. À chaque commande payée du filleul, une **commission** est calculée.
4. Après le **délai de protection** (7 jours par défaut), elle est **versée automatiquement** sur le solde Wallet du parrain.

## Réglages (administrateur)

| Réglage | Rôle |
|---|---|
| Commission en % | part du total de la commande (défaut 10 %) |
| Commission fixe | montant ajouté à chaque commande |
| Commandes concernées | **boutique**, **recharges du solde** ou les deux |
| Commande minimum | en dessous, pas de commission |
| Commissions max par filleul | limiter aux N premières commandes (0 = illimité) |
| Gains max par parrain | plafond total (0 = illimité) |
| **Délai avant versement** | protège des annulations / remboursements (0 = immédiat) |
| **Bonus de bienvenue** | montant versé au filleul à sa première commande éligible |
| Code personnalisable | le parrain choisit son code (4 à 20 caractères) |
| Clients existants | autoriser ceux qui ont déjà commandé (par défaut : **nouveaux clients seulement**) |
| URL publique du panel | pour le lien de parrainage hors mode embarqué |

## Ce que voit le client

Son code et son lien, le nombre de filleuls, les commandes récompensées, les gains **en attente** et **déjà versés**, la liste de ses filleuls (e-mails **masqués** : `ma***@exemple.fr`) et l'historique de ses gains.

## Suivi administrateur

- **Aperçu** : parrains actifs, filleuls, gains en attente / versés, meilleurs parrains, état de la synchronisation ;
- **Parrainages** : liste, **rattachement manuel** d'un filleul à un parrain, retrait ;
- **Gains** : toutes les commissions et bonus, avec **versement immédiat**, **annulation** ou, pour un versement incertain, **réessayer / marquer comme versé** ;
- chaque annulation de commande **annule les gains encore en attente** ; si le gain était déjà versé, il est **signalé** pour examen.

## Sécurité et anti-abus

- impossible d'utiliser **son propre code** ou de former une **boucle** (A parraine B, B parraine A) ;
- le parrainage est réservé aux **nouveaux clients** (aucune commande payée) tant que vous n'autorisez pas les clients existants ;
- le **délai de protection** laisse le temps aux annulations ;
- les montants sont calculés **côté serveur** à partir des commandes lues dans Orders (lecture seule, clé API du panel) ;
- un versement n'est **jamais rejoué** automatiquement : si le Wallet n'a pas répondu de façon certaine, l'entrée passe en **« À vérifier »** pour que vous contrôliez le solde avant de réessayer.

## E-mails

Trois modèles (groupe « Parrainage » dans **Paramètres → SMTP & e-mails**) : nouveau filleul, commission versée (parrain), bonus de bienvenue (filleul).

## Activation

**Extensions → Parrainage → Activer** (Wallet et Orders doivent être actifs). Repo : [UHQ-Addon-Referral](https://github.com/BloumeSAS/UHQ-Addon-Referral).

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3108` | Port d'écoute |
| `PANEL_URL` / `PANEL_API_KEY` | — | Vérification des jetons, e-mails et appels internes |
| `WALLET_URL` | — | Addon Wallet (versement des gains) |
| `ORDERS_URL` | — | Addon Orders (flux de commandes) |
| `DB_PATH` | `./referral-data.json` | Fichier de données |

::: tip Intégrer le parrainage à votre inscription
L'API interne `POST /api/internal/claim` (en-tête `X-Panel-Key`, corps `{ "user_id", "user_email", "code" }`) rattache un client à un parrain depuis un autre outil.
:::
