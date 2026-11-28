# Security (BloumeID) <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> Protects **sign-in**, **sign-up** and **password reset** with device fingerprinting, powered by **[BloumeID](https://github.com/BloumeSAS/BloumeID)** — Bloume SAS's open-source anti-fraud SDK.

::: tip No dependency
Works on its own, without any external service: the engines are bundled in the add-on. Requires **UHQ Panel OS 2.16** or later.
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/kQJuCGh7cV8" title="Security (BloumeID) add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/kQJuCGh7cV8).

## The engines

| Engine | Role | Where it runs |
|---|---|---|
| **BloumeID** ([`@bloume/id`](https://www.npmjs.com/package/@bloume/id)) | 104 signals (rendering, audio, fonts, hardware…) + **anti-spoof** and **anti-bot** probes: WebDriver, Puppeteer, Playwright, tampered browser functions, anti-fingerprint noise, virtual machine, Tor | Browser — bundled, open source |
| **ThumbmarkJS** | Complementary fingerprint | Browser — bundled, open source |
| **FingerprintJS** (open-source version) | Complementary visitor ID (telemetry disabled) | Browser — bundled, open source |
| **BloumeID server** (optional) | Threat level, VPN, Tor, datacenter, **verified server side** | Your self-hosted BloumeID instance |
| **Fingerprint.com Pro** (optional, paid) | Bots, VPN, tampering, **verified server side** (Server API) | Fingerprint.com |

BloumeID's browser "lie" tests belong to the same family as those of **[CreepJS](https://github.com/abrahamjuliot/creepjs)** (open-source research tool): the add-on's **Test my browser** page even offers a comparison with CreepJS.

::: warning What fingerprinting can and cannot do
Signals collected in the browser can be spoofed by a determined attacker. Local engines make bots, automation browsers and multi-accounting **much more expensive**; for a strong guarantee, enable an engine **verified server side** (BloumeID server or Fingerprint.com Pro).
:::

## How it works

1. The panel's **Sign in**, **Sign up** and **Forgot password** pages load `sdk.js` from the add-on (same origin, no third party by default).
2. The SDK runs the engines and sends the signals to the add-on, which computes a **risk score** (0 to 100) and returns a **single-use token** (10 minutes).
3. The panel attaches the token to the request and asks the add-on for a decision: **allowed**, **flagged** or **blocked**.

Sign-in is checked **after** the password: a wrong password reveals nothing, and the account role is known (administrators can be exempted).

## What raises the score

| Signal | Default effect |
|---|---|
| Bot / automation tool | +80 (blocking) |
| Spoofed browser (anti-detect, tampered functions) | +45 |
| No token (page bypassed, direct API call) | 100 if "token required" |
| Token from another action / expired | +50 / 100 |
| Too many accounts on the device (sign-up) | +80 |
| Too many sign-ups in 24 h on the device | +60 |
| Banned device | 100 |
| Anti-fingerprint noise, virtual machine, inconsistent time zone | +10 each |
| VPN / Tor / proxy / datacenter (server engines) | +40 if penalised, otherwise +10 |

Above the **block threshold** (70 by default) the request is refused; above the **flag threshold** (40) it goes through but is marked.

## Settings

As for every official add-on, configuration lives in the panel: **Settings → Extensions → Security (BloumeID)**.

| Setting | Default | Role |
|---|---|---|
| Mode | Active protection | **Observation**: nothing is blocked, everything is logged (ideal to tune thresholds) |
| Protect sign-in / sign-up / password reset | Yes | Checked actions |
| Token required | Yes | A request without a token is suspicious |
| Never block administrators | Yes | Their sign-ins are flagged, never refused |
| Allow if the add-on does not answer | Yes | Otherwise sign-ins are refused while the add-on is unavailable |
| Block / flag thresholds | 70 / 40 | Risk score |
| Max accounts per device / max sign-ups in 24 h | 3 / 2 | 0 = unlimited |
| Block bots / spoofed browsers | Yes / Yes | |
| Penalise VPN, Tor, proxies | No | Your customers often use proxies: enable with care |
| BloumeID / ThumbmarkJS / FingerprintJS engines | Yes | Bundled |
| BloumeID server | No | URL, public key `bid_pub_…`, secret key `bid_sec_…` |
| Fingerprint.com Pro | No | Public key, secret key (Server API), region |
| "Protected by BloumeID" badge | Yes | Under the forms |

Secret keys are masked and only revealed after your password. When an external engine is enabled, the panel automatically allows its domain in its Content Security Policy (CSP).

## Monitoring

**Security (BloumeID)** menu (administrators):

- **Overview**: checks over the last 24 h, blocked, flagged, 14-day chart, most frequent signals, active engines;
- **Events**: every analysed sign-in / sign-up, with score, signals and decision (and what active protection would have decided in observation mode);
- **Devices**: accounts seen on each device, **ban** a device;
- **Test**: runs the engines on your browser and shows the analysis.

Every user has an **Account security** page (top menu): their devices, latest sign-ins and a test of their browser.

## For other add-ons

Internal API (panel API key, `X-Panel-Key` header):

- `POST /api/internal/check` `{ action, token, ip, email, user_id, role }` → `{ decision, score, reasons, event_id }`;
- `POST /api/internal/link` `{ event_id, user_id, email }` links a newly created account to the device;
- `GET /api/internal/panel-config`: protected actions and CSP origins.

## Activation

**Extensions → Security → Enable**. Repo: [UHQ-Addon-Security](https://github.com/BloumeSAS/UHQ-Addon-Security).

| Variable | Default | Role |
|---|---|---|
| `PORT` | `3110` | Listening port |
| `PANEL_URL` / `PANEL_API_KEY` | — | Token checks, panel ↔ add-on calls, backup |
| `DB_PATH` | `./security-data.json` | Data file |
