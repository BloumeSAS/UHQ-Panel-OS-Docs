# Traffic, quotas and multiplier

## What is counted
An account's traffic is measured **on the upstream provider side**: it is exactly what your proxy reseller bills you, byte for byte, connection negotiation (CONNECT / SOCKS) included. Every attempted upstream connection is counted when it closes, including attempts that did not succeed.

- **Unit: the decimal GB** (1 GB = 1,000,000,000 bytes), as resellers use. The panel, quotas and charts all use the same unit.
- Account traffic adds **sent + received**.
- The dashboard's global chart relies on a counter that never goes down.

## Quotas
An account can have a **traffic limit** (0 = unlimited). It is checked:
- at **authentication** (an exhausted account is refused);
- **continuously** during the connection: as soon as the quota is reached, the account's tunnels are **cut immediately**.

Other per-account limits exist: number of **threads**, **maximum bandwidth** (KB/s, shared across all the account's connections), **expiry date**, allowed IPs, blocked domains.

## Usage multiplier (per category)
In **Proxy categories**, each category has a **usage multiplier** (default ×1). Everything consumed by the accounts of that category is multiplied by this number before being charged:

| Multiplier | Effect |
|---|---|
| ×1 | 500 MB used = 500 MB counted |
| ×2 | 500 MB used = **1 GB** counted — the quota empties twice as fast |
| ×4 | 500 MB used = 2 GB counted |

The multiplier applies to the account total, its quota and its history. **Live throughput** and the **global counter** always show the **real** bytes.

It lets you sell a "premium" category (residential, mobile) at a higher price without changing the quotas shown to your customers.

## Reset traffic
An account's **Reset traffic** button sets its counter back to zero (confirmation required). Counters being written are saved first so nothing is lost.
