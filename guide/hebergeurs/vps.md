---
title: VPS + Docker Compose
description: Installer UHQ Panel OS à la main sur n'importe quel VPS avec Docker Compose et Caddy (HTTPS automatique).
---

# 🖥️ VPS + Docker Compose (manuel)

La méthode la plus **transparente** : aucune plateforme intermédiaire, tout tient en 3 commandes.

## 1. Installer Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # puis reconnectez-vous
```

## 2. Récupérer et lancer le panel

```bash
git clone https://github.com/BloumeSAS/UHQ-Panel-OS.git
cd UHQ-Panel-OS
docker compose up -d --build
docker compose logs -f app      # relevez la ligne « TOKEN D'INSTALLATION »
```

Le panel écoute sur `http://IP_DU_SERVEUR:8000` et le proxy sur le port **990**.

## 3. HTTPS avec Caddy (recommandé)

Installez Caddy (`sudo apt install caddy`) puis éditez `/etc/caddy/Caddyfile` :

```text
panel.exemple.fr {
    reverse_proxy 127.0.0.1:8000
}
```

```bash
sudo systemctl reload caddy
```

Caddy obtient et renouvelle le certificat tout seul. Variante **Nginx** : `proxy_pass http://127.0.0.1:8000;` avec les en-têtes `Host`, `X-Forwarded-For` et `X-Forwarded-Proto`, et les en-têtes `Upgrade`/`Connection` pour le WebSocket (`/api/panel/ws`).

## 4. Pare-feu

```bash
sudo ufw allow 22,80,443,990/tcp
sudo ufw allow 9000:9250/tcp
sudo ufw enable
```

Pensez aussi au pare-feu de votre hébergeur (OVH, Hetzner, AWS, Oracle…).

## 5. Mettre à jour

```bash
cd UHQ-Panel-OS
git pull
docker compose up -d --build
```

Les données sont dans les volumes `uhq-panel-*` : elles survivent aux mises à jour.

## 6. Sauvegarder

Utilisez **Paramètres → Sauvegardes** dans le panel, ou `docker compose exec db pg_dump -U postgres uhq > sauvegarde.sql`.
