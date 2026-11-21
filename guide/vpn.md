# VPN dans les catégories de proxies

Depuis la **v2.9.0**, un **VPN** peut être ajouté à une catégorie (pool) **comme n'importe quel proxy** : il apparaît dans la liste du Pool, participe à la rotation, obéit aux comptes, quotas et filtres pays. Chaque VPN a **une IP de sortie fixe** ; la rotation se fait **entre les VPN de la catégorie** (une IP différente d'un VPN à l'autre, à chaque connexion).

## Protocoles pris en charge

| Protocole | Moteur | Privilèges |
|---|---|---|
| **OpenVPN** (`.ovpn`) | tunnel noyau, un par VPN | `NET_ADMIN` + `/dev/net/tun` |
| **WireGuard** (`.conf`) | sing-box (espace utilisateur) | aucun |
| **V2Ray** : `vless://` (Reality, WS, gRPC…), `vmess://`, `trojan://`, `ss://`, `hy2://` | sing-box | aucun |

Le `docker-compose.yml` du dépôt ajoute déjà `cap_add: NET_ADMIN` et `devices: /dev/net/tun`. Sur un hôte sans `/dev/net/tun` (rare : OpenVZ/LXC), retirez ces deux blocs : seul OpenVPN sera indisponible (le dialogue l'indique).

## Ajouter des VPN

**Pool de proxies → Ajouter des VPN** :

- **VPNGate (automatique)** : choisissez le **ou les pays** (liste en direct avec le nombre de serveurs), le nombre de serveurs par pays (les meilleurs par score), la catégorie. Cochez **« Garder à jour automatiquement »** pour que le panel remplace les serveurs morts (resynchronisation toutes les 30 minutes).
- **Import manuel** : collez un `.ovpn`, un `.conf` WireGuard ou une liste de liens (un par ligne), avec la catégorie et, facultativement, le pays (sinon détecté à partir de l'IP de sortie).
- **Sources & état** : sources automatiques (activer/supprimer, synchroniser maintenant) et état des tunnels (actif, IP de sortie, latence, erreur).

## Fonctionnement

1. Chaque VPN est démarré en tâche de fond (jusqu'à **15 tunnels** simultanés — réglage `VPN_MAX_TUNNELS`).
2. Un test réel mesure l'IP de sortie et la latence ; le VPN est marqué **actif** ou **hors ligne** (le checker classique ne les teste pas).
3. Le moteur envoie les connexions des clients dans le tunnel du VPN choisi. Un VPN en échec est relancé avec un délai croissant.

## Limites à connaître

- **Pas de rotation d'IP sur un même VPN** : une IP fixe par VPN. Pour plus de rotation, ajoutez plus de VPN.
- **VPN gratuits** (VPNGate…) : publics, instables, souvent bloqués par les sites, débit variable. Idéal pour tester ; pour des clients payants, préférez des VPN/proxies de fournisseurs.
- Les pages d'annonces de configurations protégées par un contrôle anti-robot (ex. ipspeed.info, VPNBook) ne peuvent pas être récupérées automatiquement : copiez-collez les configurations dans l'**import manuel**.
- Mémoire : environ 10 à 30 Mo par tunnel.

## Sécurité

Les configurations OpenVPN sont **nettoyées** (aucune directive qui exécuterait une commande) ; le conteneur reste en utilisateur non-root et n'appelle qu'une aide dédiée (`sudo`, sous-commandes et arguments validés) pour OpenVPN et le routage.
