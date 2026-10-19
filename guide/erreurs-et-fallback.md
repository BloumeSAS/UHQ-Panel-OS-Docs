# Erreurs renvoyées aux clients & fallback par catégorie

## Les erreurs sont toujours les vôtres

Le client ne voit **jamais** l'erreur réelle d'un proxy amont (fournisseur, proxy gratuit, fallback). Quand quelque chose échoue, le moteur répond par une erreur **JSON** du panel, avec l'en-tête `X-UHQ-Error` :

```http
HTTP/1.1 502 Bad Gateway
X-UHQ-Error: UHQ_NO_UPSTREAM
Content-Type: application/json

{"error":{"code":"UHQ_NO_UPSTREAM","status":502,"message":"No proxy available to handle the request. Please retry shortly."}}
```

Le détail réel (ex. « le fournisseur a répondu 407 ») n'apparaît que dans les **logs du panel** (« Erreur amont ») et dans le journal « Pourquoi ça ne marche pas ? ».

| Code | HTTP | Signification |
| --- | --- | --- |
| `UHQ_AUTH_FAILED` | 407 | Identifiants refusés : absents, faux, compte bloqué/expiré, quota atteint, IP non autorisée (volontairement indistinguables). |
| `UHQ_WRONG_PORT` | 407 | Le compte ou sa catégorie a un port dédié ; le bon port est indiqué (`detail.expected_port`). |
| `UHQ_IP_BANNED` | 403 | IP bannie (échecs d'authentification répétés ou VPN). |
| `UHQ_DOMAIN_BLOCKED` | 403 | Domaine bloqué pour ce compte. |
| `UHQ_VPN_BLOCKED` | 403 | VPN/hébergeur refusé (catégorie Anti-VPN). |
| `UHQ_THREAD_LIMIT` | 429 | Trop de connexions simultanées. |
| `UHQ_NO_UPSTREAM` | 502 | Aucun proxy disponible (pool vide/en panne, fallback absent, désactivé ou en échec). |
| `UHQ_UPSTREAM_FAILED` | 502 | Le proxy amont a répondu par une erreur : masquée au client. |
| `UHQ_GATEWAY_ERROR` | 504 | Erreur interne ou délai dépassé. |

::: tip Fiche dans le panel
Menu **Codes d'erreur** (admin et support) : pour chaque code, ce qu'il veut dire, quoi vérifier, et une **réponse prête à copier** pour le client.
:::

::: warning Requêtes avec corps
L'erreur du proxy amont est masquée pour les requêtes HTTP sans corps (GET, HEAD…) et pour tout le HTTPS (CONNECT). Pour une requête HTTP en clair avec corps (POST/PUT), la réponse est relayée telle quelle.
:::

## Fallback par catégorie

Il n'y a **plus de fallback global**. Le proxy de secours se règle **par catégorie**, dans **Paramètres → Scraper → Fallback par catégorie** (une ligne par catégorie : URL + interrupteur).

- **URL** : `http://user:pass@hôte:port` ou `socks5://…`. Vide = aucune solution de secours pour cette catégorie : quand aucun proxy ne répond, le client reçoit `UHQ_NO_UPSTREAM`.
- **Interrupteur « Activé »** : désactivé = la catégorie n'utilise pas son fallback (l'URL est conservée).
- Le gabarit de pays (`{user}__country__{country}`) reste réglable dans la catégorie.
- L'URL contient des identifiants : elle est **masquée** (••••••••) ; laisser le masque inchangé conserve la valeur.

::: warning Mise à jour depuis une version précédente
L'ancien réglage « Proxy de secours (fallback) » n'est plus utilisé comme fallback. Il devient **« Proxy sortant du scraper »** (utilisé seulement pour récupérer les listes de sources). Pour garder un fallback, saisissez son URL dans chaque catégorie concernée.
:::

## Codes HTTP des sites visités (303, 403, 429…)

La page **Codes d'erreur** du panel a un second onglet, **Codes HTTP des sites** : tous les codes courants (2xx à 5xx, y compris Cloudflare 520/522/524/525) avec, pour chacun, ce qu'il veut dire, **pourquoi le client le voit et pas vous**, quoi faire et une **réponse prête à envoyer**.

Ces codes ne viennent **pas** du panel : ils sont renvoyés par le site visité (ou son CDN) et le proxy les transmet tels quels. **Règle simple : si l'en-tête `X-UHQ-Error` est présent, l'erreur vient du panel ; s'il est absent, elle vient du site.**

Exemple — **303 See Other** : le site demande de récupérer la suite avec un GET à l'adresse `Location` (typique après un POST de connexion ou de formulaire). Un navigateur enchaîne tout seul ; un script qui ne suit pas les redirections reste sur le 303. L'IP ou le pays de sortie peuvent aussi changer la destination (page de vérification, page pays).
