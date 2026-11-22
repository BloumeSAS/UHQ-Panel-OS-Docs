# Tickets <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Un **support client intégré** au panel : vos clients ouvrent des tickets, votre équipe répond depuis une console dédiée.

::: tip Aucune dépendance
Tickets fonctionne seul. Pour les e-mails de notification, configurez le SMTP du panel (**Paramètres → SMTP & e-mails**).
:::

## Ce que voient vos clients

Une page **Support** dans leur menu :

- **créer un ticket** (sujet, catégorie, priorité, compte concerné, message, pièces jointes) ;
- suivre la **conversation** avec le support, **répondre**, **fermer** le ticket ou le **rouvrir** en y répondant ;
- **noter** l'aide reçue (1 à 5 étoiles + commentaire) une fois le ticket résolu ;
- recevoir un **e-mail** à chaque réponse du support.

## Ce que fait votre équipe

Les rôles **Administrateur** et **Support** voient la **console du support** à la place de l'espace client :

| Fonction | Détail |
|---|---|
| **File d'attente** | filtres par statut, catégorie, priorité, « mes tickets », « non lus », recherche plein texte (numéro, sujet, client, contenu) |
| **Attribution** | s'attribuer un ticket, le libérer ; une réponse attribue automatiquement le ticket à son auteur |
| **Réponses types** | textes prêts à l'emploi insérables dans une réponse (création réservée aux administrateurs) |
| **Notes internes** | visibles du seul personnel, jamais du client |
| **Étiquettes, priorité, catégorie** | modifiables à tout moment ; chaque changement est tracé dans la conversation (côté personnel) |
| **Statistiques** | tickets à traiter, en attente du client, délai de première réponse (30 j), délai de résolution, satisfaction |
| **Fermeture automatique** | un ticket « résolu » sans nouvelle réponse du client est fermé après N jours (7 par défaut, 0 = jamais) |

### Statuts

| Statut | Signification |
|---|---|
| **Ouvert** | en attente d'une réponse du support |
| **Répondu** | le support a répondu, en attente du client |
| **Résolu** | traité ; fermé automatiquement après le délai réglé |
| **Fermé** | terminé ; une réponse du client le rouvre |

## Pièces jointes

PNG, JPG, WEBP, GIF, PDF et TXT, **2 Mo** par fichier, **3** par message. Le type est vérifié sur le **contenu** du fichier (un fichier renommé est refusé), le téléchargement est protégé par la session du panel et se fait toujours en **téléchargement** (jamais exécuté dans le navigateur).

## Réglages (administrateur)

**Support → Réglages** : catégories proposées, fermeture automatique, pièces jointes, e-mails client / administrateurs, nombre maximum de tickets ouverts par client, **message automatique** à la création, **signature** ajoutée aux réponses.

## E-mails

Cinq modèles modifiables dans **Paramètres → SMTP & e-mails** (groupe « Support (Tickets) ») : ticket reçu, réponse du support, ticket résolu (client) ; nouveau ticket et réponse du client (administrateurs).

## Sécurité

- Un client ne voit **que ses tickets** ; le rôle de chaque appel est **vérifié par le panel** (jamais lu dans le jeton) ;
- limites de débit : 10 nouveaux tickets et 40 réponses par heure et par client ;
- textes nettoyés (caractères de contrôle retirés), affichés en texte brut (jamais interprétés comme du HTML) ;
- les données sont incluses dans la **sauvegarde** du panel (les pièces jointes, stockées en fichiers, ne le sont pas).

## Activation

**Extensions → Tickets → Activer** (déjà inclus dans l'image du panel). Repo : [UHQ-Addon-Tickets](https://github.com/BloumeSAS/UHQ-Addon-Tickets).

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3107` | Port d'écoute |
| `PANEL_URL` / `PANEL_API_KEY` | — | Vérification des jetons, e-mails et sauvegarde |
| `DB_PATH` | `./tickets-data.json` | Fichier de données (les pièces jointes sont dans `<DB_PATH>.files/`) |
