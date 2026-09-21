# Changelog

## v2.4.x

### v2.4.34 — Anti-brute-force sur le moteur proxy
- **Nouveau : bannissement automatique après échecs d'auth répétés sur le proxy (port 990)** — jusqu'ici, seul `/auth/login` (panel) était protégé contre les tentatives répétées ; l'authentification Basic-Auth du moteur proxy n'avait aucune limite, une IP pouvait enchaîner des dizaines d'échecs sans friction (observé en prod : 6-7 échecs à la même seconde depuis une IP). Le moteur bannit désormais automatiquement une IP au-delà d'un seuil configurable, en réutilisant le mécanisme existant des IP bannies (visible/révocable depuis Sécurité → IP bannies) + une notification in-app à chaque auto-ban. Réglages dans **Paramètres → Sécurité** : activer/désactiver, seuil d'échecs (défaut 15), fenêtre glissante en secondes (défaut 60s), durée du ban en heures (défaut 24h).

### v2.4.33 — Fix captcha Cap, page Rapports améliorée, Settings réorganisés
- **Fix : captcha Cap cassé (404)** — l'URL CDN pointait vers le mauvais paquet npm et le mauvais chemin. Corrigée et vérifiée.
- **Rapports : trafic quotidien en vraie courbe** au lieu d'une liste de barres, et **export PNG/PDF** (`html2canvas`/`jsPDF`) à la place de `window.print()`.
- **Paramètres : nouvel onglet "Sécurité"** — la 2FA obligatoire et les 4 réglages de rétention avaient été ajoutés dans l'onglet "Général" (v2.4.29/v2.4.32) et s'y noyaient ; ils ont maintenant leur propre onglet.

### v2.4.32 — Filtre par compte, comparaison de période, export PNG/PDF
- **Nouveau : filtre par sous-utilisateur** (Analytics) — scope le graphique de trafic, le top domaines et une mini bande de stats sur un seul compte. Granularité journalière ; pas de vue de latence par compte (structurellement impossible, proxies partagés/mis en course).
- **Nouveau : comparaison période sur période** — badge "+12%/-5% vs période précédente" sur le graphique de trafic, sans requête supplémentaire.
- **Nouveau : export PNG/PDF du dashboard Analytics** (`html2canvas`/`jsPDF`, chargés à la demande).
- **Nouveau : rétention configurable** pour l'historique santé du pool et trafic (`poolHealthSnapshotRetentionDays`, `trafficSnapshotRetentionDays`) — et `notificationRetentionDays`/`auditLogRetentionMonths` (existants côté API, jamais exposés) sont maintenant éditables depuis Paramètres.

### v2.4.31 — Graphique de trafic dans le temps, badge "cet appareil"
- **Nouveau : graphique de trafic dans le temps** (Analytics) — nouvelle table `TrafficSnapshot` (snapshot toutes les 15 min, rétention 7 jours) permettant un vrai historique de volume (envoyé/reçu/requêtes) sur la plage sélectionnée (6h/24h/7j), là où seul le trafic du jour courant était visible auparavant.
- **Nouveau : badge "cet appareil"** (page Sécurité) — la session en cours est identifiée et mise en avant, son bouton de révocation individuel masqué (pour éviter de se déconnecter soi-même par erreur).

### v2.4.30 — Analytics enrichi, traductions du journal d'audit
- **Analytics : bandeau temps réel** (5s) — threads/sessions actifs, volume/requêtes du jour, charge CPU, RAM, latence DB. **Top domaines du jour** et **Comptes actifs** (débit en direct, quota) en plus des graphiques existants.
- **Fix : noms d'action bruts non traduits dans le journal d'audit** (`notifications.purge`, `banned-ip.create`, `proxy.setCountryFormat`, etc.) — toutes les actions ajoutées récemment (2FA, IP bannies, domaines bloqués, thème, templates...) ont maintenant leur traduction.

### v2.4.29 — 2FA obligatoire admin, codes de récupération, pagination serveur
- **Nouveau : 2FA obligatoire pour les admins** (`require2faForAdmins`, Paramètres → Sécurité) — enferme le compte sur la page Sécurité tant que la 2FA n'est pas activée, sans bloquer le login lui-même.
- **Nouveau : codes de récupération 2FA** — 10 codes à usage unique à l'activation, repli possible au login si l'appareil TOTP est perdu, régénération protégée par le code actuel.
- **Nouveau : alerte nouvelle IP de connexion / utilisation d'un code de récupération** — in-app + e-mail.
- **Fix : XSS mineur dans les nouveaux e-mails d'alerte** (IP/user-agent non échappés) — trouvé et corrigé le jour même par la revue de sécurité automatique.
- **Nouveau : recherche + pagination côté serveur** pour Sous-utilisateurs, dialog de confirmation réutilisable (remplace `window.confirm()`), badge de source (manuel/scrapé) dans Pool de proxies.
- **Nouveau : `GET /api/panel/health/detailed`** (admin) — fds ouverts, connexions Postgres actives, plus grosses tables.

### v2.4.28 — Fix critique 2FA au login, sidebar réorganisée
- **Fix critique de sécurité : la 2FA n'était jamais vérifiée au login** — `POST /auth/login` émettait un JWT complet dès email+mot de passe validés, sans jamais regarder `totpEnabled`. Activer la 2FA ne protégeait donc rien à la connexion. Corrigé : un compte 2FA reçoit un jeton temporaire (5 min) après le mot de passe et doit valider son code à 6 chiffres via `POST /auth/login/2fa` (limité à 10 tentatives/min/IP) avant d'obtenir une vraie session.
- **Sidebar groupée en sections** (Gestion / Supervision / Système / Compte côté admin) au lieu d'une longue liste plate.
- **Profil et Sécurité retirés de la sidebar** — accessibles en cliquant sur la zone email/rôle en haut à droite (→ Profil, qui contient le raccourci vers Sécurité), désormais toujours cliquable et visible à toutes les tailles d'écran (avant : inerte sans extension installée, et masquée sur mobile).

### v2.4.27 — Retrait/resynchronisation des domaines bloqués (API sub-user)
- **Nouveau : `POST /api/v1/sub-user/blocked-domains/remove`** — retire des domaines de la liste bloquée d'un compte (l'endpoint `/add` existait depuis v2.4.26, mais aucun moyen de revenir en arrière).
- **Nouveau : `POST /api/v1/sub-user/blocked-domains/set`** — remplace intégralement la liste en un appel, pour resynchroniser l'état complet côté client sans calculer un diff add/remove.

### v2.4.26 — Fix tracking domaine, domaines bloqués par compte
- **Fix : le tracker de trafic (top domaines visités) affichait souvent "google.com" au lieu du vrai domaine** — pour CONNECT (HTTPS) sans header `Host` (fréquent, pas obligatoire pour cette méthode), le code repassait par `extractHost()` (pensé pour une URL absolue ou un header Host) au lieu d'utiliser directement `path` (déjà le host:port cible pour CONNECT). Même bug, plus grave, sur le tunnel de secours résidentiel : une requête CONNECT concernée ouvrait le tunnel vers **google.com au lieu de la vraie destination**.
- **Nouveau : domaines bloqués par compte proxy** — chaque sous-utilisateur peut avoir une liste de domaines interdits (bloque le domaine exact + ses sous-domaines), vérifiée dès la connexion. Configurable en panel admin, en self-service (Mes Proxies), et via l'[API sub-user](/guide/proxy-pools#domaines-bloqués) (`/api/v1/sub-user/create`, `/update`, `/blocked-domains/add`).

### v2.4.25 — Fix bloat de la table Notification (5,4 Go)
- **Fix critique : table `Notification` à 5,4 Go / 610k lignes** — l'alerte "🚨 Proxy Hors Ligne" (une par proxy mort détecté, dédupliquée à 1/heure/URL mais sans aucune purge) a suffi à faire grossir la table indéfiniment sur un pool de dizaines de milliers de proxies. Cette alerte n'écrit plus de ligne in-app (les webhooks Discord/Slack restent inchangés).
- **Nouveau : rétention automatique** (`notificationRetentionDays`, défaut 30 jours) — purge quotidienne, filet de sécurité pour les autres types de notification.
- **Nouveau : bouton "Purger"** dans la cloche de notifications (admin) — vide immédiatement toute la table.

::: tip Récupérer l'espace déjà utilisé
Le fix stoppe la croissance mais ne réduit pas la base déjà accumulée — utiliser le bouton **Purger** (cloche) ou attendre la purge automatique. Après une purge massive, un `VACUUM FULL` côté Postgres peut être nécessaire pour que l'espace disque soit réellement rendu à l'OS (sinon Postgres le garde réservé pour la table).
:::

### v2.4.24 — Plafond de descripteurs relevé (1 048 576)
- **`ulimits.nofile` du container relevé de 200 000 à 1 048 576** dans `docker-compose.yml` — un burst de connexions d'un seul sous-compte (checker de combos IPTV : des centaines de requêtes/seconde, chacune faisant courir jusqu'à 5 upstreams en parallèle) a suffi à épuiser 200 000 descripteurs et redéclencher `EMFILE`, malgré le fix v2.4.23 (qui corrigeait une fuite différente, côté reconnexions Prisma). Voir [Docker & Coolify → Dépannage](/guide/docker#d%C3%A9pannage-emfile-too-many-open-files) — le daemon Docker de l'hôte doit lui aussi autoriser au moins cette valeur (`LimitNOFILE`), sinon le plafond réel reste inchangé malgré ce réglage.

### v2.4.23 — Fix fuite de descripteurs (EMFILE)
- **Fix critique : `EMFILE: too many open files` après une série de coupures DB** — `PrismaService` refaisait `$connect()` après une perte de connexion sans jamais `$disconnect()` l'ancien client d'abord, laissant son pool de sockets TCP ouvert en arrière-plan à chaque cycle. Sur une série de coupures DB rapprochées, les descripteurs jamais libérés finissaient par épuiser la limite du process — provoquant des 500 sur n'importe quelle page du panel (fichiers statiques compris). Voir [Docker & Coolify → Dépannage](/guide/docker#d%C3%A9pannage) pour le diagnostic si ça se reproduit.

### v2.4.22 — IP bannies, page Profil
- **Nouveau : bannissement d'IP** — page admin **IP bannies** (`/banned-ips`) : bannit une ou plusieurs IP en une fois (indépendamment des comptes), vérifié avant même l'authentification (erreur HTTP 403 immédiate, connexion fermée, aucun thread consommé). Raison et expiration optionnelles ; débannissement individuel ou en masse.
- **Nouveau : page Profil** (`/profile`, tous rôles) — infos du compte + changement de mot de passe, avec raccourci vers le statut 2FA.
- **Fix : navigation admin vers Sécurité/Clés API** — ces pages existaient déjà (backend + route) mais n'étaient liées nulle part dans le menu admin, rendant la 2FA inaccessible sans taper l'URL à la main. Corrigé — voir [Configuration → IP bannies / 2FA](/guide/configuration#s%C3%A9curit%C3%A9-durcissement-v2-4-11-v2-4-12).

### v2.4.21
- **Fix : les drapeaux pays ne s'affichaient pas sous Chrome (Windows)** — les emoji drapeaux (ajoutés en v2.4.20) ne rendent pas nativement sur Windows, faute de police système embarquant ces glyphes (contrairement à macOS/Android/iOS) ; Chrome/Edge/Firefox y affichaient le code pays brut à la place. Remplacés par des images (flagcdn.com), identiques sur toutes les plateformes — corrigé dans Sous-utilisateurs et dans Pool de proxies.

### v2.4.20
- **Fix : colonne "Pays" de Sous-utilisateurs cassait avec beaucoup de pays sélectionnés** — une longue liste (ex. `NL,FR,DE,GB,RU,TR,ES,IT,UA,PL,CZ,SE,...`) débordait en texte brut la ligne du tableau. Affichée désormais en **drapeaux** (jusqu'à 8 inline), avec un bouton "+N" ouvrant la liste complète dans une modal au-delà — dans le tableau et dans la vue rapide.

### v2.4.19 — Logs & audit
- **Nouveau : volume Docker pour `/app/logs`** — les fichiers de logs survivent désormais aux redéploiements (jusqu'ici seul `/app/data` était monté).
- **Nouveau : lecture des fichiers de logs déjà écrits** — `GET /api/panel/logs/files` (liste) + `GET /api/panel/logs/files/:filename` (contenu, `?tail=N`) ; nouvel onglet "Historique fichiers" dans **Administration → Logs**, qui charge aussi désormais le buffer mémoire au chargement (avant, seul le flux live SSE alimentait l'écran).
- **Nouveau : variable `LOG_LEVEL`** — filtre debug/verbose au démarrage sans changement de code ; `error` reste toujours émis quel que soit le seuil configuré.
- **Nouveau : rétention du journal d'audit** — purge quotidienne des lignes plus vieilles que `auditLogRetentionMonths` (réglage panel, défaut 12 mois) ; auparavant la table `AuditLog` grossissait indéfiniment.
- **Nouveau : ID de corrélation par requête** — chaque ligne de log émise pendant une requête HTTP porte désormais le même ID (repris de `X-Request-Id` si fourni, sinon généré), affiché dans le flux live du panel.
- **Nouveau : dimension erreur sur le trafic** — le sniff HTTP en clair (403/captcha/geo-block) est maintenant persisté (nouvelle table `ProxyUsageError`) au lieu de se perdre dans un simple avertissement. Exposé en `errors`/`errors_by_reason` sur les statistiques admin et sur l'API legacy (`/api/v1/stats/proxy/:id`) — corrige le widget "Erreurs HTTP" vide côté UHQ.Monster. Limite connue : l'HTTPS (l'essentiel du trafic) reste structurellement opaque pour un tunnel TCP bas niveau, aucune tentative de MITM/TLS-termination n'a été ajoutée.
- **Fix : export CSV du journal d'audit** — le bouton "Télécharger CSV" n'exportait que la page affichée (50 lignes) malgré son libellé ; génère maintenant le CSV complet côté serveur sur le résultat filtré. Nouveaux filtres (action, email, plage de dates) dans l'écran **Audit**.

### v2.4.18
- **Fix : validation trop stricte du format "pays sélectionnable"** — exigeait `{user}` ET `{country}`, mais l'un des exemples cliquables fournis dans l'UI elle-même (`dc-{country}`) est un gabarit à remplacement complet qui ignore volontairement le username d'origine (usage réel et légitime). Seul `{country}` (ou `{COUNTRY}`) est désormais requis ; `{user}` reste utilisable mais optionnel.

### v2.4.17
- **Fix : pays multiples toujours résolus au premier de la liste** — quand plusieurs pays étaient demandés (ex. `IT,FR,US`), l'injection du pays dans le username d'un proxy "pays sélectionnable" prenait toujours le premier code, quel que soit le nombre de requêtes. Un pays est désormais tiré au hasard parmi la liste à chaque connexion.

### v2.4.16
- **Nouveau : statistiques par compte proxy dans le panel admin** — nouveau bouton sur chaque compte dans **Sous-utilisateurs** : filtre par période (semaine/mois/année/tout), requêtes, données totales, envoyé/reçu, threads actifs, et **top 25 des sites les plus visités** avec requêtes + volume par domaine. Auparavant réservé au propriétaire du compte via "Mes Proxies".
- **Fix** : le format sticky-list affiché côté admin (`GET /subusers/:id/sticky-list`) annonçait encore l'ancien format à 5 champs — resté oublié lors du passage au format 4 champs en v2.4.5 (seule la copie côté "Mes Proxies" avait été corrigée).

### v2.4.13 – v2.4.15 — Proxies "pays sélectionnable"
- **Nouveau : format de username configurable pour l'injection du pays**, à deux niveaux — voir [Proxies "pays sélectionnable"](/guide/proxy-pools#proxies-pays-sélectionnable-depuis-v2-4-13) :
  - **Par pool** (`fallbackCountryFormat`) : gabarit utilisé par le fallback résidentiel unique de cette catégorie.
  - **Par proxy** (`countryFormat`) : les vrais proxies de la pool peuvent chacun avoir leur propre gabarit — plusieurs fournisseurs avec des conventions différentes cohabitent dans la même catégorie. Réglable à l'import manuel (toggle "Proxies pays sélectionnable") **ou après coup** (v2.4.15) via sélection multiple + barre d'action groupée dans Pool de proxies.
  - Exemples de gabarits cliquables dans les deux écrans.
- **v2.4.14** : clarification UI — le champ pool-level ne concerne QUE le fallback résidentiel, pas les proxies de la pool ; note ajoutée dans les deux écrans pointant l'un vers l'autre.

### v2.4.12
- **Fix sécurité (suite v2.4.11)** — le rate-limiter de login/forgot-password lisait `X-Forwarded-For` directement depuis les headers de requête, un champ entièrement contrôlé par le client tant que l'app ne déclare pas explicitement de quel hop se méfier — en changer la valeur à chaque requête permettait de contourner la limite par IP. `app.set('trust proxy', 1)` déclare qu'un seul hop (Traefik/Coolify, seul reverse-proxy devant l'API) est de confiance, et `req.ip` (Express) remplace le parsing manuel partout où l'IP client est utilisée.

### v2.4.11
- **Fix sécurité : path traversal admin sur la restauration/suppression de backups locaux** — `POST /backup/restore` et `DELETE /backup/:filename` concaténaient le nom de fichier fourni tel quel dans le chemin disque. Un nom du type `../../../../etc/passwd` sortait du répertoire de backups. `path.basename()` neutralise désormais toute traversée.
- **Fix sécurité : aucune protection anti-brute-force sur `/auth/login` et `/auth/forgot-password`** — le seul frein existant (captcha) n'est pas configuré par défaut sur une install fraîche. Nouveau limiteur en mémoire (fenêtre glissante) : 5 tentatives/min par IP+email en login (+ 20/min par IP contre le spray multi-comptes), 5/min par IP sur forgot-password.

### v2.4.10
- **Fix majeur : crashes "Uncaught exception: read ECONNRESET"** — le listener d'erreur sur les sockets (client comme upstream) n'était actif que pendant la phase de connexion (`.once('error', ...)`), qui se retire définitivement après son premier déclenchement même sans rien faire. Toute erreur socket ultérieure (ECONNRESET pendant le relais réel) se retrouvait alors sans aucun listener — Node la relance comme exception non interceptée jusqu'au process. Un listener d'erreur permanent est maintenant posé dès la création de chaque socket.
- **Fix : "détecter le pattern" (Groq) pouvait échouer avec "Réponse vide du modèle"** — les modèles `openai/gpt-oss-*` consomment des tokens de raisonnement caché avant de produire la réponse visible ; avec un budget de 150 tokens, tout pouvait être englouti par ce raisonnement. `max_tokens` relevé à 300 et `reasoning_effort: 'low'` ajouté pour ces modèles. Chaque message d'erreur indique aussi désormais quel modèle a échoué et pourquoi.

### v2.4.9
- **Fix : "détecter le pattern" pouvait renvoyer un succès avec un pattern vide** — `new RegExp('')` ne lève jamais d'erreur ; une réponse vide/mal formée du modèle passait le contrôle de validité existant et renvoyait un faux succès, effaçant silencieusement le champ pattern. L'API rejette maintenant une réponse vide et vérifie que le regex retourné a bien ses 2 groupes de capture requis avant de l'accepter.

### v2.4.8
- **Fix : modèle Groq décommissionné** — `gemma2-9b-it` a été retiré par Groq (HTTP 400 "no longer supported"), cassant le dernier fallback de l'aide "détecter le pattern automatiquement". Remplacé par `openai/gpt-oss-20b`.

### v2.4.7
- **Fix : "Vider la catégorie" renvoyait un 500** — sur une catégorie très fournie, la suppression était un seul `deleteMany` géant attendu de façon synchrone, ce qui pouvait dépasser une limite de la base ou le timeout du reverse-proxy en prod. Tourne désormais en tâche de fond, par lots de 5000 ids, suivie via un endpoint de polling (même pattern que les sauvegardes manuelles) — le bouton se déclenche instantanément et notifie une fois terminé.

### v2.4.6
- **Fix majeur : crashes/redémarrages causés par le scraper et le checker tournant en même temps** — chacun peut charger et traiter jusqu'à ~150 000 proxies ; le cumul de RAM/CPU a déjà fait sauter le process en prod. Un nouveau `JobCoordinatorService` garantit qu'un seul des deux tourne à la fois : l'autre attend (jusqu'à 30 min) que le premier se libère avant de démarrer, au lieu de risquer le chevauchement.
- **Sauvegarde automatique : attend une fenêtre calme** — les sauvegardes planifiées (cron) attendent désormais que le scraper/checker soient à l'arrêt ET que le trafic soit raisonnable (≤100 threads actifs) avant de démarrer (jusqu'à 20 min d'attente, puis lancement quand même pour ne jamais sauter un cycle planifié). Le déclenchement manuel ("Lancer maintenant") reste immédiat.
- **Fix majeur : connexions "actives" qui ne se libéraient jamais** — un client qui disparaît sans fermeture TCP propre (poste éteint brutalement, coupure réseau) ne déclenche jamais d'événement de fermeture côté serveur ; la connexion, et le thread qu'elle occupait, restaient comptés actifs indéfiniment (observé : plus d'un jour après extinction du poste client). Chaque tunnel se ferme désormais automatiquement après une période d'inactivité — nouveau réglage `connectionIdleTimeout` (Settings → Proxy → "Timeout d'inactivité"), défaut 600s.
- **Nouveau : vider une catégorie** — bouton dans **Proxy Pools** pour supprimer TOUS les proxies d'une catégorie sélectionnée en un clic, sans supprimer la catégorie elle-même (port/domaine/stats simulées conservés). `pool` étant une simple string dénormalisée sur `BackendProxy` (pas de FK), supprimer une pool ne nettoyait jusqu'ici jamais ses proxies.

### v2.4.5
- **Fix majeur (suite) : les proxies ajoutés manuellement restaient ignorés** — le fix v2.4.4 (cache par pool) restait insuffisant : chaque pool gardait un cache trié/tronqué par `successCount` (top 500), donc un proxy neuf (`successCount: 0`) dans une pool déjà bien fournie n'entrait jamais dans le cache, même après des milliers de requêtes. Le tri par succès avant troncature est supprimé : le cache contient maintenant tout le stock actif de chaque pool, et c'est le trust score (tirage pondéré) qui décide qui est choisi.
- **Fix majeur : sauvegarde automatique en échec sur les grosses bases** — la sauvegarde chargeait chaque table entière en mémoire et construisait tout le JSON en un seul buffer avant l'upload ; sur une base de plusieurs Go, ça dépassait la limite de taille de string V8 (OOM silencieux) et/ou la limite S3 de 5 Go pour un upload non multipart. La sauvegarde est désormais **streamée** : les grosses tables sont lues par pages (jamais plus de 5000 lignes en mémoire), et l'upload S3 passe par un multipart automatique (`@aws-sdk/lib-storage`) sans limite de 5 Go.
- **Fix : format des proxies "session" générés** — `host:port:user:session:pass` (5 champs) était rejeté par la plupart des logiciels proxy, qui n'acceptent que le format classique à 4 champs. Le générateur produit maintenant `host:port:user-session-XXXX:pass` (convention standard), comprise nativement par le moteur. Bonus : les préréglages "Sticky @/HTTP URI/SOCKS5 URI" du panel utilisaient déjà cette convention côté UI mais n'étaient jamais réellement supportés côté moteur — ils fonctionnent désormais pour de vrai.
- **Nouveau : onglet "Comptes actifs"** sur le Dashboard — liste en direct des comptes proxy actuellement actifs (threads ouverts + limite, bande passante live upload/download, catégorie, quota), rafraîchie toutes les 5s, avec filtre par compte/label/catégorie.

### v2.4.4
- **Fix majeur : les proxies ajoutés manuellement dans une pool n'étaient jamais utilisés** si cette pool contenait déjà des proxies scrapés avec un historique établi — le cache mémoire de sélection était un seul "top-N" global toutes pools confondues trié par taux de succès, ce qui empêchait le fallback DB (qui aurait vu les proxies manuels) de se déclencher. Le cache est désormais construit **par pool**, avec une tranche garantie pour chacune (corrigé plus complètement en v2.4.5, voir ci-dessus).
- **Dashboard** — la liste "Proxies utilisés en direct" affiche désormais la catégorie (pool) de chaque proxy actif, avec un champ de filtre (compte, IP ou catégorie).

### v2.4.3
- **Fix : `check-update` renvoyait une "dernière version" périmée** — l'appel à l'API de tags GHCR (`/v2/{image}/tags/list`) n'utilisait aucun paramètre `n` explicite ; GitHub pagine cette réponse par défaut (~100 entrées, **pas nécessairement triées par version**), ce qui pouvait couper la liste juste avant les tags semver les plus récents (ex. affichait `2.4.0` alors que `2.4.1`/`2.4.2` étaient déjà publiées sur le registre). L'appel demande désormais explicitement `n=1000`, largement au-dessus de la volumétrie réelle du dépôt.

### v2.4.2
- **Rotation des proxies par trust score** — le choix de l'upstream backend combine désormais taux de succès et latence (`trust score`) avec un tirage pondéré sur une fenêtre élargie de candidats, plus une pénalité de cooldown (60s) après chaque sélection : les meilleurs proxies restent favorisés mais ne sont plus systématiquement réutilisés en boucle H24. Voir [Sélection des upstreams](/guide/proxy-pools#sélection-des-upstreams-rotation-trust-score).
- **Fix : import manuel de proxies en erreur "entity too large"** — la limite JSON par défaut de NestJS (100 Ko) rejetait les grosses listes collées dans **Pool de proxies → Importer**. Relevée à 25 Mo.
- **Nouveau : Session statique** — `GET /me/proxies/:id/static-session` génère des identifiants **temporaires** (`host:port:user:pass`, sans champ "session" visible), chacun épinglé sur son propre upstream pour la durée du TTL. Nouveau préréglage dans **Mes Proxies → Générer**. Voir [Session statique](/guide/proxy-pools#session-statique-identifiants-temporaires).
- **Fix majeur : le checker marquait à tort des proxies HTTP fonctionnels comme morts** — le test de vivacité utilisait un `CONNECT` HTTPS pour tous les protocoles, mais beaucoup de proxies HTTP bas de gamme ne supportent que le relais `GET` et rejettent `CONNECT`. Les proxies HTTP sont désormais testés via un `GET` en forme absolue ; SOCKS4/5, non affectés, gardent la négociation SOCKS classique.
- **Nouveau : Settings → Tableau de bord** — taille de la base PostgreSQL sur disque + volumétrie des tables principales (`GET /monitoring/db-stats`).
- **Nouveau : proxies utilisés en direct** sur le Dashboard admin — liste en temps réel des `BackendProxy` actuellement en cours d'utilisation (connexions actives, comptes), rafraîchie toutes les 5s.
- **Mode compact étendu** — la densité "compact" ne resserrait que les tableaux ; elle s'applique désormais aussi aux marges de page et à l'espacement des cartes, sur toutes les pages du panel.
- **i18n** — ajout des traductions manquantes pour les actions d'audit `subuser.bulk.*` et `subuser.share-link.*` (FR/EN).

### v2.4.1
- **Fix majeur : la sauvegarde manuelle ne fonctionnait pas pour les bases volumineuses** (~200 Mo et plus) — le déclenchement bloquait la requête HTTP jusqu'à la fin complète (requête DB + sérialisation + upload S3/local), largement plus long que le timeout du reverse-proxy devant l'API en prod (Traefik/Coolify), qui coupait la connexion en route sans afficher ni succès ni erreur. Le déclenchement manuel est désormais **non-bloquant** : `POST /backup/run` répond immédiatement (~50ms, vérifié en conditions réelles) et le panel poll un nouvel endpoint `GET /backup/run-status` pour afficher le résultat réel une fois la sauvegarde terminée, quelle que soit sa durée.
- **Fix : faux "succès" affiché même en cas d'échec réel** — le backend renvoyait un HTTP 200/201 avec `{status:'error'}` dans le corps pour signaler un échec interne (ex. permissions S3 insuffisantes), mais le panel ne vérifiait jamais ce champ et affichait toujours le toast de succès. Corrigé sur les 4 actions concernées (sauvegarde manuelle, restauration, suppression, import de settings). Vérifié avec un vrai stockage S3 (Synology C2) : le toast affiche maintenant la vraie erreur AWS quand elle survient.
- **Timeout de la transaction de restauration** relevé de 30s à 5 minutes — insuffisant pour restaurer des centaines de milliers de lignes (`BackendProxy`/`ProxyUsage`).

### v2.4.0
- **Fix majeur : la sauvegarde automatique de la base ne prenait jamais effet** — `PUT /api/panel/settings` ne rappelait jamais `BackupService.reschedule()`, le cron restait figé sur l'état lu au démarrage du conteneur. Activer "Sauvegarde auto BDD" (ou changer le cron/stockage) depuis le panel n'avait donc **aucun effet** avant un redémarrage complet. La replanification est désormais instantanée dès l'enregistrement des paramètres — vérifié en conditions réelles.
- **Logs enrichis pour le diagnostic des sauvegardes** : planification du cron (avec la prochaine exécution), durée de chaque cycle, taille du payload avant écriture, cause précise en cas d'échec local/S3 — tout remonte désormais dans **Journaux**.
- **Bouton "Lancer une sauvegarde" : choix Local/S3 par exécution** — un sélecteur permet de forcer la destination de cette sauvegarde manuelle uniquement, sans toucher au réglage global utilisé par le cycle automatique.
- **Nouveau bouton "Tester la connexion" (config S3)** — vérifie que le bucket et les identifiants S3 sont valides (`ListObjectsV2` léger) sans lancer de sauvegarde.

## v2.3.x

### v2.3.0
- **Fix : `npm install` cassé dans `api/`** — `@nestjs/platform-ws` et `@nestjs/websockets` étaient épinglés en v11 alors que tout le reste du projet (`@nestjs/core`, `@nestjs/common`...) est en v10. Un `npm install` frais (sans le `--legacy-peer-deps` caché dans le Dockerfile) plantait en conflit de peer dependencies — exactement ce que demande le README pour le dev local. Réalignés sur v10, install propre confirmée.
- **Fix : reconnexion base de données** — dans `prisma.service.ts`, le flag interne `connected` ne repassait jamais à `false` après une coupure réelle (Postgres qui redémarre, réseau qui saute), seul l'arrêt propre de l'app le faisait. `ensureConnection()` (appelée à chaque cycle du checker et à chaque rafraîchissement du moteur proxy) croyait donc rester connectée indéfiniment et ne retentait jamais `$connect()` : après un simple pépin DB, tout restait cassé jusqu'à un redémarrage manuel du conteneur. Un middleware Prisma détecte désormais la perte de connexion partout où elle survient et déclenche une reconnexion automatique.
- **Nouveau : "Checker actif" par catégorie** — dans le dialogue de création/édition d'une catégorie (Pools), un toggle "Checker actif" (activé par défaut) s'ajoute à côté de "Toujours en ligne". Désactivé, le cycle automatique du checker ignore complètement les proxies de cette catégorie (aucun test, statut figé tel quel) — différent de "Toujours en ligne" qui force le statut à "en ligne" : ici c'est un vrai "hands off", sans mentir sur le statut. Le bouton "Tester" manuel continue de fonctionner dans tous les cas. Badge "Checker désactivé" affiché dans la liste des catégories.

## v2.2.x

### v2.2.0
- **Import de thèmes tweakcn.com** (URL libre + galerie de 12 presets), conversion oklch → HSL faite côté serveur.
- **Templates de sous-users** (profils réutilisables : threads/quota/pays/TTL) pour la création rapide.
- **Historique des changements de settings** : diff avant/après par clé, visible dans l'Audit.
- **Vue rapide (slide-over) sur les sous-users**, alternative légère au dialog plein écran.
- **Dashboard Analytics complet** : tendance pool, répartition pays/provider/protocole, distribution de latence, top proxies.
- **Comparaison période sur période** sur les rapports (deltas +/- %).
- **Heatmap calendrier** de l'activité quotidienne (12 derniers mois).
- **Export PDF** des rapports.
- **Animations UI** : transitions de page, effet press sur les boutons, hover sur les cards.

## v2.1.x

### v2.1.0
- **Thème custom du panel** (color pickers façon tweakcn.com), avec reset au thème par défaut.
- **Alerte seuil pool de proxies bas** (in-app + Discord/Slack/BloumeChat).
- **Import CSV en masse de sous-users.**
- **Vue "santé système"** (RAM/CPU/latence DB/threads) sur le dashboard.
- **Recherche globale** Cmd/Ctrl+K (navigation + sous-users + utilisateurs).
- **Mode compact** pour les tableaux (densité d'affichage).
- **Import/export de la configuration complète** (settings + sources scraper).
- **Rôle SUPPORT** (lecture seule : dashboard, pool, logs, rapports, audit).
- **Liens de partage temporaires** pour les comptes proxy (accès sans login, expiration configurable, révocable).

## v2.0.x

### v2.0.25
- **Notification à chaque déclenchement manuel du scraper** — `POST /api/panel/scraper-sources/run` créait un cycle de scraping sans qu'aucune notification (in-app / Discord / Slack / BloumeChat) ne soit émise. Le lancement manuel envoie désormais une notification `NotificationService.notifyScraperRun(...)`, avec l'email de l'admin qui a déclenché le cycle.
- **Icône et nom du panel personnalisables** : Settings > Général expose désormais un champ "Icône du panel" (`logoUrl`) à côté du nom du site (`siteName`), tous deux affichés dans l'en-tête du panel. Le **footer** ("UHQ Panel OS by Bloume.fr", crédit éditeur) reste volontairement figé et n'est plus affecté par ces réglages.

### v2.0.24
- **Perf : empreinte mémoire/CPU du checker et du scraper réduite** — sans changement de comportement (vérifié par revue adversariale multi-agents), aucune réécriture du cœur métier.
  - **Checker** — le cycle de vérification ne charge plus que les colonnes réellement lues (`id/url/ip/port/protocol`) au lieu de toutes les colonnes de `BackendProxy` pour le lot de ~150 000 candidats (~3× moins de RAM). L'authentification des upstreams est désormais résolue paresseusement par chaque worker, au lieu de ~150 000 `new URL()` synchrones exécutés en amont qui gelaient brièvement l'event loop — partagé avec le serveur proxy live (`:990`).
  - **Scraper** — déduplication **incrémentale** au fil des sources (Map partagée) au lieu d'accumuler des millions d'entrées dans un seul tableau avant de dédupliquer : le pic mémoire retombe à « une source en vol + la Map d'uniques » au lieu de la somme de toutes les sources. Parsing accéléré : le nettoyage HTML est court-circuité sur les listes `ip:port` pures (aucune balise) et l'extraction de candidats évite une passe regex sur chaque ligne dépourvue de schéma `://`.

### v2.0.23
- **Fix : port dédié par catégorie (pool)** — un compte assigné à une pool ayant son propre domaine/port était accessible via n'importe quel autre port (port par défaut, ou port d'une autre pool) ; seule l'exclusivité de port *par compte* était vérifiée. Le compte est désormais rejeté (407) si la connexion n'arrive pas sur le port dédié de sa pool.
- **Fix : pools "Toujours en ligne" jamais KO** — un échec de connexion réel (rare, souvent transitoire) marquait quand même le proxy `isWorking=false` en base pour les pools `alwaysOnline`, cassant la promesse "jamais KO" et rétrécissant la pool jusqu'au prochain cycle du checker au lieu de basculer proprement sur le fallback résidentiel pour la requête en cours.
- **Fix : import de proxies plus tolérant** — réimporter un proxy déjà archivé/mort, ou déjà assigné à une autre catégorie, renvoyait silencieusement "0 proxy importé" et le rendait invisible dans la catégorie visée (`POST /monitoring/proxies/import` utilisait `createMany`+`skipDuplicates`, qui ignore toute ligne dont l'URL existe déjà). Remplacé par un upsert par ligne qui réactive le proxy existant (`isWorking`/`archived`/`failCount` remis à zéro) et le réassigne à la catégorie demandée.
- **`GET /api/v1/sub-user/usage-stat/get`** renvoie désormais `host`/`port` dans la réponse, résolus selon le domaine/port propre du compte, sinon ceux de sa catégorie, sinon les valeurs globales (Settings > Proxy public) — même logique que `get-sticky-proxies`.

### v2.0.22
- **Pays prioritaires pour les IP simulées** : `ProxyPool.fakePriorityCountries`, un sous-ensemble de `fakeCountries` qui tire **toujours** un nombre d'IP plus élevé que les pays non listés — la plage configurée est découpée en deux moitiés disjointes (prioritaire = moitié haute), garanti quel que soit le tirage, en mode stable comme en mode rotatif. Sans effet en valeur fixe.
- **Interne** : logique de tirage/hash des IP simulées consolidée dans `common/utils/fake-stats.ts` au lieu d'être dupliquée entre le module Proxy Pools et l'API legacy.

### v2.0.21
- **Pays simulés sans limite** : le champ `fakeCountries` n'est plus borné à 255 caractères — listez autant de pays que vous voulez.
- **Mode rotatif pour les IP simulées** : intervalle en secondes optionnel (`ProxyPool.fakeIpRotateSeconds`) — l'IP simulée de chaque pays change alors automatiquement à chaque fenêtre de temps écoulée, calculée à la volée par `category-stats` (hash déterministe, aucune tâche planifiée ni écriture en base). Toggle dans le dialogue de modification d'un pool ; le bouton "Régénérer" se masque automatiquement quand le mode rotatif est actif.

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
