# Updates and restarts

## Update the panel

::: tip "Update now" button
Since v2.4.83, the **About** page can trigger the update in one click, with progress and automatic reconnection: see [Automatic updates](/en/guide/mise-a-jour-automatique).
:::

By hand, with Coolify (build from GitHub):
1. A new version is published on GitHub (see the [changelog](/en/changelog)).
2. In Coolify, click **Redeploy**.
3. Check that the **version number in the panel footer** is the latest release (also shown in **About**).

The database schema is updated automatically at startup: no migration to run.

## Server restart
When the server (or Docker) restarts, the panel may start **before PostgreSQL**. Since **v2.4.77**, the panel **waits for the database to answer** (up to 10 minutes) before loading anything: settings, theme, API key, enabled add-ons and proxy engine are therefore read normally.

::: warning Before v2.4.77
A restart during which the database was not ready could show the default theme, **regenerate the API key** and leave add-ons stopped. Update if you still see this behaviour.
:::

### If your settings look reset
1. **Do not click "Save"** in Settings: if they show default values, you would overwrite the real ones.
2. **Redeploy** (or restart the container): settings are read again from the database.
3. If they are really lost: [import them from a backup](/en/guide/sauvegardes#_3-import-settings-only).

## Add-ons after a restart
Bundled official add-ons **are restarted automatically** at startup if they were enabled. If one stays stopped, enable it again in **Extensions** and check the logs.

## Good practices before a server update
- Take a **manual backup** ([Backups](/en/guide/sauvegardes)).
- Check that the PostgreSQL data volume and the `/app/data` volume are **persistent**.
- Check the containers' restart policy (`restart: unless-stopped`).
