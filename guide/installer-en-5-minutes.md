# Installer en 5 minutes (Coolify)

::: tip Pas Coolify ?
Dokploy, Portainer, VPS nu… voir [Choisir son hébergeur](/guide/hebergeurs/).
:::

1. **Coolify → New Resource → Public Repository** → `BloumeSAS/UHQ-Panel-OS`, **Build Pack : Docker Compose** (`/docker-compose.yml`). Pas « Dockerfile » ni « Docker Image » : seul le compose crée aussi PostgreSQL, les volumes et le port 990. [Détails](/guide/hebergeurs/coolify)
2. La base **PostgreSQL 16** est incluse dans le compose : rien à ajouter.
3. Variables d'environnement : **aucune obligatoire** (`SETUP_TOKEN` facultatif : généré automatiquement et affiché dans les logs ; `off` pour désactiver).

4. **Domaine** : pointez votre domaine sur l'application, port **8000** (HTTPS géré par Coolify/Traefik).
5. **Port proxy** : publiez le **990/TCP** sur l'hôte (ce n'est pas un port HTTP : il ne passe pas par Traefik ni Cloudflare orange).
6. **Déployez**, ouvrez `https://votre-domaine/setup` et suivez l'assistant.

## Vérifications avant de terminer l'installation

Sur `/setup`, le bloc **Vérification de l'installation** contrôle votre domaine, le port 990 et la présence de Cloudflare :

- **Domaine** : résolution DNS et joignabilité ;
- **Port 990** : doit être ouvert depuis Internet ;
- **Cloudflare** : le nuage doit être **gris** (DNS seul) pour le domaine des proxys, sinon le trafic TCP est bloqué. Les requêtes HTTP du panel passent, elles, sans problème par Cloudflare (limite ~100 s : les opérations longues sont des tâches de fond).

Ces vérifications sont disponibles tant que l'installation n'est pas terminée.

Ensuite : [Mise en service](/guide/mise-en-service) et [Visite guidée](/guide/visite-guidee).
