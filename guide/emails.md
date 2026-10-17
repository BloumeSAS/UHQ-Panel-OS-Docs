# E-mails & modèles

**Paramètres → SMTP & e-mails** : après avoir renseigné votre serveur SMTP, le panel envoie des e-mails pour **tout** : inscription, mot de passe, sécurité, alertes système, alertes clients, et ceux des addons (boutique, solde, codes promo).

## Un interrupteur, un aperçu, un test par e-mail

Chaque modèle de la liste a :

| Bouton | Rôle |
|---|---|
| 👁 **Aperçu** | rendu exact (en-tête, texte, pied de page) avec des valeurs d'exemple, en français ou en anglais |
| ✏️ **Modifier** | sujet et texte, par langue, avec **aperçu en direct** et **variables cliquables** ; « Rétablir le texte par défaut » |
| ✈️ **Envoyer un test** | envoie le modèle (valeurs d'exemple) à l'adresse de votre choix, même s'il est désactivé |
| ⏻ **Interrupteur** | active ou coupe cet envoi |

Les modèles sont rangés par groupe : **Compte**, **Sécurité**, **Administration**, **Clients**, **Boutique (Orders)**, **Solde (Wallet)** et **Codes promo**.

| Modèle | Destinataire | Par défaut |
|---|---|---|
| Bienvenue (inscription) | nouvel utilisateur | désactivé |
| Réinitialisation du mot de passe | utilisateur | activé |
| Mot de passe modifié | utilisateur | activé |
| Invitation | invité | activé |
| Notification de connexion | utilisateur | désactivé (très fréquent) |
| Connexion depuis une IP inconnue | utilisateur | activé |
| Code de récupération 2FA utilisé · 2FA activée/désactivée | utilisateur | activé |
| Alertes système | administrateurs | activé |
| Rapport automatique | e-mail de rapport | selon « Rapports automatiques » |
| Alertes clients (quota, expiration) | client | selon « Alertes clients » |
| Commande confirmée / en validation / validée / annulée | client | activé |
| Renouvellement effectué / impossible | client | activé |
| Nouvelle commande | administrateurs | activé |
| Solde rechargé | client | activé |
| Code promo appliqué | client | activé |

## En-tête et pied de page communs

Tous les e-mails (même ceux qui ne sont pas des « modèles ») partagent le même habillage :

- **En-tête** : le **logo du site** (Paramètres → Général → Icône) et le **nom du site** sont repris automatiquement — rien à configurer en plus ;
- **Sous-titre** facultatif sous le nom du site ;
- **Pied de page** facultatif (support, mentions légales, adresse…) ;
- la mention **« UHQ Panel OS by Bloume.fr »** reste toujours affichée, en petit, en bas de chaque e-mail.

::: tip Le logo n'apparaît pas ?
Les logos relatifs (`/static/logo.png`) sont complétés avec l'adresse de votre panel : renseignez **Paramètres → Général → URL du panel** (ou votre domaine public). Les logos en `data:` ne sont pas affichés par les messageries.
:::

## Syntaxe du texte

Le texte est volontairement simple et **toujours échappé** (jamais de HTML libre) :

| Écrire | Résultat |
|---|---|
| ligne vide | nouveau paragraphe |
| `**gras**` | **gras** |
| `[[Libellé|{lien}]]` | bouton (liens `http`/`https` uniquement) |
| `{variable}` | valeur insérée (la liste des variables de chaque modèle est affichée dans l'éditeur) |

## Pour les développeurs d'addons

Un addon envoie un e-mail via l'API du panel (clé API, en-tête `X-API-Key`) :

```http
POST /api/v1/mail/send
{ "template": "orders.order-paid", "to": "client@exemple.fr", "vars": { "orderId": "#C1A6CFCF", "total": "10,00 €" } }
```

- seuls les modèles marqués « addon » sont autorisés ; les variables inconnues sont ignorées ;
- le destinataire doit être **un utilisateur existant du panel** (pas de relais de spam) ; `"to": "admins"` pour les modèles destinés aux administrateurs ;
- le texte, l'activation et l'habillage restent gérés par l'admin dans les paramètres.
