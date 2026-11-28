# Orders <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**  
> Built-in shop: users place orders with their [Wallet](./wallet) balance.

::: warning Required dependency
The **Orders** add-on needs the **[Wallet](./wallet)** add-on installed and reachable.  
While the Wallet is unavailable, the shop shows a warning and payment is disabled.
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/YRiaL9PhQ5o" title="Orders add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/YRiaL9PhQ5o).

---

## Features

- 🛍️ **Customer shop**: catalogue with search/sort and stock indicators, **cart** with balance after order and missing amount, payment method choice (Wallet, card, crypto), **confirmation before payment**, delivered access (masked password, copy, .txt download), order tracking with a timeline, automatic refresh of pending payments, helpful empty states
- 🧰 **Admin management**: indicators (revenue, orders to handle, low stock), products (**guided form with validation and customer preview**, duplication, one-click activation, unlimited or limited stock), orders (search, filters, pagination, detail, **cancel/refund with explanation**), payment method status, CSV export
- ⚡ Automatic delivery of a panel proxy account (category, limits, expiry…), via Wallet
- 💳 Card (Stripe), crypto (NOWPayments) and **PayPal Friends & Family** payments (v1.4.0)
- 📦 **Per-GB sales** (v1.5.0): the customer picks the number of GB; price = price per GB × quantity, with **minimum**, **maximum** and **step**
- 🎟️ **Promo codes** (v1.5.0, Promo codes add-on): discounts entered in the cart, checked server side
- 💳 **Balance top-ups** (v1.5.0): the Wallet add-on relies on Orders' gateways for online top-ups
- 📊 **Shop features** (v1.4.0): each delivered product shows bandwidth, threads, speed, validity and country — `0` = "Unlimited"
- ✅ **Admin approval** (v1.4.0): per-product option
- 🔁 **Automatic renewal** from the Wallet balance (v1.4.0)
- 🧾 **PDF invoices and receipts** (v1.4.0)

::: warning Security — update to v1.3.0 or later (with the Wallet)
- Tokens are **verified by the panel** (before: only decoded, so forgeable).
- Customers **no longer see** the delivery configuration (private proxy lists).
- Stock **reserved immediately** (no more simultaneous overselling); cancelling a paid order is **refused if the Wallet is unreachable**; status transitions are controlled; partial delivery → accounts blocked then refunded.
- Fix: creating a product with a **category** failed (`delivery.account.property pool should not exist`).
:::

---

## Per-GB sales (v1.5.0)

In the product form, **Sales mode → Per GB** (requires "proxy account" delivery):

- the product **price** becomes the **price of one GB** (e.g. 1 GB = €1);
- **Minimum GB**, **Maximum GB** (empty = no cap) and **step** (1 = GB by GB, 0.5 = half-GB);
- the customer sets the quantity with a field, − / + buttons and a slider; the price updates live;
- the delivered account receives **exactly** the ordered quantity (and a renewal adds the same quantity).

## Promo codes in the cart (v1.5.0)

With the **Promo codes** add-on, a "Promo code" field appears in the cart. The discounted total is recomputed **server side**; the discount shows on the order and the invoice. If the order fails or is cancelled, the code use is given back. Renewals use the original price (without promo code).

## Delivery after admin approval (v1.4.0)

In the product form, **Delivery after payment → After admin approval**. The customer pays (the payment is collected), the order moves to **Awaiting approval** and **no proxy account is created** until an admin clicks **Approve and deliver** (Shop management → Orders). Cancelling an order "awaiting approval" refunds the Wallet.

In the panel's **My proxies**, the customer sees an "awaiting approval" card (products and quantities) **without any access information** — there is none yet.

## Automatic renewal (v1.4.0)

1. The admin ticks **Automatic renewal available** on the product (requires "proxy account" delivery with a **validity period**, in days, months or years).
2. The customer enables it at purchase or, per account, in **My orders** (off by default).
3. At the due date, the add-on charges the **Wallet balance** (only) at the **price paid at purchase**, adds **the number of GB bought on the first payment** to the account and pushes the expiry back by one period.

Configuration and price are **frozen at purchase**: if the product changes later, the renewal uses the old configuration. Insufficient balance: automatic retry for **72 h**, then it gives up (the customer can re-enable it). If the panel refuses the update, the amount is credited back immediately. Each renewal creates its own payment (and invoice).

## PayPal "Friends & Family" (v1.4.0)

In **Settings → Extensions → Shop**: enable PayPal, enter the **PayPal e-mail** that receives payments and the **payment deadline** (24 h by default; an unpaid order is cancelled and its stock returned).

1. In your PayPal account, enable **IPN** (Settings → Notifications → Instant payment notifications) with the URL shown in the panel: `https://<your-panel>/addon-proxy/orders/api/payments/paypal/ipn`.
2. The customer chooses PayPal: the screen shows the e-mail, the **exact amount** and a **unique note** (`UHQ-XXXXXXXXXX`) to paste in the message.
3. On receipt, PayPal notifies the IPN. Each notification is **sent back to PayPal for verification** before being used. The order is confirmed only if: payment completed, right recipient, right currency, amount ≥ total, **no seller protection** (so Friends & Family, not "Goods and services"), transaction never seen before and known note.

A refused payment, one arriving after cancellation, refunded or disputed is flagged on the order (red banner): the add-on never decides on its own.

## PDF invoices and receipts (v1.4.0)

**Settings → Extensions → PDF invoices and receipts**: activation, company identity (name, legal form, registration number, VAT, address, contact), logo (PNG/JPEG ≤ 280 KB), colour, title, footer, payment terms, **numbering** (prefix, year, digits, next number — assigned at payment, no gaps or reuse), **VAT** (rate, prices incl. or excl. tax, exemption notice at 0%) and preview of the receipt / invoice.

Customers who paid download in **My orders** a **receipt** (always) and an **invoice** (if enabled), one per purchase and per renewal; they can enter their **billing details** (optional). The total is always the amount actually collected.

---

## One-click activation (recommended)

Orders is **already built into the UHQ Panel OS Docker image**. From the panel: **Extensions → Orders → Enable** — requires **Wallet to be enabled first** (button greyed out otherwise, with a tooltip). The panel starts Orders as an internal process and connects it automatically.

---

## Manual install (separate self-hosting)

An alternative if you want to host Orders on its own infrastructure:

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Orders
cd UHQ-Addon-Orders
npm run install:all
cp .env.example .env   # set WALLET_URL (and PANEL_API_KEY)
npm run build && npm start
```

Connect it in the panel: **Extensions → `http://localhost:3002`**

---

## Wallet integration — zero-config

Both add-ons authenticate each other with `PANEL_API_KEY` — the same key already used for backups. **No admin token to configure.**

```
[Orders]  POST /api/wallet/internal/add
          Header: X-Panel-Key: <PANEL_API_KEY>
                                    ↓
                             [Wallet] checks the key
                             and debits / credits the wallet
```

Both add-ons just need to share the same `PANEL_API_KEY`.

---

## Card (Stripe) and crypto (NOWPayments) payments

Besides the Wallet balance, Orders can accept bank cards (Stripe) and crypto (NOWPayments). Both are **optional, off by default**, enabled from **Shop management → Payment gateways** (admin page):

| Gateway | Required fields | Webhook to set up on their side |
|---|---|---|
| Stripe | Publishable key, secret key, webhook secret | `<add-on domain>/api/payments/stripe/webhook` — event `checkout.session.completed` |
| NOWPayments | API key, IPN key | `<add-on domain>/api/payments/nowpayments/webhook` |

An order paid through one of these gateways stays **`pending`** (never charged, never delivered) until the matching webhook confirms the payment — the Wallet balance still charges and delivers immediately as before. No bank data goes through the add-on: payment is handled entirely by Stripe/NOWPayments, only the confirmation (signed webhook) comes back here.

::: warning Iframe
Stripe and NOWPayments both refuse to show their payment page in an iframe (anti-clickjacking protection on their side) — clicking "Pay" therefore redirects **the whole browser tab**, not just the add-on's iframe in the panel. The buyer comes back to the shop page once the payment is done (or cancelled).
:::

---

## Docker (Coolify)

1. New Docker Compose service → paste `docker-compose.coolify.yml`
2. Variables: `PANEL_URL`, `PANEL_API_KEY`, `WALLET_URL`, `DOMAIN`
3. Volume: `orders_data` → `/app/data`
4. Connect it in the panel: `https://orders.example.com`

---

## Injected zones

| Zone | Type | Description |
|---|---|---|
| `topbar` | Slot | "Shop" in the dropdown |
| `/` | 100px widget | 3 KPIs: orders, revenue, active products |
| `/` | Page | User shop (catalogue + my orders) |
| Sidebar | Admin page | "Shop management" (adminOnly) — products + orders |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3002` | Listening port |
| `PANEL_URL` | `http://localhost:8000` | Panel URL |
| `DB_PATH` | `./orders-data.json` | Data file |
| `PANEL_API_KEY` | *(empty)* | Panel API key (backup + Wallet inter-add-on auth) |
| `WALLET_URL` | `http://localhost:3001` | Wallet add-on URL |
| `PAYPAL_IPN_URL` | *(PayPal)* | Tests only: fake IPN verification server |

---

## License

MIT — [GitHub](https://github.com/BloumeSAS/UHQ-Addon-Orders) — © 2026 Bloume SAS
