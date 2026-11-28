# Customers & support

The panel's tools to help your customers and troubleshoot fast. Everything is reachable from **Sub-users** (admin side) or **My proxies** (customer side).

## Connection line generator

**Connection** button (`</>` icon) on each account: every format a customer needs, ready to copy.

- `host:port:user:pass` and `user:pass@host:port`
- URL `http://user:pass@host:port`
- `curl`, Python (`requests`), Node.js, Playwright / Puppeteer
- Browser settings (host, port, credentials)
- **Session** option (same IP kept) or rotation on every connection

::: tip Protocol
The engine accepts **HTTP proxy** (HTTPS goes through `CONNECT`). There is no SOCKS5 input on the customer side.
:::

Host and port are the account's: the account's dedicated port, otherwise its category's, otherwise the global port (990 by default). Set the public host in **Settings → General**.

## "Why doesn't it work?"

**Life-buoy** button on each account (admin) and in **My proxies** (customers only see their own accounts). It shows:

- the account's **current problems** (expired, blocked, quota reached…);
- the **latest refusals** with the cause and what to do: wrong password, blocked account, expired, quota reached, IP not allowed, wrong port (the right one is shown), blocked domain, VPN, thread limit, no proxy available, banned IP.

Admins also see **recent refusals across all accounts** in **Diagnostics**.

::: warning
The log is **in memory** (50 events per account): it is cleared on every panel restart.
:::

## E-mail alerts to customers

The panel warns each customer (bell + e-mail if SMTP is configured) when their account:

- reaches **80%** then **100%** of its quota;
- **expires soon** (3 days) then **has expired**.

Each alert is sent **only once**; it is re-armed if usage drops below 80% (traffic reset, top-up). The account must have an owner (panel user) with an e-mail address.
Disable: **Settings → SMTP → Customer alerts**.

## Support info

**Copy support info** button (About, Diagnostics, Help): a text report ready to paste into a ticket — version, environment, counters, diagnostics result, latest warnings/errors.
**No secrets**: passwords, tokens, keys and credentials in URLs are masked, e-mails partially masked, last byte of IPs masked.

## Built-in help

**Help** menu: searchable FAQ, link to the relevant page, restart the guided tour. Empty pages (no account, no source…) explain what to do and offer the right button; ⓘ tooltips explain tricky fields.

## Demo mode

On the dashboard ("First steps" card): **Load demo data** creates a "Demo" category and 3 sample accounts with 7 days of history, to discover the panel. The accounts are **blocked** and their passwords random: they cannot be used. **Remove demo** deletes everything.

## "What's new" after an update

On the first sign-in after an update, a window summarises the changes since the last version seen (5 latest at most). Admins also get a **notification** when a new version is out (checked every 6 h).

## Verify a backup

**Settings → Backups → Verify**: analyses a backup file **without changing anything** (unknown fields, missing required fields, invalid dates, duplicates, orphan references, no administrator) and tells whether it can be restored.
