# Introduction

**UHQ Panel OS** is a proxy management panel developed by [Bloume SAS](https://bloume.fr).  
It combines in a **single Docker image**:

- A **NestJS REST API** (port `8000`) that also serves the React panel as static files
- A **TCP proxy engine** (port `990`)
- An **add-on system** to extend the interface without touching the source code

---

## 🎬 UHQ Panel OS in 1 minute

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/UUASI5vbf2Q" title="UHQ Panel OS in 1 minute" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

---

## Architecture

```
┌────────────────────────────────────────────────┐
│               Single Docker image              │
│                                                │
│  ┌──────────────┐   ┌────────────────────────┐ │
│  │  NestJS :8000 │   │   TCP proxy :990       │ │
│  │  REST API     │   │   HTTP/SOCKS4/SOCKS5   │ │
│  │  React panel  │   │   Sticky / Rotation    │ │
│  └──────────────┘   └────────────────────────┘ │
│                                                │
│  Bundled (Docker) or external PostgreSQL       │
└────────────────────────────────────────────────┘
         ↕  /uhq-manifest.json
┌─────────────────────────────────────────────────┐
│         External add-on (microservice)          │
│  NestJS + React — any port — its own data       │
└─────────────────────────────────────────────────┘
```

---

## Main features

| Module | Description |
|---|---|
| **Sub-users** | Independent proxy accounts with login, traffic quota, threads, IP whitelist |
| **Panel users** | Admin/user accounts with assigned sub-users |
| **Proxy pool** | Backend pool management (scraping, checker, manual import) |
| **Monitoring** | Real-time stats (threads, sessions, countries, providers) |
| **Reports** | Traffic history per day/week/month |
| **Extensions** | Connect external add-ons by URL |
| **Backup** | Scheduled local or S3 backups, including add-on data |
| **Legacy API** | `/api/v1/*` compatible with older clients (API key, Basic Auth) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, Prisma |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Database | PostgreSQL |
| Proxy | Custom NestJS TCP engine |
| Container | Docker (multi-stage build) |
| Hosting | Coolify, Docker Compose, VPS |

---

## Next step

→ [Installation](/en/guide/installation)
