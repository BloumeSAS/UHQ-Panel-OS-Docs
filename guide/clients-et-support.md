# Clients & support

Les outils du panel pour aider vos clients et vous dépanner vite. Tout est accessible depuis **Sous-utilisateurs** (côté admin) ou **Mes proxys** (côté client).

## Générateur de lignes de connexion

Bouton **Connexion** (icône `</>`) sur chaque compte : toutes les formes dont un client a besoin, prêtes à copier.

- `host:port:user:pass` et `user:pass@host:port`
- URL `http://user:pass@host:port`
- `curl`, Python (`requests`), Node.js, Playwright / Puppeteer
- Réglages navigateur (hôte, port, identifiants)
- Option **session** (IP conservée) ou rotation à chaque connexion

::: tip Protocole
Le moteur reçoit du **proxy HTTP** (le HTTPS passe par `CONNECT`). Il n'y a pas d'entrée SOCKS5 côté client.
:::

L'hôte et le port sont ceux du compte : port dédié du compte, sinon de sa catégorie, sinon le port global (990 par défaut). Réglez l'hôte public dans **Paramètres → Général**.

## « Pourquoi ça ne marche pas ? »

Bouton **bouée** sur chaque compte (admin) et dans **Mes proxys** (le client ne voit que ses comptes). Il affiche :

- les **problèmes actuels** du compte (expiré, bloqué, quota atteint…) ;
- les **derniers refus** avec la cause et quoi faire : mauvais mot de passe, compte bloqué, expiré, quota atteint, IP non autorisée, mauvais port (le bon port est indiqué), domaine bloqué, VPN, limite de threads, aucun proxy disponible, IP bannie.

Les admins voient aussi les **refus récents tous comptes** dans **Diagnostics**.

::: warning
Le journal est **en mémoire** (50 événements par compte) : il est vidé à chaque redémarrage du panel.
:::

## Alertes e-mail aux clients

Le panel prévient chaque client (cloche + e-mail si le SMTP est configuré) quand son compte :

- atteint **80 %** puis **100 %** du quota ;
- **expire bientôt** (3 jours) puis **a expiré**.

Chaque alerte n'est envoyée **qu'une fois** ; elle est ré-armée si l'usage repasse sous 80 % (reset du trafic, recharge). Le compte doit avoir un propriétaire (panel user) avec une adresse e-mail.
Désactivation : **Paramètres → SMTP → Alertes clients**.

## Infos de support

Bouton **Copier les infos de support** (À propos, Diagnostics, Aide) : un rapport texte prêt à coller dans un ticket — version, environnement, compteurs, résultat des diagnostics, derniers avertissements/erreurs.
**Aucun secret** : mots de passe, jetons, clés et identifiants dans les URLs sont masqués, e-mails partiellement masqués, dernier octet des IP masqué.

## Aide intégrée

Menu **Aide** : questions fréquentes avec recherche, lien vers la page concernée, relance de la visite guidée. Les pages vides (aucun compte, aucune source…) expliquent quoi faire et proposent le bon bouton ; des infobulles ⓘ expliquent les champs délicats.

## Mode démo

Sur le tableau de bord (carte « Premiers pas ») : **Charger des données de démo** crée une catégorie « Démo » et 3 comptes d'exemple avec 7 jours d'historique, pour découvrir le panel. Les comptes sont **bloqués** et leurs mots de passe aléatoires : ils ne peuvent pas servir. **Retirer la démo** supprime tout.

## « Nouveautés » après une mise à jour

À la première connexion après une mise à jour, une fenêtre résume les changements depuis la dernière version vue (5 dernières au maximum). Les admins reçoivent aussi une **notification** quand une nouvelle version sort (vérification toutes les 6 h).

## Vérifier une sauvegarde

**Paramètres → Sauvegardes → Vérifier** : analyse un fichier de sauvegarde **sans rien modifier** (champs inconnus, champs obligatoires manquants, dates invalides, doublons, références orphelines, absence d'administrateur) et indique s'il est restaurable.
