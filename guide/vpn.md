# VPN dans les catégories de proxies

Depuis la **v2.9.0**, un **VPN** peut être ajouté à une catégorie (pool) **comme n'importe quel proxy** : il apparaît dans la liste du Pool, participe à la rotation, obéit aux comptes, quotas et filtres pays. Chaque VPN a **une IP de sortie fixe** ; la rotation se fait **entre les VPN de la catégorie** (une IP différente d'un VPN à l'autre, à chaque connexion).

## Protocoles pris en charge

| Protocole | Moteur | Privilèges |
|---|---|---|
| **OpenVPN** (`.ovpn`) | tunnel noyau, un par VPN | `NET_ADMIN` + `/dev/net/tun` |
| **WireGuard** (`.conf`) | sing-box (espace utilisateur) | aucun |
| **V2Ray** : `vless://` (Reality, WS, gRPC…), `vmess://`, `trojan://`, `ss://`, `hy2://`, `tuic://` | sing-box | aucun |
| **Tunnel SSH** : `ssh://utilisateur:mot_de_passe@hôte:port` | sing-box | aucun |

Le `docker-compose.yml` du dépôt ajoute déjà `cap_add: NET_ADMIN` et `devices: /dev/net/tun`. Sur un hôte sans `/dev/net/tun` (rare : OpenVZ/LXC), retirez ces deux blocs : seul OpenVPN sera indisponible (le dialogue l'indique).

## Ajouter des VPN

**Pool de proxies → Ajouter des VPN** :

- **VPNGate (automatique)** : choisissez le **ou les pays** (liste en direct avec le nombre de serveurs), le nombre de serveurs par pays (les meilleurs par score ; `0` = **tous** les serveurs du pays), la catégorie. Cochez **« Garder à jour automatiquement »** pour que le panel remplace les serveurs morts (resynchronisation toutes les 30 minutes).
- **URL / abonnement** (v2.10.0) : adresse https d'une page, d'un fichier texte ou d'un **abonnement** (liste de liens `vless://` `vmess://` `trojan://` `ss://` `hy2://`, liste encodée en base64, configuration WireGuard / OpenVPN). Aperçu (nombre de configurations par protocole), nombre maximum de VPN (`0` = tous), **mise à jour automatique** (les VPN morts de la source sont remplacés). Seules les adresses publiques en https sont lues (réseau interne et redirections vers lui refusés). Testé sur une liste publique de 9 003 liens : VLESS, VMess et Shadowsocks établis avec de vraies IP de sortie.
  **Sources suggérées** (un clic dans l'onglet) : listes publiques GitHub mises à jour automatiquement — Alirewa (top 100 TLS/Reality, pool complet), 0xRadikal (vérifiés, VLESS, Trojan), Morpheusadam (VLESS Reality, Trojan, VMess — plusieurs milliers chacun), Au1rxx (liste globale), barry-far. Une source URL **tire au hasard** dans la liste (jamais toujours les mêmes premiers serveurs, souvent morts), **retire** ses VPN essayés et morts puis **comble** jusqu'au « nombre maximum de VPN » avec de nouveaux tirages à chaque synchronisation (toutes les 30 minutes).
- **Import manuel** : collez un `.ovpn`, un `.conf` WireGuard ou une liste de liens (un par ligne), avec la catégorie et, facultativement, le pays (sinon détecté à partir de l'IP de sortie).
- **Sources & état** : sources automatiques (activer/supprimer, synchroniser maintenant) et état des tunnels (actif, IP de sortie, latence, erreur).

## Fonctionnement

1. Chaque VPN est démarré en tâche de fond (jusqu'au **nombre maximum de tunnels**, voir plus bas).
2. Un test réel mesure l'IP de sortie et la latence ; le VPN est marqué **actif** ou **hors ligne** (le checker classique ne les teste pas).
3. Le moteur envoie les connexions des clients dans le tunnel du VPN choisi. Un VPN en échec est relancé avec un délai croissant.

### Vérification automatique : tous les VPN, pas seulement ceux d'une source

**Tous** les VPN du pool sont supervisés de la même façon — importés à la main, par URL ou par VPNGate : démarrage, test réel de l'IP de sortie et de la latence **toutes les minutes**, passage en « hors ligne » après 3 échecs, relance avec délai croissant. La différence avec une **source automatique** est seulement le **remplacement** : une source ajoute les nouveaux serveurs et retire ses VPN morts ; un VPN importé à la main reste jusqu'à ce que vous le supprimiez (ou qu'il expire).

### Tunnels actifs et rotation : utiliser TOUS les VPN du pool

Un VPN actif est un **processus qui tourne en permanence** (10 à 30 Mo de mémoire, un peu de CPU) : on ne peut donc pas en faire tourner des milliers en même temps. Le panel fait **tourner** un nombre limité de tunnels et les **remplace régulièrement**, de sorte que **tous les VPN vivants du pool servent à tour de rôle**, même s'il y en a 5 000 :

- **Tunnels simultanés maximum** (défaut **15**, maximum **100**, limite des tables de routage) ;
- **Rotation toutes les N minutes** (défaut **10**, `0` = pas de rotation) : une partie des tunnels actifs (**34 %** par défaut) est remplacée par ceux qui n'ont pas servi depuis le plus longtemps — les derniers connus vivants d'abord, puis ceux jamais essayés ;
- **Découverte** : en plus des tunnels actifs, quelques démarrages sont tentés en parallèle pour trouver les VPN vivants parmi les milliers importés (un essai réussi au-delà du plafond est marqué « vivant » puis arrêté, il servira à son tour par la rotation) ; les morts sont retentés avec un délai croissant et en dernier ;
- **Un client** voit ses connexions réparties sur les tunnels actifs à l'instant T ; dans le temps, il est servi par **tous** les VPN vivants. Les connexions en cours dans un tunnel remplacé sont coupées : évitez un pourcentage très élevé avec une rotation courte.

Ces trois réglages sont dans **Paramètres → Scraper → VPN**. Le « nombre maximum de VPN » d'une source (jusqu'à 200) est un autre réglage : il limite ce que la source ajoute au pool. Comptez environ 1 Go de mémoire pour 40 tunnels simultanés.

*Exemple mesuré* : 40 serveurs VPNGate (Japon, Corée), 5 tunnels simultanés, rotation à la minute : 18 serveurs vivants trouvés en 2 minutes et **7 IP de sortie différentes** vues par un client en 5 minutes (plus que les 5 tunnels).

### Expiration des VPN (abonnements, listes gratuites)

Beaucoup de configurations gratuites expirent après quelques jours. Chaque import (VPNGate, URL / abonnement, import manuel) a un champ **« Expire après (jours) »** (0 = jamais) :

- **import manuel / unique** : le VPN est **retiré automatiquement du pool** N jours après l'import ;
- **source mise à jour automatiquement** : le compteur **repart de zéro à chaque fois que la source publie encore le VPN** ; il expire donc N jours après la dernière publication (un VPN que la source ne liste plus disparaît au bout de N jours, ou plus tôt s'il est hors ligne).

L'expiration retire la ligne du pool et arrête le tunnel (vérification toutes les 15 secondes).

## Limites à connaître

- **IKEv2, L2TP/IPsec, PPTP** : non pris en charge. Ils exigent une pile IPsec / GRE au niveau du noyau (impossible de faire tourner plusieurs tunnels indépendants dans un conteneur de façon fiable), PPTP est de plus obsolète et non sécurisé, et les sites qui les distribuent créent un compte par visiteur. Préférez OpenVPN, WireGuard ou V2Ray ; un **tunnel SSH** (`ssh://…`) est pris en charge.
- **Pas de rotation d'IP sur un même VPN** : une IP fixe par VPN. Pour plus de rotation, ajoutez plus de VPN.
- **VPN gratuits** (VPNGate…) : publics, instables, souvent bloqués par les sites, débit variable. Idéal pour tester ; pour des clients payants, préférez des VPN/proxies de fournisseurs.
- **Sites « générateurs de comptes »** (sshocean, jagovpn, sshmax, greenssh, vpnhack, cybertunnel, fastssh, opentunnel, howdy.id, akunssh, vpnjantit…) : ils créent un compte de 7 à 60 jours **par visiteur**, derrière un formulaire (souvent un captcha). Le panel ne crée pas de comptes en masse sur un service tiers et ne contourne pas les contrôles anti-robot : créez un compte vous-même sur le site, puis collez la configuration (lien V2Ray, `.conf` WireGuard, `ssh://…`) dans l'**import manuel** avec une **durée de vie** égale à celle du compte. Les listes publiques GitHub ci-dessus sont, elles, entièrement automatiques.
- **Sites qui ne se lisent pas automatiquement** : ipspeed.info (contrôle anti-robot), VPNBook (fichiers servis par JavaScript avec identifiants partagés) et VPNJantit (un compte est créé par visiteur sur chaque serveur). Le panel ne contourne pas les contrôles anti-robot et ne crée pas de comptes en masse sur un service tiers : copiez-collez leurs configurations dans l'**import manuel**.
- Le protocole affiché dans le Pool est celui du VPN (`openvpn`, `wireguard`, `vless`, `vmess`, `trojan`, `ss`, `hy2`) ; en interne chaque tunnel est servi comme un proxy local.
- Mémoire : environ 10 à 30 Mo par tunnel.

## Sécurité

Les configurations viennent de listes publiques **non fiables** et OpenVPN est lancé avec des privilèges élevés. Depuis la **v2.9.1**, elles sont filtrées par **liste blanche** :

- seules les directives OpenVPN connues et inoffensives sont conservées (`client`, `remote`, `proto`, `cipher`, `auth`…) ; tout le reste est supprimé : scripts (`up`, `down`, `script-security`…), `plugin`, `config`, `management`, lecture de fichiers locaux (`ca /chemin`, `tmp-dir`…), options avec guillemets ou caractères spéciaux ;
- seuls les blocs en ligne `<ca>`, `<cert>`, `<key>`, `<tls-auth>`, `<tls-crypt>` et `<tls-crypt-v2>` sont acceptés ; un bloc inconnu (`<connection>`…) ou non fermé fait **refuser tout le fichier** ;
- le conteneur reste en **utilisateur non-root** : OpenVPN et le routage ne passent que par une aide dédiée (`sudo`, sous-commandes et arguments validés) qui **refait la même vérification** puis impose `--script-security 1` et `--route-nopull` ;
- les clés WireGuard et les identifiants des liens sont stockés avec la ligne du proxy (jamais affichés dans le panel) et inclus dans les sauvegardes de la base.

::: warning Mise à jour
La **v2.9.0** utilisait une liste noire contournable : passez en **v2.9.1 ou plus**.
:::

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « OpenVPN indisponible dans ce conteneur » | `NET_ADMIN` ou `/dev/net/tun` absent : utilisez le `docker-compose.yml` du dépôt (déjà inclus) ou ajoutez-les dans Coolify |
| Tunnel en « erreur » | serveur VPN gratuit hors ligne : il est relancé avec un délai croissant ; avec « garder à jour », il est remplacé |
| « configuration refusée » | le fichier contient une directive ou un bloc non autorisé (voir Sécurité) |
| Volume de données illisible après mise à jour | l'utilisateur du conteneur doit rester `100:101` (c'est le cas depuis la v2.9.0) |
