# Promo codes <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> **Fully customisable** promo codes: gift codes, top-up bonuses and shop discounts.

::: warning Dependency
Requires the **[Wallet](./wallet)** add-on. For shop discounts and bonuses on top-ups paid online, the **[Orders](./orders)** add-on must also be enabled.
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/9MhQMgCrrvI" title="Promo codes add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/9MhQMgCrrvI).

## The three code types

| Type | Where the customer enters it | Effect |
|---|---|---|
| 🎁 **Gift code (credit)** | "My balance" page (or Promo codes page) | adds an amount to their Wallet balance |
| 💳 **Top-up bonus** | "My balance" page, during a top-up | adds a bonus (% and/or fixed amount) to the top-up |
| 🛒 **Shop discount** | shop cart | lowers the order total (% and/or fixed amount) |

## Conditions (all optional)

- start and end **dates**;
- **total uses** and **per-customer uses** (a gift code is limited to 1 per customer by default);
- **minimum / maximum amount** of the cart or top-up; **minimum number of items**;
- benefit **cap** (e.g. −20%, max €15);
- **targeted or excluded products** (list loaded from the shop);
- allowed **payment methods** (Wallet, card, PayPal, crypto);
- **first order only**;
- **audience**: specific e-mails, e-mail domains (`@company.com`), account IDs;
- internal note, instant enable/disable.

## Management

- **Create / edit / duplicate**, filters (type, status, search), statistics (credit given, bonuses, discounts);
- **Bulk generation**: up to 500 unique single-use codes (gift cards), CSV export;
- **Usage history** (customer, order reference, benefit) with CSV export; a cancelled order **releases** its use.

## Security

- Everything is checked **server side** (the browser only sends the code text); calls between add-ons require the panel API key;
- the use is **consumed when the order is created** and given back if it fails or is cancelled: two simultaneous orders cannot exceed the limit;
- guessing attempts are limited (10 failures / 10 min / customer).

## Activation

**Extensions → Promo codes → Enable** (already included in the panel image; Wallet must be enabled). Repo: [UHQ-Addon-PromoCodes](https://github.com/BloumeSAS/UHQ-Addon-PromoCodes).

| Variable | Default | Role |
|---|---|---|
| `PORT` | `3105` | Listening port |
| `PANEL_URL` / `PANEL_API_KEY` | — | Token checks and internal calls |
| `WALLET_URL` | — | Wallet add-on (gift code credit) |
| `DB_PATH` | `./promocodes-data.json` | Data file |
