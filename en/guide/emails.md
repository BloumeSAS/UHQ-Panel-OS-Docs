# E-mails & templates

**Settings → SMTP & e-mails**: once your SMTP server is set, the panel sends e-mails for **everything**: sign-up, password, security, system alerts, customer alerts, and those of add-ons (shop, balance, promo codes, support…).

## One switch, one preview, one test per e-mail

Each template in the list has:

| Button | Role |
|---|---|
| 👁 **Preview** | exact rendering (header, text, footer) with sample values, in French or English |
| ✏️ **Edit** | subject and text, per language, with **live preview** and **clickable variables**; "Restore default text" |
| ✈️ **Send a test** | sends the template (sample values) to the address of your choice, even when disabled |
| ⏻ **Switch** | enables or disables this e-mail |

Templates are grouped: **Account**, **Security**, **Administration**, **Customers**, **Shop (Orders)**, **Balance (Wallet)**, **Promo codes**, **Support (Tickets)**, **Referral** and **Status**.

| Template | Recipient | Default |
|---|---|---|
| Welcome (sign-up) | new user | off |
| Password reset | user | on |
| Password changed | user | on |
| Invitation | invitee | on |
| Sign-in notification | user | off (very frequent) |
| Sign-in from an unknown IP | user | on |
| 2FA recovery code used · 2FA enabled/disabled | user | on |
| System alerts | administrators | on |
| Automatic report | report e-mail | per "Automatic reports" |
| Customer alerts (quota, expiry) | customer | per "Customer alerts" |
| Order confirmed / awaiting approval / approved / cancelled | customer | on |
| Renewal done / failed | customer | on |
| New order | administrators | on |
| Balance topped up | customer | on |
| Promo code applied | customer | on |

## Shared header and footer

Every e-mail (even those that are not "templates") shares the same layout:

- **Header**: the **site logo** (Settings → General → Icon) and **site name** are used automatically — nothing else to configure;
- optional **subtitle** under the site name;
- optional **footer** (support, legal notice, address…);
- the **"UHQ Panel OS by Bloume.fr"** mention always stays, small, at the bottom of every e-mail.

::: tip The logo does not show?
Relative logos (`/static/logo.png`) are completed with your panel address: fill in **Settings → General → Panel URL** (or your public domain). `data:` logos are not displayed by mail clients.
:::

## Text syntax

The text is deliberately simple and **always escaped** (never free HTML):

| Write | Result |
|---|---|
| empty line | new paragraph |
| `**bold**` | **bold** |
| `[[Label|{link}]]` | button (`http`/`https` links only) |
| `{variable}` | inserted value (each template's variable list is shown in the editor) |

## For add-on developers

An add-on sends an e-mail through the panel API (API key, `X-API-Key` header):

```http
POST /api/v1/mail/send
{ "template": "orders.order-paid", "to": "customer@example.com", "vars": { "orderId": "#C1A6CFCF", "total": "€10.00" } }
```

- only templates marked "addon" are allowed; unknown variables are ignored;
- the recipient must be **an existing panel user** (no spam relay); `"to": "admins"` for templates meant for administrators;
- text, activation and layout remain managed by the admin in the settings.
