---
title: Installer sur Dokploy
description: Déployer UHQ Panel OS sur Dokploy avec Docker Compose — HTTPS automatique et port proxy TCP.
---

# 🚢 Installer sur Dokploy

**Dokploy** fonctionne comme Coolify : il lit directement le `docker-compose.yml` du dépôt et gère HTTPS via Traefik.

## 1. Prérequis

- un VPS Linux avec Dokploy installé (`curl -sSL https://dokploy.com/install.sh | sh`) ;
- un domaine (`A` → IP du serveur) ;
- ports **80, 443, 990** et **9000-9250** ouverts.

## 2. Créer le service

1. **Projects → Create Project → Create Service → Compose**.
2. **Provider : Git** (ou GitHub) — dépôt `https://github.com/BloumeSAS/UHQ-Panel-OS`, branche `main`.
3. **Compose Type : Docker Compose**, **Compose Path** : `./docker-compose.yml`.
4. Enregistrez.

## 3. Domaine

Onglet **Domains → Add Domain** :

| Champ | Valeur |
|---|---|
| Service Name | `app` |
| Host | `panel.exemple.fr` |
| Container Port | `8000` |
| HTTPS | activé (Let's Encrypt) |

Le port **990** est publié directement par le compose : ne créez aucun domaine pour lui.

## 4. Déployer

Cliquez sur **Deploy**. Relevez le `TOKEN D'INSTALLATION` dans l'onglet **Logs**, puis ouvrez `https://panel.exemple.fr/setup`.

## 5. Mise à jour automatique

Onglet **Deployments** → copiez l'URL du **Webhook**. Dans le panel : **Paramètres → Général → Mise à jour automatique** → collez l'URL (méthode **POST**, sans jeton).

::: warning Cloudflare
Domaine du proxy en **DNS seul (nuage gris)**. Voir [Choisir son hébergeur](/guide/hebergeurs/).
:::
