# Guided tour

Since **v2.4.79**, UHQ Panel OS includes an **interactive guided tour**: an A-to-Z tutorial, right in the panel, that explains how everything works and points at each part of the interface with its explanation.

---

## Start the tour

| Situation | What happens |
|---|---|
| **End of installation** | The tour starts **by itself** on the dashboard, right after the administrator account is created. |
| **Any time** | Click the **?** icon at the top right (top bar) to start it again. |
| **Panel already installed / restored** | It does not start automatically: use the **?** icon. |

### Replay a single category

The **?** button opens a menu: **Full tour** or a category of your choice — *First steps, Interface, Accounts & users, Pool & proxy categories, Monitoring & diagnostics, Settings, Extensions, My account*. Ideal to review only the proxy pool or the settings without redoing the 50 steps. The **Help** page shows the same categories as cards. Only categories useful to your role appear.

### Navigation

| Action | Button | Keyboard |
|---|---|---|
| Next step | **Next** | `→` |
| Previous step | **Previous** | `←` |
| Quit | **Skip the tour** or ✕ | `Esc` |

A progress bar and the "Step X of N" counter show where you are. At each step, the explained area stays lit while the rest of the screen is dimmed; the panel changes page and opens the right Settings tab by itself.

::: tip Mobile
On a phone, the side menu opens automatically when the tour presents it, then closes so it does not hide the explained page.
:::

---

## Depending on your role

| Role | Steps shown |
|---|---|
| **Administrator** | All (about fifty steps): installation, architecture, every page, every Settings tab. |
| **Support** | How it works, interface, monitoring (dashboard, pool, analytics, logs, reports, audit), account. |
| **User** | Their area: their proxies, API keys, profile, account security. |

---

## What the tour covers

### 1. Installation and how it works
- **Welcome** and how to use the tour.
- **The architecture**: the web panel and API (port `8000`), the TCP proxy engine (port `990`) and the PostgreSQL database.
- **Ways to install**: "all-in-one" Docker Compose, Coolify (build from GitHub), external database, and restoring a backup (panel `.json` or PostgreSQL 16 `.tar.gz`) from `/setup`.
- **Ports, domain and firewall**: publish `8000` behind your HTTPS domain, publish and open `990` (outside Cloudflare), `9000–9250` range for dedicated ports.
- **The path of a proxy connection**: account authentication, racing choice of an upstream proxy, traffic counted on the upstream side, cut at quota.
- **The first 6 things to do**: public host/port, feed the pool, create a category, create an account, test, secure.

### 2. The interface
Side menu, global search, language, light/dark theme, table density, notifications.

### 3. The pages
| Step | Page | What you learn there |
|---|---|---|
| Dashboard | `/` | Threads, sessions, pool health, today's usage, most used domains, "First steps" card and backup banner. |
| Proxy accounts | `/subusers` | Creating an account: quota, threads, bandwidth, expiry, filters, dedicated port/domain, private list, sticky lists, and the "Test connection" button. |
| Users | `/users` | Admin / Support / User roles, invitations, 2FA, account assignment. |
| Proxy pool | `/pool` | Import, filters, latency test, blacklist, backup proxy. |
| Categories | `/proxy-pools` | Dedicated port/domain, "always online", usage multiplier, anti-VPN. |
| Scraper sources | `/scraper` | URL + regex, Groq AI detection, automatic loop. |
| Checker | `/checker` | Looping pool checks, dead and blacklisted proxies. |
| Banned IPs | `/banned-ips` | Blocking before authentication, manual and automatic bans, whitelist. |
| Analytics | `/analytics` | Pool health and performance over time. |
| Logs | `/logs` | Live logs, level filter, pause. |
| Reports | `/reports` | Usage per period, per account and per user. |
| Audit log | `/audit` | Who did what, when. |
| Diagnostics | `/diagnostics` | Automatic checks: engine, domain/Cloudflare, ports, HTTPS, backups, 2FA. See [Going live](/en/guide/mise-en-service). |
| Extensions | `/addons-manage` | Official add-ons in one click, external add-ons by manifest. |
| Developer guide | `/addon-docs` | Build your own extension. |
| API documentation | `/docs` | Swagger/Scalar of the REST API. |

### 4. Settings, tab by tab
The tour opens each tab by itself: **Dashboard**, **General**, **Theme**, **Security**, **Captcha**, **API key**, **Proxy engine**, **Scraper**, **E-mail (SMTP)**, **Webhooks**, **Backups**, **Extensions**. See also the [Configuration](/en/guide/configuration) page for the detail of each setting.

### 5. Your account
API keys (scope and expiry), My proxies, Profile, Account security (2FA, sessions) and About (version, update).

---

## FAQ

**The tour did not start at the end of the installation.**
Click the **?** icon at the top right. The automatic start only happens in the browser where the installation was just completed.

**Can I turn it off?**
Yes: quit with `Esc` or "Skip the tour". It never comes back by itself afterwards.

**It is not in my language.**
The tour follows the language chosen in the selector at the top right (French or English).

---

## For developers

Texts live in `web/src/lib/i18n/tour-fr.ts` and `tour-en.ts` (keys `tour.<id>.t` for the title and `tour.<id>.b` for the text). Steps are declared in `web/src/lib/tour/steps.ts`.

Highlighted elements are found through the `data-tour` attribute:

| Attribute | Element |
|---|---|
| `sidebar` | Side menu |
| `nav:<route>` | Menu link to a page (e.g. `nav:/subusers`) |
| `topbar-search`, `topbar-lang`, `topbar-theme`, `topbar-density`, `topbar-notifs` | Top bar |
| `content` | Main page area |
| `settings-tab:<key>` | Settings tab |

**Add a page or a tab to the tour**: add an entry in `steps.ts` and its two keys in `tour-fr.ts` and `tour-en.ts`. For a Settings tab, the tour opens it through the `uhq-tour-settings-tab` event; for the mobile menu, through `uhq-tour-sidebar`.
