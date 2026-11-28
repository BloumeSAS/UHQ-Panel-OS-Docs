# Add-on system

The add-on system **extends UHQ Panel OS** without changing its source code.  
An add-on is an **independent microservice** that connects to the panel through a simple URL.

---

## Principle

```
UHQ panel                              Add-on (external)
─────────────────────────────────      ────────────────────────────────
GET <addon-url>/uhq-manifest.json  →   Returns the JSON declaration
                                   ←
The panel injects automatically:
  • Pages in the nav sidebar
  • Widgets in panel pages
  • Items in the topbar dropdown
  • Translations in the i18n system
```

**Zero code to touch on the panel side.** Connecting a URL is enough.

---

## What an add-on can do

| Capability | Description |
|---|---|
| **Pages** | Add full-window pages to the sidebar |
| **Widgets** | Inject iframes into any panel page |
| **Topbar slots** | Add items to the email/role dropdown at the top right |
| **Translations** | Provide its own i18n keys (fr, en, and more) |
| **Backup** | Include its data in the panel's backups |
| **Updates** | Notify automatically when a new version is available |

---

## Required stack

::: info Required
Every UHQ Panel OS add-on **must** be built with:
- **Backend**: NestJS 10+
- **Frontend**: React 18+ (Vite recommended)
:::

This constraint keeps the architecture consistent and makes support easier.

---

## Full flow

```
Admin enters: http://localhost:3001
           ↓
Panel fetches GET /uhq-manifest.json
           ↓
Caches the manifest (DB)
           ↓
┌─────────────────────────────────────────────┐
│  Automatically, without code:               │
│                                             │
│  ✓ Nav items generated                      │
│  ✓ Translations merged                      │
│  ✓ Widgets injected on the right pages      │
│  ✓ Topbar dropdown items                    │
│  ✓ Included in backups                      │
└─────────────────────────────────────────────┘
```

---

## Official add-ons

These **10 add-ons** are **free**, open source (MIT), published by Bloume SAS and shown directly in the panel's **Extensions** tab (`Admin → Extensions`).

| Add-on | Description | Depends on | License |
|---|---|---|---|
| [Wallet](/en/addons/official/wallet) | Balance per account, online top-up, gift codes | — | <span class="badge-free">✓ Free</span> |
| [Orders](/en/addons/official/orders) | Built-in shop — per-GB sales, promo codes, admin approval, renewal, PayPal, PDF invoices | Wallet | <span class="badge-free">✓ Free</span> |
| [Promo codes](/en/addons/official/promocodes) | Gift codes, top-up bonuses, shop discounts, fully customisable | Wallet | <span class="badge-free">✓ Free</span> |
| [Showcase](/en/addons/official/vitrine) | Public home page: catalogue by category and country, price simulator | Orders (recommended) | <span class="badge-free">✓ Free</span> |
| [Analytics](/en/addons/official/analytics) | Full panel analytics — stats per account, category, pool, checker, scraper, busiest hours/days | — | <span class="badge-free">✓ Free</span> |
| [UHQ.Monster Reseller](/en/addons/official/reseller) | Buy and manage your UHQ.Monster proxies from the panel, with automatic import into your categories | — | <span class="badge-free">✓ Free</span> |
| [Tickets](/en/addons/official/tickets) | Built-in customer support: tickets, attachments, Admin + Support console, canned replies, ratings | — | <span class="badge-free">✓ Free</span> |
| [Referral](/en/addons/official/referral) | Referral link and code, commission credited to the Wallet, welcome bonus, holding period | Wallet, Orders | <span class="badge-free">✓ Free</span> |
| [Status & incidents](/en/addons/official/status) | Public status page, 90-day uptime, automatic outage and redeploy detection, alerts | — | <span class="badge-free">✓ Free</span> |
| [Security (BloumeID)](/en/addons/official/security) | Device fingerprinting (BloumeID, ThumbmarkJS, FingerprintJS, Fingerprint.com) on sign-in, sign-up and password reset: bots, spoofed browsers, multi-accounts | — | <span class="badge-free">✓ Free</span> |

### Deployment

**Recommended:** the official add-ons are already built into the panel's Docker image — an **Enable** button on their card (Extensions → official catalogue) is enough. The panel starts them as plain internal processes (no new container, no separate VPS, no Docker socket access), reachable through an internal reverse proxy on the port that is already exposed. See [Wallet](/en/addons/official/wallet) / [Orders](/en/addons/official/orders).

Alternative — separate self-hosting: each add-on also ships with a ready-to-use `Dockerfile` and `docker-compose.coolify.yml`. Deploy on Coolify (or any Docker host), set the environment variables, then connect the URL from the panel.

Variables common to all add-ons:

| Variable | Description |
|---|---|
| `PANEL_URL` | Public panel URL (e.g. `https://panel.example.com`) |
| `PANEL_API_KEY` | Panel API key (`Admin → Settings → API key`) |

---

## Next step

→ [Quick start](/en/addons/getting-started) — create your first add-on in 10 minutes.
