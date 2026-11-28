# Status & incidents <span class="badge-free">✓ Free</span>

> **Free Add-on by [Bloume SAS](https://bloume.fr)**
> A **public status page**: 90-day uptime, incidents, maintenance — with **automatic detection** of outages and redeploys.

::: tip No dependency
Status works on its own. To also monitor the **proxy engine**, the **pool** and the **add-ons**, enable **"Public status page"** in the panel's **Settings → General** (the add-on reads the public `/api/status`).
:::

## 🎬 Video

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/nTGtTSsZQOA" title="Status add-on — install, test and overview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Video: install, test and overview — [watch it on YouTube](https://youtu.be/nTGtTSsZQOA).

## The public page

Reachable **without signing in** at `https://your-panel/addon-proxy/status/` (and from the panel menu; the panel's `/status` page uses it when the add-on is enabled). It shows:

- a **global banner** (operational, degraded, partial outage, major outage, maintenance);
- the **90-day uptime** of each component (panel and API, proxy service, pool, add-ons) as daily bars;
- **ongoing incidents**, upcoming or ongoing **maintenance**, and incidents from the **last 30 days**, with their timeline;
- the **announcement** of your choice at the top;
- FR / EN and light / dark theme following the browser.

A **widget** (compact banner) is also shown on the panel dashboard.

## What is detected automatically

| Event | What happens |
|---|---|
| **A component stops answering** (3 consecutive checks by default) | an "… unavailable" incident opens, then **resolves itself** when the service is back |
| **Redeploy / update** | on restart, the interruption is measured (from the service stop to its return) and published: "Update deployed (2.14.2 → 2.15.0) — downtime: 1 min 12" |
| **Restart without a version change** | "Service restart", with its duration |
| **Panel restart between two checks** | detected thanks to the panel uptime (`uptimeSec` from `/health`, panel ≥ 2.15) |

An interruption's duration counts as **downtime** in the uptime bars. Simply **disabling / re-enabling** the add-on (panel still online) creates no incident.

## Publish by hand

**Status and incidents** (administrator):

- **Incident**: title (FR + optional EN), impact (info, minor, major, critical), status (investigating → identified → monitoring → resolved), affected components, message;
- **Updates**: add messages to the timeline; switching to "Resolved" closes the incident;
- **Scheduled maintenance**: start / end window; it moves **by itself** from "scheduled" to "in progress" then "completed", and during the window the affected components are in **maintenance** (not counted as down);
- **Hide** a wrongly detected incident from the public page (still visible to you), **delete** it.

## Alerts

- **E-mail to subscribers**: any signed-in user subscribes from the page (**"Notify me by e-mail"**);
- **E-mail to administrators** for each automatically detected incident;
- **Discord / Slack / JSON webhook** (Settings), with a test button.

## Settings

Public page enabled, title, announcement, check interval (30 s), failures before incident (3), minimum detected outage (30 s), maximum outage (48 h), show add-ons / ports, alerts, webhook, retention (90 days).

## Limit to know

When the add-on runs **inside the panel image** (bundled mode), it stops with the panel: a full server outage cannot be "seen" live — it is **recorded on restart** (duration measured from the stop or the last check). For a status page that stays online during outages, deploy the add-on **separately** and point `PANEL_URL` to the panel's public address: it then detects the outage live.

## E-mails

Two templates ("Status" group): alert to subscribers, incident detected (administrators).

## Activation

**Extensions → Status → Enable**. Repo: [UHQ-Addon-Status](https://github.com/BloumeSAS/UHQ-Addon-Status).

| Variable | Default | Role |
|---|---|---|
| `PORT` | `3109` | Listening port |
| `PANEL_URL` / `PANEL_API_KEY` | — | Panel probes, token checks, e-mails |
| `DB_PATH` | `./status-data.json` | Data file |
