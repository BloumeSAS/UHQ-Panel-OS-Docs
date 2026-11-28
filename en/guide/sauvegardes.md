# Backups and restore

All the panel's configuration and data (accounts, proxies, settings, history) live in the PostgreSQL database. So there are three things to know: **back up**, **restore onto a fresh install**, and **import only the settings**.

---

## 1. Automatic backups

**Settings → Backups**: enable automatic backups, choose the frequency (cron expression, every day at midnight by default) and the storage:

| Storage | Detail |
|---|---|
| **Local** | Container folder (`./data/backups` by default) — **mounted on a persistent volume**, otherwise backups disappear with the container. |
| **S3-compatible** | Endpoint, region, bucket, access keys (AWS, Backblaze, MinIO, Cloudflare R2…). Recommended: the backup survives the loss of the server. |

You can also run a backup **by hand** ("Run a backup" button) and download the `backup-db-….json` files.

::: tip Do it right after installing
Enable S3 backups **before** you have customers: that is what lets you recover everything if the VPS is wiped.
:::

---

## 2. Restore onto a fresh install (`/setup`)

If the server was wiped, or if you move to a new VPS, open the `/setup` page of a **fresh** install: the **"Restore a backup"** tab accepts two kinds of files.

| File | Where it comes from |
|---|---|
| **`backup-db-….json`** | Panel backup (automatic or manual, see above). |
| **PostgreSQL 16 `.tar.gz`** | Raw export of the **PostgreSQL data folder** (PGDATA), for example a Docker/Coolify volume export. Even taken "hot". |

Steps:
1. First configure the database ("Database" screen), then open `/setup`.
2. Choose the **Restore a backup** tab and select your file.
3. The file is uploaded in 8 MB chunks (Cloudflare/Traefik compatible, automatic resume on a cut), then the restore runs with step-by-step progress.
4. The panel restarts by itself on the sign-in page: sign in with your **old accounts**.

### Guarantees and limits
- **All or nothing**: the restore runs in a single transaction; on failure, the target database is not changed.
- **The schema is updated** to the installed panel version.
- **Locked after installation**: as soon as an administrator exists, restoring from `/setup` answers "403". Do it **right after deploying**.
- **`.tar.gz`**: PostgreSQL **16 only**, and about **3 times the file size** of free disk space.
- **`.json`**: up to about 400 MB.
- The uploaded file is never kept: it is deleted after processing.

::: warning Restore from Settings → Backups
The **Restore** button in the backup list **replaces everything** the file contains (accounts, proxies, settings…) on an already installed panel. Only use it if that is what you want.
:::

---

## 3. Import settings only

To get the settings back without touching accounts or proxies, two buttons exist:

| Where | Button |
|---|---|
| **Settings → Backups** | **Import settings** |
| **Settings → General** | **Configuration import / export** |

They accept:
- a **flat** file `{ "siteName": "…", "defaultLang": "en" }`;
- the panel's configuration export;
- a full `backup-db-….json` backup (only the settings are read), up to 25 MB: beyond that, extract its `data.setting` part first.

Every known setting is imported, **secrets (SMTP, S3, Groq, captcha) and the panel API key included**. Unknown keys are ignored. The file therefore contains secrets: keep it private and delete it after use.

---

## Move to a new server

1. On the old panel: run a manual backup and download the `.json` (or get the PostgreSQL data folder).
2. Deploy the panel on the new server and configure the database.
3. On `/setup`: **Restore a backup**, then sign in.
4. Update your DNS and check **Settings → Proxy engine** (public host and port).
