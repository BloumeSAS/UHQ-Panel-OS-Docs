# Showcase (Vitrine) <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> A **public home page** for your panel: logo, name, catalogue by category, available countries and a price simulator.

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/1bPm8wEvaCQ" title="Showcase add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/1bPm8wEvaCQ).

## What it changes

Without the add-on, a visitor opening `https://panel.example.com/` is sent straight to the sign-in page. **With the Showcase enabled**, the `/` page shows a sales showcase — **only to visitors who are not signed in**. As soon as a user signs in, they get their dashboard as before. `/login`, `/register` and `/status` stay reachable.

## Enable

1. **Settings → Extensions → Showcase → Enable** (or *Add-ons* in the menu).
2. *(Recommended)* also enable **[Orders](./orders)**: the showcase then shows your products by category with their prices.
3. Open `/` in a private window to see the result.

## Page content

| Section | Data source |
|---|---|
| **Header**: site logo and name | Settings → General (*Site name*, *Panel icon*) |
| **Hero** and key figures (categories, countries, offers) | computed live |
| **Pricing by category**: price, min/max GB, features, low stock | **Orders** add-on (active, in-stock products) |
| **Coverage**: available countries, number of countries per category | the panel's real pool (working proxies per category) |
| **Price simulator**: offer, GB volume, usage estimate (requests/day → GB) | Orders products |
| **Benefits**, **steps**, **FAQ**, **contact** | default FR/EN texts, editable |

The theme (light/dark, main colour) follows the panel's; the language follows the browser (FR/EN) with a switcher.

::: tip Categories
A category appears in the pricing if **at least one Orders product** delivers it (the product's *Category* field). Without Orders, the pool categories that contain proxies are shown (coverage only).
:::

## Configure the showcase

**Showcase** page in the menu (administrators) — each section expands with a click:

- **Displayed sections**: show/hide each block, prices, low stock, number of proxies per country;
- **Title and tagline**: badge, title, gradient title ending, subtitle, buttons;
- **Categories**: rename, describe, reorder or **hide** each category;
- **Simulator**: default volume, average request weight;
- **Benefits, steps, FAQ**: custom lists (empty = default content);
- **Contact**: Discord, Telegram, e-mail, website; footer text;
- **SEO**: page title and description.

Changes show up within 30 seconds (cache).

## Security and privacy

- The page and its `/api/public` API are **public**: they **never** return delivery configuration, credentials, proxy URLs or private lists. Only **counters** per category and country are exposed (the number of proxies is shown only if you enable it);
- settings (`/api/config`) require a token **verified by the panel** and the ADMIN role;
- calls to the panel (`/api/v1/vitrine/overview`) and Orders (`/api/internal/catalog`) use the **master API key** and are never reachable from a browser;
- contact links only accept `https://`, `http://` and e-mails.

## Separate deployment

Standalone Docker image (`ghcr.io/bloumesas/uhq-addon-vitrine`), port **3106**:

| Variable | Role |
|---|---|
| `PANEL_URL` | Panel URL |
| `PANEL_API_KEY` | the panel's **master** API key |
| `ORDERS_URL` | Orders add-on URL (catalogue) |
| `DB_PATH` | configuration file (`/app/data` volume) |

Replacing the `/` page with the showcase only works when the add-on is **bundled and enabled in the panel**.

Repository: [BloumeSAS/UHQ-Addon-Vitrine](https://github.com/BloumeSAS/UHQ-Addon-Vitrine)
