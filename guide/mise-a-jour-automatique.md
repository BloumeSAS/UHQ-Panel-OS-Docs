# Mise à jour automatique

Depuis la **v2.4.83**, la page **À propos** peut mettre le panel à jour **en un clic**, avec écran de progression et **reconnexion automatique**.

::: info Comment ça marche
Un conteneur ne peut pas se reconstruire lui-même. Le bouton demande donc à votre plateforme de déploiement (**Coolify** par défaut) de reconstruire et redémarrer l'application, via son **webhook de déploiement**. Le panel affiche la progression, attend le redémarrage et recharge la page sur la nouvelle version.
:::

---

## 1. Configurer (une seule fois)

### Avec Coolify
1. Dans Coolify : **Keys & Tokens → API tokens** → créez un jeton avec le droit de **déploiement** (`deploy`), et copiez-le.
2. Ouvrez votre application → **Webhooks** → copiez l'**URL du Deploy Webhook** (de la forme `https://coolify.exemple.fr/api/v1/deploy?uuid=XXXX&force=false`).
3. Dans le panel : **Paramètres → Général → Mise à jour automatique** :
   - **URL du webhook de déploiement** : collez l'URL ;
   - **Jeton d'API (Bearer)** : collez le jeton (stocké chiffré côté affichage, jamais renvoyé en clair) ;
   - **Méthode HTTP** : `GET` (Coolify).
4. Enregistrez.

### Préconfigurations (un clic)

**Paramètres → Général → Mise à jour automatique → Plateforme de déploiement** remplit méthode, en-tête du jeton, en-têtes et corps de la requête :

| Plateforme | Méthode | Jeton | Où trouver l'URL |
|---|---|---|---|
| **Coolify** | POST | Bearer (jeton API, droit `deploy`) | Application → Webhooks → Deploy Webhook |
| **Dokploy** | POST | — | Application → Deployments → Webhook URL |
| **CapRover** | POST | dans l'URL | App → Deployment → Webhook (`triggerbuild`) |
| **Portainer** | POST | — | Stack → Webhook (redéploiement depuis Git) |
| **Watchtower** | GET | Bearer (`WATCHTOWER_HTTP_API_TOKEN`) | `http://watchtower:8080/v1/update` |
| **Render** | POST | dans l'URL | Service → Settings → Deploy Hook |
| **Railway** | POST | Bearer (jeton) | API GraphQL, remplacer `SERVICE_ID` / `ENV_ID` dans le corps |
| **Heroku** | POST | Bearer | `…/apps/NOM_APP/builds`, corps = archive GitHub du dépôt |
| **Vercel** / **Netlify** | POST | — | Deploy Hook / Build hook |
| **Pterodactyl** | POST | Bearer (clé API client) | `…/api/client/servers/ID/power` → signal `restart` |
| **Personnalisé** | au choix | au choix | tout service déclenché par URL |

Dans **Avancé** : nom de l'en-tête du jeton (`Authorization`, `X-API-Key`…), préfixe (`Bearer` ou vide), **en-têtes supplémentaires** et **corps JSON**.

::: warning Plateformes sans port TCP
Le moteur proxy écoute sur un **port TCP** (990 par défaut). Heroku, Vercel et Netlify ne publient que du HTTP : le panel web y fonctionnerait, mais pas le proxy. Pterodactyl nécessite une allocation de port et un egg qui récupère la dernière version au démarrage.
:::

### Autres plateformes
Tout service qui déclenche un déploiement par **URL** convient (Portainer webhook, Watchtower HTTP API, Dokploy, CapRover…) : renseignez son URL, la méthode (`GET` ou `POST`) et, si besoin, un jeton Bearer.

---

## 2. Mettre à jour

1. Ouvrez **À propos** : le panel vérifie automatiquement la dernière version publiée sur GitHub.
2. Si une nouvelle version existe, cliquez sur **Mettre à jour maintenant**.
3. Confirmez. Cochez **Faire une sauvegarde avant de mettre à jour** (recommandé ; disponible si les sauvegardes automatiques sont activées).
4. Un écran de progression s'affiche :

| Étape | Ce qui se passe |
|---|---|
| Mise à jour déclenchée | le webhook de la plateforme a répondu |
| Construction de la nouvelle version | 2 à 10 minutes ; **le panel reste utilisable** pendant ce temps |
| Redémarrage | environ 30 secondes d'indisponibilité |
| Reconnexion et vérification | le panel est revenu avec la nouvelle version ; la page se recharge toute seule |

Vous pouvez **recharger la page** pendant la mise à jour : le suivi reprend automatiquement.

**Masquer le suivi** : le bouton **Masquer** réduit la fenêtre en une pastille **« Mise à jour en cours… »** (spinner + temps écoulé) en bas à gauche ; un clic la rouvre. Le suivi survit même à la **fermeture de l'onglet** (retrouvé à la réouverture du panel, dans la limite d'une heure) et la fenêtre se rouvre seule en cas d'erreur, de délai dépassé ou de fin.

### Si quelque chose ne va pas
| Message | Cause probable |
|---|---|
| « La plateforme a refusé la demande (code 401/403) » | jeton absent, expiré, ou sans droit de déploiement |
| « Impossible de joindre le webhook » | URL fausse, ou la plateforme n'est pas joignable depuis le panel |
| « La version n'a pas changé » | le déploiement a échoué ou une ancienne version a redémarré : ouvrez **Coolify → Deployments** pour lire le journal de construction |
| « La mise à jour dépasse 25 minutes » | construction bloquée ou échouée (même vérification) |

Si la construction échoue, Coolify conserve l'ancienne version en service : rien n'est perdu.

---

## Sécurité
- Réservé aux **administrateurs** ; une demande par minute au maximum ; chaque mise à jour est inscrite au **journal d'audit** (version de départ, sauvegarde faite ou non, hôte du webhook).
- Seules les URL `http`/`https` sont acceptées ; l'adresse de métadonnées cloud (`169.254.x.x`) est refusée.
- Le jeton est un **secret** : il n'est jamais renvoyé en clair par l'API et n'apparaît pas dans les journaux.
- Préférez un jeton Coolify limité au déploiement plutôt qu'un jeton à tous les droits.

Voir aussi : [Mises à jour et redémarrages](/guide/mises-a-jour) et [Sauvegardes](/guide/sauvegardes).
