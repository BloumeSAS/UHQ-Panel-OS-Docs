# Install in 5 minutes (Coolify)

::: tip Not Coolify?
Dokploy, Portainer, bare VPS… see [Choose a host](/en/guide/hebergeurs/).
:::

1. **Coolify → New Resource → Public Repository** → `BloumeSAS/UHQ-Panel-OS`, **Build Pack: Docker Compose** (`/docker-compose.yml`). Not "Dockerfile" or "Docker Image": only the compose file also creates PostgreSQL, the volumes and port 990. [Details](/en/guide/hebergeurs/coolify)
2. The **PostgreSQL 16** database is included in the compose file: nothing to add.
3. Environment variables: **none required** (`SETUP_TOKEN` optional: generated automatically and shown in the logs; `off` to disable it).
4. **Domain**: point your domain to the application, port **8000** (HTTPS handled by Coolify/Traefik).
5. **Proxy port**: publish **990/TCP** on the host (it is not an HTTP port: it goes neither through Traefik nor an orange Cloudflare cloud).
6. **Deploy**, open `https://your-domain/setup` and follow the wizard.

## Checks before finishing the installation

On `/setup`, the **Installation check** block verifies your domain, port 990 and whether Cloudflare is in front:

- **Domain**: DNS resolution and reachability;
- **Port 990**: must be open from the Internet;
- **Cloudflare**: the cloud must be **grey** (DNS only) for the proxy domain, otherwise TCP traffic is blocked. The panel's HTTP requests go through Cloudflare without any problem (~100 s limit: long operations run as background tasks).

These checks are available as long as the installation is not finished.

Next: [Going live](/en/guide/mise-en-service) and [Guided tour](/en/guide/visite-guidee).
