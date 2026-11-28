# Analytics <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**  
> Full panel analytics: accounts, categories, pool, checker, scraper, security — and **when** your accounts are used.

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/VW0lURoUj3g" title="Analytics add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/VW0lURoUj3g).

---

## Features

- 📊 **8 analysis sections** and **70+ charts**: overview, activity, accounts, categories, proxy pool, checker, scraper, security
- 📈 Comparison with the previous period, cumulative traffic, **hour-by-hour timeline**, accounts by volume and by quota, biggest rises and drops, concentration by domain
- 🕒 **Busiest hours and days**: peak hour, busiest day, quietest window (ideal for maintenance), day × hour heatmap — global, per category or per account
- 🔎 **Automatic findings**: trend, abnormal spikes, quotas close to the limit, category without a working proxy, stuck checker or scraper, rising bans…
- 👤 **"My activity"** for each user, limited to their own accounts
- 📈 Dashboard widget (today's traffic, live connections, peak hour)
- 📤 CSV export of accounts
- 🌍 French / English, light/dark theme, panel colours

---

## Requirements

UHQ Panel OS **2.4.72 or later**: the panel computes the statistics (`/api/panel/analytics/*`) and records the **hourly** usage history and the checker/scraper run history.

::: tip Hourly data
Hourly history starts **from the panel update**. Peak hours therefore appear as activity builds up; weekdays and the daily trend already cover the whole history. Default retention is 90 days (settings `usageHourlyRetentionDays` and `jobRunRetentionDays`).
:::

---

## One-click activation (recommended)

Analytics is **already built into the panel's Docker image**. From the panel: **Extensions → Analytics → Enable**. The panel starts it as an internal process and connects it automatically. **Disable** stops it cleanly.

---

## Manual install (separate self-hosting)

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Analytics
cd UHQ-Addon-Analytics
npm run install:all
cp .env.example .env
npm run build && npm start
```

Connect it in the panel: `http://localhost:3001`

---

## Injected zones

| Zone | Type | Description |
|---|---|---|
| Sidebar | Page | "My activity" (all users) |
| Sidebar | Admin page | "Analytics" (adminOnly) |
| `/` | 100px widget | Today's traffic, live connections, peak hour |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Listening port |
| `PANEL_URL` | `http://localhost:8000` | Panel URL |
| `CACHE_TTL_SECONDS` | `20` | In-memory cache of panel responses |

---

## Security

The add-on stores nothing: every call relays the panel API with the user's JWT, and the panel enforces roles. Global statistics are reserved to the **ADMIN** and **SUPPORT** roles; a plain user only sees their own accounts.

---

## Panel API used

| Route | Role | Content |
|---|---|---|
| `GET /api/panel/analytics/overview` | ADMIN, SUPPORT | Global indicators and rankings |
| `GET /api/panel/analytics/accounts` · `/:id` | ADMIN, SUPPORT | Filterable list and account detail |
| `GET /api/panel/analytics/activity` | ADMIN, SUPPORT | Hours, days, heatmap |
| `GET /api/panel/analytics/categories` · `/pool` · `/checker` · `/scraper` · `/security` | ADMIN, SUPPORT | Dedicated sections |
| `GET /api/panel/me/proxies/:id/activity` | owner | Activity of one of their accounts |

Parameters: `days` (1-365), `tz` (IANA time zone, e.g. `Europe/Paris`).
