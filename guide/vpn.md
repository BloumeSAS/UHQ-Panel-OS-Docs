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
