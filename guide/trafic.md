# Trafic, quotas et multiplicateur

## Ce qui est compté
Le trafic d'un compte est mesuré **côté fournisseur amont** : c'est exactement ce que votre revendeur de proxies vous facture, octet pour octet, négociation de connexion (CONNECT / SOCKS) incluse. Chaque connexion amont tentée est comptée à sa fermeture, y compris les essais qui n'ont pas abouti.

- **Unité : le Go décimal** (1 Go = 1 000 000 000 octets), comme chez les revendeurs. Le panel, les quotas et les graphiques utilisent la même unité.
- Le trafic du compte additionne **envoyé + reçu**.
- Le graphique global du tableau de bord est basé sur un compteur qui ne régresse jamais.

## Quotas
Un compte peut avoir une **limite de trafic** (0 = illimité). Elle est vérifiée :
- à l'**authentification** (un compte épuisé est refusé) ;
- **en continu** pendant la connexion : dès que le quota est atteint, les tunnels du compte sont **coupés immédiatement**.

D'autres limites existent par compte : nombre de **threads**, **bande passante maximale** (ko/s, partagée entre toutes les connexions du compte), **date d'expiration**, IP autorisées, domaines bloqués.

## Multiplicateur de consommation (par catégorie)
Dans **Catégories proxies**, chaque catégorie a un **multiplicateur de consommation** (par défaut ×1). Tout ce que consomment les comptes de cette catégorie est multiplié par ce nombre avant d'être imputé :

| Multiplicateur | Effet |
|---|---|
| ×1 | 500 Mo consommés = 500 Mo comptés |
| ×2 | 500 Mo consommés = **1 Go** compté — le quota se vide deux fois plus vite |
| ×4 | 500 Mo consommés = 2 Go comptés |

Le multiplicateur s'applique au total du compte, à son quota et à son historique. Le **débit en direct** et le **compteur global** montrent toujours les octets **réels**.

C'est le moyen de vendre une catégorie « premium » (résidentiel, mobile) plus cher sans changer les quotas affichés à vos clients.

## Réinitialiser le trafic
Le bouton **Réinitialiser le trafic** d'un compte remet son compteur à zéro (confirmation demandée). Les compteurs en cours d'écriture sont d'abord enregistrés pour ne rien perdre.
