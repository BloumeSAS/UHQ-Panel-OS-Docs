# Configuration

Tous les paramètres sont éditables depuis **Settings** dans le panel admin (`/settings`). Ils sont stockés en base de données — aucun redéploiement requis après modification.

Chaque paramètre peut avoir une variable d'environnement de repli : si aucune valeur n't est en base, la variable d'env est utilisée ; sinon, la valeur de base prévaut.

---

## Général

### `siteName`
- **Défaut :** `UHQ Panel OS by Bloume.fr`
- Nom affiché dans le titre de l'onglet du navigateur et les e-mails.

### `defaultLang`
- **Défaut :** `fr`
- Langue par défaut du panel. Valeurs disponibles : `fr`, `en` (et toute langue ajoutée dans `web/src/lib/i18n/`).

### `registrationEnabled`
- **Type :** booléen — **Défaut :** `false`
- Autorise les visiteurs à créer un compte via `/register`. À désactiver en production si l'inscription est sur invitation uniquement.

### `invitationsEnabled`
- **Type :** booléen — **Défaut :** `false`
- Active le système d'invitations. Les utilisateurs existants peuvent inviter de nouveaux membres.

### `maintenanceModeEnabled`
- **Type :** booléen — **Défaut :** `false`
- Met le panel en maintenance. Les utilisateurs non-admin voient une page de maintenance et ne peuvent pas se connecter.

---

## Proxy public

Ces paramètres définissent ce qui est **affiché aux clients** pour se connecter au proxy. Ils n'affectent pas le port d'écoute réel du moteur proxy (défini par `PROXY_PORT` dans le `docker-compose.yml`).

### `publicProxyHost`
- **Défaut :** `prx.uhq.monster`
- **Variable d'env :** `PUBLIC_PROXY_HOST`
- Hostname ou IP que les clients utilisent pour se connecter au proxy. Doit pointer directement sur votre serveur (**sans** Cloudflare proxy, nuage gris).

### `publicProxyPort`
- **Défaut :** `990`
- **Variable d'env :** `PUBLIC_PROXY_PORT`
- Port affiché aux clients. Doit correspondre au port `990` bindé dans le `docker-compose.yml`.

::: warning Cloudflare
`publicProxyHost` doit utiliser un sous-domaine avec le **nuage gris (DNS only)** dans Cloudflare. Le port 990 n'est pas proxifiable par Cloudflare en plan gratuit. Voir [Docker & Coolify → DNS](/guide/docker#dns-et-cloudflare).
:::

### `proxyTimeout`
- **Défaut :** `3` (secondes)
- **Variable d'env :** `PROXY_TIMEOUT`
- Timeout de connexion à un proxy upstream. Augmenter si vous avez des proxies lents.

### `proxyRacingTimeout`
- **Défaut :** `1.5` (secondes)
- **Variable d'env :** `PROXY_RACING_TIMEOUT`
- Timeout du mode racing (plusieurs upstreams testés en parallèle, le plus rapide gagne).

### `connectionIdleTimeout`
- **Défaut :** `600` (secondes = 10min)
- **Variable d'env :** `CONNECTION_IDLE_TIMEOUT`
- Depuis v2.4.6. Ferme un tunnel client↔upstream sans aucune donnée échangée depuis ce délai. Sans ça, un client qui disparaît sans fermeture TCP propre (poste éteint brutalement, coupure réseau) ne déclenche jamais d'événement de fermeture côté serveur — la connexion, et le thread qu'elle occupe, restent comptés actifs indéfiniment (observé en prod : plus d'un jour après extinction du poste client).

---

## Scraper & Checker

::: warning Scraper et checker ne tournent jamais en même temps (depuis v2.4.6)
Chacun peut charger et traiter jusqu'à ~150 000 proxies — le cumul de RAM/CPU des deux en même temps a déjà causé des crashes/redémarrages en prod. Un `JobCoordinatorService` interne fait attendre celui qui démarrerait en second (jusqu'à 30 min) que l'autre se termine, plutôt que de les laisser se chevaucher. Aucun réglage requis, c'est automatique.
:::

### `scrapeInterval`
- **Défaut :** `3600` (secondes = 1h)
- **Variable d'env :** `SCRAPE_INTERVAL`
- Intervalle entre deux cycles de collecte de proxies depuis les sources configurées.

### `proxyCheckInterval`
- **Défaut :** `900` (secondes = 15min)
- **Variable d'env :** `PROXY_CHECK_INTERVAL`
- Intervalle entre deux cycles de vérification de la santé du pool.

### `geoResolveInterval`
- **Défaut :** `600` (secondes = 10min)
- **Variable d'env :** `GEO_RESOLVE_INTERVAL`
- Intervalle de résolution géographique des IPs sans pays connu.

### `checkerConcurrency`
- **Défaut :** `500`
- **Variable d'env :** `CHECKER_CONCURRENCY`
- Nombre de workers parallèles pour le health-check. Augmenter sur un serveur puissant, réduire si le CPU sature.

### `skipDeadProxies`
- **Type :** booléen — **Défaut :** `true`
- Si activé, les proxies marqués morts (`isWorking: false`) **ne sont pas** re-vérifiés ni re-importés par le scraper.

### `deadProxyMaxRetries`
- **Défaut :** `3`
- Nombre de vérifications consécutives échouées avant qu'un proxy soit considéré **définitivement mort** et ignoré. Fonctionne uniquement si `skipDeadProxies` est activé.

::: tip Test de vivacité HTTP (depuis v2.4.2)
Le checker teste désormais les proxies **HTTP** via un `GET` en forme absolue plutôt qu'un `CONNECT` — beaucoup de proxies HTTP bas de gamme ne supportent que le relais GET et rejettent `CONNECT` (réservé en pratique au tunneling HTTPS), ce qui les faisait auparavant marquer morts à tort. Les proxies SOCKS4/5 utilisent toujours la négociation SOCKS classique, inchangée.
:::

### `scraperProxy`
- **Type :** secret
- **Variable d'env :** `SCRAPER_PROXY`
- Proxy de sortie utilisé par le scraper (tout format accepté : `http://user:pass@ip:port`, `socks5://ip:port`). Utile si votre serveur est bloqué sur certaines sources.

### `groqApiKey`
- **Type :** secret
- **Variable d'env :** `GROQ_API_KEY`
- Clé API Groq pour le provider de scraping assisté par IA. Obtenir une clé gratuite sur [console.groq.com](https://console.groq.com).

---

## SMTP & E-mails

### `smtpHost`
- **Variable d'env :** `SMTP_HOST`
- Adresse du serveur SMTP. Ex : `smtp.gmail.com`, `mail.example.com`.

### `smtpPort`
- **Défaut :** `587`
- **Variable d'env :** `SMTP_PORT`
- Port SMTP. `587` = STARTTLS, `465` = SSL/TLS, `25` = non chiffré.

### `smtpUser`
- **Variable d'env :** `SMTP_USER`
- Identifiant de connexion SMTP (généralement l'adresse e-mail).

### `smtpPass`
- **Type :** secret
- **Variable d'env :** `SMTP_PASS`
- Mot de passe SMTP.

### `smtpFrom`
- **Variable d'env :** `SMTP_FROM`
- Adresse affichée comme expéditeur. Ex : `UHQ Panel <noreply@mondomaine.fr>`.

### `smtpSecure`
- **Type :** booléen — **Défaut :** `false`
- **Variable d'env :** `SMTP_SECURE`
- Activer si le port est `465` (connexion SSL/TLS directe, sans STARTTLS).

### Notifications e-mail

| Paramètre | Défaut | Description |
|---|---|---|
| `emailOnRegister` | `false` | E-mail de bienvenue envoyé à l'inscription |
| `emailOnLogin` | `false` | Alerte envoyée à chaque connexion |
| `emailResetEnabled` | `false` | Active le lien « Mot de passe oublié » sur la page de connexion |

### Rapports automatiques

| Paramètre | Défaut | Description |
|---|---|---|
| `smtpReportsEnabled` | `false` | Active l'envoi de rapports périodiques par e-mail |
| `smtpReportEmail` | — | Adresse destinataire des rapports |
| `smtpReportFrequency` | `daily` | Fréquence : `daily`, `weekly`, `monthly` |

---

## Captcha

### `captchaProvider`
- **Défaut :** `none`
- Provider de captcha pour les formulaires publics (login, inscription, reset de mot de passe).
- Valeurs : `none` \| `hcaptcha` \| `recaptcha` \| `turnstile` \| `cap`

### `captchaSiteKey`
- Clé publique du provider captcha.

### `captchaSecretKey`
- **Type :** secret
- Clé secrète du provider captcha (vérification côté serveur).

### `captchaCapEndpoint`
- URL de base de l'instance CAP. Uniquement si `captchaProvider = cap`. Ex : `https://cap.trycap.dev`.

---

## Webhooks (Discord / Slack / BloumeChat)

### Discord

| Paramètre | Défaut | Description |
|---|---|---|
| `discordAlertsEnabled` | `false` | Active les notifications Discord |
| `discordWebhookUrl` | — | URL du webhook Discord |

### Slack

| Paramètre | Défaut | Description |
|---|---|---|
| `slackAlertsEnabled` | `false` | Active les notifications Slack |
| `slackWebhookUrl` | — | URL du webhook Slack |

### BloumeChat

| Paramètre | Défaut | Description |
|---|---|---|
| `bloumechatAlertsEnabled` | `false` | Active les notifications BloumeChat |
| `bloumechatWebhookUrl` | — | URL du webhook BloumeChat (format `https://bloumechat.com/api/v2/webhooks/<id>/<token>`) |

Chaque service dispose d'un bouton **Tester le webhook** dans le panel (Settings → Webhooks) qui envoie un message de test immédiat sur l'URL **enregistrée** (pensez à sauvegarder avant de tester).

Les notifications sont envoyées lors d'événements importants : proxy mort, seuil de pool bas, quota dépassé, etc.

---

## Sauvegardes de base de données

### `backupDatabaseEnabled`
- **Type :** booléen — **Défaut :** `false`
- Active la planification automatique des sauvegardes.

### `backupIntervalCron`
- **Défaut :** `0 0 * * *` (minuit chaque jour)
- Expression cron de la fréquence de sauvegarde.

::: tip Fenêtre calme avant une sauvegarde planifiée (depuis v2.4.6)
Une sauvegarde **planifiée** (cron) attend que le scraper et le checker soient à l'arrêt, et que le trafic soit raisonnable (≤100 threads actifs), avant de démarrer réellement — jusqu'à 20 minutes d'attente, puis elle se lance quand même pour ne jamais sauter un cycle planifié. Le déclenchement **manuel** ("Lancer une sauvegarde" dans le panel) reste immédiat, sans attente : c'est une intention explicite de l'admin.
:::

::: tip Sauvegarde streamée (depuis v2.4.5)
Sur une base volumineuse (plusieurs Go), la sauvegarde ne charge plus chaque table entière en mémoire avant de tout sérialiser en un bloc — ça dépassait la limite de taille de string V8 et/ou la limite S3 de 5 Go pour un upload non-multipart. Les grosses tables (`UserProxy`/`ProxyUsage`/`BackendProxy`) sont désormais lues par pages de 5000 lignes et streamées directement ; l'upload S3 passe par un multipart automatique (`@aws-sdk/lib-storage`), sans limite de taille.
:::

### `backupStorageType`
- **Défaut :** `local`
- Destination des sauvegardes : `local` (répertoire sur le serveur) ou `s3` (bucket S3 compatible).

### Stockage local

| Paramètre | Défaut | Description |
|---|---|---|
| `backupLocalPath` | `./data/backups` | Chemin absolu ou relatif du répertoire de sauvegarde |

### Stockage S3

| Paramètre | Défaut | Description |
|---|---|---|
| `backupS3Endpoint` | — | URL de l'endpoint S3 (ex. `https://s3.eu-west-3.amazonaws.com`) |
| `backupS3Bucket` | — | Nom du bucket |
| `backupS3AccessKey` | — | Clé d'accès |
| `backupS3SecretKey` | — | Clé secrète (chiffrée en base) |
| `backupS3Region` | `us-east-1` | Région AWS / compatible |

::: tip Sauvegarde manuelle : destination indépendante du cycle auto
Le bouton **Lancer une sauvegarde** (Paramètres → Sauvegardes) a son propre
sélecteur Local/S3 : il force la destination de **cette exécution
uniquement**, sans toucher à `backupStorageType` ni au cycle automatique
planifié. Pratique pour tester un stockage sans changer la config globale.
:::

::: tip Tester la connexion S3
Un bouton **Tester la connexion** valide bucket + identifiants (`ListObjectsV2`
léger) sans lancer de sauvegarde — un champ vide/masqué retombe sur la valeur
déjà enregistrée en settings.
:::

::: tip Déclenchement non-bloquant (bases volumineuses)
`POST /backup/run` répond immédiatement (le déclenchement se fait en tâche de
fond) — indispensable pour une base de plusieurs centaines de Mo, dont la
sauvegarde peut largement dépasser le timeout du reverse-proxy devant l'API en
prod. Le panel poll `GET /backup/run-status` pour afficher le résultat réel
une fois la sauvegarde terminée.
:::

---

## Clé API legacy

### `apiKey`
- **Type :** secret
- Clé d'authentification pour les routes `/api/v1/*` (API legacy).
- Passer via l'en-tête `X-API-Key` ou en mot de passe Basic auth.
- Régénérable depuis **Settings → Clé API** sans redéploiement.
- **Ne jamais** modifier via `PUT /settings` — utiliser les endpoints dédiés.

::: danger
La clé API legacy donne un accès complet aux routes `/api/v1/*`. Ne la partager qu'avec des systèmes de confiance.
:::

---

## Tableau de bord (stats base de données)

Depuis v2.4.2, l'onglet **Settings → Tableau de bord** affiche :
- la **taille de la base PostgreSQL sur disque** (`pg_database_size`) ;
- le **nombre de lignes** des tables principales (proxies du pool, comptes proxy, lignes d'usage/trafic, journaux d'audit, sources scraper).

C'est une lecture à la demande (`GET /api/panel/monitoring/db-stats`), pas un polling continu — cliquez **Actualiser** pour rafraîchir.

::: tip Import manuel de proxies
La limite de taille des requêtes JSON de l'API est passée de 100 Ko (défaut NestJS) à **25 Mo** en v2.4.2 — l'import manuel d'une grosse liste de proxies (Pool de proxies → Importer) ne renvoie plus "entity too large".
:::

---

## Paramètres d'infra (variables d'env uniquement)

Ces paramètres ne sont **pas** gérés par le panel — ils doivent être définis dans le `docker-compose.yml` ou les variables d'environnement :

| Variable | Défaut | Description |
|---|---|---|
| `DATABASE_URL` | — | URL PostgreSQL (obligatoire en dehors du compose tout-en-un) |
| `PROXY_PORT` | `990` | Port d'écoute réel du moteur proxy TCP |
| `API_PORT` | `8000` | Port d'écoute de l'API NestJS |
| `DATA_DIR` | `/app/data` | Répertoire de données persistantes |
| `TZ` | `Europe/Paris` | Fuseau horaire |
