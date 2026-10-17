---
title: Installer sur Coolify
description: Déployer UHQ Panel OS sur Coolify avec Docker Compose (méthode recommandée) — HTTPS, port proxy, mises à jour en un clic.
---

# 🧊 Installer sur Coolify

**Coolify** est la plateforme recommandée : HTTPS automatique (Traefik), redéploiement en un clic, et le panel peut se mettre à jour lui-même via le webhook de déploiement.

::: tip Docker Compose, pas « Docker Image » ni « Dockerfile »
Utilisez **toujours le type « Docker Compose »**. Le `docker-compose.yml` du dépôt déclare **tout ce qu'il faut ensemble** : l'application, la base **PostgreSQL**, les **volumes persistants**, le **port proxy 990** et la plage **9000-9250**, la limite de fichiers ouverts et le contrôle de santé.

| Type Coolify | Résultat |
|---|---|
| ✅ **Docker Compose** | tout est créé d'un coup, prêt à l'emploi |
| ⚠️ Dockerfile / Nixpacks | uniquement l'application : vous devez ajouter PostgreSQL, les volumes, le port 990 et les variables à la main |
| ❌ Docker Image | idem, et aucune mise à jour automatique à la sortie d'une version |
:::

## 1. Préparer le serveur

- un VPS Ubuntu 22.04+ / Debian 12+ (2 vCPU, 2 Go RAM minimum) avec **Coolify installé** (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`) ;
- un **domaine** dont l'enregistrement `A` pointe sur l'IP du serveur ;
- les ports **22, 80, 443, 990** (et **9000-9250** pour les ports dédiés) ouverts chez votre hébergeur.

::: warning Cloudflare
Si le domaine est derrière Cloudflare, mettez-le en **DNS seul (nuage gris)**, ou utilisez un second sous-domaine en nuage gris pour le proxy. Voir [Choisir son hébergeur](/guide/hebergeurs/#avant-de-choisir-les-deux-points-qui-cassent-tout).
:::

## 2. Créer l'application

1. **Projects → Add → New Resource → Public Repository** (ou Private si vous avez un fork).
2. Dépôt : `https://github.com/BloumeSAS/UHQ-Panel-OS` — branche **main**.
3. **Build Pack : Docker Compose** — « Docker Compose Location » : `/docker-compose.yml`.
4. Cliquez sur **Continue**.

## 3. Domaine

Dans la configuration, sur le service **app**, renseignez le domaine **avec le port interne** :

```text
https://panel.exemple.fr:8000
```

Coolify (Traefik) fournit le certificat HTTPS tout seul. Ne mettez **aucun domaine** pour le port 990 : c'est du TCP, il est publié directement sur l'hôte par le compose.

## 4. Variables d'environnement (facultatives)

Aucune n'est obligatoire. Les plus utiles :

| Variable | Rôle |
|---|---|
| `SETUP_TOKEN` | imposer votre propre jeton d'installation (sinon il est généré et affiché dans les logs) |
| `TZ` | fuseau horaire (défaut `Europe/Paris`) |
| `PROXY_PORT` | port du proxy (défaut `990`) |

## 5. Déployer

Cliquez sur **Deploy** et suivez **Deployments**. Au premier démarrage, ouvrez les **Logs** de l'application et relevez la ligne `TOKEN D'INSTALLATION`, puis allez sur `https://panel.exemple.fr/setup`.

```bash
# Test depuis votre ordinateur une fois un compte créé :
curl -x http://IDENTIFIANT:MOT_DE_PASSE@panel.exemple.fr:990 https://api.ipify.org
```

## 6. Mise à jour en un clic

1. Coolify → **Keys & Tokens → API tokens** → créez un jeton avec le droit **deploy**.
2. Votre application → **Webhooks** → copiez l'URL du **Deploy Webhook**.
3. Dans le panel : **Paramètres → Général → Mise à jour automatique** → plateforme **Coolify** → collez l'URL et le jeton (méthode **POST** + **Bearer**).

Voir [Mise à jour automatique](/guide/mise-a-jour-automatique).

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `504 Gateway Timeout` sur le panel | le domaine pointe sur le mauvais port : il doit être `…:8000` |
| Le proxy ne répond pas sur 990 | port fermé chez l'hébergeur, ou domaine en nuage orange Cloudflare |
| « Cannot connect to database » | ne pas supprimer le service `db` du compose ; laisser Coolify gérer le démarrage ordonné |
| Perte des données après redéploiement | volumes supprimés : gardez les noms `uhq-panel-*` du compose |

Voir aussi [Docker & Coolify](/guide/docker) pour le détail des ports et volumes.
