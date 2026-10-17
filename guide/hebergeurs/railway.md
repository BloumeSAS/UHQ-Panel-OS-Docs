---
title: Installer sur Railway
description: UHQ Panel OS sur Railway — possible via le TCP Proxy, avec des limites importantes.
---

# 🚂 Installer sur Railway

::: warning À savoir avant de commencer
Railway publie le TCP via un **« TCP Proxy »** : l'adresse publique est de la forme `xxx.proxy.rlwy.net:PORT_ALEATOIRE`. Conséquences :

- le proxy ne sera **pas** joignable sur le port 990 de votre domaine ;
- **un seul** port TCP par service : pas de ports dédiés 9000-9250 ;
- le coût suit la consommation (RAM/CPU/trafic sortant) — un proxy qui relaie beaucoup de trafic coûte cher.

Pour un usage de production, préférez un VPS ([Coolify](/guide/hebergeurs/coolify), [VPS Docker](/guide/hebergeurs/vps)).
:::

## 1. Déployer

1. **New Project → Deploy from GitHub repo** → `BloumeSAS/UHQ-Panel-OS` (Railway détecte le `Dockerfile`).
2. **New → Database → PostgreSQL**.
3. Sur le service du panel, variables : `DATABASE_URL` = <span v-pre>`${{Postgres.DATABASE_URL}}`</span>.
4. **Settings → Networking** :
   - *Generate Domain* (ou domaine personnalisé) → port **8000** (HTTPS).
   - *TCP Proxy* → port interne **990**.
5. **Settings → Volumes** : montez un volume sur `/app/data`.

## 2. Configurer l'hôte public du proxy

Dans le panel : **Paramètres → Proxy**, renseignez l'**hôte public** et le **port public** donnés par Railway (`xxx.proxy.rlwy.net` et le port affiché), pour que les identifiants de connexion générés soient corrects.

## 3. Mise à jour

Railway redéploie à chaque push sur la branche suivie. Désactivez-le si vous préférez choisir vos versions (*Settings → Source → Auto-deploy*).
