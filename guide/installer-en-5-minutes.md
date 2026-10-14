# Installer en 5 minutes (Coolify)

1. **Coolify → New Resource → Docker Compose** (ou Dockerfile) depuis le dépôt GitHub `BloumeSAS/UHQ-Panel-OS`.
2. Ajoutez une base **PostgreSQL 16** (ressource Coolify) ; copiez son URL interne.
3. Variables d'environnement :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL de l'étape 2 |
| `SETUP_TOKEN` | *(facultatif)* généré automatiquement et affiché dans les logs ; `off` pour désactiver |

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
