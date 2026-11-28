# Automatic updates

Since **v2.4.83**, the **About** page can update the panel **in one click**, with a progress screen and **automatic reconnection**.

::: info How it works
A container cannot rebuild itself. The button therefore asks your deployment platform (**Coolify** by default) to rebuild and restart the application, through its **deploy webhook**. The panel shows the progress, waits for the restart and reloads the page on the new version.
:::

---

## 1. Configure (once)

### With Coolify
1. In Coolify: **Keys & Tokens → API tokens** → create a token with the **deploy** permission (`deploy`), and copy it.
2. Open your application → **Webhooks** → copy the **Deploy Webhook URL** (like `https://coolify.example.com/api/v1/deploy?uuid=XXXX&force=false`).
3. In the panel: **Settings → General → Automatic update**:
   - **Deploy webhook URL**: paste the URL;
   - **API token (Bearer)**: paste the token (stored as a secret, never returned in clear);
   - **HTTP method**: `GET` (Coolify).
4. Save.

### Presets (one click)

**Settings → General → Automatic update → Deployment platform** fills in the method, token header, headers and request body:

| Platform | Method | Token | Where to find the URL |
|---|---|---|---|
| **Coolify** | POST | Bearer (API token, `deploy` permission) | Application → Webhooks → Deploy Webhook |
| **Dokploy** | POST | — | Application → Deployments → Webhook URL |
| **CapRover** | POST | in the URL | App → Deployment → Webhook (`triggerbuild`) |
| **Portainer** | POST | — | Stack → Webhook (redeploy from Git) |
| **Watchtower** | GET | Bearer (`WATCHTOWER_HTTP_API_TOKEN`) | `http://watchtower:8080/v1/update` |
| **Render** | POST | in the URL | Service → Settings → Deploy Hook |
| **Railway** | POST | Bearer (token) | GraphQL API, replace `SERVICE_ID` / `ENV_ID` in the body |
| **Heroku** | POST | Bearer | `…/apps/APP_NAME/builds`, body = GitHub archive of the repo |
| **Vercel** / **Netlify** | POST | — | Deploy Hook / Build hook |
| **Pterodactyl** | POST | Bearer (client API key) | `…/api/client/servers/ID/power` → `restart` signal |
| **Custom** | any | any | any service triggered by URL |

In **Advanced**: token header name (`Authorization`, `X-API-Key`…), prefix (`Bearer` or empty), **extra headers** and **JSON body**.

::: warning Platforms without a TCP port
The proxy engine listens on a **TCP port** (990 by default). Heroku, Vercel and Netlify only publish HTTP: the web panel would work there, but not the proxy. Pterodactyl needs a port allocation and an egg that pulls the latest version at start-up.
:::

### Other platforms
Any service that triggers a deployment by **URL** works (Portainer webhook, Watchtower HTTP API, Dokploy, CapRover…): enter its URL, the method (`GET` or `POST`) and, if needed, a Bearer token.

---

## 2. Update

1. Open **About**: the panel automatically checks the latest version published on GitHub.
2. If a new version exists, click **Update now**.
3. Confirm. Tick **Back up before updating** (recommended; available if automatic backups are enabled).
4. A progress screen appears:

| Step | What happens |
|---|---|
| Update triggered | the platform webhook answered |
| Building the new version | 2 to 10 minutes; **the panel stays usable** meanwhile |
| Restart | about 30 seconds of downtime |
| Reconnection and check | the panel is back on the new version; the page reloads by itself |

You can **reload the page** during the update: tracking resumes automatically.

**Hide tracking**: the **Hide** button shrinks the window into an **"Update in progress…"** pill (spinner + elapsed time) at the bottom left; a click reopens it. Tracking even survives **closing the tab** (found again when the panel is reopened, within one hour) and the window reopens by itself on error, timeout or completion.

### If something goes wrong
| Message | Likely cause |
|---|---|
| "The platform refused the request (code 401/403)" | token missing, expired, or without deploy permission |
| "Cannot reach the webhook" | wrong URL, or the platform is not reachable from the panel |
| "The version did not change" | the deployment failed or an old version restarted: open **Coolify → Deployments** to read the build log |
| "The update is taking more than 25 minutes" | build stuck or failed (same check) |

If the build fails, Coolify keeps the old version running: nothing is lost.

---

## Security
- Reserved to **administrators**; one request per minute max; each update is written to the **audit log** (starting version, backup done or not, webhook host).
- Only `http`/`https` URLs are accepted; the cloud metadata address (`169.254.x.x`) is refused.
- The token is a **secret**: it is never returned in clear by the API and does not appear in logs.
- Prefer a Coolify token limited to deployment over a token with every permission.

See also: [Updates and restarts](/en/guide/mises-a-jour) and [Backups](/en/guide/sauvegardes).
