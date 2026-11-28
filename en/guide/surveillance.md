# Monitoring and alerts

Since **v2.4.85**, the panel monitors the server itself and warns you **before** your customers complain.

---

## What is monitored

Every minute (after a 90-second start-up delay):

| Check | Alert when… | Severity |
|---|---|---|
| **Proxy engine** | it no longer answers on its port (990 by default) | critical |
| **Database** | it no longer answers (5 s timeout) | critical |
| **Disk** | less than 2 GB free (critical below 500 MB) | warning / critical |
| **Backups** | they are enabled but the last one is older than 48 h | warning |
| **Scheduled backup** | an automatic backup **fails** (immediate alert) | critical |
| **Proxy pool** | pool health drops below the threshold (existing) | warning |

Anti-noise rules: an alert is sent only after **2 consecutive failures** (≈ 2 minutes), **repeated every 6 hours** while the problem lasts, and followed by a **"Recovered"** message when everything is back.

## Where alerts go
- the panel **bell** (if the database works);
- **Discord, Slack, BloumeChat** (Settings → Webhooks, with each channel's switches);
- the **e-mail of every administrator**, if SMTP is configured.

Setting: **Settings → Webhooks → Server monitoring** (on by default). The **Diagnostics** page warns if no external channel is configured.

---

## External heartbeat: if the whole panel goes down

A panel that is down cannot warn you itself. For that case, configure a **heartbeat** (Settings → Webhooks → *External heartbeat*):

1. Create a "heartbeat / cron" monitor on an external service (**Healthchecks.io**, **UptimeRobot**, **Better Stack**…), 1-minute period, 3 to 5 minutes grace.
2. Paste the ping URL into the panel.

The panel calls this URL **every minute, as long as the engine and the database work**. If it stops (outage, server off, database lost), the **external service** sends you the alert (e-mail, SMS, Telegram…).

::: tip Recommended
Even without any other channel, a heartbeat is enough to be warned of any serious outage.
:::

---

## "Live" dashboard

The dashboard shows an indicator next to the title:

| Indicator | Meaning |
|---|---|
| 🟢 **Live · 0 s** | real-time stream active; the age shows the time since the last update |
| ⚪ **Reconnecting…** | the stream is interrupted or frozen (no message for 7 s): automatic reconnection |
| 🟠 **Refreshing every 3 s** | WebSocket unavailable (proxy or firewall blocking it?): HTTP fallback mode |

**Consistency**: active threads, sessions, active accounts, proxies in use, pool and today's usage now come **from the same server snapshot** (same moment, same computation), refreshed every 2 seconds. A card's thread count always equals the sum of the listed accounts. Today's usage includes bytes already counted but not yet written to the database.

The WebSocket stream is reserved to **administrators and support**.

---

## Proxy engine hardening (v2.4.85)

| Protection | Effect |
|---|---|
| **Limit of unauthenticated connections per IP** | 40 max; beyond that, connections are closed (protects file descriptors) |
| **Bounded headers before authentication** | 100 lines, 32 KB and 15 s max per connection (anti-slowloris) |
| **Forbidden upstream** | a **shared** pool proxy pointing to the server itself, the Docker network or the cloud metadata endpoint is refused and removed from rotation. Loopback and link-local: always. Private networks (RFC 1918): refused by default — variable `ALLOW_PRIVATE_UPSTREAMS=true` to allow them. Per-account private lists and the backup proxy are not affected |
| **Connection test** | connections coming from the server itself are never auto-banned |

::: warning Upstream proxies on a private network
If your shared pool deliberately contains proxies on a private address (e.g. a gateway on your local network), add `ALLOW_PRIVATE_UPSTREAMS=true`. Otherwise they will be marked out of service after the update.
:::
