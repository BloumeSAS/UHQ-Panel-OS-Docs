---
title: Choisir son hébergeur
description: Où installer UHQ Panel OS ? Compatibilité de Coolify, Dokploy, CapRover, Portainer, VPS Docker, Railway, Vercel, Render, Heroku…
---

# 🌍 Choisir son hébergeur

UHQ Panel OS n'est pas qu'un site web : c'est **un panel web + un moteur proxy TCP + une base PostgreSQL**. Pour fonctionner, la plateforme doit donc :

| Besoin | Pourquoi |
|---|---|
| ✅ **Faire tourner un conteneur Docker en continu** | le moteur proxy est un processus permanent (pas une fonction « serverless ») |
| ✅ **Publier un port TCP** (990 par défaut, + 9000-9250 pour les ports dédiés) | les clients se connectent en proxy HTTP/CONNECT sur ce port, pas en HTTPS |
| ✅ **Une base PostgreSQL 14+** | comptes, trafic, journaux (fournie par le `docker-compose.yml`) |
| ✅ **Des volumes persistants** | sauvegardes, configuration, journaux |

## Compatibilité

| Plateforme | Panel web | Proxy TCP | Verdict | Guide |
|---|:---:|:---:|---|---|
| **Coolify** | ✅ | ✅ | ⭐ **Recommandé** — Docker Compose, HTTPS auto, mise à jour en un clic | [Coolify](/guide/hebergeurs/coolify) |
| **Dokploy** | ✅ | ✅ | ✅ Très bien — même principe que Coolify | [Dokploy](/guide/hebergeurs/dokploy) |
| **VPS + Docker Compose** | ✅ | ✅ | ✅ Le plus simple et le plus transparent | [VPS Docker](/guide/hebergeurs/vps) |
| **Portainer** | ✅ | ✅ | ✅ Bien (reverse proxy HTTPS à ajouter) | [Portainer](/guide/hebergeurs/portainer) |
| **CapRover** | ✅ | ⚠️ | ⚠️ Possible, plus manuel (une appli = un conteneur) | [CapRover](/guide/hebergeurs/caprover) |
| **Railway** | ✅ | ⚠️ | ⚠️ Possible via « TCP Proxy » (port public aléatoire, un seul port) | [Railway](/guide/hebergeurs/railway) |
| **Fly.io** | ✅ | ⚠️ | ⚠️ TCP possible avec IPv4 dédiée (payante) — non documenté en détail | — |
| **Vercel / Netlify** | ❌ | ❌ | ❌ **Impossible** (serverless, pas de TCP, pas de processus permanent) | [Pourquoi pas ?](/guide/hebergeurs/serverless) |
| **Render / Heroku** | ⚠️ | ❌ | ❌ Pas de port TCP entrant public : le proxy ne serait pas joignable | [Pourquoi pas ?](/guide/hebergeurs/serverless) |
| **Cloudflare Pages / Workers** | ❌ | ❌ | ❌ Impossible | [Pourquoi pas ?](/guide/hebergeurs/serverless) |

::: tip En deux mots
Vous voulez le plus simple ? Un **VPS à 5 €/mois** + **Coolify** (compose) = panel en HTTPS, proxy sur le port 990, mises à jour en un clic depuis le panel.
:::

::: info Légende
✅ testé et documenté · ⚠️ possible mais avec des limites expliquées dans le guide · ❌ ne peut pas fonctionner pour des raisons techniques (pas une question de configuration).
:::

## Avant de choisir : les deux points qui cassent tout

1. **Cloudflare (nuage orange) devant le domaine du proxy** : le trafic TCP n'est pas transmis. Utilisez un domaine ou sous-domaine en **DNS seul** (nuage gris) pour le proxy. Le panel web, lui, peut très bien être derrière Cloudflare (détection de la vraie IP incluse).
2. **Pare-feu / groupe de sécurité du fournisseur** (OVH, Hetzner, AWS, Oracle…) : ouvrez **80, 443, 990 et 9000-9250** (en plus du pare-feu de l'OS si vous en avez un).

## Besoin d'une installation guidée ?

L'assistant **[Commencer l'installation](/guide/commencer)** vous accompagne étape par étape (automatique avec Coolify, manuelle avec Docker Compose, ou test local).
