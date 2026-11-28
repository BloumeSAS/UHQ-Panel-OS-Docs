# Wallet <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**  
> A balance system for your customers.

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/TxrwwHY6CKM" title="Wallet add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/TxrwwHY6CKM).

---

## Features

- 💳 **"My wallet" customer page**: large balance, credited/spent totals, **interactive history chart** (7 d / 30 d / 90 d / all), **filterable** history (in/out), search, pagination, origin of each operation (administrator, shop purchase, refund), balance after each operation, **CSV export**
- ➕ **Admin management**: indicators (total, funded accounts, average balance, empty accounts), ranking, search + filter + sort + pagination, **credit/debit dialog** (quick amounts, reasons, new balance preview), per-account history (filters, deletion, export), CSV export of accounts
- 🔌 **Online top-up** (since v1.4.0, with the **Orders** add-on): customers top up their balance by card, PayPal or crypto. Everything is configurable in **Balance management → Top-ups**: master switch, one-click **offers** (amount, bonus %, label, "popular"), **free amount** with **minimum / maximum**, **tiered bonus** (e.g. +10% from €100), allow **bonus codes**
- 🎁 **Gift codes** (Promo codes add-on): an "Apply a gift code" field on the "My balance" page
- 📊 Dashboard widget (admin: totals; user: their balance)
- 💰 "My balance" shortcut in the topbar dropdown
- 💾 Automatic backup included
- 🌍 French and English

::: warning Security — update to v1.3.0 or later
Before 1.3.0, the add-on only **decoded** the sign-in token without verifying it: a forged "administrator" token could credit any wallet. Since 1.3.0, **every call is verified by the panel**, the token is only read from the `Authorization` header, the `X-Panel-Key` key (internal calls, backup) is **required** and compared in constant time, and an unreadable data file is never overwritten (kept as `*.corrupt-<date>`).
:::

---

## Online top-up (v1.4.0)

Top-ups are paid through the methods configured in the panel's **Settings → Extensions** (Stripe, PayPal Friends & Family, NOWPayments): **the balance is credited only once the payment is confirmed**.

| Setting | Effect |
|---|---|
| **Enable online top-ups** | master switch |
| **Top-up offers** | preset amount buttons; each offer can have its bonus % and be enabled / highlighted |
| **Free amount** | the customer enters an amount between a minimum and a maximum |
| **Tiered bonus** | "from X topped up: +Y%" — the best one (offer or tier) applies, never both |
| **Bonus codes** | allows a "top-up bonus" promo code on top (added to the offer / tier) |

The customer sees live **what they pay** and **what they get**. The Wallet re-checks everything server side (amount, offer, bounds): the browser cannot choose its credit. A paid top-up cannot be cancelled from the shop: adjust the balance in Wallet management if needed.

---

## One-click activation (recommended)

Wallet is **already built into the UHQ Panel OS Docker image** (nothing to deploy separately). From the panel: **Extensions → Wallet → Enable**. The panel starts Wallet as a plain internal process (no new container, no VPS) and connects it automatically within seconds. **Disable** stops it cleanly.

---

## Manual install (separate self-hosting)

An alternative if you want to host Wallet on its own infrastructure (dedicated VPS, scaling independent from the panel...):

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Wallet
cd UHQ-Addon-Wallet
npm run install:all
cp .env.example .env
npm run build && npm start
```

Connect it in the panel: `http://localhost:3001`

---

## Docker (Coolify)

1. New Docker Compose service → paste `docker-compose.coolify.yml`
2. Variables: `PANEL_URL`, `PANEL_API_KEY`, `DOMAIN`
3. Volume: `wallet_data` → `/app/data`
4. Connect it in the panel: `https://wallet.example.com`

---

## Injected zones

| Zone | Type | Description |
|---|---|---|
| `topbar` | Slot | "My balance" in the e-mail dropdown |
| `/` | 100px widget | 3 KPIs: total, active accounts, average |
| `/subusers` | 340px widget | Table of all balances with actions |
| Sidebar | Admin page | "Balance management" (adminOnly) |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Listening port |
| `PANEL_URL` | `http://localhost:8000` | Panel URL |
| `DB_PATH` | `./wallet-data.json` | Data file |
| `PANEL_API_KEY` | *(empty)* | API key (backup, internal calls) |

---

## License

MIT — [GitHub](https://github.com/BloumeSAS/UHQ-Addon-Wallet) — © 2026 Bloume SAS
