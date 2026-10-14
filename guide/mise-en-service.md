# Mise en service

Avant d'ouvrir le panel à vos clients, le panel vous aide à vérifier que tout est prêt : **checklist « Premiers pas »**, **diagnostic**, **test de connexion**, **page d'état publique** et **protection de l'installation**.

---

## Checklist « Premiers pas »

En haut du **tableau de bord** (administrateurs), une carte coche toute seule les étapes de mise en service :

| Étape | Elle est cochée quand… |
|---|---|
| Hôte public du proxy | un domaine ou une IP personnalisés sont renseignés (Paramètres → Moteur proxy) |
| Pool de proxies | au moins un proxy ou une source de scraping existe |
| Catégorie | au moins une catégorie existe |
| Compte proxy | au moins un compte existe |
| Test de connexion | un test de compte a réussi (voir plus bas) |
| Sauvegardes | les sauvegardes automatiques sont activées |
| 2FA | un administrateur a activé la 2FA, ou elle est exigée pour tous |

Chaque étape non faite a un lien **Y aller** vers la bonne page. La carte se masque d'un clic ; elle se rafraîchit toute seule.

### Bandeau « Aucune sauvegarde »
Tant que les sauvegardes automatiques sont désactivées, un **bandeau rouge** s'affiche sur le tableau de bord. « Plus tard » le masque 24 heures. Voir [Sauvegardes et restauration](/guide/sauvegardes).

---

## Diagnostic

Menu **Système → Diagnostic** : une série de vérifications automatiques, chacune avec un état (OK / À surveiller / Problème / Info) et une explication de ce qu'il faut corriger.

| Vérification | Ce qu'elle contrôle |
|---|---|
| Moteur proxy | le moteur écoute bien sur son port (990 par défaut) |
| Base de données | connexion et temps de réponse |
| Hôte public | un hôte personnalisé est défini |
| **Domaine (DNS)** | le domaine se résout ; il pointe sur **ce serveur** ; il **ne passe pas par Cloudflare** (nuage orange), qui ne transmet pas le trafic proxy TCP |
| Port proxy public | `hôte:port` est joignable *depuis le serveur* |
| Panel en HTTPS | le panel est servi en HTTPS |
| Pool | au moins un proxy fonctionnel |
| Espace disque | espace libre (alerte sous 5 Go, critique sous 1 Go) |
| Sauvegardes | activées, et dernière sauvegarde récente (moins de 48 h) |
| 2FA, captcha, e-mail | état de la sécurité et des communications |
| URL du panel | les liens des e-mails pointent au bon endroit |

::: warning Le test de port part du serveur lui-même
Il peut signaler à tort un échec derrière certains réseaux (NAT/hairpin). Vérifiez aussi depuis un autre appareil : `curl -x http://identifiant:motdepasse@VOTRE_HOTE:990 http://ip-api.com`.
:::

---

## Tester une connexion

Dans **Comptes proxy**, l'icône **Tester la connexion** (prise) fait une **vraie requête** via le moteur avec les identifiants du compte, et affiche :
- l'**IP de sortie**, le **pays** et l'**opérateur** ;
- la **latence**.

En cas d'échec, le panel explique la cause : identifiants refusés, compte bloqué/expiré/quota atteint, trop de connexions, aucun proxy amont disponible, délai dépassé, moteur arrêté.

Quelques octets de trafic sont comptés sur le compte testé. Le test part de `127.0.0.1` : un compte limité à certaines **IP autorisées** sera refusé.

---

## Page d'état publique

**Paramètres → Général → Page d'état publique** (désactivée par défaut). Une fois activée, `https://votre-panel/status` est accessible **sans connexion** et indique si le service fonctionne :

| État | Condition |
|---|---|
| **Opérationnel** | base, moteur et pool fonctionnent |
| **Dégradé** | base et moteur fonctionnent, mais plus aucun proxy fonctionnel |
| **Panne** | base ou moteur indisponible |

Vous pouvez y ajouter un **message** (maintenance, incident en cours…). La page n'expose **aucun chiffre ni détail interne**, seulement des états.

---

## Protéger l'installation (`SETUP_TOKEN`)

Tant que l'installation n'est pas terminée, la page `/setup` est ouverte : le premier qui y accède devient administrateur. Sur un serveur exposé à Internet, protégez-la avec un **jeton** :

```yaml
# docker-compose.yml / variables d'environnement Coolify
SETUP_TOKEN: "choisissez-un-jeton-secret"
```

Les écrans d'installation (base de données, création du compte administrateur, restauration) affichent alors un champ **Jeton d'installation** à remplir. Sans le bon jeton, le serveur répond « 401 ». Sans la variable, rien ne change. Le jeton n'est plus utilisé une fois l'installation terminée.

---

## URL publique du panel (liens des e-mails)

Les e-mails de **réinitialisation de mot de passe** et d'**invitation** contiennent un lien vers le panel. Il est construit **uniquement depuis la configuration** (jamais depuis l'en-tête `Host` de la requête, pour éviter le détournement de liens).

- **Paramètres → Général → URL publique du panel** : à renseigner (`https://panel.exemple.fr`) si le panel et le proxy n'ont **pas le même domaine** — typiquement quand le domaine du proxy est en « DNS seul » (nuage gris) et ne sert pas le panel.
- Si le champ est vide, le panel utilise `https://<hôte public du proxy>`.
- Tant que l'hôte public est encore la **valeur par défaut du produit**, **aucun** e-mail avec lien n'est envoyé (le jeton partirait vers un domaine qui n'est pas le vôtre) : renseignez d'abord votre domaine.

---

## Protections contre les abus

| Route | Limite |
|---|---|
| Connexion | 5 essais / minute pour un même couple IP + e-mail, 20 / minute par IP |
| Inscription | 5 / minute par IP |
| Mot de passe oublié | 5 / minute par IP |
| Réinitialisation de mot de passe | 10 / minute par IP |

Ajoutez un **captcha** (Paramètres → Captcha) si les inscriptions sont ouvertes, et exigez la **2FA** pour les administrateurs (Paramètres → Sécurité).
