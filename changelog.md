# Changelog

## v2.0.x

### v2.0.20
- **Pays/IP simulés — tirage indépendant par pays** : `fakeIpCountMin`/`fakeIpCountMax` ne décrivent plus un total partagé réparti par pondération entre les pays de `fakeCountries` — **chaque pays tire désormais son propre nombre indépendamment** dans cette plage (`ProxyPool.fakeIpCountByCountry`). Ajouter un pays lui donne immédiatement son propre tirage, sans changer les chiffres déjà affichés pour les autres pays ; changer la plage re-tire tout le monde.
- **Nouveau bouton "Régénérer les IP simulées"** (panel, dialogue de modification d'un pool) : force un nouveau tirage pour tous les pays déjà configurés, sans toucher à la plage (`POST /api/panel/proxy-pools/:id/reroll-fake-ips`).
- **Fix : `GET /api/v1/common/category-stats?pool=` ratait silencieusement une pool** si son nom contenait un espace insécable ou une double-espace (artefact de copier-coller) — le matching se fait désormais sur un nom normalisé (Unicode NFC + espaces réduits) plutôt qu'une égalité octet pour octet.

### v2.0.19
- **Fix : pays/IP simulés invisibles dans le panel sans "Toujours en ligne"** — `fakeCountries`/`fakeIpCount` fonctionnent depuis v2.0.17 indépendamment d'`alwaysOnline`, mais la page **Proxy Pools** ne montrait le badge récapitulatif (pays · nb d'IP) que si `alwaysOnline` était activé. Badge dédié désormais affiché dès qu'un nombre d'IP simulé est configuré, peu importe ce réglage.
- **Fix : `GET /api/v1/common/category-stats?pool=`** plus robuste — le nom de pool passé en query est désormais nettoyé (`trim`) avant la recherche, évitant qu'un espace parasite empêche silencieusement l'ajout des stats simulées.
- **Sécurité — moteur proxy (`:990`)** : la vérification du mot de passe des sous-utilisateurs utilisait une comparaison de chaîne classique (`!==`), vulnérable à une attaque temporelle. Remplacée par une comparaison à temps constant (`crypto.timingSafeEqual`), comme c'était déjà le cas pour les clés API.
- **Sécurité — fuite de JWT par URL** : le guard JWT global (`/api/panel/*`) acceptait le token via `?token=` sur **toutes** les routes protégées, alors que ce fallback n'était nécessaire que pour deux cas précis (doc API embarquée, flux SSE). Un token transmis en query string se retrouve dans les logs serveur, l'historique navigateur et l'en-tête `Referer` envoyé à des tiers. Le fallback générique est retiré du guard ; `GET /docs/spec` valide désormais son token lui-même (même schéma que `logs/stream`), sans rien casser pour la doc embarquée.

### v2.0.18
- **Fix : suppression définitive de proxies KO** — une tâche d'arrière-plan purgeait toutes les 12h (et pour toujours) les proxies `isWorking=false` en base, y compris des proxies manuels valides (hostname) temporairement indisponibles. Cette purge automatique a été **retirée**.
- **Nouveau : archivage des proxies morts définitifs** — un proxy ayant atteint `deadProxyMaxRetries` échecs consécutifs est désormais marqué `archived` (au lieu d'être supprimé) : plus jamais re-testé par le checker, plus jamais réactivé/écrasé par un re-scrape. Seule une suppression manuelle depuis le panel (Pool) peut encore le faire sortir de la base.
- **Traductions manquantes du journal d'audit** (`/audit`) : les actions (`pool.update`, `auth.login`, `proxy.delete`, etc.) sont désormais traduites en FR/EN au lieu d'afficher la clé technique brute.

### v2.0.17
- **Pays/IP simulés découplés de "Toujours en ligne"** : `fakeCountries`/`fakeIpCount` fonctionnent désormais sur **n'importe quelle pool**, sans activer `alwaysOnline`. Les chiffres simulés s'**ajoutent** aux vraies stats (jamais un remplacement) — une pool sans aucun vrai proxy n'affiche que le simulé, une pool avec du vrai stock affiche réel + simulé combiné. `alwaysOnline` reste un réglage indépendant, qui ne contrôle plus que le comportement du checker.
- **Anti-spam scraper renforcé** : la validation IPv4 stricte (déjà ajoutée pour le checker) couvre maintenant aussi les 3 étapes de détection du scraper (regex personnalisée, `parseProxyList`, scan brut) — une source renvoyant du texte pollué (export Tor, etc.) ne peut plus faire entrer de fausses entrées `ip:port` dans le pool.
- **Notifications du panel** : remplacement du système maison (event-bus + composant custom) par [sonner](https://sonner.emilkowal.ski/) (shadcn/ui) — rendu plus moderne (couleurs riches par type, empilement, thème clair/sombre auto). Même API `toast.success/error/info/warning(...)` côté code, rien à changer dans les pages existantes.
- **Performances de l'API panel** :
  - Nouveaux index DB (`BackendProxy.isWorking/isBlacklisted/provider`, `ProxyUsage.userProxyId+date/date`).
  - `monitoring/live`, `monitoring/pool`, `monitoring/countries` et `monitoring/reports` agrègent désormais côté base (`groupBy`/`aggregate`) au lieu de charger tout le pool de proxies ou tout l'historique de trafic en mémoire pour les sommer en JS.
  - `me/proxies/:id/usage` : sommes calculées en DB, plus de chargement illimité de lignes pour ne garder que les 100 affichées.
  - Nettoyage des entrées malformées du checker batché (un seul lot) au lieu d'un appel DB par ligne.

### v2.0.16
- **Pools "Toujours en ligne" + stats simulées** : une pool peut être marquée pour que ses proxies ne soient **jamais** testés/marqués KO par le checker (forcés en ligne à chaque cycle ; le test manuel "Tester" reste un vrai diagnostic mais ne marque jamais KO en DB pour ces pools).
  - Pays simulés (codes ISO) + nombre d'IP simulé (valeur fixe ou plage aléatoire tirée une fois, stable) configurables par pool.
  - `GET /api/v1/common/category-stats?pool=<nom>` renvoie ces stats synthétiques (répartition déterministe par pays) pour une pool ainsi configurée, comme s'il s'agissait d'un vrai pool géolocalisé. Les autres endpoints stats (`pool_stats`, `countries`, `proxies`) restent sur les vraies données.
- **Fix : suppression en masse des proxies morts** (`DELETE /api/panel/monitoring/proxies`) pouvait supprimer des proxies **définitivement blacklistés** (`isBlacklisted=true`) selon le filtre utilisé — désormais exclus systématiquement, quel que soit l'appel. Seule la suppression individuelle (`DELETE .../proxies/:id`) peut encore cibler un proxy blacklisté, en connaissance de cause.
- **Résolution domaine/port étendue à l'API legacy** : `GET /api/v1/sub-user/list`, `/get-sticky-proxies`, `/api/v1/me/proxies` et `/proxies/sticky-list` utilisent désormais la même cascade compte → pool → réglages globaux que le panel (nouveaux champs `host`/`port` en lecture sur les listes ; champ d'écriture toujours panel-only, l'API legacy reste inchangée côté contrat).
- **Format rotatif sans session** (`username:password@host:port`, sans `session`) ajouté aux réponses sticky-list (panel admin/self-service + legacy) — pratique pour les clients qui n'ont pas besoin du format complet `host:port:user:session:pass`.
- **Panel — visibilité des surcharges** :
  - Settings > Proxy public affiche désormais une section "Surcharges actives" listant les pools/comptes ayant leur propre port/domaine dédié.
  - "Mes Proxies" affiche une ligne "Connexion" avec le `host:port` réellement utilisé (résolu via la cascade), plus seulement le champ brut du compte.

### v2.0.15
- **Plage de ports dédiés élargie** : `9000-9100` → **`9000-9999`** (`docker-compose.yml` + `PROXY_PORT_RANGE`). Pensez à élargir votre propre `docker-compose.yml` avant de redéployer si vous l'aviez déjà personnalisé.
- **Domaine dédié (pools & sous-utilisateurs)** : en plus du port, un pool (`Proxy Pools`) ou un sous-utilisateur peut désormais recevoir un **domaine** affiché dans ses listes/connexions (ex. `mobile.example.com`).
  - Optionnel — vide = utilise l'hôte proxy public global (`publicProxyHost`, Settings > Proxy public).
  - Résolution en cascade pour un compte : son propre domaine → celui de sa pool (si assignée) → `publicProxyHost`. Même logique pour le port (son propre port → celui de sa pool → `publicProxyPort`).
  - Purement informatif (DNS) : n'affecte pas le bind réseau réel du moteur, seulement le `host:port` affiché dans les listes sticky et le générateur de format.
  - Settings > Proxy public : les champs `publicProxyHost`/`publicProxyPort` indiquent désormais explicitement qu'ils peuvent être surchargés par pool/compte.
  - **API legacy (`/api/v1`) inchangée**, comme pour le port dédié.

### v2.0.14
- **Ports dédiés (pools & sous-utilisateurs)** : le moteur proxy peut désormais écouter sur **plusieurs ports** en plus du port partagé (`990`, inchangé).
  - **Port par catégorie** : un pool (`Proxy Pools`) peut recevoir un port dédié — toute connexion sur ce port utilise cette catégorie, même si le compte qui se connecte a une autre catégorie par défaut. Permet à un seul compte d'accéder à plusieurs catégories simplement en changeant de port.
  - **Port par compte** : un sous-utilisateur peut recevoir son propre port dédié — voie exclusive (toute autre identification est rejetée sur ce port), comportement sinon identique au port partagé.
  - Personnalisable mais **contraint à la plage 9000-9100**, qui doit être publiée par Docker (`docker-compose.yml` + `PROXY_PORT_RANGE`) pour être joignable depuis l'extérieur. Un port hors plage est refusé à l'écriture.
  - Les ports s'activent/se désactivent en live (sans redémarrage de l'API) dès l'enregistrement dans le panel.
  - **API legacy (`/api/v1`) inchangée** : ce champ n'est lisible/modifiable que depuis le panel admin (Pools, Sous-utilisateurs).

### v2.0.13
- **Checker — vérifications renforcées** :
  - Timeout du health-check configurable (`checkerTimeout`, Settings > Scraper/Checker) — auparavant figé à 5s, ce qui pouvait marquer KO à tort des proxies lents (résidentiels, longue distance).
  - Retry automatique avant de déclarer un proxy mort : un aléa réseau ponctuel (RST transitoire, surcharge momentanée) ne suffit plus à l'invalider pour tout un cycle.
  - `averageLatency` / `successCount` / `failureCount` étaient lus par le scoring de sélection des proxies et par la colonne latence du Pool, mais n'étaient écrits nulle part dans le code — le checker les renseigne désormais à chaque cycle.
  - Nouveau bouton **Tester** par proxy dans le Pool : test immédiat (latence + pays détecté), sans attendre le prochain cycle périodique.
- **API legacy (`/api/v1`)** :
  - `GET /api/v1/common/proxies` renvoie désormais `latency_ms` par proxy.
  - Nouvel endpoint `GET /api/v1/common/category-stats?pool=<nom>` (clé API, scope `read:pool`) : nombre de pays et d'IPs disponibles dans une catégorie (pool), avec répartition détaillée par pays.

### v2.0.12
- Scraper : plafond de 50 000 entrées par source + cession périodique de l'event-loop pendant le dédoublonnage — une source renvoyant un volume aberrant (jusqu'à ~1M d'entrées observées) gelait tout le process (scraper **et** moteur proxy live, même thread Node) pendant plusieurs minutes.
- Scraper : l'échantillon plafonné à 50k par source est désormais aléatoire (Fisher-Yates partiel) plutôt qu'un préfixe fixe — une source énorme finit par être couverte intégralement sur plusieurs cycles au lieu de rester bloquée sur ses 50k premières entrées.
- Scraper : seuil de re-scrape anticipé (« pool < 5000 ») exposé en tant que setting `scraperMinPoolSize` (Settings > Scraper) au lieu d'une constante figée dans le code.
- Scraper + Checker : `scrapeInterval`, `geoResolveInterval` et `proxyCheckInterval` ignoraient une valeur à 0/vide/négative (`Number('')`/`Number('0')` restent valides pour `getNumber()`) — la boucle correspondante tournait alors en continu sans pause. Nouveau garde-fou `getPositiveNumber()`.

### v2.0.11
- **Proxy Pools — catégories de proxies** : nouveau module permettant de segmenter le stock en pools nommés (Datacenter, Résidentiel, Mobile…).
  - Page dédiée **Proxy Pools** (menu latéral) : CRUD complet avec couleur personnalisable.
  - Champ **Pool** sur les proxies importés, les sources de scraping et les sous-utilisateurs.
  - Le scraper propage automatiquement le pool lors de l'ingestion : les proxies scrapés héritent du pool de leur source.
  - Le moteur proxy filtre le cache upstream par `pool` dès qu'un sous-utilisateur est assigné — les listes privées (`customProxies`) restent indépendantes.
  - Filtre par pool dans la page **Pool de proxies** et badge pool dans **Sous-utilisateurs**.
  - API REST admin : `GET/POST /api/panel/proxy-pools`, `PATCH/DELETE /api/panel/proxy-pools/:id`.

### v2.0.10
- **Scraper — auto-détection du protocole** : nouveau mode `Auto-détection` (valeur `auto`) dans les sources de scraping.  
  - Si le contenu retourné contient des URLs avec schéma explicite (`http://ip:port`, `socks5://ip:port`), le protocole est lu directement depuis le contenu.  
  - Fonctionne avec les APIs de listes publiques (ex. ProxyScrape, ProxyList.to, GitHub raw…) qui retournent `http://ip:port` ou `socks5://…`.  
  - Fallback `http` si aucun schéma détecté.
- **Scraper — parsing HTML** : le parser extrait maintenant les proxies depuis des pages HTML (liens `href="http://…"`, tableaux, etc.) sans regex personnalisée.
- **Extensions officielles** : l'onglet Extensions affiche les addons officiels gratuits (Wallet, Orders) avec description, fonctionnalités, lien GitHub et docs. Aucune configuration requise, tiré depuis `/api/panel/addons/registry`.
- **Addon Orders v1.1.0** : livraison automatique de comptes proxy après paiement (`panel_account` mode), rollback sur échec, révocation à l'annulation.

### v2.0.9
- Proxy (listes privées) : refonte de la connexion aux upstreams `customProxies` pour fiabiliser **tous les fournisseurs**.
  - **Handshake HTTP CONNECT** : ajout du header `Host` (requis par HTTP/1.1) + `User-Agent`/`Proxy-Connection`. Beaucoup de passerelles commerciales rejetaient un CONNECT sans `Host` (proxy qui marche en curl mais échouait dans le moteur). S'applique au moteur **et** au checker.
  - **Auto-détection du protocole** : une ligne sans schéma (`user:pass@host:port`) est testée en HTTP → SOCKS5 → SOCKS4, le premier qui répond gagne. Un schéma explicite (`socks5://…`) est respecté.
  - **Essais séquentiels (HTTP d'abord)** : les variantes sont testées une par une (comme curl), plus en parallèle — évite les limites de connexions simultanées des fournisseurs résidentiels.
  - **Timeout** aligné sur le fallback pour les listes privées (résidentiel/rotatif lent).
  - Plus de spam `Record to update not found` : les upstreams privés (`custom:*`) ne sont plus traités comme des `BackendProxy` en base.
- Fix : édition d'un compte proxy depuis le panel renvoyait « id doit être une chaîne de caractères » (l'`id` passe par l'URL, plus par le body).
- Fix : le footer affiche désormais la **vraie version** (lue depuis `package.json`), au lieu de rester figé sur la valeur écrite en base au setup initial.

### v2.0.6
- Fix : les paramètres `bloumechatWebhookUrl`, `bloumechatAlertsEnabled`, `skipDeadProxies` et `deadProxyMaxRetries` n'étaient pas enregistrés (absents de la liste blanche `UpdateSettingsDto` → supprimés par la `ValidationPipe`). Le panel affichait « enregistré » sans rien persister. Corrigé.

### v2.0.5
- Checker : incrémentation du `failCount` à chaque vérification échouée, reset à 0 si le proxy repasse actif
- Scraper : les proxies définitivement morts (`failCount ≥ maxRetries`) ne sont plus réactivés lors du re-scraping ; édition d'une source via une boîte de dialogue dédiée
- Pool : colonne `Échecs`, filtre par statut (actifs / morts / définitifs), réactivation individuelle et en masse ; bascule blacklist par proxy ; export du pool en texte (`ip:port[:user:pass]`)
- Utilisateurs panel : CRUD complet (édition e-mail / rôle / mot de passe / expiration / actif, colonne « créé le »)
- Sous-utilisateurs : réinitialisation du trafic, copie des identifiants, sélection multiple + actions en masse (bloquer / débloquer / reset trafic / supprimer)
- Webhooks : bouton « Tester le webhook » (Discord, Slack) et **nouveau provider BloumeChat**
- Settings : nouveaux paramètres `skipDeadProxies`, `deadProxyMaxRetries`, `bloumechatWebhookUrl`, `bloumechatAlertsEnabled`
- API : messages de réponse traduits (namespace i18n `info`, fr + en)
- Docker : port proxy hardcodé `990:990/tcp` (plus de variable d'expansion fragile), `PROXY_PORT` et `API_PORT` injectés explicitement
- Docs : pages `configuration`, `docker`, `api/zones`, `api/icons` créées ; `installation` mise à jour

### v2.0.4
- Fix : déplacement de la dépendance Prisma dans `dependencies` (évite le pruning en production)

### v2.0.3
- Génération automatique du JWT secret au 1er boot
- Gestion améliorée de l'environnement dans le processus de build

### v2.0.2
- Fix import `randomBytes` depuis `crypto` pour une meilleure sécurité

### v2.0.0 — Refonte majeure
- Migration complète vers NestJS 10 + React 18 + Vite
- Moteur proxy TCP intégré (remplacement de l'ancienne architecture Python)
- Système d'addons modulaires
- Panel React moderne (Tailwind + shadcn)
- Authentification JWT + clé API legacy `/api/v1/*`
- Wizard de setup au premier démarrage
- Support SMTP complet (notifications, rapports, reset mot de passe)
- Captcha (hCaptcha, reCAPTCHA, Turnstile, CAP)
- Webhooks Discord et Slack
- Sauvegardes automatiques (local + S3)
- Checker de santé des proxies avec résolution géographique réelle
- i18n panel et API (fr, en)

---

## v1.x (legacy)

Les versions 1.x utilisaient une architecture Python (FastAPI) + panel React minimal. La migration vers la v2 est une réécriture complète — les données PostgreSQL existantes sont compatibles via Prisma.
