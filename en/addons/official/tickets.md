# Tickets <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> **Customer support built into** the panel: your customers open tickets, your team answers from a dedicated console.

::: tip No dependency
Tickets works on its own. For notification e-mails, configure the panel's SMTP (**Settings → SMTP & e-mails**).
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/1_OG1qAr-N4" title="Tickets add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/1_OG1qAr-N4).

## What your customers see

A **Support** page in their menu:

- **create a ticket** (subject, category, priority, related account, message, attachments);
- follow the **conversation** with support, **reply**, **close** the ticket or **reopen** it by replying;
- **rate** the help received (1 to 5 stars + comment) once the ticket is resolved;
- get an **e-mail** on every support reply.

## What your team does

The **Administrator** and **Support** roles see the **support console** instead of the customer area:

| Feature | Detail |
|---|---|
| **Queue** | filters by status, category, priority, "my tickets", "unread", full-text search (number, subject, customer, content) |
| **Assignment** | take a ticket, release it; replying assigns the ticket to its author automatically |
| **Canned replies** | ready-made texts insertable in a reply (creation reserved to administrators) |
| **Internal notes** | visible to staff only, never to the customer |
| **Tags, priority, category** | editable at any time; every change is logged in the conversation (staff side) |
| **Statistics** | tickets to handle, waiting for the customer, first response time (30 d), resolution time, satisfaction |
| **Auto-close** | a "resolved" ticket with no new customer reply is closed after N days (7 by default, 0 = never) |

### Statuses

| Status | Meaning |
|---|---|
| **Open** | waiting for a support reply |
| **Answered** | support replied, waiting for the customer |
| **Resolved** | handled; closed automatically after the set delay |
| **Closed** | finished; a customer reply reopens it |

## Attachments

PNG, JPG, WEBP, GIF, PDF and TXT, **2 MB** per file, **3** per message. The type is checked on the file **content** (a renamed file is refused), downloads are protected by the panel session and always served as a **download** (never executed in the browser).

## Settings (administrator)

**Support → Settings**: offered categories, auto-close, attachments, customer / administrator e-mails, maximum open tickets per customer, **automatic message** on creation, **signature** added to replies.

## E-mails

Five templates editable in **Settings → SMTP & e-mails** ("Support (Tickets)" group): ticket received, support reply, ticket resolved (customer); new ticket and customer reply (administrators).

## Security

- A customer sees **only their tickets**; the role of each call is **checked by the panel** (never read from the token);
- rate limits: 10 new tickets and 40 replies per hour per customer;
- texts are cleaned (control characters removed) and shown as plain text (never interpreted as HTML);
- data is included in the panel **backup** (attachments, stored as files, are not).

## Activation

**Extensions → Tickets → Enable** (already included in the panel image). Repo: [UHQ-Addon-Tickets](https://github.com/BloumeSAS/UHQ-Addon-Tickets).

| Variable | Default | Role |
|---|---|---|
| `PORT` | `3107` | Listening port |
| `PANEL_URL` / `PANEL_API_KEY` | — | Token checks, e-mails and backup |
| `DB_PATH` | `./tickets-data.json` | Data file (attachments live in `<DB_PATH>.files/`) |
