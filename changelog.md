# Changelog

## v2.0.x

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
