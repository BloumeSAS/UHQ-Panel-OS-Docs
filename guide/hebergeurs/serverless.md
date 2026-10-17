---
title: Vercel, Netlify, Render, Heroku… pourquoi pas ?
description: Pourquoi UHQ Panel OS ne peut pas fonctionner sur Vercel, Netlify, Cloudflare Pages, Render ou Heroku, et quoi faire à la place.
---

# 🚫 Vercel, Netlify, Render, Heroku… pourquoi pas ?

Question fréquente : *« Puis-je l'installer sur Vercel ? »* — **non**, et ce n'est pas une question de configuration. Voici pourquoi, plateforme par plateforme.

## Ce dont le panel a besoin

| Besoin | Raison |
|---|---|
| Processus **permanent** | le moteur proxy écoute en continu, compte le trafic, lance le checker et le scraper |
| **Port TCP entrant** public | les clients se connectent en `host:990`, pas en HTTPS |
| **Connexions longues** | un tunnel CONNECT peut durer des heures |
| **PostgreSQL** + disque persistant | comptes, trafic, sauvegardes |

## Verdict

| Plateforme | Pourquoi ça ne marche pas |
|---|---|
| **Vercel** | fonctions *serverless* de quelques secondes, aucun port TCP, aucun processus permanent |
| **Netlify** | idem (fonctions + hébergement statique) |
| **Cloudflare Pages / Workers** | pas de sockets TCP entrants, durée d'exécution limitée |
| **Heroku** | un seul port HTTP routé : le proxy sur 990 n'est pas joignable |
| **Render (Web Service)** | idem : HTTP seulement (le TCP privé n'est pas public) |
| **GitHub Pages** | statique uniquement |

## Quoi faire à la place ?

1. **Un VPS à partir de ~4 €/mois** (Hetzner, OVH, Scaleway, Contabo, DigitalOcean…) + [Coolify](/guide/hebergeurs/coolify) : c'est la voie recommandée.
2. **Déjà un compte Vercel / Netlify / Cloudflare ?** Gardez-les pour ce qu'ils font très bien : **le DNS et le domaine**. Faites pointer `panel.exemple.fr` vers l'IP de votre VPS.
3. **Les addons et les sites vitrines** (boutique, page d'accueil) peuvent, eux, vivre sur Vercel/Netlify et appeler l'API du panel (`/api/v1/*` avec une clé API).

::: tip Résumé
Panel + proxy = **VPS + Docker Compose**. Tout le reste de votre infrastructure peut rester où vous voulez.
:::

→ [Voir les hébergeurs compatibles](/guide/hebergeurs/)
