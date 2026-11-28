# UHQ.Monster Reseller <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> Buy and manage your [UHQ.Monster](https://uhq.monster) proxies **without leaving the panel**: balance, creation, adding/removing GB, and **automatic import** into your categories — no more copy-pasting credentials.

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/MPDvjlLr3l4" title="UHQ.Monster Reseller add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/MPDvjlLr3l4).

---

## Features

- 💶 Reseller wallet **balance**, reseller discount and summary (proxies, GB bought/used)
- 🛒 **Buy a proxy**: product, quantity (product limits enforced), country, session type, duration — with the **estimated cost** and a **mandatory confirmation** before any charge
- 📥 **Automatic import** of the purchased proxy into a **panel category** (or the global pool), as `http://user:pass@host:port`
- 📋 **My proxies**: live usage, credentials, **+ GB**, **− GB with refund**, import / change category, deletion
- 🧾 **History** of operations made from the panel
- ⚡ **"Pool" widget**: quick purchase right on the **Proxy pool** page

---

## Requirements

| | |
|---|---|
| UHQ Panel OS | **2.4.95 or later** |
| Account | **approved reseller** on uhq.monster, with an API key (*Reseller → API*) |

---

## One-click activation (recommended)

The add-on is **already built into the panel's Docker image**: **Extensions → UHQ.Monster Reseller → Enable**.

Then, in the panel: **Settings → Extensions → UHQ.Monster Reseller**: paste your **reseller API key** (UHQ.Monster dashboard → *Reseller → API*, it starts with `uhq_` or `UHQ-`). It is checked with UHQ.Monster before being saved, then never shown again.

---

## Usage

### Buy a proxy and add it to a category
1. **Buy a proxy** (or use the widget at the bottom of the **Proxy pool** page).
2. Choose the product, quantity, optionally the country, and the **panel category** to import the proxy into.
3. Check the estimated cost, then **Confirm and pay**.
4. The proxy is created at UHQ.Monster **and** added to the panel pool ("Manual" provider): the checker tests it like the others.

::: tip Residential gateway
A residential gateway (a single host:port that rotates IPs) must be imported into an **"Always online"** category, so the checker does not mark it dead.
:::

### Add or take back GB
In **My proxies**: **+ GB** charges your wallet; **− GB** takes back **all** the remaining bandwidth and refunds it according to the product policy (`full`, `min_1gb` — refunded only if at least 1 GB remains — or `none`).

### From the Pool page
On the **Proxy pool** page, each manually imported proxy ("Manual" provider) has a **UHQ.Monster** button (bag icon) that opens a small window: **add GB**, **take back GB** (with refund) and **reset the password**. The proxy is found at UHQ.Monster by host + port + username; if it was not bought with your reseller account, the window says so and nothing changes.

The password reset is done by UHQ.Monster (you do not choose the value): the old one stops working immediately, and the pool line is **replaced** by the new one, in the same category. The new password is shown only once in the window.

### Delete a proxy
Deletion is **final and without refund**: you must type the proxy label again. Take back the bandwidth first to recover your credit. The proxy is also removed from the panel if it was imported into a category.

---

## Security

This add-on **spends money**: it is hardened accordingly.

- **Administrators only** — every call is checked **by the panel** (token signature and expiry); a SUPPORT, a USER or a forged token is refused.
- The **API key stays server side**: file in `0600` mode, never returned to the browser (only the first and last 4 characters), **never included in the backup**, never logged.
- **No double charge**: the UHQ.Monster API has no idempotency. Each purchase has a **unique label**; on an ambiguous answer (network cut, 5xx error), the add-on **finds the proxy by its label** instead of retrying. Only one money operation at a time.
- Proxy passwords are not stored by the add-on; the history contains no secrets.

---

## Limits

- The allowed IP list and changing the country of an existing proxy are not exposed for now.
- To remove a deleted proxy from the panel automatically, it must have been imported into a **category** (otherwise remove it in **Pool**).
- After a panel restore, **enter the API key again** (it is not backed up).

---

## Manual install (separate self-hosting)

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Reseller
cd UHQ-Addon-Reseller
npm run install:all
cp .env.example .env     # PANEL_URL, PANEL_API_KEY
npm run build && npm start
```

Variables: `PORT`, `PANEL_URL`, `PANEL_API_KEY` (backup), `DB_PATH` (data file). Source code: [UHQ-Addon-Reseller](https://github.com/BloumeSAS/UHQ-Addon-Reseller).
