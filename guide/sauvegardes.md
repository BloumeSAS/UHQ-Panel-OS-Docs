# Sauvegardes et restauration

Toute la configuration et les données du panel (comptes, proxies, réglages, historique) sont dans la base PostgreSQL. Il y a donc trois choses à connaître : **sauvegarder**, **restaurer sur une installation vierge**, et **importer seulement les réglages**.

---

## 1. Sauvegardes automatiques

**Paramètres → Sauvegardes** : activez les sauvegardes automatiques, choisissez la fréquence (expression cron, par défaut tous les jours à minuit) et le stockage :

| Stockage | Détail |
|---|---|
| **Local** | Dossier du conteneur (par défaut `./data/backups`) — **monté sur un volume persistant**, sinon les sauvegardes disparaissent avec le conteneur. |
| **S3-compatible** | Endpoint, région, bucket, clés d'accès (AWS, Backblaze, MinIO, Cloudflare R2…). Recommandé : la sauvegarde survit à la perte du serveur. |

Vous pouvez aussi lancer une sauvegarde **à la main** (bouton « Lancer une sauvegarde ») et télécharger les fichiers `backup-db-….json`.

::: tip À faire dès l'installation
Activez les sauvegardes S3 **avant** d'avoir des clients : c'est ce qui permet de tout retrouver si le VPS est réinitialisé.
:::

---

## 2. Restaurer sur une installation vierge (`/setup`)

Si le serveur a été réinitialisé, ou si vous migrez vers un nouveau VPS, ouvrez la page `/setup` d'une installation **vierge** : l'onglet **« Restaurer une sauvegarde »** accepte deux types de fichiers.

| Fichier | D'où il vient |
|---|---|
| **`backup-db-….json`** | Sauvegarde du panel (automatique ou manuelle, voir ci-dessus). |
| **`.tar.gz` PostgreSQL 16** | Export brut du **dossier de données PostgreSQL** (PGDATA), par exemple l'export d'un volume Docker/Coolify. Même pris « à chaud ». |

Déroulé :
1. Configurez d'abord la base (écran « Base de données »), puis ouvrez `/setup`.
2. Choisissez l'onglet **Restaurer une sauvegarde** et sélectionnez votre fichier.
3. Le fichier est envoyé par morceaux de 8 Mo (compatible Cloudflare/Traefik, reprise automatique en cas de coupure), puis la restauration s'exécute avec un suivi des étapes.
4. Le panel redémarre tout seul sur la page de connexion : connectez-vous avec vos **anciens comptes**.

### Garanties et limites
- **Tout ou rien** : la restauration se fait en une seule transaction ; en cas d'échec, la base cible n'est pas modifiée.
- **Le schéma est mis à jour** vers la version du panel installée.
- **Verrouillé après l'installation** : dès qu'un administrateur existe, la restauration depuis `/setup` répond « 403 ». Faites-la **juste après le déploiement**.
- **`.tar.gz`** : PostgreSQL **16 uniquement**, et environ **3 fois la taille du fichier** d'espace disque libre.
- **`.json`** : jusqu'à environ 400 Mo.
- Le fichier envoyé n'est jamais conservé : il est supprimé après traitement.

::: warning Restauration depuis Paramètres → Sauvegardes
Le bouton **Restaurer** de la liste des sauvegardes **remplace tout** ce que contient le fichier (comptes, proxies, réglages…) sur un panel déjà installé. Ne l'utilisez que si c'est ce que vous voulez.
:::

---

## 3. Importer seulement les réglages

Pour récupérer les réglages sans toucher aux comptes ni aux proxies, deux boutons existent :

| Où | Bouton |
|---|---|
| **Paramètres → Sauvegardes** | **Importer les paramètres** |
| **Paramètres → Général** | **Import / export de la configuration** |

Ils acceptent :
- un fichier **plat** `{ "siteName": "…", "defaultLang": "fr" }` ;
- l'export de configuration du panel ;
- une sauvegarde complète `backup-db-….json` (seuls les réglages sont lus), dans la limite de 25 Mo : au-delà, extrayez-en d'abord la partie `data.setting`.

Tous les réglages connus sont importés, **secrets (SMTP, S3, Groq, captcha) et clé API du panel compris**. Les clés inconnues sont ignorées. Le fichier contient donc des secrets : gardez-le privé et supprimez-le après usage.

---

## Migrer vers un nouveau serveur

1. Sur l'ancien panel : lancez une sauvegarde manuelle et téléchargez le `.json` (ou récupérez le dossier de données PostgreSQL).
2. Déployez le panel sur le nouveau serveur et configurez la base.
3. Sur `/setup` : **Restaurer une sauvegarde**, puis connectez-vous.
4. Mettez à jour votre DNS et vérifiez **Paramètres → Moteur proxy** (hôte et port publics).
