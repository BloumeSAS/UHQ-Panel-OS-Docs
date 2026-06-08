# Introduction

**UHQ Panel OS** est un panel de gestion de proxies développé par [Bloume SAS](https://bloume.fr).  
Il combine dans une **image Docker unique** :

- Une **API REST NestJS** (port `8000`) qui sert aussi le panel React en statique
- Un **moteur proxy TCP** (port `990`)
- Un **système d'addons** pour étendre l'interface sans toucher au code source

---

## Architecture

```
┌────────────────────────────────────────────────┐
│              Image Docker unique               │
│                                                │
│  ┌──────────────┐   ┌────────────────────────┐ │
│  │  NestJS :8000 │   │   Proxy TCP :990       │ │
│  │  API REST     │   │   HTTP/SOCKS4/SOCKS5   │ │
│  │  Panel React  │   │   Sticky / Rotation    │ │
│  └──────────────┘   └────────────────────────┘ │
│                                                │
│  PostgreSQL embarqué (Docker) ou externe       │
└────────────────────────────────────────────────┘
         ↕  /uhq-manifest.json
┌─────────────────────────────────────────────────┐
│        Addon externe (microservice)             │
│  NestJS + React — port libre — données propres  │
└─────────────────────────────────────────────────┘
```

---

## Fonctionnalités principales

| Module | Description |
|---|---|
| **Sous-utilisateurs** | Comptes proxy indépendants avec login, quota trafic, threads, IP whitelist |
| **Utilisateurs panel** | Comptes admin/user avec assignation de sous-utilisateurs |
| **Pool de proxies** | Gestion du pool backend (scraping, checker, import manuel) |
| **Monitoring** | Stats en temps réel (threads, sessions, pays, providers) |
| **Rapports** | Historique de trafic par jour/semaine/mois |
| **Extensions** | Connexion d'addons externes par URL |
| **Backup** | Sauvegardes planifiées locales ou S3, incluant les données des addons |
| **API legacy** | `/api/v1/*` compatible anciens clients (clé API, Basic Auth) |

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | NestJS 10, TypeScript, Prisma 5 |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Base de données | PostgreSQL (externe) |
| Proxy | Moteur TCP custom NestJS |
| Conteneur | Docker (multi-stage build) |
| Hébergement | Coolify, Docker Compose, VPS |

---

## Prochaine étape

→ [Installation](/guide/installation)
