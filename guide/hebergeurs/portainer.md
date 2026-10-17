---
title: Installer avec Portainer
description: Déployer UHQ Panel OS comme « Stack » Portainer à partir du dépôt Git.
---

# 🐳 Installer avec Portainer

Portainer gère vos conteneurs mais **pas le HTTPS** : ajoutez Caddy, Nginx Proxy Manager ou Traefik devant le port 8000.

## 1. Créer la stack

1. **Stacks → Add stack**.
2. **Build method : Repository**.
3. Repository URL : `https://github.com/BloumeSAS/UHQ-Panel-OS` — Reference : `refs/heads/main` — Compose path : `docker-compose.yml`.
4. Activez **Enable relative path volumes** si proposé, puis **Deploy the stack**.

## 2. HTTPS

Avec **Nginx Proxy Manager** : *Proxy Host* → domaine `panel.exemple.fr` → Forward `http://IP_DU_SERVEUR:8000` → onglet SSL « Request a new certificate » + **Websockets Support** activé.

## 3. Jeton d'installation

Portainer → **Containers → app → Logs** : cherchez `TOKEN D'INSTALLATION`, puis ouvrez `/setup`.

## 4. Mise à jour

Ouvrez la stack → **Pull and redeploy** (cochez *Re-pull image and redeploy*). Pour l'automatiser depuis le panel, activez le **Webhook** de la stack et collez-le dans *Paramètres → Général → Mise à jour automatique*.

Voir aussi [VPS + Docker Compose](/guide/hebergeurs/vps) pour le pare-feu.
