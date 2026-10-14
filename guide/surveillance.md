# Surveillance et alertes

Depuis la **v2.4.85**, le panel surveille lui-même le serveur et vous prévient **avant** que vos clients ne s'en plaignent.

---

## Ce qui est surveillé

Toutes les minutes (après un délai de démarrage de 90 secondes) :

| Vérification | Alerte quand… | Gravité |
|---|---|---|
| **Moteur proxy** | il ne répond plus sur son port (990 par défaut) | critique |
| **Base de données** | elle ne répond plus (délai de 5 s) | critique |
| **Disque** | moins de 2 Go libres (critique sous 500 Mo) | avertissement / critique |
| **Sauvegardes** | elles sont activées mais la dernière a plus de 48 h | avertissement |
| **Sauvegarde planifiée** | une sauvegarde automatique **échoue** (alerte immédiate) | critique |
| **Pool de proxies** | la santé du pool passe sous le seuil (existant) | avertissement |

Règles anti-bruit : une alerte n'est envoyée qu'après **2 échecs consécutifs** (≈ 2 minutes), **rappelée toutes les 6 heures** tant que le problème dure, et suivie d'un message **« Rétabli »** quand tout revient.

## Où arrivent les alertes
- la **cloche** du panel (si la base fonctionne) ;
- **Discord, Slack, BloumeChat** (Paramètres → Webhooks, avec les interrupteurs de chaque canal) ;
- l'**e-mail de tous les administrateurs**, si le SMTP est configuré.

Réglage : **Paramètres → Webhooks → Surveillance du serveur** (activée par défaut). La page **Diagnostic** signale s'il n'y a aucun canal externe configuré.

---

## Heartbeat externe : si le panel entier tombe

Un panel qui est tombé ne peut pas vous prévenir lui-même. Pour ce cas, configurez un **heartbeat** (Paramètres → Webhooks → *Heartbeat externe*) :

1. Créez un moniteur de type « heartbeat / cron » sur un service externe (**Healthchecks.io**, **UptimeRobot**, **Better Stack**…), période 1 minute, tolérance 3 à 5 minutes.
2. Collez l'URL de ping dans le panel.

Le panel appelle cette URL **chaque minute, tant que le moteur et la base fonctionnent**. S'il cesse (panne, serveur éteint, base perdue), c'est le **service externe** qui vous envoie l'alerte (e-mail, SMS, Telegram…).

::: tip Recommandé
Même sans autre canal, un heartbeat suffit pour être prévenu de toute panne grave.
:::

---

## Tableau de bord « en direct »

Le tableau de bord affiche un indicateur à côté du titre :

| Indicateur | Signification |
|---|---|
| 🟢 **En direct · 0 s** | flux temps réel actif ; l'âge indique le délai depuis la dernière mise à jour |
| ⚪ **Reconnexion…** | le flux est interrompu ou figé (plus de message depuis 7 s) : reconnexion automatique |
| 🟠 **Actualisation toutes les 3 s** | WebSocket indisponible (proxy ou pare-feu qui les bloque ?) : mode de secours par HTTP |

**Cohérence** : threads actifs, sessions, comptes actifs, proxies utilisés, pool et consommation du jour viennent désormais **du même instantané serveur** (même instant, même calcul), rafraîchi toutes les 2 secondes. Le nombre de threads d'une carte est toujours égal à la somme des comptes listés. La consommation du jour inclut les octets déjà comptés mais pas encore écrits en base.

Le flux WebSocket est réservé aux **administrateurs et au support**.

---

## Durcissement du moteur proxy (v2.4.85)

| Protection | Effet |
|---|---|
| **Limite de connexions non authentifiées par IP** | 40 maximum ; au-delà, les connexions sont fermées (protège les descripteurs de fichiers) |
| **En-têtes bornés avant authentification** | 100 lignes, 32 Ko et 15 s maximum par connexion (anti-slowloris) |
| **Amont interdit** | un proxy du pool **partagé** qui pointe vers le serveur lui-même, le réseau Docker ou l'endpoint de métadonnées cloud est refusé et retiré de la rotation. Loopback et lien-local : toujours. Réseaux privés (RFC 1918) : refusés par défaut — variable `ALLOW_PRIVATE_UPSTREAMS=true` pour les autoriser. Les listes privées de compte et le proxy de secours ne sont pas concernés |
| **Test de connexion** | les connexions venant du serveur lui-même ne sont jamais auto-bannies |

::: warning Proxies amont sur réseau privé
Si votre pool partagé contient volontairement des proxies sur une adresse privée (ex. une passerelle sur votre réseau local), ajoutez `ALLOW_PRIVATE_UPSTREAMS=true`. Sinon ils seront marqués hors service après la mise à jour.
:::
