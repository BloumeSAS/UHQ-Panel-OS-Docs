# Going live

Before opening the panel to your customers, the panel helps you check that everything is ready: **"First steps" checklist**, **diagnostics**, **connection test**, **public status page** and **installation protection**.

---

## "First steps" checklist

At the top of the **dashboard** (administrators), a card ticks the going-live steps by itself:

| Step | It is ticked when… |
|---|---|
| Public proxy host | a custom domain or IP is set (Settings → Proxy engine) |
| Proxy pool | at least one proxy or scraping source exists |
| Category | at least one category exists |
| Proxy account | at least one account exists |
| Connection test | an account test succeeded (see below) |
| Backups | automatic backups are enabled |
| 2FA | an administrator enabled 2FA, or it is required for everyone |

Each pending step has a **Go** link to the right page. The card hides with one click; it refreshes by itself.

### "No backup" banner
As long as automatic backups are off, a **red banner** shows on the dashboard. "Later" hides it for 24 hours. See [Backups and restore](/en/guide/sauvegardes).

---

## Diagnostics

**System → Diagnostics** menu: a series of automatic checks, each with a state (OK / Watch / Problem / Info) and an explanation of what to fix.

| Check | What it verifies |
|---|---|
| Proxy engine | the engine is listening on its port (990 by default) |
| Database | connection and response time |
| Public host | a custom host is set |
| **Domain (DNS)** | the domain resolves; it points to **this server**; it **does not go through Cloudflare** (orange cloud). Otherwise, the panel shows the **record to create** (type, name, value = server public IP, "DNS only") |
| **Category domains** | each category with a **custom domain** is checked the same way (DNS, Cloudflare, dedicated port), with the DNS record to create |
| Public proxy port | `host:port` is reachable *from the server* |
| Panel over HTTPS | the panel is served over HTTPS |
| Pool | at least one working proxy |
| Disk space | free space (warning below 5 GB, critical below 1 GB) |
| Backups | enabled, and latest backup recent (less than 48 h) |
| 2FA, captcha, e-mail | security and communication status |
| Panel URL | e-mail links point to the right place |

::: warning The port test runs from the server itself
It may wrongly report a failure behind some networks (NAT/hairpin). Also check from another device: `curl -x http://username:password@YOUR_HOST:990 http://ip-api.com`.
:::

---

## Test a connection

In **Proxy accounts**, the **Test connection** icon (plug) makes a **real request** through the engine with the account credentials, and shows:
- the **exit IP**, **country** and **ISP**;
- the **latency**.

On failure, the panel explains the cause: credentials refused, account blocked/expired/quota reached, too many connections, no upstream proxy available, timeout, engine stopped.

A few bytes of traffic are counted on the tested account. The test comes from `127.0.0.1`: an account limited to certain **allowed IPs** will be refused.

---

## Public status page

**Settings → General → Public status page** (off by default). Once enabled, `https://your-panel/status` is reachable **without signing in** and shows whether the service works:

| State | Condition |
|---|---|
| **Operational** | database, engine and pool work |
| **Degraded** | database and engine work, but no working proxy left |
| **Outage** | database or engine unavailable |

The page also shows the status of **enabled extensions** (Wallet, Orders…) and **connection ports** (shared port and categories' dedicated ports); a stopped extension or a port that does not answer switches the service to **Degraded**.

You can add a **message** (maintenance, ongoing incident…). The page exposes **no figures or internal details** (no internal port, no URL), only states and the ports your customers already use. With the [Status add-on](/en/addons/official/status) enabled, `/status` shows its richer page (90-day uptime, incidents).

---

## Protect the installation (automatic token)

Until the installation is finished, the `/setup` page is open: the first person to reach it would become administrator. To prevent that, the panel **generates an installation token automatically** on first start and **prints it in the logs**:

```
══════════════════════════════════════════════════════════════
  INSTALLATION À FAIRE — l'écran /setup est protégé.
  TOKEN D'INSTALLATION : Xk3b9...
══════════════════════════════════════════════════════════════
```

1. Open the container **logs** (Coolify → your application → *Logs*, or `docker logs <container>`).
2. Copy the **TOKEN D'INSTALLATION** (installation token) value.
3. Paste it in the **Installation token** field of the installation screens (database, administrator account creation, restore).

Details:
- The token is **kept in the data folder**: it stays the same if the container restarts (and is printed again in the logs at each start until installation is done).
- It is **deleted as soon as installation is finished**.
- **An already installed panel is not affected**: no token is generated or requested, nothing to redo on update.
- Without the right token, the server answers "401" on installation routes.

### Options (environment variables)
| Variable | Effect |
|---|---|
| *(nothing)* | token generated automatically (recommended) |
| `SETUP_TOKEN=your-value` | enforces **your** token instead |
| `SETUP_TOKEN=off` | disables the protection (not recommended on an exposed server) |

---

## Public panel URL (e-mail links)

**Password reset** and **invitation** e-mails contain a link to the panel. It is built **only from configuration** (never from the request `Host` header, to prevent link hijacking).

- **Settings → General → Public panel URL**: set it (`https://panel.example.com`) if the panel and the proxy do **not share the same domain** — typically when the proxy domain is "DNS only" (grey cloud) and does not serve the panel.
- If the field is empty, the panel uses `https://<public proxy host>`.
- While the public host is still the **product's default value**, **no** e-mail with a link is sent (the token would go to a domain that is not yours): set your domain first.

---

## Abuse protections

| Route | Limit |
|---|---|
| Sign-in | 5 attempts / minute for the same IP + e-mail pair, 20 / minute per IP |
| Sign-up | 5 / minute per IP |
| Forgot password | 5 / minute per IP |
| Password reset | 10 / minute per IP |

Add a **captcha** (Settings → Captcha) if sign-ups are open, and require **2FA** for administrators (Settings → Security). For device fingerprinting on these pages, see the [Security add-on](/en/addons/official/security).
