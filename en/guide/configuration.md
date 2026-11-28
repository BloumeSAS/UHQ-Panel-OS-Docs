# Configuration

Every setting can be edited from **Settings** in the admin panel (`/settings`). They are stored in the database — no redeploy needed after a change.

Each setting can have a fallback environment variable: if no value is stored in the database, the environment variable is used; otherwise, the database value wins.

---

## General

### `siteName`
- **Default:** `UHQ Panel OS by Bloume.fr`
- Name shown in the browser tab title and in e-mails.

### `defaultLang`
- **Default:** `fr`
- Default panel language. Available values: `fr`, `en` (and any language added in `web/src/lib/i18n/`).

### `registrationEnabled`
- **Type:** boolean — **Default:** `false`
- Lets visitors create an account via `/register`. Turn it off in production if sign-up is by invitation only.

### `invitationsEnabled`
- **Type:** boolean — **Default:** `false`
- Enables the invitation system. Existing users can invite new members.

### `maintenanceModeEnabled`
- **Type:** boolean — **Default:** `false`
- Puts the panel in maintenance. Non-admin users see a maintenance page and cannot sign in.

---

## Security (hardening v2.4.11 / v2.4.12)

These protections are **not** `SETTING_DEFS` — they are on by default, with no panel setting.

::: tip Rate limiting on login/forgot-password (since v2.4.11)
`/auth/login` and `/auth/forgot-password` are protected by an in-memory limiter (no external dependency): 5 attempts/min per IP+email on login (+ 20/min per IP against multi-account spraying), 5/min per IP on forgot-password. It comes on top of the captcha (`captchaProvider`), which is not configured by default on a fresh install.
:::

::: warning `trust proxy` = 1 hop (since v2.4.12)
The API declares (`app.set('trust proxy', 1)` in `main.ts`) that it trusts only **one** reverse proxy upstream (Traefik/Coolify, the standard deployment — see [Docker & Coolify](/en/guide/docker)) to read `X-Forwarded-For`/`req.ip`. **If you add a second reverse proxy in front of Traefik** (CDN, extra load balancer), adjust this hop count in `main.ts` — otherwise `req.ip` may resolve the wrong IP in the chain, which would skew the rate limiting above.
:::

::: tip Banned IPs (since v2.4.22)
Admin sidebar → **Banned IPs** (`/banned-ips`): bans one or more IPs (one per line) from using the proxy engine, **regardless of accounts** — a banned IP can no longer do anything with any credentials. Checked in memory as soon as the TCP connection is established, before the auth request is even read: the IP gets an HTTP 403 error and the connection is closed immediately. Optional reason and expiry; unban one by one or by multiple selection.

**Whitelist (since v2.15.1)**: the same page has an **Allowed IPs** section. An allowed IP is **never** banned — not by authentication auto-ban, not by anti-VPN, not by hand (the ban is refused). Useful when your website is no longer on the same server as the panel: add the website server's IP. Adding an IP lifts any existing ban; additions and removals are logged in the audit log.
:::

::: tip Enable 2FA on an admin account (since v2.4.22, enforced at sign-in since v2.4.28)
Click the **email / role** area at the top right of the panel → **Profile** → shortcut to **Security** → scan the QR code with a TOTP app → enter the 6-digit code to confirm. A **Profile** page (`/profile`, all roles) also lets you change your password.

⚠️ **Before v2.4.28, 2FA was never checked at sign-in** — it could be enabled in Security, but `POST /auth/login` issued a full JWT as soon as the password was valid. Update to v2.4.28 or later.

**Recovery codes (since v2.4.29)** — 10 single-use codes generated at activation, shown **only once** (copy or download them). Usable instead of the TOTP code on the sign-in screen if the device is lost. Can be regenerated from Security (requires the current TOTP code — immediately invalidates old codes).
:::

::: tip 2FA required for admins (since v2.4.29)
Setting `require2faForAdmins` (Settings → Security). Once on, any ADMIN account without 2FA is redirected to the Security page and has access to nothing else (except Profile/About) until it enables it — sign-in itself is never blocked, so an admin is never locked out of the panel.
:::

::: tip Anti-brute-force on the proxy engine (since v2.4.34)
Unlike `/auth/login` (protected since v2.4.11, see above), the proxy engine's Basic-Auth authentication (port 990) had no limit — an IP could chain dozens of auth failures without friction. Since v2.4.34, the IP is automatically banned above a configurable threshold (settings `proxyAuthAutoBanEnabled`/`proxyAuthFailBanThreshold`/`proxyAuthFailBanWindowSec`/`proxyAuthAutoBanDurationHours`, Settings → Security), through the same mechanism as manual bans (see **Banned IPs** above) + an in-app notification each time it triggers.
:::

---

## Public proxy

These settings define what is **shown to customers** to connect to the proxy. They do not affect the engine's real listening port (set by `PROXY_PORT` in `docker-compose.yml`).

### `publicProxyHost`
- **Default:** `prx.uhq.monster`
- **Env variable:** `PUBLIC_PROXY_HOST`
- Hostname or IP customers use to connect to the proxy. Must point straight to your server (**without** Cloudflare proxy, grey cloud).

### `publicProxyPort`
- **Default:** `990`
- **Env variable:** `PUBLIC_PROXY_PORT`
- Port shown to customers. Must match port `990` bound in `docker-compose.yml`.

::: warning Cloudflare
`publicProxyHost` must use a subdomain with the **grey cloud (DNS only)** in Cloudflare. Port 990 cannot be proxied by Cloudflare on the free plan. See [Docker & Coolify → DNS](/en/guide/docker#dns-and-cloudflare).
:::

### `proxyTimeout`
- **Default:** `3` (seconds)
- **Env variable:** `PROXY_TIMEOUT`
- Connection timeout to an upstream proxy. Raise it if you have slow proxies.

### `proxyRacingTimeout`
- **Default:** `1.5` (seconds)
- **Env variable:** `PROXY_RACING_TIMEOUT`
- Racing mode timeout (several upstreams tried in parallel, the fastest wins).

### `connectionIdleTimeout`
- **Default:** `600` (seconds = 10 min)
- **Env variable:** `CONNECTION_IDLE_TIMEOUT`
- Since v2.4.6. Closes a client↔upstream tunnel with no data exchanged for this delay. Without it, a client that disappears without a clean TCP close (machine switched off, network cut) never triggers a close event server side — the connection, and the thread it uses, stay counted as active forever.

---

## Scraper & Checker

::: warning The scraper and the checker never run at the same time (since v2.4.6)
Each can load and process up to ~150,000 proxies — the combined RAM/CPU of both at once already caused crashes/restarts in production. An internal `JobCoordinatorService` makes the second one wait (up to 30 min) for the other to finish instead of letting them overlap. No setting needed, it is automatic.
:::

### `scrapeInterval`
- **Default:** `3600` (seconds = 1 h)
- **Env variable:** `SCRAPE_INTERVAL`
- Interval between two proxy collection cycles from the configured sources.

### `proxyCheckInterval`
- **Default:** `900` (seconds = 15 min)
- **Env variable:** `PROXY_CHECK_INTERVAL`
- Interval between two pool health check cycles.

### `geoResolveInterval`
- **Default:** `600` (seconds = 10 min)
- **Env variable:** `GEO_RESOLVE_INTERVAL`
- Geo-resolution interval for IPs without a known country.

### `checkerConcurrency`
- **Default:** `500`
- **Env variable:** `CHECKER_CONCURRENCY`
- Number of parallel workers for health checks. Raise it on a powerful server, lower it if the CPU saturates.

### `skipDeadProxies`
- **Type:** boolean — **Default:** `true`
- When on, proxies marked dead (`isWorking: false`) are **not** re-checked or re-imported by the scraper.

### `deadProxyMaxRetries`
- **Default:** `3`
- Number of consecutive failed checks before a proxy is considered **permanently dead** and ignored. Only works if `skipDeadProxies` is on.

### `auditLogRetentionMonths`
- **Default:** `12`
- Age (in months) beyond which audit log lines are purged automatically (daily scheduled task, since v2.4.19).

### `notificationRetentionDays`
- **Default:** `30`
- Age (in days) beyond which in-app notifications are purged automatically (since v2.4.25). A **Purge** button (notification bell, admin) also empties the table immediately.

### `require2faForAdmins`
- **Type:** boolean — **Default:** `false`
- Since v2.4.29. See "2FA required for admins" above.

### `poolHealthSnapshotRetentionDays`
- **Default:** `7`
- Since v2.4.32. Retention of the **Pool evolution** chart history (Analytics).

### `trafficSnapshotRetentionDays`
- **Default:** `7`
- Since v2.4.32. Retention of the **Traffic volume** chart history (Analytics).

### `proxyAuthAutoBanEnabled`
- **Type:** boolean — **Default:** `true`
- Since v2.4.34. See "Anti-brute-force on the proxy engine" above.

### `proxyAuthFailBanThreshold`
- **Default:** `15`
- Since v2.4.34. Number of proxy authentication failures (per IP) beyond which the IP is banned automatically.

### `proxyAuthFailBanWindowSec`
- **Default:** `60` (seconds)
- Since v2.4.34. Sliding window over which proxy authentication failures are counted.

### `proxyAuthAutoBanDurationHours`
- **Default:** `24` (hours)
- Since v2.4.34. Duration of the automatic ban triggered by `proxyAuthFailBanThreshold`.

::: tip HTTP liveness test (since v2.4.2)
The checker now tests **HTTP** proxies with an absolute-form `GET` rather than a `CONNECT` — many low-end HTTP proxies only support GET relaying and reject `CONNECT`, which wrongly marked them dead before. SOCKS4/5 proxies still use the classic SOCKS negotiation, unchanged.
:::

### `scraperProxy`
- **Type:** secret
- **Env variable:** `SCRAPER_PROXY`
- Outbound proxy used by the scraper (any format: `http://user:pass@ip:port`, `socks5://ip:port`). Useful if your server is blocked on some sources. It is never used as a customer fallback (see [Errors & fallback](/en/guide/erreurs-et-fallback)).

### `groqApiKey`
- **Type:** secret
- **Env variable:** `GROQ_API_KEY`
- Groq API key for the AI-assisted scraping provider. Get a free key on [console.groq.com](https://console.groq.com).

::: warning Groq models retired without notice (since v2.4.8)
Groq removes models from its catalogue without long notice — `gemma2-9b-it` for example was retired and broke the "Detect pattern automatically" helper (scraper sources) with `HTTP 400 "no longer supported"`. The fallback models (v2.4.10: `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` → `openai/gpt-oss-20b`) are hard-coded in `scraper-sources.controller.ts` — if the "no longer supported" error comes back, check [console.groq.com/docs/deprecations](https://console.groq.com/docs/deprecations) and update the list.
:::

---

## SMTP & E-mails

### `smtpHost`
- **Env variable:** `SMTP_HOST`
- SMTP server address. E.g. `smtp.gmail.com`, `mail.example.com`.

### `smtpPort`
- **Default:** `587`
- **Env variable:** `SMTP_PORT`
- SMTP port. `587` = STARTTLS, `465` = SSL/TLS, `25` = unencrypted.

### `smtpUser`
- **Env variable:** `SMTP_USER`
- SMTP login (usually the e-mail address).

### `smtpPass`
- **Type:** secret
- **Env variable:** `SMTP_PASS`
- SMTP password.

### `smtpFrom`
- **Env variable:** `SMTP_FROM`
- Address shown as sender. E.g. `UHQ Panel <noreply@example.com>`.

### `smtpSecure`
- **Type:** boolean — **Default:** `false`
- **Env variable:** `SMTP_SECURE`
- Turn on if the port is `465` (direct SSL/TLS connection, no STARTTLS).

### E-mail notifications

| Setting | Default | Description |
|---|---|---|
| `emailOnRegister` | `false` | Welcome e-mail sent on sign-up |
| `emailOnLogin` | `false` | Alert sent on every sign-in |
| `emailResetEnabled` | `false` | Enables the "Forgot password" link on the sign-in page |

Templates, texts and previews: see [E-mails & templates](/en/guide/emails).

### Automatic reports

| Setting | Default | Description |
|---|---|---|
| `smtpReportsEnabled` | `false` | Enables periodic e-mail reports |
| `smtpReportEmail` | — | Report recipient address |
| `smtpReportFrequency` | `daily` | Frequency: `daily`, `weekly`, `monthly` |

---

## Captcha

### `captchaProvider`
- **Default:** `none`
- Captcha provider for public forms (sign-in, sign-up, password reset).
- Values: `none` \| `hcaptcha` \| `recaptcha` \| `turnstile` \| `cap`

### `captchaSiteKey`
- Public key of the captcha provider.

### `captchaSecretKey`
- **Type:** secret
- Secret key of the captcha provider (server-side verification).

### `captchaCapEndpoint`
- Base URL of the CAP instance. Only if `captchaProvider = cap`. E.g. `https://cap.trycap.dev`.

---

## Webhooks (Discord / Slack / BloumeChat)

### Discord

| Setting | Default | Description |
|---|---|---|
| `discordAlertsEnabled` | `false` | Enables Discord notifications |
| `discordWebhookUrl` | — | Discord webhook URL |

### Slack

| Setting | Default | Description |
|---|---|---|
| `slackAlertsEnabled` | `false` | Enables Slack notifications |
| `slackWebhookUrl` | — | Slack webhook URL |

### BloumeChat

| Setting | Default | Description |
|---|---|---|
| `bloumechatAlertsEnabled` | `false` | Enables BloumeChat notifications |
| `bloumechatWebhookUrl` | — | BloumeChat webhook URL (format `https://bloumechat.com/api/v2/webhooks/<id>/<token>`) |

Each service has a **Test webhook** button in the panel (Settings → Webhooks) that sends an immediate test message to the **saved** URL (save before testing).

Notifications are sent on important events: dead proxy, low pool threshold, quota exceeded, etc. See also [Monitoring and alerts](/en/guide/surveillance).

---

## Database backups

### `backupDatabaseEnabled`
- **Type:** boolean — **Default:** `false`
- Enables scheduled automatic backups.

### `backupIntervalCron`
- **Default:** `0 0 * * *` (every day at midnight)
- Cron expression for the backup frequency.

::: tip Quiet window before a scheduled backup (since v2.4.6)
A **scheduled** backup (cron) waits for the scraper and checker to be idle, and for traffic to be reasonable (≤100 active threads), before actually starting — up to 20 minutes, then it starts anyway so a scheduled cycle is never skipped. A **manual** run ("Run a backup" in the panel) stays immediate.
:::

::: tip Streamed backup (since v2.4.5)
On a large database (several GB), the backup no longer loads each whole table into memory. Large tables (`UserProxy`/`ProxyUsage`/`BackendProxy`) are read in pages of 5,000 rows and streamed directly; S3 upload uses automatic multipart (`@aws-sdk/lib-storage`), with no size limit.
:::

### `backupStorageType`
- **Default:** `local`
- Backup destination: `local` (directory on the server) or `s3` (S3-compatible bucket).

### Local storage

| Setting | Default | Description |
|---|---|---|
| `backupLocalPath` | `./data/backups` | Absolute or relative backup directory path |

### S3 storage

| Setting | Default | Description |
|---|---|---|
| `backupS3Endpoint` | — | S3 endpoint URL (e.g. `https://s3.eu-west-3.amazonaws.com`) |
| `backupS3Bucket` | — | Bucket name |
| `backupS3AccessKey` | — | Access key |
| `backupS3SecretKey` | — | Secret key (encrypted in the database) |
| `backupS3Region` | `us-east-1` | AWS / compatible region |

::: tip Manual backup: destination independent from the automatic cycle
The **Run a backup** button (Settings → Backups) has its own Local/S3 selector: it forces the destination of **this run only**, without touching `backupStorageType` or the scheduled cycle.
:::

::: tip Test the S3 connection
A **Test connection** button validates bucket + credentials (light `ListObjectsV2`) without running a backup — an empty/masked field falls back to the saved value.
:::

::: tip Non-blocking trigger (large databases)
`POST /backup/run` answers immediately (the run happens in the background) — essential for a database of several hundred MB, whose backup can far exceed the reverse proxy timeout. The panel polls `GET /backup/run-status` to show the real result once done.
:::

See also [Backups and restore](/en/guide/sauvegardes).

---

## Legacy API key

### `apiKey`
- **Type:** secret
- Authentication key for the `/api/v1/*` routes (legacy API).
- Send it in the `X-API-Key` header or as the Basic auth password.
- Can be regenerated from **Settings → API key** without redeploying.
- **Never** change it through `PUT /settings` — use the dedicated endpoints.

::: danger
The legacy API key gives full access to the `/api/v1/*` routes. Only share it with trusted systems.
:::

---

## Dashboard (database stats)

Since v2.4.2, the **Settings → Dashboard** tab shows:
- the **PostgreSQL database size on disk** (`pg_database_size`);
- the **row count** of the main tables (pool proxies, proxy accounts, usage/traffic rows, audit logs, scraper sources).

It is an on-demand read (`GET /api/panel/monitoring/db-stats`), not continuous polling — click **Refresh** to update.

::: tip Manual proxy import
The API's JSON request size limit went from 100 KB (NestJS default) to **25 MB** in v2.4.2 — manually importing a large proxy list (Proxy pool → Import) no longer returns "entity too large".
:::

---

## Infrastructure settings (environment variables only)

These settings are **not** managed by the panel — they must be set in `docker-compose.yml` or the environment variables:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL URL (required outside the all-in-one compose) |
| `PROXY_PORT` | `990` | Real listening port of the TCP proxy engine |
| `API_PORT` | `8000` | NestJS API listening port |
| `DATA_DIR` | `/app/data` | Persistent data directory |
| `LOG_DIR` | `/app/logs` | Daily log files directory |
| `LOG_LEVEL` | `log` | Verbosity threshold (`verbose`, `debug`, `log`, `warn`, `error`, `fatal`) — `error` is always emitted whatever the threshold (since v2.4.19) |
| `TZ` | `Europe/Paris` | Time zone |

---

## Real visitor IP behind Cloudflare

When the **web panel** goes through Cloudflare (orange cloud) in front of Coolify/Traefik, connections arrive from Cloudflare IPs. The panel **detects this automatically**: if the request really comes from an official Cloudflare IP (IPv4 and IPv6 ranges), it reads the `CF-Connecting-IP` header; otherwise the header is ignored (a visitor bypassing Cloudflare cannot spoof their IP). Result: **Security → Active sessions**, the audit log, rate limits and "new IP" alerts show the visitor's real IP, with no setting.
