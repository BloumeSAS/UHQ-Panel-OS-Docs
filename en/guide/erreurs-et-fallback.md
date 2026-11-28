# Errors returned to customers & per-category fallback

## Errors are always yours

The customer **never** sees the real error of an upstream proxy (provider, free proxy, fallback). When something fails, the engine answers with a panel **JSON** error, with the `X-UHQ-Error` header:

```http
HTTP/1.1 502 Bad Gateway
X-UHQ-Error: UHQ_NO_UPSTREAM
Content-Type: application/json

{"error":{"code":"UHQ_NO_UPSTREAM","status":502,"message":"No proxy available to handle the request. Please retry shortly."}}
```

The real detail (e.g. "the provider answered 407") only appears in the **panel logs** ("Upstream error") and in the "Why doesn't it work?" log.

| Code | HTTP | Meaning |
| --- | --- | --- |
| `UHQ_AUTH_FAILED` | 407 | Credentials refused: missing, wrong, account blocked/expired, quota reached, IP not allowed (deliberately indistinguishable). |
| `UHQ_WRONG_PORT` | 407 | The account or its category has a dedicated port; the right port is given (`detail.expected_port`). |
| `UHQ_IP_BANNED` | 403 | Banned IP (repeated authentication failures or VPN). |
| `UHQ_DOMAIN_BLOCKED` | 403 | Domain blocked for this account. |
| `UHQ_VPN_BLOCKED` | 403 | VPN/hosting provider refused (Anti-VPN category). |
| `UHQ_THREAD_LIMIT` | 429 | Too many simultaneous connections. |
| `UHQ_NO_UPSTREAM` | 502 | No proxy available (empty/down pool, fallback missing, disabled or failing). |
| `UHQ_UPSTREAM_FAILED` | 502 | The upstream proxy answered with an error: hidden from the customer. |
| `UHQ_GATEWAY_ERROR` | 504 | Internal error or timeout. |

::: tip Reference sheet in the panel
**Error codes** menu (admin and support): for each code, what it means, what to check, and a **ready-to-copy reply** for the customer.
:::

::: warning Requests with a body
The upstream proxy's error is hidden for HTTP requests without a body (GET, HEAD…) and for all HTTPS (CONNECT). For a plain HTTP request with a body (POST/PUT), the response is relayed as is.
:::

## Per-category fallback

There is **no global fallback anymore**. The backup proxy is set **per category**, in **Settings → Scraper → Per-category fallback** (one line per category: URL + switch).

- **URL**: `http://user:pass@host:port` or `socks5://…`. Empty = no backup for this category: when no proxy answers, the customer gets `UHQ_NO_UPSTREAM`.
- **"Enabled" switch**: off = the category does not use its fallback (the URL is kept).
- The country template (`{user}__country__{country}`) stays configurable in the category.
- The URL contains credentials: it is **masked** (••••••••); leaving the mask unchanged keeps the value.

::: warning Updating from an earlier version
The old "Backup proxy (fallback)" setting is no longer used as a fallback. It becomes **"Scraper outbound proxy"** (used only to fetch source lists). To keep a fallback, enter its URL in each relevant category.
:::

## HTTP codes from visited sites (303, 403, 429…)

The panel's **Error codes** page has a second tab, **Site HTTP codes**: every common code (2xx to 5xx, including Cloudflare 520/522/524/525) with, for each, what it means, **why the customer sees it and not you**, what to do and a **ready-to-send reply**.

These codes do **not** come from the panel: they are returned by the visited site (or its CDN) and the proxy passes them on unchanged. **Simple rule: if the `X-UHQ-Error` header is present, the error comes from the panel; if it is absent, it comes from the site.**

Example — **303 See Other**: the site asks to fetch the rest with a GET to the `Location` address (typical after a sign-in or form POST). A browser follows on its own; a script that does not follow redirects stays on the 303. The exit IP or country can also change the destination (verification page, country page).
