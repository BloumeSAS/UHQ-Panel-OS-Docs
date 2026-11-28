# VPN in proxy categories

Since **v2.9.0**, a **VPN** can be added to a category (pool) **like any proxy**: it shows up in the Pool list, takes part in rotation, and follows accounts, quotas and country filters. Each VPN has **one fixed exit IP**; rotation happens **between the category's VPNs** (a different IP from one VPN to the next, on each connection).

## Supported protocols

| Protocol | Engine | Privileges |
|---|---|---|
| **OpenVPN** (`.ovpn`) | kernel tunnel, one per VPN | `NET_ADMIN` + `/dev/net/tun` |
| **WireGuard** (`.conf`) | sing-box (user space) | none |
| **V2Ray**: `vless://` (Reality, WS, gRPC…), `vmess://`, `trojan://`, `ss://`, `hy2://`, `tuic://` | sing-box | none |
| **SSH tunnel**: `ssh://user:password@host:port` | sing-box | none |

The repository's `docker-compose.yml` already adds `cap_add: NET_ADMIN` and `devices: /dev/net/tun`. On a host without `/dev/net/tun` (rare: OpenVZ/LXC), remove these two blocks: only OpenVPN will be unavailable (the dialog says so).

## Add VPNs

**Proxy pool → Add VPNs**:

- **VPNGate (automatic)**: pick **one or more countries** (live list with the number of servers), the number of servers per country (best by score; `0` = **all** of the country's servers), the category. Tick **"Keep up to date automatically"** so the panel replaces dead servers (resync every 30 minutes).
- **URL / subscription** (v2.10.0): https address of a page, a text file or a **subscription** (list of `vless://` `vmess://` `trojan://` `ss://` `hy2://` links, base64-encoded list, WireGuard / OpenVPN configuration). Preview (number of configurations per protocol), maximum number of VPNs (`0` = all), **automatic update** (the source's dead VPNs are replaced). Only public https addresses are read (internal network and redirects to it refused). Tested on a public list of 9,003 links: VLESS, VMess and Shadowsocks established with real exit IPs.
  **Suggested sources** (one click in the tab): public GitHub lists updated automatically — Alirewa (top 100 TLS/Reality, full pool), 0xRadikal (verified, VLESS, Trojan), Morpheusadam (VLESS Reality, Trojan, VMess — several thousand each), Au1rxx (global list), barry-far. A URL source **draws randomly** from the list (never always the same first servers, often dead), **removes** its tried and dead VPNs then **tops up** to the "maximum number of VPNs" with new draws at each sync (every 30 minutes).
- **Manual import**: paste an `.ovpn`, a WireGuard `.conf` or a list of links (one per line), with the category and, optionally, the country (otherwise detected from the exit IP).
- **Sources & status**: automatic sources (enable/delete, sync now) and tunnel status (active, exit IP, latency, error).

## How it works

1. Each VPN is started in the background (up to the **maximum number of tunnels**, see below).
2. A real test measures the exit IP and latency; the VPN is marked **active** or **offline** (the regular checker does not test them).
3. The engine sends customers' connections into the chosen VPN's tunnel. A failing VPN is restarted with an increasing delay.

### Automatic checks: every VPN, not just those from a source

**Every** VPN in the pool is supervised the same way — imported by hand, by URL or by VPNGate: start, real test of exit IP and latency **every minute**, "offline" after 3 failures, restart with increasing delay. The only difference with an **automatic source** is **replacement**: a source adds new servers and removes its dead VPNs; a manually imported VPN stays until you delete it (or it expires).

### Active tunnels and rotation: use ALL the pool's VPNs

An active VPN is a **process running all the time** (10 to 30 MB of memory, a bit of CPU): thousands cannot run at once. The panel **rotates** a limited number of tunnels and **replaces them regularly**, so that **every live VPN in the pool takes its turn**, even with 5,000 of them:

- **Maximum simultaneous tunnels** (default **15**, max **100**, routing table limit);
- **Rotation every N minutes** (default **10**, `0` = no rotation): part of the active tunnels (**34%** by default) is replaced by those unused for the longest — last known alive first, then never-tried ones;
- **Discovery**: besides active tunnels, a few starts are attempted in parallel to find the live VPNs among thousands imported (a successful try above the cap is marked "alive" then stopped, and will serve in turn through rotation); dead ones are retried with increasing delay and last;
- **A customer** sees their connections spread across the tunnels active at time T; over time, they are served by **all** live VPNs. Ongoing connections in a replaced tunnel are cut: avoid a very high percentage with a short rotation.

These three settings live in **Settings → Scraper → VPN**. A source's "maximum number of VPNs" (up to 200) is another setting: it limits what the source adds to the pool. Count about 1 GB of memory for 40 simultaneous tunnels.

*Measured example*: 40 VPNGate servers (Japan, Korea), 5 simultaneous tunnels, rotation every minute: 18 live servers found in 2 minutes and **7 different exit IPs** seen by a customer in 5 minutes (more than the 5 tunnels).

### VPN expiry (subscriptions, free lists)

Many free configurations expire after a few days. Each import (VPNGate, URL / subscription, manual import) has an **"Expires after (days)"** field (0 = never):

- **manual / one-off import**: the VPN is **removed from the pool automatically** N days after import;
- **automatically updated source**: the counter **restarts every time the source still publishes the VPN**; it therefore expires N days after the last publication (a VPN the source no longer lists disappears after N days, or earlier if offline).

Expiry removes the pool line and stops the tunnel (checked every 15 seconds).

## Limits to know

- **IKEv2, L2TP/IPsec, PPTP**: not supported. They need a kernel-level IPsec / GRE stack (running several independent tunnels reliably in a container is impossible), PPTP is also obsolete and insecure, and the sites distributing them create one account per visitor. Prefer OpenVPN, WireGuard or V2Ray; an **SSH tunnel** (`ssh://…`) is supported.
- **No IP rotation on a single VPN**: one fixed IP per VPN. For more rotation, add more VPNs.
- **Free VPNs** (VPNGate…): public, unstable, often blocked by sites, variable speed. Fine for testing; for paying customers, prefer provider VPNs/proxies.
- **"Account generator" sites** (sshocean, jagovpn, sshmax, greenssh, vpnhack, cybertunnel, fastssh, opentunnel, howdy.id, akunssh, vpnjantit…): they create a 7-to-60-day account **per visitor**, behind a form (often a captcha). The panel does not mass-create accounts on a third-party service and does not bypass anti-bot checks: create an account yourself on the site, then paste the configuration (V2Ray link, WireGuard `.conf`, `ssh://…`) into **manual import** with a **lifetime** equal to the account's. The public GitHub lists above are fully automatic.
- **Sites that cannot be read automatically**: ipspeed.info (anti-bot check), VPNBook (files served by JavaScript with shared credentials) and VPNJantit (one account per visitor on each server). The panel does not bypass anti-bot checks and does not mass-create accounts on a third-party service: copy-paste their configurations into **manual import**.
- The protocol shown in the Pool is the VPN's (`openvpn`, `wireguard`, `vless`, `vmess`, `trojan`, `ss`, `hy2`); internally each tunnel is served as a local proxy.
- Memory: about 10 to 30 MB per tunnel.

## Security

Configurations come from **untrusted** public lists and OpenVPN runs with elevated privileges. Since **v2.9.1**, they are filtered by **allow-list**:

- only known, harmless OpenVPN directives are kept (`client`, `remote`, `proto`, `cipher`, `auth`…); everything else is removed: scripts (`up`, `down`, `script-security`…), `plugin`, `config`, `management`, reading local files (`ca /path`, `tmp-dir`…), options with quotes or special characters;
- only the inline blocks `<ca>`, `<cert>`, `<key>`, `<tls-auth>`, `<tls-crypt>` and `<tls-crypt-v2>` are accepted; an unknown (`<connection>`…) or unclosed block makes **the whole file refused**;
- the container stays a **non-root user**: OpenVPN and routing only go through a dedicated helper (`sudo`, validated sub-commands and arguments) that **re-runs the same check** then enforces `--script-security 1` and `--route-nopull`;
- WireGuard keys and link credentials are stored with the proxy line (never shown in the panel) and included in database backups.

::: warning Update
**v2.9.0** used a bypassable deny-list: move to **v2.9.1 or later**.
:::

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "OpenVPN unavailable in this container" | `NET_ADMIN` or `/dev/net/tun` missing: use the repository's `docker-compose.yml` (already included) or add them in Coolify |
| Tunnel in "error" | free VPN server offline: it is restarted with increasing delay; with "keep up to date", it is replaced |
| "configuration refused" | the file contains a directive or block that is not allowed (see Security) |
| Data volume unreadable after update | the container user must stay `100:101` (the case since v2.9.0) |
