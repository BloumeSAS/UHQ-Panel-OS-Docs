---
title: Vercel, Netlify, Render, Heroku… why not?
description: Why UHQ Panel OS cannot run on Vercel, Netlify, Cloudflare Pages, Render or Heroku, and what to do instead.
---

# 🚫 Vercel, Netlify, Render, Heroku… why not?

A frequent question: *"Can I install it on Vercel?"* — **no**, and it is not a configuration issue. Here is why, platform by platform.

## What the panel needs

| Requirement | Reason |
|---|---|
| A **long-running** process | the proxy engine listens continuously, meters traffic, runs the checker and the scraper |
| A public **inbound TCP port** | customers connect to `host:990`, not over HTTPS |
| **Long connections** | a CONNECT tunnel can last for hours |
| **PostgreSQL** + persistent disk | accounts, traffic, backups |

## Verdict

| Platform | Why it does not work |
|---|---|
| **Vercel** | *serverless* functions lasting a few seconds, no TCP port, no long-running process |
| **Netlify** | same (functions + static hosting) |
| **Cloudflare Pages / Workers** | no inbound TCP sockets, limited execution time |
| **Heroku** | a single routed HTTP port: the proxy on 990 is not reachable |
| **Render (Web Service)** | same: HTTP only (private TCP is not public) |
| **GitHub Pages** | static only |

## What to do instead?

1. **A VPS from ~€4/month** (Hetzner, OVH, Scaleway, Contabo, DigitalOcean…) + [Coolify](/en/guide/hebergeurs/coolify): the recommended way.
2. **Already have a Vercel / Netlify / Cloudflare account?** Keep them for what they do very well: **DNS and the domain**. Point `panel.example.com` to your VPS IP.
3. **Add-ons and showcase sites** (shop, landing page) can live on Vercel/Netlify and call the panel API (`/api/v1/*` with an API key).

::: tip Summary
Panel + proxy = **VPS + Docker Compose**. The rest of your infrastructure can stay wherever you like.
:::

→ [See compatible hosts](/en/guide/hebergeurs/)
