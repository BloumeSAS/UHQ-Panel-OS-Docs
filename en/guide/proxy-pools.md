# Proxy categories (Proxy Pools)

**Proxy Pools** split your proxy stock into named categories (e.g. Datacenter, Residential, Mobile) and assign proxies, scraping sources and sub-user accounts to them.

## Concept

By default, the proxy engine draws from **all** active proxies. With pools, each sub-user can be confined to a subset — which lets you offer distinct plans (datacenter vs. residential) from a single instance.

```
Pool "Datacenter"  →  BackendProxy × N  →  ScraperSource × M
                   →  UserProxy (assigned sub-users)
                        └─ the proxy engine filters automatically
```

## Create a pool

Go to **Proxy Pools** (side menu, Layers icon), then click **New pool**.

| Field | Required | Description |
|---|---|---|
| Name | Yes | Unique identifier (e.g. `Datacenter`, `Mobile`) |
| Description | No | Free internal note |
| Colour | No | Label colour in the panel (swatch or hex) |

::: warning Name = link key
The name is stored as is on proxies, sources and sub-users. Renaming a pool does **not** update the items already assigned.
:::

## Assign proxies to a pool

### Through import

In **Proxy pool → Import**, the **Assign to pool** field labels the whole imported list at once.

### Through the scraper

On each scraping source (**Scraper** page), the **Pool** field tells which category scraped proxies go into. The `DynamicProvider` applies the label automatically on ingestion.

### Manually (API)

```http
PATCH /api/panel/proxies/:id
X-Authorization: Bearer <jwt>

{ "pool": "Datacenter" }
```

## Assign a sub-user to a pool

In **Sub-users → Create / Edit**, select a pool in the **Pool** field. Leave it empty to give access to the whole shared stock.

As soon as the sub-user is assigned:

1. The proxy engine filters `proxyPoolCache` on `pool === user.pool`.
2. If the pool is empty or does not exist, the connection is refused (no upstream available).
3. Private lists (`customProxies`) **ignore** the pool — they are always used as is.

## Dedicated ports

In addition to the shared port (`990` by default, unchanged), a **pool** or a **sub-user** can get a dedicated TCP port, customisable between **9000 and 9999** (range published by Docker — see [Docker & Coolify](/en/guide/docker#dedicated-ports)).

### Port dedicated to a pool

In **Proxy Pools → Create / Edit**, fill in a **Dedicated port**. Any authenticated connection on this port uses **this pool**, even if the connecting account has another default category — a single account can thus reach several categories just by changing port (e.g. `:9001` → Mobile, `:9002` → Datacenter).

### Port dedicated to a sub-user

In **Sub-users → Create / Edit**, fill in a **Dedicated port**. It is an **exclusive lane**: any other credentials (even valid elsewhere) are refused on this port. Otherwise it behaves exactly like the shared port (same pool resolution, same sessions, same quotas) — authentication stays mandatory, this port does not bypass it.

::: warning Port range
A port outside 9000-9999 is refused by the API. If you need another range, widen it in `docker-compose.yml` (`ports:` + `PROXY_PORT_RANGE`) **before** redeploying — see [Docker & Coolify](/en/guide/docker#dedicated-ports).
:::

Ports are enabled and disabled **live** as soon as they are saved in the panel, without restarting the API.

## Dedicated domain

On top of the port, a **pool** or a **sub-user** can get a **domain** shown in its lists/connections (e.g. `mobile.example.com`) — useful to present an offer under your own brand/domain rather than the global host.

It is **purely informational (DNS)**: unlike the port, the domain changes nothing in the engine's real network binding — the domain just has to point (DNS `A`/`CNAME`) to the same IP as your instance, exactly like `publicProxyHost`.

### Resolution

For a connecting account, the `host:port` shown in a sticky list (or by the format generator of **My Proxies**) is resolved in cascade:

1. The account's **own** domain/port, if set.
2. Otherwise, the domain/port of **its pool** (if assigned and set).
3. Otherwise, `publicProxyHost`/`publicProxyPort` (Settings > Public proxy).

Example: an account without its own domain, assigned to the "Mobile" pool (domain `mobile.example.com`, port `9114`), gets lists in the format `mobile.example.com:9114:user:session:pass` — without configuring anything on the account itself.

::: tip Like the port, but without range constraint
A domain is not a port: no uniqueness or range required (several pools/accounts can share the same domain if it points to the same instance).
:::

### Where this resolution applies

The cascade (account → pool → global settings) is used by **every** endpoint that returns a connection for an account:

- Panel: `GET /api/panel/subusers/:id/sticky-list`, `GET /api/panel/me/proxies/:id/sticky-list`, and the lists (`effective_host`/`effective_port` on top of the raw `port`/`domain` fields).
- Legacy API (`/api/v1`): `GET /api/v1/sub-user/list`, `GET /api/v1/sub-user/get-sticky-proxies`, `GET /api/v1/me/proxies`, `GET /api/v1/me/proxies/sticky-list` — all return the resolved `host`/`port`, never just the raw global value.

Each sticky list also includes a **rotating** format without session (`rotating: "username:password@host:port"`), handy for clients that do not need the full sticky format.

::: warning Sticky format: 4 fields since v2.4.5
`host:port:user:session:pass` (5 fields) was rejected by most proxy software, which only accepts the classic 4-field format. The generator now produces `host:port:user-session-XXXX:pass`: the session is embedded in the username with the `-session-` suffix (a convention recognised by most proxy software), and the engine understands it natively (`ProxyServerService.authenticate`). Old 5-field lists already generated/shared keep working — the engine accepts both formats.
:::

## Upstream selection (rotation & trust score)

Since v2.4.2, choosing the `BackendProxy` for a connection is no longer a uniform draw among the "best" (top-N by success/latency): each candidate gets a **trust score** = success rate × 1/latency², and the engine does a **weighted draw** (roulette wheel) among candidates rather than a plain `random()` on a fixed subset.

A proxy that was just selected also gets a **cooldown penalty** (60 s, fading progressively): it stays favoured if it is objectively the best, but is no longer reused in a loop 24/7 — traffic spreads more over the whole well-performing stock instead of hammering the same IPs.

::: tip Why this change
Before, a uniform draw in a fixed top-N always favoured the same few proxies (those that entered the top first), while the rest of the qualified stock almost never served. Trust score + cooldown spread the load without sacrificing average performance.
:::

::: warning Per-pool cache, no truncation by success (v2.4.4 / v2.4.5)
The selection memory cache used to be a single global "top-N" across all pools, sorted by success rate — a dedicated pool full of well-performing proxies then prevented the engine from ever "seeing" a freshly added manual proxy (`successCount: 0`) in that pool. Fixed in two steps: the cache is built **per pool** (v2.4.4), then the sort by success before truncation was removed (v2.4.5) — each pool now sees all its active stock, and the trust score arbitrates at selection time.
:::

## "Selectable country" proxies (since v2.4.13)

Some providers (residential or datacenter) expose **a single gateway** that serves several countries depending on the username sent, rather than fixed-country IPs. For these proxies, the real country is never in the database `country` column — it is decided at connection time by rewriting the username.

Two levels, not to be confused:

| Level | Where to configure it | What it affects |
|---|---|---|
| **Pool** — `fallbackCountryFormat` | Pool edit (Proxy Pools) | The category's fallback proxy — one format per pool (see also "Country in the username" below) |
| **Proxy** — `countryFormat` | Manual import ("Selectable country proxies" toggle) or multiple selection + action bar (Proxy pool) | The pool's real `BackendProxy` rows — **a different format per proxy**, so several providers with different conventions can live in the same category |

### Username template

A template is a string with placeholders:

- `{user}` — the original username stored in the database
- `{country}` — the target country code, **lowercase**
- `{COUNTRY}` — the target country code, **UPPERCASE**

It must contain `{country}` or `{COUNTRY}` (validated on save, otherwise an explicit error) — `{user}` is **optional**: a full-replacement template like `dc-{country}` (which deliberately ignores the original username) is a legitimate use. Real examples:

| Template | Stored `user` | Result for FR |
|---|---|---|
| `{user}__country__{country}` (default) | `abc123` | `abc123__country__fr` |
| `{user}-country-{country}` | `abc123` | `abc123-country-fr` |
| `dc-{country}` | `dc-any` (ignored) | `dc-fr` |
| `{user}-{COUNTRY}` | `rotating` | `rotating-FR` |

The username is rewritten **only at connection time** (right before the CONNECT/handshake) — whether through a normal weighted draw or a reused sticky session. The username stored in the database stays as is.

::: warning Several countries: random draw (since v2.4.17)
If the requested country filter contains several comma-separated codes (e.g. `IT,FR,US` — an account's country filter), a code is drawn **at random** from the list on each connection. Before v2.4.17, it was always the first code of the list.
:::

### Edit the format on already imported proxies

Since v2.4.15, **Proxy pool** page: per-row checkboxes (+ select all in the header) and a grouped action bar appears as soon as a selection exists — applies or removes (`countryFormat: null`, back to classic fixed country) a template on the whole selection. The "Country" column shows the configured template as a badge instead of the static country when set.

```http
PATCH /api/panel/monitoring/proxies/country-format
Authorization: Bearer <jwt>
Content-Type: application/json

{ "ids": ["id1", "id2"], "countryFormat": "{user}-country-{country}" }
```

## Static session (temporary credentials)

Since v2.4.2, on top of the sticky format, **My Proxies → Generate** offers a **Static session** preset that generates dedicated **temporary** credentials:

```
GET /api/panel/me/proxies/:id/static-session?count=10&ttl=1800
```

Each returned line is a plain `host:port:user:pass` (no visible session field) — but each user/pass pair is **unique**, pinned to its own upstream for `ttl` seconds (like a sticky session), then expires automatically. Useful for clients/software that only accept the classic 4-field format and cannot handle a separate "session" field.

## Blocked domains

Since v2.4.26, each sub-user account can have a list of **forbidden domains**. It blocks the exact domain **and** its subdomains (e.g. `example.com` also blocks `api.example.com`).

Checked in memory as soon as the connection is established, **before even using a thread slot** — CONNECT (HTTPS) as well as plain HTTP, the target domain name is always known from the request line (the engine does not need to see encrypted content). An attempt to reach a blocked domain gets an immediate HTTP 403 error.

Configurable in three places, all equivalent (same database field):

- **Admin panel** — Sub-users → create/edit → **Blocked domains** field (one per line).
- **Self-service** — My Proxies (owner account) → Edit.
- **Sub-user API** (`/api/v1/sub-user`, X-API-Key):

```http
POST /api/v1/sub-user/create
Content-Type: application/json

{ "label": "Customer A", "blocked_domains": "example.com,other.net" }
```

```http
POST /api/v1/sub-user/update
Content-Type: application/json

{ "id": "subuser_id", "blocked_domains": "example.com,other.net" }
```

```http
POST /api/v1/sub-user/blocked-domains/add
Content-Type: application/json

{ "id": "subuser_id", "domains": ["third-site.com"] }
```

`blocked-domains/add` **merges** with the existing list (like `allowed-ips/add`) — handy to add a domain without reading and rewriting the whole list.

```http
POST /api/v1/sub-user/blocked-domains/remove
Content-Type: application/json

{ "id": "subuser_id", "domains": ["third-site.com"] }
```

Removes the given domains from the list (since v2.4.27) — the counterpart of `blocked-domains/add`.

```http
POST /api/v1/sub-user/blocked-domains/set
Content-Type: application/json

{ "id": "subuser_id", "domains": ["example.com", "other.net"] }
```

`blocked-domains/set` (since v2.4.27) **fully replaces** the list, unlike `add`/`remove` — handy for a client that wants to resync the whole state in one call rather than compute a diff.

## Always online

A pool can be marked **Always online**: its `BackendProxy` rows are then never tested by the checker (so never marked KO/dead) — they stay shown as **OK** in the Proxy pool. This setting is **independent** from the extra countries/IPs below: it only controls checker behaviour, nothing on the stats side.

### Checker behaviour

- Proxies of an `alwaysOnline` pool are **excluded** from each check cycle (never mass-tested).
- At the start of each cycle, any proxy of this pool still marked dead is **forced** to `isWorking = true`.
- The **Test** button (manual per-proxy test) still runs the real test (visible diagnosis), but the persisted result never marks this proxy KO if its pool is `alwaysOnline`.
- The scraper already marks nothing dead on its side (only the checker tests real connectivity) — no change needed there.

## Active checker

Each pool has an **Active checker** toggle (on by default). When off, the checker's automatic cycle fully ignores the pool's proxies:

- No test runs on these proxies during the cycle.
- Their status (`isWorking`) stays **frozen as is** — unlike **Always online**, this setting forces **nothing**: it is a real "hands off", without lying about the displayed status.
- The manual **Test** button keeps working in every case (on-demand diagnosis).
- A pool can combine both settings (`alwaysOnline` + `checkerEnabled: false`), in which case it is simply excluded from the cycle without being forced online at each pass.

A **Checker disabled** badge is shown in the category list when this setting is active.

## Extra countries and IP count (simulated stats)

**Independently from "Always online"** (no need to enable it), any pool can declare countries and a number of IPs **on top of** its real stats — useful to present wider geographic coverage without depending only on the real scraped stock.

In **Proxy Pools → Create / Edit**:

| Field | Description |
|---|---|
| Shown countries | 2-letter ISO codes separated by commas (e.g. `FR,DE,US,GB`) — **no limit** on the number of countries |
| Priority countries | Optional — subset of the countries above that always draw higher (see [Priority countries](#priority-countries) below) |
| IP count | **Fixed value** (a number) or **Random** (a range, e.g. 100,000–300,000) |
| Rotating mode | Optional — interval in seconds (see [Rotating mode](#rotating-mode) below) |

::: tip Each country has its own IP count
Since v2.0.20, the configured range is **not** a shared total split across the listed countries: **each country draws its own number independently** in `[min, max]`. Adding a country to the list gives it its own draw immediately, without changing the figures already shown for other countries.
:::

In random mode (rotation off), each country's number is **drawn once** and stays stable (no value changing on every request) — it is only redrawn if:
- you change the min/max range (all countries are redrawn in the new range);
- the country was just added to the list (only it gets a new draw, the others stay stable);
- you click the **Regenerate simulated IPs** button (in the edit dialog) — it forces a new draw for **all** configured countries, without touching the range.

::: tip Additive, never a replacement
The countries/IPs declared here are **added** to the pool's real stats — a pool without any real proxy will show only the simulated figures, while a pool with real stock shows real + simulated combined (per country).
:::

### Rotating mode

Since v2.0.21, instead of a stable number per country, you can enable a **rotating mode**: enter an interval in seconds, and the IP count shown for each country **changes automatically** at each elapsed time window — with no scheduled task or database write, the number is recomputed on the fly at each `category-stats` call from the current time.

- Requires a configured min/max range (rotating mode draws in this range, just like stable random mode).
- The draw is deterministic per time window: two calls in the same N-second window return exactly the same number; as soon as the next window starts, the number changes.
- While rotating mode is on, the **Regenerate simulated IPs** button is hidden in the panel (it would have no visible effect).
- Turning rotating mode off falls back to the last known stable value per country.

### Priority countries

Since v2.0.22, you can mark a subset of the shown countries that must **always** draw a higher IP count than non-listed countries — useful so one or two "flagship" countries (e.g. your main market) always come out on top, regardless of the draw.

Mechanics: the `[min, max]` range is split into two disjoint halves — priority countries draw in the upper half, all others in the lower half. The guarantee holds **whatever each draw is** (even the lowest possible priority value stays above the highest possible non-priority value), in both stable and rotating mode.

::: tip No effect with a fixed value
A `min == max` range ("Fixed value" mode) leaves no room to split two halves — all countries then get the same number, priority or not. Priority countries only have an effect in "Random" (range) mode.
:::

Changing the priority country list triggers a new draw for **all** configured countries (like a range change) — the guarantee must stay valid for the whole set.

### Impact on the legacy API

`GET /api/v1/common/category-stats?pool=<name>` returns, for a pool with extra countries/IPs configured, the real stats **increased** by the simulated figures (an independent total per country, stable between calls):

```json
{
  "status": "success",
  "pool": "Residential Premium",
  "data": {
    "countries_count": 4,
    "ip_count": 247813,
    "proxy_count": 247813,
    "by_country": { "US": 89421, "FR": 71204, "DE": 52188, "GB": 35000 }
  }
}
```

::: warning Purely declarative
These stats neither add nor move any real `BackendProxy` — it is only what `category-stats` shows. Other endpoints (`pool_stats`, `countries`, `proxies`) are not affected and keep reflecting real data.
:::

## REST API (admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/panel/proxy-pools` | List all pools |
| `POST` | `/api/panel/proxy-pools` | Create a pool |
| `PATCH` | `/api/panel/proxy-pools/:id` | Edit name / description / colour |
| `POST` | `/api/panel/proxy-pools/:id/reroll-fake-ips` | Redraw the simulated IP count of each configured country (range unchanged) |
| `DELETE` | `/api/panel/proxy-pools/:id` | Delete a pool |
| `DELETE` | `/api/panel/proxy-pools/:id/proxies` | **Empty the category** (since v2.4.6, in the background since v2.4.7): deletes all the pool's `BackendProxy` rows, without touching the pool itself |
| `GET` | `/api/panel/proxy-pools/:id/proxies/clear-status` | Status of the ongoing emptying (since v2.4.7) — `{running, deleted, error}` |

::: tip Empty a category without deleting it
`pool` is a plain denormalised string on `BackendProxy` (no FK) — deleting a pool never cleaned its proxies (they stayed with a `pool` pointing to a name that no longer exists). The **Empty the category** button (eraser icon, Proxy Pools page) solves this directly: all the category's proxies disappear, but its port/domain/simulated stats stay configured.
:::

::: warning Deletion in the background (since v2.4.7)
`DELETE /:id/proxies` triggers the deletion and answers immediately (`{started: true}`) — on a very large category (tens/hundreds of thousands of proxies), waiting for the end exceeded the reverse proxy timeout. The real deletion runs in the background in batches of 5,000 ids; the panel polls `GET /:id/proxies/clear-status` to know when it is done.
:::

Creation example:

```http
POST /api/panel/proxy-pools
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Residential",
  "description": "FR/DE residential IPs",
  "color": "#10b981",
  "port": 9002,
  "domain": "residential.example.com",
  "alwaysOnline": true,
  "fakeCountries": "FR,DE,US,GB",
  "fakeIpCountMin": 100000,
  "fakeIpCountMax": 300000
}
```

## Anti-VPN (since v2.4.36)

Each pool can enable the **Anti-VPN** option (`antiVpnEnabled`, panel → Proxy Pools → create/edit). Once on, any authenticated connection on this pool whose **client IP** (not the upstream — the IP of the person connecting to your proxy) is identified as a VPN/hosting provider is:
1. **Refused** immediately (`403 Forbidden`, before any thread is counted);
2. **Banned automatically**, through the same `BannedIp` table as other bans (manual, anti-brute-force auto-ban — see [Configuration → Security](/en/guide/configuration)), so visible and revocable from **Banned IPs**. Configurable duration: `vpnBanDurationHours` setting (Settings → Security → Anti-VPN, default 24 h, since v2.4.37). IPs in the **whitelist** are never banned;
3. Notified in-app (🛡️ "IP banned automatically (VPN)").

### Detection: proxycheck.io + DB-IP Lite database (two combined signals)

`VpnDetectionService` combines two sources — an IP is considered a VPN if **either** detects it:

**1. [proxycheck.io](https://proxycheck.io) (since v2.4.37, main signal)** — one network request per IP (`GET https://proxycheck.io/v2/{ip}?vpn=1`), result cached 6 h per IP to limit the request volume. Works without an API key (reduced free quota); a free proxycheck.io key can be entered in **Settings → Security → Anti-VPN → proxycheck.io API key** (`vpnCheckApiKey`, secret) to raise the quota.

**2. Local DB-IP Lite ASN database (free, complement/safety net)** — DB-IP does not publish a "VPN" flag, only the **ASN organisation** owning each IP range.
- downloads the `dbip-asn-lite-{year}-{month}.csv.gz` file (free, no API key) once a month (cron on the 1st at midnight), with automatic fallback to the previous month if the current one is not published yet;
- builds a sorted table of IP ranges (v4 and v6) in memory, binary search at connection time;
- marks an IP as a VPN if its ASN organisation name contains a keyword from a hard-coded list (known hosts — OVH, Hetzner, DigitalOcean, AWS, Azure, Google Cloud... — and known VPN brands — NordVPN, ExpressVPN, Mullvad, ProtonVPN...).
- checked first (local, zero network latency) — the proxycheck.io call is only made if it detects nothing, to save the API quota.

::: warning A heuristic, not absolute truth
Before v2.4.37, the ASN database alone missed some VPNs whose IP is not hosted at a provider recognisable by name. proxycheck.io covers that case much better, but neither signal is infallible either way: a small misclassified provider may be flagged wrongly, a very discreet VPN may pass. Only enable this option on pools that really need it (e.g. anti-fraud protection on a targeted offer), not by default on the whole stock.
:::

::: tip Fail-open if both signals are unavailable
If proxycheck.io is unreachable/over quota AND the local ASN database is missing/corrupt, `isVpn()` returns `false` rather than blocking all traffic — better to let a VPN through now and then than cut access for everyone.
:::

The downloaded DB-IP file is cached on disk (`api/data/geoip/dbip-asn-lite.csv.gz`, ignored by Git) — a restart does not re-download immediately if the month's file is already there.

## Prisma schema

```prisma
model ProxyPool {
  id             String   @id @default(cuid())
  name           String   @unique
  description    String?
  color          String?  @default("#6366f1")
  port           Int?     @unique
  domain         String?
  alwaysOnline   Boolean  @default(false)
  checkerEnabled Boolean  @default(true)
  antiVpnEnabled Boolean  @default(false)
  fakeCountries          String?
  fakePriorityCountries  String?
  fakeIpCountMin         Int?
  fakeIpCountMax         Int?
  fakeIpCountByCountry   Json     @default("{}")
  fakeIpRotateSeconds    Int?
  createdAt              DateTime @default(now())
}
```

The `pool String?` field is added on `BackendProxy`, `UserProxy` and `ScraperSource`. It is an **intentional denormalisation** (the name is stored directly, without FK) to simplify the engine's queries and filters.

The `port Int? @unique` field is added on `ProxyPool` **and** `UserProxy` (dedicated port — see [Dedicated ports](#dedicated-ports) above). `domain String?` (no uniqueness constraint) is also added — see [Dedicated domain](#dedicated-domain) above. `alwaysOnline`/`checkerEnabled`/`fakeCountries`/`fakePriorityCountries`/`fakeIpCountMin`/`fakeIpCountMax`/`fakeIpCountByCountry`/`fakeIpRotateSeconds` are specific to `ProxyPool`. `null`/`false`/`{}` = no dedicated value, fallback to global settings. `fakeIpCountByCountry` is a map `{ "FR": 12345, "DE": 8901 }` (key = country code, value = IP count drawn for THAT country) — recomputed per country, never as a shared total; ignored if `fakeIpRotateSeconds` is active. `fakePriorityCountries` is a subset (same codes) of `fakeCountries`.

## Country in the username (`dc-{country}` gateways)

Some providers serve several countries with **a single address**: the country is chosen in the username (`dc-fr`, `user-country-fr`…). Two places, two roles:

| Setting | Applies to |
|---|---|
| **Username format per country** (category dialog) | the category's **backup proxy** (fallback), and — if the option below is ticked — its proxies |
| **Apply this format to the category's proxies** (checkbox, since v2.8.4) | every proxy **with credentials** in the category that has no format of its own |
| **"Selectable country" proxies** (Import / Pool) | a format **per proxy or per imported batch** (takes precedence over the category's) |

Example: *Mobile Lite* category, format `dc-{country}`, box ticked, account with country **FR** → the proxy receives the username `dc-fr` (with the proxy's password). Leave it unticked if the category contains fixed-country proxies with credentials.

## VPNs as proxies

A VPN (OpenVPN, WireGuard, V2Ray) can be added to a category like a proxy, with an automatic VPNGate source and country choice: see [VPN in categories](/en/guide/vpn).
