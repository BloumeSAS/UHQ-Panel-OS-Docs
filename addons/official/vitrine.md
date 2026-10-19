# Vitrine <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Une **page d'accueil publique** pour votre panel : logo, nom, catalogue par catégorie, pays disponibles et simulateur de prix.

## Ce que ça change

Sans l'addon, un visiteur qui ouvre `https://panel.exemple.fr/` est envoyé directement sur la page de connexion. **Avec la Vitrine active**, la page `/` affiche une vitrine commerciale — **uniquement aux visiteurs non connectés**. Dès qu'un utilisateur est connecté, il retrouve son tableau de bord comme avant. `/login`, `/register` et `/status` restent accessibles.

## Activer

1. **Paramètres → Extensions → Vitrine → Activer** (ou *Addons* dans le menu).
2. *(Recommandé)* activer aussi **[Orders](./orders)** : la vitrine affiche alors vos produits par catégorie avec leurs prix.
3. Ouvrir `/` en navigation privée pour voir le résultat.

## Contenu de la page

| Section | Source des données |
|---|---|
| **En-tête** : logo et nom du site | Paramètres → Général (*Nom du site*, *Icône du panel*) |
| **Hero** et chiffres clés (catégories, pays, offres) | calculés en direct |
| **Tarifs par catégorie** : prix, Go min/max, caractéristiques, stock faible | addon **Orders** (produits actifs et en stock) |
| **Couverture** : pays disponibles, nombre de pays par catégorie | pool réel du panel (proxies fonctionnels par catégorie) |
| **Simulateur de prix** : offre, volume en Go, estimation de consommation (requêtes/jour → Go) | produits Orders |
| **Avantages**, **étapes**, **FAQ**, **contact** | textes par défaut FR/EN, modifiables |

Le thème (clair/sombre, couleur principale) suit celui du panel ; la langue suit le navigateur (FR/EN) avec un sélecteur.

::: tip Catégories
Une catégorie apparaît dans les tarifs si **au moins un produit Orders** la livre (champ *Catégorie* du produit). Sans Orders, ce sont les catégories du pool qui contiennent des proxies qui sont présentées (couverture seulement).
:::

## Régler la vitrine

Page **Vitrine** du menu (administrateurs) — chaque section se déplie d'un clic :

- **Sections affichées** : activer/masquer chaque bloc, prix, stock faible, nombre de proxies par pays ;
- **Titre et accroche** : badge, titre, fin de titre en dégradé, sous-titre, boutons ;
- **Catégories** : renommer, décrire, ordonner ou **masquer** chaque catégorie ;
- **Simulateur** : volume par défaut, poids moyen d'une requête ;
- **Avantages, étapes, FAQ** : listes personnalisées (vide = contenu par défaut) ;
- **Contact** : Discord, Telegram, e-mail, site ; texte du pied de page ;
- **SEO** : titre et description de la page.

Les changements apparaissent sous 30 secondes (cache).

## Sécurité et confidentialité

- La page et son API `/api/public` sont **publiques** : elles ne renvoient **jamais** la configuration de livraison, des identifiants, des URL de proxies ni des listes privées. Seuls des **compteurs** par catégorie et par pays sont exposés (le nombre de proxies n'est affiché que si vous l'activez) ;
- les réglages (`/api/config`) exigent un jeton **vérifié par le panel** et le rôle ADMIN ;
- les appels vers le panel (`/api/v1/vitrine/overview`) et Orders (`/api/internal/catalog`) utilisent la **clé API maître** et ne sont jamais accessibles depuis un navigateur ;
- les liens de contact n'acceptent que `https://`, `http://` et les e-mails.

## Déploiement séparé

Image Docker autonome (`ghcr.io/bloumesas/uhq-addon-vitrine`), port **3106** :

| Variable | Rôle |
|---|---|
| `PANEL_URL` | URL du panel |
| `PANEL_API_KEY` | clé API **maître** du panel |
| `ORDERS_URL` | URL de l'addon Orders (catalogue) |
| `DB_PATH` | fichier de configuration (volume `/app/data`) |

Le remplacement de la page `/` par la vitrine n'est actif que lorsque l'addon est **embarqué et activé dans le panel**.

Dépôt : [BloumeSAS/UHQ-Addon-Vitrine](https://github.com/BloumeSAS/UHQ-Addon-Vitrine)
