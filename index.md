---
layout: home

hero:
  name: "UHQ Panel OS"
  text: "Panel proxy nouvelle génération"
  tagline: Gérez vos proxies, vos utilisateurs et vos addons depuis une interface unifiée. Déployez en un clic sur Coolify.
  image:
    src: /logo.png
    alt: UHQ Panel OS
  actions:
    - theme: brand
      text: Démarrer →
      link: /guide/introduction
    - theme: alt
      text: Créer un addon
      link: /addons/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/BloumeSAS/UHQ-Panel-OS
    - theme: secondary
      text: Vérifier les mises à jour
      link: https://github.com/BloumeSAS/UHQ-Panel-OS/releases

features:
  - icon: 🌐
    title: Proxy TCP haute performance
    details: Moteur proxy NestJS exposé sur le port 990. Support HTTP, SOCKS4, SOCKS5. Sticky sessions, rotation, géolocalisation.

  - icon: 🧩
    title: Système d'addons
    details: Connectez des microservices externes en une URL. Ils injectent pages, widgets et boutons dans le panel — sans modifier une seule ligne de code.

  - icon: 💾
    title: Backup automatique
    details: Sauvegardes planifiées vers stockage local ou S3 (Cloudflare R2, AWS, MinIO). Les addons sont inclus automatiquement.

  - icon: 🐳
    title: Coolify ready
    details: Image Docker unique (NestJS + React statique). Variables d'environnement, volumes persistants, labels Traefik — tout est préconfigisé.

  - icon: 🌍
    title: Multilingue
    details: Interface en français et anglais. Les addons embarquent leurs propres traductions, fusionnées au runtime dans le panel.

  - icon: 🔒
    title: Sécurité intégrée
    details: JWT RS256, clé API legacy, guards par rôle (ADMIN/USER), whitelist IP, quota de trafic et de threads par compte.
---
