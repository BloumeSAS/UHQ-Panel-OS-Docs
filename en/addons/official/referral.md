# Referral <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> Your customers **refer** their friends and earn **balance** on every order their referrals place.

::: warning Dependencies
Requires the **[Wallet](./wallet)** (payout of earnings) and **[Orders](./orders)** (order tracking) add-ons. **Orders 1.6** (or later) is required.
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/15SLX4HXQwE" title="Referral add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/15SLX4HXQwE).

## How it works

1. Every customer has a personal referral **code** and **link** (**Referral** page).
2. A friend follows the link (`…/addon-proxy/referral/r/CODE`) and creates an account; the code is **applied automatically** on their first visit to the Referral page. They can also **enter a code by hand**.
3. On each paid order of the referral, a **commission** is computed.
4. After the **holding period** (7 days by default), it is **paid automatically** to the referrer's Wallet balance.

## Settings (administrator)

| Setting | Role |
|---|---|
| Commission in % | share of the order total (default 10%) |
| Fixed commission | amount added on each order |
| Eligible orders | **shop**, **balance top-ups** or both |
| Minimum order | below it, no commission |
| Max commissions per referral | limit to the first N orders (0 = unlimited) |
| Max earnings per referrer | total cap (0 = unlimited) |
| **Delay before payout** | protects against cancellations / refunds (0 = immediate) |
| **Welcome bonus** | amount paid to the referral on their first eligible order |
| Custom code | the referrer chooses their code (4 to 20 characters) |
| Existing customers | allow customers who already ordered (default: **new customers only**) |
| Public panel URL | for the referral link outside bundled mode |

## What the customer sees

Their code and link, number of referrals, rewarded orders, **pending** and **paid** earnings, the list of their referrals (e-mails **masked**: `jo***@example.com`) and their earnings history.

## Administrator tracking

- **Overview**: active referrers, referrals, pending / paid earnings, top referrers, sync status;
- **Referrals**: list, **manual linking** of a referral to a referrer, removal;
- **Earnings**: every commission and bonus, with **pay now**, **cancel** or, for an uncertain payout, **retry / mark as paid**;
- every order cancellation **cancels earnings still pending**; if the earning was already paid, it is **flagged** for review.

## Security and anti-abuse

- impossible to use **your own code** or create a **loop** (A refers B, B refers A);
- referral is reserved to **new customers** (no paid order) unless you allow existing customers;
- the **holding period** leaves time for cancellations;
- amounts are computed **server side** from orders read in Orders (read only, panel API key);
- a payout is **never replayed** automatically: if the Wallet did not answer with certainty, the entry goes to **"To check"** so you verify the balance before retrying.

## E-mails

Three templates ("Referral" group in **Settings → SMTP & e-mails**): new referral, commission paid (referrer), welcome bonus (referral).

## Activation

**Extensions → Referral → Enable** (Wallet and Orders must be enabled). Repo: [UHQ-Addon-Referral](https://github.com/BloumeSAS/UHQ-Addon-Referral).

| Variable | Default | Role |
|---|---|---|
| `PORT` | `3108` | Listening port |
| `PANEL_URL` / `PANEL_API_KEY` | — | Token checks, e-mails and internal calls |
| `WALLET_URL` | — | Wallet add-on (payout of earnings) |
| `ORDERS_URL` | — | Orders add-on (order feed) |
| `DB_PATH` | `./referral-data.json` | Data file |

::: tip Plug referral into your sign-up
The internal API `POST /api/internal/claim` (header `X-Panel-Key`, body `{ "user_id", "user_email", "code" }`) links a customer to a referrer from another tool.
:::
