---
title: Installer sur CapRover
description: UHQ Panel OS sur CapRover — possible, mais manuel (PostgreSQL séparé et port TCP à publier).
---

# 🧢 Installer sur CapRover

::: warning Plus manuel
CapRover déploie **une application = un conteneur** : il ne lit pas le `docker-compose.yml`. Il faut créer la base PostgreSQL séparément et publier le port TCP vous-même. Préférez [Coolify](/guide/hebergeurs/coolify) ou [Dokploy](/guide/hebergeurs/dokploy) si vous avez le choix.
:::

## 1. La base PostgreSQL

**Apps → One-Click Apps → PostgreSQL** (version 16) : notez le nom `srv-captain--postgres`, l'utilisateur et le mot de passe.

## 2. L'application

1. **Apps → Create New App** : `uhq-panel`, cochez *Has Persistent Data*.
2. **Deployment → Method 3 : Deploy from Github/Bitbucket/Gitlab** : dépôt `BloumeSAS/UHQ-Panel-OS`, branche `main` (CapRover utilise le `Dockerfile`).
3. **App Configs** :
   - *Container HTTP Port* : `8000`
   - *Persistent Directories* : `/app/data`, `/app/logs`
   - *Environment Variables* : `DATABASE_URL=postgresql://USER:MOT_DE_PASSE@srv-captain--postgres:5432/uhq`
4. **HTTP Settings** : domaine + *Enable HTTPS* + *Websocket Support*.

## 3. Publier le port proxy 990

CapRover n'expose pas de port TCP arbitraire par l'interface. Dans **App Configs → Port Mapping**, ajoutez `990` (serveur) → `990` (conteneur), et ouvrez le port chez l'hébergeur. Les ports dédiés 9000-9250 se mappent de la même façon, un par un.

## 4. Premiers pas

Logs de l'application → `TOKEN D'INSTALLATION` → `https://panel.exemple.fr/setup`.

## 5. Mise à jour

Activez le **Webhook** (Deployment → *Enable App Token* / *Webhook*) et collez-le dans *Paramètres → Général → Mise à jour automatique*.
